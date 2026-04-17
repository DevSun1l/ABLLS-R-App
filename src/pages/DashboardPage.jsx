import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import StudentCard from '../components/StudentCard';

const DashboardPage = () => {
  const { user } = useAuth();
  const { searchQuery } = useSearch();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = sessionStorage.getItem('ablls_token');
        if (!token) return;
        const res = await fetch('/api/students/org', {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
           const data = await res.json();
           setStudents(data.students || []);
        }
      } catch (e) {
         console.error("Failed to load clinical caseload", e);
      } finally {
         setLoading(false);
      }
    };
    fetchStudents();
  }, [user]);

  // Search Filtering Logic
  const filteredStudents = useMemo(() => {
     if (!searchQuery) return students;
     const q = searchQuery.toLowerCase();
     return students.filter(s => 
        (s.name || '').toLowerCase().includes(q) || 
        (s.diagnoses || []).some(d => (d || '').toLowerCase().includes(q))
     );
  }, [students, searchQuery]);

  // Clinical Pulse Metrics
  const metrics = useMemo(() => {
     if (!students.length) return { avgMastery: 0, activeAssessments: 0, trend: 0 };
     const active = students.filter(s => s.masteryPercent !== undefined).length;
     const avg = Math.round(students.reduce((acc, s) => acc + (s.masteryPercent || 0), 0) / (active || 1));
     return {
        avgMastery: avg,
        activeAssessments: active,
        trend: 14 // Simulated baseline trend indicator
     };
  }, [students]);

  if (loading) return (
     <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        <p className="text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">Syncing Sanctuary Data...</p>
     </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-black font-headline text-on-surface tracking-tighter">Welcome back, {user?.first_name}</h2>
          <p className="text-on-surface-variant font-medium text-lg opacity-70">
            You have <span className="text-primary font-black underline underline-offset-4 decoration-primary/20">{metrics.activeAssessments}</span> active student evaluations this week.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/student/new')}
            className="bg-primary text-on-primary px-10 py-4 rounded-full flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-2xl hover:bg-primary-dim transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">person_add</span> Add New Student
          </button>
        </div>
      </section>

      {/* Stats Overview: Weekly Insight Card */}
      <section>
        <div className="w-full bg-white rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm border-2 border-[#b69df8]">
          <div className="relative z-10 text-on-surface max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
               <span className="px-5 py-1.5 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">Weekly Clinical Pulse</span>
               <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" /> Live Sync
               </span>
            </div>
            <h3 className="text-4xl font-black font-headline mb-4 tracking-tight leading-tight text-on-surface">Patient Engagement is up {metrics.trend}%</h3>
            <p className="text-on-surface-variant font-medium text-lg leading-relaxed opacity-90">
              Your caseload for clinical supervision has increased. Avg mastery across your active students is currently <span className="text-primary font-black underline underline-offset-4">{metrics.avgMastery}%</span>. Review the student log for updated progress notes.
            </p>
          </div>
          
          <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-primary/5 text-[20rem] rotate-12 transition-transform group-hover:scale-110 duration-1000">trending_up</span>
          
          <div className="absolute top-10 right-10 hidden lg:flex gap-4">
             {[1,2,3].map(i => (
                <div key={i} className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 animate-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
             ))}
          </div>
        </div>
      </section>

      {/* Your Assigned Students Grid */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-3xl font-black text-on-surface font-headline tracking-tighter">Your Assigned Caseload</h3>
          <div className="flex items-center gap-4">
             <span className="text-xs font-black text-on-surface-variant/40 uppercase tracking-widest">View: Grid (Active)</span>
             <a className="text-primary font-black text-xs uppercase tracking-widest hover:underline" href="#">View all records</a>
          </div>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div className="bg-surface-container-low/50 border-4 border-dashed border-outline-variant/20 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant/20 mb-8 border border-white">
               <span className="material-symbols-outlined text-5xl">person_search</span>
            </div>
            <h4 className="text-xl font-black text-on-surface mb-2">Caseload Stream Clear</h4>
            <p className="text-on-surface-variant font-medium opacity-60 mb-10 max-w-sm">No students currently match your filters or assigned caseload criteria.</p>
            <button 
              onClick={() => navigate('/student/new')}
              className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-primary/5 px-8 py-4 rounded-full transition-all border border-primary/10"
            >
              Establish new student profile <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredStudents.map(student => (
               <div key={student.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <StudentCard student={student} />
               </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity Mini-Feed */}
      <section className="bg-surface-container-low rounded-[3rem] p-10 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-2xl font-black font-headline text-on-surface tracking-tighter">Recent Clinical Events</h3>
           <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-40">Live Audit Trail</span>
        </div>
        <div className="space-y-4">
          {[
            { id: 1, title: 'Notes updated for Maya Chen', sub: 'Session #8 completed successfully', time: '2h ago', icon: 'edit_note' },
            { id: 2, title: 'New Referral: Leo Garcia', sub: 'Pending documentation review', time: '5h ago', icon: 'assignment_turned_in' }
          ].map(event => (
            <div key={event.id} className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-outline-variant/5 shadow-sm hover:shadow-md transition-all group">
               <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-2xl">{event.icon}</span>
               </div>
               <div className="flex-1">
                  <p className="text-sm font-black text-on-surface">{event.title}</p>
                  <p className="text-xs text-on-surface-variant font-medium opacity-60">{event.sub}</p>
               </div>
               <span className="text-[10px] font-black text-primary uppercase tracking-widest italic opacity-40">{event.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
