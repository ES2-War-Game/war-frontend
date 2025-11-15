import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { OrbitControls, RoundedBox, Text } from "@react-three/drei";
import { Physics, useBox } from "@react-three/cannon";
import * as THREE from "three";

interface DiceProps {
  position: [number, number, number];
  throwForce?: [number, number, number];
  throwTorque?: [number, number, number];
  onRest?: (rotation: THREE.Euler) => void;
}

function Dice({ position, throwForce, throwTorque, onRest }: DiceProps) {
  const [, api] = useBox(() => ({
    mass: 1,
    position: position,
    args: [1, 1, 1],
    material: {
      friction: 0.4,
      restitution: 0.6,
    },
  }));

  const meshRef = useRef<THREE.Group>(null!);
  const [hasRested, setHasRested] = useState(false);

  // Aplica a força de lançamento assim que o dado é criado
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

  // Detecta quando o dado para de se mover
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

  // Faces do dado com números
  const faces = [
    { position: [0, 0, 0.51], rotation: [0, 0, 0], number: "1" },
    { position: [0, 0, -0.51], rotation: [0, Math.PI, 0], number: "6" },
    { position: [0.51, 0, 0], rotation: [0, Math.PI / 2, 0], number: "3" },
    { position: [-0.51, 0, 0], rotation: [0, -Math.PI / 2, 0], number: "4" },
    { position: [0, 0.51, 0], rotation: [-Math.PI / 2, 0, 0], number: "5" },
    { position: [0, -0.51, 0], rotation: [Math.PI / 2, 0, 0], number: "2" },
  ];

  return (
    <group ref={meshRef}>
      {/* Corpo do dado com cantos arredondados - AMARELO */}
      <RoundedBox args={[1, 1, 1]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#FFD700" metalness={0.2} roughness={0.4} />
      </RoundedBox>

      {/* Números em cada face - PRETO */}
      {faces.map((face, idx) => (
        <Text
          key={idx}
          position={face.position as [number, number, number]}
          rotation={face.rotation as [number, number, number]}
          fontSize={0.3}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        >
          {face.number}
        </Text>
      ))}
    </group>
  );
}

// Chão para os dados quicarem
function Floor() {
  useBox(() => ({
    type: "Static",
    position: [0, -3, 0],
    args: [20, 1, 20],
  }));

  return (
    <mesh position={[0, -3, 0]} receiveShadow>
      <boxGeometry args={[20, 1, 20]} />
      <meshStandardMaterial color="#2d5a3d" transparent opacity={0.3} />
    </mesh>
  );
}

// Paredes invisíveis para conter os dados
function Walls() {
  // Parede traseira
  useBox(() => ({
    type: "Static",
    position: [0, 2, -6],
    args: [12, 10, 0.5],
  }));
  
  // Parede frontal
  useBox(() => ({
    type: "Static",
    position: [0, 2, 6],
    args: [12, 10, 0.5],
  }));
  
  // Parede esquerda
  useBox(() => ({
    type: "Static",
    position: [-6, 2, 0],
    args: [0.5, 10, 12],
  }));
  
  // Parede direita
  useBox(() => ({
    type: "Static",
    position: [6, 2, 0],
    args: [0.5, 10, 12],
  }));
  
  // Teto (opcional, para evitar que dados saiam muito alto)
  useBox(() => ({
    type: "Static",
    position: [0, 8, 0],
    args: [12, 0.5, 12],
  }));

  return null; // Paredes invisíveis
}

interface DiceScene3DProps {
  diceConfigs: Array<{
    key: number;
    throwForce: [number, number, number];
    throwTorque: [number, number, number];
    position: [number, number, number];
  }>;
  onResult: (value: number, index: number) => void;
}

function DiceScene3D({ diceConfigs, onResult }: DiceScene3DProps) {
  const handleDiceRest = (rotation: THREE.Euler, index: number) => {
    // Calcula qual face está para cima baseado na rotação
    const result = calculateTopFace(rotation);
    onResult(result, index);
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
    <Canvas camera={{ position: [0, 4, 8], fov: 50 }} style={{ background: 'linear-gradient(to bottom, #1a472a, #0d2818)' }} shadows>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.5} castShadow />
      
      <Physics gravity={[0, -25, 0]}>
        {diceConfigs.map((config, index) => (
          <Dice 
            key={config.key}
            position={config.position}
            throwForce={config.throwForce}
            throwTorque={config.throwTorque}
            onRest={(rotation) => handleDiceRest(rotation, index)} 
          />
        ))}
        <Floor />
        <Walls />
      </Physics>
      
      <OrbitControls 
        enablePan={false} 
        minDistance={3} 
        maxDistance={10}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 6}
      />
    </Canvas>
  );
}

