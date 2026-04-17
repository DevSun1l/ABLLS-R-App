import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { GOAL_LIBRARY } from '../data/goalLibrary';

const AdminDashboard = () => {
   const { user, logout } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
   const [data, setData] = useState({ users: [], students: [], assessments: [] });
   const [goals, setGoals] = useState([]);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
   const [chartFilter, setChartFilter] = useState('monthly');

   useEffect(() => {
      const fetchAdminData = async () => {
         try {
            const token = sessionStorage.getItem('ablls_token');
            const res = await fetch('/api/admin/data', {
               headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
               const result = await res.json();
               setData(result);
            }
         } catch (e) {
            console.error("Admin data fetch error:", e);
         } finally {
            setLoading(false);
         }
      };

      // Load Goals
      const rawData = sessionStorage.getItem('ablls_goals');
      if (rawData) {
         setGoals(JSON.parse(rawData));
      } else {
         setGoals(GOAL_LIBRARY);
      }

      fetchAdminData();
   }, [location.state]);

   const totalAssessments = data.assessments.length;
   const avgMastery = 89;
   const userRoles = data.users.reduce((acc, curr) => {
      acc[curr.role] = (acc[curr.role] || 0) + 1;
      return acc;
   }, {});
   const totalUsers = data.users.length;
   const getDynamicHeight = (val) => {
      let adjusted = chartFilter === 'weekly' ? val / 4.5 : val;
      return Math.max(15, Math.min(100, Math.round((adjusted / (totalUsers || 1)) * 100))) + '%';
   };

   return (
      <div className="bg-background text-on-surface min-h-screen flex font-body">
         <aside className="h-screen w-72 flex-col fixed left-0 top-0 border-r border-primary/10 bg-[#f8f1fa] z-40 hidden md:flex py-8 space-y-2">
            <div className="px-8 mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                     <span className="material-symbols-outlined text-on-primary">clinical_notes</span>
                  </div>
                  <div>
                     <h1 className="text-lg font-bold text-[#34313a] font-headline">Cognify</h1>
                     <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Admin Portal</p>
                  </div>
               </div>
            </div>
            <nav className="flex-grow">
               <button onClick={() => setActiveTab('overview')} className={`${activeTab === 'overview' ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#34313a]/70 hover:bg-white/50'} w-[calc(100%-1rem)] text-left rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all`}>
                  <span className="material-symbols-outlined">dashboard</span>
                  <span className="font-label">Overview</span>
               </button>
               <button onClick={() => setActiveTab('users')} className={`${activeTab === 'users' ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#34313a]/70 hover:bg-white/50'} w-[calc(100%-1rem)] text-left rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all`}>
                  <span className="material-symbols-outlined">group</span>
                  <span className="font-label">User Access</span>
               </button>
               <button onClick={() => setActiveTab('organizations')} className={`${activeTab === 'organizations' ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#34313a]/70 hover:bg-white/50'} w-[calc(100%-1rem)] text-left rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all`}>
                  <span className="material-symbols-outlined">corporate_fare</span>
                  <span className="font-label">Organizations</span>
               </button>
               <button onClick={() => setActiveTab('data')} className={`${activeTab === 'data' ? 'bg-white text-[#6750A4] shadow-sm' : 'text-[#34313a]/70 hover:bg-white/50'} w-[calc(100%-1rem)] text-left rounded-full font-bold px-4 py-3 my-1 mx-2 flex items-center gap-3 transition-all`}>
                  <span className="material-symbols-outlined">analytics</span>
                  <span className="font-label">Data & Backups</span>
               </button>
               <button onClick={() => navigate('/admin/goals')} className="w-[calc(100%-1rem)] text-left text-[#34313a]/70 px-4 py-3 my-1 mx-2 flex items-center gap-3 hover:bg-white/50 font-bold rounded-full transition-all">
                  <span className="material-symbols-outlined">menu_book</span>
                  <span className="font-label">Goal Library</span>
               </button>
            </nav>
            <div className="mt-auto px-2 space-y-1">
               <button onClick={logout} className="w-full text-left font-bold text-[#34313a]/70 px-4 py-3 my-1 flex items-center gap-3 hover:bg-white/50 rounded-full transition-all">
                  <span className="material-symbols-outlined">logout</span>
                  <span className="font-label">Sign Out</span>
               </button>
            </div>
         </aside>

         <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
            <header className="bg-[#fdf7fe]/80 backdrop-blur-lg fixed top-0 right-0 left-0 md:left-72 z-50 shadow-sm shadow-purple-500/5 px-6 py-3 flex justify-between items-center h-[68px]">
               <div className="flex items-center gap-4 flex-1 max-w-xl">
                  {/* Removed Search and Icons */}
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 pl-2">
                     <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-on-surface">Admin Dashboard</p>
                        <p className="text-[10px] text-on-surface-variant capitalize">{user?.role} Access</p>
                     </div>
                     <div className="w-10 h-10 rounded-full object-cover border-2 border-primary-container bg-primary text-white flex items-center justify-center font-bold">
                        {user?.first_name?.[0] || 'A'}
                     </div>
                  </div>
               </div>
            </header>

            {loading ? (
               <div className="pt-32 pb-12 px-6 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                  <p className="font-bold text-on-surface-variant animate-pulse">Loading Secure Data...</p>
               </div>
            ) : (
               <section className="pt-24 pb-12 px-6 md:px-10 max-w-7xl mx-auto w-full flex-1">
                  {activeTab === 'overview' && (
                     <>
                        <div className="mb-10">
                           <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-on-surface mb-2">Welcome {user?.first_name}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                           <div className="bg-primary-container/30 rounded-lg p-6 flex flex-col justify-between group hover:bg-primary-container/40 transition-colors">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-3 bg-primary rounded-full text-on-primary">
                                    <span className="material-symbols-outlined">group</span>
                                 </div>
                                 <span className="text-xs font-bold bg-white/60 px-3 py-1 rounded-full text-primary">Live</span>
                              </div>
                              <div>
                                 <h3 className="text-3xl font-black font-headline text-on-primary-container">{data.users.length}</h3>
                                 <p className="text-sm font-medium text-on-primary-container/80">Total System Users</p>
                              </div>
                           </div>
                           <div className="bg-tertiary-container/30 rounded-lg p-6 flex flex-col justify-between group hover:bg-tertiary-container/40 transition-colors">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-3 bg-tertiary rounded-full text-on-tertiary">
                                    <span className="material-symbols-outlined">school</span>
                                 </div>
                              </div>
                              <div>
                                 <h3 className="text-3xl font-black font-headline text-on-tertiary-container">{data.students.length}</h3>
                                 <p className="text-sm font-medium text-on-tertiary-container/80">Total Enrolled Students</p>
                              </div>
                           </div>
                           <div className="bg-secondary-container/30 rounded-lg p-6 flex flex-col justify-between group hover:bg-secondary-container/40 transition-colors">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-3 bg-secondary rounded-full text-on-secondary">
                                    <span className="material-symbols-outlined">trending_up</span>
                                 </div>
                              </div>
                              <div>
                                 <h3 className="text-3xl font-black font-headline text-on-secondary-container">{avgMastery}%</h3>
                                 <p className="text-sm font-medium text-on-secondary-container/80">Average Skill Mastery</p>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                           <div className="lg:col-span-8 space-y-8">
                              <div className="bg-surface-container-lowest rounded-lg p-8 shadow-sm">
                                 <div className="flex justify-between items-end mb-8">
                                    <div>
                                       <h3 className="text-xl font-bold font-headline text-on-surface">User Activity Analytics</h3>
                                       <p className="text-sm text-on-surface-variant">Real-time platform engagement by active user roles</p>
                                    </div>
                                    <div className="flex gap-2">
                                       <button onClick={() => setChartFilter('weekly')} className={`px-4 py-1 text-xs font-bold rounded-full transition-colors ${chartFilter === 'weekly' ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}>Weekly</button>
                                       <button onClick={() => setChartFilter('monthly')} className={`px-4 py-1 text-xs font-bold rounded-full transition-colors ${chartFilter === 'monthly' ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}>Monthly</button>
                                    </div>
                                 </div>
                                 <div className="flex h-64">
                                    {/* Y-Axis */}
                                    <div className="w-8 flex flex-col justify-between text-[10px] text-on-surface-variant font-bold pb-6 text-right pr-2">
                                       <span>{chartFilter === 'weekly' ? Math.ceil(totalUsers / 4) : totalUsers}</span>
                                       <span>{Math.ceil(chartFilter === 'weekly' ? totalUsers / 8 : totalUsers / 2)}</span>
                                       <span>0</span>
                                    </div>

                                    {/* Chart Area */}
                                    <div className="flex-1 flex flex-col">
                                       {/* Bars */}
                                       <div className="flex-1 flex items-end justify-between gap-4 border-l border-b border-outline-variant/30 pl-4 pb-0 relative">
                                          {/* Horizontal Grid lines */}
                                          <div className="absolute top-0 right-0 left-4 h-[1px] bg-outline-variant/10"></div>
                                          <div className="absolute top-1/2 right-0 left-4 h-[1px] bg-outline-variant/10"></div>

                                          <div className="flex-1 bg-surface-container rounded-t relative group transition-all duration-500 ease-in-out" style={{ height: getDynamicHeight(userRoles['therapist'] || 0) }}>
                                             <div className="absolute bottom-0 w-full bg-primary/40 rounded-t h-full group-hover:bg-primary transition-colors"></div>
                                             <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-primary transition-opacity">{chartFilter === 'weekly' ? Math.round((userRoles['therapist'] || 0) / 4) : (userRoles['therapist'] || 0)}</span>
                                          </div>
                                          <div className="flex-1 bg-surface-container rounded-t relative group transition-all duration-500 ease-in-out" style={{ height: getDynamicHeight(userRoles['admin'] || 0) }}>
                                             <div className="absolute bottom-0 w-full bg-primary/60 rounded-t h-full group-hover:bg-primary transition-colors"></div>
                                             <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-primary transition-opacity">{chartFilter === 'weekly' ? Math.round((userRoles['admin'] || 0) / 4) : (userRoles['admin'] || 0)}</span>
                                          </div>
                                          <div className="flex-1 bg-surface-container rounded-t relative group transition-all duration-500 ease-in-out" style={{ height: getDynamicHeight(totalAssessments) }}>
                                             <div className="absolute bottom-0 w-full bg-tertiary/40 rounded-t h-full group-hover:bg-tertiary transition-colors"></div>
                                             <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-tertiary transition-opacity">{chartFilter === 'weekly' ? Math.round(totalAssessments / 4) : totalAssessments}</span>
                                          </div>
                                          <div className="flex-1 bg-surface-container rounded-t relative group transition-all duration-500 ease-in-out" style={{ height: chartFilter === 'weekly' ? '25%' : '45%' }}>
                                             <div className="absolute bottom-0 w-full bg-primary/20 rounded-t h-full group-hover:bg-primary transition-colors"></div>
                                             <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-primary transition-opacity">{chartFilter === 'weekly' ? 12 : 46}</span>
                                          </div>
                                          <div className="flex-1 bg-surface-container rounded-t relative group transition-all duration-500 ease-in-out" style={{ height: chartFilter === 'weekly' ? '50%' : '85%' }}>
                                             <div className="absolute bottom-0 w-full bg-secondary/40 rounded-t h-full group-hover:bg-secondary transition-colors"></div>
                                             <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-secondary transition-opacity">{chartFilter === 'weekly' ? 24 : 96}</span>
                                          </div>
                                       </div>

                                       {/* X-Axis */}
                                       <div className="flex justify-between pl-4 pt-3 text-[10px] font-bold text-outline uppercase tracking-wider">
                                          <span className="flex-1 text-center truncate">Therapists</span>
                                          <span className="flex-1 text-center truncate">Admins</span>
                                          <span className="flex-1 text-center truncate">Assessments</span>
                                          <span className="flex-1 text-center truncate">Logins</span>
                                          <span className="flex-1 text-center truncate">Active</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="lg:col-span-4 space-y-6">
                              <div className="bg-surface-container-low rounded-lg p-6 h-full border border-outline-variant/10">
                                 <h4 className="font-bold font-headline text-lg mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-tertiary text-sm">menu_book</span>
                                    Goal Library Updates
                                 </h4>
                                 <div className="space-y-4">
                                    {goals.slice(0, 5).map(g => (
                                       <div key={g.id} onClick={() => navigate('/admin/goals')} className="flex items-start gap-4 p-3 bg-white/60 hover:bg-white rounded-lg cursor-pointer shadow-sm transition-all border border-transparent hover:border-outline-variant/30">
                                          <div className="w-10 h-10 rounded bg-tertiary-container/30 flex-shrink-0 flex items-center justify-center text-tertiary mt-1">
                                             <span className="material-symbols-outlined text-sm">description</span>
                                          </div>
                                          <div className="overflow-hidden">
                                             <p className="text-sm font-bold text-on-surface truncate">{g.title}</p>
                                             <p className="text-[10px] text-on-surface-variant font-medium mt-1 truncate">{g.domain}</p>
                                          </div>
                                       </div>
                                    ))}
                                    {goals.length === 0 && <p className="text-xs text-textSecondary italic">No goals modified recently.</p>}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </>
                  )}

                  {activeTab === 'users' && (
                     <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                           <div>
                              <h2 className="text-3xl font-black font-headline text-on-surface tracking-tight">User Access Management</h2>
                              <p className="text-on-surface-variant mt-2 font-medium">Control who has access across the entire platform.</p>
                           </div>
                           <button className="bg-primary text-on-primary shadow-sm hover:shadow-md hover:bg-primary-dim transition-all duration-300 font-bold py-3 px-6 rounded-full transform hover:-translate-y-0.5 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">person_add</span> Invite User
                           </button>
                        </div>

                        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
                           <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                 <thead className="bg-surface-container-low text-on-surface-variant text-xs border-b border-outline-variant/20">
                                    <tr>
                                       <th className="px-6 py-4 font-bold uppercase tracking-widest">User ID</th>
                                       <th className="px-6 py-4 font-bold uppercase tracking-widest">Name</th>
                                       <th className="px-6 py-4 font-bold uppercase tracking-widest">Email</th>
                                       <th className="px-6 py-4 font-bold uppercase tracking-widest">Role</th>
                                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-outline-variant/20">
                                    {data.users.map(u => (
                                       <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                                          <td className="px-6 py-4 font-mono text-xs font-semibold text-outline">{u.id}</td>
                                          <td className="px-6 py-4 font-bold text-on-surface">{u.first_name} {u.last_name}</td>
                                          <td className="px-6 py-4 text-on-surface-variant text-sm">{u.email}</td>
                                          <td className="px-6 py-4">
                                             <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{u.role}</span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                             <button className="text-tertiary font-bold text-sm hover:text-tertiary-dim transition-colors uppercase tracking-wider">Edit</button>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'organizations' && (
                     <div className="space-y-6">
                        <div className="mb-8">
                           <h2 className="text-3xl font-black font-headline text-on-surface tracking-tight">Organization Roster</h2>
                           <p className="text-on-surface-variant mt-2 font-medium">Manage corporate licenses and multi-tenant nodes.</p>
                        </div>
                        <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm border border-outline-variant/20 text-center text-on-surface-variant py-20">
                           <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 opacity-50">corporate_fare</span>
                           <p className="text-lg font-bold">Organization module coming soon</p>
                        </div>
                     </div>
                  )}

                  {activeTab === 'data' && (
                     <div className="space-y-6">
                        <div className="mb-8">
                           <h2 className="text-3xl font-black font-headline text-on-surface tracking-tight">Data Oversight & Backups</h2>
                           <p className="text-on-surface-variant mt-2 font-medium">Export raw system metrics entirely securely.</p>
                        </div>

                        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-6">
                           <div>
                              <h3 className="text-xl font-bold font-headline mb-2 flex items-center gap-3 text-on-surface">
                                 <span className="material-symbols-outlined text-primary">database</span> SQLite / LibSQL Export
                              </h3>
                              <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed font-medium">Download the entire tabular construct at any time as JSON for safe auditing and offline retention.</p>
                           </div>
                           <button
                              onClick={() => {
                                 const fileObj = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                 const link = document.createElement("a");
                                 link.href = URL.createObjectURL(fileObj);
                                 link.download = `cognify_backup_${new Date().toISOString().split('T')[0]}.json`;
                                 link.click();
                              }}
                              className="bg-primary hover:bg-primary-dim text-on-primary font-bold py-3 px-6 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 whitespace-nowrap">
                              <span className="material-symbols-outlined text-sm">download</span> JSON Dump
                           </button>
                        </div>
                     </div>
                  )}
               </section>
            )}
         </main>
      </div>
   );
};

export default AdminDashboard;
