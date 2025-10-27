import { OceaniaList } from "../../../utils/continents";
import Territory from "../Teritory/Territory";
import style from "./Oceania.module.css";

export default function Oceania() {
  return (
    <div className={style.Oceania}>
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "-125px",
          left: "-19px", // altura da bola
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
          top: "-66px",
          left: "-1px", // altura da bola
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
          top: "-111px",
          left: "-112px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-94px",
          transform: "rotate(52deg)",
          left: "-117px", // 2px, tracejada e preta
          width: "70px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "-60px",
          left: "-72px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-113px",
          transform: "rotate(72deg)",
          left: "-36px", // 2px, tracejada e preta
          width: "60px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "-35px",
          left: "80px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-35px",
          transform: "rotate(-70deg)",
          left: "47px", // 2px, tracejada e preta
          width: "65px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-40px",
          transform: "rotate(-30deg)",
          left: "37px", // 2px, tracejada e preta
          width: "60px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "-8px",
          left: "35px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-10px",
          transform: "rotate(42deg)",
          left: "36px", // 2px, tracejada e preta
          width: "40px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "15px",
          left: "62px", // altura da bola
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
          top: "55px",
          left: "10px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "24px",
          transform: "rotate(52deg)",
          left: "-32px", // 2px, tracejada e preta
          width: "70px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "15px",
          left: "-20px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      {OceaniaList.map((territorio) => (
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
          bottom={territorio.bottom}
          cx={territorio.cx}
          cy={territorio.cy}
        />
      ))}
    </div>
  );
}
