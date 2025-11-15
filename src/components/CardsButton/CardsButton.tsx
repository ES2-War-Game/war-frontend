import { useState, useEffect, useRef } from "react";
import style from "./CardsButton.module.css";
import cardsIcon from "../../assets/cards.png";
import modalBackground from "../../assets/modalBackground.png";
import type { PlayerCard } from "../../types/game";

interface CardsButtonProps {
  playerCards?: PlayerCard[];
}

const cardImagesMap: Record<string, { default: string }> = import.meta.glob(
  "../../assets/cards/*.png",
  { eager: true }
) as Record<string, { default: string }>;

export default function CardsButton({ playerCards = [] }: CardsButtonProps) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Mapeia nomes de arquivos das cartas
  const cardImagesByName: Record<string, string> = {};
  Object.entries(cardImagesMap).forEach(([path, mod]) => {
    const fileName = path.split("/").pop()!;
    cardImagesByName[fileName] = mod.default;
  });

  const jokerKey = Object.keys(cardImagesMap).find((key) =>
    key.toLowerCase().includes("joker")
  );
  if (jokerKey) cardImagesByName["wild"] = cardImagesMap[jokerKey].default;

  const getCardImageSrc = (card?: { imageName?: string; type: string }) => {
    if (!card || !card.imageName) return null;
    return cardImagesByName[card.imageName] || null;
  };

  // Fecha modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const renderCard = (playerCard: PlayerCard) => {
    const { card } = playerCard;
    const { territory, type } = card;
    if (!territory && type !== "WILD") return null;
    const imageSrc = getCardImageSrc(card);
    const isJoker = type === "WILD";

    return (
      <div key={playerCard.id} className={style.card}>
        <div className={style.cardImageContainer}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={isJoker ? "Coringa" : `${territory.name} - ${type}`}
              className={style.cardImage}
            />
          ) : (
            <div className={style.cardPlaceholder}>
              {isJoker ? "Coringa" : territory.name}
            </div>
          )}
        </div>
        <p>{isJoker ? "Coringa" : territory.name}</p>
        <small className={style.cardType}>
          {isJoker && "Coringa"}
          {type === "INFANTRY" && "Infantaria"}
          {type === "CAVALRY" && "Cavalaria"}
          {type === "CANNON" && "Artilharia"}
        </small>
      </div>
    );
  };

  return (
    <div>
      <button
        className={style.button}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <div className={style.cardIcon}>
          <img src={cardsIcon} alt="Cartas" />
          <span className={style.cardCount}>{Math.min(playerCards.length, 5)}</span>
        </div>
      </button>

      {open && (
        <>
          <div className={style.modal} ref={modalRef}>
            <h1>Cartas</h1>
            <img src={modalBackground} alt="Fundo" className={style.background} />
            {playerCards.length > 0 ? (
              <>
                <div className={style.cardsGrid}>{playerCards.slice(0, 3).map(renderCard)}</div>
                {playerCards.length > 3 && (
                  <div className={style.cardRow}>{playerCards.slice(3, 5).map(renderCard)}</div>
                )}
              </>
            ) : (
              <p>Você ainda não possui cartas.</p>
            )}
          </div>
          <div onClick={() => setOpen(false)} className={style.overlay}></div>
        </>
      )}
    </div>
  );
}
