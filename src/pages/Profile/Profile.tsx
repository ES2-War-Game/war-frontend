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
  isInGame?: boolean;
  onClose?: () => void;
  isOwnProfile?: boolean;
  userId?: string;
}

export default function Profile({
  isInGame = false,
  onClose,
  isOwnProfile = true,
}: ProfileProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [visibleMatches, setVisibleMatches] = useState(2);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const [currentPlayer, setCurrentPlayer] = useState<PlayerDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nomeCompleto: "", email: "" });

  const gameApi = useGame();
  const [finishedGames, setFinishedGames] = useState<GameStateResponseDto[]>(
    []
  );

  useEffect(() => {
    let mounted = true;
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const svc = new UsersService();
        const [playerData, gamesData] = await Promise.all([
          svc.getCurrentPlayer(),
          gameApi.getFinishedGames(),
        ]);

        if (mounted) {
          setCurrentPlayer(playerData);
          setFormData({
            nomeCompleto: playerData.username ?? "",
            email: playerData.email ?? "",
          });
          setFinishedGames(gamesData || []);
        }
      } catch (err) {
        if (mounted) {
          setError("Falha ao carregar dados do perfil.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadAllData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccordionToggle = (partidaId: number) => {
    setOpenAccordion(openAccordion === partidaId ? null : partidaId);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        nomeCompleto: currentPlayer?.username ?? "",
        email: currentPlayer?.email ?? "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!currentPlayer) return;
    try {
      const svc = new UsersService();
      const updatePayload = {
        username: formData.nomeCompleto,
        email: formData.email,
      };
      const updated = await svc.updatePlayer(currentPlayer.id, updatePayload);
      setCurrentPlayer(updated);
      setFormData({
        nomeCompleto: updated.username ?? "",
        email: updated.email ?? "",
      });
      setIsEditing(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Falha ao atualizar perfil.";
      setError(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleMatches((prev) => prev + 2);
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

  const partidasCount = finishedGames.length;
  const vitoriasCount = currentPlayer
    ? finishedGames.filter((g) => g.winner?.player?.id === currentPlayer.id)
        .length
    : 0;

  const partidasVisiveis = finishedGames.slice(0, visibleMatches);
  const hasMoreMatches = visibleMatches < finishedGames.length;

  if (isLoading) {
    return <div className={styles.spinner}>Carregando...</div>;
  }

  if (error) {
    return <div className={styles.errorText}>{error}</div>;
  }

  const profileContent = (
    <div
      className={`${styles.containerProfile} ${
        isInGame ? styles.inGameContainer : ""
      }`}
    >
      <button className={styles.backButton} onClick={handleBack}>
        {isInGame ? "X" : "←"}
      </button>

      <div className={styles.profileGrid}>
        <div className={styles.profileHeader}>
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
              currentPlayer?.username ?? ""
            )}
          </h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{partidasCount}</span>
              <span className={styles.statLabel}>Partidas</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{vitoriasCount}</span>
              <span className={styles.statLabel}>Vitórias</span>
            </div>
          </div>
          {isOwnProfile && !isInGame && (
            <div className={styles.editControls}>
              {isEditing ? (
                <>
                  <button className={styles.saveBtn} onClick={handleSave}>
                    Salvar
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={handleEditToggle}
                  >
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
        </div>

        <div className={styles.profileDetails}>
          <div className={styles.cardSection}>
            <h4 className={styles.cardTitle}>Informações Pessoais</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoLabel}>Nome de Usuário</div>
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
                  currentPlayer?.username ?? ""
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
                  currentPlayer?.email ?? ""
                )}
              </div>
            </div>
          </div>

          <div className={styles.cardSection}>
            <h4 className={styles.cardTitle}>Histórico de Partidas</h4>
            {partidasVisiveis.length === 0 ? (
              <p>Nenhuma partida encontrada.</p>
            ) : (
              partidasVisiveis.map((partida) => (
                <div key={partida.id} className={styles.accordionItem}>
                  <div
                    className={styles.matchHistoryItem}
                    onClick={() => handleAccordionToggle(partida.id)}
                  >
                    <div className={styles.matchInfo}>
                      <h5>
                        Partida {partida.id} - {partida.name}
                      </h5>
                      <p>
                        Vencedor:{" "}
                        {partida.winner?.player?.username ?? "Não definido"}
                      </p>
                    </div>
                    <div
                      className={`${styles.matchResult} ${
                        partida.winner?.player?.id === currentPlayer?.id
                          ? styles.win
                          : styles.loss
                      }`}
                    >
                      {partida.winner?.player?.id === currentPlayer?.id
                        ? "Vitória"
                        : "Derrota"}
                    </div>
                  </div>
                  {openAccordion === partida.id && (
                    <div className={styles.accordionContent}>
                      <h6>Jogadores na Partida:</h6>
                      <ul>
                        {partida.playerGames.map((playerGame) => (
                          <li key={playerGame.id}>
                            <strong>{playerGame.player.username}</strong>
                            {partida.winner?.player?.id === playerGame.player.id
                              ? " - Vitorioso"
                              : ""}
                          </li>
                        ))}
                      </ul>
                      <button className={styles.viewFinalStateButton} onClick={() => console.log('Ver estado final da partida', partida.id)}>
                        Ver estado final
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
            {hasMoreMatches && (
              <button
                className={styles.moreButton}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Carregando..." : "Ver mais"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isInGame) {
    return <div className={styles.overlay}>{profileContent}</div>;
  }

  return profileContent;
}