import { useState } from "react";
import style from "./ObjectiveButton.module.css";
import objectiveButton from "../../assets/objective.png";
import objectiveBack from "../../assets/modalBackground.png";
import { useGameStore } from "../../store/useGameStore";

export default function ObjectiveButton() {
  const [open, setOpen] = useState(false);
  // get the authenticated user id (reactive)
  const userObjective = useGameStore((o)=>o.player?.objective.description)
  // pick the objective description for the authenticated user (reactive)
 
  return (
    <div >
      {!open ? (
        <button className={style.button} onClick={()=>setOpen(!open)}>
          <img src={objectiveButton} alt="" />
        </button>
      ) : (
        <div>
            <div className={style.modal}>
              <h1>Objetivo</h1>
              <img src={objectiveBack} alt="" />
              <p>
                {userObjective}
              </p>
            </div>
            <div onClick={()=>setOpen(!open)} className={style.fundo}></div>
        </div>
      )}
    </div>
  );
}
