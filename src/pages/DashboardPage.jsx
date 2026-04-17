import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentCard from '../components/StudentCard';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  
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
           setStudents(data.students);
        }
      } catch (e) {
         console.error("Failed to load students", e);
      }
    };
    fetchStudents();
  }, [user]);

  const avgMastery = students.length ? Math.round(students.reduce((acc, s) => acc + (s.masteryPercent || 0), 0) / students.filter(s=>s.masteryPercent !== undefined).length || 1) : 0;
  const completedAssessments = students.filter(s => s.masteryPercent !== undefined).length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline text-on-surface tracking-tight mb-2">Welcome back, {user?.first_name}</h1>
          <p className="text-on-surface-variant font-medium">Here is the overview of your assigned students and recent assessments.</p>
        </div>
        <button 
          onClick={() => navigate('/student/new')}
          className="bg-primary hover:bg-primary-dim text-on-primary shadow-sm hover:shadow-md font-bold py-3 px-6 text-sm rounded-full transition-all flex items-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span> Add New Student
        </button>
      </div>

      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-primary-container/30 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary rounded-full text-on-primary">
                   <span className="material-symbols-outlined">school</span>
                </div>
             </div>
             <div>
                <h3 className="text-3xl font-black font-headline text-on-primary-container">{students.length}</h3>
                <p className="text-sm font-medium text-on-primary-container/80">Total Students</p>
             </div>
          </div>
          <div className="bg-tertiary-container/30 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-tertiary rounded-full text-on-tertiary">
                   <span className="material-symbols-outlined">assignment_turned_in</span>
                </div>
             </div>
             <div>
                <h3 className="text-3xl font-black font-headline text-on-tertiary-container">{completedAssessments}</h3>
                <p className="text-sm font-medium text-on-tertiary-container/80">Completed Assessments</p>
             </div>
          </div>
          <div className="bg-secondary-container/30 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary rounded-full text-on-secondary">
                   <span className="material-symbols-outlined">trending_up</span>
                </div>
             </div>
             <div>
                <h3 className="text-3xl font-black font-headline text-on-secondary-container">{avgMastery}%</h3>
                <p className="text-sm font-medium text-on-secondary-container/80">Avg Mastery</p>
             </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-black text-on-surface font-headline mb-6">
        {user?.role === 'admin' ? 'All Students Directory' : 'Your Assigned Students'}
      </h2>
      
      {students.length === 0 ? (
        <div className="bg-surface-container-lowest border-2 border-outline-variant/30 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-5xl text-outline-variant/50 mb-4">person_search</span>
          <p className="text-on-surface-variant font-medium mb-6">No students assigned yet. Add your first student to begin.</p>
          <button 
            onClick={() => navigate('/student/new')}
            className="text-primary font-bold flex items-center gap-2 hover:bg-primary/5 px-4 py-2 rounded-full transition-colors"
          >
            Create student profile <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
