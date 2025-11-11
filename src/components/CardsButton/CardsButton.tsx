import { useState, useEffect, useRef } from "react";
import style from "./CardsButton.module.css";
import cardsIcon from "../../assets/cards.png";
import modalBackground from "../../assets/modalBackground.png";
import { useCardEvents } from "../../store/useCardEvents";
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
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCardData, setNewCardData] = useState<PlayerCard | null>(null);
  const { newCard, setNewCard } = useCardEvents();
  const modalRef = useRef<HTMLDivElement>(null);

  // Normaliza nomes de território para mapear imagens
  const normalizeTerritoryName = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

  const cardImagesByName: Record<string, string> = {};
  Object.entries(cardImagesMap).forEach(([path, mod]) => {
    const fileName = path.split("/").pop()!.replace(".png", "");
    cardImagesByName[normalizeTerritoryName(fileName)] = mod.default;
  });
  const jokerKey = Object.keys(cardImagesMap).find((key) => key.toLowerCase().includes("joker"));
  if (jokerKey) cardImagesByName["wild"] = cardImagesMap[jokerKey].default;

  const getCardImageSrc = (card?: { territory?: { name: string }; type: string }) => {
    if (!card) return null;
    if (card.type === "WILD") return cardImagesByName["wild"];
    if (card.territory?.name) return cardImagesByName[normalizeTerritoryName(card.territory.name)] || null;
    return null;
  };

  // Fecha modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  // Exibe overlay de nova carta
  useEffect(() => {
    if (newCard) {
      setNewCardData({ ...newCard });
      setShowNewCard(true);
      const timeout = setTimeout(() => {
        setShowNewCard(false);
        setNewCard(null);
        setNewCardData(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [newCard, setNewCard]);

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
            <img src={imageSrc} alt={isJoker ? "Coringa" : `${territory.name} - ${type}`} className={style.cardImage} />
          ) : (
            <div className={style.cardPlaceholder}>{isJoker ? "Coringa" : territory.name}</div>
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

  const displayedCards = playerCards.length > 0 ? playerCards : newCardData ? [newCardData] : [];

  return (
    <div>
      <button className={style.button} onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
        <div className={style.cardIcon}>
          <img src={cardsIcon} alt="Cartas" />
          <span className={style.cardCount}>{playerCards.length}</span>
        </div>
      </button>

      {open && (
        <>
          <div className={style.modal} ref={modalRef}>
            <h1>Cartas</h1>
            <img src={modalBackground} alt="Fundo" className={style.background} />
            {displayedCards.length > 0 ? (
              <>
                <div className={style.cardsGrid}>{displayedCards.slice(0, 3).map(renderCard)}</div>
                {displayedCards.length > 3 && (
                  <div className={style.cardRow}>{displayedCards.slice(3, 5).map(renderCard)}</div>
                )}
              </>
            ) : (
              <p>Você ainda não possui cartas.</p>
            )}
          </div>
          <div onClick={() => setOpen(false)} className={style.overlay}></div>
        </>
      )}

      {showNewCard && newCardData && (
        <div className={style.newCardOverlay}>
          <div className={style.newCardContainer}>
            <h2>🎴 Nova Carta Recebida!</h2>
            <div className={style.cardImageContainer}>
              {getCardImageSrc(newCardData.card) ? (
                <img
                  src={getCardImageSrc(newCardData.card)!}
                  alt={newCardData.card.type === "WILD" ? "Coringa" : `${newCardData.card.territory?.name} - ${newCardData.card.type}`}
                  className={style.newCardImage}
                />
              ) : (
                <div className={style.cardPlaceholder}>
                  {newCardData.card.type === "WILD" ? "Coringa" : newCardData.card.territory?.name}
                </div>
              )}
            </div>
            <p>{newCardData.card.type === "WILD" ? "Coringa" : newCardData.card.territory?.name}</p>
            <small className={style.cardType}>
              {newCardData.card.type === "WILD" && "Coringa"}
              {newCardData.card.type === "INFANTRY" && "Infantaria"}
              {newCardData.card.type === "CAVALRY" && "Cavalaria"}
              {newCardData.card.type === "CANNON" && "Artilharia"}
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
