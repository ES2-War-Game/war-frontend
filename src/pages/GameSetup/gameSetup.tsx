import { Link, useNavigate } from "react-router-dom";
import PlayerSlot from "../../components/PlayerSlot/playerSlot";
import style from "./gameSetup.module.css";
import playerImg from "../../assets/player.png";
import { useLobbyWebSocket } from "../../hook/useWebSocket";
import { useEffect } from "react";
import { useLobbyStore } from "../../store/lobbyStore";

const DEFAULT_SLOTS = [
  { borderColor: "blue", defaultName: "Jogador azul" },
  { borderColor: "red", defaultName: "Jogador vermelho" },
  { borderColor: "green", defaultName: "Jogador verde" },
  { borderColor: "#bfa640", defaultName: "Jogador amarelo" },
  { borderColor: "purple", defaultName: "Jogador roxo" },
  { borderColor: "black", defaultName: "Jogador preto" },
];

const GameSetupPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    
    leaveLobby,
    refreshLobbies,
  } = useLobbyWebSocket();

  
  

  const currentLobbyIdStore = useLobbyStore((s) => s.currentLobbyId);
  const currentLobbyPlayersStore = useLobbyStore((s) => s.currentLobbyPlayers);

  useEffect(() => {
    console.log("jogadores:", currentLobbyPlayersStore);
    console.log("currentLobbyId:", currentLobbyPlayersStore);
  }, [currentLobbyIdStore, currentLobbyPlayersStore]);

  // garante lista atualizada ao entrar na tela
  useEffect(() => {
    refreshLobbies();
  }, [refreshLobbies]);

  const handleLeave = async () => {
    try {
      await leaveLobby();
      navigate("/hub");
    } catch (err) {
      console.error("Erro ao sair do lobby:", err);
    }
  };

  // Se não estiver em um lobby, sugere voltar ao hub
  if (!currentLobbyIdStore) {
    return (
      <div className={style.container}>
        <h1 className="text-white fw-bold mb-5">Configurar Partida</h1>
        <div style={{ padding: 20, background: "#776531", borderRadius: 12 }}>
          <p>Nenhum lobby selecionado. Volte ao Hub e entre/crie um lobby.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/hub" className={style.btn}>
              Ir para Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={style.container}>
      <h1 className="text-white fw-bold mb-3">Configurar Partida</h1>

      <div style={{ marginBottom: 12 }}>
        <strong>Lobby ID:</strong> {currentLobbyIdStore}{" "}
        <span style={{ marginLeft: 12 }}>
          {currentLobbyIdStore ? "🟢 Conectado" : "🔴 Desconectado"}{" "}
        </span>
      </div>

      <div className={style.playersGrid}>
        {DEFAULT_SLOTS.map((slot, index) => {
          const player = currentLobbyPlayersStore[index];
          return (
            <PlayerSlot
              key={index}
              avatar={player ? player.image ?? playerImg : playerImg}
              borderColor={player ? slot.borderColor : slot.borderColor}
              defaultName={player ? player.username : slot.defaultName}
              initialType={player ? "Jogador" : "CPU"}
            />
          );
        })}
      </div>

      <div className={style.buttons} style={{ marginTop: 20 }}>
        <Link to="/hub" className={`${style.btn} ${style["btn-voltar"]}`}>
          Voltar
        </Link>
        <button className={style.btn} onClick={() => navigate("/game")}>
          Iniciar Partida
        </button>
        <button
          className={`${style.btn} ${style["btn-voltar"]}`}
          onClick={handleLeave}
          style={{ marginLeft: 8 }}
        >
          Sair do Lobby
        </button>
      </div>
    </div>
  );
};

export default GameSetupPage;
