import React from 'react';

const StudentAvatar = ({ seed, mood = 'stable', size = 'md' }) => {
  // Simple seed-based color generation
  const colors = [
    { bg: 'bg-primary-container', text: 'text-primary' },
    { bg: 'bg-tertiary-container', text: 'text-tertiary' },
    { bg: 'bg-secondary-container', text: 'text-secondary' },
    { bg: 'bg-error-container', text: 'text-error' },
  ];

  const getHash = (str) => {
    let hash = 0;
    if (!str) return 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
       hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const color = colors[getHash(seed) % colors.length];

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-24 h-24 text-xl',
    xl: 'w-32 h-32 text-2xl',
  };

  return (
    <div className={`relative ${sizeClasses[size]} shrink-0 group`}>
      {/* Background Pulse Layer */}
      <div className={`absolute inset-0 rounded-full ${color.bg} opacity-20 animate-pulse scale-110 blur-md group-hover:opacity-40 transition-opacity`}></div>
      
      {/* Main Avatar Body */}
      <div className={`relative inset-0 w-full h-full rounded-full ${color.bg} border-2 border-white flex items-center justify-center shadow-sm overflow-hidden`}>
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-gradient-slow opacity-40"></div>
        
        {/* Simple Abstract Face SVG with Breathing Animation */}
        <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 animate-breathing opacity-80">
          <circle cx="50" cy="45" r="35" fill="currentColor" className={color.text} />
          {/* Eyes with Blinking */}
          <g className="animate-blinking">
            <circle cx="35" cy="40" r="4" fill="white" />
            <circle cx="65" cy="40" r="4" fill="white" />
          </g>
          {/* Smile/Expression based on mood */}
          {mood === 'active' && (
            <path d="M35 60 Q50 75 65 60" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" className="animate-bounce-subtle" />
          )}
          {mood === 'stable' && (
            <path d="M35 65 Q50 70 65 65" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
          )}
          {mood === 'attention' && (
            <path d="M35 70 Q50 60 65 70" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
          )}
        </svg>

        {/* Glossy Overlay */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
      </div>

      {/* Mood Indicator Badge */}
      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${mood === 'active' ? 'bg-success' : mood === 'stable' ? 'bg-primary' : 'bg-error'} animate-ping opacity-75`}></div>
      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${mood === 'active' ? 'bg-success' : mood === 'stable' ? 'bg-primary' : 'bg-error'}`}></div>

      <style jsx>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.05) translateY(-2px); }
        }
        @keyframes blinking {
          0%, 45%, 55%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-breathing { animation: breathing 4s ease-in-out infinite; }
        .animate-blinking { animation: blinking 5s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default StudentAvatar;
