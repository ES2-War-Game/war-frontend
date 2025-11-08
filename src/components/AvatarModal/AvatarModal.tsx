import React from "react";
import styles from "./AvatarModal.module.css";

// Placeholder avatars - replace with your actual avatar imports
import avatar1 from "../../assets/avatar1.jpg";
import avatar2 from "../../assets/avatar2.jpg";
import avatar3 from "../../assets/avatar3.jpg";
import avatar4 from "../../assets/avatar4.jpg";
import avatar5 from "../../assets/avatar5.jpg";
import avatar6 from "../../assets/avatar6.jpg";
import defaultPlayerAvatar from "../../assets/player.png"; // Renamed for clarity

const avatars = [
  { id: "defaultPlayerAvatar", src: defaultPlayerAvatar },
  { id: "avatar1", src: avatar1 },
  { id: "avatar2", src: avatar2 },
  { id: "avatar3", src: avatar3 },
  { id: "avatar4", src: avatar4 },
  { id: "avatar5", src: avatar5 },
  { id: "avatar6", src: avatar6 },
];

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (avatarSrc: string) => void;
}

export default function AvatarModal({
  isOpen,
  onClose,
  onSelectAvatar,
}: AvatarModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <h2>Escolha seu Avatar</h2>
        <div className={styles.avatarGrid}>
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={styles.avatarItem}
              onClick={() => onSelectAvatar(avatar.src)}
            >
              <img src={avatar.src} alt={`Avatar ${avatar.id}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
