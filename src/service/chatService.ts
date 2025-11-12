import type { ChatMessage, ChatStorage } from "../types/chat";

const CHAT_STORAGE_KEY = "war_game_chat";

class ChatStorageService {
  // Carrega todas as mensagens de um jogo específico
  getGameMessages(gameId: number): ChatMessage[] {
    try {
      const storage = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!storage) return [];

      const chatStorage: ChatStorage = JSON.parse(storage);
      return chatStorage[gameId.toString()] || [];
    } catch (error) {
      console.error("Erro ao carregar mensagens do chat:", error);
      return [];
    }
  }

  // Salva uma nova mensagem para um jogo específico
  saveMessage(gameId: number, message: ChatMessage): void {
    try {
      const storage = localStorage.getItem(CHAT_STORAGE_KEY);
      const chatStorage: ChatStorage = storage ? JSON.parse(storage) : {};

      const gameKey = gameId.toString();
      if (!chatStorage[gameKey]) {
        chatStorage[gameKey] = [];
      }

      // Adiciona a nova mensagem
      chatStorage[gameKey].push(message);

      // Mantém apenas as últimas 100 mensagens por jogo
      if (chatStorage[gameKey].length > 100) {
        chatStorage[gameKey] = chatStorage[gameKey].slice(-100);
      }

      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatStorage));
    } catch (error) {
      console.error("Erro ao salvar mensagem do chat:", error);
    }
  }

  // Limpa as mensagens de um jogo específico
  clearGameMessages(gameId: number): void {
    try {
      const storage = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!storage) return;

      const chatStorage: ChatStorage = JSON.parse(storage);
      delete chatStorage[gameId.toString()];

      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatStorage));
    } catch (error) {
      console.error("Erro ao limpar mensagens do chat:", error);
    }
  }

  // Limpa todas as mensagens de chat
  clearAllMessages(): void {
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (error) {
      console.error("Erro ao limpar todo o chat:", error);
    }
  }
}

export const chatStorageService = new ChatStorageService();
