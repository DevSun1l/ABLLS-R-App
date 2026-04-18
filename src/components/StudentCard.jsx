import React from 'react';
import StudentAvatar from './StudentAvatar';

const DIAGNOSES = ['ASD', 'ADHD', 'DD', 'Other'];

const getDiagnosisColor = (diagnosis) => {
  switch(diagnosis) {
    case 'ASD': return 'bg-primary/10 text-primary';
    case 'ADHD': return 'bg-tertiary/10 text-tertiary';
    case 'DD': return 'bg-secondary/10 text-secondary';
    default: return 'bg-surface-container-high text-on-surface-variant';
  }
};

const StudentCard = ({
  student,
  onViewProgress,
  onStartAssessment,
  onDeleteStudent,
}) => {
  const mood = student.masteryPercent > 70 ? 'active' : student.masteryPercent < 40 ? 'attention' : 'stable';
  const hasAssessment = Boolean(student.hasAssessment || student.assessmentCount > 0);

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-outline-variant/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative flex flex-col h-full">
      <div className="flex items-center gap-5 mb-8">
        <StudentAvatar seed={student.id} mood={mood} size="md" />
        <div className="flex-1 min-w-0">
          <h4 className="font-headline font-black text-on-surface text-xl leading-none truncate group-hover:text-primary transition-colors">{student.name}</h4>
          <p className="text-xs text-on-surface-variant font-bold opacity-40 uppercase tracking-widest mt-2 flex items-center gap-2">
            Age: {student.ageYears} • {student.assessmentCount > 0 ? `${student.assessmentCount} assessment${student.assessmentCount > 1 ? 's' : ''}` : 'No assessments yet'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(student.diagnoses || []).map((d) => (
          <span key={d} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-white shadow-sm ${getDiagnosisColor(d)}`}>
            {d}
          </span>
        ))}
      </div>

      <div className="bg-surface-container-low px-6 py-4 rounded-2xl flex items-center justify-between mb-8 border border-outline-variant/5 transition-colors group-hover:bg-primary/5">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">
            {hasAssessment ? 'Mastery Curve' : 'Assessment Status'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-on-surface">
              {hasAssessment ? `${student.masteryPercent || 0}%` : 'Ready'}
            </span>
            <span className={`text-[10px] font-black ${hasAssessment ? 'text-success' : 'text-secondary'} flex items-center`}>
              <span className="material-symbols-outlined text-[14px]">{hasAssessment ? 'analytics' : 'assignment'}</span>
              {hasAssessment ? 'Results available' : 'Start assessment'}
            </span>
          </div>
        </div>
        <div className="w-12 h-1 bg-outline-variant/20 rounded-full relative overflow-hidden">
           <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${hasAssessment ? student.masteryPercent || 0 : 20}%` }} />
        </div>
      </div>

      <div className="mt-auto space-y-3">
        {hasAssessment ? (
          <button
            onClick={() => onViewProgress(student)}
            className="w-full bg-white border border-primary/10 text-primary py-4 rounded-full flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 shadow-sm"
          >
            Analyze Progress
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={() => onStartAssessment(student)}
            className="w-full bg-primary text-on-primary py-4 rounded-full flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-primary-dim hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 shadow-sm"
          >
            Start Assessment
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">play_arrow</span>
          </button>
        )}

        <button
          onClick={() => onDeleteStudent(student)}
          className="w-full bg-white border border-error/15 text-error py-3.5 rounded-full flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-error/8 transition-all active:scale-95 shadow-sm"
        >
          Delete Student
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  );
};

export const StudentAssessmentModal = ({
  open,
  student,
  formData,
  setFormData,
  saving,
  onClose,
  onSubmit,
}) => {
  if (!open || !student) return null;

  const toggleDiagnosis = (diag) => {
    setFormData((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses.includes(diag)
        ? prev.diagnoses.filter((entry) => entry !== diag)
        : [...prev.diagnoses, diag],
    }));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white border border-outline-variant/10 shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-black text-on-surface">Confirm Student Details</h3>
            <p className="mt-2 text-sm text-on-surface-variant">Review or update the student profile before starting the assessment.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-primary uppercase tracking-[0.25em]">Full Name</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-surface-container-low border-none rounded-full px-6 py-4 text-lg font-bold focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-primary uppercase tracking-[0.25em]">Assessment Date</label>
              <input
                type="date"
                required
                value={formData.assessmentDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, assessmentDate: e.target.value }))}
                className="w-full bg-surface-container-low border-none rounded-full px-6 py-4 text-lg font-bold focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-primary uppercase tracking-[0.25em]">Age</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    value={formData.ageYears}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ageYears: parseInt(e.target.value, 10) }))}
                    className="w-full appearance-none bg-surface-container-low border-none rounded-full px-6 pr-12 py-4 text-lg font-bold"
                  >
                    {[...Array(19).keys()].map((year) => <option key={year} value={year}>{year} Years</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/50">expand_more</span>
                </div>
                <div className="relative">
                  <select
                    value={formData.ageMonths}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ageMonths: parseInt(e.target.value, 10) }))}
                    className="w-full appearance-none bg-surface-container-low border-none rounded-full px-6 pr-12 py-4 text-lg font-bold"
                  >
                    {[...Array(12).keys()].map((month) => <option key={month} value={month}>{month} Months</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/50">expand_more</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-primary uppercase tracking-[0.25em]">Assessor</label>
              <input
                required
                value={formData.assessor}
                onChange={(e) => setFormData((prev) => ({ ...prev, assessor: e.target.value }))}
                className="w-full bg-surface-container-low border-none rounded-full px-6 py-4 text-lg font-bold focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-primary uppercase tracking-[0.25em]">Diagnoses</label>
            <div className="flex flex-wrap gap-3">
              {DIAGNOSES.map((diag) => (
                <button
                  key={diag}
                  type="button"
                  onClick={() => toggleDiagnosis(diag)}
                  className={`px-5 py-3 rounded-full text-sm font-black transition-all border ${
                    formData.diagnoses.includes(diag)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-on-surface border-outline-variant/10'
                  }`}
                >
                  {diag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-primary uppercase tracking-[0.25em]">Notes</label>
            <textarea
              rows="4"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-surface-container-low border-none rounded-[1.5rem] px-6 py-4 text-base font-medium focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-end pt-4 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant hover:bg-surface-container-high transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] bg-primary text-on-primary shadow-lg shadow-primary/20"
            >
              {saving ? 'Saving...' : 'Save & Start Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentCard;
