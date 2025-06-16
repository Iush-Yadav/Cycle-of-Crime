import React from 'react';
import { X, Shirt } from 'lucide-react';

interface OutfitSelectorProps {
  currentOutfit: string;
  onOutfitChange: (outfit: string) => void;
  onClose: () => void;
}

const outfits = [
  { id: 'street', name: 'Street Clothes', description: 'Hoodie and jeans' },
  { id: 'trench', name: 'Black Trench Coat', description: 'For serious business' },
  { id: 'prison', name: 'Orange Jumpsuit', description: 'Fresh from jail' },
  { id: 'casual', name: 'Casual Wear', description: 'T-shirt and cargo pants' }
];

export const OutfitSelector: React.FC<OutfitSelectorProps> = ({
  currentOutfit,
  onOutfitChange,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-600 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shirt className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-semibold text-white">Change Outfit</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outfit Options */}
        <div className="space-y-3">
          {outfits.map((outfit) => (
            <button
              key={outfit.id}
              onClick={() => {
                onOutfitChange(outfit.id);
                onClose();
              }}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                currentOutfit === outfit.id
                  ? 'bg-orange-500/20 border-orange-400 text-orange-400'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 hover:text-white'
              }`}
            >
              <div className="font-medium mb-1">{outfit.name}</div>
              <div className="text-sm opacity-70">{outfit.description}</div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Your outfit affects how NPCs react to you
        </div>
      </div>
    </div>
  );
};