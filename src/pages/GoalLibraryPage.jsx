import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GOAL_LIBRARY } from '../data/goalLibrary';
import GoalLibraryItem from '../components/GoalLibraryItem';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const GoalLibraryPage = () => {
  const { user } = useAuth();
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
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary tracking-tight">Intervention Goal Library</h1>
          <p className="text-textSecondary mt-1">Manage global intervention goal templates.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5"/> Add goal
        </button>
      </div>

      {isAdding && (
         <div className="bg-white border-2 border-primary rounded-xl p-6 shadow-md mb-8">
            <h2 className="font-bold text-lg mb-4 text-textPrimary border-b pb-2">Add New Goal Template</h2>
            <form onSubmit={submitNewGoal} className="space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-textSecondary mb-1">Goal Title</label>
                  <input type="text" required value={newGoal.title} onChange={e=>setNewGoal({...newGoal, title: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-semibold text-textSecondary mb-1">Domain</label>
                     <select value={newGoal.domain} onChange={e=>setNewGoal({...newGoal, domain: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none">
                        <option>Communication / Language</option>
                        <option>Social Skills</option>
                        <option>Academic / Classroom Skills</option>
                        <option>Self-Help / Daily Living</option>
                        <option>Motor Skills</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-textSecondary mb-1">Skill Level</label>
                     <select value={newGoal.skillLevel} onChange={e=>setNewGoal({...newGoal, skillLevel: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none">
                        <option>Basic</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                     </select>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-textSecondary mb-2">Target Diagnoses</label>
                  <div className="flex gap-2">
                     {["ASD", "ADHD", "DD", "All"].map(d => (
                        <button type="button" key={d} onClick={() => toggleDiag(d)} className={`px-3 py-1 text-sm border rounded-full ${newGoal.diagnoses.includes(d) ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-700'}`}>
                           {d}
                        </button>
                     ))}
                  </div>
               </div>
               <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 font-semibold text-textSecondary bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                  <button type="submit" className="px-4 py-2 font-semibold text-white bg-primary rounded hover:bg-primary/90">Save Goal</button>
               </div>
            </form>
         </div>
      )}

      {["Communication / Language", "Social Skills", "Academic / Classroom Skills", "Self-Help / Daily Living", "Motor Skills"].map(domain => {
         const domainGoals = goals.filter(g => g.domain === domain);
         if (domainGoals.length === 0) return null;
         return (
            <div key={domain} className="mb-8">
               <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">{domain} <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-xl ml-2">{domainGoals.length}</span></h2>
               <div className="flex flex-col">
                  {domainGoals.map(goal => (
                     <GoalLibraryItem key={goal.id} goal={goal} onUpdate={handleUpdate} onDelete={handleDelete} />
                  ))}
               </div>
            </div>
         );
      })}
    </div>
  );
};

export default GoalLibraryPage;
