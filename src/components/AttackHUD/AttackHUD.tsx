import { useEffect, useState, useCallback } from "react";
import style from "./AttackHUD.module.css";

interface AllocateProps{
  allocatedArmies:number;
    ataqueNum:number
    setAtaqueNum: React.Dispatch<React.SetStateAction<number>>
    Atacar: ()=>void
    cancelarAtaque(): void
    isLoading?: boolean
}

export default function AttackHUD({ataqueNum,allocatedArmies,Atacar,setAtaqueNum,cancelarAtaque,isLoading=false}:AllocateProps) {
  const getArmies = useCallback(():number => Math.min(allocatedArmies, 3), [allocatedArmies]);
  const [max, setMax] = useState(getArmies)
  const min = 1;
  
  useEffect(()=>{
    const newMax = getArmies();
    setMax(newMax);
    // Garante que o valor atual esteja dentro do intervalo [1, newMax]
    setAtaqueNum((prev) => {
      if (prev < min) return min;
      if (prev > newMax) return newMax;
      return prev;
    });
  },[allocatedArmies, setAtaqueNum, getArmies])
  

  const handleIncrease = () => {
    setAtaqueNum((prev) => (prev < max ? prev + 1 : prev));
  };

  const handleDecrease = () => {
    setAtaqueNum((prev) => (prev > min ? prev - 1 : prev));
  };

  const prevValue = ataqueNum > min ? ataqueNum - 1 : "";
  const nextValue = ataqueNum < max ? ataqueNum + 1 : "";

  return (
    <div className={style.fortificarContainer}>
      <div className={style.titulo}>Atacar</div>
      <div className={style.botoesLinha}>
        <button className={style.botaoRed} onClick={cancelarAtaque} disabled={isLoading}>✖</button>

        <div className={style.controle}>
          <button className={style.botaoCinza} onClick={handleDecrease} disabled={isLoading}>−</button>

          <div className={style.carrossel}>
            <span className={style.numFade}>{prevValue}</span>
            <span className={style.numAtual}>{ataqueNum}</span>
            <span className={style.numFade}>{nextValue}</span>
          </div>

          <button className={style.botaoAzul} onClick={handleIncrease} disabled={isLoading}>+</button>
        </div>

        <button onClick={Atacar} className={style.botaoGreen} disabled={isLoading}>
          {isLoading ? "⏳" : "✔"}
        </button>
      </div>
    </div>
  );
}
