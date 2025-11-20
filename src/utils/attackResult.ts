import { useAttackStore } from "../store/useAttackStore";
import { useGameStore } from "../store/useGameStore";
import type { TerritoryInfo } from "./gameState";

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gerarDadosDaBatalha(
  ataquePerdeu: number,
  defesaPerdeu: number,
  attackDiceCount: number,
  defenseDiceCount: number
) {
  // Número de comparações = mínimo entre dados de ataque e defesa
  const comparacoes = Math.min(attackDiceCount, defenseDiceCount);
  
  // Validação: soma das perdas deve ser igual ao número de comparações
  if (ataquePerdeu + defesaPerdeu !== comparacoes) {
    console.error("Erro: soma de perdas não corresponde ao número de comparações");
    return null;
  }

  const attackDiceList: number[] = [];
  const defenseDiceList: number[] = [];

  // Gerar os pares de dados baseados no resultado
  // Primeiro: gerar pares onde o atacante VENCE (defensor perde)
  for (let i = 0; i < defesaPerdeu; i++) {
    // Atacante vence: dado do atacante > dado do defensor
    const defenseValue = randomInRange(1, 5); // 1-5 para garantir que atacante pode ser maior
    const attackValue = randomInRange(defenseValue + 1, 6); // Sempre maior que defesa
    
    attackDiceList.push(attackValue);
    defenseDiceList.push(defenseValue);
  }

  // Segundo: gerar pares onde o DEFENSOR vence ou empata (atacante perde)
  for (let i = 0; i < ataquePerdeu; i++) {
    // Defensor vence/empata: dado do defensor >= dado do atacante
    const attackValue = randomInRange(1, 6);
    const defenseValue = randomInRange(attackValue, 6); // Maior ou igual ao ataque
    
    attackDiceList.push(attackValue);
    defenseDiceList.push(defenseValue);
  }

  // Adicionar dados extras se um lado tiver mais dados que comparações
  for (let i = comparacoes; i < attackDiceCount; i++) {
    attackDiceList.push(randomInRange(1, 6));
  }
  
  for (let i = comparacoes; i < defenseDiceCount; i++) {
    defenseDiceList.push(randomInRange(1, 6));
  }

  // Ordenar ambas as listas em ordem DECRESCENTE (maior primeiro)
  attackDiceList.sort((a, b) => b - a);
  defenseDiceList.sort((a, b) => b - a);

  return {
    ataque: attackDiceList,
    defesa: defenseDiceList
  };
}



type DiceListResult = {
  ataque: number[];
  defesa: number[];
};

type DiceResult = {
  attackResult: number;
  defenseResult: number;
};

type AttackReturn = {
  DiceList: DiceListResult;
  DiceResult: DiceResult;
} | null;

export default function attackResult(): AttackReturn {
  const {
    atacanteId,
    defensorId,
    attackDiceCount,
    attackTroops,
    defenseTroops,
  } = useAttackStore.getState();

  const territories = useGameStore.getState().territoriesColors;
  const territoriesArray = Object.values(territories) as TerritoryInfo[];

  const atacante = territoriesArray.find((t) => t.id == atacanteId);
  const defensor = territoriesArray.find((t) => t.id == defensorId);
  console.log("atacante",atacante)
    console.log("defensor",defensor)


  if (!atacante || !defensor) return null;

  // Verificar se há soldados registrados
  if (!attackTroops || !defenseTroops) return null;

  // Cálculo CORRETO das perdas:
  // attackTroops = tropas ANTES do ataque
  // atacante.allocatedArmie = tropas DEPOIS do ataque
  // Logo: perda = ANTES - DEPOIS
  const attackLoss = attackTroops - atacante.allocatedArmie;
  const defenseLoss = defenseTroops - defensor.allocatedArmie;

  console.log("=== DEBUG CÁLCULO DE PERDAS ===");
  console.log("Atacante ANTES:", attackTroops);
  console.log("Atacante DEPOIS:", atacante.allocatedArmie);
  console.log("Atacante PERDEU:", attackLoss);
  console.log("Defensor ANTES:", defenseTroops);
  console.log("Defensor DEPOIS:", defensor.allocatedArmie);
  console.log("Defensor PERDEU:", defenseLoss);

  // Se qualquer um estiver inconsistente, aborta
  if (attackLoss < 0 || defenseLoss < 0) {
    console.error("❌ Perdas negativas detectadas! Valores inconsistentes.");
    return null;
  }

  // Validação: pelo menos um lado deve ter perdido algo
  if (attackLoss === 0 && defenseLoss === 0) {
    console.error("❌ Nenhum lado perdeu tropas! Valores podem estar incorretos.");
    console.log("Dica: Verifique se attackTroops/defenseTroops foram salvos ANTES do ataque");
    return null;
  }

  // Defender joga no máximo 2 dados no WAR clássico,
  // mas aqui seguimos sua regra: defender usa quantos soldados defendia.
  const defenderDiceCount = Math.min(defenseTroops, 3); // ajuste se quiser outra regra

  if (attackDiceCount && defenderDiceCount) {
    console.log("chegou aqui yay35536",attackLoss,defenseLoss,attackDiceCount,defenderDiceCount);
    console.log("chegou aqui");
    const DiceList = gerarDadosDaBatalha(
      attackLoss,
      defenseLoss,
      attackDiceCount,
      defenderDiceCount
    );
    
    if (!DiceList) return null;
    
    console.log("chegou aqui yay", DiceList);
    console.log("chegou aqui");

    const DiceResult: DiceResult = {
      attackResult: attackLoss,
      defenseResult: defenseLoss,
    };

    console.log("lista de dados:", DiceList);

    return {
      DiceList,
      DiceResult,
    };
  }

  return null;
}
