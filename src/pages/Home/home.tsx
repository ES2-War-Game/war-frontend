import style from "./home.module.css"
import logo from "../../assets/war_logo.png"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/useAuthStore"
import { useLobbyStore } from "../../store/lobbyStore"
import { useState } from "react"
import { useLobbyWebSocket } from "../../hook/useWebSocket"
import { useGame } from "../../hook/useGame"

export default function Home(){
    const { clearUser } = useAuthStore();
    const navigate = useNavigate();
    const { createLobby } = useLobbyWebSocket();
    const { addBot } = useGame();
    
    const [showBotModal, setShowBotModal] = useState(false);
    const [selectedBotCount, setSelectedBotCount] = useState(1);
    const [isCreatingLobby, setIsCreatingLobby] = useState(false);

    const BOT_NAMES = ["GabrielBOT", "LucasBOT", "PedroBOT", "SofiaBOT", "JuliaBOT", "LauraBOT"];

    const handleLogout = () => {
        clearUser();
        navigate("/login");
    };

    const handleSinglePlayer = () => {
        setShowBotModal(true);
    };

    const handleCreateSinglePlayerLobby = async () => {
        if (isCreatingLobby) return;
        
        setIsCreatingLobby(true);
        try {
            // Cria o lobby
            const lobbyName = `SinglePlayer - ${new Date().toLocaleTimeString()}`;
            await createLobby(lobbyName);
            
            // Pega o lobbyId do store após criar
            const lobbyId = useLobbyStore.getState().currentLobbyId;
            
            if (!lobbyId) {
                throw new Error("Falha ao obter ID do lobby");
            }

            // Aguarda um pouco para o lobby ser completamente criado
            await new Promise(resolve => setTimeout(resolve, 500));

            // Adiciona os bots selecionados
            const botsToAdd = BOT_NAMES.slice(0, selectedBotCount);
            
            for (const botName of botsToAdd) {
                try {
                    await addBot(lobbyId, botName);
                    console.log(`✅ Bot ${botName} adicionado com sucesso`);
                    // Pequeno delay entre bots
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (error) {
                    console.error(`❌ Erro ao adicionar bot ${botName}:`, error);
                }
            }

            // Fecha o modal
            setShowBotModal(false);
            
        } catch (error) {
            console.error("Erro ao criar lobby single player:", error);
            alert("Erro ao criar partida single player. Tente novamente.");
        } finally {
            setIsCreatingLobby(false);
        }
    };

    const handleCancelBotModal = () => {
        setShowBotModal(false);
        setSelectedBotCount(1);
    };

    return(
        <div className={style.container}>
            <img src={logo} alt="" />
            <div className={style.buttons}>
                <button onClick={()=>navigate("/profile")}><Link to="/profile">Perfil</Link></button>
                <button onClick={handleSinglePlayer}>SinglePlayer</button>
                <button onClick={()=>navigate("/hub")}><Link to="/hub">MultiPlayer</Link></button>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {/* Modal de seleção de bots */}
            {showBotModal && (
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <h2>Modo Single Player</h2>
                        <p>Selecione quantos bots deseja adicionar (1-5):</p>
                        
                        <div className={style.botSelection}>
                            <label htmlFor="botCount">Número de Bots:</label>
                            <select 
                                id="botCount"
                                value={selectedBotCount} 
                                onChange={(e) => setSelectedBotCount(Number(e.target.value))}
                                disabled={isCreatingLobby}
                                style={{color:"black"}}
                            >
                                <option value={1}>1 Bot</option>
                                <option value={2}>2 Bots</option>
                                <option value={3}>3 Bots</option>
                                <option value={4}>4 Bots</option>
                                <option value={5}>5 Bots</option>
                            </select>
                        </div>

                        <div className={style.botList}>
                            <p><strong>Bots que serão adicionados:</strong></p>
                            <ul>
                                {BOT_NAMES.slice(0, selectedBotCount).map(botName => (
                                    <li key={botName}>{botName}</li>
                                ))}
                            </ul>
                        </div>

                        <div className={style.modalButtons}>
                            <button 
                                onClick={handleCancelBotModal} 
                                disabled={isCreatingLobby}
                                className={style.cancelButton}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleCreateSinglePlayerLobby} 
                                disabled={isCreatingLobby}
                                className={style.confirmButton}
                            >
                                {isCreatingLobby ? "Criando..." : "Criar Partida"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}