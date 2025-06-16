import React from 'react';
import { MapPin, Target, User, Package, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { GameState, Mission, Player, NPC } from '../types/GameTypes';

interface GameHUDProps {
  player: Player;
  currentMission?: Mission;
  onOpenOutfitMenu: () => void;
  interactionPrompt?: string;
  npcs?: NPC[];
  currentTwist?: any;
}

export const GameHUD: React.FC<GameHUDProps> = ({ 
  player, 
  currentMission, 
  onOpenOutfitMenu,
  interactionPrompt,
  npcs = [],
  currentTwist
}) => {
  const getStateText = (state: GameState) => {
    switch (state) {
      case GameState.IDLE: return 'Explore the city';
      case GameState.ASSIGNED: return 'Mission assigned';
      case GameState.INVESTIGATING: return 'Investigating...';
      case GameState.EQUIPPED: return 'Armed and dangerous';
      case GameState.BUSTED: return 'BUSTED!';
      case GameState.JAILED: return 'Behind bars';
      case GameState.RELEASED: return 'Released';
      default: return 'Unknown';
    }
  };

  const getStateColor = (state: GameState) => {
    switch (state) {
      case GameState.IDLE: return 'text-green-400';
      case GameState.ASSIGNED: return 'text-yellow-400';
      case GameState.INVESTIGATING: return 'text-blue-400';
      case GameState.EQUIPPED: return 'text-red-400';
      case GameState.BUSTED: return 'text-red-600';
      case GameState.JAILED: return 'text-gray-400';
      case GameState.RELEASED: return 'text-green-400';
      default: return 'text-white';
    }
  };

  // Get current objective based on game state
  const getCurrentObjective = () => {
    const jobGiverName = currentTwist?.npcAssignments?.jobGiver?.name?.split(' ')[0] || 'Marcus';
    const informantName = currentTwist?.npcAssignments?.informant?.name?.split(' ')[0] || 'Jenny';
    const targetName = currentTwist?.npcAssignments?.target?.name?.split(' ')[0] || 'Tommy';

    switch (player.gameState) {
      case GameState.IDLE:
        return {
          title: "Find Work",
          description: `Look for ${jobGiverName} to get a job opportunity`,
          icon: <User className="w-4 h-4" />,
          color: "text-blue-400 border-blue-400"
        };
      case GameState.ASSIGNED:
        return {
          title: "Gather Intel",
          description: `Talk to ${informantName} for information about the target`,
          icon: <Target className="w-4 h-4" />,
          color: "text-yellow-400 border-yellow-400"
        };
      case GameState.INVESTIGATING:
        return {
          title: "Find Target",
          description: `Locate ${targetName} and approach carefully`,
          icon: <AlertTriangle className="w-4 h-4" />,
          color: "text-red-400 border-red-400"
        };
      case GameState.EQUIPPED:
        return {
          title: "Oh No...",
          description: "Something's not right...",
          icon: <AlertTriangle className="w-4 h-4" />,
          color: "text-red-600 border-red-600"
        };
      case GameState.BUSTED:
        return {
          title: currentTwist?.bustMessage || "TRAPPED! 🤣",
          description: currentTwist?.bustSubMessage || "You should have not taken the murder task, it was all a trap!",
          icon: <AlertTriangle className="w-4 h-4" />,
          color: "text-red-600 border-red-600"
        };
      case GameState.JAILED:
        return {
          title: "Locked Up",
          description: currentTwist?.jailMessage || "Serving time for attempted murder...",
          icon: <Package className="w-4 h-4" />,
          color: "text-gray-400 border-gray-400"
        };
      case GameState.RELEASED:
        return {
          title: "Freedom!",
          description: "Back on the streets... ready for another 'opportunity'?",
          icon: <CheckCircle className="w-4 h-4" />,
          color: "text-green-400 border-green-400"
        };
      default:
        return null;
    }
  };

  const currentObjective = getCurrentObjective();

  // Calculate minimap positions (scale down the world coordinates)
  const minimapScale = 0.8;
  const minimapSize = 120;
  const centerOffset = minimapSize / 2;

  const getMinimapPosition = (worldPos: { x: number; z: number }) => {
    return {
      x: (worldPos.x * minimapScale) + centerOffset,
      y: (worldPos.z * minimapScale) + centerOffset
    };
  };

  const playerMinimapPos = getMinimapPosition(player.position);

  // Get next objective location for minimap
  const getNextObjectiveMarker = () => {
    switch (player.gameState) {
      case GameState.IDLE:
        // Point to job giver (undercover)
        const jobGiver = npcs.find(npc => npc.type === 'undercover');
        return jobGiver ? { 
          pos: getMinimapPosition(jobGiver.position), 
          label: currentTwist?.npcAssignments?.jobGiver?.name?.split(' ')[0] || 'Marcus',
          color: 'bg-blue-400'
        } : null;
      
      case GameState.ASSIGNED:
        // Point to informant
        const informant = npcs.find(npc => npc.type === 'informant');
        return informant ? { 
          pos: getMinimapPosition(informant.position), 
          label: currentTwist?.npcAssignments?.informant?.name?.split(' ')[0] || 'Jenny',
          color: 'bg-yellow-400'
        } : null;
      
      case GameState.INVESTIGATING:
        // Point to target
        const target = npcs.find(npc => npc.type === 'target');
        return target ? { 
          pos: getMinimapPosition(target.position), 
          label: currentTwist?.npcAssignments?.target?.name?.split(' ')[0] || 'Tommy',
          color: 'bg-red-400'
        } : null;
      
      default:
        return null;
    }
  };

  const nextObjectiveMarker = getNextObjectiveMarker();

  return (
    <div className="game-ui">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* Player Status with Twist Info */}
        <div className="ui-element bg-black/60 backdrop-blur-sm border border-gray-600 rounded-lg p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">{player.username}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Loop #{player.currentLoop}</span>
              {currentTwist && (
                <Sparkles className="w-4 h-4 text-purple-400" title={currentTwist.name} />
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-sm">Health: {player.health}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm capitalize">{player.outfit}</span>
            </div>
          </div>
          
          <div className={`text-sm font-medium ${getStateColor(player.gameState)}`}>
            Status: {getStateText(player.gameState)}
          </div>

          {/* Twist Info */}
          {currentTwist && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-xs text-purple-400 font-medium">{currentTwist.name}</div>
              <div className="text-xs text-gray-400">{currentTwist.description}</div>
            </div>
          )}
        </div>

        {/* Outfit Button */}
        <button
          onClick={onOpenOutfitMenu}
          className="ui-element bg-black/60 backdrop-blur-sm border border-gray-600 rounded-lg p-3 hover:bg-black/80 transition-all text-white"
          title="Change Outfit"
        >
          <Package className="w-5 h-5" />
        </button>
      </div>

      {/* Current Objective Panel - Only show when there's an active objective */}
      {currentObjective && (
        <div className={`absolute top-4 right-4 ui-element bg-black/70 backdrop-blur-sm border-2 ${currentObjective.color} rounded-xl p-4 max-w-sm animate-pulse`}>
          <div className="flex items-center space-x-3 mb-2">
            {currentObjective.icon}
            <h4 className={`font-bold text-lg ${currentObjective.color.split(' ')[0]}`}>
              {currentObjective.title}
            </h4>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {currentObjective.description}
          </p>
          
          {/* Fun emoji for bust state */}
          {player.gameState === GameState.BUSTED && (
            <div className="mt-3 text-center">
              <div className="text-4xl mb-2">😂🚔</div>
              <div className="text-yellow-400 text-xs font-medium animate-pulse">
                {currentTwist?.warningMessage || "GOTCHA! The cops were watching all along!"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Mini Map */}
      <div className="absolute bottom-4 right-4 ui-element">
        <div className="bg-black/70 backdrop-blur-sm border border-gray-600 rounded-lg p-3">
          <div 
            className="bg-gray-800 rounded border relative overflow-hidden"
            style={{ width: minimapSize, height: minimapSize }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0">
              {[...Array(5)].map((_, i) => (
                <div key={`h-${i}`} 
                     className="absolute border-gray-700 border-t" 
                     style={{ 
                       top: `${(i + 1) * 20}%`, 
                       left: 0, 
                       right: 0 
                     }} 
                />
              ))}
              {[...Array(5)].map((_, i) => (
                <div key={`v-${i}`} 
                     className="absolute border-gray-700 border-l" 
                     style={{ 
                       left: `${(i + 1) * 20}%`, 
                       top: 0, 
                       bottom: 0 
                     }} 
                />
              ))}
            </div>

            {/* Player position */}
            <div 
              className="absolute w-3 h-3 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ 
                left: Math.max(6, Math.min(minimapSize - 6, playerMinimapPos.x)),
                top: Math.max(6, Math.min(minimapSize - 6, playerMinimapPos.y))
              }}
            >
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>

            {/* NPCs */}
            {npcs.map(npc => {
              const npcPos = getMinimapPosition(npc.position);
              const isVisible = npcPos.x >= 0 && npcPos.x <= minimapSize && 
                              npcPos.y >= 0 && npcPos.y <= minimapSize;
              
              if (!isVisible) return null;

              let color = 'bg-gray-400';
              if (npc.type === 'undercover') color = 'bg-purple-400';
              else if (npc.type === 'informant') color = 'bg-blue-400';
              else if (npc.type === 'target') color = 'bg-red-400';

              return (
                <div 
                  key={npc.id}
                  className={`absolute w-2 h-2 ${color} rounded-full transform -translate-x-1/2 -translate-y-1/2`}
                  style={{ 
                    left: npcPos.x,
                    top: npcPos.y
                  }}
                  title={npc.name}
                />
              );
            })}

            {/* Next objective marker */}
            {nextObjectiveMarker && (
              <div 
                className={`absolute w-4 h-4 ${nextObjectiveMarker.color} rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse border-2 border-white z-20`}
                style={{ 
                  left: Math.max(8, Math.min(minimapSize - 8, nextObjectiveMarker.pos.x)),
                  top: Math.max(8, Math.min(minimapSize - 8, nextObjectiveMarker.pos.y))
                }}
              />
            )}
          </div>
          
          <div className="flex items-center justify-center mt-2">
            <MapPin className="w-3 h-3 text-gray-400 mr-1" />
            <span className="text-gray-400 text-xs">
              {currentTwist ? currentTwist.name : 'City Center'}
            </span>
          </div>
          
          {/* Legend */}
          <div className="mt-2 text-xs text-gray-400 space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>You</span>
            </div>
            {nextObjectiveMarker && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${nextObjectiveMarker.color} rounded-full`}></div>
                <span>{nextObjectiveMarker.label}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interaction Prompt */}
      {interactionPrompt && (
        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 ui-element">
          <div className="bg-black/80 backdrop-blur-sm border border-yellow-400 rounded-lg px-4 py-2 animate-pulse">
            <div className="flex items-center space-x-2">
              <kbd className="bg-yellow-400 text-black px-2 py-1 rounded text-sm font-bold">E</kbd>
              <span className="text-yellow-400 font-medium">{interactionPrompt}</span>
            </div>
          </div>
        </div>
      )}

      {/* Extended Warning Messages - Stable Display for 5 seconds */}
      {player.gameState === GameState.BUSTED && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-red-900/95 backdrop-blur-lg border-2 border-red-500 rounded-xl p-8 text-center max-w-lg shadow-2xl animate-fade-in-stable">
            <div className="text-6xl mb-4">😂🚔</div>
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-4xl font-bold text-red-400 mb-4">
              {currentTwist?.bustMessage || "GOTCHA!"}
            </h2>
            <p className="text-red-300 text-xl mb-4 leading-relaxed">
              {currentTwist?.bustSubMessage || "You should have not taken the murder task!"}
            </p>
            <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4 mb-4">
              <p className="text-yellow-400 font-bold text-lg">
                {currentTwist?.warningMessage || "It was all a trap! 🤣"}
              </p>
            </div>
            <div className="mt-6 text-gray-300 text-sm">
              The "job" was a police sting operation all along!
            </div>
            <div className="mt-2 text-purple-400 text-xs">
              Loop #{player.currentLoop} - {currentTwist?.name || "Sunny Day Setup"}
            </div>
          </div>
        </div>
      )}

      {/* Extended Jail Message - Stable Display */}
      {player.gameState === GameState.JAILED && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-lg border-2 border-gray-500 rounded-xl p-8 text-center max-w-lg shadow-2xl animate-fade-in-stable">
            <div className="text-5xl mb-4">🏢⛓️</div>
            <h2 className="text-3xl font-bold text-gray-400 mb-4">BEHIND BARS</h2>
            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
              {currentTwist?.jailMessage || "Serving time for attempted murder..."}
            </p>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-4">
              <div className="text-yellow-400 text-sm font-medium">
                Maybe next time don't trust strangers with "easy money" 😏
              </div>
            </div>
            <div className="mt-4 text-purple-400 text-xs">
              {currentTwist?.name || "Sunny Day Setup"} - Loop #{player.currentLoop}
            </div>
            <div className="mt-2 text-gray-500 text-xs">
              Preparing for next cycle...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};