import { Link } from "react-router-dom";
import PlayerSlot from "../../components/PlayerSlot/playerSlot";
import style from "./gamesetup.module.css";

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
          avatar="/avatars/knight-blue.png"
        />
        <PlayerSlot
          borderColor="red"
          defaultName="Jogador vermelho"
          avatar="/avatars/knight-red.png"
        />
        <PlayerSlot
          borderColor="green"
          defaultName="Jogador verde"
          avatar="/avatars/knight-green.png"
          initialType="CPU"
        />
        <PlayerSlot
          borderColor="yellow"
          defaultName="Jogador amarelo"
          avatar="/avatars/knight-yellow.png"
        />
        <PlayerSlot
          borderColor="purple"
          defaultName="Jogador roxo"
          avatar="/avatars/knight-purple.png"
          initialType="Desativado"
        />
        <PlayerSlot
          borderColor="black"
          defaultName="Jogador preto"
          avatar="/avatars/knight-black.png"
          initialType="CPU"
        />
      </div>

      <div className={style.buttons}>
        <Link to="/" className={`${style.btn} ${style["btn-voltar"]}`}>
          Voltar
        </Link>
        <button className={style.btn}>Começar Jogo</button>
      </div>
    </div>
  );
};

export default GameSetupPage;
