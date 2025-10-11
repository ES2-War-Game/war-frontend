import style from "./Asia.module.css";
import { AsiaList } from "../../../utils/continents";
import Territory from "../Teritory/Territory";

export default function Asia() {
  
  return (
    <div className={style.Asia}>
      
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "204px",
          left: "37px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />

      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "186px",
          transform: "rotate(-15deg)",
          left: "47px", // 2px, tracejada e preta
          width: "15px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "199px",
          left: "58px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />

      {/*Mangólia */}

      {/*Japão */}

      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "-9px",
          left: "351px", // altura da bola
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
          top: "-49px",
          left: "363px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-45px",
          transform: "rotate(-40deg)",
          left: "347px", // 2px, tracejada e preta
          width: "65px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-65px",
          transform: "rotate(-0deg)",
          left: "357px", // 2px, tracejada e preta
          width: "40px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "-49px",
          left: "398px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
      {AsiaList.map((territorio) => (
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
        />
      ))}
      <div
        style={{
          position: "absolute",
          borderTop: "2px dashed #000",
          top: "-205px",
          transform: "rotate(-0deg)",
          left: "460px", // 2px, tracejada e preta
          width: "80px ", // ocupa toda a largura do container
          margin: "20px 0", // espaço acima e abaixo
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "10px", // largura da bola
          height: "10px",
          top: "-190px",
          left: "457px", // altura da bola
          backgroundColor: "black", // cor preta
          borderRadius: "50%",
          zIndex: "-1 ", // deixa redondo
        }}
      />
    </div>
  );
}
