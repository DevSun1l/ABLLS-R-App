import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentAvatar from './StudentAvatar';

const getDiagnosisColor = (diagnosis) => {
  switch(diagnosis) {
    case 'ASD': return 'bg-primary/10 text-primary';
    case 'ADHD': return 'bg-tertiary/10 text-tertiary';
    case 'DD': return 'bg-secondary/10 text-secondary';
    default: return 'bg-surface-container-high text-on-surface-variant';
  }
};

const StudentCard = ({ student }) => {
  const navigate = useNavigate();
  
  // Determine mood based on mastery
  const mood = student.masteryPercent > 70 ? 'active' : student.masteryPercent < 40 ? 'attention' : 'stable';
  const trend = Math.floor(Math.random() * 8) + 1; // Simulated delta for trend

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-outline-variant/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative flex flex-col h-full">
      <div className="flex items-center gap-5 mb-8">
        <StudentAvatar seed={student.id} mood={mood} size="md" />
        <div className="flex-1 min-w-0">
          <h4 className="font-headline font-black text-on-surface text-xl leading-none truncate group-hover:text-primary transition-colors">{student.name}</h4>
          <p className="text-xs text-on-surface-variant font-bold opacity-40 uppercase tracking-widest mt-2 flex items-center gap-2">
            Age: {student.ageYears} • Grade {student.gradeLevel || 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(student.diagnoses || []).map(d => (
          <span key={d} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-white shadow-sm ${getDiagnosisColor(d)}`}>
            {d}
          </span>
        ))}
      </div>

      <div className="bg-surface-container-low px-6 py-4 rounded-2xl flex items-center justify-between mb-8 border border-outline-variant/5 transition-colors group-hover:bg-primary/5">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Mastery Curve</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-on-surface">{student.masteryPercent || 0}%</span>
            <span className="text-[10px] font-black text-success flex items-center">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
               +{trend}%
            </span>
          </div>
        </div>
        <div className="w-12 h-1 bg-outline-variant/20 rounded-full relative overflow-hidden">
           <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${student.masteryPercent || 0}%` }} />
        </div>
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => navigate(student.masteryPercent !== undefined ? `/progress/${student.id}` : `/assessment/${student.id}`)}
          className="w-full bg-white border border-primary/10 text-primary py-4 rounded-full flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 shadow-sm"
        >
          {student.masteryPercent !== undefined ? 'Analyze Progress' : 'Continue Test'}
          <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
