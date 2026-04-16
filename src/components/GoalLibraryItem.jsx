import React, { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';

const GoalLibraryItem = ({ goal, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  
  const handleSave = () => {
    onUpdate({ ...goal, title });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-3">
        <div className="mb-3">
           <input 
             className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             autoFocus
           />
        </div>
        <div className="flex gap-2 justify-end">
           <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1 text-gray-700">
             <X className="w-4 h-4"/> Cancel
           </button>
           <button onClick={handleSave} className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-1">
             <Check className="w-4 h-4"/> Save
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow mb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h4 className="font-semibold text-textPrimary mb-2 leading-tight">{goal.title}</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-full border border-gray-200">{goal.domain}</span>
          <span className="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-200">Level: {goal.skillLevel}</span>
          {(goal.diagnoses || []).map(d => (
            <span key={d} className="bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded-full border border-purple-200">{d}</span>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
        <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(goal.id)} className="p-2 text-gray-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors border border-transparent">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GoalLibraryItem;
