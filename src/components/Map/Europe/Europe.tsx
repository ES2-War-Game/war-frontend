import style from "./Europe.module.css";
import { EuropeList } from "../../../utils/continents";
import Territory from "../../Teritory/Territory";

export default function Europe() {
  return (
    <div className={style.Europe}>
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "8px",
          transform: "rotate(35deg)",
          left: "-2px", // 2px, tracejada e preta
          width: "42px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "14px",
          left: "1px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "35px",
          left: "30px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />

      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "108px",
          transform: "rotate(-85deg)",
          left: "80px", // 2px, tracejada e preta
          width: "70px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "72px",
          left: "71px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "106px",
          left: "53px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "89px",
          left: "113px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "158px",
          left: "105px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "118px",
          transform: "rotate(45deg)",
          left: "45px", // 2px, tracejada e preta
          width: "75px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "82px",
          transform: "rotate(-15deg)",
          left: "55px", // 2px, tracejada e preta
          width: "65px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "72px",
          transform: "rotate(-60deg)",
          left: "47px", // 2px, tracejada e preta
          width: "37px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "64px",
          transform: "rotate(25deg)",
          left: "75px", // 2px, tracejada e preta
          width: "45px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "8px", // largura da bola
          height: "8px",
          top: "182px",
          left: "48px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "172px",
          transform: "rotate(-130deg)",
          left: "45px", // 2px, tracejada e preta
          width: "25px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "8px", // largura da bola
          height: "8px",
          top: "199px",
          left: "62px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      {EuropeList.map((territorio) => (
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
          cx={territorio.cx}
          cy={territorio.cy}
        />
      ))}
    </div>
  );
}
