import { useEffect, useState, useCallback } from "react";
import style from "./MoveHUD.module.css";
import { useMovementStore } from "../../store/useMovementStore";

interface AllocateProps {
  allocatedArmies: number;
  moveNum: number;
  setMoveNum: React.Dispatch<React.SetStateAction<number>>;
  Mover: () => void;
  cancelarMove(): void;
  isLoading?: boolean;
}

export default function MoveHUD({
  moveNum,
  allocatedArmies,
  Mover,
  setMoveNum,
  cancelarMove,
  isLoading = false,
}: AllocateProps) {
  const getArmies = useCallback(
    (): number => Math.min(allocatedArmies),
    [allocatedArmies]
  );
  const setMoveCount = useMovementStore.getState().setMoveCount;
  const [max, setMax] = useState(getArmies);
  const min = 1;

  useEffect(() => {
    const newMax = getArmies();
    setMax(newMax);
    // Garante que o valor atual esteja dentro do intervalo [1, newMax]
    setMoveNum((prev) => {
      if (prev < min) return min;
      if (prev > newMax) return newMax;
      return prev;
    });
  }, [allocatedArmies, setMoveNum, getArmies]);

  useEffect(()=>{
    setMoveCount(1)
  },[])

  const handleIncrease = () => {
    setMoveNum((prev) => (prev < max ? prev + 1 : prev));
  };

  const handleDecrease = () => {
    setMoveNum((prev) => (prev > min ? prev - 1 : prev));
  };

  const prevValue = moveNum > min ? moveNum - 1 : "";
  const nextValue = moveNum < max ? moveNum + 1 : "";

  return (
    <div className={style.fortificarContainer}>
      <div className={style.titulo}>MOVER</div>
      <div className={style.botoesLinha}>
        <button
          className={style.botaoRed}
          onClick={cancelarMove}
          disabled={isLoading}
        >
          ✖
        </button>

        <div className={style.controle}>
          <button
            className={style.botaoCinza}
            onClick={handleDecrease}
            disabled={isLoading}
          >
            −
          </button>

          <div className={style.carrossel}>
            <span className={style.numFade}>{prevValue}</span>
            <span className={style.numAtual}>{moveNum}</span>
            <span className={style.numFade}>{nextValue}</span>
          </div>

          <button
            className={style.botaoAzul}
            onClick={handleIncrease}
            disabled={isLoading}
          >
            +
          </button>
        </div>

        <button
          onClick={Mover}
          className={style.botaoGreen}
          disabled={isLoading}
        >
          {isLoading ? "⏳" : "✔"}
        </button>
      </div>
    </div>
  );
}
