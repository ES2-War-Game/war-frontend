import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessageDto, ChatMessage } from "../types/chat";
import { chatStorageService } from "../service/chatService";
import { useAuthStore } from "../store/useAuthStore";

interface UseChatWebSocketProps {
  gameId: number | null;
  enabled?: boolean;
}

interface UseChatWebSocketReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
}

const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const useChatWebSocket = ({
  gameId,
  enabled = true,
}: UseChatWebSocketProps): UseChatWebSocketReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const chatSubscriptionRef = useRef<any>(null);
  const { user } = useAuthStore();

  // Carrega mensagens do localStorage ao montar ou quando gameId mudar
  useEffect(() => {
    if (gameId) {
      const storedMessages = chatStorageService.getGameMessages(gameId);
      setMessages(storedMessages);
    }
  }, [gameId]);

  // Conecta ao WebSocket
  useEffect(() => {
    if (!enabled || !gameId || !user?.token) {
      return;
    }

    const connectWebSocket = () => {
      const socket = new SockJS(`${backendUrl}/ws`);

      const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${user.token}`,
        },
        debug: (str) => {
          console.log("[Chat WebSocket]", str);
        },
        onConnect: () => {
          console.log("Chat WebSocket conectado");
          setIsConnected(true);

          // Inscreve no tópico de chat do jogo
          if (client && gameId) {
            chatSubscriptionRef.current = client.subscribe(
              `/topic/game/${gameId}/chat`,
              (message) => {
                try {
                  const chatMessage: ChatMessageDto = JSON.parse(message.body);

                  // Cria a mensagem completa com ID e timestamp
                  const fullMessage: ChatMessage = {
                    id: `${Date.now()}-${Math.random()}`,
                    senderUsername: chatMessage.senderUsername,
                    content: chatMessage.content,
                    timestamp: chatMessage.timestamp || new Date().toISOString(),
                    color: chatMessage.color,
                  };

                  // Salva no localStorage
                  chatStorageService.saveMessage(gameId, fullMessage);

                  // Atualiza o estado
                  setMessages((prev) => [...prev, fullMessage]);
                } catch (error) {
                  console.error("Erro ao processar mensagem do chat:", error);
                }
              }
            );
          }
        },
        onDisconnect: () => {
          console.log("Chat WebSocket desconectado");
          setIsConnected(false);
        },
        onStompError: (frame) => {
          console.error("Erro no STOMP do chat:", frame.headers["message"]);
          setIsConnected(false);
        },
      });

      client.activate();
      stompClientRef.current = client;
    };

    connectWebSocket();

    // Cleanup ao desmontar
    return () => {
      if (chatSubscriptionRef.current) {
        chatSubscriptionRef.current.unsubscribe();
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [enabled, gameId, user?.token]);

  // Função para enviar mensagem
  const sendMessage = useCallback(
    (content: string) => {
      if (!stompClientRef.current?.connected || !gameId || !content.trim()) {
        console.warn("Não é possível enviar mensagem: WebSocket não conectado ou mensagem vazia");
        return;
      }

      const messageDto: ChatMessageDto = {
        senderUsername: user?.username || "Anônimo",
        content: content.trim(),
      };

      try {
        stompClientRef.current.publish({
          destination: `/topic/game/${gameId}/chat`,
          body: JSON.stringify(messageDto),
        });
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
      }
    },
    [gameId, user?.username]
  );

  // Função para limpar mensagens
  const clearMessages = useCallback(() => {
    if (gameId) {
      chatStorageService.clearGameMessages(gameId);
      setMessages([]);
    }
  }, [gameId]);

  return {
    messages,
    isConnected,
    sendMessage,
    clearMessages,
  };
};
