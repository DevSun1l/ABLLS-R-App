import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GOAL_LIBRARY } from '../data/goalLibrary';
import GoalLibraryItem from '../components/GoalLibraryItem';
import { v4 as uuidv4 } from 'uuid';

const GoalLibraryPage = () => {
  const { user, logout } = useAuth();
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
    if (window.confirm("Delete this goal? This cannot be undone.")) {
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
    <div className="bg-background text-on-surface min-h-screen flex font-body">
      {/* Sidebar matching AdminDashboard! */}
      <aside className="h-screen w-72 flex-col fixed left-0 top-0 border-r border-primary/10 bg-[#f8f1fa] z-40 hidden md:flex py-8 space-y-2">
        <div className="px-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary">clinical_notes</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#34313a] font-headline">Cognify</h1>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Admin Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-grow">
          <button onClick={() => navigate('/admin', { state: { tab: 'overview' } })} className="w-[calc(100%-1rem)] text-left text-[#34313a]/70 hover:bg-white/50 rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label">Overview</span>
          </button>
          <button onClick={() => navigate('/admin', { state: { tab: 'users' } })} className="w-[calc(100%-1rem)] text-left text-[#34313a]/70 hover:bg-white/50 rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label">User Access</span>
          </button>
          <button onClick={() => navigate('/admin', { state: { tab: 'organizations' } })} className="w-[calc(100%-1rem)] text-left text-[#34313a]/70 hover:bg-white/50 rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all">
            <span className="material-symbols-outlined">corporate_fare</span>
            <span className="font-label">Organizations</span>
          </button>
          <button onClick={() => navigate('/admin', { state: { tab: 'data' } })} className="w-[calc(100%-1rem)] text-left text-[#34313a]/70 hover:bg-white/50 rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label">Data & Backups</span>
          </button>
          <button className="bg-white text-[#6750A4] shadow-sm w-[calc(100%-1rem)] text-left px-4 py-3 my-1 mx-2 flex items-center gap-3 font-bold rounded-full transition-all">
            <span className="material-symbols-outlined">menu_book</span>
            <span className="font-label">Goal Library</span>
          </button>
        </nav>
        <div className="mt-auto px-2 space-y-1">
          <button onClick={logout} className="w-full text-left font-bold text-[#34313a]/70 px-4 py-3 my-1 flex items-center gap-3 hover:bg-white/50 rounded-full transition-all">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Form Content */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="bg-[#fdf7fe]/80 backdrop-blur-lg fixed top-0 right-0 left-0 md:left-72 z-50 shadow-sm shadow-purple-500/5 px-6 py-3 flex justify-between items-center h-[68px]">
          <div className="flex items-center gap-4 flex-1 max-w-xl"></div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-surface">Admin Dashboard</p>
                <p className="text-[10px] text-on-surface-variant capitalize">{user?.role} Access</p>
              </div>
              <div className="w-10 h-10 rounded-full object-cover border-2 border-primary-container bg-primary text-white flex items-center justify-center font-bold">
                 {user?.first_name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        <section className="pt-24 pb-12 px-6 md:px-10 max-w-5xl mx-auto w-full flex-1">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
             <div>
               <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-on-surface mb-2">Intervention Goal Library</h1>
               <p className="text-lg text-on-surface-variant font-medium">Manage global intervention goal templates.</p>
             </div>
             <button 
               onClick={() => setIsAdding(true)}
               className="bg-primary hover:bg-primary-dim text-on-primary shadow-sm hover:shadow-md transition-all duration-300 font-bold py-3 px-6 rounded-full transform hover:-translate-y-0.5 flex items-center gap-2"
             >
               <span className="material-symbols-outlined text-sm">add</span> Add goal
             </button>
           </div>

           {isAdding && (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 shadow-sm mb-12">
                 <h2 className="font-bold text-xl font-headline mb-6 text-on-surface border-b border-outline-variant/20 pb-4">Create Goal Template</h2>
                 <form onSubmit={submitNewGoal} className="space-y-6">
                    <div>
                       <label className="block text-sm font-bold text-on-surface mb-2">Goal Title</label>
                       <input type="text" required value={newGoal.title} onChange={e=>setNewGoal({...newGoal, title: e.target.value})} className="w-full bg-surface-container-high border-none p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-on-surface transition-all" placeholder="e.g. Will independently request desired items..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-bold text-on-surface mb-2">Domain</label>
                          <select value={newGoal.domain} onChange={e=>setNewGoal({...newGoal, domain: e.target.value})} className="w-full bg-surface-container-high border-none p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-on-surface transition-all cursor-pointer">
                             <option>Communication / Language</option>
                             <option>Social Skills</option>
                             <option>Academic / Classroom Skills</option>
                             <option>Self-Help / Daily Living</option>
                             <option>Motor Skills</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-on-surface mb-2">Skill Level</label>
                          <select value={newGoal.skillLevel} onChange={e=>setNewGoal({...newGoal, skillLevel: e.target.value})} className="w-full bg-surface-container-high border-none p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-on-surface transition-all cursor-pointer">
                             <option>Basic</option>
                             <option>Intermediate</option>
                             <option>Advanced</option>
                          </select>
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-on-surface mb-3">Target Diagnoses</label>
                       <div className="flex flex-wrap gap-2">
                          {["ASD", "ADHD", "DD", "All"].map(d => (
                             <button type="button" key={d} onClick={() => toggleDiag(d)} className={`px-4 py-2 text-sm font-bold rounded-full transition-all border ${newGoal.diagnoses.includes(d) ? 'bg-primary text-on-primary border-primary shadow-sm hover:bg-primary-dim' : 'bg-surface-container-high text-on-surface-variant border-transparent hover:bg-surface-variant'}`}>
                                {d}
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/20">
                       <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 font-bold text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-variant rounded-full transition-colors">Cancel</button>
                       <button type="submit" className="px-6 py-2.5 font-bold text-on-primary bg-primary rounded-full hover:bg-primary-dim transition-colors shadow-sm">Save Template</button>
                    </div>
                 </form>
              </div>
           )}

           {["Communication / Language", "Social Skills", "Academic / Classroom Skills", "Self-Help / Daily Living", "Motor Skills"].map(domain => {
              const domainGoals = goals.filter(g => g.domain === domain);
              if (domainGoals.length === 0) return null;
              return (
                 <div key={domain} className="mb-10 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10">
                    <h2 className="text-xl font-bold font-headline text-on-surface mb-6 flex items-center border-b border-outline-variant/20 pb-4">
                      {domain} 
                      <span className="text-xs font-bold text-primary bg-primary-container px-3 py-1 rounded-full ml-3">{domainGoals.length} templates</span>
                    </h2>
                    <div className="flex flex-col gap-4">
                       {domainGoals.map(goal => (
                          <GoalLibraryItem key={goal.id} goal={goal} onUpdate={handleUpdate} onDelete={handleDelete} />
                       ))}
                    </div>
                 </div>
              );
           })}
        </section>
      </main>
    </div>
  );
};

export default GoalLibraryPage;
