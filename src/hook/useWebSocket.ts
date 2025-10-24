import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../interceptor/api';
import type { 
  LobbyListResponseDto, 
  LobbyCreationRequestDto,
  LobbyCreationResponseDto,
  Player
} from '../types/lobby';
import { useAuthStore } from '../store/useAuthStore';

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
}

export const useLobbyWebSocket = (): UseLobbyWebSocketReturn => {
  const [lobbies, setLobbies] = useState<LobbyListResponseDto[]>([]);
  const [currentLobbyId, setCurrentLobbyId] = useState<number | null>(null);
  const [currentLobbyPlayers, setCurrentLobbyPlayers] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const stompClientRef = useRef<Client | null>(null);
  const lobbySubscriptionRef = useRef<any>(null);
  
  // Get token from the store
  const token = useAuthStore(state => state.token);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  // Fetch lobbies from server
  const refreshLobbies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get fresh token from store
      const currentToken = useAuthStore.getState().token;
      
      if (!currentToken) {
        setError('Não autorizado. Faça login novamente.');
        return;
      }
      
      console.log("Fetching lobbies with token");
      
      const response = await api.get<LobbyListResponseDto[]>('/api/games/lobbies');
      // Note: We don't need to manually set the header here since the api interceptor does it
      
      console.log("Lobbies fetched:", response.data);
      setLobbies(response.data);
    } catch (err: any) {
      console.error('Error fetching lobbies:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sessão expirada. Por favor, faça login novamente.');
      } else {
        setError('Falha ao carregar lobbies. Verifique sua conexão.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to a specific lobby
  const subscribeToLobby = useCallback((lobbyId: number) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn("Attempted to subscribe without active WebSocket connection");
      return;
    }
    
    // Clear previous subscription if exists
    if (lobbySubscriptionRef.current) {
      lobbySubscriptionRef.current.unsubscribe();
      lobbySubscriptionRef.current = null;
    }
    
    console.log(`Subscribing to lobby ${lobbyId}`);
    
    // Subscribe to the lobby topic using backend format
    lobbySubscriptionRef.current = stompClientRef.current.subscribe(
      `/topic/lobby/${lobbyId}`, 
      (message) => {
        try {
          const players: Player[] = JSON.parse(message.body);
          console.log(`Received lobby update for ${lobbyId}:`, players);
          setCurrentLobbyPlayers(players);
          refreshLobbies();
        } catch (err) {
          console.error('Error processing lobby message:', err);
        }
      }
    );
  }, [refreshLobbies]);

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
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      setError(null);
      
      // Refresh lobby list upon connection
      refreshLobbies();
      
      // Resubscribe if already in a lobby
      if (currentLobbyId) {
        subscribeToLobby(currentLobbyId);
      }
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      setError(`Connection error: ${frame.headers.message}`);
      setIsConnected(false);
    };

    client.onWebSocketClose = (event) => {
      console.log('WebSocket connection closed', event);
      setIsConnected(false);
      
      if (event && event.code === 1006) {
        setError('Conexão perdida. Verifique sua internet.');
      }
    };
    
    client.onWebSocketError = (event) => {
      console.error('WebSocket error:', event);
      setError('Erro na conexão com o servidor de chat.');
    };

    // Activate the client
    client.activate();
    stompClientRef.current = client;

    // Cleanup function
    return () => {
      console.log("Cleaning up WebSocket connection");
      if (lobbySubscriptionRef.current) {
        lobbySubscriptionRef.current.unsubscribe();
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
      
      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        setError('Não autorizado. Faça login novamente.');
        throw new Error('Token not found');
      }
      
      const request: LobbyCreationRequestDto = { lobbyName };
      
      // Use the REST API to create a lobby
      const response = await api.post<LobbyCreationResponseDto>(
        '/api/games/create-lobby', 
        request
      );
      
      console.log('Lobby created:', response.data);
      const lobbyId = response.data.id;
      setCurrentLobbyId(lobbyId);
      
      // Subscribe to the newly created lobby
      subscribeToLobby(lobbyId);
      
      // Refresh the lobby list
      await refreshLobbies();
    } catch (err: any) {
      console.error('Error creating lobby:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sessão expirada. Por favor, faça login novamente.');
      } else {
        setError('Falha ao criar lobby. Tente novamente.');
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
        setError('Não autorizado. Faça login novamente.');
        throw new Error('Token not found');
      }
      
      // Use the REST API to join a lobby
      const response = await api.post<Player[]>(
        `/api/games/join/${lobbyId}`,
        {}
      );
      
      console.log(`Joined lobby ${lobbyId}:`, response.data);
      setCurrentLobbyId(lobbyId);
      setCurrentLobbyPlayers(response.data);
      
      // Subscribe to the joined lobby
      subscribeToLobby(lobbyId);
      
      // Refresh the lobby list
      await refreshLobbies();
    } catch (err: any) {
      console.error('Error joining lobby:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sessão expirada. Por favor, faça login novamente.');
      } else {
        setError('Falha ao entrar no lobby. Tente novamente.');
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Leave a lobby
  const leaveLobby = async () => {
    if (!currentLobbyId) {
      console.warn("Attempted to leave lobby but not in any lobby");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        setError('Não autorizado. Faça login novamente.');
        throw new Error('Token not found');
      }
      
      // Use the REST API to leave a lobby
      await api.post(
        `/api/games/leave/${currentLobbyId}`,
        {}
      );
      
      console.log(`Left lobby ${currentLobbyId}`);
      
      // Clean up subscription
      if (lobbySubscriptionRef.current) {
        lobbySubscriptionRef.current.unsubscribe();
        lobbySubscriptionRef.current = null;
      }
      
      // Reset state
      setCurrentLobbyId(null);
      setCurrentLobbyPlayers([]);
      
      // Refresh the lobby list
      await refreshLobbies();
    } catch (err: any) {
      console.error('Error leaving lobby:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sessão expirada. Por favor, faça login novamente.');
      } else {
        setError('Falha ao sair do lobby. Tente novamente.');
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
    refreshLobbies
  };
};