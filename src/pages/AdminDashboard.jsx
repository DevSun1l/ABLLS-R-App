import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState({ users: [], students: [], assessments: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
    const [chartFilter, setChartFilter] = useState('month');

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

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    useEffect(() => {
        fetchAdminData();
        const interval = setInterval(fetchAdminData, 30000);
        return () => clearInterval(interval);
    }, []);

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
    };

    const formatTimestamp = (date) => {
        return new Date(date).toLocaleString('en-US', { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
    };

    const getCombinedActivity = () => {
        const activities = [];
        data.users.forEach(u => {
            if (u.created_at) {
                activities.push({
                    id: `u-${u.id}`,
                    date: new Date(u.created_at),
                    type: 'user',
                    icon: 'person_add',
                    color: 'bg-primary',
                    text: <><span className="font-bold">{u.first_name} {u.last_name?.[0] || ''}.</span> registered as <span className="text-primary font-bold uppercase">{u.role}</span></>
                });
            }
        });
        data.students.forEach(s => {
            if (s.created_at) {
                activities.push({
                    id: `s-${s.id}`,
                    date: new Date(s.created_at),
                    type: 'student',
                    icon: 'child_care',
                    color: 'bg-secondary',
                    text: <>Student <span className="text-primary font-bold">{s.name}</span> enrolled in system</>
                });
            }
        });
        data.assessments.forEach(a => {
            if (a.created_at) {
                activities.push({
                    id: `a-${a.id}`,
                    date: new Date(a.created_at),
                    type: 'assessment',
                    icon: 'check_circle',
                    color: 'bg-tertiary',
                    text: <>Assessment <span className="text-primary font-bold">#{a.id}</span> generated for analysis</>
                });
            }
        });
        return activities.sort((a, b) => b.date - a.date);
    };

    const activityFeed = getCombinedActivity();
    const avgMastery = 84.2;

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="p-6 min-h-[calc(100vh-4rem)]">
                {activeTab === 'overview' && (
                    <>
                        {/* Welcome Header */}
                        <header className="mb-8 flex justify-between items-end">
                            <div>
                                <p className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase mb-2">Systems Operational</p>
                                <h1 className="text-4xl font-black text-on-surface tracking-tight font-headline">Welcome, Admin <span className="text-primary-dim">{user?.last_name}</span></h1>
                            </div>
                            <div className="bg-tertiary-container/30 px-6 py-3 rounded-full flex items-center gap-3 border border-tertiary/10">
                                <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
                                <p className="text-xs font-bold text-on-tertiary-container uppercase tracking-wide">Main Clinical Node: Sector 4</p>
                            </div>
                        </header>

                        {/* Stats Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                            <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden group border border-outline-variant/10 shadow-sm transition-all hover:shadow-md">
                                <div className="relative z-10">
                                    <p className="text-on-surface-variant font-medium text-sm mb-1">Total System Users</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-primary font-headline">{data.users.length}</span>
                                        <span className="text-xs font-bold text-tertiary uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined absolute -right-3 -bottom-3 text-8xl text-primary/5 transition-transform group-hover:scale-110">group</span>
                            </div>
                            <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden group border border-outline-variant/10 shadow-sm transition-all hover:shadow-md">
                                <div className="relative z-10">
                                    <p className="text-on-surface-variant font-medium text-sm mb-1">Students Enrolled</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-primary font-headline">{data.students.length}</span>
                                        <span className="text-xs font-bold text-tertiary uppercase tracking-widest">+12%</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined absolute -right-3 -bottom-3 text-8xl text-primary/5 transition-transform group-hover:scale-110">groups</span>
                            </div>
                            <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden group border border-outline-variant/10 shadow-sm transition-all hover:shadow-md">
                                <div className="relative z-10">
                                    <p className="text-on-surface-variant font-medium text-sm mb-1">Skill Mastery</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-primary font-headline">{avgMastery}%</span>
                                        <div className="w-24 h-1.5 bg-outline-variant/20 rounded-full overflow-hidden ml-2">
                                            <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${avgMastery}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined absolute -right-3 -bottom-3 text-8xl text-primary/5 transition-transform group-hover:scale-110">psychology</span>
                            </div>
                            <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden group border border-outline-variant/10 shadow-sm transition-all hover:shadow-md">
                                <div className="relative z-10">
                                    <p className="text-on-surface-variant font-medium text-sm mb-1">Total Assessments</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-primary font-headline">{data.assessments.length}</span>
                                        <span className="px-3 py-1 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded-full uppercase ml-2 border border-tertiary/10 tracking-widest">Live</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined absolute -right-3 -bottom-3 text-8xl text-primary/5 transition-transform group-hover:scale-110">pending_actions</span>
                            </div>
                        </div>

                        {/* Main Content Area - Chart + Activity side by side */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Performance Chart Section */}
                            <section className="col-span-12 lg:col-span-8 space-y-6">
                                <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/10 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-on-surface font-headline">Student Performance Overview</h3>
                                            <p className="text-sm text-on-surface-variant font-medium">Aggregate mastery levels across primary domains</p>
                                        </div>
                                        <div className="flex gap-2 p-1 bg-surface-container rounded-full border border-outline-variant/10">
                                            {['week', 'month', 'year'].map(f => (
                                                <button 
                                                    key={f} 
                                                    onClick={() => setChartFilter(f)}
                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-widest ${chartFilter === f ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-white/50'}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-56 flex items-end justify-between gap-3 px-2 pb-2 border-b border-outline-variant/10">
                                        {[
                                            { label: 'Social', val: 72 },
                                            { label: 'Cognitive', val: 84 },
                                            { label: 'Motor', val: 65 },
                                            { label: 'Language', val: 91 },
                                            { label: 'Adaptive', val: 78 },
                                            { label: 'Executive', val: 88 }
                                        ].map(item => (
                                            <div key={item.label} className="flex-1 flex flex-col items-center gap-2 group relative">
                                                <div className="w-full bg-primary/5 rounded-t-lg relative h-full transition-all group-hover:bg-primary/10">
                                                    <div 
                                                        className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-1000 ease-out group-hover:brightness-110 shadow-sm" 
                                                        style={{ height: `${item.val}%` }}
                                                    >
                                                        <div className="w-full h-full bg-gradient-to-t from-black/5 to-transparent rounded-t-lg opacity-50"></div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                                                    {item.val}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Goals Preview Tile */}
                                <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/10 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center shadow-lg shadow-tertiary/20">
                                            <span className="material-symbols-outlined text-2xl">library_books</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black font-headline text-on-surface tracking-tight">Access Goal Library</h3>
                                            <p className="text-on-surface-variant font-medium text-sm opacity-80">Manage intervention templates and clinical protocols.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/admin/goals')}
                                        className="bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary transition-all font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full border border-primary/10 shadow-sm active:scale-95"
                                    >
                                        Enter Library
                                    </button>
                                </div>
                            </section>

                            {/* Recent Activity Feed */}
                            <section className="col-span-12 lg:col-span-4">
                                <div className="bg-surface-container-low rounded-lg p-5 lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-5.5rem)] flex flex-col border border-outline-variant/10 shadow-sm">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg font-bold font-headline text-on-surface tracking-tight">Recent Activity</h3>
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-tertiary uppercase tracking-widest">
                                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse inline-block"></span> Live
                                        </span>
                                    </div>
                                    <div className="space-y-5 overflow-y-auto pr-1 flex-1 pb-4" style={{ scrollbarWidth: 'thin' }}>
                                        {activityFeed.length === 0 ? (
                                            <div className="text-center py-16 text-on-surface-variant/40 italic text-sm">No recent system logs</div>
                                        ) : activityFeed.slice(0, 20).map(item => (
                                            <div key={item.id} className="flex gap-3 group/activity">
                                                <div className="shrink-0">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-on-primary ${item.color} shadow-sm group-hover/activity:scale-110 transition-transform`}>
                                                        <span className="material-symbols-outlined text-sm">{item.icon}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 border-b border-outline-variant/10 pb-4 min-w-0">
                                                    <p className="text-sm font-medium text-on-surface leading-snug">
                                                        {item.text}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-60">{timeAgo(item.date)}</span>
                                                        <span className="w-1 h-1 bg-outline rounded-full opacity-20"></span>
                                                        <span className="text-[10px] text-on-surface-variant font-medium opacity-50 truncate">{formatTimestamp(item.date)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-outline-variant/10">
                                        <div className="p-4 bg-primary text-on-primary rounded-lg shadow-lg shadow-primary/20 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">shield</span> Audit Protocol
                                                </p>
                                                <p className="text-xs font-medium leading-relaxed opacity-80">All actions cryptographically logged for compliance review.</p>
                                            </div>
                                            <span className="material-symbols-outlined absolute -right-3 -bottom-3 text-6xl text-on-primary/10 rotate-12">database</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </>
                )}

                {/* Tab Views */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-outline-variant/10 pb-8">
                            <div>
                                <h2 className="text-4xl font-black font-headline text-on-surface tracking-tight">User Access Management</h2>
                                <p className="text-on-surface-variant mt-2 font-medium">Control institutional access and role configurations.</p>
                            </div>
                            <button className="bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all duration-300 font-black text-xs uppercase tracking-widest py-4 px-8 rounded-full transform hover:-translate-y-1 flex items-center gap-3">
                                <span className="material-symbols-outlined">person_add</span> Invite Faculty
                            </button>
                        </div>

                        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-container-low text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] border-b border-outline-variant/20">
                                        <tr>
                                            <th className="px-6 py-4">Node ID</th>
                                            <th className="px-6 py-4">Identity</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Protocol Role</th>
                                            <th className="px-6 py-4 text-right">Settings</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                        {data.users.map(u => (
                                            <tr key={u.id} className="hover:bg-surface-container-low/30 transition-colors">
                                                <td className="px-6 py-4 font-mono text-[10px] font-bold text-outline uppercase">#N-{u.id}</td>
                                                <td className="px-6 py-4 font-bold text-on-surface flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center text-xs font-black shrink-0">
                                                        {u.first_name?.[0]}{u.last_name?.[0]}
                                                    </div>
                                                    {u.first_name} {u.last_name}
                                                </td>
                                                <td className="px-6 py-4 text-on-surface-variant text-sm font-medium italic opacity-80">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-primary-container/40 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">{u.role}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 px-4 py-2 rounded-full transition-all">Manage</button>
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
                        <div className="mb-8 border-b border-outline-variant/10 pb-8">
                            <h2 className="text-4xl font-black font-headline text-on-surface tracking-tight">Organization Roster</h2>
                            <p className="text-on-surface-variant mt-2 font-medium">Manage corporate licenses and clinical multi-tenant clusters.</p>
                        </div>
                        <div className="bg-surface-container-lowest p-20 rounded-3xl shadow-sm border border-outline-variant/20 text-center flex flex-col items-center group">
                            <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-8 text-outline shadow-inner transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-5xl">corporate_fare</span>
                            </div>
                            <h3 className="text-2xl font-black font-headline text-on-surface mb-3 tracking-tight">Organization Control Protocol</h3>
                            <p className="text-on-surface-variant text-sm max-w-sm font-medium leading-relaxed opacity-70">Enhanced multi-tenant data isolation and node clustering management modules are currently in secure staging.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="space-y-6">
                        <div className="mb-8 border-b border-outline-variant/10 pb-8">
                            <h2 className="text-4xl font-black font-headline text-on-surface tracking-tight">Data Oversight & Archival</h2>
                            <p className="text-on-surface-variant mt-2 font-medium">Capture system logs and tabular constructs for encrypted off-site retention.</p>
                        </div>

                        <div className="bg-surface-container-lowest p-10 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                            <div className="relative z-10 flex gap-8 items-center">
                                <div className="w-20 h-20 rounded-3xl bg-tertiary-container text-tertiary flex items-center justify-center shadow-lg shadow-tertiary/20 shrink-0">
                                    <span className="material-symbols-outlined text-4xl">database</span>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black font-headline mb-3 text-on-surface tracking-tight leading-tight">System Matrix Backup</h3>
                                    <p className="text-on-surface-variant max-w-xl text-sm leading-relaxed font-medium opacity-80">Capture the entire relational matrix as an industry-standard JSON construct.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const fileObj = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                    const link = document.createElement("a");
                                    link.href = URL.createObjectURL(fileObj);
                                    link.download = `cognify_matrix_dump_${new Date().toISOString().split('T')[0]}.json`;
                                    link.click();
                                }}
                                className="relative z-10 bg-primary hover:bg-primary-dim text-on-primary font-black text-xs uppercase tracking-[0.2em] py-5 px-10 rounded-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 flex items-center gap-3 whitespace-nowrap active:scale-95"
                            >
                                <span className="material-symbols-outlined">download</span> Snapshot Matrix
                            </button>
                            <span className="material-symbols-outlined absolute -right-16 -bottom-16 text-[200px] text-primary/5 -rotate-12 transition-transform group-hover:scale-110">database</span>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
