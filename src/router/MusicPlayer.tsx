import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import freedom from "../assets/trilha/price-of-freedom.mp3";
import music from "../assets/trilha/war_music.mp3";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const location = useLocation();

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

    if (src) {
      // Troca apenas se for diferente da atual
      if (audioRef.current.src !== window.location.origin + src) {
        audioRef.current.src = src;
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => {
          console.log('Autoplay bloqueado, aguarde interação do usuário');
        });
      }
    } else {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, [location.pathname]);

  return <audio ref={audioRef} />;
}