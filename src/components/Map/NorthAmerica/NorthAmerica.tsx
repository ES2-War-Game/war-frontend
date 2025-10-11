import style from "./NorthAmerica.module.css";
import { NorthAmericaList } from "../../../utils/continents";
import Territory from "../Teritory/Territory";

export default function NorthAmerica() {
  

  return (
    <div className={style.NorthAmerica}>
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-105px",
          transform: "rotate(-0deg)",
          left: "-190px", // 2px, tracejada e preta
          width: "80px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "-89px",
          left: "-115px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      {NorthAmericaList.map((territorio) => (
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
          left={territorio.left}
          rigth={territorio.rigth}
        />
      ))}

      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-118px",
          transform: "rotate(-60deg)",
          left: "175px", // 2px, tracejada e preta
          width: "65px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-104px",
          transform: "rotate(-40deg)",
          left: "106px", // 2px, tracejada e preta
          width: "134px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-141px",
          transform: "rotate(-10deg)",
          left: "160px", // 2px, tracejada e preta
          width: "65px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "8px", // largura da bola
          height: "8px",
          top: "-130px",
          left: "220px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "8px", // largura da bola
          height: "8px",
          top: "-119px",
          left: "157px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "8px", // largura da bola
          height: "8px",
          top: "-44px",
          left: "117px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "8px", // largura da bola
          height: "8px",
          top: "-77px",
          left: "189px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
    </div>
  );
}
