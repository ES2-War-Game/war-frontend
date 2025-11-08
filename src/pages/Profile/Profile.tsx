import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileImg from "../../assets/player.png";
import styles from "./Profile.module.css";
import { useAuthStore } from "../../store/useAuthStore";
import { useGame } from "../../hook/useGame";
import { UsersService } from "../../service/userService";
import type { GameStateResponseDto } from "../../types/game";
import type { PlayerDto } from "../../types/player";

interface ProfileProps {
  isInGame?: boolean; // se estiver dentro do jogo é overlay, se não é uma página
  onClose?: () => void;
  isOwnProfile?: boolean; // Indica se é o próprio perfil para habilitar edição de nome e email
  userId?: string; // ID do usuário do perfil (para futura integração)
}

// Finished games will be loaded from backend via useGame.getFinishedGames

export default function Profile({ 
  isInGame = false, 
  onClose, 
  isOwnProfile = true // Por padrão assume que é o próprio perfil
}: ProfileProps) {
  const { user } = useAuthStore();       
  const navigate = useNavigate();         
  const [isEditing, setIsEditing] = useState(false);  // controla modo de edição
  const [visibleMatches, setVisibleMatches] = useState(2);  // controla quantas partidas mostrar
  const [isLoadingMore, setIsLoadingMore] = useState(false); 
    
  // Current player (fetched from /api/v1/players/me)
  const [currentPlayer, setCurrentPlayer] = useState<PlayerDto | null>(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  void user?.token;
  const [formData, setFormData] = useState({ nomeCompleto: "", email: "" });

  const handleEditToggle = () => {
    if (isEditing) {
      // Se está cancelando a edição, reseta os dados para os valores do servidor (se houver)
      setFormData({ nomeCompleto: currentPlayer?.username ?? "", email: currentPlayer?.email ?? "" });
    }
    setIsEditing(!isEditing);
  };

    const handleSave = async () => {
    if (!currentPlayer) return;
    setPlayerLoading(true);
    setPlayerError(null);
    try {
      const svc = new UsersService();
      const updatePayload = {
        username: formData.nomeCompleto,
        email: formData.email,
        // Se quiser editar avatar, inclua imageUrl aqui
      };
      const updated = await svc.updatePlayer(currentPlayer.id, updatePayload);
      setCurrentPlayer(updated);
      setFormData({
        nomeCompleto: updated.username ?? "",
        email: updated.email ?? ""
      });
      setIsEditing(false);
    } catch (err) {
      // Trata erro de forma robusta
      if (err && typeof err === "object") {
        // Axios error
        const maybeAxios = err as { response?: { data?: { message?: string } } };
        if (maybeAxios.response?.data?.message) {
          setPlayerError(maybeAxios.response.data.message);
        } else if ("message" in err && typeof (err as any).message === "string") {
          setPlayerError((err as any).message);
        } else {
          setPlayerError("Falha ao atualizar perfil.");
        }
      } else if (typeof err === "string") {
        setPlayerError(err);
      } else {
        setPlayerError("Falha ao atualizar perfil.");
      }
    } finally {
      setPlayerLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    
    // Simula carregamento de dados do backend
    setTimeout(() => {
      setVisibleMatches(prev => prev + 2);
      setIsLoadingMore(false);
    }, 800);
  };

  const handleBack = () => {
    if (isInGame && onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const gameApi = useGame();
  const [finishedGames, setFinishedGames] = useState<GameStateResponseDto[]>([]);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const [finishedError, setFinishedError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const svc = new UsersService();
    const loadPlayer = async () => {
      setPlayerLoading(true);
      try {
        const p = await svc.getCurrentPlayer();
        if (mounted) {
          setCurrentPlayer(p);
          setFormData({ nomeCompleto: p.username ?? "", email: p.email ?? "" });
        }
      } catch (err) {
        console.error('Erro ao carregar player /me', err);
        if (mounted) setPlayerError('Falha ao carregar dados do usuário.');
      } finally {
        if (mounted) setPlayerLoading(false);
      }
    };
    loadPlayer();
    return () => { mounted = false; };
  }, []);

  // compute partidas/vitorias derived from finishedGames and current player
  const partidasCount = finishedGames.length;
  const vitoriasCount = currentPlayer ? finishedGames.filter(g => g.winner?.player?.id === currentPlayer.id).length : 0;

  // Load finished games once on mount. avoid depending on getFinishedGames identity to prevent re-runs
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setFinishedLoading(true);
      try {
  // use the gameApi captured above
  const games = await gameApi.getFinishedGames();
        if (mounted) setFinishedGames(games || []);
      } catch (err) {
        console.error("Erro ao carregar histórico de partidas:", err);
        if (mounted) setFinishedError("Falha ao carregar histórico de partidas.");
      } finally {
        if (mounted) setFinishedLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const partidasVisiveis = finishedGames.slice(0, visibleMatches);
  const hasMoreMatches = visibleMatches < finishedGames.length;

  const profileContent = (
    <div className={`${styles.containerProfile} ${isInGame ? styles.inGameContainer : ''}`}>
      {playerLoading && (
        <div className={styles.spinner}>Carregando perfil...</div>
      )}
      {playerError && (
        <div className={styles.errorText}>{playerError}</div>
      )}

      <button className={styles.backButton} onClick={handleBack}>
        {isInGame ? 'X' : '← Voltar'}
      </button>
      
      <div className={styles.avatarContainer}>
        <img src={profileImg} alt="Avatar" className={styles.avatar} />
        {isOwnProfile && !isInGame && isEditing && (
          <button className={styles.editAvatarBtn}>Alterar Avatar</button>
        )}
      </div>

      <h2 className={styles.userName}>
        {isEditing && isOwnProfile ? (
          <input
            type="text"
            name="nomeCompleto"
            value={formData.nomeCompleto}
            onChange={handleChange}
            className={styles.editInput}
          />
        ) : (
          (currentPlayer?.username ?? formData.nomeCompleto ?? "")
        )}
      </h2>

      {/* Controles de edição - só mostra se for o próprio perfil e fora do jogo */}
      {isOwnProfile && !isInGame && (
        <div className={styles.editControls}>
          {isEditing ? (
            <>
              <button className={styles.saveBtn} onClick={handleSave}>
                Salvar
              </button>
              <button className={styles.cancelBtn} onClick={handleEditToggle}>
                Cancelar
              </button>
            </>
          ) : (
            <button className={styles.editBtn} onClick={handleEditToggle}>
              Editar Perfil
            </button>
          )}
        </div>
      )}

      <div className={styles.cardSection}>
        <h4 className={styles.cardTitle}>Informações pessoais</h4>
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>Nome completo</div>
          <div className={styles.infoValue}>
            {isEditing && isOwnProfile && !isInGame ? (
              <input
                type="text"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                className={styles.editInput}
              />
            ) : (
              (currentPlayer?.username ?? formData.nomeCompleto ?? "")
            )}
          </div>

          <div className={styles.infoLabel}>Email</div>
          <div className={styles.infoValue}>
            {isEditing && isOwnProfile && !isInGame ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.editInput}
              />
            ) : (
              (currentPlayer?.email ?? formData.email ?? "")
            )}
          </div>

          <div className={styles.infoLabel}>Número de partidas</div>
          <div className={styles.infoValue}>
            {partidasCount}
          </div>

          <div className={styles.infoLabel}>Vitórias</div>
          <div className={styles.infoValue}>
            {vitoriasCount}
          </div>
        </div>
      </div>

      <div className={styles.cardSection}>
        <h4 className={styles.cardTitle}>Histórico de partidas</h4>

        {finishedLoading && partidasVisiveis.length === 0 && (
          <p>Carregando histórico de partidas...</p>
        )}
        {finishedError && <p className={styles.errorText}>{finishedError}</p>}

        {!finishedLoading && partidasVisiveis.length === 0 && (
          <p>Nenhuma partida finalizada encontrada.</p>
        )}

        {partidasVisiveis.map((partida) => {
          const playerGames = partida.playerGames ?? [];
          const gameTerritories = partida.gameTerritories ?? [];

          return (
            <div key={partida.id}>
              <h5 className={styles.matchTitle}>Partida {partida.id} - {partida.name}</h5>

                  {/* Winner summary */}
                  {(() => {
                    const winner = partida.winner;
                    const winnerName = winner?.player?.username ?? partida.playerGames?.find(pg => pg.id === winner?.id)?.player?.username ?? '—';
                    const winnerImg = winner?.player?.imageUrl ?? profileImg;
                    return (
                      <div className="mb-2 d-flex align-items-center">
                        <img src={winnerImg} alt={winnerName} style={{ width: 36, height: 36, borderRadius: '50%', marginRight: 8 }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>Vencedor</div>
                          <div style={{ fontSize: 13 }}>{winnerName}</div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="row g-3">
                {/* Mensagem de nenhum jogador só aparece se não houver jogadores E não renderiza a grid de cards */}
                {playerGames.length === 0 ? (
                  <div className="col-12"><em>Nenhum jogador registrado para esta partida.</em></div>
                ) : (
                  playerGames.map((playerGame) => {
                    const playerName = playerGame.player?.username ?? "Jogador";
                    const territoriesCount = gameTerritories.filter(t => t.ownerId === playerGame.id).length;
                    const winnerPlayerId = partida.winner?.player?.id ?? partida.winner?.id;
                    const playerIdToCompare = playerGame.player?.id ?? playerGame.id;
                    const isWinner = winnerPlayerId !== undefined && playerIdToCompare !== undefined && winnerPlayerId === playerIdToCompare;
                    const resultado = isWinner ? "Vitória" : (!playerGame.stillInGame ? "Derrota" : "Participou");

                    return (
                      <div key={playerGame.id} className="col-md-6">
                        <div className={styles.playerCard}>
                          <p className={styles.playerName}>{playerName}</p>
                          <p className={styles.playerDetail}>Nº de Territórios: {territoriesCount}</p>
                          <p className={resultado === "Vitória" ? styles.playerWin : styles.playerLoss}>
                            {resultado}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {hasMoreMatches && (
          <div className="text-start mt-3">
            <button 
              className={styles.moreButton} 
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Carregando..." : "Ver mais"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Se estiver no jogo, mostra como overlay
  if (isInGame) {
    return (
      <div className={styles.overlay}>
        {profileContent}
      </div>
    );
  }

  // Se não estiver no jogo, mostra como página normal
  return profileContent;
}