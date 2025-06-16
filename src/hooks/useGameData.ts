import { useState, useCallback } from 'react';
import { Player, NPC, Mission, GameState, DialogueNode } from '../types/GameTypes';

export const useGameData = () => {
  const [player, setPlayer] = useState<Player>({
    id: 'player1',
    username: '',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    outfit: 'street',
    health: 100,
    currentLoop: 1,
    gameState: GameState.LOGIN
  });

  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [currentMission, setCurrentMission] = useState<Mission | undefined>();
  const [isDialogueActive, setIsDialogueActive] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<DialogueNode | undefined>();
  const [activeNPCId, setActiveNPCId] = useState<string | undefined>();

  const updatePlayer = useCallback((updates: Partial<Player>) => {
    setPlayer(prev => ({ ...prev, ...updates }));
  }, []);

  const updateGameState = useCallback((newState: GameState) => {
    setPlayer(prev => ({ ...prev, gameState: newState }));
  }, []);

  const startDialogue = useCallback((npc: NPC, dialogueNode: DialogueNode) => {
    setCurrentDialogue(dialogueNode);
    setActiveNPCId(npc.id);
    setIsDialogueActive(true);
  }, []);

  const endDialogue = useCallback(() => {
    setIsDialogueActive(false);
    setCurrentDialogue(undefined);
    setActiveNPCId(undefined);
  }, []);

  const assignMission = useCallback((mission: Mission) => {
    setCurrentMission(mission);
    updateGameState(GameState.ASSIGNED);
  }, [updateGameState]);

  const completeMission = useCallback(() => {
    setCurrentMission(undefined);
  }, []);

  const saveGameData = useCallback(() => {
    const gameData = {
      player,
      currentMission,
      timestamp: Date.now()
    };
    localStorage.setItem(`cycle_of_crime_${player.username}`, JSON.stringify(gameData));
  }, [player, currentMission]);

  const loadGameData = useCallback((username: string) => {
    const saved = localStorage.getItem(`cycle_of_crime_${username}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayer(prev => ({ ...prev, ...data.player, username }));
        setCurrentMission(data.currentMission);
        return true;
      } catch (error) {
        console.error('Failed to load game data:', error);
      }
    }
    return false;
  }, []);

  return {
    player,
    npcs,
    currentMission,
    isDialogueActive,
    currentDialogue,
    activeNPCId,
    updatePlayer,
    updateGameState,
    startDialogue,
    endDialogue,
    assignMission,
    completeMission,
    saveGameData,
    loadGameData,
    setNPCs
  };
};