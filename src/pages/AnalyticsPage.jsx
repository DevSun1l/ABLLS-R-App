import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { computeOverallMastery } from '../utils/scoring';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentsAndAssessments = async () => {
      try {
        const token = sessionStorage.getItem('ablls_token');
        if (!token) return;
        
        // Fetch all students
        const res = await fetch('/api/students/org', {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
           const data = await res.json();
           const loadedStudents = data.students || [];
           
           // Fetch assessments for computing mastery
           const studentsWithScores = await Promise.all(loadedStudents.map(async (student) => {
              try {
                const aRes = await fetch(`/api/assessments/load?studentId=${student.id}`, {
                   headers: { 'Authorization': `Bearer ${token}` }
                });
                const aData = await aRes.json();
                student.domains = aData.assessment?.domain_data || {};
                student.masteryPercent = computeOverallMastery(student);
              } catch (e) {
                student.masteryPercent = 0;
              }
              return student;
           }));
           
           setStudents(studentsWithScores);
        }
      } catch (e) {
         console.error("Failed to load clinical caseload", e);
      } finally {
         setLoading(false);
      }
    };
    fetchStudentsAndAssessments();
  }, [user]);

  if (loading) return (
     <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        <p className="text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">Computing Analytics Vectors...</p>
     </div>
  );

  // Filter out those with no score if they are truly zero baseline, but for a graph we might want to show them.
  const graphStudents = students.filter(s => s.masteryPercent !== undefined);

  // Basic Line Graph implementation using pure SVG
  const PADDING = 60;
  const WIDTH = 900;
  const HEIGHT = 400;
  
  const maxY = 100;
  const pointsX = graphStudents.length > 0 ? (WIDTH - PADDING * 2) / (graphStudents.length === 1 ? 1 : graphStudents.length - 1) : 0;
  
  const getCoordinates = (index, value) => {
    const x = PADDING + (index * pointsX);
    const y = HEIGHT - PADDING - ((value / maxY) * (HEIGHT - PADDING * 2));
    return { x, y };
  };

  const polylinePoints = graphStudents.map((s, i) => {
    const { x, y } = getCoordinates(i, s.masteryPercent || 0);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="space-y-4 mb-12">
        <h1 className="text-5xl font-black font-headline text-on-surface tracking-tighter">Clinical Analytics</h1>
        <p className="text-on-surface-variant font-medium text-lg opacity-60">
          Cohort mastery mapping across your active caseload.
        </p>
      </div>

      <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between mb-8">
           <div>
               <h3 className="text-xl font-black text-primary uppercase tracking-widest">Mastery Trajectory Curve</h3>
               <p className="text-on-surface-variant font-medium text-sm mt-2">Aggregated snapshot of current student performance values.</p>
           </div>
           <span className="material-symbols-outlined text-primary/40 text-4xl">show_chart</span>
        </div>
        
        {graphStudents.length === 0 ? (
           <div className="h-64 flex items-center justify-center text-on-surface-variant/50 font-bold uppercase tracking-widest">
              No assessable data points detected
           </div>
        ) : (
           <div className="w-full overflow-x-auto pb-4">
              <svg width={WIDTH} height={HEIGHT} className="drop-shadow-sm min-w-full">
                 {/* Grid Lines */}
                 {[0, 25, 50, 75, 100].map(val => (
                   <g key={val}>
                     <line 
                        x1={PADDING} y1={getCoordinates(0, val).y} 
                        x2={WIDTH - PADDING} y2={getCoordinates(0, val).y}
                        stroke="currentColor" strokeWidth="1" className="text-outline-variant/20 stroke-dasharray-4" strokeDasharray="4 4"
                     />
                     <text x={PADDING - 15} y={getCoordinates(0, val).y + 4} className="text-[10px] font-black text-on-surface-variant/40" textAnchor="end">{val}%</text>
                   </g>
                 ))}

                 {/* The Line */}
                 {graphStudents.length > 1 && (
                    <polyline fill="none" stroke="#655789" strokeWidth="4" points={polylinePoints} strokeLinejoin="round" />
                 )}

                 {/* The Data Points */}
                 {graphStudents.map((s, idx) => {
                   const { x, y } = getCoordinates(idx, s.masteryPercent || 0);
                   return (
                      <g key={s.id} className="group cursor-pointer">
                         <circle cx={x} cy={y} r="6" fill="#fff" stroke="#655789" strokeWidth="3" className="transition-all hover:r-8 hover:stroke-[#b69df8]" />
                         <text x={x} y={y - 15} className="text-[10px] font-black fill-primary opacity-0 group-hover:opacity-100 transition-opacity" textAnchor="middle">{s.masteryPercent}%</text>
                         <text x={x} y={HEIGHT - PADDING + 20} className="text-[9px] font-black fill-on-surface-variant/60 uppercase" textAnchor="middle">{(s.name || '').split(' ')[0]}</text>
                      </g>
                   );
                 })}
              </svg>
           </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
