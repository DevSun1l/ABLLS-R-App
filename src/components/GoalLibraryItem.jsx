import React, { useState } from 'react';

const GoalLibraryItem = ({ goal, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...goal });

    const handleSave = () => {
        onUpdate(editData);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="bg-white border-2 border-primary rounded-2xl p-6 shadow-xl transition-all h-full flex flex-col gap-4">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Edit Template #{goal.id.split('_').pop()}</span>
                    <button onClick={() => setIsEditing(false)} className="text-on-surface-variant hover:text-on-surface">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
                <textarea 
                    value={editData.title} 
                    onChange={e => setEditData({...editData, title: e.target.value})}
                    className="w-full bg-surface-container-high border-none p-3 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none min-h-[100px] resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                    <select 
                        value={editData.skillLevel} 
                        onChange={e => setEditData({...editData, skillLevel: e.target.value})}
                        className="bg-surface-container-high border-none p-2 rounded-lg text-xs font-bold focus:ring-2 focus:ring-primary/40 outline-none"
                    >
                        <option>Basic</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                    </select>
                    <div className="flex justify-end gap-2">
                        <button onClick={handleSave} className="bg-primary text-on-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary-dim transition-colors">Save</button>
                    </div>
                </div>
            </div>
        );
    }

    const levelColors = {
        'Basic': 'bg-tertiary-container/30 text-on-tertiary-container border-tertiary/10',
        'Intermediate': 'bg-primary-container/30 text-on-primary-container border-primary/10',
        'Advanced': 'bg-secondary-container/30 text-on-secondary-container border-secondary/10'
    };

    return (
        <div className="group bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-6xl">clinical_notes</span>
            </div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${levelColors[goal.skillLevel] || levelColors.Basic}`}>
                        {goal.skillLevel}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center transition-all">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onClick={() => onDelete(goal.id)} className="w-8 h-8 rounded-full bg-error/10 text-error hover:bg-error hover:text-on-error flex items-center justify-center transition-all">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                </div>
                
                <p className="text-on-surface font-bold text-sm leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
                    {goal.title}
                </p>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 mt-auto">
                <div className="flex items-center gap-2">
                    {goal.diagnoses?.map(d => (
                        <span key={d} className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">
                            {d}
                        </span>
                    ))}
                    {(!goal.diagnoses || goal.diagnoses.length === 0) && <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Global</span>}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
                    <span className="material-symbols-outlined text-[14px]">local_activity</span>
                    Protocol Template
                </div>
            </div>
        </div>
    );
};

export default GoalLibraryItem;
