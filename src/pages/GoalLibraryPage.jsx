import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GOAL_LIBRARY } from '../data/goalLibrary';
import GoalLibraryItem from '../components/GoalLibraryItem';
import AdminLayout from '../components/AdminLayout';
import { v4 as uuidv4 } from 'uuid';

const GoalLibraryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
     title: '', domain: 'Communication / Language', diagnoses: [], skillLevel: 'Basic'
  });

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const rawData = sessionStorage.getItem('ablls_goals');
    if (rawData) {
      setGoals(JSON.parse(rawData));
    } else {
      setGoals(GOAL_LIBRARY);
      sessionStorage.setItem('ablls_goals', JSON.stringify(GOAL_LIBRARY));
    }
  }, []);

  const saveGoals = (newGoals) => {
    setGoals(newGoals);
    sessionStorage.setItem('ablls_goals', JSON.stringify(newGoals));
  };

  const handleUpdate = (updatedGoal) => {
    const newGoals = goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    saveGoals(newGoals);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this goal template? This action is irreversible.")) {
      const newGoals = goals.filter(g => g.id !== id);
      saveGoals(newGoals);
    }
  };

  const submitNewGoal = (e) => {
    e.preventDefault();
    const goalToAdd = {
       ...newGoal,
       id: `g_new_${uuidv4().substring(0,8)}`,
       ablls_domains: ["A"], 
       benefitTemplate: "This will help [child's name] improve [skill area] by developing [target ability], which is currently affected by weaknesses in [ABLLS-R domain] and characteristics associated with [diagnosis].",
       adminEditable: true
    };
    const newGoals = [goalToAdd, ...goals];
    saveGoals(newGoals);
    setIsAdding(false);
    setNewGoal({ title: '', domain: 'Communication / Language', diagnoses: [], skillLevel: 'Basic' });
  };

  const toggleDiag = (d) => {
     setNewGoal(prev => ({
        ...prev, 
        diagnoses: prev.diagnoses.includes(d) ? prev.diagnoses.filter(x => x !== d) : [...prev.diagnoses, d]
     }));
  };

  return (
    <AdminLayout activeTab="goals">
      <div className="p-6 min-h-[calc(100vh-4rem)]">
        <section className="w-full flex-1">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 border-b border-outline-variant/10 pb-8">
             <div>
               <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-on-surface mb-2">Intervention Goal Library</h1>
               <p className="text-lg text-on-surface-variant font-medium opacity-80">Curate and manage global clinical intervention templates.</p>
             </div>
             <button 
               onClick={() => setIsAdding(true)}
               className="bg-primary hover:bg-primary-dim text-on-primary shadow-lg shadow-primary/20 transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] py-5 px-10 rounded-full transform hover:-translate-y-1 flex items-center gap-3"
             >
               <span className="material-symbols-outlined">add</span> Create Goal
             </button>
           </div>

           {isAdding && (
              <div className="bg-surface-container-lowest border-2 border-primary/20 rounded-2xl p-10 shadow-xl mb-12 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 select-none group-hover:scale-110 transition-transform">
                   <span className="material-symbols-outlined text-9xl">post_add</span>
                 </div>
                 <h2 className="font-black text-2xl font-headline mb-8 text-on-surface tracking-tight flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">edit_document</span>
                    New Clinical Template
                 </h2>
                 <form onSubmit={submitNewGoal} className="space-y-8 relative z-10">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Goal Definition</label>
                       <textarea 
                        required 
                        value={newGoal.title} 
                        onChange={e=>setNewGoal({...newGoal, title: e.target.value})} 
                        className="w-full bg-surface-container-high border-none p-5 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-on-surface font-medium transition-all min-h-[120px] resize-none" 
                        placeholder="Define the clinical objective (e.g. Will independently initiate social requests...)" 
                       />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Clinical Domain</label>
                          <select 
                            value={newGoal.domain} 
                            onChange={e=>setNewGoal({...newGoal, domain: e.target.value})} 
                            className="w-full bg-surface-container-high border-none p-4 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-on-surface font-bold transition-all cursor-pointer appearance-none"
                          >
                             <option>Communication / Language</option>
                             <option>Social Skills</option>
                             <option>Academic / Classroom Skills</option>
                             <option>Self-Help / Daily Living</option>
                             <option>Motor Skills</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Target Mastery Level</label>
                          <select 
                            value={newGoal.skillLevel} 
                            onChange={e=>setNewGoal({...newGoal, skillLevel: e.target.value})} 
                            className="w-full bg-surface-container-high border-none p-4 rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none text-on-surface font-bold transition-all cursor-pointer appearance-none"
                          >
                             <option>Basic</option>
                             <option>Intermediate</option>
                             <option>Advanced</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Target Diagnoses</label>
                       <div className="flex flex-wrap gap-3">
                          {["ASD", "ADHD", "DD", "SPD", "All"].map(d => (
                             <button 
                                type="button" 
                                key={d} 
                                onClick={() => toggleDiag(d)} 
                                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border-2 ${
                                    newGoal.diagnoses.includes(d) 
                                        ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 scale-105' 
                                        : 'bg-surface-container-high text-on-surface-variant border-transparent hover:bg-surface-variant hover:scale-105'
                                }`}
                             >
                                {d}
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-8 border-t border-outline-variant/10 mt-8">
                       <button 
                        type="button" 
                        onClick={() => setIsAdding(false)} 
                        className="px-8 py-4 font-black text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface bg-surface-container-high hover:bg-surface-variant rounded-full transition-all"
                       >
                            Cancel
                        </button>
                       <button 
                        type="submit" 
                        className="px-10 py-4 font-black text-xs uppercase tracking-widest text-on-primary bg-primary rounded-full hover:bg-primary-dim transition-all shadow-lg shadow-primary/20 active:scale-95"
                       >
                            Finalize Template
                       </button>
                    </div>
                 </form>
              </div>
           )}

           <div className="space-y-12">
            {["Communication / Language", "Social Skills", "Academic / Classroom Skills", "Self-Help / Daily Living", "Motor Skills"].map(domain => {
                const domainGoals = goals.filter(g => g.domain === domain);
                if (domainGoals.length === 0) return null;
                const domainIcon = {
                    "Communication / Language": "forum",
                    "Social Skills": "groups",
                    "Academic / Classroom Skills": "school",
                    "Self-Help / Daily Living": "wash",
                    "Motor Skills": "directions_run"
                }[domain] || "folder";

                return (
                    <div key={domain} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-black font-headline text-on-surface mb-8 flex items-center justify-between bg-surface-container-low px-8 py-4 rounded-2xl border border-outline-variant/10">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-primary">{domainIcon}</span>
                                <span>{domain}</span>
                            </div>
                            <span className="text-[10px] font-black text-primary bg-primary-container/40 border border-primary/10 px-4 py-1.5 rounded-full uppercase tracking-wider">
                                {domainGoals.length} protocol templates
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {domainGoals.map(goal => (
                                <GoalLibraryItem 
                                    key={goal.id} 
                                    goal={goal} 
                                    onUpdate={handleUpdate} 
                                    onDelete={handleDelete} 
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
           </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default GoalLibraryPage;
