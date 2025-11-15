import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { OrbitControls, RoundedBox, Text } from "@react-three/drei";
import { Physics, useBox } from "@react-three/cannon";
import * as THREE from "three";
import { createPortal } from "react-dom";

interface DiceProps {
  position: [number, number, number];
  throwForce?: [number, number, number];
  throwTorque?: [number, number, number];
  onRest?: (rotation: THREE.Euler) => void;
  color: string;
  value?: number; // Valor predefinido do dado (1-6)
}

function Dice({ position, throwForce, throwTorque, onRest, color, value }: DiceProps) {
  const diceSize = 42; // Dados maiores para melhor visibilidade
  
  const [, api] = useBox(() => ({
    mass: 1,
    position: position,
    args: [diceSize, diceSize, diceSize],
    material: {
      friction: 0.5,
      restitution: 0.5, // Menos quique
    },
  }));

  const meshRef = useRef<THREE.Group>(null!);
  const [hasRested, setHasRested] = useState(false);

  useEffect(() => {
    if (throwForce) {
      api.velocity.set(throwForce[0], throwForce[1], throwForce[2]);
    }
    if (throwTorque) {
      api.angularVelocity.set(throwTorque[0], throwTorque[1], throwTorque[2]);
    }
  }, [api, throwForce, throwTorque]);

  useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => {
      if (meshRef.current) {
        meshRef.current.position.set(p[0], p[1], p[2]);
      }
    });
    return unsubscribe;
  }, [api.position]);

  useEffect(() => {
    const unsubscribe = api.rotation.subscribe((r) => {
      if (meshRef.current) {
        meshRef.current.rotation.set(r[0], r[1], r[2]);
      }
    });
    return unsubscribe;
  }, [api.rotation]);

  useEffect(() => {
    const unsubscribeVel = api.velocity.subscribe((v) => {
      const speed = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
      if (speed < 0.1 && !hasRested) {
        setHasRested(true);
        if (onRest && meshRef.current) {
          onRest(meshRef.current.rotation);
        }
      }
    });
    return unsubscribeVel;
  }, [api.velocity, hasRested, onRest]);

  // Posições proporcionais ao tamanho do dado (42 unidades)
  const halfSize = diceSize / 2 + 0.01; // Metade do tamanho + pequeno offset para ficar na superfície
  
  // Se um valor predefinido foi fornecido, usamos ele em todas as faces
  const displayValue = value ? value.toString() : undefined;
  
  const faces = [
    { position: [0, 0, halfSize], rotation: [0, 0, 0], number: displayValue || "1" },
    { position: [0, 0, -halfSize], rotation: [0, Math.PI, 0], number: displayValue || "6" },
    { position: [halfSize, 0, 0], rotation: [0, Math.PI / 2, 0], number: displayValue || "3" },
    { position: [-halfSize, 0, 0], rotation: [0, -Math.PI / 2, 0], number: displayValue || "4" },
    { position: [0, halfSize, 0], rotation: [-Math.PI / 2, 0, 0], number: displayValue || "5" },
    { position: [0, -halfSize, 0], rotation: [Math.PI / 2, 0, 0], number: displayValue || "2" },
  ];

  return (
    <group ref={meshRef}>
      <RoundedBox args={[diceSize, diceSize, diceSize]} radius={0.08} smoothness={4}>
        <meshStandardMaterial 
          color={color} 
          metalness={0.3} 
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.2} // Leve brilho para destacar sobre o mapa
        />
      </RoundedBox>

      {faces.map((face, idx) => (
        <Text
          key={idx}
          position={face.position as [number, number, number]}
          rotation={face.rotation as [number, number, number]}
          fontSize={12} // Números bem maiores para melhor visibilidade
          color="#ffffff" // Branco para contraste
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.6}
          outlineColor="#000000"
          font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        >
          {face.number}
        </Text>
      ))}
    </group>
  );
}

function Floor() {
  useBox(() => ({
    type: "Static",
    position: [0, -2, 0],
    args: [853, 0.5, 480], // Chão reduzido em 1/3
  }));

  return (
    <mesh position={[0, -2, 0]} receiveShadow>
      <boxGeometry args={[853, 0.5, 480]} />
      <meshStandardMaterial color="#1a472a" transparent opacity={0.3} />
    </mesh>
  );
}

