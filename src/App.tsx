import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { GameHUD } from './components/GameHUD';
import { DialogueSystem } from './components/DialogueSystem';
import { OutfitSelector } from './components/OutfitSelector';
import { GameEngine } from './game/GameEngine';
import { GameStateManager } from './game/GameState';
import { TwistManager } from './game/TwistManager';
import { useGameData } from './hooks/useGameData';
import { GameState, NPC, DialogueOption } from './types/GameTypes';

function App() {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const gameStateManagerRef = useRef<GameStateManager | null>(null);
  const twistManagerRef = useRef<TwistManager | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  const {
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
    saveGameData,
    loadGameData,
    setNPCs
  } = useGameData();

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showOutfitSelector, setShowOutfitSelector] = useState(false);
  const [interactionPrompt, setInteractionPrompt] = useState<string | undefined>();
  const [currentTwist, setCurrentTwist] = useState<any>(null);

  // Initialize game engine
  useEffect(() => {
    if (player.gameState !== GameState.LOGIN && !gameEngineRef.current && gameContainerRef.current) {
      console.log('Initializing game engine...');
      
      try {
        const engine = new GameEngine();
        gameEngineRef.current = engine;

        // Initialize twist manager
        const twistManager = new TwistManager();
        twistManagerRef.current = twistManager;

        // Get current twist based on loop
        const twist = twistManager.getTwistForLoop(player.currentLoop);
        setCurrentTwist(twist);

        // Apply twist to game engine
        engine.applyTwist(twist);

        // Set up game callbacks
        engine.setCallbacks({
          onInteraction: handleNPCInteraction,
          onStateChange: updateGameState
        });

        // Append game canvas to container
        gameContainerRef.current.innerHTML = ''; // Clear any existing content
        gameContainerRef.current.appendChild(engine.getDOMElement());

        // Initialize game state manager
        const gameStateManager = new GameStateManager(player, npcs);
        gameStateManagerRef.current = gameStateManager;

        // Generate NPCs with twist variations
        const initialNPCs = generateTwistedNPCs(twist);
        setNPCs(initialNPCs);
        
        // CRITICAL: Update game engine with NPC data
        engine.updateNPCData(initialNPCs);

        console.log('Game engine initialized successfully with twist:', twist.name);

        // Update interaction prompt
        const updatePrompt = () => {
          const prompt = engine.getInteractionPrompt();
          setInteractionPrompt(prompt);
        };

        const intervalId = setInterval(updatePrompt, 100);
        
        return () => {
          clearInterval(intervalId);
          if (gameEngineRef.current) {
            gameEngineRef.current.dispose();
            gameEngineRef.current = null;
          }
        };
      } catch (error) {
        console.error('Failed to initialize game engine:', error);
      }
    }
  }, [player.gameState, player.currentLoop, updateGameState, setNPCs]);

  // Update twist when loop changes
  useEffect(() => {
    if (twistManagerRef.current && gameEngineRef.current && player.currentLoop > 1) {
      const newTwist = twistManagerRef.current.getTwistForLoop(player.currentLoop);
      setCurrentTwist(newTwist);
      
      // Apply new twist to game engine
      gameEngineRef.current.applyTwist(newTwist);
      
      // Update player outfit based on twist
      updatePlayer({ outfit: newTwist.playerOutfit });
      
      // Regenerate NPCs with new twist
      const twistedNPCs = generateTwistedNPCs(newTwist);
      setNPCs(twistedNPCs);
      
      // CRITICAL: Update game engine with new NPC data
      gameEngineRef.current.updateNPCData(twistedNPCs);
      
      console.log('Applied new twist for loop', player.currentLoop, ':', newTwist.name);
      console.log('Updated NPCs:', twistedNPCs.map(npc => ({ id: npc.id, name: npc.name })));
    }
  }, [player.currentLoop, updatePlayer, setNPCs]);

  // Sync NPCs with game engine whenever NPCs change
  useEffect(() => {
    if (gameEngineRef.current && npcs.length > 0) {
      console.log('Syncing NPCs with game engine:', npcs.map(npc => ({ id: npc.id, name: npc.name })));
      gameEngineRef.current.updateNPCData(npcs);
    }
  }, [npcs]);

  // Save game data periodically
  useEffect(() => {
    if (player.username && player.gameState !== GameState.LOGIN) {
      const saveInterval = setInterval(saveGameData, 30000); // Save every 30 seconds
      return () => clearInterval(saveInterval);
    }
  }, [player.username, player.gameState, saveGameData]);

  const generateTwistedNPCs = (twist: any): NPC[] => {
    const assignments = twist.npcAssignments;
    const conversationSet = twist.conversationSet;
    
    console.log('Generating NPCs for twist:', twist.name, 'with assignments:', assignments);
    
    // Get conversation templates based on the twist's conversation set
    const getDialogueText = (npcType: string, dialogueId: string, baseText: string) => {
      const template = twistManagerRef.current?.getConversationTemplate(twist, npcType, dialogueId);
      if (template) {
        const styledText = twistManagerRef.current?.generateTwistedDialogue(
          template.base,
          assignments[npcType].id,
          twist
        ) || template.base;
        return styledText;
      }
      return twistManagerRef.current?.generateTwistedDialogue(baseText, assignments[npcType].id, twist) || baseText;
    };

    const baseNPCs = [
      {
        id: assignments.jobGiver.id,
        name: assignments.jobGiver.name,
        type: 'undercover' as const,
        position: { x: 10, y: 0, z: 10 },
        dialogue: [
          {
            id: 'intro',
            speaker: assignments.jobGiver.name.split(' ')[0],
            text: getDialogueText('jobGiver', 'intro', "Hey there, new face! You look like someone who could use some easy money. I've got a simple job if you're interested..."),
            options: conversationSet === 'A' ? [
              { text: "What kind of job are we talking about?", nextId: 'details' },
              { text: "I'm listening... but I'm no pushover.", nextId: 'details' },
              { text: "Not interested in shady business.", action: 'end' }
            ] : [
              { text: "Depends on what you need done.", nextId: 'details' },
              { text: "How serious are we talking?", nextId: 'details' },
              { text: "I don't do dirty work.", action: 'end' }
            ]
          },
          {
            id: 'details',
            speaker: assignments.jobGiver.name.split(' ')[0],
            text: getDialogueText('jobGiver', 'details', conversationSet === 'A' 
              ? "There's this guy who's been causing problems for my... business associates. Need someone to send him a permanent message. You handle this, there's $5000 in it for you."
              : "Someone's been talking to the wrong people, if you catch my drift. This person needs to disappear permanently. Twenty grand if you can make it happen tonight."
            ),
            options: conversationSet === 'A' ? [
              { text: "Count me in. Where do I find him?", action: 'accept_mission' },
              { text: "That's murder. I'm not a killer.", action: 'refuse' },
              { text: "Five grand? Make it ten and we have a deal.", nextId: 'negotiate' }
            ] : [
              { text: "Twenty grand? You've got my attention.", action: 'accept_mission' },
              { text: "That's a lot of money for a simple job...", nextId: 'negotiate' },
              { text: "Find someone else for your murder.", action: 'refuse' }
            ]
          },
          {
            id: 'negotiate',
            speaker: assignments.jobGiver.name.split(' ')[0],
            text: getDialogueText('jobGiver', 'negotiate', conversationSet === 'A'
              ? "Ha! I like your style. Fine, ten grand it is. The target hangs around the east plaza. Red jacket, can't miss him."
              : "Smart to be suspicious. But this is legitimate business. The target will be near the old warehouse district. Look for someone in distinctive clothing."
            ),
            options: conversationSet === 'A' ? [
              { text: "Deal. Consider it done.", action: 'accept_mission' }
            ] : [
              { text: "Alright, I'm in. Give me the details.", action: 'accept_mission' }
            ]
          },
          {
            id: 'refuse',
            speaker: assignments.jobGiver.name.split(' ')[0],
            text: "Your loss, kid. But hey, if you change your mind, you know where to find me.",
            options: [
              { text: "I won't change my mind.", action: 'end' }
            ]
          },
          {
            id: 'already_assigned',
            speaker: assignments.jobGiver.name.split(' ')[0],
            text: "You already have your assignment. Go find the target and get it done. Don't come back until it's finished.",
            options: [
              { text: "Right, I'm on it.", action: 'end' }
            ]
          }
        ],
        isActive: true,
        hasInteracted: false
      },
      {
        id: assignments.informant.id,
        name: assignments.informant.name,
        type: 'informant' as const,
        position: { x: -15, y: 0, z: 5 },
        dialogue: [
          {
            id: 'no_mission',
            speaker: assignments.informant.name.split(' ')[0],
            text: "You look lost, honey. I don't talk to people who don't have business here. Come back when you have something specific to ask about.",
            options: [
              { text: "Alright, I'll be back.", action: 'end' }
            ]
          },
          {
            id: 'info',
            speaker: assignments.informant.name.split(' ')[0],
            text: getDialogueText('informant', 'info', conversationSet === 'A'
              ? "You're asking about someone, aren't you? I can see it in your eyes. Word of advice - this neighborhood has eyes and ears everywhere."
              : "You've got that look... someone's paying you to find somebody, right? Well, information costs extra in this neighborhood."
            ),
            options: conversationSet === 'A' ? [
              { text: "I'm looking for a guy in a red jacket.", nextId: 'hint' },
              { text: "Just passing through.", action: 'end' },
              { text: "What kind of eyes and ears?", nextId: 'warning' }
            ] : [
              { text: "I need to find someone specific.", nextId: 'hint' },
              { text: "What's it to you?", nextId: 'warning' },
              { text: "I'm just looking around.", action: 'end' }
            ]
          },
          {
            id: 'hint',
            speaker: assignments.informant.name.split(' ')[0],
            text: getDialogueText('informant', 'hint', conversationSet === 'A'
              ? "Red jacket guy? Yeah, I seen him. Usually hangs by the old fountain around evening time. But listen, honey... that area's been crawling with undercover cops lately."
              : "Ah, the person you're looking for... yeah, I know where they hang out. But word of warning - there's been a lot of heat around here lately. Cops everywhere."
            ),
            options: conversationSet === 'A' ? [
              { text: "Thanks for the tip.", action: 'investigate' },
              { text: "Undercover cops? You sure?", nextId: 'warning' }
            ] : [
              { text: "Where can I find them?", action: 'investigate' },
              { text: "What kind of heat?", nextId: 'warning' }
            ]
          },
          {
            id: 'warning',
            speaker: assignments.informant.name.split(' ')[0],
            text: twistManagerRef.current?.generateTwistedDialogue(
              "Sweetheart, I didn't survive this long on these streets by being wrong about cops. They're setting traps, looking for someone stupid enough to make a move. Be careful who you trust.",
              assignments.informant.id,
              twist
            ) || "Sweetheart, I didn't survive this long on these streets by being wrong about cops. They're setting traps, looking for someone stupid enough to make a move. Be careful who you trust.",
            options: [
              { text: "I appreciate the warning.", action: 'investigate' },
              { text: "Who can I trust then?", nextId: 'trust' }
            ]
          },
          {
            id: 'trust',
            speaker: assignments.informant.name.split(' ')[0],
            text: twistManagerRef.current?.generateTwistedDialogue(
              "In this game? Nobody. Not even me. Especially not the guy who gave you the job in the first place.",
              assignments.informant.id,
              twist
            ) || "In this game? Nobody. Not even me. Especially not the guy who gave you the job in the first place.",
            options: [
              { text: "What do you mean by that?", action: 'investigate' },
              { text: "Thanks... I think.", action: 'investigate' }
            ]
          },
          {
            id: 'already_helped',
            speaker: assignments.informant.name.split(' ')[0],
            text: "I already told you what you need to know. Red jacket, fountain area, watch out for cops. Now get going before someone sees us talking.",
            options: [
              { text: "Got it, thanks.", action: 'end' }
            ]
          }
        ],
        isActive: true,
        hasInteracted: false
      },
      {
        id: assignments.target.id,
        name: assignments.target.name,
        type: 'target' as const,
        position: { x: 25, y: 0, z: -10 },
        dialogue: [
          {
            id: 'no_mission',
            speaker: assignments.target.name.split(' ')[0],
            text: "Do I know you? You're staring at me like you want something. Move along, pal.",
            options: [
              { text: "Sorry, thought you were someone else.", action: 'end' }
            ]
          },
          {
            id: 'no_info',
            speaker: assignments.target.name.split(' ')[0],
            text: "You lost or something? This ain't exactly tourist territory, friend. Maybe you should ask around first before bothering people.",
            options: [
              { text: "You're right, I'll ask around.", action: 'end' }
            ]
          },
          {
            id: 'approach',
            speaker: assignments.target.name.split(' ')[0],
            text: getDialogueText('target', 'approach', conversationSet === 'A'
              ? "You lost or something? This ain't exactly tourist territory, friend."
              : "I don't know you. What do you want? This isn't a safe place to be wandering around."
            ),
            options: conversationSet === 'A' ? [
              { text: "Just exploring the neighborhood.", nextId: 'casual' },
              { text: "Someone sent me to find you.", nextId: 'threat' },
              { text: "Nice jacket. Where'd you get it?", nextId: 'casual' }
            ] : [
              { text: "Just checking out the area.", nextId: 'casual' },
              { text: "I was told to find you.", nextId: 'threat' },
              { text: "You seem nervous about something.", nextId: 'casual' }
            ]
          },
          {
            id: 'casual',
            speaker: assignments.target.name.split(' ')[0],
            text: getDialogueText('target', 'casual', conversationSet === 'A'
              ? "Well, be careful around here. Lot of dangerous people in this area. Some of them aren't who they appear to be."
              : "Nervous? You should be nervous too. There's been strange people asking questions around here. I'd watch your back if I were you."
            ),
            options: conversationSet === 'A' ? [
              { text: "What do you mean?", action: 'investigate' },
              { text: "Thanks for the warning.", action: 'end' }
            ] : [
              { text: "What kind of strange people?", action: 'investigate' },
              { text: "Thanks for the heads up.", action: 'end' }
            ]
          },
          {
            id: 'threat',
            speaker: assignments.target.name.split(' ')[0],
            text: twistManagerRef.current?.generateTwistedDialogue(
              "Oh really? And who might that be? You know what, don't answer that. I think I know exactly who sent you...",
              assignments.target.id,
              twist
            ) || "Oh really? And who might that be? You know what, don't answer that. I think I know exactly who sent you...",
            options: [
              { text: "This doesn't have to end badly.", action: 'investigate' },
              { text: "Just following orders.", action: 'investigate' }
            ]
          }
        ],
        isActive: true,
        hasInteracted: false
      }
    ];

    console.log('Generated NPCs:', baseNPCs.map(npc => ({ id: npc.id, name: npc.name, type: npc.type })));
    return baseNPCs;
  };

  const handleLogin = useCallback(async (username: string) => {
    setIsLoginLoading(true);
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Try to load existing game data
      const hasExistingData = loadGameData(username);
      
      updatePlayer({ 
        username,
        gameState: GameState.IDLE 
      });

      console.log('Login successful for:', username);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoginLoading(false);
    }
  }, [updatePlayer, loadGameData]);

  const handleNPCInteraction = useCallback((npc: NPC) => {
    console.log('🎯 NPC INTERACTION TRIGGERED!');
    console.log('- NPC ID:', npc.id);
    console.log('- NPC Name:', npc.name);
    console.log('- NPC Type:', npc.type);
    console.log('- Player State:', player.gameState);
    console.log('- Available NPCs:', npcs.map(n => ({ id: n.id, name: n.name, type: n.type })));
    
    // Determine which dialogue to show based on game state and NPC type
    let dialogueToShow = null;

    if (npc.type === 'undercover') {
      // Undercover agent - can always talk, but different dialogue if mission already assigned
      if (player.gameState === GameState.ASSIGNED || player.gameState === GameState.INVESTIGATING) {
        dialogueToShow = npc.dialogue.find(d => d.id === 'already_assigned');
      } else {
        dialogueToShow = npc.dialogue.find(d => d.id === 'intro');
      }
    } else if (npc.type === 'informant') {
      // Informant - only provides info if mission is assigned
      if (player.gameState === GameState.IDLE) {
        dialogueToShow = npc.dialogue.find(d => d.id === 'no_mission');
      } else if (player.gameState === GameState.ASSIGNED) {
        dialogueToShow = npc.dialogue.find(d => d.id === 'info');
      } else if (player.gameState === GameState.INVESTIGATING && npc.hasInteracted) {
        dialogueToShow = npc.dialogue.find(d => d.id === 'already_helped');
      } else if (player.gameState === GameState.INVESTIGATING) {
        dialogueToShow = npc.dialogue.find(d => d.id === 'info');
      }
    } else if (npc.type === 'target') {
      // Target - different responses based on game progression
      if (player.gameState === GameState.IDLE) {
        dialogueToShow = npc.dialogue.find(d => d.id === 'no_mission');
      } else if (player.gameState === GameState.ASSIGNED) {
        dialogueToShow = npc.dialogue.find(d => d.id === 'no_info');
      } else if (player.gameState === GameState.INVESTIGATING) {
        dialogueToShow = npc.dialogue.find(d => d.id === 'approach');
      }
    }

    console.log('- Selected Dialogue:', dialogueToShow?.id);

    if (dialogueToShow) {
      console.log('✅ Starting dialogue with', npc.name);
      startDialogue(npc, dialogueToShow);
    } else {
      console.log('❌ No appropriate dialogue found for current state');
    }
  }, [startDialogue, player.gameState, npcs]);

  const handleDialogueOption = useCallback((option: DialogueOption) => {
    console.log('Selected dialogue option:', option);
    
    if (option.nextId && currentDialogue && activeNPCId) {
      // Find next dialogue node
      const npc = npcs.find(n => n.id === activeNPCId);
      if (npc) {
        const nextNode = npc.dialogue.find(d => d.id === option.nextId);
        if (nextNode) {
          console.log('Moving to next dialogue node:', nextNode.id);
          startDialogue(npc, nextNode);
          return;
        }
      }
    }

    // Handle actions
    if (option.action) {
      console.log('Executing dialogue action:', option.action);
      handleDialogueAction(option.action);
    }

    endDialogue();
  }, [currentDialogue, activeNPCId, npcs, startDialogue, endDialogue]);

  const handleDialogueAction = useCallback((action: string) => {
    console.log('Handling dialogue action:', action);
    
    if (!gameStateManagerRef.current || !activeNPCId) return;

    switch (action) {
      case 'accept_mission':
        console.log('Mission accepted! Assigning mission...');
        gameStateManagerRef.current.processNPCInteraction(activeNPCId, { action });
        assignMission({
          id: 'mission_1',
          title: 'Elimination Contract',
          description: 'Find and eliminate the target in the red jacket.',
          targetNPCId: currentTwist?.npcAssignments?.target?.id || 'target1',
          assignedBy: activeNPCId,
          isCompleted: false,
          loop: player.currentLoop
        });
        updateGameState(GameState.ASSIGNED);
        console.log('Mission assigned successfully!');
        break;
      case 'investigate':
        // Mark informant as interacted
        if (activeNPCId.includes('informant')) {
          const updatedNPCs = npcs.map(npc => 
            npc.id === activeNPCId ? { ...npc, hasInteracted: true } : npc
          );
          setNPCs(updatedNPCs);
          updateGameState(GameState.INVESTIGATING);
        } else {
          // Interacting with target triggers the bust sequence with extended timing
          updateGameState(GameState.EQUIPPED);
          setTimeout(() => {
            updateGameState(GameState.BUSTED);
            setTimeout(() => {
              updateGameState(GameState.JAILED);
              setTimeout(() => {
                updateGameState(GameState.RELEASED);
                setTimeout(() => {
                  // Reset for next loop
                  updateGameState(GameState.IDLE);
                  updatePlayer({ currentLoop: player.currentLoop + 1 });
                  
                  // Reset NPC interactions
                  const resetNPCs = npcs.map(npc => ({ ...npc, hasInteracted: false }));
                  setNPCs(resetNPCs);
                }, 3000); // Extended release time
              }, 6000); // Extended jail time - 6 seconds
            }, 5000); // Extended bust time - 5 seconds for visibility
          }, 2000);
        }
        break;
      case 'end':
      default:
        break;
    }
  }, [activeNPCId, player.currentLoop, assignMission, updateGameState, updatePlayer, npcs, setNPCs, currentTwist]);

  const handleOutfitChange = useCallback((outfit: string) => {
    updatePlayer({ outfit });
    if (gameEngineRef.current) {
      gameEngineRef.current.setPlayerData({ outfit });
    }
  }, [updatePlayer]);

  if (player.gameState === GameState.LOGIN) {
    return <LoginScreen onLogin={handleLogin} isLoading={isLoginLoading} />;
  }

  return (
    <div className="w-full h-full relative">
      {/* Game Canvas Container */}
      <div ref={gameContainerRef} className="w-full h-full bg-black" />

      {/* Game HUD */}
      <GameHUD
        player={player}
        currentMission={currentMission}
        onOpenOutfitMenu={() => setShowOutfitSelector(true)}
        interactionPrompt={interactionPrompt}
        npcs={npcs}
        currentTwist={currentTwist}
      />

      {/* Dialogue System */}
      {isDialogueActive && currentDialogue && activeNPCId && (
        <DialogueSystem
          dialogue={currentDialogue}
          onOptionSelect={handleDialogueOption}
          onClose={endDialogue}
          npcName={npcs.find(n => n.id === activeNPCId)?.name || 'Unknown'}
        />
      )}

      {/* Outfit Selector */}
      {showOutfitSelector && (
        <OutfitSelector
          currentOutfit={player.outfit}
          onOutfitChange={handleOutfitChange}
          onClose={() => setShowOutfitSelector(false)}
        />
      )}

      {/* Game Instructions */}
      <div className="absolute bottom-4 left-4 ui-element bg-black/60 backdrop-blur-sm border border-gray-600 rounded-lg p-3 text-white text-sm max-w-xs">
        <div className="font-semibold mb-2">Controls:</div>
        <div>WASD - Move</div>
        <div>SPACE - Jump</div>
        <div>E - Interact</div>
        {currentTwist && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="font-semibold text-yellow-400">{currentTwist.name}</div>
            <div className="text-xs text-gray-400">{currentTwist.description}</div>
            <div className="text-xs text-purple-400 mt-1">
              Conversation Set: {currentTwist.conversationSet}
            </div>
          </div>
        )}
        
        {/* Debug Info */}
        <div className="mt-2 pt-2 border-t border-gray-600 text-xs">
          <div className="text-green-400">Debug Info:</div>
          <div>NPCs: {npcs.length}</div>
          <div>State: {player.gameState}</div>
          <div>Loop: {player.currentLoop}</div>
        </div>
      </div>
    </div>
  );
}

export default App;