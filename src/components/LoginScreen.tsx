import React, { useState, useEffect } from 'react';
import { User, Play, Skull, Shield, Target, Eye, Zap, AlertTriangle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
  isLoading: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading }) => {
  const [username, setUsername] = useState('');
  const [currentSlogan, setCurrentSlogan] = useState(0);

  const slogans = [
    "Every choice has consequences...",
    "Trust no one in the underworld",
    "The cycle never ends",
    "One wrong move changes everything",
    "Welcome to the criminal underground"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Police Sirens Effect */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-blue-500 to-red-500 animate-pulse opacity-30"></div>
        
        {/* Floating Crime Icons */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              {i % 4 === 0 && <Skull className="w-8 h-8 text-red-400" />}
              {i % 4 === 1 && <Shield className="w-8 h-8 text-blue-400" />}
              {i % 4 === 2 && <Target className="w-8 h-8 text-yellow-400" />}
              {i % 4 === 3 && <Eye className="w-8 h-8 text-green-400" />}
            </div>
          ))}
        </div>

        {/* City Skyline Silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-gray-900 to-transparent">
          <div className="absolute bottom-0 w-full h-32 bg-black opacity-80"></div>
          {/* Building silhouettes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 bg-gray-800 opacity-60"
              style={{
                left: `${i * 12.5}%`,
                width: `${8 + Math.random() * 6}%`,
                height: `${60 + Math.random() * 80}px`
              }}
            >
              {/* Windows */}
              {[...Array(Math.floor(Math.random() * 6) + 2)].map((_, j) => (
                <div
                  key={j}
                  className="absolute w-2 h-2 bg-yellow-300 opacity-70 animate-pulse"
                  style={{
                    left: `${20 + (j % 3) * 25}%`,
                    top: `${20 + Math.floor(j / 3) * 20}%`,
                    animationDelay: `${Math.random() * 3}s`
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10 w-full max-w-lg p-8">
        {/* Game Title with Crime Theme */}
        <div className="text-center mb-8">
          <div className="relative">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent mb-2 drop-shadow-2xl">
              CYCLE OF CRIME
            </h1>
            <div className="absolute -top-2 -right-2">
              <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Skull className="w-6 h-6 text-gray-400 animate-bounce" />
            </div>
          </div>
          
          {/* Animated Slogan */}
          <div className="h-8 flex items-center justify-center">
            <p className="text-gray-300 text-lg font-medium animate-fade-in-out">
              {slogans[currentSlogan]}
            </p>
          </div>
        </div>

        {/* Interactive Login Card */}
        <div className="bg-black/60 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-blue-500/20 rounded-2xl animate-pulse"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">
                Criminal Alias
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5 group-focus-within:text-red-300 transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 font-medium"
                  placeholder="Enter your street name"
                  disabled={isLoading}
                  maxLength={20}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim() || isLoading}
              className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 disabled:from-gray-700 disabled:via-gray-800 disabled:to-gray-900 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/25"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>ENTERING THE UNDERWORLD...</span>
                </div>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  <span>ENTER THE CYCLE</span>
                  <Zap className="w-5 h-5 animate-pulse" />
                </>
              )}
            </button>
          </form>

          {/* Crime Stats Display */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/20">
              <div className="text-red-400 font-bold text-lg">∞</div>
              <div className="text-gray-400 text-xs uppercase">Loops</div>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/20">
              <div className="text-blue-400 font-bold text-lg">?</div>
              <div className="text-gray-400 text-xs uppercase">Choices</div>
            </div>
            <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/20">
              <div className="text-yellow-400 font-bold text-lg">0</div>
              <div className="text-gray-400 text-xs uppercase">Escapes</div>
            </div>
          </div>
        </div>

        {/* Game Info with Crime Theme */}
        <div className="mt-8 text-center space-y-3">
          <div className="flex items-center justify-center space-x-6 text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">WASD</kbd>
              <span>Move</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">SPACE</kbd>
              <span>Jump</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">E</kbd>
              <span>Interact</span>
            </div>
          </div>
          
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2 text-red-400 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>WARNING: This game contains mature criminal themes</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          
          <p className="text-gray-500 text-xs">
            Every decision leads to consequences. Can you break the cycle?
          </p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes fade-in-out {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};