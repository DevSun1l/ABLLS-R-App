import React from 'react';
import { useNavigate } from 'react-router-dom';

const getDiagnosisColor = (diagnosis) => {
  switch(diagnosis) {
    case 'ASD': return 'bg-[#EEEDFE] text-[#3C3489]';
    case 'ADHD': return 'bg-[#9FE1CB] text-[#085041]';
    case 'DD': return 'bg-[#FAC775] text-[#633806]';
    default: return 'bg-[#D3D1C7] text-[#444441]';
  }
};

const StudentCard = ({ student }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white border-2 border-outline-variant/20 hover:border-primary/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface font-headline leading-tight mb-1">{student.name}</h3>
          <p className="text-sm font-bold text-on-surface-variant/80">{student.ageYears}y {student.ageMonths}m</p>
        </div>
        {student.masteryPercent !== undefined && (
           <div className="bg-primary/10 text-primary text-xs font-black tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap uppercase">
             {student.masteryPercent}% Mastery
           </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {(student.diagnoses || []).map(d => (
          <span key={d} className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-black ${getDiagnosisColor(d)}`}>
            {d}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-auto border-t border-outline-variant/10 pt-4">
        <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">event</span> {student.lastAssessed || 'Never'}
        </span>
        <button 
          onClick={() => navigate(student.masteryPercent !== undefined ? `/progress/${student.id}` : `/assessment/${student.id}`)}
          className="text-primary font-bold text-xs uppercase tracking-widest hover:text-primary-dim transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-300"
        >
          {student.masteryPercent !== undefined ? 'View Progress' : 'Continue Test'} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
