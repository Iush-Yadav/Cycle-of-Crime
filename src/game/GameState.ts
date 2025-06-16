import { GameState, Player, NPC, Mission, DialogueNode } from '../types/GameTypes';

export class GameStateManager {
  private player: Player;
  private npcs: NPC[];
  private currentMission?: Mission;
  private missionCount = 0;

  constructor(player: Player, npcs: NPC[]) {
    this.player = player;
    this.npcs = npcs;
  }

  public transitionState(newState: GameState, context?: any): void {
    const previousState = this.player.gameState;
    this.player.gameState = newState;

    console.log(`State transition: ${previousState} -> ${newState}`);

    switch (newState) {
      case GameState.ASSIGNED:
        this.handleMissionAssigned(context);
        break;
      case GameState.INVESTIGATING:
        this.handleInvestigating();
        break;
      case GameState.EQUIPPED:
        this.handleEquipped();
        break;
      case GameState.BUSTED:
        this.handleBusted();
        break;
      case GameState.JAILED:
        this.handleJailed();
        break;
      case GameState.RELEASED:
        this.handleReleased();
        break;
    }
  }

  private handleMissionAssigned(missionData?: any): void {
    this.missionCount++;
    this.currentMission = {
      id: `mission_${this.missionCount}`,
      title: 'Elimination Contract',
      description: 'Find and eliminate the target. Be discrete.',
      targetNPCId: 'target1',
      assignedBy: 'undercover1',
      isCompleted: false,
      loop: this.player.currentLoop
    };

    console.log('Mission assigned:', this.currentMission);
  }

  private handleInvestigating(): void {
    // Player is gathering information
    console.log('Player is investigating...');
  }

  private handleEquipped(): void {
    // Player has picked up a weapon
    console.log('Player is now armed');
    
    // Trigger bust after a short delay
    setTimeout(() => {
      this.transitionState(GameState.BUSTED);
    }, 2000);
  }

  private handleBusted(): void {
    console.log('Player has been busted!');
    
    // Transition to jail after showing bust message
    setTimeout(() => {
      this.transitionState(GameState.JAILED);
    }, 3000);
  }

  private handleJailed(): void {
    console.log('Player is in jail');
    
    // Simulate jail time
    setTimeout(() => {
      this.transitionState(GameState.RELEASED);
    }, 4000);
  }

  private handleReleased(): void {
    console.log('Player has been released');
    
    // Reset for next loop
    this.player.currentLoop++;
    this.currentMission = undefined;
    
    // Reset NPC interactions
    this.npcs.forEach(npc => {
      npc.hasInteracted = false;
    });

    // Return to idle state
    setTimeout(() => {
      this.transitionState(GameState.IDLE);
    }, 2000);
  }

  public getCurrentMission(): Mission | undefined {
    return this.currentMission;
  }

  public processNPCInteraction(npcId: string, dialogueResult: any): void {
    const npc = this.npcs.find(n => n.id === npcId);
    if (!npc) return;

    npc.hasInteracted = true;

    // Handle different NPC types
    switch (npc.type) {
      case 'undercover':
        if (dialogueResult.action === 'accept_mission') {
          this.transitionState(GameState.ASSIGNED);
        }
        break;
      case 'informant':
        if (this.player.gameState === GameState.ASSIGNED) {
          this.transitionState(GameState.INVESTIGATING);
        }
        break;
      case 'target':
        // Interacting with target triggers equipment phase
        this.transitionState(GameState.EQUIPPED);
        break;
    }
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getNPCs(): NPC[] {
    return this.npcs;
  }

  public saveGameState(): void {
    const saveData = {
      player: this.player,
      mission: this.currentMission,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`game_save_${this.player.username}`, JSON.stringify(saveData));
  }

  public loadGameState(username: string): boolean {
    const saveData = localStorage.getItem(`game_save_${username}`);
    if (saveData) {
      try {
        const parsed = JSON.parse(saveData);
        this.player = { ...this.player, ...parsed.player };
        this.currentMission = parsed.mission;
        return true;
      } catch (error) {
        console.error('Failed to load game state:', error);
      }
    }
    return false;
  }
}