function Walls() {
  // Paredes reduzidas em 1/3
  useBox(() => ({
    type: "Static",
    position: [0, 25, -240],
    args: [853, 50, 1], // Parede traseira
  }));
  
  useBox(() => ({
    type: "Static",
    position: [0, 25, 240],
    args: [853, 50, 1], // Parede frontal
  }));
  
  useBox(() => ({
    type: "Static",
    position: [-427, 25, 0],
    args: [1, 50, 480], // Parede esquerda
  }));
  
  useBox(() => ({
    type: "Static",
    position: [427, 25, 0],
    args: [1, 50, 480], // Parede direita
  }));
  
  // Teto para evitar que dados saiam voando
  useBox(() => ({
    type: "Static",
    position: [0, 50, 0],
    args: [853, 1, 480], // Teto reduzido
  }));

  return (
    <>
      {/* Parede traseira */}
      <mesh position={[0, 25, -240]}>
        <boxGeometry args={[853, 50, 1]} />
        <meshStandardMaterial color="#ff0000" transparent opacity={0.2} />
      </mesh>
      
      {/* Parede frontal */}
      <mesh position={[0, 25, 240]}>
        <boxGeometry args={[853, 50, 1]} />
        <meshStandardMaterial color="#00ff00" transparent opacity={0.2} />
      </mesh>
      
      {/* Parede esquerda */}
      <mesh position={[-427, 25, 0]}>
        <boxGeometry args={[1, 50, 480]} />
        <meshStandardMaterial color="#0000ff" transparent opacity={0.2} />
      </mesh>
      
      {/* Parede direita */}
      <mesh position={[427, 25, 0]}>
        <boxGeometry args={[1, 50, 480]} />
        <meshStandardMaterial color="#ffff00" transparent opacity={0.2} />
      </mesh>
      
      {/* Teto */}
      <mesh position={[0, 50, 0]}>
        <boxGeometry args={[853, 1, 480]} />
        <meshStandardMaterial color="#ff00ff" transparent opacity={0.2} />
      </mesh>
    </>
  );
}

interface DiceConfig {
  key: number;
  throwForce: [number, number, number];
  throwTorque: [number, number, number];
  position: [number, number, number];
  color: string;
  type: "attacker" | "defender";
  value?: number; // Valor predefinido do dado (1-6)
}

interface BattleDiceSceneProps {
  diceConfigs: DiceConfig[];
  onResult: (value: number, index: number, type: "attacker" | "defender") => void;
}

function BattleDiceScene({ diceConfigs, onResult }: BattleDiceSceneProps) {
  const handleDiceRest = (rotation: THREE.Euler, index: number, type: "attacker" | "defender") => {
    const result = calculateTopFace(rotation);
    onResult(result, index, type);
  };

  const calculateTopFace = (rotation: THREE.Euler): number => {
    const up = new THREE.Vector3(0, 1, 0);
    const matrix = new THREE.Matrix4().makeRotationFromEuler(rotation);
    
    const faces = [
      { normal: new THREE.Vector3(0, 0, 1), value: 1 },
      { normal: new THREE.Vector3(0, 0, -1), value: 6 },
      { normal: new THREE.Vector3(1, 0, 0), value: 3 },
      { normal: new THREE.Vector3(-1, 0, 0), value: 4 },
      { normal: new THREE.Vector3(0, 1, 0), value: 5 },
      { normal: new THREE.Vector3(0, -1, 0), value: 2 },
    ];

    let maxDot = -Infinity;
    let topFace = 1;

    faces.forEach(face => {
      const transformedNormal = face.normal.clone().applyMatrix4(matrix);
      const dot = transformedNormal.dot(up);
      if (dot > maxDot) {
        maxDot = dot;
        topFace = face.value;
      }
    });

    return topFace;
  };

  return (
    <Canvas 
      camera={{ position: [0, 90, 0], fov: 60, rotation: [-Math.PI / 12, 0, 0] }} // Câmera olhando de cima
      style={{ 
        background: 'transparent',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }} 
      shadows
      orthographic // Câmera ortográfica para visão top-down
      camera-zoom={200} // Zoom bem aumentado para aproximar os dados
    >
      <ambientLight intensity={1} />
      <directionalLight position={[0, 20, 0]} intensity={2} castShadow />
      <pointLight position={[5, 15, 5]} intensity={1} />
      <pointLight position={[-5, 15, -5]} intensity={1} />
      
      <Physics gravity={[0, -35, 0]}>
        {diceConfigs.map((config, index) => (
          <Dice
            key={config.key}
            position={config.position}
            throwForce={config.throwForce}
            throwTorque={config.throwTorque}
            color={config.color}
            value={config.value}
            onRest={(rotation) => handleDiceRest(rotation, index, config.type)}
          />
        ))}
        <Floor />
        <Walls />
      </Physics>
      
      <OrbitControls 
        enabled={false}
      />
    </Canvas>
  );
}

