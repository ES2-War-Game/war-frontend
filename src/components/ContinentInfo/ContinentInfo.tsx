import { useState } from "react";
import styles from "./ContinentInfo.module.css";
import AfricaImg from "../../assets/Africa.png";
import AsiaImg from "../../assets/Asia.png";
import EuropeImg from "../../assets/Europe.png";
import NorthAmericaImg from "../../assets/NorthAmerica.png";
import OceaniaImg from "../../assets/Oceania.png";
import SouthAmericaImg from "../../assets/SouthAmerica.png";

interface Continent {
  name: string;
  bonus: number;
  image: string;
}

const continents: Continent[] = [
  { name: "América do Sul", bonus: 2, image: SouthAmericaImg },
  { name: "América do Norte", bonus: 5, image: NorthAmericaImg },
  { name: "Europa", bonus: 5, image: EuropeImg },
  { name: "África", bonus: 3, image: AfricaImg },
  { name: "Ásia", bonus: 7, image: AsiaImg },
  { name: "Oceania", bonus: 2, image: OceaniaImg },
];

export default function ContinentInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botão de informação */}
      <button
        className={styles.infoButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Bônus de Continentes"
      >
        <span className={styles.infoIcon}>ⓘ</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className={styles.overlay}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal de conteúdo */}
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2 className={styles.title}>Bônus de Continentes</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.continentsGrid}>
              {continents.map((continent) => (
                <div key={continent.name} className={styles.continentCard}>
                  <div className={styles.imageContainer}>
                    <img
                      src={continent.image}
                      alt={continent.name}
                      className={styles.continentImage}
                    />
                  </div>
                  <div className={styles.continentInfo}>
                    <h3 className={styles.continentName}>{continent.name}</h3>
                    <p className={styles.bonus}>
                      +{continent.bonus} {continent.bonus === 1 ? "soldado" : "soldados"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
