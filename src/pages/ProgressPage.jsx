import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ABLLS_DOMAINS } from '../data/ablls';
import { computeOverallMastery, computeDomainScore, getTopStrengths, getTopWeaknesses, getPriorityDomains, getDiagnosisInsights } from '../utils/scoring';
import StudentAvatar from '../components/StudentAvatar';

const ProgressPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('ablls_token');
        let foundStudent = { id, name: "Current Student" };
        
        if (token) {
           const stuRes = await fetch(`/api/students/get?id=${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
           });
           if (stuRes.ok) {
              const stuData = await stuRes.json();
              foundStudent = { ...foundStudent, ...stuData.student, name: stuData.student.name };
           }

           const res = await fetch(`/api/assessments/load?studentId=${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
           });
           const result = await res.json();
           if (result.assessment) {
              foundStudent.domains = result.assessment.domain_data || {};
           } else {
              foundStudent.domains = {};
           }
        } else {
           foundStudent.domains = {};
        }

        foundStudent.masteryPercent = computeOverallMastery(foundStudent);
        setStudent(foundStudent);
      } catch(e) {
         console.error("Clinical data sync failed:", e);
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const stats = useMemo(() => {
    if (!student) return null;
    return {
      strengths: getTopStrengths(student, ABLLS_DOMAINS, 3),
      weaknesses: getTopWeaknesses(student, ABLLS_DOMAINS, 3),
      priorities: getPriorityDomains(student, ABLLS_DOMAINS),
      insight: getDiagnosisInsights(student.diagnoses || [], getTopWeaknesses(student, ABLLS_DOMAINS, 3))
    };
  }, [student]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
       <p className="text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">Analyzing Clinical Vectors...</p>
    </div>
  );

  if (!student) return <div className="p-20 text-center font-black text-error uppercase tracking-widest">Protocol Sync Error: Student Context Lost</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Analytics Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <StudentAvatar seed={student.id} size="lg" mood={student.masteryPercent > 70 ? 'active' : 'stable'} />
          <div>
            <h1 className="text-4xl font-black font-headline text-on-surface tracking-tighter">Clinical Analytics Portal</h1>
            <p className="text-on-surface-variant font-medium text-lg opacity-60">Verified assessment results for <span className="text-primary font-black underline underline-offset-4">{student.name}</span></p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => navigate(`/intervention/${id}`)}
             className="bg-primary text-on-primary px-10 py-4 rounded-full flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-2xl transition-all active:scale-95"
           >
             Generate Strategy Plan <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
           </button>
        </div>
      </section>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Overall Mastery Radial */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-sm border border-outline-variant/5 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-20" />
           <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-10">Institutional Mastery</h3>
           
           <div className="relative w-56 h-56 flex items-center justify-center mb-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-surface-container" />
                <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="16" strokeLinecap="round" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 100} 
                        strokeDashoffset={2 * Math.PI * 100 * (1 - (student.masteryPercent || 0) / 100)} 
                        className="text-primary transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(101,87,137,0.3)]" />
              </svg>
              <div className="absolute flex flex-col items-center">
                 <span className="text-6xl font-black text-on-surface tracking-tighter">{student.masteryPercent || 0}%</span>
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-40">Complete</span>
              </div>
           </div>
           
           <div className="w-full bg-primary/5 border border-primary/10 p-6 rounded-3xl relative">
              <span className="material-symbols-outlined absolute top-4 right-4 text-primary/20">psychology</span>
              <h4 className="font-black text-primary text-[10px] mb-2 uppercase tracking-widest">Clinical Insight</h4>
              <p className="text-xs text-on-surface font-bold leading-relaxed">{stats.insight}</p>
           </div>
        </div>

        {/* Strengths & Weaknesses Matrix */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Top Strengths */}
           <div className="bg-gradient-to-br from-success/10 via-white to-success/5 rounded-[2.5rem] p-8 border border-success/15 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-success uppercase tracking-widest">Growth Anchors</h3>
                 <span className="material-symbols-outlined text-success opacity-40">verified</span>
              </div>
              <div className="space-y-4">
                 {stats.strengths.length > 0 ? stats.strengths.map((s, i) => (
                   <div key={i} className="flex justify-between items-center bg-white/90 p-4 rounded-2xl border border-success/10 group hover:bg-success/10 transition-colors">
                     <span className="font-bold text-on-surface flex items-center gap-3">
                        <span className="text-[10px] font-black text-success opacity-60">{s.id}</span>
                        {s.name}
                     </span>
                     <span className="text-success font-black text-sm bg-success/10 px-3 py-1 rounded-full shadow-sm">{s.score}%</span>
                   </div>
                 )) : <p className="text-sm text-on-surface-variant font-bold opacity-40 italic">Baseline pending...</p>}
              </div>
           </div>

           {/* Top Weaknesses */}
           <div className="bg-gradient-to-br from-error/10 via-white to-error/5 rounded-[2.5rem] p-8 border border-error/15 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-error uppercase tracking-widest">Priority Blocks</h3>
                 <span className="material-symbols-outlined text-error opacity-40">report</span>
              </div>
              <div className="space-y-4">
                 {stats.weaknesses.length > 0 ? stats.weaknesses.map((w, i) => (
                   <div key={i} className="flex justify-between items-center bg-white/90 p-4 rounded-2xl border border-error/10 group hover:bg-error/10 transition-colors">
                     <span className="font-bold text-on-surface flex items-center gap-3">
                        <span className="text-[10px] font-black text-error opacity-60">{w.id}</span>
                        {w.name}
                     </span>
                     <span className="text-error font-black text-sm bg-error/10 px-3 py-1 rounded-full shadow-sm">{w.score}%</span>
                   </div>
                 )) : <p className="text-sm text-on-surface-variant font-bold opacity-40 italic">No critical blocks identified.</p>}
              </div>
           </div>

           {/* Priority Domains Strip */}
           <div className="md:col-span-2 bg-gradient-to-br from-secondary/10 via-white to-tertiary/10 rounded-[2.5rem] p-8 border border-secondary/15 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <span className="material-symbols-outlined text-[10rem]">priority_high</span>
              </div>
              <h3 className="text-xs font-black text-on-surface uppercase tracking-widest mb-6">Strategic Focus Intervals</h3>
              <div className="flex flex-wrap gap-4 relative z-10">
                {stats.priorities.length > 0 ? stats.priorities.map((p, i) => (
                  <div key={i} className="bg-white/90 border border-secondary/10 rounded-2xl px-6 py-4 shadow-sm hover:translate-y-[-2px] transition-transform cursor-pointer group">
                     <div className="text-secondary font-black text-xs group-hover:text-secondary">{p.id} - {p.name}</div>
                     <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mt-1 opacity-40">Score: {p.score}%</div>
                  </div>
                )) : <p className="text-sm text-on-surface-variant font-bold opacity-40">Caseload normalization healthy.</p>}
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Ledger Table */}
      <section className="bg-white rounded-[3rem] shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-8 border-b border-light px-10 flex items-center justify-between bg-surface-container-low/30">
          <h3 className="text-xl font-black font-headline text-on-surface tracking-tighter">Clinical Ledger: {student.name}</h3>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-40">Node Audit v2.0</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50 text-[10px] font-black text-primary uppercase tracking-widest">
                <th className="px-10 py-6">Protocol ID</th>
                <th className="px-10 py-6">Domain Category</th>
                <th className="px-10 py-6 text-center">Score Delta</th>
                <th className="px-10 py-6">Mastery Flux</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {ABLLS_DOMAINS.map(domain => {
                const score = student.domains && student.domains[domain.id] ? computeDomainScore(student.domains[domain.id]) : 0;
                let barColor = 'bg-primary';
                if (score < 40) barColor = 'bg-error';
                else if (score < 70) barColor = 'bg-secondary';
                
                return (
                  <tr key={domain.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-10 py-6">
                       <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded">{domain.id}</span>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-on-surface">{domain.name}</span>
                          <span className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">{domain.category}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <span className={`text-xs font-black px-3 py-1 rounded-full ${score < 40 ? 'text-error bg-error/5' : score < 70 ? 'text-secondary bg-secondary/5' : 'text-primary bg-primary/5'}`}>
                          {score}%
                       </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-surface-container-low rounded-full h-1.5 overflow-hidden shadow-inner">
                          <div className={`${barColor} h-1.5 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_8px_rgba(0,0,0,0.1)]`} style={{ width: `${score}%` }}></div>
                        </div>
                        <span className="material-symbols-outlined text-sm text-primary opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all">trending_flat</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default ProgressPage;
