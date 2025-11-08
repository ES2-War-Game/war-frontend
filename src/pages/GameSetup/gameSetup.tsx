import { Link, useNavigate } from "react-router-dom";
import PlayerSlot from "../../components/PlayerSlot/playerSlot";
import style from "./gameSetup.module.css";
import playerImg from "../../assets/player.png";
import { useLobbyWebSocket } from "../../hook/useWebSocket";
import { useEffect } from "react";
import { useLobbyStore } from "../../store/lobbyStore";
import { useAuthStore } from "../../store/useAuthStore";
import { gameService } from "../../service/gameService";
import type { Player } from "../../types/lobby";

// Helper function to decode JWT token
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

const DEFAULT_SLOTS = [
  { borderColor: "blue", defaultName: "Jogador azul" },
  { borderColor: "red", defaultName: "Jogador vermelho" },
  { borderColor: "green", defaultName: "Jogador verde" },
  { borderColor: "#bfa640", defaultName: "Jogador amarelo" },
  { borderColor: "purple", defaultName: "Jogador roxo" },
  { borderColor: "black", defaultName: "Jogador preto" },
];

// Mapeamento de cores do backend (inglês) para cores CSS do frontend
const COLOR_MAP: Record<string, string> = {
  "Blue": "blue",
  "Red": "red",
  "Green": "green",
  "Yellow": "#bfa640",
  "Purple": "purple",
  "Black": "black",
  // Variações em minúsculas
  "blue": "blue",
  "red": "red",
  "green": "green",
  "yellow": "#bfa640",
  "purple": "purple",
  "black": "black",
};

const GameSetupPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    currentLobbyPlayers,
    currentLobbyId,
    isConnected,
    isLoading,
    leaveLobby,
    refreshLobbies,
    startGame,
  } = useLobbyWebSocket();

  // Também pega do store para verificar persistência
  const currentLobbyIdStore = useLobbyStore((s) => s.currentLobbyId);
  const currentLobbyPlayersStore = useLobbyStore((s) => s.currentLobbyPlayers);

  // Verifica se o jogador realmente está no lobby ao carregar a página
  useEffect(() => {
    const checkCurrentLobby = async () => {
      try {
        console.log("🔍 GameSetup: Verificando lobby atual...");
        const currentGame = await gameService.getCurrentGame();
        
        console.log("📥 GameSetup: Resposta do getCurrentGame:", {
          hasGame: !!currentGame,
          gameId: currentGame?.id,
          gameName: currentGame?.name,
          status: currentGame?.status,
          players: currentGame?.players || currentGame?.playerGames
        });
        
        if (!currentGame) {
          // Não está em nenhum lobby/jogo, redirecionar
          console.log("⚠️ GameSetup: Player is not in any lobby, redirecting to hub...");
          navigate("/hub");
          return;
        }

        if (currentGame.status !== "LOBBY") {
          // Está em um jogo já iniciado, redirecionar para o jogo
          console.log("⚠️ GameSetup: Player is in an active game, redirecting to game...");
          navigate("/game");
          return;
        }

        // Está no lobby correto - salva no store
        console.log("✅ GameSetup: Player is in lobby:", currentGame.id);
        useLobbyStore.getState().setCurrentLobbyId(currentGame.id);
        console.log("✅ GameSetup: LobbyId salvo no store:", currentGame.id);

        // Recupera e salva os jogadores do lobby
        const playersData = currentGame.playerGames || currentGame.players || [];
        console.log("🔍 GameSetup: playersData bruto:", playersData);
        
        if (playersData.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const players: Player[] = playersData.map((pg: any) => {
            console.log("🔍 Processando jogador:", pg);
            
            // Caso 1: Já é um Player (tem username direto)
            if (pg.username && typeof pg.username === 'string') {
              console.log("✅ Jogador já está no formato Player");
              return {
                id: pg.id,
                username: pg.username,
                color: pg.color,
                owner: pg.owner ?? pg.isOwner,
                isOwner: pg.isOwner ?? pg.owner,
                imageUrl: pg.imageUrl || null
              };
            }
            
            // Caso 2: É PlayerGameDto ou PlayerGame (tem objeto 'player' nested)
            if (pg.player && pg.player.username) {
              const mapped = {
                id: pg.id,
                username: pg.player.username,
                color: pg.color,
                owner: pg.isOwner ?? false,
                isOwner: pg.isOwner ?? false,
                imageUrl: pg.player.imageUrl || null
              };
              console.log("✅ Mapeado de PlayerGameDto/PlayerGame:", mapped);
              return mapped;
            }
            
            // Caso 3: Fallback - estrutura desconhecida
            console.warn("⚠️ Estrutura de jogador desconhecida:", pg);
            return {
              id: pg.id || 0,
              username: 'Jogador desconhecido',
              color: pg.color || 'gray',
              owner: false,
              isOwner: false,
              imageUrl: null
            };
          });

          console.log("✅ GameSetup: Salvando jogadores do lobby:", players);
          useLobbyStore.getState().setCurrentLobbyPlayers(players);
        }
      } catch (error) {
        console.error("❌ GameSetup: Error checking current lobby:", error);
        navigate("/hub");
      }
    };

    checkCurrentLobby();
  }, [navigate]);

  useEffect(() => {
    console.log("=== DEBUG GAMESETUP ===");
    console.log("🔌 WebSocket Connected:", isConnected);
    console.log("📍 Lobby ID (hook):", currentLobbyId);
    console.log("📍 Lobby ID (store):", currentLobbyIdStore);
    console.log("👥 Players (hook):", currentLobbyPlayers);
    console.log("👥 Players (store):", currentLobbyPlayersStore);
    console.log("📊 Quantidade (hook):", currentLobbyPlayers?.length || 0);
    console.log("📊 Quantidade (store):", currentLobbyPlayersStore?.length || 0);
    
    if (currentLobbyPlayers?.length > 0) {
      console.log("Lista de jogadores (HOOK) com suas cores:");
      currentLobbyPlayers.forEach((player, idx) => {
        console.log(`  ${idx + 1}. ${player.username} - Cor: "${player.color}"`);
      });
    }
    
    if (currentLobbyPlayersStore?.length > 0) {
      console.log("Lista de jogadores (STORE) com suas cores:");
      currentLobbyPlayersStore.forEach((player, idx) => {
        console.log(`  ${idx + 1}. ${player.username} - Cor: "${player.color}"`);
      });
    }
    
    console.log("Slots disponíveis:", DEFAULT_SLOTS.map(s => s.borderColor));
    console.log("=======================");
  }, [isConnected, currentLobbyId, currentLobbyPlayers, currentLobbyIdStore, currentLobbyPlayersStore]);

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

  const handleStartGame = async () => {
    const lobbyToStart = currentLobbyId || currentLobbyIdStore;
    
    if (!lobbyToStart) {
      alert("Erro: Nenhum lobby ativo encontrado.");
      return;
    }

    // Verifica se há pelo menos 2 jogadores
    const playerCount = activePlayers?.length || 0;
    if (playerCount < 2) {
      alert("São necessários pelo menos 2 jogadores para iniciar a partida.");
      return;
    }

    // Obtém o token e decodifica para pegar o username do usuário atual
    const token = useAuthStore.getState().user?.token;
    if (!token) {
      alert("Erro: Você precisa estar autenticado para iniciar a partida.");
      return;
    }

    const decodedToken = decodeJWT(token);
    const currentUsername = decodedToken?.sub || decodedToken?.username;

    // Verifica se o usuário atual é o dono do lobby
    const currentPlayer = activePlayers?.find(p => p.username === currentUsername);
    if (!currentPlayer?.owner && !currentPlayer?.isOwner) {
      alert("Apenas o dono do lobby pode iniciar a partida.");
      return;
    }

    try {
      console.log("🎮 User requested to start game...");
      await startGame(lobbyToStart);
      // O redirecionamento acontecerá automaticamente via WebSocket
    } catch (err) {
      console.error("Erro ao iniciar partida:", err);
      // O erro já é tratado e exibido no hook
    }
  };

  // Se não estiver em um lobby, sugere voltar ao hub
  if (!currentLobbyId && !currentLobbyIdStore) {
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

  // Usa os dados do hook ou fallback para store temporariamente
  const activeLobbyId = currentLobbyId || currentLobbyIdStore;
  const activePlayers = currentLobbyPlayers || currentLobbyPlayersStore || [];

  // Verifica se o usuário atual é o dono do lobby
  const token = useAuthStore.getState().user?.token;
  let isCurrentUserOwner = false;
  
  if (token && activePlayers && activePlayers.length > 0) {
    const decodedToken = decodeJWT(token);
    const currentUsername = decodedToken?.sub || decodedToken?.username;
    const currentPlayer = activePlayers.find(p => p.username === currentUsername);
    
    if (currentPlayer) {
      // Verifica APENAS os campos enviados pelo backend
      isCurrentUserOwner = Boolean(currentPlayer.owner || currentPlayer.isOwner);
    }
    
    console.log("👤 Current user:", currentUsername, "| Is owner:", isCurrentUserOwner, "| Player data:", currentPlayer);
  }

  return (
    <div className={style.container}>
      <h1 className="text-white fw-bold mb-3">Configurar Partida</h1>

      <div style={{ marginBottom: 12 }}>
        <strong>Lobby ID:</strong> {activeLobbyId}{" "}
        <span style={{ marginLeft: 12 }}>
          {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}{" "}
        </span>
        <br />
        <strong>Jogadores no lobby:</strong> {activePlayers?.length || 0}
      </div>

      <div className={style.playersGrid}>
        {DEFAULT_SLOTS.map((slot, index) => {
          // Procura um jogador cuja cor (vinda do backend) corresponde à cor deste slot
          // O backend pode enviar "Red", "Blue", etc., então normalizamos para comparar
          const player = activePlayers?.find((p) => {
            const playerColorCSS = COLOR_MAP[p.color] || p.color.toLowerCase();
            return playerColorCSS === slot.borderColor;
          });

          console.log(
            `Slot ${index} (${slot.borderColor}):`,
            player ? `✅ ${player.username} (${player.color})` : "❌ Vazio"
          );

          // Usa uma key única que combina o slot e o player (se existir)
          // Isso força React a recriar o componente quando o jogador muda
          const slotKey = player 
            ? `slot-${slot.borderColor}-player-${player.id}` 
            : `slot-${slot.borderColor}-empty`;

          return (
            <PlayerSlot
              key={slotKey}
              avatar={player?.imageUrl ?? playerImg}
              borderColor={slot.borderColor}
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
        {isCurrentUserOwner && (
          <button 
            className={style.btn} 
            onClick={handleStartGame}
            disabled={isLoading || (activePlayers?.length || 0) < 2}
            style={{ 
              opacity: isLoading || (activePlayers?.length || 0) < 2 ? 0.5 : 1,
              cursor: isLoading || (activePlayers?.length || 0) < 2 ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? "Iniciando..." : "Iniciar Partida"}
          </button>
        )}
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
