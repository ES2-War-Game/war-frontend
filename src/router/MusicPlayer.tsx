import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSettingsStore } from "../store/useSettingsStore";
import freedom from "../assets/trilha/price-of-freedom.mp3";
import music from "../assets/trilha/war_music.mp3";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const location = useLocation();
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);

  useEffect(() => {
    if (!audioRef.current) return;

    let src;

    // Define música por página
    switch (location.pathname) {
      case '/':
      case '/jogadores':
        src = music;
        break;
      case '/login':
      case '/register':
        src = freedom;
        break;
      default:
        src = null;
    }

    if (src && musicEnabled) {
      // Troca apenas se for diferente da atual
      if (audioRef.current.src !== window.location.origin + src) {
        audioRef.current.src = src;
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => {
          console.log('Autoplay bloqueado, aguarde interação do usuário');
        });
      } else if (audioRef.current.paused) {
        // Se já tem a música certa mas está pausada, toca
        audioRef.current.play().catch(() => {
          console.log('Autoplay bloqueado, aguarde interação do usuário');
        });
      }
    } else {
      audioRef.current.pause();
      if (!musicEnabled) {
        // Mantém o src quando desabilitado para poder retomar depois
      } else {
        audioRef.current.src = '';
      }
    }
  }, [location.pathname, musicEnabled]);

  return <audio ref={audioRef} />;
}