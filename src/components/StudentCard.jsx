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
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-textPrimary leading-tight mb-1">{student.name}</h3>
          <p className="text-sm text-textSecondary">{student.ageYears}y {student.ageMonths}m</p>
        </div>
        {student.masteryPercent !== undefined && (
           <div className="bg-success/10 text-success text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
             {student.masteryPercent}% Mastery
           </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {(student.diagnoses || []).map(d => (
          <span key={d} className={`text-xs px-2.5 py-1 rounded-full font-medium ${getDiagnosisColor(d)}`}>
            {d}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-auto border-t border-border pt-4">
        <span className="text-xs text-textSecondary">
          Last assessed: {student.lastAssessed || 'Never'}
        </span>
        <button 
          onClick={() => navigate(student.masteryPercent !== undefined ? `/progress/${student.id}` : `/assessment/${student.id}`)}
          className="text-primary font-medium text-sm hover:text-primary/80 transition-colors flex items-center"
        >
          {student.masteryPercent !== undefined ? 'View Progress' : 'Continue Assessment'} &rarr;
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
