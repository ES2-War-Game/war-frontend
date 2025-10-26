import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profileImg from "../../assets/player.png";
import styles from "./Profile.module.css";
import { useAuthStore } from "../../store/useAuthStore";

interface ProfileProps {
  isInGame?: boolean; // se estiver dentro do jogo é overlay, se não é uma página
  onClose?: () => void;
  isOwnProfile?: boolean; // Indica se é o próprio perfil para habilitar edição de nome e email
  userId?: string; // ID do usuário do perfil (para futura integração)
}

// Dados mockados para simular o backend
const mockPartidas = [
  { id: 1, jogadores: Array(6).fill({ nome: "Jogador 1", territorios: "12", resultado: "Derrota" }) },
  { id: 2, jogadores: Array(6).fill({ nome: "Jogador 2", territorios: "18", resultado: "Vitória" }) },
  { id: 3, jogadores: Array(6).fill({ nome: "Jogador 3", territorios: "8", resultado: "Derrota" }) },
  { id: 4, jogadores: Array(6).fill({ nome: "Jogador 4", territorios: "22", resultado: "Vitória" }) },
  { id: 5, jogadores: Array(6).fill({ nome: "Jogador 5", territorios: "15", resultado: "Derrota" }) },
  { id: 6, jogadores: Array(6).fill({ nome: "Jogador 6", territorios: "19", resultado: "Vitória" }) },
];

export default function Profile({ 
  isInGame = false, 
  onClose, 
  isOwnProfile = true // Por padrão assume que é o próprio perfil
}: ProfileProps) {
  const { token } = useAuthStore();       
  const navigate = useNavigate();         
  const [isEditing, setIsEditing] = useState(false);  // controla modo de edição
  const [visibleMatches, setVisibleMatches] = useState(2);  // controla quantas partidas mostrar
  const [isLoadingMore, setIsLoadingMore] = useState(false); 
    
  // Dados mockados
  const [userData, setUserData] = useState({
    nomeCompleto: "Allber Fellype",
    email: "email@email.com", 
    partidas: "15",
    vitorias: "8",
  });

  const [formData, setFormData] = useState(userData);

  const handleEditToggle = () => {
    if (isEditing) {
      // Se está cancelando a edição, reseta os dados
      setFormData(userData);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Salva os dados 
    setUserData(formData);
    setIsEditing(false);
    
    
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

  const partidasVisiveis = mockPartidas.slice(0, visibleMatches);
  const hasMoreMatches = visibleMatches < mockPartidas.length;

  const profileContent = (
    <div className={`${styles.containerProfile} ${isInGame ? styles.inGameContainer : ''}`}>
      
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
          userData.nomeCompleto
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
              userData.nomeCompleto
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
              userData.email
            )}
          </div>

          <div className={styles.infoLabel}>Número de partidas</div>
          <div className={styles.infoValue}>
            {userData.partidas} 
          </div>

          <div className={styles.infoLabel}>Vitórias</div>
          <div className={styles.infoValue}>
            {userData.vitorias} 
          </div>
        </div>
      </div>

      <div className={styles.cardSection}>
        <h4 className={styles.cardTitle}>Histórico de partidas</h4>

        {partidasVisiveis.map((partida) => (
          <div key={partida.id}>
            <h5 className={styles.matchTitle}>Partida {partida.id}</h5>
            <div className="row g-3">
              {partida.jogadores.map((jogador, idx) => (
                <div key={idx} className="col-md-6">
                  <div className={styles.playerCard}>
                    <p className={styles.playerName}>{jogador.nome}</p>
                    <p className={styles.playerDetail}>Nº de Territórios: {jogador.territorios}</p>
                    <p className={jogador.resultado === "Vitória" ? styles.playerWin : styles.playerLoss}>
                      {jogador.resultado}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

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