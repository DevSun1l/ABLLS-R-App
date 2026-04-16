import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ABLLS_DOMAINS } from '../data/ablls';
import { computeDomainScore, getTopStrengths, getTopWeaknesses, getPriorityDomains } from '../utils/scoring';
import { triggerPdfExport } from '../utils/pdfExport';
import { FileDown, ArrowLeft } from 'lucide-react';

const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const rawData = sessionStorage.getItem('ablls_students');
    if (rawData) {
      const students = JSON.parse(rawData);
      const target = students.find(s => s.id === id);
      if (target) {
        setStudent(target);
      }
    }
  }, [id]);

  if (!student) return <div className="p-8 text-center text-textSecondary text-lg font-medium">Loading report data...</div>;

  const strengths = getTopStrengths(student, ABLLS_DOMAINS, 3);
  const weaknesses = getTopWeaknesses(student, ABLLS_DOMAINS, 3);
  const priorities = getPriorityDomains(student, ABLLS_DOMAINS);

  const handleExport = () => {
     triggerPdfExport(student, student.smartGoals);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 bg-white print:p-0 print:m-0 print:shadow-none p-8 border border-gray-200 rounded-xl shadow-sm my-8">
      
      {/* Top Actions (Hidden on Print) */}
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100 print:hidden">
         <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-textSecondary hover:text-primary transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
         </button>
         <button onClick={handleExport} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md">
            <FileDown className="w-5 h-5"/> Export to PDF
         </button>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
         <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">ABLLS-R Assessment Portal</h1>
         <p className="text-textSecondary text-lg mt-2 font-medium">Intervention Report</p>
         <p className="text-sm mt-3 text-gray-500 font-medium">Report Date: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Student Details */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 max-w-2xl mx-auto">
         <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Student Details</h2>
         <div className="grid grid-cols-2 gap-x-8 gap-y-3">
             <div className="text-sm"><span className="font-semibold text-gray-600 w-32 inline-block">Name:</span> {student.name}</div>
             <div className="text-sm"><span className="font-semibold text-gray-600 w-32 inline-block">Age:</span> {student.ageYears}y {student.ageMonths}m</div>
             <div className="text-sm"><span className="font-semibold text-gray-600 w-32 inline-block">Diagnoses:</span> {(student.diagnoses||[]).join(', ')}</div>
             <div className="text-sm"><span className="font-semibold text-gray-600 w-32 inline-block">Assessor:</span> {student.assessor}</div>
             <div className="text-sm"><span className="font-semibold text-gray-600 w-32 inline-block">Assessment Date:</span> {student.assessmentDate}</div>
         </div>
         {student.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
               <div className="text-sm font-semibold text-gray-600 mb-1">Notes:</div>
               <p className="text-sm text-gray-800 leading-relaxed bg-white p-3 rounded border border-gray-100">{student.notes}</p>
            </div>
         )}
      </div>

      {/* Overview Table */}
      <div className="mb-10">
         <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Domain Performance Summary</h2>
         <table className="w-full text-left text-sm border-collapse rounded-lg overflow-hidden border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
               <tr>
                 <th className="p-3 border-b border-gray-200 uppercase font-bold text-xs tracking-wider">Domain</th>
                 <th className="p-3 border-b border-gray-200 uppercase font-bold text-xs tracking-wider">Score</th>
                 <th className="p-3 border-b border-gray-200 uppercase font-bold text-xs tracking-wider">Level</th>
               </tr>
            </thead>
            <tbody>
               {ABLLS_DOMAINS.map((d, i) => {
                  let score = 0;
                  if (student.domains && student.domains[d.id]) {
                     score = computeDomainScore(student.domains[d.id]);
                  }
                  let level = 'Requires Support';
                  let colorClass = 'text-danger font-semibold bg-danger/10';
                  if (score >= 70) { level = 'Mastered'; colorClass = 'text-success font-semibold bg-success/10'; }
                  else if (score >= 40) { level = 'Emerging'; colorClass = 'text-warning font-semibold bg-warning/10'; }
                  
                  return (
                     <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 border-b border-gray-200 font-medium text-gray-700"><span className="text-gray-400 mr-2 font-bold w-4 inline-block">{d.id}</span> {d.name}</td>
                        <td className="p-3 border-b border-gray-200 font-bold">{score}%</td>
                        <td className="p-3 border-b border-gray-200"><span className={`px-2 py-1 rounded text-xs ${colorClass}`}>{level}</span></td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-8 mb-10">
         <div>
            <h2 className="text-lg font-bold text-success mb-3 pb-2 border-b border-gray-200">Strengths</h2>
            <ul className="space-y-2 list-disc pl-5">
               {strengths.map((s,i) => <li key={i} className="text-sm font-medium text-gray-700">{s.name} ({s.score}%)</li>)}
            </ul>
         </div>
         <div>
            <h2 className="text-lg font-bold text-danger mb-3 pb-2 border-b border-gray-200">Weaknesses</h2>
            <ul className="space-y-2 list-disc pl-5">
               {weaknesses.map((w,i) => <li key={i} className="text-sm font-medium text-gray-700">{w.name} ({w.score}%)</li>)}
            </ul>
         </div>
      </div>

      {/* SMART Goals Section */}
      <div className="mb-10 page-break-before">
         <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-900">Intervention Plan: SMART Goals</h2>
         {student.smartGoals && student.smartGoals.length > 0 ? (
            <div className="space-y-8">
               {student.smartGoals.map((goal, idx) => (
                  <div key={idx} className="bg-white border-l-4 border-primary p-6 shadow-sm border border-gray-200 rounded-r-xl">
                     <div className="flex gap-3 mb-3">
                        <span className="font-bold text-primary text-xl">Goal {idx + 1}</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{goal.serviceType}</span>
                     </div>
                     <p className="text-lg font-semibold text-gray-900 mb-4 leading-relaxed">{goal.smartGoal}</p>
                     
                     <div className="bg-gray-50 p-4 rounded text-sm mb-4 border border-gray-100">
                        <p className="mb-2"><span className="font-bold text-gray-700">Strategy:</span> <span className="text-gray-900">{goal.strategy}</span></p>
                        <p><span className="font-bold text-gray-700">Activity:</span> <span className="text-gray-900">{goal.activity}</span></p>
                     </div>
                     
                     <div className="bg-blue-50/50 p-4 rounded text-sm border border-blue-100">
                        <span className="font-bold text-blue-900 block mb-1">Targeted Benefit:</span> 
                        <p className="text-blue-900 leading-relaxed italic">{goal.benefitStatement}</p>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <p className="text-gray-500 italic">No intervention goals generated yet.</p>
         )}
      </div>

      {student.smartGoals && student.smartGoals.length > 0 && (
         <div className="bg-gray-900 text-white p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">Combined Impact Overview</h2>
            <p className="text-gray-300 leading-relaxed">
               By addressing these targeted goals collectively, {student.name} will build foundational skills across communication, social interaction, and daily living. The multi-disciplinary strategies ensure consistent skill acquisition and generalisation, ultimately fostering greater independence and reducing barriers to learning across home and classroom environments.
            </p>
         </div>
      )}
    </div>
  );
};

export default ReportPage;
