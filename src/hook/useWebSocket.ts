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
  GameStatus,
} from "../types/lobby";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useLobbyStore } from "../store/lobbyStore";
import { useGameStore } from "../store/useGameStore";
import {
  extractTerritoryInfo,
  extractAndStorePlayerObjective,
} from "../utils/gameState";
import { useAllocateStore } from "../store/useAllocate";
import type { GameStateResponseDto } from "../types/game";

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

export const useLobbyWebSocket = (enabled: boolean = true): UseLobbyWebSocketReturn => {
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
  const gameStateByIdSubscriptionRef = useRef<any>(null); // 🆕 Para /topic/game/{gameId}/state

  // Get token from the store
  const token = useAuthStore((state) => state.user?.token);
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
      const currentToken = useAuthStore.getState().user?.token;

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
            console.log(
              `🔄 Received lobby update for ${lobbyId} via WebSocket`
            );
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

            const gameState: GameStateResponseDto = JSON.parse(message.body);
            console.log("🎮 Parsed Game State:", gameState);
            console.log("🎮 Game Status:", gameState.status);

            useGameStore.getState().setGameStatus(gameState.status as GameStatus);

            useGameStore.getState().setGameId(gameState.id);

            // Mapeia cores por território (por NOME) e objetivos dos jogadores
            const territoriesColors = extractTerritoryInfo(gameState);

            // Pega o userId uma única vez
            const userId = useAuthStore.getState().getUserId?.();

            // coloca no storage qual jogador que esta jogando
            if (gameState.turnPlayer) {
              useGameStore.getState().setTurnPlayer(gameState.turnPlayer.id);
              
              // Calcula se é o turno do jogador atual
              // Compara o player.id (userId) do turnPlayer com o userId atual
              const isMyTurn = String(gameState.turnPlayer.player.id) === String(userId);
              useGameStore.getState().setIsMyTurn(isMyTurn);
              console.log("🎮 Turno atualizado via WebSocket:", {
                turnPlayerGameId: gameState.turnPlayer.id,
                turnPlayerUserId: gameState.turnPlayer.player.id,
                currentUserId: userId,
                isMyTurn
              });
            }

            // as cores dos terrtitorios com map de nome por {id,cor,ownedid}
            useGameStore.getState().setTerritoriesColors(territoriesColors);

            // 🤖 Detecta jogadores que saíram da partida (preparado para IA futura)
            const playersList = gameState.playerGames || [];
            const playersWhoLeft = playersList.filter(p => !p.stillInGame);
            
            if (playersWhoLeft.length > 0) {
              console.log("🚪 Jogadores que abandonaram (lobby subscription):", playersWhoLeft.map(p => ({
                username: p.player.username,
                color: p.color,
                stillInGame: p.stillInGame
              })));
              
              // TODO: Futuramente, substituir por IA
              playersWhoLeft.forEach(p => {
                console.log(`⚠️ Jogador ${p.player.username} (${p.color}) saiu - Preparado para IA`);
              });
            }
            
            // Verifica se há um vencedor
            if (gameState.winner) {
              console.log("🏆 JOGO FINALIZADO! Vencedor:", {
                username: gameState.winner.player.username,
                color: gameState.winner.color
              });
            }

            // Store only the authenticated player's PlayerGameDto in the game store
            const myPlayer = userId
              ? playersList.find((p) => String(p.player.id) == String(userId)) ?? null
              : null;
            useGameStore.getState().setPlayer(myPlayer);
            useAllocateStore.getState().setUnallocatedArmies(myPlayer?.unallocatedArmies ?? 0)

            // Set objective only when we have a valid player with a description to satisfy strict typing
            if (
              myPlayer?.id != null &&
              myPlayer.objective?.description != null
            ) {
              useGameStore.getState().setPlayerObjective({
                id: myPlayer.id,
                objective: myPlayer.objective.description,
              });
            }

            console.log("🎨 Territories colors stored:", territoriesColors);

            navigate("/game");

            // Assinatura por gameId é feita num efeito dedicado quando gameId é definido
          } catch (err) {
            console.error("❌ Error processing game state message:", err);
          }
        }
      );

      console.log(
        `✅ Successfully subscribed to game state for lobby ${lobbyId}`
      );
    },
    [navigate] // Adicionado navigate
  );

  // Initialize WebSocket with JWT
  useEffect(() => {
    if (!enabled) {
      return
    }

    if (!token) {
      console.warn("Attempted to connect WebSocket without token");
      return;
    }

    // Prevent multiple connections - if already connected or connecting, don't create a new one
    if (stompClientRef.current) {
      if (stompClientRef.current.connected) {
        console.log("WebSocket already connected, skipping initialization");
        setIsConnected(true);
        return;
      }
      if (stompClientRef.current.active) {
        console.log("WebSocket already connecting, skipping initialization");
        return;
      }
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
      globalLobbiesSubscriptionRef.current = client.subscribe(
        "/topic/lobbies/list",
        (message) => {
          try {
            const updatedLobbies: LobbyListResponseDto[] = JSON.parse(
              message.body
            );
            console.log(
              "🔄 Received global lobby list update via WebSocket:",
              updatedLobbies
            );
            setLobbies(updatedLobbies); // Atualiza o estado da lista de lobbies em tempo real
          } catch (err) {
            console.error("Error processing global lobby list message:", err);
          }
        }
      );

      // Refresh lobby list upon connection (garantir carregamento inicial)
      refreshLobbies();

      // 🔥 IMPORTANTE: Resubscribe se já estava em um lobby
      // Verifica tanto o estado local quanto o store persistido
      const lobbyToSubscribe =
        currentLobbyId || useLobbyStore.getState().currentLobbyId;

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
      if (gameStateByIdSubscriptionRef.current) {
        try { gameStateByIdSubscriptionRef.current.unsubscribe(); } catch {}
        gameStateByIdSubscriptionRef.current = null;
      }
      if (client.connected) {
        client.deactivate();
      }
    };
  }, [token, backendUrl, currentLobbyId, subscribeToLobby, refreshLobbies]);

  // 🆕 Além da assinatura por lobby, também assina o tópico do jogo por gameId
  const gameId = useGameStore((s) => s.gameId);
  
  // Removido log que poluía o console (executava a cada segundo)
  // console.log("🎲 useLobbyWebSocket - gameId from store:", gameId);
  
  useEffect(() => {
    console.log("🔍 useEffect gameId subscription check:", {
      gameId,
      hasStompClient: !!stompClientRef.current,
      isConnected
    });
    
    // Requer conexão ativa e um gameId válido
    if (!isConnected || !stompClientRef.current) {
      console.warn("⚠️ WebSocket not connected, skipping gameId subscription. isConnected:", isConnected, "hasClient:", !!stompClientRef.current);
      return;
    }
    if (!gameId) {
      console.warn("⚠️ No gameId, skipping subscription");
      return;
    }

    console.log("✅ All conditions met, proceeding with subscription");

    // Verifica se o cliente está realmente conectado antes de tentar se inscrever
    if (!stompClientRef.current.connected) {
      console.error("❌ Client exists but is not connected! Aborting subscription.");
      return;
    }

    // Cancela subscrição anterior (se houver)
    if (gameStateByIdSubscriptionRef.current) {
      try {
        console.log("🔄 Unsubscribing from previous gameId subscription");
        gameStateByIdSubscriptionRef.current.unsubscribe();
      } catch (_) {}
      gameStateByIdSubscriptionRef.current = null;
    }

    const topic = `/topic/game/${gameId}/state`;
    console.log(`📡 Subscribing to game state by gameId: ${topic}`);
    
    try {
      gameStateByIdSubscriptionRef.current = stompClientRef.current.subscribe(
        topic,
        (message) => {
        console.log("📨 MESSAGE RECEIVED on /topic/game/${gameId}/state!");
        try {
                  const msg = JSON.parse(message.body);
        console.log("📨 WebSocket recebeu mensagem em /topic/game/{gameId}/state:", {
          hasWinner: !!msg.winner,
          status: msg.status,
          winnerName: msg.winner?.player?.username
        });
        
        const gs: GameStateResponseDto = msg;
          console.log("🔄 WebSocket update received:", gs);
          console.log("📊 playerGames array:", gs.playerGames);
          
          // Pega o userId uma única vez
          const uid = useAuthStore.getState().getUserId?.();
          console.log("👤 Current userId:", uid);
          
          // Atualizações essenciais para refletir allocate/turnos etc.
          useGameStore.getState().setGameStatus(gs.status as GameStatus);
          const colors = extractTerritoryInfo(gs);
          console.log("🎨 Territories colors extracted:", colors);
          
          // Log específico para detectar atualizações de ataque
          if (gs.status === "ATTACK" && gs.gameTerritories) {
            console.log("⚔️ ATAQUE - Territórios atualizados via WebSocket:", {
              totalTerritories: gs.gameTerritories.length,
              sampleTerritories: gs.gameTerritories.slice(0, 3).map(gt => ({
                gameTerritoryId: gt.id,
                territoryId: gt.territory.id,
                territoryName: gt.territory.name,
                ownerId: gt.ownerId,
                staticArmies: gt.staticArmies
              }))
            });
          }
          
          if (gs.turnPlayer) {
            useGameStore.getState().setTurnPlayer(gs.turnPlayer.id);
            
            // Calcula se é o turno do jogador atual
            // Compara o player.id (userId) do turnPlayer com o userId atual
            const isMyTurn = String(gs.turnPlayer.player.id) === String(uid);
            useGameStore.getState().setIsMyTurn(isMyTurn);
            console.log("🎮 Turno atualizado via WebSocket (gameId):", {
              turnPlayerGameId: gs.turnPlayer.id,
              turnPlayerUserId: gs.turnPlayer.player.id,
              currentUserId: uid,
              isMyTurn
            });
          }
          
          useGameStore.getState().setTerritoriesColors(colors);
          console.log("✅ Territories colors updated in store");
          
          // 🤖 Detecta jogadores que saíram da partida (preparado para IA futura)
          const plist = gs.playerGames || [];
          const playersWhoLeft = plist.filter(p => !p.stillInGame);
          
          if (playersWhoLeft.length > 0) {
            console.log("� Jogadores que abandonaram a partida:", playersWhoLeft.map(p => ({
              username: p.player.username,
              color: p.color,
              stillInGame: p.stillInGame
            })));
            
            // TODO: Futuramente, substituir por IA
            // Para cada jogador que saiu, poderia:
            // 1. Criar uma instância de IA para assumir o controle
            // 2. Marcar visualmente no mapa que é controlado por IA
            // 3. Implementar lógica de decisão automática para turnos da IA
            
            // Por enquanto, apenas logamos a informação
            playersWhoLeft.forEach(p => {
              console.log(`⚠️ Jogador ${p.player.username} (${p.color}) saiu - Preparado para IA`);
            });
          }
          
          // 🏆 Verifica se há um vencedor (FIM DE JOGO)
          console.log("🔍 Verificando fim de jogo:", {
            status: gs.status,
            statusType: typeof gs.status,
            hasWinner: !!gs.winner,
            winnerName: gs.winner?.player?.username,
            comparison: gs.status === "FINISHED"
          });
          
          if (gs.status === "FINISHED" && gs.winner) {
            console.log("🏆 JOGO FINALIZADO! Vencedor:", {
              username: gs.winner.player.username,
              color: gs.winner.color,
              objective: gs.winner.objective?.description
            });
            
            // Verificar se o vencedor é o jogador atual
            const isWinner = String(gs.winner.player.id) === String(uid);
            
            if (isWinner) {
              console.log("🎉 VOCÊ VENCEU!");
            } else {
              console.log("😢 Você perdeu. Vencedor:", gs.winner.player.username);
            }
            
            // Salva informações do vencedor e estado do jogo no store
            useGameStore.getState().setWinner(gs.winner);
            useGameStore.getState().setGameEnded(true);
            
            console.log("✅ Estado salvo no store:", {
              gameEnded: useGameStore.getState().gameEnded,
              hasWinner: !!useGameStore.getState().winner
            });
          } else {
            console.log("⚠️ Condições não atendidas para fim de jogo:", {
              statusMatch: gs.status === "FINISHED",
              hasWinner: !!gs.winner
            });
          }
          
          console.log("�📋 Looking for player in list:", {
            uid,
            totalPlayers: plist.length,
            activePlayers: plist.filter(p => p.stillInGame).length,
            players: plist.map(p => ({ 
              id: p.player?.id, 
              username: p.player?.username, 
              unallocatedArmies: p.unallocatedArmies,
              stillInGame: p.stillInGame 
            }))
          });
          
          const mine = uid
            ? plist.find((p) => String(p.player.id) == String(uid)) ?? null
            : null;
          
          console.log("🎯 My player found:", mine);
          console.log("🪖 Unallocated armies from backend:", mine?.unallocatedArmies);
          
          useGameStore.getState().setPlayer(mine);
          
          const armiesValue = mine?.unallocatedArmies ?? 0;
          console.log("📤 Setting unallocatedArmies to:", armiesValue);
          useAllocateStore.getState().setUnallocatedArmies(armiesValue);
          
          // Verifica se realmente foi setado
          const verificacao = useAllocateStore.getState().unallocatedArmies;
          console.log("✅ Verificação - valor no store agora:", verificacao);
          
          console.log("👤 Player info updated:", {
            player: mine,
            unallocatedArmies: armiesValue
          });
        } catch (err) {
          console.error("❌ Error processing /topic/game/{id}/state message:", err);
        }
      }
    );
    
    console.log("✅ Successfully subscribed to game state by gameId:", {
      topic,
      subscriptionActive: !!gameStateByIdSubscriptionRef.current
    });
    
    // Fetch initial game state via HTTP to populate unallocatedArmies
    console.log("🔄 Fetching initial game state via HTTP...");
    gameService.getCurrentTurn(gameId)
      .then((turnData) => {
        console.log("📥 Initial turn data received:", turnData);
        if (turnData.currentTurnPlayer) {
          const armies = turnData.currentTurnPlayer.unallocatedArmies ?? 0;
          console.log(`🎯 Setting initial unallocatedArmies to: ${armies}`);
          useAllocateStore.getState().setUnallocatedArmies(armies);
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching initial game state:", err);
      });
    
    } catch (err) {
      console.error("❌ Error creating subscription:", err);
      return;
    }

    return () => {
      console.log("🧹 Cleaning up gameId subscription for gameId:", gameId);
      if (gameStateByIdSubscriptionRef.current) {
        try {
          gameStateByIdSubscriptionRef.current.unsubscribe();
        } catch (_) {}
        gameStateByIdSubscriptionRef.current = null;
      }
    };
  }, [gameId, isConnected]); // 🔥 Adiciona isConnected como dependência!
  

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
      console.log(
        "✅ Lobby created:",
        response.data,
        "resolved lobbyId:",
        lobbyId
      );

      // Após criar, fazer join para obter os dados completos do lobby (incluindo o jogador)
      const lobbyDetailsResponse = await api.post<GameLobbyDetailsDto>(
        `/api/games/join/${lobbyId}`,
        {}
      );

      console.log("✅ Joined created lobby:", lobbyDetailsResponse.data);
      console.log(
        "Players in created lobby:",
        lobbyDetailsResponse.data.players
      );

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

      const currentToken = useAuthStore.getState().user?.token;
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

      const currentToken = useAuthStore.getState().user?.token;
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

      // Chama a API para iniciar a partida e usa o snapshot inicial
      const gameState: GameStateResponseDto = await gameService.startGame(
        lobbyId
      );

      console.log("✅ Game started successfully:", gameState);
      console.log("🎮 Game ID:", gameState.id);
      console.log("🎮 Game Status:", gameState.status);
      console.log("🎮 Players in game:", gameState.playerGames?.length);

      // Popula estado inicial para pintar o mapa e objetivos antes dos updates do WS
      const territoriesColors = extractTerritoryInfo(gameState);
      useGameStore.getState().setTerritoriesColors(territoriesColors);
      // Persist only the authenticated player's PlayerGameDto into the store
      const startPlayers = gameState.playerGames || [];
      const startUserId = useAuthStore.getState().getUserId?.();
      const startMyPlayer = startUserId
        ? startPlayers.find((p) => String(p.id) === String(startUserId)) ?? null
        : null;
      useGameStore.getState().setPlayer(startMyPlayer);

      // Persistir objetivos por jogador no store
      const playersList = gameState.playerGames || [];
      for (const p of playersList) {
        extractAndStorePlayerObjective(gameState, String(p.id));
      }

      console.log("🎨 Initial territoriesColors stored:", territoriesColors);
      console.log(
        "🏁 Initial playerObjectives stored:",
        useGameStore.getState().playerObjective
      );

      // O WebSocket continuará enviando atualizações em /topic/game/{lobbyId}/state
      console.log("⏳ WebSocket will keep streaming updates...");
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
