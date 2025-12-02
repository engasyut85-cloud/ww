
import React, { useMemo } from 'react';
import { Employee, AttendanceRecord, LeaveRequest, Loan, Page, PerformanceReview, BonusRecord, TaxDebt } from '../types';
import { calculateSalary } from '../utils/payrollLogic';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { Users, Banknote, CalendarCheck, Clock, Briefcase, Wallet, Plane, PlusCircle, ArrowRight, TrendingUp } from 'lucide-react';

interface DashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  loans: Loan[];
  reviews: PerformanceReview[];
  bonuses: BonusRecord[];
  penalties: Record<string, number>;
  taxDebts: TaxDebt[];
  setPage: (page: Page) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ employees, attendance, leaves, loans, setPage, reviews, bonuses, penalties, taxDebts }) => {
  // --- Real-Time Calculations ---
  const totalEmployees = employees.length;

  const totalPayroll = useMemo(() => {
    return employees.reduce((acc, emp) => {
        const slip = calculateSalary(
            emp, loans, reviews, bonuses, 0, penalties[emp.id] || 0, 0, taxDebts
        );
        return acc + slip.netSalary;
    }, 0);
  }, [employees, loans, reviews, bonuses, penalties, taxDebts]);

  const activeLoansTotal = useMemo(() => {
      return loans
        .filter(l => l.status === 'active')
        .reduce((acc, l) => acc + l.remainingAmount, 0);
  }, [loans]);

  const today = new Date().toISOString().split('T')[0];
  const onLeaveToday = leaves.filter(l => 
      l.status === 'approved' && l.startDate <= today && l.endDate >= today
  ).length;

  const presentToday = attendance.filter(a => a.date === today && a.status === 'present').length;
  const attendancePercentage = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  // --- Chart Data ---
  const deptCounts: Record<string, number> = {};
  employees.forEach(emp => {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
  });
  
  const deptData = Object.keys(deptCounts).map(key => ({
      name: key.length > 20 ? key.substring(0, 15) + '...' : key,
      value: deptCounts[key]
  }));
  
  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#065f46', '#047857', '#a7f3d0'];

  const attendanceChartData = [
    { name: 'الأحد', present: 95, absent: 5 },
    { name: 'الاثنين', present: 92, absent: 8 },
    { name: 'الثلاثاء', present: presentToday > 0 ? (presentToday / totalEmployees) * 100 : 88, absent: 12 },
    { name: 'الأربعاء', present: 0, absent: 0 },
    { name: 'الخميس', present: 0, absent: 0 },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in w-full max-w-[1800px] mx-auto text-slate-800">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end mb-8 animate-slide-up">
        <div>
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-emerald-900 to-emerald-600 drop-shadow-sm mb-2">
                لوحة القيادة العامة
            </h2>
            <p className="text-slate-500 font-medium text-lg">نظرة شاملة على مؤشرات الأداء والوضع المالي للنقابة</p>
        </div>
        <div className="mt-4 md:mt-0">
            <p className="text-sm font-bold text-emerald-800 bg-white/80 backdrop-blur px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-2">
                <CalendarCheck size={18} className="text-emerald-500" />
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="إجمالي الموظفين" 
            value={totalEmployees} 
            subtitle="موظف مسجل"
            icon={<Users className="text-white" size={28} />} 
            gradient="from-emerald-500 to-emerald-700"
            shadowColor="shadow-emerald-500/20"
            delay={100}
            onClick={() => setPage(Page.EMPLOYEES)}
        />
        <StatCard 
            title="صافي الرواتب" 
            value={`${totalPayroll.toLocaleString()}`} 
            subtitle="جنية مصري"
            icon={<Banknote className="text-white" size={28} />} 
            gradient="from-blue-500 to-blue-700"
            shadowColor="shadow-blue-500/20"
            delay={200}
            onClick={() => setPage(Page.PAYROLL)}
        />
        <StatCard 
            title="في إجازة اليوم" 
            value={onLeaveToday} 
            subtitle="موظف"
            icon={<Plane className="text-white" size={28} />} 
            gradient="from-amber-400 to-amber-600"
            shadowColor="shadow-amber-500/20"
            delay={300}
            onClick={() => setPage(Page.LEAVES)}
        />
        <StatCard 
            title="رصيد السلف" 
            value={activeLoansTotal.toLocaleString()} 
            subtitle="جنية مصري"
            icon={<Wallet className="text-white" size={28} />} 
            gradient="from-rose-500 to-rose-700"
            shadowColor="shadow-rose-500/20"
            delay={400}
            onClick={() => setPage(Page.LOANS)}
        />
      </div>

      {/* Interactive Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-6 flex flex-col animate-slide-up delay-200 hover-lift">
            <h3 className="font-bold text-xl text-emerald-900 mb-6 flex items-center gap-2">
                <TrendingUp size={24} className="text-emerald-500" />
                الوصول السريع
            </h3>
            
            <div className="grid grid-cols-1 gap-4 flex-1">
                <QuickAction 
                    label="إضافة موظف جديد" 
                    icon={<PlusCircle size={20} />} 
                    color="bg-emerald-50 text-emerald-700 border-emerald-200"
                    hoverColor="hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                    onClick={() => setPage(Page.EMPLOYEES)}
                    delay={100}
                />
                <QuickAction 
                    label="تسجيل حضور وانصراف" 
                    icon={<Clock size={20} />} 
                    color="bg-blue-50 text-blue-700 border-blue-200"
                    hoverColor="hover:bg-blue-600 hover:text-white hover:border-blue-600"
                    onClick={() => setPage(Page.ATTENDANCE)}
                    delay={200}
                />
                <QuickAction 
                    label="صرف مكافأة / منحة" 
                    icon={<Banknote size={20} />} 
                    color="bg-amber-50 text-amber-700 border-amber-200"
                    hoverColor="hover:bg-amber-500 hover:text-white hover:border-amber-500"
                    onClick={() => setPage(Page.BONUSES)}
                    delay={300}
                />
                <QuickAction 
                    label="التسوية الضريبية" 
                    icon={<Wallet size={20} />} 
                    color="bg-rose-50 text-rose-700 border-rose-200"
                    hoverColor="hover:bg-rose-500 hover:text-white hover:border-rose-500"
                    onClick={() => setPage(Page.TAX_SETTLEMENT)}
                    delay={400}
                />
            </div>
        </div>

        {/* Department Distribution Chart */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-6 animate-slide-up delay-300 hover-lift">
            <h3 className="font-bold text-xl text-emerald-900 mb-2 flex items-center gap-2">
                <Briefcase size={24} className="text-emerald-500" />
                الهيكل الوظيفي
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">توزيع الموظفين حسب الإدارات</p>
            <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={deptData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {deptData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{direction: 'rtl', textAlign: 'right', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)'}} 
                            itemStyle={{fontWeight: 'bold', color: '#064e3b'}}
                        />
                        <Legend wrapperStyle={{fontSize: '11px', fontFamily: 'Cairo', paddingTop: '10px'}} />
                    </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="block text-3xl font-extrabold text-emerald-800 animate-scale-in delay-500">{totalEmployees}</span>
                    <span className="block text-xs text-slate-400 font-bold">موظف</span>
                </div>
            </div>
        </div>

        {/* Attendance Chart */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-6 animate-slide-up delay-400 hover-lift">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-xl text-emerald-900 flex items-center gap-2">
                        <CalendarCheck size={24} className="text-emerald-500" />
                        الحضور الأسبوعي
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">نسبة الحضور: <span className="text-emerald-600 font-bold">{attendancePercentage}%</span> اليوم</p>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceChartData}>
                        <defs>
                            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 11}} tickLine={false} axisLine={false} dy={10} />
                        <Tooltip cursor={{stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={{direction: 'rtl', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)'}} />
                        <Area type="monotone" dataKey="present" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, gradient, shadowColor, delay, onClick }: any) => (
    <div 
        onClick={onClick}
        className={`relative overflow-hidden rounded-3xl p-6 bg-white border border-slate-100 hover-lift cursor-pointer group animate-slide-up shadow-xl ${shadowColor}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute top-0 right-0 p-4 rounded-bl-3xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-500 z-10`}>
            {icon}
        </div>
        <div className="mt-8 relative z-20">
            <p className="text-slate-500 font-bold text-sm mb-1">{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
        </div>
        
        {/* Animated Background Decor */}
        <div className={`absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-10 bg-gradient-to-tr ${gradient} group-hover:scale-125 transition-transform duration-700`}></div>
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 text-slate-300">
            <ArrowRight size={24} />
        </div>
    </div>
);

const QuickAction = ({ label, icon, color, hoverColor, onClick, delay }: any) => (
    <button 
        onClick={onClick}
        style={{ animationDelay: `${delay}ms` }}
        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group btn-interactive animate-slide-up ${color} ${hoverColor}`}
    >
        <div className="flex items-center gap-3">
            <div className="bg-white/80 p-2 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                {icon}
            </div>
            <span className="font-bold text-sm">{label}</span>
        </div>
        <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
    </button>
);
