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
  
  console.log("🎲 gerarDadosDaBatalha chamado:", {
    ataquePerdeu,
    defesaPerdeu,
    attackDiceCount,
    defenseDiceCount,
    comparacoes,
    somaPerdas: ataquePerdeu + defesaPerdeu
  });
  
  // Em conquistas, o defensor pode perder mais tropas do que dados jogados
  // Nesse caso, ajustamos as perdas para a geração dos dados
  let ataquePerdasDados = ataquePerdeu;
  let defesaPerdasDados = defesaPerdeu;
  
  // Se a soma de perdas não corresponde às comparações, ajusta
  if (ataquePerdeu + defesaPerdeu !== comparacoes) {
    console.warn("⚠️ Soma de perdas não corresponde ao número de comparações");
    
    // Se defensor perdeu mais que as comparações (conquista total)
    if (defesaPerdeu > comparacoes) {
      console.log("  🏆 Conquista detectada! Ajustando perdas para geração de dados");
      defesaPerdasDados = Math.min(defesaPerdeu, comparacoes);
      ataquePerdasDados = comparacoes - defesaPerdasDados;
    } else if (ataquePerdeu + defesaPerdeu < comparacoes) {
      // Se perdas são menores que comparações, distribui proporcionalmente
      console.log("  ⚖️ Perdas menores que comparações, mantendo proporção");
    }
  }
  
  console.log("  Perdas ajustadas para dados:", { ataquePerdasDados, defesaPerdasDados });

  const attackDiceList: number[] = [];
  const defenseDiceList: number[] = [];

  // Gerar os pares de dados baseados no resultado
  // Primeiro: gerar pares onde o atacante VENCE (defensor perde)
  for (let i = 0; i < defesaPerdasDados; i++) {
    // Atacante vence: dado do atacante > dado do defensor
    const defenseValue = randomInRange(1, 5); // 1-5 para garantir que atacante pode ser maior
    const attackValue = randomInRange(defenseValue + 1, 6); // Sempre maior que defesa
    
    attackDiceList.push(attackValue);
    defenseDiceList.push(defenseValue);
  }

  // Segundo: gerar pares onde o DEFENSOR vence ou empata (atacante perde)
  for (let i = 0; i < ataquePerdasDados; i++) {
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

  console.log("✅ Dados gerados:", {
    atacante: attackDiceList,
    defensor: defenseDiceList
  });

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
  console.log("🎲 attackResult() INICIADO");
  
  const {
    atacanteId,
    defensorId,
    attackDiceCount,
    attackTroops,
    defenseTroops,
    defensorOriginalPlayerId,
  } = useAttackStore.getState();

  console.log("📊 Valores do store:", {
    atacanteId,
    defensorId,
    attackDiceCount,
    attackTroops,
    defenseTroops,
    defensorOriginalPlayerId
  });

  const territories = useGameStore.getState().territoriesColors;
  const territoriesArray = Object.values(territories) as TerritoryInfo[];

  console.log("🗺️ Total de territórios disponíveis:", territoriesArray.length);

  const atacante = territoriesArray.find((t) => t.id == atacanteId);
  const defensor = territoriesArray.find((t) => t.id == defensorId);
  
  console.log("🔍 Territórios encontrados:");
  console.log("  - Atacante:", atacante ? `ID ${atacante.id}, ${atacante.allocatedArmie} tropas, owner ${atacante.ownerId}` : "NÃO ENCONTRADO");
  console.log("  - Defensor:", defensor ? `ID ${defensor.id}, ${defensor.allocatedArmie} tropas, owner ${defensor.ownerId}` : "NÃO ENCONTRADO");

  if (!atacante || !defensor) {
    console.error("❌ Territórios não encontrados!");
    return null;
  }

  // Verificar se há soldados registrados
  if (!attackTroops || !defenseTroops) {
    console.error("❌ Tropas não registradas antes do ataque!");
    console.log("  - attackTroops:", attackTroops);
    console.log("  - defenseTroops:", defenseTroops);
    return null;
  }

  // Cálculo CORRETO das perdas:
  // attackTroops = tropas ANTES do ataque
  // atacante.allocatedArmie = tropas DEPOIS do ataque
  // Logo: perda = ANTES - DEPOIS
  const attackLoss = attackTroops - atacante.allocatedArmie;
  
  // CORREÇÃO: Se o território foi conquistado, defensor perdeu TODAS as tropas
  // Verificar se o território mudou de dono comparando com ownerId salvo
  let defenseLoss = defenseTroops - defensor.allocatedArmie;
  
  // Se o território mudou de dono, o defensor perdeu tudo
  const territorioFoiConquistado = defensor.ownerId !== defensorOriginalPlayerId;
  
  if (territorioFoiConquistado || defensor.allocatedArmie === 0) {
    defenseLoss = defenseTroops;
    console.log("🏆 TERRITÓRIO CONQUISTADO! Defensor perdeu todas as tropas:", defenseLoss);
    console.log("  - Owner anterior:", defensorOriginalPlayerId);
    console.log("  - Owner atual:", defensor.ownerId);
  }

  console.log("=== DEBUG CÁLCULO DE PERDAS ===");
  console.log("Atacante ANTES:", attackTroops);
  console.log("Atacante DEPOIS:", atacante.allocatedArmie);
  console.log("Atacante PERDEU:", attackLoss);
  console.log("Defensor ANTES:", defenseTroops);
  console.log("Defensor DEPOIS:", defensor.allocatedArmie);
  console.log("Defensor PERDEU:", defenseLoss);
  console.log("Território conquistado?:", territorioFoiConquistado);

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

  // Defender joga no máximo 3 dados baseado nas tropas que tinha
  const defenderDiceCount = Math.min(defenseTroops, 3);

  if (attackDiceCount && defenderDiceCount) {
    console.log("🎲 Gerando dados da batalha:",{attackLoss, defenseLoss, attackDiceCount, defenderDiceCount});
    
    const DiceList = gerarDadosDaBatalha(
      attackLoss,
      defenseLoss,
      attackDiceCount,
      defenderDiceCount
    );
    
    if (!DiceList) {
      console.error("❌ Falha ao gerar dados da batalha");
      return null;
    }
    
    console.log("✅ Dados gerados com sucesso:", DiceList);

    const DiceResult: DiceResult = {
      attackResult: attackLoss,
      defenseResult: defenseLoss,
    };

    console.log("📋 Resultado final:", { DiceList, DiceResult });

    return {
      DiceList,
      DiceResult,
    };
  }

  console.error("❌ Contagem de dados inválida");
  return null;
}