interface BattleDiceOverlayProps {
  attackerDice: number[] | null;
  defenderDice: number[] | null;
  attackLose:number | null;
  defenseLose:number | null;
  onComplete: (attackerResults: number[], defenderResults: number[]) => void;
  attackerDiceValues?: number[]; // Valores predefinidos para os dados do atacante
  defenderDiceValues?: number[]; // Valores predefinidos para os dados do defensor
}

export default function BattleDiceOverlay({
  attackerDice,
  defenderDice,
  attackLose,
  defenseLose,
  onComplete,
  attackerDiceValues,
  defenderDiceValues,
}: BattleDiceOverlayProps) {
  const [diceConfigs, setDiceConfigs] = useState<DiceConfig[]>([]);
  const [results, setResults] = useState<{ attacker: number[], defender: number[] }>({
    attacker: [],
    defender: []
  });
  const [isRolling, setIsRolling] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Gera configurações para dados do atacante (vermelhos, à esquerda)
    // Só executa uma vez para evitar recriar dados
    if(!attackerDice || !defenderDice || hasInitialized.current) return
    
    hasInitialized.current = true; // Marca imediatamente para evitar dupla execução
    
    const uniqueId = Math.random() * 1000000;
    const attackerConfigs: DiceConfig[] = [];
    const attackerSpacing = attackerDice?.length === 1 ? 0 : 2;
    const attackerStartX = attackerDice?.length === 1 ? -3 : -3 - (attackerDice?.length - 1) * attackerSpacing / 2;
    
    for (let i = 0; i < attackerDice?.length; i++) {
      // Posição inicial com variação aleatória
      const posX = attackerStartX + i * attackerSpacing + (Math.random() - 0.5) * 4; // Variação ±2
      const posY = 6 + Math.random() * 3; // Altura inicial variável (6-9)
      const posZ = -2 + (Math.random() - 0.5) * 6; // Variação ±3 em Z
      
      // Forças completamente aleatórias em todas as direções
      const forceX = (Math.random() - 0.5) * 16; // -8 a +8
      const forceY = Math.random() * 8 + 4; // 4 a 12 (altura variável)
      const forceZ = (Math.random() - 0.5) * 16; // -8 a +8
      
      // Torque aleatório para rotação variada
      const torqueX = (Math.random() - 0.5) * 40; // -20 a +20
      const torqueY = (Math.random() - 0.5) * 40;
      const torqueZ = (Math.random() - 0.5) * 40;
      
      attackerConfigs.push({
        key: uniqueId + i,
        position: [posX, posY, posZ],
        throwForce: [forceX, forceY, forceZ],
        throwTorque: [torqueX, torqueY, torqueZ],
        color: "#DC143C",
        type: "attacker",
        value: attackerDiceValues?.[i] // Valor predefinido do dado
      });
    }

    // Gera configurações para dados do defensor (amarelos, à direita)
    const defenderConfigs: DiceConfig[] = [];
    const defenderSpacing = defenderDice.length === 1 ? 0 : 2;
    const defenderStartX = defenderDice.length === 1 ? 3 : 3 - (defenderDice.length - 1) * defenderSpacing / 2;
    
    for (let i = 0; i < defenderDice.length; i++) {
      // Posição inicial com variação aleatória
      const posX = defenderStartX + i * defenderSpacing + (Math.random() - 0.5) * 4; // Variação ±2
      const posY = 6 + Math.random() * 3; // Altura inicial variável (6-9)
      const posZ = 2 + (Math.random() - 0.5) * 6; // Variação ±3 em Z
      
      // Forças completamente aleatórias em todas as direções
      const forceX = (Math.random() - 0.5) * 16; // -8 a +8
      const forceY = Math.random() * 8 + 4; // 4 a 12 (altura variável)
      const forceZ = (Math.random() - 0.5) * 16; // -8 a +8
      
      // Torque aleatório para rotação variada
      const torqueX = (Math.random() - 0.5) * 40; // -20 a +20
      const torqueY = (Math.random() - 0.5) * 40;
      const torqueZ = (Math.random() - 0.5) * 40;
      
      defenderConfigs.push({
        key: uniqueId + attackerDice.length + i + 1000,
        position: [posX, posY, posZ],
        throwForce: [forceX, forceY, forceZ],
        throwTorque: [torqueX, torqueY, torqueZ],
        color: "#FFD700",
        type: "defender",
        value: defenderDiceValues?.[i] // Valor predefinido do dado
      });
    }

    setDiceConfigs([...attackerConfigs, ...defenderConfigs]);

    // Auto-complete após 4 segundos
    setTimeout(() => {
      setIsRolling(false);
    }, 4000);

    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attackerDice, defenderDice, attackerDiceValues, defenderDiceValues]);

  const handleDiceResult = (value: number, index: number, type: "attacker" | "defender") => {
    setResults(prev => {
      const newResults = { ...prev };
      if (type === "attacker") {
        newResults.attacker = [...prev.attacker];
        newResults.attacker[index] = value;
      } else {
        newResults.defender = [...prev.defender];
        newResults.defender[index] = value;
      }
      return newResults;
    });
  };

  useEffect(() => {
    if (!isRolling) {
      // Após os dados pararem, chama onComplete com os valores predefinidos
      const attackerResults = attackerDiceValues || results.attacker;
      const defenderResults = defenderDiceValues || results.defender;
      
      setTimeout(() => {
        onComplete(attackerResults, defenderResults);
      }, 1000); // Delay antes de fechar
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRolling]);

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 3000,
      pointerEvents: 'none', // Permite interação com o mapa abaixo
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}>
        <BattleDiceScene 
          diceConfigs={diceConfigs}
          onResult={handleDiceResult}
        />

        {/* HUD de informações */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '40px',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '20px 40px',
          borderRadius: '16px',
          border: '2px solid rgba(244, 67, 54, 0.5)',
          pointerEvents: 'auto', // HUD pode receber cliques
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '14px', 
              color: '#DC143C', 
              fontWeight: 'bold',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              ⚔️ Atacante
            </div>
            <div style={{ fontSize: '24px', color: '#fff', fontWeight: '900' }}>
              {attackerDice?.length} {attackerDice?.length === 1 ? 'dado' : 'dados'}
            </div>
            <div style={{ fontSize: '14px', color: '#aaa', marginTop: '4px' }}>
              Perdeu: {attackLose}
            </div>
          </div>

          <div style={{ 
            width: '2px', 
            height: '60px', 
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)' 
          }}></div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '14px', 
              color: '#FFD700', 
              fontWeight: 'bold',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              🛡️ Defensor
            </div>
            <div style={{ fontSize: '24px', color: '#fff', fontWeight: '900' }}>
              {defenderDice?.length} {defenderDice?.length === 1 ? 'dado' : 'dados'}
            </div>
            <div style={{ fontSize: '14px', color: '#aaa', marginTop: '4px' }}>
              Perdeu: {defenseLose}
            </div>
          </div>
        </div>

        {/* Indicador de rolagem */}
        {isRolling && (
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            animation: 'pulse 1.5s ease-in-out infinite',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '10px 20px',
            borderRadius: '8px',
            pointerEvents: 'auto',
          }}>
            🎲 Rolando dados...
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translateX(-50%) scale(1.05);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
