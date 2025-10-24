<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

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
=======
import { Link } from "react-router-dom";
import { useState } from "react";
import styles from "./hub.module.css";

interface Room {
  id: number;
  name: string;
  players: number;
  maxPlayers: number;
}

const Hub: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, name: "Sala de Jogador 1", players: 2, maxPlayers: 8 },
    { id: 2, name: "Sala de Jogador 2", players: 4, maxPlayers: 6 },
    { id: 3, name: "Sala de Jogador 3", players: 1, maxPlayers: 2 },
    { id: 4, name: "Sala de Jogador 4", players: 7, maxPlayers: 8 },
    { id: 5, name: "Sala de Jogador xxxx", players: 2, maxPlayers: 8 },
    { id: 6, name: "Sala de Jogador x", players: 4, maxPlayers: 8 },
    { id: 7, name: "Sala de Jogador xx", players: 1, maxPlayers: 8 },
    { id: 8, name: "Sala de Jogador xxx", players: 8, maxPlayers: 8 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newMaxPlayers, setNewMaxPlayers] = useState(8);

  const handleJoin = (id: number) => {
    
>>>>>>> origin/main
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

<<<<<<< HEAD
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

  // Encontrar o lobby atual na lista para exibir detalhes
  const currentLobby = currentLobbyId 
    ? lobbies.find(lobby => lobby.id === currentLobbyId)
    : null;

  return (
    <div className={styles.hubContainer}>
      <h1 className={styles.title}>
        Hub {isConnected ? '🟢' : '🔴'}
      </h1>

      {error && (
        <div style={{ 
          color: 'red', 
          background: 'rgba(255,0,0,0.1)', 
          padding: '10px', 
          borderRadius: '8px',
          margin: '0 auto 20px auto',
          maxWidth: '700px',
          width: '100%'
        }}>
          {error}
        </div>
      )}

      {currentLobbyId ? (
        // Exibir detalhes do lobby atual
        <div style={{ 
          backgroundColor: '#776531', 
          padding: '20px', 
          borderRadius: '16px',
          width: '100%',
          maxWidth: '700px'
        }}>
          <h2>Lobby: {currentLobby?.name}</h2>
          <h3>Jogadores ({currentLobbyPlayers.length}):</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '10px',
            marginTop: '10px',
            marginBottom: '20px'
          }}>
            {currentLobbyPlayers.map(player => (
              <div key={player.id} style={{ 
                backgroundColor: 'rgba(0,0,0,0.2)', 
                padding: '10px', 
                borderRadius: '8px' 
              }}>
                {player.username}
              </div>
            ))}
          </div>
          <button 
            className={`${styles.btn} ${styles["btn-voltar"]}`}
            onClick={handleLeaveLobby}
            disabled={isLoading}
          >
            {isLoading ? 'Saindo...' : 'Sair do Lobby'}
          </button>
        </div>
      ) : (
        // Exibir lista de lobbies
        <>
          <div className={styles.roomList}>
            {isLoading && lobbies.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px', 
                backgroundColor: '#776531',
                borderRadius: '16px',
                margin: '0 auto'
              }}>
                Carregando lobbies...
              </div>
            ) : lobbies.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px', 
                backgroundColor: '#776531',
                borderRadius: '16px',
                margin: '0 auto'
              }}>
                Nenhum lobby disponível
              </div>
            ) : (
              lobbies.map((lobby) => (
                <div key={lobby.id} className={styles.roomCard}>
                  <div className={styles.roomInfo}>
                    <h3>{lobby.name}</h3>
                    <p>Status: {lobby.status}</p>
                  </div>
                  <button
                    className={styles.joinBtn}
                    onClick={() => navigate(`/jogadores`)}
                    disabled={isLoading || lobby.status !== "Lobby"}
                  >
                    {lobby.status !== "Lobby" ? "Em jogo" : isLoading ? "Entrando..." : "Entrar"}
                  </button>
                </div>
              ))
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
        </>
      )}

=======
  const handleConfirm = () => {
    
  };

  return (
    <div className={styles.hubContainer}>
      <h1 className={styles.title}>Hub</h1>

      <div className={styles.roomList}>
        {rooms.map((room) => (
          <div key={room.id} className={styles.roomCard}>
            <div className={styles.roomInfo}>
              <h3>{room.name}</h3>
              <p>
                Jogadores: {room.players}/{room.maxPlayers}
              </p>
            </div>
            <button
              className={styles.joinBtn}
              onClick={() => handleJoin(room.id)}
              disabled={room.players >= room.maxPlayers}
            >
              {room.players >= room.maxPlayers ? "Cheia" : "Entrar"}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.buttons}>
        <Link to="/" className={`${styles.btn} ${styles["btn-voltar"]}`}>
          Voltar
        </Link>
        <button className={styles.createBtn} onClick={handleCreate}>
          Criar Sala
        </button>
      </div>

      
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
              />
            </label>
            <label>
              Número Máximo de Jogadores:
              <input
                type="number"
                value={newMaxPlayers}
                onChange={(e) => setNewMaxPlayers(Number(e.target.value))}
                min={2}
                max={8}
              />
            </label>
            <div className={styles.modalButtons}>
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                Confirmar
>>>>>>> origin/main
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsModalOpen(false)}
<<<<<<< HEAD
                disabled={isLoading}
=======
>>>>>>> origin/main
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

<<<<<<< HEAD
export default Hub;
=======
export default Hub;
>>>>>>> origin/main
