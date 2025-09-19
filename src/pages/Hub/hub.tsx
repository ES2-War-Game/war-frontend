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
    
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

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
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsModalOpen(false)}
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
