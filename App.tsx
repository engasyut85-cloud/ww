
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { PayrollCalculator } from './components/PayrollCalculator';
import { AttendancePanel } from './components/AttendancePanel';
import { LeaveManagement } from './components/LeaveManagement';
import { LoanManager } from './components/LoanManager';
import { PerformanceReviewComp } from './components/PerformanceReview';
import { BonusesGrants } from './components/BonusesGrants';
import { TaxSettlement } from './components/TaxSettlement';
import { ReportsCenter } from './components/ReportsCenter';
import { AIAdvisor } from './components/AIAdvisor';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { StatusStatement } from './components/StatusStatement';
import { UserManagement } from './components/UserManagement';
import { ExternalWorkers } from './components/ExternalWorkers';
import { Page, Employee, LeaveRequest, Loan, PerformanceReview, AttendanceRecord, BonusRecord, User, TaxDebt, ExternalWorkerRecord } from './types';
import { INITIAL_EMPLOYEES, INITIAL_LEAVES, INITIAL_LOANS, INITIAL_REVIEWS, INITIAL_DEPARTMENTS, INITIAL_USERS } from './constants';
import { HardDrive, Cloud, CheckCircle2, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.DASHBOARD);
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const savedUser = sessionStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
  });

  // Data States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [reviews, setReviews] = useState<PerformanceReview[]>(INITIAL_REVIEWS);
  const [departments, setDepartments] = useState<string[]>(INITIAL_DEPARTMENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [penalties, setPenalties] = useState<Record<string, number>>({});
  const [bonuses, setBonuses] = useState<BonusRecord[]>([]);
  const [taxDebts, setTaxDebts] = useState<TaxDebt[]>([]);
  const [externalWorkers, setExternalWorkers] = useState<ExternalWorkerRecord[]>([]);

  // Server Sync Status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'local'>('local');
  const isInitialMount = useRef(true);

  // --- LOAD DATA FROM SERVER ON STARTUP ---
  useEffect(() => {
      const loadData = async () => {
          try {
              // Try to fetch from the local Node.js server
              const response = await fetch('http://localhost:3001/api/data');
              if (response.ok) {
                  const data = await response.json();
                  // Only update state if data exists in the file
                  if (Object.keys(data).length > 0) {
                      if (data.users) setUsers(data.users);
                      if (data.employees) setEmployees(data.employees);
                      if (data.leaves) setLeaves(data.leaves);
                      if (data.loans) setLoans(data.loans);
                      if (data.reviews) setReviews(data.reviews);
                      if (data.departments) setDepartments(data.departments);
                      if (data.attendance) setAttendance(data.attendance);
                      if (data.penalties) setPenalties(data.penalties);
                      if (data.bonuses) setBonuses(data.bonuses);
                      if (data.taxDebts) setTaxDebts(data.taxDebts);
                      if (data.externalWorkers) setExternalWorkers(data.externalWorkers);
                      console.log("Data loaded from local file system");
                      setSaveStatus('saved');
                  } else {
                      // Fallback to LocalStorage if server file is empty (first run)
                      loadFromLocalStorage();
                  }
              } else {
                  loadFromLocalStorage();
              }
          } catch (error) {
              console.warn("Server not reachable, using LocalStorage");
              loadFromLocalStorage();
          }
      };

      const loadFromLocalStorage = () => {
          const savedUsers = localStorage.getItem('users');
          if (savedUsers) setUsers(JSON.parse(savedUsers));
          
          const savedEmps = localStorage.getItem('employees');
          if (savedEmps) setEmployees(JSON.parse(savedEmps));

          const savedLeaves = localStorage.getItem('leaves');
          if (savedLeaves) setLeaves(JSON.parse(savedLeaves));

          const savedLoans = localStorage.getItem('loans');
          if (savedLoans) setLoans(JSON.parse(savedLoans));

          const savedReviews = localStorage.getItem('reviews');
          if (savedReviews) setReviews(JSON.parse(savedReviews));

          const savedDepts = localStorage.getItem('departments');
          if (savedDepts) setDepartments(JSON.parse(savedDepts));

          const savedAttendance = localStorage.getItem('attendance');
          if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

          const savedPenalties = localStorage.getItem('penalties');
          if (savedPenalties) setPenalties(JSON.parse(savedPenalties));

          const savedBonuses = localStorage.getItem('bonuses');
          if (savedBonuses) setBonuses(JSON.parse(savedBonuses));

          const savedTaxDebts = localStorage.getItem('taxDebts');
          if (savedTaxDebts) setTaxDebts(JSON.parse(savedTaxDebts));

          const savedExternal = localStorage.getItem('externalWorkers');
          if (savedExternal) setExternalWorkers(JSON.parse(savedExternal));

          setSaveStatus('local');
      };

      loadData();
  }, []);

  // --- SAVE DATA TO SERVER ON CHANGE ---
  useEffect(() => {
      if (isInitialMount.current) {
          isInitialMount.current = false;
          return;
      }

      // 1. Save to LocalStorage as backup
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('employees', JSON.stringify(employees));
      localStorage.setItem('leaves', JSON.stringify(leaves));
      localStorage.setItem('loans', JSON.stringify(loans));
      localStorage.setItem('reviews', JSON.stringify(reviews));
      localStorage.setItem('departments', JSON.stringify(departments));
      localStorage.setItem('attendance', JSON.stringify(attendance));
      localStorage.setItem('penalties', JSON.stringify(penalties));
      localStorage.setItem('bonuses', JSON.stringify(bonuses));
      localStorage.setItem('taxDebts', JSON.stringify(taxDebts));
      localStorage.setItem('externalWorkers', JSON.stringify(externalWorkers));

      // 2. Save to File Server
      const saveData = async () => {
          setSaveStatus('saving');
          try {
              const fullData = {
                  users, employees, leaves, loans, reviews, departments, attendance, penalties, bonuses, taxDebts, externalWorkers
              };
              
              const response = await fetch('http://localhost:3001/api/save', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(fullData)
              });

              if (response.ok) {
                  setSaveStatus('saved');
              } else {
                  setSaveStatus('error');
              }
          } catch (error) {
              // If server fails, we stay in 'local' or 'error' state
              setSaveStatus('error');
          }
      };

      // Debounce save to avoid hammering the disk
      const timeoutId = setTimeout(saveData, 1000);
      return () => clearTimeout(timeoutId);

  }, [users, employees, leaves, loans, reviews, departments, attendance, penalties, bonuses, taxDebts, externalWorkers]);
  
  // Persist Current User (Session Only)
  useEffect(() => {
      if (currentUser) {
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
          sessionStorage.removeItem('currentUser');
      }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = (user: User) => {
      setCurrentUser(user);
  };

  const handleLogout = () => {
      sessionStorage.removeItem('currentUser'); // Force immediate removal
      setCurrentUser(null);
      setActivePage(Page.DASHBOARD);
  };

  const updateUserPassword = (newPassword: string) => {
      if (!currentUser) return;
      
      const updatedUsers = users.map(u => 
          u.id === currentUser.id ? { ...u, password: newPassword } : u
      );
      setUsers(updatedUsers);
      setCurrentUser({ ...currentUser, password: newPassword });
  };

  // Settings Handlers
  const getAllData = () => ({
    users, employees, leaves, loans, reviews, departments, attendance, penalties, bonuses, taxDebts, externalWorkers
  });

  const restoreData = (data: any) => {
    if (data.users) setUsers(data.users);
    if (data.employees) setEmployees(data.employees);
    if (data.leaves) setLeaves(data.leaves);
    if (data.loans) setLoans(data.loans);
    if (data.reviews) setReviews(data.reviews);
    if (data.departments) setDepartments(data.departments);
    if (data.attendance) setAttendance(data.attendance);
    if (data.penalties) setPenalties(data.penalties);
    if (data.bonuses) setBonuses(data.bonuses);
    if (data.taxDebts) setTaxDebts(data.taxDebts);
    if (data.externalWorkers) setExternalWorkers(data.externalWorkers);
  };

  const resetSystem = () => {
      setUsers(INITIAL_USERS);
      setEmployees(INITIAL_EMPLOYEES);
      setLeaves(INITIAL_LEAVES);
      setLoans(INITIAL_LOANS);
      setReviews(INITIAL_REVIEWS);
      setDepartments(INITIAL_DEPARTMENTS);
      setAttendance([]);
      setPenalties({});
      setBonuses([]);
      setTaxDebts([]);
      setExternalWorkers([]);
      localStorage.clear();
      // Server file will be overwritten on next auto-save
      handleLogout();
  };

  const renderContent = () => {
    switch (activePage) {
      case Page.DASHBOARD:
        return <Dashboard 
            employees={employees} 
            attendance={attendance} 
            leaves={leaves} 
            loans={loans} 
            reviews={reviews}
            bonuses={bonuses}
            penalties={penalties}
            taxDebts={taxDebts}
            setPage={setActivePage} 
        />;
      case Page.EMPLOYEES:
        return <EmployeeList employees={employees} setEmployees={setEmployees} departments={departments} />;
      case Page.STATUS_STATEMENT:
        return <StatusStatement employees={employees} reviews={reviews} penalties={penalties} />;
      case Page.ATTENDANCE:
        return <AttendancePanel employees={employees} attendance={attendance} setAttendance={setAttendance} />;
      case Page.LEAVES:
        return <LeaveManagement employees={employees} leaves={leaves} setLeaves={setLeaves} />;
      case Page.LOANS:
        return <LoanManager employees={employees} loans={loans} setLoans={setLoans} />;
      case Page.BONUSES:
        return <BonusesGrants employees={employees} bonuses={bonuses} setBonuses={setBonuses} />;
      case Page.PAYROLL:
        return <PayrollCalculator employees={employees} loans={loans} reviews={reviews} penalties={penalties} setPenalties={setPenalties} bonuses={bonuses} taxDebts={taxDebts} />;
      case Page.TAX_SETTLEMENT:
        return <TaxSettlement employees={employees} bonuses={bonuses} reviews={reviews} taxDebts={taxDebts} setTaxDebts={setTaxDebts} />;
      case Page.EXTERNAL_WORKERS:
        return <ExternalWorkers records={externalWorkers} setRecords={setExternalWorkers} />;
      case Page.PERFORMANCE:
        return <PerformanceReviewComp employees={employees} reviews={reviews} setReviews={setReviews} />;
      case Page.REPORTS:
        return <ReportsCenter employees={employees} leaves={leaves} loans={loans} />;
      case Page.AI_ADVISOR:
        return <AIAdvisor />;
      case Page.USERS:
        return currentUser?.role === 'admin' ? <UserManagement users={users} setUsers={setUsers} currentUser={currentUser} /> : <Dashboard employees={employees} attendance={attendance} leaves={leaves} loans={loans} setPage={setActivePage} reviews={reviews} bonuses={bonuses} penalties={penalties} taxDebts={taxDebts} />;
      case Page.SETTINGS:
        return <Settings 
            departments={departments} setDepartments={setDepartments} 
            getAllData={getAllData} restoreData={restoreData} resetSystem={resetSystem} 
            currentUser={currentUser!} updateUserPassword={updateUserPassword}
        />;
      default:
        return <Dashboard employees={employees} attendance={attendance} leaves={leaves} loans={loans} setPage={setActivePage} reviews={reviews} bonuses={bonuses} penalties={penalties} taxDebts={taxDebts} />;
    }
  };

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-row min-h-screen bg-emerald-50 text-right font-sans relative">
      {/* Save Status Indicator */}
      <div className="absolute bottom-4 left-4 z-[100] bg-white px-3 py-1.5 rounded-full shadow-lg border border-emerald-100 flex items-center gap-2 text-xs font-bold transition-all">
          {saveStatus === 'saved' && <><CheckCircle2 size={14} className="text-emerald-600" /> <span className="text-emerald-800">محفوظ على الجهاز</span></>}
          {saveStatus === 'saving' && <><Loader2 size={14} className="text-blue-600 animate-spin" /> <span className="text-blue-800">جاري الحفظ...</span></>}
          {saveStatus === 'local' && <><Cloud size={14} className="text-amber-500" /> <span className="text-amber-800">تخزين مؤقت</span></>}
          {saveStatus === 'error' && <><HardDrive size={14} className="text-red-500" /> <span className="text-red-800">خطأ في الحفظ</span></>}
      </div>

      <Sidebar activePage={activePage} setPage={setActivePage} currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto h-screen relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
