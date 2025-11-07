import style from "./Africa.module.css";
import Territory from "../../Teritory/Territory";
import { AfricaList } from "../../../utils/continents";
import { createPortal } from "react-dom";

export default function Africa() {
  return (
    <div id="africa-container" className={style.Africa}>
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "102px",
          left: "-41px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "80px",
          transform: "rotate(-20deg)",
          left: "-37px", // 2px, tracejada e preta
          width: "45px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "88px",
          left: "-1px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      

      {/*Égito */}
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "0px",
          left: "139px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-4px",
          transform: "rotate(80deg)",
          left: "134px", // 2px, tracejada e preta
          width: "24px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "24px",
          left: "144px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      

      {AfricaList.map((territorio) => (
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
          fronteiras={territorio.fronteiras}
        />
      ))}
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "202px",
          left: "238px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          transform: "rotate(50deg)",
          top: "219px",
          left: "232px", // 2px, tracejada e preta
          width: "75px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          transform: "rotate(0deg)",
          top: "242px",
          left: "232px", // 2px, tracejada e preta
          width: "75px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "259px",
          left: "237px",  // altura da bola
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
          top: "259px",
          left: "285px",  // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />

      {createPortal(
        <svg
          width="150"
          height="15"
          style={{
            position: "absolute",
            top: `270px`,
            left: `230px`,
            zIndex: 10000,
            pointerEvents: "none",
          }}
        >
          <text
            x="54"
            y="10"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fontFamily="TrajanPro, Arial, sans-serif"
            fontWeight="bold"
            fill="white"
            style={{
              pointerEvents: "none",
              userSelect: "none",
              paintOrder: "stroke",
              stroke: "black",
              strokeWidth: "2px",
              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.6))",
            }}
          >
            MADAGASCAR
          </text>
        </svg>,
        document.getElementById("africa-container") || document.body
      )}
      
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-15px",
          transform: "rotate(70deg)",
          left: "40px", // 2px, tracejada e preta
          width: "21px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "-7px",
          left: "43px", // altura da bola
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
          top: "9px",
          left: "48px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
    </div>
  );
}
