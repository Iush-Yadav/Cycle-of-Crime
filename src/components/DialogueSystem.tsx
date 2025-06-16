import React from 'react';
import { X, MessageCircle } from 'lucide-react';
import { DialogueNode, DialogueOption } from '../types/GameTypes';

interface DialogueSystemProps {
  dialogue: DialogueNode;
  onOptionSelect: (option: DialogueOption) => void;
  onClose: () => void;
  npcName: string;
}

export const DialogueSystem: React.FC<DialogueSystemProps> = ({
  dialogue,
  onOptionSelect,
  onClose,
  npcName
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-600 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">{npcName}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialogue Text */}
        <div className="bg-black/40 rounded-lg p-4 mb-6">
          <p className="text-gray-200 text-lg leading-relaxed">
            {dialogue.text}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {dialogue.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onOptionSelect(option)}
              className="w-full text-left bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 rounded-lg p-4 transition-all duration-200 group"
            >
              <div className="flex items-start space-x-3">
                <span className="text-orange-400 font-bold text-sm mt-1">
                  {index + 1}.
                </span>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {option.text}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Controls hint */}
        <div className="mt-4 text-center text-gray-500 text-sm">
          Press number keys 1-{dialogue.options.length} or click to choose
        </div>
      </div>
    </div>
  );
};