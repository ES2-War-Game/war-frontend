import { Link } from "react-router-dom";
import PlayerSlot from "../../components/PlayerSlot/playerSlot";
import style from "./gameSetup.module.css";
import player from "../../assets/player.png"

const GameSetupPage: React.FC = () => {
  return (
    <div className={style.container}>
      <h1 className="text-white fw-bold mb-5">
        SELECIONE OS JOGADORES PARA INICIAR A PARTIDA
      </h1>

      <div className={style.playersGrid}>
        <PlayerSlot
          borderColor="blue"
          defaultName="Jogador azul"
          avatar={player}
        />
        <PlayerSlot
          borderColor="red"
          defaultName="Jogador vermelho"
          avatar={player}
        />
        <PlayerSlot
          borderColor="green"
          defaultName="Jogador verde"
          avatar={player}
          initialType="CPU"
        />
        <PlayerSlot
          borderColor="#bfa640" // amarelo escuro
          defaultName="Jogador amarelo"
          avatar={player}
        />
        <PlayerSlot
          borderColor="purple"
          defaultName="Jogador roxo"
          avatar={player}
          initialType="Desativado"
        />
        <PlayerSlot
          borderColor="black"
          defaultName="Jogador preto"
          avatar={player}
          initialType="CPU"
        />
      </div>

      <div className={style.buttons}>
        <Link to="/" className={`${style.btn} ${style["btn-voltar"]}`}>
          Voltar
        </Link>
        <Link to="/game" className={style.btn}>Começar Jogo</Link>
      </div>
    </div>
  );
};

export default GameSetupPage;
