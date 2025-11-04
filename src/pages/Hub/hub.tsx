import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./hub.module.css";
import { useLobbyWebSocket } from "../../hook/useWebSocket";

const Hub: React.FC = () => {
  const {
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
  } = useLobbyWebSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");


  // Carregar lobbies ao montar o componente
  useEffect(() => {
    refreshLobbies();
  }, [refreshLobbies]);

  const handleJoin = async (id: number) => {
    try {
      await joinLobby(id);
    } catch (error) {
      console.error('Falha ao entrar no lobby:', error);
    }
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (newRoomName.trim()) {
      try {
        
        await createLobby(newRoomName.trim());
        setNewRoomName("");
        setIsModalOpen(false);
      } catch (error) {
        console.error('Falha ao criar lobby:', error);
      }
    }
  };

  const handleLeaveLobby = async () => {
    try {
      await leaveLobby();
    } catch (error) {
      console.error('Falha ao sair do lobby:', error);
    }
  };

  // Separa lobbies: atual primeiro, depois os outros
  const sortedLobbies = [...lobbies].sort((a, b) => {
    if (a.id === currentLobbyId) return -1;
    if (b.id === currentLobbyId) return 1;
    return 0;
  });

  return (
    <div className={styles.hubContainer}>
      <h1 className={styles.title}>
        Hub {isConnected ? '🟢' : '🔴'}
      </h1>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.roomList}>
        {isLoading && lobbies.length === 0 ? (
          <div className={styles.emptyState}>
            Carregando lobbies...
          </div>
        ) : lobbies.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhum lobby disponível
          </div>
        ) : (
          sortedLobbies.map((lobby) => {
            const isCurrentLobby = lobby.id === currentLobbyId;
            
            return (
              <div 
                key={lobby.id} 
                className={`${styles.roomCard} ${isCurrentLobby ? styles.currentLobbyCard : ''}`}
              >
                <div className={styles.roomInfo}>
                  <h3>
                    {lobby.name}
                    {isCurrentLobby && <span className={styles.currentBadge}> 🎮 Você está aqui</span>}
                  </h3>
                  <p>Status: {lobby.status}</p>
                  {isCurrentLobby && (
                    <p className={styles.playerCount}>
                      Jogadores: {currentLobbyPlayers.length}
                    </p>
                  )}
                </div>
                
                {isCurrentLobby ? (
                  <div className={styles.currentLobbyActions}>
                    <Link 
                      to="/jogadores"
                      className={styles.backToLobbyBtn}
                    >
                      ↩️ Voltar ao Lobby
                    </Link>
                    <button
                      className={styles.leaveBtn}
                      onClick={handleLeaveLobby}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saindo...' : '🚪 Sair'}
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.joinBtn}
                    onClick={() => handleJoin(lobby.id)}
                    disabled={isLoading || lobby.status !== "LOBBY"}
                  >
                    {lobby.status !== "LOBBY" ? "Em jogo" : isLoading ? "Entrando..." : "Entrar"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className={styles.buttons}>
        <Link to="/" className={`${styles.btn} ${styles["btn-voltar"]}`}>
          Voltar
        </Link>
        <button 
          className={styles.createBtn} 
          onClick={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? 'Criando...' : 'Criar Sala'}
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Criar Sala</h2>
            <label>
              Nome da Sala:
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Digite o nome da sala"
                maxLength={50}
              />
            </label>
            <div className={styles.modalButtons}>
              <button 
                className={styles.confirmBtn} 
                onClick={handleConfirm}
                disabled={isLoading || !newRoomName.trim()}
              >
                {isLoading ? 'Criando...' : 'Confirmar'}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hub;