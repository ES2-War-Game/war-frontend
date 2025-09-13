import { useState, type KeyboardEvent, type ChangeEvent } from "react";
import styles from "./playerSlot.module.css";

interface PlayerSlotProps {
  borderColor: string;
  defaultName: string;
  avatar: string;
  initialType?: "Jogador" | "CPU" | "Desativado";
}

const PlayerSlot: React.FC<PlayerSlotProps> = ({
  borderColor,
  defaultName,
  avatar,
  initialType = "Jogador",
}) => {
  const [playerType, setPlayerType] = useState<"Jogador" | "CPU" | "Desativado">(initialType);
  const [name, setName] = useState(defaultName);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(true);

  const handleBlur = () => {
    if (name.trim() === "") setName(defaultName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleBlur();
  };

  const changeType = (direction: "next" | "prev") => {
    const types: Array<"Jogador" | "CPU" | "Desativado"> = ["Jogador", "CPU", "Desativado"];
    const index = types.indexOf(playerType);
    let newIndex = direction === "next" ? index + 1 : index - 1;
    if (newIndex < 0) newIndex = types.length - 1;
    if (newIndex >= types.length) newIndex = 0;
    setPlayerType(types[newIndex]);
  };

  return (
    <div className={styles.slotContainer} style={{ border: `2px solid ${borderColor}` }}>
      <div
        className={styles.avatarContainer}
        style={{ borderColor }}
      >
        <img
          src={avatar}
          alt="avatar"
          className={styles.avatar}
        />
      </div>

      <div className={styles.nameContainer}>
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className={styles.nameEditable}
          />
        ) : (
          <div className={styles.nameDisplay} style={{ backgroundColor: borderColor }}>
            <span>{name}</span>
            <span>|</span>
            <span style={{ cursor: "pointer" }} onClick={handleEdit} title="Editar nome">
              ✏️
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
