import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../interceptor/api";
import { gameService } from "../service/gameService";
import type {
  LobbyListResponseDto,
  LobbyCreationRequestDto,
  LobbyCreationResponseDto,
  Player,
  GameLobbyDetailsDto,
  GameState,
} from "../types/lobby";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useLobbyStore } from "../store/lobbyStore";

interface UseLobbyWebSocketReturn {
  lobbies: LobbyListResponseDto[];
  currentLobbyId: number | null;
  currentLobbyPlayers: Player[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  createLobby: (lobbyName: string) => Promise<void>;
  joinLobby: (lobbyId: number) => Promise<void>;
  leaveLobby: () => Promise<void>;
  refreshLobbies: () => Promise<void>;
  startGame: (lobbyId: number) => Promise<void>;
}

export const useLobbyWebSocket = (): UseLobbyWebSocketReturn => {
  const [lobbies, setLobbies] = useState<LobbyListResponseDto[]>([]);
  const [currentLobbyId, setCurrentLobbyId] = useState<number | null>(null);
  const [currentLobbyPlayers, setCurrentLobbyPlayers] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const stompClientRef = useRef<Client | null>(null);
  const lobbySubscriptionRef = useRef<any>(null);
  const globalLobbiesSubscriptionRef = useRef<any>(null);
  const gameStateSubscriptionRef = useRef<any>(null); // 🆕 Para game state

  // Get token from the store
  const token = useAuthStore((state) => state.token);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // 🔥 NOVO: Sincroniza estado local com o store persistido ao inicializar
  useEffect(() => {
    const storedLobbyId = useLobbyStore.getState().currentLobbyId;
    const storedPlayers = useLobbyStore.getState().currentLobbyPlayers;
    
    if (storedLobbyId && storedPlayers && storedPlayers.length > 0) {
      console.log("🔄 Synchronizing hook state with persisted store...");
      console.log("📍 Stored Lobby ID:", storedLobbyId);
      console.log("👥 Stored Players:", storedPlayers);
      
      setCurrentLobbyId(storedLobbyId);
      setCurrentLobbyPlayers(storedPlayers);
      
      console.log("✅ Hook state synchronized with store");
    }
  }, []); // Executa apenas uma vez ao montar

  // Fetch lobbies from server
  const refreshLobbies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get fresh token from store
      const currentToken = useAuthStore.getState().token;

      if (!currentToken) {
        setError("Não autorizado. Faça login novamente.");
        return;
      }

      console.log("Fetching lobbies with token");

      const response = await api.get<LobbyListResponseDto[]>(
        "/api/games/lobbies"
      );
      // Note: We don't need to manually set the header here since the api interceptor does it

      console.log("Lobbies fetched:", response.data);
      setLobbies(response.data);
    } catch (err: any) {
      console.error("Error fetching lobbies:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else {
        setError("Falha ao carregar lobbies. Verifique sua conexão.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to a specific lobby
  const subscribeToLobby = useCallback(
    (lobbyId: number) => {
      if (!stompClientRef.current || !stompClientRef.current.connected) {
        console.warn(
          "Attempted to subscribe without active WebSocket connection"
        );
        return;
      }

      // Clear previous subscription if exists
      if (lobbySubscriptionRef.current) {
        lobbySubscriptionRef.current.unsubscribe();
        lobbySubscriptionRef.current = null;
      }

      console.log(`Subscribing to lobby ${lobbyId}`);
      console.log(`📡 Topic: /topic/lobby/${lobbyId}/state`);

      // Subscribe to the lobby topic using backend format
      lobbySubscriptionRef.current = stompClientRef.current.subscribe(
        `/topic/lobby/${lobbyId}/state`,
        (message) => {
          try {
            console.log("📨 RAW WebSocket message received:", message);
            console.log("📨 Message body:", message.body);
            
            // ⚠️ IMPORTANTE: O WebSocket envia diretamente o Array de players
            // Não há objeto aninhado aqui - já é Player[] puro
            const players: Player[] = JSON.parse(message.body);
            console.log(`🔄 Received lobby update for ${lobbyId} via WebSocket`);
            console.log("👥 Players from WebSocket:", players);
            console.log("📊 Number of players:", players.length);

            // update local state
            console.log("🔄 Updating local state...");
            setCurrentLobbyPlayers(players);
            setCurrentLobbyId(lobbyId);

            // persist to shared store so other pages see the update
            console.log("🔄 Updating store...");
            useLobbyStore.getState().setCurrentLobbyPlayers(players);
            useLobbyStore.getState().setCurrentLobbyId(lobbyId);

            console.log("✅ Lobby state updated successfully");

            // Não é mais necessário chamar refreshLobbies() aqui
            // A lista global de lobbies é atualizada automaticamente via /topic/lobbies/list
          } catch (err) {
            console.error("❌ Error processing lobby message:", err);
            console.error("❌ Error details:", err);
          }
        }
      );
      
      console.log(`✅ Successfully subscribed to lobby ${lobbyId}`);
      console.log("✅ Subscription object:", lobbySubscriptionRef.current);

      // 🆕 Subscrição ao Game State para detectar início da partida
      console.log(`📡 Subscribing to game state: /topic/game/${lobbyId}/state`);
      gameStateSubscriptionRef.current = stompClientRef.current.subscribe(
        `/topic/game/${lobbyId}/state`,
        (message) => {
          try {
            console.log("🎮 RAW Game State message received:", message);
            console.log("🎮 Message body:", message.body);
            
            const gameState: GameState = JSON.parse(message.body);
            console.log("🎮 Game State received:", gameState);
            console.log("🎮 Game Status:", gameState.status);

            // Quando o jogo inicia (qualquer status diferente de LOBBY)
            if (gameState.status && gameState.status !== "LOBBY") {
              console.log("🚀 Game started! Status:", gameState.status);
              console.log("🚀 Game ID:", gameState.id);
              console.log("🚀 Players in game:", gameState.playerGames?.length || gameState.players?.length);
              console.log("🚀 Redirecting to /game...");
              
              // Redireciona todos os jogadores para o mapa
              navigate("/game");
            } else {
              console.log("⏸️ Still in lobby, waiting for game to start...");
            }
          } catch (err) {
            console.error("❌ Error processing game state message:", err);
            console.error("❌ Error details:", err);
          }
        }
      );
      
      console.log(`✅ Successfully subscribed to game state for lobby ${lobbyId}`);
    },
    [navigate] // Adicionado navigate
  );

  // Initialize WebSocket with JWT
  useEffect(() => {
    if (!token) {
      console.warn("Attempted to connect WebSocket without token");
      return;
    }

    console.log("Initializing WebSocket connection");

    // Cleanup previous connection
    if (stompClientRef.current) {
      if (stompClientRef.current.connected) {
        stompClientRef.current.deactivate();
      }
      stompClientRef.current = null;
    }

    // Create a new SockJS instance pointing to backend's /ws endpoint
    const socket = new SockJS(`${backendUrl}/ws`);

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        // Important: Format must be "Bearer <token>" to match backend expectation
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("STOMP: " + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("WebSocket connected successfully");
      setIsConnected(true);
      setError(null);

      // 1. Subscrição ao Tópico Global de Lobbies (atualização em tempo real)
      console.log("Subscribing to global lobbies topic: /topic/lobbies/list");
      globalLobbiesSubscriptionRef.current = client.subscribe('/topic/lobbies/list', (message) => {
        try {
          const updatedLobbies: LobbyListResponseDto[] = JSON.parse(message.body);
          console.log("🔄 Received global lobby list update via WebSocket:", updatedLobbies);
          setLobbies(updatedLobbies); // Atualiza o estado da lista de lobbies em tempo real
        } catch (err) {
          console.error("Error processing global lobby list message:", err);
        }
      });

      // Refresh lobby list upon connection (garantir carregamento inicial)
      refreshLobbies();

      // 🔥 IMPORTANTE: Resubscribe se já estava em um lobby
      // Verifica tanto o estado local quanto o store persistido
      const lobbyToSubscribe = currentLobbyId || useLobbyStore.getState().currentLobbyId;
      
      if (lobbyToSubscribe) {
        console.log("🔄 Reconnecting to lobby:", lobbyToSubscribe);
        subscribeToLobby(lobbyToSubscribe);
      } else {
        console.log("ℹ️ No active lobby to resubscribe");
      }
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      setError(`Connection error: ${frame.headers.message}`);
      setIsConnected(false);
    };

    client.onWebSocketClose = (event) => {
      console.log("WebSocket connection closed", event);
      setIsConnected(false);

      if (event && event.code === 1006) {
        setError("Conexão perdida. Verifique sua internet.");
      }
    };

    client.onWebSocketError = (event) => {
      console.error("WebSocket error:", event);
      setError("Erro na conexão com o servidor de chat.");
    };

    // Activate the client
    client.activate();
    stompClientRef.current = client;

    // Cleanup function
    return () => {
      console.log("Cleaning up WebSocket connection");
      if (globalLobbiesSubscriptionRef.current) {
        globalLobbiesSubscriptionRef.current.unsubscribe();
        globalLobbiesSubscriptionRef.current = null;
      }
      if (lobbySubscriptionRef.current) {
        lobbySubscriptionRef.current.unsubscribe();
        lobbySubscriptionRef.current = null;
      }
      if (gameStateSubscriptionRef.current) {
        gameStateSubscriptionRef.current.unsubscribe();
        gameStateSubscriptionRef.current = null;
      }
      if (client.connected) {
        client.deactivate();
      }
    };
  }, [token, backendUrl, currentLobbyId, subscribeToLobby, refreshLobbies]);

  // Create a new lobby
  const createLobby = async (lobbyName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const request: LobbyCreationRequestDto = { lobbyName };
      const response = await api.post<LobbyCreationResponseDto>(
        "/api/games/create-lobby",
        request
      );

      // use uma variável local para o id — não dependa do estado imediatamente
      const lobbyId = Number(response.data.gameId);
      console.log("✅ Lobby created:", response.data, "resolved lobbyId:", lobbyId);

      // Após criar, fazer join para obter os dados completos do lobby (incluindo o jogador)
      const lobbyDetailsResponse = await api.post<GameLobbyDetailsDto>(
        `/api/games/join/${lobbyId}`,
        {}
      );

      console.log("✅ Joined created lobby:", lobbyDetailsResponse.data);
      console.log("Players in created lobby:", lobbyDetailsResponse.data.players);

      const playersList = lobbyDetailsResponse.data.players;

      setCurrentLobbyId(lobbyId);
      setCurrentLobbyPlayers(playersList);

      // Sincroniza store
      useLobbyStore.getState().setCurrentLobbyId(lobbyId);
      useLobbyStore.getState().setCurrentLobbyPlayers(playersList);

      // usar lobbyId local para ações imediatas
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("🔌 Subscribing to lobby after creation:", lobbyId);
        subscribeToLobby(lobbyId);
      } else {
        console.warn("⚠️ WebSocket not connected, cannot subscribe to lobby");
      }

      // Não é mais necessário chamar refreshLobbies() aqui
      // O backend enviará a atualização via WebSocket no tópico /topic/lobbies/list
      
      navigate("/jogadores"); // redireciona imediatamente
    } catch (err: any) {
      console.error("Error creating lobby:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else {
        setError("Falha ao criar lobby. Tente novamente.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Join a lobby
  const joinLobby = async (lobbyId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        setError("Não autorizado. Faça login novamente.");
        throw new Error("Token not found");
      }

      console.log(`🎮 Attempting to join lobby ${lobbyId}...`);

      // Use the REST API to join a lobby - retorna GameLobbyDetailsDto
      const response = await api.post<GameLobbyDetailsDto>(
        `/api/games/join/${lobbyId}`,
        {}
      );

      console.log(`✅ Successfully joined lobby ${lobbyId}:`, response.data);
      console.log("👥 Players from HTTP response:", response.data.players);

      // ⚠️ IMPORTANTE: A resposta HTTP retorna um objeto aninhado
      // Precisamos acessar response.data.players, não response.data diretamente
      const playersList = response.data.players;

      setCurrentLobbyId(lobbyId);
      setCurrentLobbyPlayers(playersList);

      // sincroniza store
      useLobbyStore.getState().setCurrentLobbyId(lobbyId);
      useLobbyStore.getState().setCurrentLobbyPlayers(playersList);

      // Subscribe to the joined lobby
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("🔌 Subscribing to lobby after joining:", lobbyId);
        subscribeToLobby(lobbyId);
      } else {
        console.warn("⚠️ WebSocket not connected, cannot subscribe to lobby");
      }

      navigate("/jogadores");
    } catch (err: any) {
      console.error("❌ Error joining lobby:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else {
        setError("Falha ao entrar no lobby. Tente novamente.");
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Leave a lobby
  const leaveLobby = async () => {
    const lobbyIdStore = useLobbyStore.getState().currentLobbyId;
    if (!lobbyIdStore) {
      console.warn("⚠️ Attempted to leave lobby but not in any lobby");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        setError("Não autorizado. Faça login novamente.");
        throw new Error("Token not found");
      }
      
      console.log(`🚪 Leaving lobby ${lobbyIdStore}...`);

      await api.post(`/api/games/leave/${lobbyIdStore}`, {});

      console.log(`✅ Successfully left lobby ${lobbyIdStore}`);

      // Clean up subscriptions
      if (lobbySubscriptionRef.current) {
        console.log("🔌 Unsubscribing from lobby updates");
        lobbySubscriptionRef.current.unsubscribe();
        lobbySubscriptionRef.current = null;
      }
      
      if (gameStateSubscriptionRef.current) {
        console.log("🔌 Unsubscribing from game state updates");
        gameStateSubscriptionRef.current.unsubscribe();
        gameStateSubscriptionRef.current = null;
      }

      // Reset state completely
      setCurrentLobbyId(null);
      setCurrentLobbyPlayers([]);
      useLobbyStore.getState().clearLobby();

      console.log("🧹 Lobby state completely cleaned up");
    } catch (err: unknown) {
      console.error("❌ Error leaving lobby:", err);

      const error = err as { response?: { status?: number } };
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else {
        setError("Falha ao sair do lobby. Tente novamente.");
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Start a game (only owner can start)
  const startGame = async (lobbyId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🚀 Starting game for lobby ${lobbyId}...`);

      // Chama a API para iniciar a partida
      const gameState = await gameService.startGame(lobbyId);

      console.log("✅ Game started successfully:", gameState);
      console.log("🎮 Game ID:", gameState.id);
      console.log("🎮 Game Status:", gameState.status);
      console.log("🎮 Players in game:", gameState.playerGames?.length);

      // O WebSocket já está inscrito em /topic/game/{lobbyId}/state
      // e irá redirecionar automaticamente quando receber a notificação
      console.log("⏳ Waiting for WebSocket notification to redirect...");

    } catch (err: any) {
      console.error("❌ Error starting game:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Sessão expirada. Por favor, faça login novamente.");
      } else if (err.response?.status === 400) {
        // Erros de validação do backend
        const errorMessage = err.response?.data || "Erro ao iniciar partida";
        setError(errorMessage);
        alert(errorMessage); // Mostra ao usuário
      } else {
        setError("Falha ao iniciar partida. Tente novamente.");
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    lobbies,
    currentLobbyId,
    currentLobbyPlayers,
    isConnected,
    isLoading,
    error,
    createLobby,
    joinLobby,
    leaveLobby,
    refreshLobbies,
    startGame,
  };
};
