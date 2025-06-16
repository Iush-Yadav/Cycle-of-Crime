export interface Player {
  id: string;
  username: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  outfit: string;
  health: number;
  currentLoop: number;
  gameState: GameState;
}

export interface NPC {
  id: string;
  name: string;
  type: 'undercover' | 'informant' | 'target' | 'ambient';
  position: { x: number; y: number; z: number };
  dialogue: DialogueNode[];
  isActive: boolean;
  hasInteracted: boolean;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  options: DialogueOption[];
  actions?: string[];
}

export interface DialogueOption {
  text: string;
  nextId?: string;
  action?: string;
}

export enum GameState {
  LOGIN = 'LOGIN',
  IDLE = 'IDLE',
  ASSIGNED = 'ASSIGNED',
  INVESTIGATING = 'INVESTIGATING',
  EQUIPPED = 'EQUIPPED',
  BUSTED = 'BUSTED',
  JAILED = 'JAILED',
  RELEASED = 'RELEASED'
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetNPCId: string;
  assignedBy: string;
  isCompleted: boolean;
  loop: number;
}

export interface GameData {
  player: Player;
  npcs: NPC[];
  currentMission?: Mission;
  isDialogueActive: boolean;
  currentDialogue?: DialogueNode;
  inventory: string[];
}