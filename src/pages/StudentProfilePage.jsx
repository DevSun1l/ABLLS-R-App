import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const DIAGNOSES = ['ASD', 'ADHD', 'DD', 'Other'];

const StudentProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isNew = !id;
  
  const [formData, setFormData] = useState({
    name: '',
    ageYears: 0,
    ageMonths: 0,
    assessor: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '',
    assessmentDate: new Date().toISOString().split('T')[0],
    diagnoses: [],
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isNew) {
      const fetchStudent = async () => {
        try {
          const token = sessionStorage.getItem('ablls_token');
          const res = await fetch(`/api/students/get?id=${id}`, {
             headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
             const data = await res.json();
             setFormData({
                ...data.student,
                ageYears: data.student.age_years,
                ageMonths: data.student.age_months,
                diagnoses: data.student.diagnoses || [],
                assessor: data.student.assessor || (user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '')
             });
          }
        } catch (e) {
          console.error("Failed to load student", e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudent();
    } else {
      setIsLoading(false);
    }
  }, [id, isNew, user]);

  const handleDiagnosisToggle = (diag) => {
    setFormData(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.includes(diag) 
        ? prev.diagnoses.filter(d => d !== diag)
        : [...prev.diagnoses, diag]
    }));
  };

  const [submitAction, setSubmitAction] = useState('initiate');

  const handleSave = async (e) => {
    e.preventDefault();
    let targetId = id || uuidv4();
    try {
       const token = sessionStorage.getItem('ablls_token');
       const res = await fetch('/api/students/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
             id: targetId,
             ...formData
          })
       });
       if (res.ok) {
          if (submitAction === 'return') {
              navigate('/dashboard');
          } else {
              navigate(`/assessment/${targetId}`);
          }
       }
    } catch(err) {
       console.error("Failed to save student", err);
    }
  };

  if (isLoading) return (
     <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        <p className="text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">Establishing Identity Context...</p>
     </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="space-y-4">
        <h1 className="text-5xl font-black font-headline text-on-surface tracking-tighter">
          {isNew ? 'New Student Entry' : 'Refine Identity Profile'}
        </h1>
        <p className="text-on-surface-variant font-medium text-lg opacity-60">
          Establish the clinical baseline for assessment accuracy.
        </p>
      </div>
      
      <form onSubmit={handleSave} className="bg-white border border-outline-variant/10 rounded-[3rem] p-12 shadow-sm space-y-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-6">Full Identity Name</label>
          <input 
            type="text" required
            placeholder="e.g. Maya Chen"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-surface-container-low border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary focus:bg-white text-lg font-black transition-all placeholder:text-on-surface-variant/20"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-6">Age (Chronological Years)</label>
            <select 
              value={formData.ageYears} onChange={e => setFormData({...formData, ageYears: parseInt(e.target.value)})}
              className="w-full bg-surface-container-low border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary focus:bg-white text-lg font-black appearance-none"
            >
              {[...Array(19).keys()].map(y => <option key={y} value={y}>{y} Years</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-6">Developmental Months</label>
            <select 
              value={formData.ageMonths} onChange={e => setFormData({...formData, ageMonths: parseInt(e.target.value)})}
              className="w-full bg-surface-container-low border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary focus:bg-white text-lg font-black appearance-none"
            >
              {[...Array(12).keys()].map(m => <option key={m} value={m}>{m} Months</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-6">Assessor Signature</label>
            <input 
              type="text" required
              value={formData.assessor} onChange={e => setFormData({...formData, assessor: e.target.value})}
              className="w-full bg-surface-container-low border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary focus:bg-white text-lg font-black transition-all"
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-6">Entry Timestamp</label>
            <input 
              type="date" required
              value={formData.assessmentDate} onChange={e => setFormData({...formData, assessmentDate: e.target.value})}
              className="w-full bg-surface-container-low border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary focus:bg-white text-lg font-black"
            />
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-6">Clinical Observations (Diagnoses)</label>
          <div className="flex flex-wrap gap-4 px-2">
            {DIAGNOSES.map(diag => (
               <button
                 key={diag} type="button"
                 onClick={() => handleDiagnosisToggle(diag)}
                 className={`px-8 py-4 rounded-full font-black text-sm transition-all border-2 ${
                   formData.diagnoses.includes(diag) 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : 'bg-white text-on-surface border-outline-variant/10 hover:border-primary/40 hover:bg-primary/5'
                 }`}
               >
                 {diag}
               </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-6">Session Qualitative Notes</label>
          <textarea 
            rows="5"
            placeholder="Observe baseline behaviors, strengths, and priority concerns..."
            value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
            className="w-full bg-surface-container-low border-none rounded-[2rem] px-8 py-6 focus:ring-2 focus:ring-primary focus:bg-white text-lg font-medium transition-all placeholder:text-on-surface-variant/20 leading-relaxed"
          ></textarea>
        </div>

        <div className="pt-10 flex flex-col md:flex-row justify-end gap-4 border-t border-outline-variant/5">
           <button 
             type="button" onClick={() => navigate('/dashboard')}
             className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all"
           >
             Discard Entry
           </button>
           <button 
             type="submit" 
             onClick={() => setSubmitAction('return')}
             className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-primary bg-primary-container rounded-full hover:bg-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-primary/10"
           >
             <span className="material-symbols-outlined text-lg">save</span> Save & Return
           </button>
           <button 
             type="submit" 
             onClick={() => setSubmitAction('initiate')}
             className="px-10 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-on-primary bg-primary rounded-full hover:bg-primary-dim shadow-xl shadow-primary/20 transition-all hover:shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3"
           >
             Save & Initiate <span className="material-symbols-outlined text-lg">arrow_forward</span>
           </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfilePage;
