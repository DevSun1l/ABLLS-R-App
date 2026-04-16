import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const DIAGNOSES = ['ASD', 'ADHD', 'DD', 'Other'];

const StudentProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isNew = !id;
  
  const [formData, setFormData] = useState({
    name: '',
    ageYears: 0,
    ageMonths: 0,
    assessor: user?.name || '',
    assessmentDate: new Date().toISOString().split('T')[0],
    diagnoses: [],
    notes: ''
  });

  useEffect(() => {
    if (!isNew) {
      const rawData = sessionStorage.getItem('ablls_students');
      if (rawData) {
        const students = JSON.parse(rawData);
        const student = students.find(s => s.id === id);
        if (student) {
           setFormData({
              ...student,
              diagnoses: student.diagnoses || []
           });
        }
      }
    }
  }, [id, isNew]);

  const handleDiagnosisToggle = (diag) => {
    setFormData(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.includes(diag) 
        ? prev.diagnoses.filter(d => d !== diag)
        : [...prev.diagnoses, diag]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const rawData = sessionStorage.getItem('ablls_students');
    let students = rawData ? JSON.parse(rawData) : [];
    
    let targetId = id;
    if (isNew) {
      targetId = uuidv4();
      const newStudent = {
        ...formData,
        id: targetId,
        createdBy: user.email,
        domains: {}
      };
      students.push(newStudent);
    } else {
      const index = students.findIndex(s => s.id === id);
      if (index !== -1) {
        students[index] = { ...students[index], ...formData };
      }
    }
    
    sessionStorage.setItem('ablls_students', JSON.stringify(students));
    navigate(`/assessment/${targetId}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-textPrimary mb-6">
        {isNew ? 'New Student Profile' : 'Edit Student Profile'}
      </h1>
      
      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-semibold text-textSecondary mb-2">Child's Full Name</label>
          <input 
            type="text" required
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">Age (Years)</label>
            <select 
              value={formData.ageYears} onChange={e => setFormData({...formData, ageYears: parseInt(e.target.value)})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              {[...Array(19).keys()].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">Age (Months)</label>
            <select 
              value={formData.ageMonths} onChange={e => setFormData({...formData, ageMonths: parseInt(e.target.value)})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              {[...Array(12).keys()].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">Assessor / Specialist Name</label>
            <input 
              type="text" required
              value={formData.assessor} onChange={e => setFormData({...formData, assessor: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">Assessment Date</label>
            <input 
              type="date" required
              value={formData.assessmentDate} onChange={e => setFormData({...formData, assessmentDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-textSecondary mb-3">Diagnoses</label>
          <div className="flex flex-wrap gap-3">
            {DIAGNOSES.map(diag => (
               <button
                 key={diag} type="button"
                 onClick={() => handleDiagnosisToggle(diag)}
                 className={`px-4 py-2 border rounded-full font-medium transition-colors ${
                   formData.diagnoses.includes(diag) ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                 }`}
               >
                 {diag}
               </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-textSecondary mb-2">Notes</label>
          <textarea 
            rows="4"
            placeholder="Describe behaviour, strengths, concerns..."
            value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          ></textarea>
        </div>

        <div className="pt-4 flex justify-end gap-3">
           <button 
             type="button" onClick={() => navigate('/dashboard')}
             className="px-6 py-3 font-semibold text-textSecondary bg-gray-100 rounded-lg hover:bg-gray-200"
           >
             Cancel
           </button>
           <button 
             type="submit" 
             className="px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-all hover:shadow-md"
           >
             Save & Continue to Assessment &rarr;
           </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfilePage;
