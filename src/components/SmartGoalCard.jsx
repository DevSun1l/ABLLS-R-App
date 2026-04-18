import React from 'react';

const SmartGoalCard = ({ index, goal }) => {
  const palettes = [
    {
      frame: 'border-primary/20 bg-primary/5',
      rail: 'bg-primary',
      badge: 'bg-primary/15 text-primary',
      chipA: 'bg-primary/10 text-primary',
      chipB: 'bg-sky-100 text-sky-800',
      panel: 'bg-white/80 border-primary/10',
    },
    {
      frame: 'border-secondary/20 bg-secondary/5',
      rail: 'bg-secondary',
      badge: 'bg-secondary/15 text-secondary',
      chipA: 'bg-secondary/10 text-secondary',
      chipB: 'bg-amber-100 text-amber-800',
      panel: 'bg-white/80 border-secondary/10',
    },
    {
      frame: 'border-tertiary/20 bg-tertiary/5',
      rail: 'bg-tertiary',
      badge: 'bg-tertiary/15 text-tertiary',
      chipA: 'bg-tertiary/10 text-tertiary',
      chipB: 'bg-emerald-100 text-emerald-800',
      panel: 'bg-white/80 border-tertiary/10',
    },
  ];

  const palette = palettes[(index - 1) % palettes.length];

  return (
    <div className={`border rounded-[1.75rem] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group mt-4 mb-4 text-left ${palette.frame}`}>
      <div className={`absolute top-0 left-0 w-2 h-full ${palette.rail}`}></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`font-bold text-lg w-9 h-9 rounded-full flex items-center justify-center ${palette.badge}`}>
          {index}
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
           <span className={`px-3 py-1 rounded-full ${palette.chipA}`}>{goal.strategy || 'Strategy'}</span>
           <span className={`px-3 py-1 rounded-full ${palette.chipB}`}>{goal.serviceType || 'Individual'}</span>
        </div>
      </div>
      
      <div className={`pl-4 border-l-2 mb-4 ${palette.rail.replace('bg-', 'border-')}`}>
        <h4 className="text-sm font-semibold text-textSecondary uppercase mb-1 tracking-wide">SMART Goal</h4>
        <p className="text-textPrimary text-lg font-medium leading-relaxed">{goal.smartGoal}</p>
      </div>

      <div className={`pl-4 p-4 rounded-2xl border ${palette.panel}`}>
        <h4 className="text-sm font-semibold text-textSecondary uppercase mb-1 tracking-wide">Activity</h4>
        <p className="text-textPrimary">{goal.activity}</p>
      </div>
    </div>
  );
};

export default SmartGoalCard;
