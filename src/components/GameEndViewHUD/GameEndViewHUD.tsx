import styles from "./GameEndViewHUD.module.css";

interface GameEndViewHUDProps {
  onBackToModal: () => void;
}

export default function GameEndViewHUD({ onBackToModal }: GameEndViewHUDProps) {
  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <span className={styles.info}>
          🏆 Jogo Finalizado - Visualizando Estado Final
        </span>
        <button 
          className={styles.backButton}
          onClick={onBackToModal}
        >
          📊 Ver Resultado
        </button>
      </div>
    </div>
  );
}
