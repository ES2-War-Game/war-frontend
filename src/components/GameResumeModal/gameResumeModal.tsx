import { useNavigate } from "react-router-dom";
import type { GameState } from "../../types/lobby";
import { gameService } from "../../service/gameService";
import { useState, useEffect } from "react";
import { useLobbyStore } from "../../store/lobbyStore";
import { useGameStore } from "../../store/useGameStore";
import style from "./gameResumeModal.module.css";

interface GameResumeModalProps {
  game: GameState;
  onClose: () => void;
}

const GameResumeModal: React.FC<GameResumeModalProps> = ({ game: initialGame, onClose }) => {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);
  const [game, setGame] = useState<GameState>(initialGame);
  
  // Stores para salvar IDs antes de navegar
  const setCurrentLobbyId = useLobbyStore((s) => s.setCurrentLobbyId);
  const setGameId = useGameStore((s) => s.setGameId);
  const clearGameState = useGameStore((s) => s.clearGameState);
  const setWinner = useGameStore((s) => s.setWinner);
  const setGameEnded = useGameStore((s) => s.setGameEnded);

  // Busca dados atualizados do backend se o nome estiver undefined
  useEffect(() => {
    const fetchGameData = async () => {
      if (!game.name || game.name === "undefined") {
        console.log("⚠️ GameResumeModal: Nome do jogo undefined. Buscando do backend...");
        try {
          const updatedGame = await gameService.getCurrentGame();
          if (updatedGame) {
            console.log("✅ GameResumeModal: Dados atualizados do backend:", updatedGame);
            setGame(updatedGame);
          }
        } catch (error) {
          console.error("❌ GameResumeModal: Erro ao buscar dados do jogo:", error);
        }
      }
    };

    fetchGameData();
  }, [game.name]);

  const isLobby = game.status === 'LOBBY';
  const players = game.players || game.playerGames || [];
  const activePlayersCount = players.filter(p => p.stillInGame).length;

  const statusText: Record<string, string> = {
    'LOBBY': 'Aguardando jogadores',
    'SETUP_ALLOCATION': 'Alocação Inicial de Tropas',
    'REINFORCEMENT': 'Fase de Reforço',
    'ATTACK': 'Fase de Ataque',
    'MOVEMENT': 'Fase de Movimentação',
    'FINISHED': 'Finalizado'
  };

  const handleResume = () => {
    console.log("🎮 GameResumeModal: Retomando jogo/lobby", {
      id: game.id,
      name: game.name,
      status: game.status,
      isLobby
    });
    
    // 🔧 Limpa estados de jogo anterior antes de entrar em novo jogo
    console.log("🧹 Limpando estado de jogo anterior antes de continuar");
    setWinner(null);
    setGameEnded(false);
    
    if (isLobby) {
      // Salva o lobbyId no store antes de navegar
      setCurrentLobbyId(game.id);
      console.log("✅ LobbyId salvo no store:", game.id);
      navigate(`/jogadores`);
    } else {
      // Salva o gameId no store antes de navegar
      setGameId(game.id);
      console.log("✅ GameId salvo no store:", game.id);
      navigate(`/game`);
    }
    onClose();
  };

  const handleLeave = async () => {
    const gameName = game.name || "este jogo";
    
    if (isLobby) {
      const confirmed = window.confirm(
        `Tem certeza que deseja sair do lobby "${gameName}"?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        'Tem certeza que deseja abandonar o jogo?\n\n' +
        'Seus territórios serão redistribuídos e você não poderá voltar.'
      );
      if (!confirmed) return;
    }

    setIsLeaving(true);
    try {
      if (isLobby) {
        await gameService.leaveLobby(game.id);
        alert('Você saiu do lobby com sucesso!');
      } else {
        await gameService.leaveGame(game.id);
        alert('Você abandonou o jogo. Seus territórios foram redistribuídos.');
      }
      
      // 🔧 Limpa o estado do jogo anterior (winner, gameEnded, etc.)
      console.log("🧹 Limpando estado do jogo anterior após sair/abandonar");
      clearGameState();
      setWinner(null);
      setGameEnded(false);
      setGameId(null);
      
      onClose();
      navigate('/hub');
    } catch (error) {
      console.error('Erro ao sair:', error);
      alert('Erro ao sair. Tente novamente.');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className={style.overlay}>
      <div className={style.modal}>
        <h2 className={style.title}>
          {isLobby ? '🎮 Você está em um lobby' : '⚔️ Você está em um jogo ativo'}
        </h2>

        <div className={style.content}>
          <div className={style.info}>
            <p><strong>Nome:</strong> {game.name || "Carregando..."}</p>
            <p><strong>Status:</strong> {statusText[game.status] || game.status}</p>
            {isLobby ? (
              <p><strong>Jogadores:</strong> {players.length}/{game.maxPlayers || 6}</p>
            ) : (
              <p><strong>Jogadores Ativos:</strong> {activePlayersCount}/{players.length}</p>
            )}
          </div>

          {!isLobby && players.length > 0 && (
            <div className={style.players}>
              <strong>Jogadores:</strong>
              <ul>
                {players.map((p) => (
                  <li key={p.id}>
                    <span className={style.playerColor} style={{ backgroundColor: p.color }}></span>
                    {p.player.username}
                    {!p.stillInGame && ' (abandonou)'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={style.buttons}>
          <button 
            className={`${style.btn} ${style.btnPrimary}`}
            onClick={handleResume}
            disabled={isLeaving}
          >
            {isLobby ? 'Voltar ao Lobby' : 'Voltar ao Jogo'}
          </button>
          <button 
            className={`${style.btn} ${style.btnDanger}`}
            onClick={handleLeave}
            disabled={isLeaving}
          >
            {isLeaving ? 'Saindo...' : (isLobby ? 'Sair do Lobby' : 'Abandonar Jogo')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResumeModal;
