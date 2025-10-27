import { useState } from "react";
import style from "./ObjectiveButton.module.css";
import objectiveButton from "../../assets/objective.png";
import objectiveBack from "../../assets/modalBackground.png";

export default function ObjectiveButton() {
  const [open, setOpen] = useState(false);
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
                sed lacus, leo. tincidunt libero, gravida lacus, enim. urna.
                elementum ultrices ipsum ex tincidunt odio tincidunt vitae placerat
                lacus, ipsum in ex Nunc vel{" "}
              </p>
            </div>
            <div onClick={()=>setOpen(!open)} className={style.fundo}></div>
        </div>
      )}
    </div>
  );
}
