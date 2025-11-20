import { useState, useEffect, useRef } from "react";
import style from "./Chat.module.css";
import { useChatWebSocket } from "../../hook/useChat";
import { useAuthStore } from "../../store/useAuthStore";

interface ChatProps {
  gameId: number | null;
  enabled?: boolean;
}

export default function Chat({ gameId, enabled = true }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const { messages, isConnected, sendMessage } = useChatWebSocket({
    gameId,
    enabled: enabled, // Sempre aberto quando enabled=true, independente de isOpen
  });

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Scroll para o final quando o chat é aberto
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      // Pequeno delay para garantir que o DOM foi renderizado
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (inputValue.trim() && isConnected) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Impede que a tecla de espaço seja capturada pelo sistema de navegação do mapa
    if (e.key === " " || e.code === "Space") {
      e.stopPropagation();
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!enabled || !gameId) {
    return null;
  }

  // Botão flutuante quando minimizado
  if (!isOpen) {
    return (
      <button
        className={style.chatToggle}
        onClick={() => setIsOpen(true)}
        title="Abrir chat"
      >
        💬
      </button>
    );
  }

  // Chat expandido
  return (
    <div className={style.chatContainer}>
      <div className={style.chatHeader}>
        <div>
          <h3 className={style.chatTitle}>Chat</h3>
          <div className={style.connectionStatus}>
            <div className={`${style.statusDot} ${isConnected ? style.connected : ""}`} />
            <span>{isConnected ? "Conectado" : "Desconectado"}</span>
          </div>
        </div>
        <button
          className={style.closeButton}
          onClick={() => setIsOpen(false)}
          title="Minimizar chat"
        >
          ✖
        </button>
      </div>

      <div className={style.messagesContainer}>
        {messages.length === 0 ? (
          <div className={style.emptyState}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <p>Nenhuma mensagem ainda.</p>
            <p style={{ fontSize: "12px", marginTop: "8px" }}>
              Seja o primeiro a enviar uma mensagem!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isMyMessage = message.senderUsername === user?.username;
              return (
                <div
                  key={message.id}
                  className={`${style.message} ${
                    isMyMessage ? style.myMessage : style.otherMessage
                  }`}
                >
                  <div className={style.messageHeader}>
                    <span className={style.messageSender}>
                      {isMyMessage ? "Você" : message.senderUsername}
                    </span>
                    <span className={style.messageTime}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div className={style.messageContent}>{message.content}</div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className={style.inputContainer}>
        <input
          type="text"
          className={style.chatInput}
          placeholder={isConnected ? "Digite sua mensagem..." : "Aguarde conexão..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isConnected}
          maxLength={500}
        />
        <button
          className={style.sendButton}
          onClick={handleSendMessage}
          disabled={!isConnected || !inputValue.trim()}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
