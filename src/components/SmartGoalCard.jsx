import React from 'react';

const SmartGoalCard = ({ index, goal }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group mt-4 mb-4 text-left">
      <div className="absolute top-0 left-0 w-2 h-full bg-primary/80"></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 text-primary font-bold text-lg w-8 h-8 rounded-full flex items-center justify-center">
          {index}
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
           <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{goal.strategy || 'Strategy Strategy'}</span>
           <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">{goal.serviceType || 'Individual'}</span>
        </div>
      </div>
      
      <div className="pl-4 border-l-2 border-gray-100 mb-4">
        <h4 className="text-sm font-semibold text-textSecondary uppercase mb-1 tracking-wide">SMART Goal</h4>
        <p className="text-textPrimary text-lg font-medium leading-relaxed">{goal.smartGoal}</p>
      </div>

      <div className="pl-4">
        <h4 className="text-sm font-semibold text-textSecondary uppercase mb-1 tracking-wide">Activity</h4>
        <p className="text-textPrimary">{goal.activity}</p>
      </div>
    </div>
  );
};

export default SmartGoalCard;
