import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ABLLS_DOMAINS } from '../data/ablls';
import { computeOverallMastery, computeDomainScore, getTopStrengths, getTopWeaknesses, getPriorityDomains, getDiagnosisInsights } from '../utils/scoring';

const ProgressPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const rawData = sessionStorage.getItem('ablls_students');
    if (rawData) {
      const students = JSON.parse(rawData);
      const target = students.find(s => s.id === id);
      if (target) {
        // Compute mastery and save
        const mastery = computeOverallMastery(target);
        target.masteryPercent = mastery;
        setStudent(target);
        sessionStorage.setItem('ablls_students', JSON.stringify(students.map(s => s.id === id ? target : s)));
      }
    }
  }, [id]);

  if (!student) return <div className="p-8 text-center text-textSecondary text-lg font-medium">Loading progress data...</div>;

  const strengths = getTopStrengths(student, ABLLS_DOMAINS, 3);
  const weaknesses = getTopWeaknesses(student, ABLLS_DOMAINS, 3);
  const priorities = getPriorityDomains(student, ABLLS_DOMAINS);
  const insightText = getDiagnosisInsights(student.diagnoses || [], weaknesses);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary tracking-tight">Assessment Progress</h1>
          <p className="text-textSecondary mt-1 text-lg">Results for {student.name}</p>
        </div>
        <button 
          onClick={() => navigate(`/intervention/${id}`)}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          Generate Intervention Plan &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 border border-border bg-card rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm">
           <h3 className="text-gray-500 font-semibold uppercase tracking-wider text-sm mb-6">Overall Mastery</h3>
           <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 88} 
                        strokeDashoffset={2 * Math.PI * 88 * (1 - (student.masteryPercent || 0) / 100)} 
                        className="text-primary transition-all duration-1000 ease-out" />
              </svg>
              <span className="absolute text-5xl font-bold text-textPrimary">{student.masteryPercent || 0}%</span>
           </div>
           
           <div className="w-full bg-blue-50 border border-blue-100 p-4 rounded-xl mt-4">
             <h4 className="font-bold text-blue-800 text-sm mb-1 uppercase tracking-wide">Diagnosis Insights</h4>
             <p className="text-sm text-blue-900 leading-relaxed">{insightText}</p>
           </div>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
               <div className="bg-success/10 py-3 px-4 border-b border-success/20">
                 <h3 className="font-bold text-success flex items-center justify-between">Top Strengths <span className="text-xs bg-success text-white px-2 py-0.5 rounded-full">Top 3</span></h3>
               </div>
               <div className="p-4 space-y-3 bg-white">
                 {strengths.length > 0 ? strengths.map((s, i) => (
                   <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                     <span className="font-medium text-sm text-gray-800"><span className="text-gray-400 mr-2">{s.id}</span>{s.name}</span>
                     <span className="text-success font-bold text-sm bg-success/10 px-2 py-0.5 rounded">{s.score}%</span>
                   </div>
                 )) : <p className="text-sm text-gray-500">Not enough data.</p>}
               </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
               <div className="bg-danger/10 py-3 px-4 border-b border-danger/20">
                 <h3 className="font-bold text-danger flex items-center justify-between">Top Weaknesses <span className="text-xs bg-danger text-white px-2 py-0.5 rounded-full">Top 3</span></h3>
               </div>
               <div className="p-4 space-y-3 bg-white">
                 {weaknesses.length > 0 ? weaknesses.map((w, i) => (
                   <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                     <span className="font-medium text-sm text-gray-800"><span className="text-gray-400 mr-2">{w.id}</span>{w.name}</span>
                     <span className="text-danger font-bold text-sm bg-danger/10 px-2 py-0.5 rounded">{w.score}%</span>
                   </div>
                 )) : <p className="text-sm text-gray-500">Not enough data.</p>}
               </div>
            </div>
          </div>
          
          <div className="bg-card border border-amber-200 rounded-xl p-5 shadow-sm bg-gradient-to-br from-amber-50 to-white">
             <h3 className="font-bold text-warning mb-3 flex items-center gap-2">
                <span className="bg-warning text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">!</span> Priority Domains for Intervention
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               {priorities.length > 0 ? priorities.map((p, i) => (
                 <div key={i} className="bg-white border border-amber-100 rounded-lg p-3 shadow-sm shadow-amber-100/50">
                    <div className="text-amber-800 font-bold mb-1">{p.id} - {p.name}</div>
                    <div className="text-xs font-semibold text-amber-600 bg-amber-100 inline-block px-2 py-0.5 rounded">Score: {p.score}%</div>
                 </div>
               )) : <p className="text-sm text-gray-500">No domains below 40%.</p>}
             </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">Detailed Domain Scores</h2>
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider w-16">ID</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Domain</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider w-32">Score</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">Progressive Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {ABLLS_DOMAINS.map(domain => {
                  let score = 0;
                  if (student.domains && student.domains[domain.id]) {
                    score = computeDomainScore(student.domains[domain.id]);
                  }
                  
                  let barColor = 'bg-success';
                  if (score < 40) barColor = 'bg-danger';
                  else if (score < 70) barColor = 'bg-warning';
                  
                  return (
                    <tr key={domain.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-500">{domain.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{domain.name}</td>
                      <td className="px-6 py-4 font-bold">
                         <span className={score < 40 ? 'text-danger' : score < 70 ? 'text-warning' : 'text-success'}>{score}%</span>
                      </td>
                      <td className="px-6 py-4 w-full">
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                          <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