export default function DiceGame() {
  const [isRolling, setIsRolling] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [diceCount, setDiceCount] = useState(3);
  const [diceConfigs, setDiceConfigs] = useState<Array<{
    key: number;
    throwForce: [number, number, number];
    throwTorque: [number, number, number];
    position: [number, number, number];
  }>>([]);

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setResults([]);
    
    // Gera número aleatório de dados (1 a 3)
    const numDice = Math.floor(Math.random() * 3) + 1;
    setDiceCount(numDice);
    
    // Gera configurações para cada dado
    const configs = [];
    const spacing = numDice === 1 ? 0 : 1.5; // Espaçamento entre dados
    const startX = numDice === 1 ? 0 : -(numDice - 1) * spacing / 2;
    
    for (let i = 0; i < numDice; i++) {
      const posX = startX + i * spacing;
      
      // Forças reduzidas para manter os dados dentro da área visível
      const forceX = (Math.random() - 0.5) * 6;  // Reduzido de 12 para 6
      const forceY = Math.random() * 5 + 6;      // Reduzido para 6-11
      const forceZ = (Math.random() - 0.5) * 6;  // Reduzido de 12 para 6
      
      // Gera torques aleatórios para rotação
      const torqueX = (Math.random() - 0.5) * 20;
      const torqueY = (Math.random() - 0.5) * 20;
      const torqueZ = (Math.random() - 0.5) * 20;
      
      configs.push({
        key: Date.now() + i,
        position: [posX, 5, 0] as [number, number, number],
        throwForce: [forceX, forceY, forceZ] as [number, number, number],
        throwTorque: [torqueX, torqueY, torqueZ] as [number, number, number],
      });
    }
    
    setDiceConfigs(configs);
    
    // Espera 4 segundos para os dados pararem
    setTimeout(() => {
      setIsRolling(false);
    }, 4000);
  };

  const handleDiceResult = (value: number, index: number) => {
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = value;
      return newResults;
    });
  };

  const totalResult = results.reduce((sum, val) => sum + (val || 0), 0);

  return (
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      position: "relative",
      overflow: "hidden",
      fontFamily: "Arial, sans-serif"
    }}>
      <DiceScene3D 
        diceConfigs={diceConfigs}
        onResult={handleDiceResult}
      />
      
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        zIndex: 10
      }}>
        <button
          onClick={rollDice}
          disabled={isRolling}
          style={{
            padding: "15px 40px",
            fontSize: "20px",
            fontWeight: "bold",
            backgroundColor: isRolling ? "#555" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: isRolling ? "not-allowed" : "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
            transform: isRolling ? "scale(0.95)" : "scale(1)",
          }}
          onMouseEnter={(e) => {
            if (!isRolling) {
              e.currentTarget.style.backgroundColor = "#45a049";
              e.currentTarget.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isRolling) {
              e.currentTarget.style.backgroundColor = "#4CAF50";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
        >
          {isRolling ? "Lançando..." : "🎲 Lançar Dados"}
        </button>

        {results.length > 0 && !isRolling && results.filter(r => r).length === diceCount && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center"
          }}>
            <div style={{
              padding: "15px 30px",
              fontSize: "24px",
              fontWeight: "bold",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#333",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              animation: "fadeIn 0.5s ease"
            }}>
              Total: {totalResult}
            </div>
            <div style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center"
            }}>
              {results.map((r, i) => r && (
                <div key={i} style={{
                  padding: "10px 20px",
                  fontSize: "18px",
                  backgroundColor: "rgba(255, 215, 0, 0.9)",
                  color: "#333",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                  Dado {i + 1}: {r}
                </div>
              ))}
            </div>
          </div>
        )}

        {isRolling && diceCount > 0 && (
          <div style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            color: "#333",
            borderRadius: "8px",
            fontWeight: "bold"
          }}>
            Lançando {diceCount} {diceCount === 1 ? "dado" : "dados"}...
          </div>
        )}
      </div>

      <div style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: "14px",
        textAlign: "center",
        textShadow: "0 1px 3px rgba(0,0,0,0.5)"
      }}>
        <p>Arraste para girar a visualização • Scroll para zoom</p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
