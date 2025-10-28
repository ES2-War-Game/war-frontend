import { useEffect, useState } from "react";
import { useAllocateStore } from "../../store/useAllocate";
import style from "./AllocateHUD.module.css";

interface AllocateProps{
    alocaNum:number
    setAlocaNum: React.Dispatch<React.SetStateAction<number>>
    AlocarTropa: ()=>void
}

export default function AllocateHUD({alocaNum,AlocarTropa,setAlocaNum}:AllocateProps) {
  const armies = useAllocateStore.getState().unallocatedArmies
  const [max, setMax] = useState(armies)
  const min = 1;
  useEffect(()=>{
    setMax(armies)
  },[armies])
  

  const handleIncrease = () => {
    setAlocaNum((prev) => (prev < max ? prev + 1 : prev));
  };

  const handleDecrease = () => {
    setAlocaNum((prev) => (prev > min ? prev - 1 : prev));
  };

  const prevValue = alocaNum > min ? alocaNum - 1 : "";
  const nextValue = alocaNum < max ? alocaNum + 1 : "";

  return (
    <div className={style.fortificarContainer}>
      <div className={style.titulo}>Fortificar</div>
      <div className={style.botoesLinha}>
        <button className={style.botaoRed}>✖</button>

        <div className={style.controle}>
          <button className={style.botaoCinza} onClick={handleDecrease}>−</button>

          <div className={style.carrossel}>
            <span className={style.numfade}>{prevValue}</span>
            <span className={style.numAtual}>{alocaNum}</span>
            <span className={style.numFade}>{nextValue}</span>
          </div>

          <button className={style.botaoAzul} onClick={handleIncrease}>+</button>
        </div>

        <button onClick={AlocarTropa} className={style.botaoGreen}>✔</button>
      </div>
    </div>
  );
}
