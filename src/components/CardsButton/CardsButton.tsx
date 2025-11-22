import { useState, useEffect, useRef } from "react";
import style from "./CardsButton.module.css";
import cardsIcon from "../../assets/cards.png";
import modalBackground from "../../assets/modalBackground.png";
import type { PlayerCard } from "../../types/game";
import { gameService } from "../../service/gameService";
import { useGameStore } from "../../store/useGameStore";

interface CardsButtonProps {
  playerCards?: PlayerCard[];
}

const cardImagesMap: Record<string, { default: string }> = import.meta.glob(
  "../../assets/cards/*.png",
  { eager: true }
) as Record<string, { default: string }>;

export default function CardsButton({ playerCards = [] }: CardsButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isTrading, setIsTrading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const gameId = useGameStore((s) => s.gameId);

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

  // Limpa seleção ao abrir/fechar modal
  useEffect(() => {
    if (!open) {
      setSelectedCards([]);
    }
  }, [open]);

  const handleCardClick = (cardId: number) => {
    setSelectedCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length < 3) {
        return [...prev, cardId];
      }
      return prev;
    });
  };

  const handleTradeCards = async () => {
    if (selectedCards.length !== 3 || !gameId || isTrading) return;

    setIsTrading(true);
    try {
      await gameService.tradeCards(gameId, selectedCards);
      setSelectedCards([]);
      setOpen(false);
      // O WebSocket atualizará automaticamente o estado do jogo
    } catch (error: any) {
      console.error("❌ Erro ao trocar cartas:", error);
      alert(error?.response?.data || "Erro ao trocar cartas. Verifique se é sua vez e a fase correta.");
    } finally {
      setIsTrading(false);
    }
  };

  const renderCard = (playerCard: PlayerCard) => {
    const { card } = playerCard;
    const { territory, type } = card;
    if (!territory && type !== "WILD") return null;
    const imageSrc = getCardImageSrc(card);
    const isJoker = type === "WILD";
    const isSelected = selectedCards.includes(playerCard.id);

    return (
      <div 
        key={playerCard.id} 
        className={`${style.card} ${isSelected ? style.cardSelected : ''}`}
        onClick={() => handleCardClick(playerCard.id)}
      >
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
        {isSelected && <div className={style.selectedBadge}>✓</div>}
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
                {playerCards.length >= 3 && (
                  <div className={style.tradeSection}>
                    <p className={style.tradeHint}>
                      Selecione 3 cartas para trocar por tropas ({selectedCards.length}/3)
                    </p>
                    <button
                      className={style.tradeButton}
                      onClick={handleTradeCards}
                      disabled={selectedCards.length !== 3 || isTrading}
                    >
                      {isTrading ? "Trocando..." : "Trocar Cartas"}
                    </button>
                  </div>
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
