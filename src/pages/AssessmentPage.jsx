import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ABLLS_DOMAINS } from '../data/ablls';
import DomainProgressBar from '../components/DomainProgressBar';
import ScoreButton from '../components/ScoreButton';

const AssessmentPage = () => {
  const { id } = useParams(); // student id
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [assessmentData, setAssessmentData] = useState({});
  const [domainIndex, setDomainIndex] = useState(0);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [showNoPatternModal, setShowNoPatternModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setNoStreak] = useState(0);
  const NO_STREAK_LIMIT = 5;
  
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
              setAssessmentData(result.assessment.domain_data || {});
           }
        }
        setStudent(foundStudent);
      } catch(e) {
         console.error("Failed to load assessment:", e);
      } finally {
         setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) return (
     <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        <p className="text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">Launching Clinical Sidebar...</p>
     </div>
  );
  if (!student) return <div className="p-20 text-center font-black text-error uppercase tracking-widest">Protocol Sync Error: Student Context Lost</div>;

  const currentDomain = ABLLS_DOMAINS[domainIndex];
  const currentSkills = currentDomain.skills;
  const currentDomainData = assessmentData[currentDomain.id] || { skills: {} };

  const autoSaveToDB = async (updatedDomainData) => {
    setAssessmentData(updatedDomainData);
    const token = sessionStorage.getItem('ablls_token');
    if (!token) return;
    fetch(`/api/assessments/save`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({
          studentId: id,
          domainsData: updatedDomainData
       })
    }).catch(e => console.error("Auto-save failed", e));
  };

  const handleScore = (skillCode, value, isGateway) => {
    const newDomains = { ...assessmentData };
    if (!newDomains[currentDomain.id]) {
       newDomains[currentDomain.id] = { skills: {} };
    }
    const newSkills = { ...newDomains[currentDomain.id].skills };
    
    if (isGateway && value === 'no') {
      setNoStreak(prev => prev + 1);
      setShowGatewayModal(true);
      newSkills[skillCode] = value;
      newDomains[currentDomain.id].skills = newSkills;
      autoSaveToDB(newDomains);
      return;
    }

    newSkills[skillCode] = value;
    newDomains[currentDomain.id].skills = newSkills;
    autoSaveToDB(newDomains);

    if (value === 'no') {
      setNoStreak(prev => {
        const next = prev + 1;
        if (next >= NO_STREAK_LIMIT) {
          setShowNoPatternModal(true);
        }
        return next;
      });
    } else {
      setNoStreak(0);
    }
  };

  const handleGatewaySkip = () => {
    setShowGatewayModal(false);
    const newDomains = { ...assessmentData };
    const newSkills = { ...newDomains[currentDomain.id].skills };
    currentSkills.forEach((skill, idx) => {
       if (idx > 0 && !newSkills[skill.code]) newSkills[skill.code] = 'no';
    });
    newDomains[currentDomain.id].skills = newSkills;
    autoSaveToDB(newDomains);
    setNoStreak(0);
    handleNextDomain();
  };

  const handleGatewayCancel = () => {
    setShowGatewayModal(false);
    const newDomains = { ...assessmentData };
    const newSkills = { ...newDomains[currentDomain.id].skills };
    delete newSkills[currentSkills[0].code];
    newDomains[currentDomain.id].skills = newSkills;
    autoSaveToDB(newDomains);
  };

  const handleManualContinue = () => {
    setShowNoPatternModal(false);
    setNoStreak(0);
  };

  const handleAutofillRemainingNo = () => {
    const newDomains = { ...assessmentData };
    const currentIndexMap = currentSkills.findIndex((skill) => !currentDomainData.skills[skill.code]);
    const startIndex = currentIndexMap >= 0 ? currentIndexMap : 0;

    if (!newDomains[currentDomain.id]) {
      newDomains[currentDomain.id] = { skills: {} };
    }

    const domainSkills = { ...newDomains[currentDomain.id].skills };
    currentSkills.forEach((skill, index) => {
      if (index >= startIndex && !domainSkills[skill.code]) {
        domainSkills[skill.code] = 'no';
      }
    });
    newDomains[currentDomain.id].skills = domainSkills;

    setShowNoPatternModal(false);
    setNoStreak(0);
    autoSaveToDB(newDomains);
    handleNextDomain();
  };

  const handleNextDomain = () => {
    if (domainIndex < ABLLS_DOMAINS.length - 1) {
      setDomainIndex(domainIndex + 1);
      setNoStreak(0);
      window.scrollTo(0, 0);
    } else {
      navigate(`/progress/${id}`);
    }
  };

  const handlePrevDomain = () => {
    if (domainIndex > 0) {
      setDomainIndex(domainIndex - 1);
      setNoStreak(0);
      window.scrollTo(0, 0);
    }
  };

  const handleJumpDomain = (idx) => {
     setDomainIndex(idx);
     setNoStreak(0);
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-[1200px] mx-auto relative pb-32 animate-in fade-in duration-700">
      <div className="mb-12 sticky top-6 bg-surface/90 backdrop-blur-xl pt-4 pb-4 z-20 border-b border-outline-variant/10 rounded-[1.5rem] shadow-sm">
        <DomainProgressBar 
           currentDomainId={currentDomain.id} 
           studentDomains={assessmentData} 
           onSelectDomain={handleJumpDomain}
        />
      </div>
      
      <div className="mb-12 p-10 bg-primary/5 border-l-[10px] border-primary rounded-r-[2rem] shadow-sm flex items-center justify-between">
        <div className="space-y-2">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Protocol Section</h2>
            <h3 className="text-4xl font-black text-on-surface font-headline tracking-tighter">Domain {currentDomain.id} — {currentDomain.name}</h3>
            <p className="text-on-surface-variant text-lg font-medium opacity-60">{currentDomain.category}</p>
        </div>
        <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Assessing</p>
            <p className="text-xl font-black text-on-surface leading-none">{student.name}</p>
        </div>
      </div>

      <div className="space-y-8">
        {currentSkills.map(skill => (
          <div key={skill.code} className="bg-white border border-outline-variant/10 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 pb-6 border-b border-outline-variant/5">
              <div className="flex items-start gap-8">
                 <div className="w-16 h-16 bg-surface-container-low text-primary font-black flex items-center justify-center rounded-2xl border border-outline-variant/5 text-lg shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                   {skill.code}
                 </div>
                 <div className="space-y-4">
                    <p className="text-2xl font-black text-on-surface leading-tight tracking-tight">{skill.description}</p>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest px-4 py-2 bg-primary/5 rounded-full border border-primary/10">Complexity: Level {skill.level}</span>
                        {skill.isGateway && (
                            <span className="text-[10px] font-black text-tertiary uppercase tracking-widest px-4 py-2 bg-tertiary/5 rounded-full border border-tertiary/10 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">key</span> Gateway Logic
                            </span>
                        )}
                    </div>
                 </div>
              </div>
            </div>
            
            {(currentDomainData.skills[currentSkills[0].code] === 'no' && skill.isGateway === false) ? (
              <div className="text-center py-12 bg-surface-container-low rounded-3xl border-4 border-dashed border-outline-variant/10 text-on-surface-variant font-black uppercase tracking-[0.3em] text-[10px] opacity-40 group-hover:bg-error/5 group-hover:text-error transition-all group-hover:border-error/20">
                Lacking Requisite: Autoskipped
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 max-w-4xl mx-auto">
                <ScoreButton 
                  type="yes" text="YES (Observed)" 
                  active={currentDomainData.skills[skill.code] === 'yes'} 
                  onClick={() => handleScore(skill.code, 'yes', skill.isGateway)}
                />
                <ScoreButton 
                  type="sometimes" text="SOMETIMES" 
                  active={currentDomainData.skills[skill.code] === 'sometimes'} 
                  onClick={() => handleScore(skill.code, 'sometimes', skill.isGateway)}
                />
                <ScoreButton 
                  type="no" text="NO" 
                  active={currentDomainData.skills[skill.code] === 'no'} 
                  onClick={() => handleScore(skill.code, 'no', skill.isGateway)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-surface/90 backdrop-blur-2xl border-t border-outline-variant/10 p-6 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4">
          <button 
            onClick={handlePrevDomain}
            disabled={domainIndex === 0}
            className={`px-10 py-5 font-black uppercase tracking-widest text-sm rounded-full transition-all flex items-center justify-center gap-3 ${domainIndex === 0 ? 'opacity-20 cursor-not-allowed text-on-surface' : 'text-on-surface hover:bg-surface-container-high active:scale-95'}`}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span> Return to Previous Vector
          </button>
          
          <div className="hidden md:flex flex-col items-center">
             <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-1">Current Progress</p>
             <div className="w-32 h-1 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((domainIndex + 1) / ABLLS_DOMAINS.length) * 100}%` }} />
             </div>
          </div>

          <button 
            onClick={handleNextDomain}
            className="px-12 py-5 font-black text-on-primary bg-primary rounded-full hover:bg-primary-dim shadow-xl shadow-primary/20 hover:shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-widest"
          >
            {domainIndex < ABLLS_DOMAINS.length - 1 ? 'Advance Internal Vector' : 'View Final Analytics'} 
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>

      {showGatewayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#34313a]/80 backdrop-blur-lg p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full p-12 text-center space-y-8 animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="w-24 h-24 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="material-symbols-outlined text-5xl">priority_high</span>
            </div>
            <div className="space-y-4">
                <h3 className="text-3xl font-black font-headline text-on-surface tracking-tighter">Ready For The Next Module</h3>
                <p className="text-on-surface-variant font-medium leading-relaxed opacity-70">
                    Since the student has not yet mastered the basic level for this module, it may be more suitable to move ahead to the next module and continue from there.
                </p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleGatewaySkip}
                className="w-full py-5 text-on-primary bg-error rounded-full font-black uppercase tracking-widest text-xs shadow-xl shadow-error/20 hover:bg-error-container hover:text-on-error-container transition-all"
              >
                Proceed
              </button>
              <button 
                onClick={handleGatewayCancel}
                className="w-full py-5 text-on-surface-variant font-black uppercase tracking-widest text-xs hover:bg-surface-container-low rounded-full transition-all"
              >
                Manually Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoPatternModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#34313a]/80 backdrop-blur-lg p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full p-12 text-center space-y-8 animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="w-24 h-24 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-5xl">help</span>
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black font-headline text-on-surface tracking-tighter">Need A Hand With This Module?</h3>
              <p className="text-on-surface-variant font-medium leading-relaxed opacity-70">
                You have selected <span className="font-black text-error uppercase tracking-widest">No</span> several times in a row. If you would like, Cognify can gently autofill the rest of this module as <span className="font-black text-error uppercase tracking-widest">No</span> and move you to the next module, or you can continue answering manually.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={handleAutofillRemainingNo}
                className="flex-1 py-5 text-on-primary bg-error rounded-full font-black uppercase tracking-widest text-xs shadow-xl shadow-error/20 hover:bg-error-container hover:text-on-error-container transition-all"
              >
                Autofill As No
              </button>
              <button
                onClick={handleManualContinue}
                className="flex-1 py-5 text-on-surface-variant font-black uppercase tracking-widest text-xs hover:bg-surface-container-low rounded-full transition-all border border-outline-variant/10"
              >
                Manually Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;
