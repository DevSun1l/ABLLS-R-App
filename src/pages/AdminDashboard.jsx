import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState({ 
        users: [], 
        students: [], 
        assessments: [], 
        loginLogs: [],
        feedback: { entries: [], insights: { avgRating: 0, moodDistribution: { happy: 0, neutral: 0, sad: 0 }, totalCount: 0 } }
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
    const [chartFilter, setChartFilter] = useState('month');
    const [tick, setTick] = useState(0);

    // Modal States
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [inviteForm, setInviteForm] = useState({ email: '', firstName: '', lastName: '', role: 'therapist' });
    const [processing, setProcessing] = useState(false);

    const fetchAdminData = async () => {
        try {
            const token = sessionStorage.getItem('ablls_token');
            const [dataRes, feedbackRes] = await Promise.all([
                fetch('/api/admin/data', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/feedback', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            let newData = { ...data };
            if (dataRes.ok) {
                const result = await dataRes.json();
                newData = { ...newData, ...result };
            }
            if (feedbackRes.ok) {
                const fbResult = await feedbackRes.json();
                newData = { ...newData, feedback: fbResult };
            }
            setData(newData);
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
        const tickInterval = setInterval(() => setTick(t => t + 1), 1000); // Live updates every second
        return () => {
            clearInterval(interval);
            clearInterval(tickInterval);
        };
    }, []);

    const timeAgo = (date) => {
        if (!date) return '...';
        const now = new Date();
        // Replacing space with T for cross-browser ISO compatibility (e.g. Safari)
        const past = new Date(String(date).replace(' ', 'T'));
        const seconds = Math.floor((now - past) / 1000);
        
        if (seconds < 5) return 'just now';
        if (seconds < 60) return `${seconds}s ago`;
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ${seconds % 60}s ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
        
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        
        return past.toLocaleDateString();
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const token = sessionStorage.getItem('ablls_token');
            const res = await fetch('/api/admin/invite', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inviteForm)
            });
            if (res.ok) {
                setShowInviteModal(false);
                setInviteForm({ email: '', firstName: '', lastName: '', role: 'therapist' });
                fetchAdminData();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to invite user');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    const handleToggleBlock = async (userToUpdate) => {
        const newStatus = userToUpdate.status === 'blocked' ? 'active' : 'blocked';
        setProcessing(true);
        try {
            const token = sessionStorage.getItem('ablls_token');
            const res = await fetch('/api/admin/update-user', {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userToUpdate.id, status: newStatus })
            });
            if (res.ok) {
                // Update local state for immediate feedback if possible, or just refresh
                fetchAdminData();
                if (selectedUser?.id === userToUpdate.id) {
                    setSelectedUser({ ...userToUpdate, status: newStatus });
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(false);
        }
    };

    const formatTimestamp = (date) => {
        return new Date(date).toLocaleString('en-US', { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
    };

    const getCombinedActivity = () => {
        const activities = [];
        const parse = (d) => {
            if (!d) return new Date();
            const date = new Date(String(d).replace(' ', 'T'));
            return isNaN(date.getTime()) ? new Date() : date;
        };
        
        data.users.forEach(u => {
            if (u.created_at) {
                activities.push({
                    id: `u-${u.id}`,
                    date: parse(u.created_at),
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
                    date: parse(s.created_at),
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
                    date: parse(a.created_at),
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
                                            <h3 className="text-xl font-bold text-on-surface font-headline">System Insights</h3>
                                            <p className="text-sm text-on-surface-variant font-medium">Platform metrics overview · <span className="text-tertiary font-bold">Live Data</span></p>
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
                                    {/* Bar Chart — Real-time system metrics */}
                                    {(() => {
                                        const parseDate = (d) => {
                                            if (!d) return new Date(0);
                                            if (d instanceof Date) return d;
                                            return new Date(String(d).replace(' ', 'T'));
                                        };

                                        const now = new Date();
                                        const cutoff = new Date(now);
                                        if (chartFilter === 'week') cutoff.setDate(now.getDate() - 7);
                                        else if (chartFilter === 'month') cutoff.setMonth(now.getMonth() - 1);
                                        else cutoff.setFullYear(now.getFullYear() - 1);

                                        const inRange = (d) => {
                                            if (!d) return false;
                                            return parseDate(d) >= cutoff;
                                        };

                                        const filteredUsers = (data.users || []).filter(u => inRange(u.created_at));
                                        const filteredStudents = (data.students || []).filter(s => inRange(s.created_at));
                                        const filteredAssessments = (data.assessments || []).filter(a => inRange(a.created_at));
                                        const filteredAdmins = filteredUsers.filter(u => u.role === 'admin');
                                        const filteredLogins = (data.loginLogs || []).filter(l => inRange(l.timestamp)).length;

                                        const periodLabel = chartFilter === 'week' ? 'This Week' : chartFilter === 'month' ? 'This Month' : 'This Year';

                                        const chartData = [
                                            { label: 'Active Users', val: filteredUsers.length, icon: 'person', color: 'from-[#655789] to-[#8B7AB8]' },
                                            { label: 'Students',     val: filteredStudents.length, icon: 'school', color: 'from-[#625c71] to-[#8A8499]' },
                                            { label: 'Assessments',  val: filteredAssessments.length, icon: 'assignment', color: 'from-[#7b5270] to-[#A87B9C]' },
                                            { label: 'Total Logins', val: filteredLogins, icon: 'login', color: 'from-[#594b7c] to-[#8573AA]' },
                                            { label: 'Admins',       val: filteredAdmins.length, icon: 'admin_panel_settings', color: 'from-[#6e4664] to-[#9A7090]' },
                                        ];

                                        const maxVal = Math.max(...chartData.map(d => d.val), 1);
                                        // Generate nice Y-axis ticks
                                        const rawStep = maxVal / 4;
                                        const step = rawStep <= 1 ? 1 : rawStep <= 5 ? 5 : Math.ceil(rawStep / 5) * 5;
                                        const yMax = Math.ceil(maxVal / step) * step || step;
                                        const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((yMax / 4) * i));
                                        const barHeight = 240;

                                        return (
                                            <div className="flex">
                                                {/* Y-Axis */}
                                                <div className="flex flex-col justify-between items-end pr-3 py-1" style={{ height: barHeight }}>
                                                    {yTicks.slice().reverse().map(tick => (
                                                        <span key={tick} className="text-[10px] font-bold text-on-surface-variant/50 tabular-nums leading-none">{tick}</span>
                                                    ))}
                                                </div>

                                                {/* Chart Area */}
                                                <div className="flex-1">
                                                    <div className="relative border-l border-b border-outline-variant/20" style={{ height: barHeight }}>
                                                        {/* Horizontal grid lines */}
                                                        {yTicks.map(tick => (
                                                            <div 
                                                                key={tick}
                                                                className="absolute left-0 right-0 border-t border-dashed border-outline-variant/10"
                                                                style={{ bottom: `${(tick / yMax) * 100}%` }}
                                                            />
                                                        ))}

                                                        {/* Bars */}
                                                        <div className="absolute inset-0 flex items-end justify-around px-4 gap-4">
                                                            {chartData.map(item => {
                                                                const pct = yMax > 0 ? (item.val / yMax) * 100 : 0;
                                                                return (
                                                                    <div key={item.label} className="flex-1 flex flex-col items-center group relative h-full justify-end max-w-[100px]">
                                                                        {/* Hover tooltip */}
                                                                        <div 
                                                                            className="absolute left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[11px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-2xl z-10 whitespace-nowrap"
                                                                            style={{ bottom: `calc(${pct}% + 12px)` }}
                                                                        >
                                                                            {item.val} {item.label} · {periodLabel}
                                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-inverse-surface"></div>
                                                                        </div>
                                                                        {/* Value always visible above bar */}
                                                                        <span className="text-sm font-black text-on-surface mb-1.5 group-hover:opacity-0 transition-opacity">
                                                                            {item.val}
                                                                        </span>
                                                                        {/* Rounded rectangle bar — darkens on hover */}
                                                                        <div 
                                                                            className={`w-full rounded-xl bg-gradient-to-t ${item.color} transition-all duration-300 ease-out shadow-md group-hover:shadow-xl relative overflow-hidden cursor-pointer`}
                                                                            style={{ 
                                                                                height: `${pct}%`, 
                                                                                minHeight: item.val > 0 ? '8px' : '2px',
                                                                            }}
                                                                        >
                                                                            {/* Darken overlay on hover */}
                                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-xl"></div>
                                                                            {/* Subtle shine */}
                                                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 rounded-xl"></div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* X-Axis Labels */}
                                                    <div className="flex items-start justify-around px-4 gap-4 mt-3">
                                                        {chartData.map(item => (
                                                            <div key={item.label} className="flex-1 text-center max-w-[100px] flex flex-col items-center gap-0.5">
                                                                <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40">{item.icon}</span>
                                                                <span className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/60 leading-tight">{item.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
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
                            <button 
                                onClick={() => setShowInviteModal(true)}
                                className="bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all duration-300 font-black text-xs uppercase tracking-widest py-4 px-8 rounded-full transform hover:-translate-y-1 flex items-center gap-3"
                            >
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
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Students</th>
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
                                                <td className="px-6 py-4">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10 ${u.status === 'blocked' ? 'bg-error/10 text-error border-error/20' : 'bg-tertiary-container/40 text-tertiary border-tertiary/10'}`}>
                                                        {u.status || 'active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-[10px] font-bold text-on-surface">
                                                    {u.student_count || 0}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                                                        className="text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 px-4 py-2 rounded-full transition-all"
                                                    >
                                                        Manage
                                                    </button>
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
                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 pb-0 flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black font-headline text-on-surface tracking-tight">Invite Faculty</h3>
                                    <p className="text-on-surface-variant text-sm font-medium opacity-70">Provision a new clinical access node.</p>
                                </div>
                                <button onClick={() => setShowInviteModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleInvite} className="p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">First Name</label>
                                        <input 
                                            required
                                            className="w-full bg-surface-container-high border-none rounded-full h-12 px-6 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                                            value={inviteForm.firstName}
                                            onChange={e => setInviteForm({...inviteForm, firstName: e.target.value})}
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Last Name</label>
                                        <input 
                                            required
                                            className="w-full bg-surface-container-high border-none rounded-full h-12 px-6 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                                            value={inviteForm.lastName}
                                            onChange={e => setInviteForm({...inviteForm, lastName: e.target.value})}
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Email Identity</label>
                                    <input 
                                        required
                                        type="email"
                                        className="w-full bg-surface-container-high border-none rounded-full h-12 px-6 text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                                        value={inviteForm.email}
                                        onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                                        placeholder="john.doe@cognifycare.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Access Protocol (Role)</label>
                                    <div className="flex gap-2">
                                        {['therapist', 'teacher', 'admin'].map(r => (
                                            <button 
                                                key={r}
                                                type="button"
                                                onClick={() => setInviteForm({...inviteForm, role: r})}
                                                className={`flex-1 h-12 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${inviteForm.role === r ? 'bg-primary text-on-primary border-primary shadow-md' : 'bg-surface-container-high text-on-surface-variant border-transparent'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-primary text-on-primary h-14 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        {processing ? <div className="w-5 h-5 border-2 border-on-primary border-t-transparent animate-spin rounded-full" /> : 'Execute Invitation'}
                                    </button>
                                    <p className="text-[10px] text-center mt-4 text-on-surface-variant font-bold opacity-60 uppercase tracking-widest">Default temporary password will be: <span className="text-primary italic">Cognify2026</span></p>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* User Detail Modal */}
                {showUserModal && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                            <div className="p-8 flex justify-between items-start border-b border-outline-variant/10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center text-xl font-black shadow-inner">
                                        {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black font-headline text-on-surface tracking-tight">{selectedUser.first_name} {selectedUser.last_name}</h3>
                                        <p className="text-on-surface-variant text-sm font-medium italic opacity-70">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handleToggleBlock(selectedUser)}
                                        disabled={processing}
                                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedUser.status === 'blocked' ? 'bg-error text-on-error border-error shadow-lg shadow-error/20' : 'bg-surface-container-high text-error border-error/20 hover:bg-error/5'}`}
                                    >
                                        {selectedUser.status === 'blocked' ? 'Unblock Node' : 'Block Access'}
                                    </button>
                                    <button onClick={() => setShowUserModal(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Student Assets</p>
                                        <p className="text-3xl font-black text-primary font-headline">{selectedUser.student_count || 0}</p>
                                        <p className="text-[10px] text-on-surface-variant font-medium opacity-60 mt-1 uppercase">Under Management</p>
                                    </div>
                                    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Students Assessed</p>
                                        <p className="text-3xl font-black text-tertiary font-headline">{selectedUser.students_assessed_count || 0}</p>
                                        <p className="text-[10px] text-on-surface-variant font-medium opacity-60 mt-1 uppercase">Unique Evaluations</p>
                                    </div>
                                    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Total Tests</p>
                                        <p className="text-3xl font-black text-secondary font-headline">{selectedUser.assessment_count || 0}</p>
                                        <p className="text-[10px] text-on-surface-variant font-medium opacity-60 mt-1 uppercase">Performances</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-2">Access History (Recent Logins)</h4>
                                    <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 h-48 overflow-y-auto">
                                        {(data.loginLogs || []).filter(l => l.user_id === selectedUser.id).length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-on-surface-variant/40 italic text-xs">No login records found</div>
                                        ) : (
                                            <div className="divide-y divide-outline-variant/10">
                                                {(data.loginLogs || []).filter(l => l.user_id === selectedUser.id).map(log => (
                                                    <div key={log.id} className="p-4 flex justify-between items-center group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                            <div>
                                                                <p className="text-xs font-bold text-on-surface uppercase tracking-tight">System Authentication</p>
                                                                <p className="text-[10px] text-on-surface-variant font-medium opacity-60">{new Date(log.timestamp).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-1 rounded italic h-min">{timeAgo(log.timestamp)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'feedback' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 border-b border-outline-variant/10 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-4xl font-black font-headline text-on-surface tracking-tight">Feedback Intelligence</h2>
                                <p className="text-on-surface-variant mt-2 font-medium italic opacity-70">Capture and visualize specialist sentiment in real-time.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-surface-container-high px-6 py-3 rounded-2xl border border-outline-variant/20 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-warning text-2xl">star</span>
                                    <div>
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Avg Rating</p>
                                        <p className="text-xl font-black text-on-surface leading-none">{data.feedback.insights.avgRating.toFixed(1)} <span className="text-xs text-on-surface-variant italic">/ 5.0</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-6">
                            {/* Mood Insights Chart */}
                            <div className="col-span-12 lg:col-span-12 bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                    <div className="max-w-md">
                                        <h3 className="text-2xl font-black font-headline text-on-surface mb-4 tracking-tight">Emotional Sentiment Matrix</h3>
                                        <p className="text-on-surface-variant text-sm font-medium leading-relaxed opacity-70 mb-8">
                                            Aggregated clinical mood pulse based on anonymous specialist submissions. Updated every 30 seconds.
                                        </p>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Positive', key: 'happy', color: 'bg-success', icon: '😊' },
                                                { label: 'Neutral', key: 'neutral', color: 'bg-primary', icon: '😐' },
                                                { label: 'Critical', key: 'sad', color: 'bg-error', icon: '😟' }
                                            ].map(mood => {
                                                const count = data.feedback.insights.moodDistribution[mood.key];
                                                const total = data.feedback.insights.totalCount || 1;
                                                const pct = (count / total) * 100;
                                                return (
                                                    <div key={mood.key} className="space-y-1">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                            <span className="flex items-center gap-2"><span className="text-sm">{mood.icon}</span> {mood.label}</span>
                                                            <span>{pct.toFixed(0)}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${mood.color} transition-all duration-1000 ease-out`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="relative w-64 h-64 shrink-0 flex items-center justify-center">
                                        {/* Simple SVG Donut Chart */}
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            {(() => {
                                                const total = data.feedback.insights.totalCount || 1;
                                                const h = data.feedback.insights.moodDistribution.happy;
                                                const n = data.feedback.insights.moodDistribution.neutral;
                                                const s = data.feedback.insights.moodDistribution.sad;
                                                
                                                const hPct = (h / total) * 100;
                                                const nPct = (n / total) * 100;
                                                const sPct = (s / total) * 100;
                                                
                                                return (
                                                    <>
                                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-surface-container-high" strokeWidth="3" />
                                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-success" strokeWidth="3" strokeDasharray={`${hPct} 100`} strokeDashoffset="0" />
                                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray={`${nPct} 100`} strokeDashoffset={`-${hPct}`} />
                                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-error" strokeWidth="3" strokeDasharray={`${sPct} 100`} strokeDashoffset={`-${hPct + nPct}`} />
                                                    </>
                                                );
                                            })()}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <p className="text-3xl font-black text-on-surface leading-none">{data.feedback.insights.totalCount}</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant opacity-60">Submissions</p>
                                        </div>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined absolute -right-8 -top-8 text-[180px] text-primary/5 -rotate-12 transition-transform group-hover:scale-110">sentiment_satisfied</span>
                            </div>

                            {/* Feedback Feed */}
                            <div className="col-span-12">
                                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                                        <h3 className="text-lg font-black font-headline text-on-surface tracking-tight">Recent Perspectives</h3>
                                        <div className="flex gap-2">
                                            <span className="flex items-center gap-1.5 text-[10px] font-black text-tertiary uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Streaming Insights
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
                                                <tr>
                                                    <th className="px-8 py-4">Submission ID</th>
                                                    <th className="px-8 py-4">Specialist Alias</th>
                                                    <th className="px-8 py-4 text-center">Mood</th>
                                                    <th className="px-8 py-4">Critical Synthesis (Comments)</th>
                                                    <th className="px-8 py-4 text-right">Chronology</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant/10">
                                                {data.feedback.entries.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="px-8 py-12 text-center text-on-surface-variant/40 italic text-sm">No feedback captures detected in system</td>
                                                    </tr>
                                                ) : data.feedback.entries.map(fb => (
                                                    <tr key={fb.id} className="hover:bg-surface-container-low/30 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <span className="text-[10px] font-mono font-bold text-outline opacity-60">#FB-{fb.id.slice(-6).toUpperCase()}</span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-black ring-1 ring-outline-variant/20">
                                                                    {fb.name?.[0]?.toUpperCase() || 'A'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-on-surface">{fb.name}</p>
                                                                    <p className="text-[10px] font-black text-on-surface-variant opacity-60 uppercase">{fb.assessor_type}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4 text-center">
                                                            <div className="text-2xl drop-shadow-sm group-hover:scale-125 transition-transform duration-300">
                                                                {fb.mood === 'happy' ? '😊' : fb.mood === 'neutral' ? '😐' : '😟'}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="max-w-md">
                                                                <p className="text-sm font-bold text-primary italic mb-1">"{fb.one_word}"</p>
                                                                <p className="text-xs text-on-surface-variant font-medium leading-relaxed line-clamp-2 hover:line-clamp-none transition-all">{fb.comments}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 italic">{timeAgo(fb.created_at)}</p>
                                                            <p className="text-[10px] font-medium text-on-surface-variant opacity-40 uppercase">{formatTimestamp(fb.created_at)}</p>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
