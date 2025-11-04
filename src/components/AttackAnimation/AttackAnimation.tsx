import { useEffect, useState, useRef } from "react";
import { useAttackAnimationStore } from "../../store/useAttackAnimationStore";
import styles from "./AttackAnimation.module.css";

export default function AttackAnimation() {
  const { isAnimating, attackerPosition, defenderPosition, mapTransform, animationCount } =
    useAttackAnimationStore();
  const [localAnimating, setLocalAnimating] = useState(false);
  const [localAttacker, setLocalAttacker] = useState<{ x: number; y: number } | null>(null);
  const [localDefender, setLocalDefender] = useState<{ x: number; y: number } | null>(null);
  const [localTransform, setLocalTransform] = useState<{ x: number; y: number; zoom: number } | null>(null);
  const [projectiles, setProjectiles] = useState<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const lastAnimationCountRef = useRef(0);

  useEffect(() => {
    // Só executa se o contador mudou (nova animação)
    if (animationCount === lastAnimationCountRef.current) {
      return;
    }
    
    lastAnimationCountRef.current = animationCount;

    // Limpa timer anterior se existir
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isAnimating && attackerPosition && defenderPosition && animationCount > 0) {
      console.log("🎮 ========== ANIMATION STARTED (Count:", animationCount, ") ==========");
      console.log("📍 Attacker position (SVG):", attackerPosition);
      console.log("📍 Defender position (SVG):", defenderPosition);
      console.log("🗺️ Map transform:", mapTransform);
      
      // Salva posições localmente para manter durante toda a animação
      setLocalAnimating(true);
      setLocalAttacker(attackerPosition);
      setLocalDefender(defenderPosition);
      setLocalTransform(mapTransform);
      setProjectiles([0, 1, 2]);

      console.log("✅ Local state set - animation will run for 2 seconds");

      // ⏱️ Mantém animação visível por 2 segundos COMPLETOS
      timerRef.current = window.setTimeout(() => {
        console.log("⏹️ ========== ANIMATION COMPLETE (2s) ==========");
        setLocalAnimating(false);
        setProjectiles([]);
        setLocalAttacker(null);
        setLocalDefender(null);
        setLocalTransform(null);
        timerRef.current = null;
      }, 2000);
    }

    return () => {
      if (timerRef.current) {
        console.log("🧹 Cleanup timer");
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [animationCount, isAnimating, attackerPosition, defenderPosition, mapTransform]);

  // Usa estado local para manter animação visível mesmo após store limpar
  if (!localAnimating || !localAttacker || !localDefender) {
    return null;
  }

  // Aplica a transformação do mapa às coordenadas
  const transform = localTransform || { x: 0, y: 0, zoom: 1 };
  
  // Ajusta posições considerando o offset do mapa (Map.tsx usa top:140px, left:160px)
  const MAP_OFFSET_X = 160;
  const MAP_OFFSET_Y = 140;
  
  const attackerX = localAttacker.x * transform.zoom + transform.x + MAP_OFFSET_X;
  const attackerY = localAttacker.y * transform.zoom + transform.y + MAP_OFFSET_Y;
  const defenderX = localDefender.x * transform.zoom + transform.x + MAP_OFFSET_X;
  const defenderY = localDefender.y * transform.zoom + transform.y + MAP_OFFSET_Y;

  console.log("📍 Final screen positions:", {
    svgAttacker: localAttacker,
    svgDefender: localDefender,
    transform,
    screenAttacker: { x: attackerX, y: attackerY },
    screenDefender: { x: defenderX, y: defenderY }
  });

  // Calcula o ângulo entre atacante e defensor
  const dx = defenderX - attackerX;
  const dy = defenderY - attackerY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const distance = Math.sqrt(dx * dx + dy * dy);

  return (
    <div className={styles.container}>
      {projectiles.map((index) => (
        <div
          key={`projectile-${animationCount}-${index}`}
          className={styles.projectile}
          style={{
            left: `${attackerX}px`,
            top: `${attackerY}px`,
            transform: `rotate(${angle}deg)`,
            animationDelay: `${index * 0.15}s`,
            "--target-x": `${dx}px`,
            "--target-y": `${dy}px`,
            "--distance": `${distance}px`,
          } as React.CSSProperties}
        >
          <div className={styles.projectileInner}>⚔️</div>
        </div>
      ))}
      
      {/* Efeito de explosão no defensor */}
      <div
        className={styles.impact}
        style={{
          left: `${defenderX}px`,
          top: `${defenderY}px`,
        }}
      >
        💥
      </div>
    </div>
  );
}
