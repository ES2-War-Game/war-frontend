import { useState, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import styles from "./playerSlot.module.css";

interface PlayerSlotProps {
  borderColor: string;
  defaultName: string;
  avatar: string;
  initialType?: "Jogador" | "Desativado";
}

const PlayerSlot: React.FC<PlayerSlotProps> = ({
  borderColor,
  defaultName,
  avatar,
  initialType = "Jogador",
}) => {
  const [playerType, setPlayerType] = useState<
    "Jogador" | "CPU" | "Desativado"
  >(initialType);
  const [name, setName] = useState(defaultName);
  const [isEditing, setIsEditing] = useState(false);

  // 🔥 NOVO: Atualiza o estado quando as props mudam
  useEffect(() => {
    console.log(`🔄 PlayerSlot update:`, {
      name: defaultName,
      type: initialType,
      avatar: avatar,
      borderColor: borderColor
    });
    setName(defaultName);
    setPlayerType(initialType);
  }, [defaultName, initialType, avatar, borderColor]);

  const handleEdit = () => setIsEditing(true);

  const handleBlur = () => {
    if (name.trim() === "") setName(defaultName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleBlur();
  };

  const changeType = (direction: "next" | "prev") => {
    const types: Array<"Jogador" | "CPU" | "Desativado"> = [
      "Jogador",
      "CPU",
      "Desativado",
    ];
    const index = types.indexOf(playerType);
    let newIndex = direction === "next" ? index + 1 : index - 1;
    if (newIndex < 0) newIndex = types.length - 1;
    if (newIndex >= types.length) newIndex = 0;
    setPlayerType(types[newIndex]);
  };

  return (
    <div
      className={styles.slotContainer}
      style={{ border: `2px solid ${borderColor}` }}
    >
      <div className={styles.avatarContainer} style={{ borderColor }}>
        <img src={avatar} alt="avatar" className={styles.avatar} />
      </div>

      <div className={styles.nameContainer}>
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className={styles.nameEditable}
          />
        ) : (
          <div
            className={styles.nameDisplay}
            style={{ backgroundColor: borderColor }}
          >
            <span>{name}</span>
            <span>|</span>
            <span
              style={{ cursor: "pointer" }}
              onClick={handleEdit}
              title="Editar nome"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="white"
                className="bi bi-pencil-fill"
                viewBox="0 0 16 16"
              >
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
              </svg>
            </span>
          </div>
        )}

        <div className={styles.typeSelector}>
          <span
            className={styles.arrow}
            style={{ color: borderColor }}
            onClick={() => changeType("prev")}
            title="Anterior"
          >
            ◀
          </span>
          <span>{playerType}</span>
          <span
            className={styles.arrow}
            style={{ color: borderColor }}
            onClick={() => changeType("next")}
            title="Próximo"
          >
            ▶
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlayerSlot;
