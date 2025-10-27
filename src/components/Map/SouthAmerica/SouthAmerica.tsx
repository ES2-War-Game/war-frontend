import style from "./SouthAmerica.module.css";
import Territory from "../Teritory/Territory";
import { SouthAmericaList } from "../../../utils/continents";



export default function SouthAmerica() {
  

  return (
    <div className={style.southAmerica}>
      {SouthAmericaList.map((territorio)=>(
        <Territory
        corClara={territorio.corClara}
        corEscura={territorio.corEscura}
        d1={territorio.d1}
        d2={territorio.d2}
        width={territorio.width}
        height={territorio.height}
        nome={territorio.nome}
        x={territorio.x}
        y={territorio.y}
        top={territorio.top}
        bottom={territorio.bottom}
        rigth={territorio.rigth}
        cx={territorio.cx}
          cy={territorio.cy}
        />
      ))}
    </div>
  );
}
