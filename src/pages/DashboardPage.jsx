import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentCard from '../components/StudentCard';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  
  useEffect(() => {
    const rawData = sessionStorage.getItem('ablls_students');
    let parsed = [];
    if (rawData) {
      try { parsed = JSON.parse(rawData); } catch(e){}
    }
    
    if (user?.role === 'admin') {
      setStudents(parsed);
    } else {
      setStudents(parsed.filter(s => s.createdBy === user?.email));
    }
  }, [user]);

  const avgMastery = students.length ? Math.round(students.reduce((acc, s) => acc + (s.masteryPercent || 0), 0) / students.filter(s=>s.masteryPercent !== undefined).length || 1) : 0;
  const completedAssessments = students.filter(s => s.masteryPercent !== undefined).length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-textSecondary mt-1">Here is the overview of your assigned students and recent assessments.</p>
        </div>
        <button 
          onClick={() => navigate('/student/new')}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors whitespace-nowrap"
        >
          + Add new student
        </button>
      </div>

      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <h3 className="text-textSecondary text-sm font-semibold uppercase mb-2 tracking-wide">Total Students</h3>
             <p className="text-4xl font-bold text-textPrimary">{students.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <h3 className="text-textSecondary text-sm font-semibold uppercase mb-2 tracking-wide">Completed Assessments</h3>
             <p className="text-4xl font-bold text-success">{completedAssessments}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
             <h3 className="text-textSecondary text-sm font-semibold uppercase mb-2 tracking-wide">Avg Mastery %</h3>
             <p className="text-4xl font-bold tracking-tight text-info">{avgMastery}%</p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-textPrimary mb-4">
        {user?.role === 'admin' ? 'All Students Directory' : 'Your Students'}
      </h2>
      
      {students.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-xl p-12 text-center">
          <p className="text-textSecondary mb-4">No students yet. Add your first student to begin.</p>
          <button 
            onClick={() => navigate('/student/new')}
            className="text-primary font-semibold hover:underline"
          >
            Create student profile &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
             <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
