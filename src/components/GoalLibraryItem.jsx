import React, { useState } from 'react';

const GoalLibraryItem = ({ goal, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  
  const handleSave = () => {
    onUpdate({ ...goal, title });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-surface-container-high border-2 border-primary/50 rounded-2xl p-5 shadow-sm mb-4">
        <div className="mb-4">
           <input 
             className="w-full bg-white border border-primary/30 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/60 focus:border-primary outline-none transition-all font-semibold text-on-surface"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             autoFocus
           />
        </div>
        <div className="flex gap-3 justify-end items-center">
           <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-sm font-bold bg-surface-container hover:bg-surface-variant rounded-full flex items-center gap-2 text-on-surface-variant transition-colors">
             <span className="material-symbols-outlined text-[18px]">close</span> Cancel
           </button>
           <button onClick={handleSave} className="px-5 py-2 text-sm font-bold bg-primary text-on-primary rounded-full hover:bg-primary-dim flex items-center gap-2 shadow-sm transition-colors">
             <span className="material-symbols-outlined text-[18px]">check</span> Save
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-primary/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/60 transition-all mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
      <div>
        <h4 className="font-bold text-on-surface mb-3 leading-tight text-lg">{goal.title}</h4>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full border border-outline-variant/20">{goal.domain}</span>
          <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full">Level: {goal.skillLevel}</span>
          {(goal.diagnoses || []).map(d => (
            <span key={d} className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full">{d}</span>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end md:self-auto shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>
        <button onClick={() => onDelete(goal.id)} className="p-2.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    </div>
  );
};

export default GoalLibraryItem;
