
import React, { useState, useRef, useEffect } from 'react';
import { Employee, EmployeeAllowances, CustomAllowance, NonPensionableAllowance, EducationLevel, MaritalStatus, MilitaryStatus, EmploymentCategory } from '../types';
import { Plus, Search, Trash2, Edit, Eye, Wallet, GraduationCap, Building, User, Phone, Mail, MapPin, Hash, Flag, Accessibility, CreditCard, Filter, X, FileSpreadsheet, Upload, ChevronDown, CalendarClock, FileText, Clock, Calendar, Percent, School, Briefcase, ShieldCheck, ShieldAlert, Medal, Coins } from 'lucide-react';
import { EmployeeProfileCard } from './EmployeeProfileCard';
import { JOB_GRADES, ALLOWANCE_LABELS, EMPLOYMENT_CATEGORIES, DEGREE_TYPES, EGYPTIAN_UNIVERSITIES, FACULTIES_INSTITUTES } from '../constants';
import { exportToExcel, parseExcel } from '../utils/excelUtils';

interface EmployeeListProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  departments: string[];
  onEmployeeClick?: (emp: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, setEmployees, departments, onEmployeeClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDocNum, setSearchDocNum] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'main' | 'nonPensionable'>('main');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const defaultAllowances: EmployeeAllowances = {
      transportation: 0, housing: 0, clothing: 0, meal: 0,
      screen: 0, dedication: 0, risk: 0, cashier: 0, secretariat: 0, infection: 0, workNature: 0,
      representation: 0, driving: 0, livingCost: 0,
      overtimeAllowance: 0, cashAllowance: 0,
      complementaryIncentive: 0, residenceAllowance: 0, minSocialPackage: 0, laborGrantAllowance: 0, additionalSocialAllowance: 0,
      additionalIncentive: 0, masterIncentive: 0
  };

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({ 
      allowances: defaultAllowances,
      customAllowances: [],
      nonPensionableAllowances: [],
      educationLevel: 'none',
      hasExperience: false,
      isSpecialNeeds: false,
      isPensionSubject: true,
      maritalStatus: 'single',
      militaryStatus: 'exempt',
      employmentCategory: 'syndicate_permanent',
      manualFellowshipValue: 0,
      manualSyndicateIncentive: 0,
      manualSpecialRaise2015: 0,
      manualLaborGrant: 10,
      initialBasicSalary: 0,
      university: '',
      faculty: '',
      graduationYear: '',
      retirementDate: '',
      documentNumber: '',
      insuranceNumber: '',
      joinDate: new Date().toISOString().split('T')[0],
      taxCalculationMethod: 'auto',
      manualTaxRate: 10,
      trainingCourses: '',
      address: ''
  });
  
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => {
    const matchGeneral = emp.name.includes(searchTerm) || 
                         emp.position.includes(searchTerm) || 
                         emp.department.includes(searchTerm) ||
                         emp.nationalId.includes(searchTerm);
    
    // تعديل: مطابقة تامة لرقم المستند
    const matchDoc = searchDocNum.trim() ? (emp.documentNumber === searchDocNum.trim()) : true;
    return matchGeneral && matchDoc;
  });

  const calculateDataFromNationalId = (nid: string) => {
      if (nid.length !== 14) return;
      const centuryCode = nid[0];
      const yearPart = nid.substring(1, 3);
      const monthPart = nid.substring(3, 5);
      const dayPart = nid.substring(5, 7);
      let fullYear = centuryCode === '2' ? '19' + yearPart : '20' + yearPart;
      const birthDate = new Date(`${fullYear}-${monthPart}-${dayPart}`);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      setCalculatedAge(age);
      const retireYear = parseInt(fullYear) + 60;
      setNewEmployee(prev => ({ ...prev, retirementDate: `${retireYear}-${monthPart}-${dayPart}` }));
  };

  const handleNationalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setNewEmployee(prev => ({ ...prev, nationalId: val }));
      if (val.length === 14) calculateDataFromNationalId(val);
      else setCalculatedAge(null);
  };

  const addCustomAllowance = () => {
      const current = newEmployee.customAllowances || [];
      setNewEmployee({
          ...newEmployee,
          customAllowances: [...current, { id: `CA-${Date.now()}`, name: '', value: 0 }]
      });
  };

  const updateCustomAllowance = (id: string, field: 'name' | 'value', val: string | number) => {
      const updated = (newEmployee.customAllowances || []).map(ca => 
          ca.id === id ? { ...ca, [field]: val } : ca
      );
      setNewEmployee({ ...newEmployee, customAllowances: updated });
  };

  const removeCustomAllowance = (id: string) => {
      const updated = (newEmployee.customAllowances || []).filter(ca => ca.id !== id);
      setNewEmployee({ ...newEmployee, customAllowances: updated });
  };

  const addNonPensionableAllowance = () => {
      const current = newEmployee.nonPensionableAllowances || [];
      setNewEmployee({
          ...newEmployee,
          nonPensionableAllowances: [...current, { id: `NPA-${Date.now()}`, name: '', value: 0 }]
      });
  };

  const updateNonPensionableAllowance = (id: string, field: 'name' | 'value', val: string | number) => {
      const updated = (newEmployee.nonPensionableAllowances || []).map(npa => 
          npa.id === id ? { ...npa, [field]: val } : npa
      );
      setNewEmployee({ ...newEmployee, nonPensionableAllowances: updated });
  };

  const removeNonPensionableAllowance = (id: string) => {
      const updated = (newEmployee.nonPensionableAllowances || []).filter(npa => npa.id !== id);
      setNewEmployee({ ...newEmployee, nonPensionableAllowances: updated });
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
      e.preventDefault();
      const allowances = newEmployee.allowances || defaultAllowances;
      const customAllowances = (newEmployee.customAllowances || []).filter(ca => ca.name.trim() !== '');
      const nonPensionableAllowances = (newEmployee.nonPensionableAllowances || []).filter(npa => npa.name.trim() !== '');
      const todayStr = new Date().toISOString().split('T')[0];

      const empData: Employee = {
          id: newEmployee.id || `EMP${Math.floor(Math.random() * 10000)}`,
          name: newEmployee.name || '',
          nationalId: newEmployee.nationalId || '',
          department: newEmployee.department || '',
          position: newEmployee.position || '',
          grade: newEmployee.grade,
          educationLevel: newEmployee.educationLevel || 'none',
          university: newEmployee.university || '',
          faculty: newEmployee.faculty || '',
          graduationYear: newEmployee.graduationYear || '',
          hasExperience: newEmployee.hasExperience || false,
          isSpecialNeeds: newEmployee.isSpecialNeeds || false,
          isPensionSubject: newEmployee.isPensionSubject !== false,
          employmentCategory: newEmployee.employmentCategory || 'syndicate_permanent',
          initialBasicSalary: Number(newEmployee.initialBasicSalary) || Number(newEmployee.basicSalary) || 0,
          basicSalary: Number(newEmployee.basicSalary) || 0,
          variableSalary: Number(newEmployee.variableSalary) || 0,
          manualFellowshipValue: Number(newEmployee.manualFellowshipValue) || 0,
          manualSyndicateIncentive: Number(newEmployee.manualSyndicateIncentive) || 0,
          manualSpecialRaise2015: Number(newEmployee.manualSpecialRaise2015) || 0,
          manualLaborGrant: Number(newEmployee.manualLaborGrant) || 0,
          allowances: allowances,
          customAllowances: customAllowances,
          nonPensionableAllowances: nonPensionableAllowances,
          phone: newEmployee.phone || '',
          email: newEmployee.email || '',
          address: newEmployee.address || '',
          insuranceNumber: newEmployee.insuranceNumber || '',
          maritalStatus: newEmployee.maritalStatus,
          militaryStatus: newEmployee.militaryStatus,
          bankName: newEmployee.bankName || '',
          bankAccountNumber: newEmployee.bankAccountNumber || '',
          joinDate: newEmployee.joinDate || todayStr,
          retirementDate: newEmployee.retirementDate,
          documentNumber: newEmployee.documentNumber || '',
          lastModifiedDate: todayStr,
          taxCalculationMethod: newEmployee.taxCalculationMethod || 'auto',
          manualTaxRate: newEmployee.manualTaxRate || 10,
          salaryHistory: newEmployee.salaryHistory || [],
          trainingCourses: newEmployee.trainingCourses || ''
      };

      if (newEmployee.id) {
          setEmployees(employees.map(emp => emp.id === newEmployee.id ? empData : emp));
      } else {
          setEmployees([...employees, empData]);
      }
      setIsModalOpen(false);
      setModalTab('main');
      setCalculatedAge(null);
  };

  const handleEdit = (employee: Employee) => {
      setNewEmployee({ ...employee });
      if (employee.nationalId) calculateDataFromNationalId(employee.nationalId);
      setModalTab('main');
      setIsModalOpen(true);
      setSelectedEmployee(null);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const parsedData = await parseExcel(file);
              if (parsedData && parsedData.length > 0) {
                  if (confirm(`تم قراءة ${parsedData.length} سجل. هل تريد استبدال القائمة الحالية؟`)) {
                      setEmployees(parsedData);
                      alert('تم الاستيراد بنجاح!');
                  }
              }
          } catch (error) { alert('خطأ في استيراد الملف'); }
          e.target.value = '';
      }
  };

  const manualTaxRates = Array.from({ length: 21 }, (_, i) => i + 5);

  return (
    <div className="p-8 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 animate-slide-up gap-4">
        <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-emerald-900 to-emerald-600">سجل الموظفين</h2>
            <p className="text-emerald-600 mt-1 font-medium">إدارة بيانات المهندسين والموظفين بالنقابة</p>
        </div>
        
        <div className="flex gap-2">
            <button onClick={() => exportToExcel(employees, 'Employees_Data')} className="bg-white text-emerald-700 border border-emerald-200 px-4 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-emerald-50 transition-colors shadow-sm">
                <FileSpreadsheet size={18} /> تصدير
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="bg-white text-blue-700 border border-blue-200 px-4 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-blue-50 transition-colors shadow-sm">
                <Upload size={18} /> استيراد
            </button>
            <input type="file" ref={fileInputRef} accept=".xlsx, .xls" onChange={handleImport} className="hidden" />
            <button 
                onClick={() => { setNewEmployee({ allowances: defaultAllowances, customAllowances: [], nonPensionableAllowances: [], educationLevel: 'none', hasExperience: false, isSpecialNeeds: false, isPensionSubject: true, maritalStatus: 'single', militaryStatus: 'exempt', employmentCategory: 'syndicate_permanent', manualFellowshipValue: 0, manualSyndicateIncentive: 0, manualSpecialRaise2015: 0, manualLaborGrant: 10, joinDate: new Date().toISOString().split('T')[0], taxCalculationMethod: 'auto', manualTaxRate: 10, trainingCourses: '', address: '' }); setCalculatedAge(null); setModalTab('main'); setIsModalOpen(true); }}
                className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg hover:-translate-y-1 btn-interactive"
            >
                <Plus size={20} /> موظف جديد
            </button>
        </div>
      </div>

      <div className="glass-panel p-2 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3 animate-slide-up delay-100">
        <div className="flex-1 bg-white/50 rounded-xl flex items-center px-4 py-3 border border-emerald-100 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300 w-full">
            <Search className="text-emerald-400 mr-3" size={22} />
            <input type="text" placeholder="بحث بالاسم، الرقم القومي، أو الوظيفة..." className="flex-1 outline-none text-slate-700 font-bold placeholder:font-normal bg-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex-none bg-white/50 rounded-xl flex items-center px-4 py-3 border border-emerald-100 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300 w-full md:w-64">
            <FileText className="text-emerald-400 mr-3" size={20} />
            <input type="text" placeholder="رقم المستند (مطابقة تامة)" className="flex-1 outline-none text-slate-700 font-mono font-bold placeholder:font-normal bg-transparent" value={searchDocNum} onChange={(e) => setSearchDocNum(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden animate-slide-up delay-200">
        <table className="w-full text-right border-collapse">
            <thead className="bg-emerald-50/80 text-emerald-900">
                <tr>
                    <th className="p-5 text-sm font-bold border-b">الاسم</th>
                    <th className="p-5 text-sm font-bold border-b">التصنيف</th>
                    <th className="p-5 text-sm font-bold border-b">القسم</th>
                    <th className="p-5 text-sm font-bold border-b">رقم المستند</th>
                    <th className="p-5 text-sm font-bold border-b">الدرجة</th>
                    <th className="p-5 text-sm font-bold border-b">إجراءات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50/50">
                {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-emerald-50/40 transition-all group">
                        <td className="p-5 font-medium text-slate-800">
                            <button onClick={() => onEmployeeClick ? onEmployeeClick(emp) : setSelectedEmployee(emp)} className="hover:text-emerald-700 font-bold flex items-center gap-3 transition-colors text-right">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm border border-emerald-200">{emp.name.charAt(0)}</div>
                                <div className="flex flex-col items-start">
                                    <span>{emp.name}</span>
                                    <span className="text-[10px] text-slate-400">{emp.position}</span>
                                </div>
                            </button>
                        </td>
                        <td className="p-5"><span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{EMPLOYMENT_CATEGORIES.find(c => c.id === emp.employmentCategory)?.label}</span></td>
                        <td className="p-5 text-slate-600 text-sm">{emp.department}</td>
                        <td className="p-5 text-slate-600 text-sm font-mono">{emp.documentNumber || '-'}</td>
                        <td className="p-5 text-slate-600 text-sm">{JOB_GRADES.find(g => g.id === emp.grade)?.name || '-'}</td>
                        <td className="p-5">
                            <div className="flex gap-2">
                                <button onClick={() => onEmployeeClick ? onEmployeeClick(emp) : setSelectedEmployee(emp)} className="p-2 text-slate-500 hover:text-emerald-700"><Eye size={18} /></button>
                                <button onClick={() => handleEdit(emp)} className="p-2 text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                <button onClick={() => confirm('حذف؟') && setEmployees(employees.filter(e => e.id !== emp.id))} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {selectedEmployee && (
        <EmployeeProfileCard 
            employee={selectedEmployee} 
            loans={[]} 
            onClose={() => setSelectedEmployee(null)} 
            onEdit={() => handleEdit(selectedEmployee)}
        />
      )}

      {isModalOpen && (
          <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-scale-in border border-emerald-100">
                  <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-8 py-5 border-b border-emerald-100 flex justify-between items-center shadow-sm">
                      <h3 className="text-2xl font-bold text-emerald-900 flex items-center gap-3">
                          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700"><User size={24} /></div>
                          {newEmployee.id ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}
                      </h3>
                      
                      <div className="flex bg-slate-100 p-1 rounded-xl mx-4">
                          <button 
                            type="button"
                            onClick={() => setModalTab('main')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${modalTab === 'main' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                              البيانات الأساسية والرواتب
                          </button>
                          <button 
                            type="button"
                            onClick={() => setModalTab('nonPensionable')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${modalTab === 'nonPensionable' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                              بدلات غير خاضعة للتأمينات
                          </button>
                      </div>

                      <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 p-2 rounded-full transition-all">✕</button>
                  </div>
                  
                  <div className="p-8">
                    <form onSubmit={handleSaveEmployee} className="space-y-8">
                        {modalTab === 'main' ? (
                        <>
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit flex items-center gap-2"><Building size={16} /> البيانات الأساسية والوظيفية</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم الكامل</label>
                                    <input required type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white outline-none transition-all" value={newEmployee.name || ''} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الرقم القومي (14 رقم)</label>
                                    <input required type="text" maxLength={14} className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full font-mono outline-none" value={newEmployee.nationalId || ''} onChange={handleNationalIdChange} />
                                    {calculatedAge !== null && <div className="mt-1 text-[10px] text-emerald-600 font-bold">السن: {calculatedAge} سنة</div>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الرقم التأميني</label>
                                    <input type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full font-mono outline-none" value={newEmployee.insuranceNumber || ''} onChange={e => setNewEmployee({...newEmployee, insuranceNumber: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الإدارة / القسم</label>
                                    <select className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full outline-none" required value={newEmployee.department || ''} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}>
                                        <option value="">-- اختر --</option>
                                        {departments.map((dept, idx) => <option key={idx} value={dept}>{dept}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">المسمى الوظيفي</label>
                                    <input required type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full outline-none" value={newEmployee.position || ''} onChange={e => setNewEmployee({...newEmployee, position: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">فئة التعيين</label>
                                    <select required className="w-full border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl outline-none font-bold text-emerald-800" value={newEmployee.employmentCategory || 'syndicate_permanent'} onChange={e => setNewEmployee({...newEmployee, employmentCategory: e.target.value as EmploymentCategory})}>
                                        {EMPLOYMENT_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">تاريخ التعيين</label>
                                    <input type="date" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full outline-none" value={newEmployee.joinDate || ''} onChange={e => setNewEmployee({...newEmployee, joinDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم المستند (للمجموعات)</label>
                                    <input type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full outline-none font-mono" value={newEmployee.documentNumber || ''} onChange={e => setNewEmployee({...newEmployee, documentNumber: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">تاريخ المعاش المتوقع</label>
                                    <input type="date" className="w-full border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl outline-none" value={newEmployee.retirementDate || ''} onChange={e => setNewEmployee({...newEmployee, retirementDate: e.target.value})} />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-bold text-emerald-700 mb-1.5">الدورات التدريبية</label>
                                <textarea 
                                    className="border border-emerald-100 bg-emerald-50/20 p-3.5 rounded-xl w-full focus:bg-white outline-none transition-all h-20 text-sm" 
                                    placeholder="اكتب الدورات التدريبية هنا..."
                                    value={newEmployee.trainingCourses || ''} 
                                    onChange={e => setNewEmployee({...newEmployee, trainingCourses: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit flex items-center gap-2"><Phone size={16} /> بيانات الاتصال والحساب البنكي</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم الهاتف</label>
                                    <input type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full outline-none font-mono" value={newEmployee.phone || ''} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">البريد الإلكتروني</label>
                                    <input type="email" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full outline-none" value={newEmployee.email || ''} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="w-full">
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">العنوان بالتفصيل</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="border border-emerald-100 bg-slate-50/50 p-3.5 pr-10 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none transition-all" 
                                        placeholder="المحافظة، المدينة، اسم الشارع..."
                                        value={newEmployee.address || ''} 
                                        onChange={e => setNewEmployee({...newEmployee, address: e.target.value})} 
                                    />
                                    <MapPin className="absolute right-3 top-3.5 text-emerald-500" size={18} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم البنك</label>
                                    <input type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full outline-none" value={newEmployee.bankName || ''} onChange={e => setNewEmployee({...newEmployee, bankName: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم الحساب البنكي (IBAN)</label>
                                    <input type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full outline-none font-mono" value={newEmployee.bankAccountNumber || ''} onChange={e => setNewEmployee({...newEmployee, bankAccountNumber: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الحالة الاجتماعية</label>
                                    <select className="w-full border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl outline-none" value={newEmployee.maritalStatus} onChange={e => setNewEmployee({...newEmployee, maritalStatus: e.target.value as MaritalStatus})}>
                                        <option value="single">أعزب</option>
                                        <option value="married">متزوج</option>
                                        <option value="divorced">مطلق</option>
                                        <option value="widowed">أرمل</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الموقف التجنيدي</label>
                                    <select 
                                        className="w-full border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl outline-none"
                                        value={newEmployee.militaryStatus || 'none'}
                                        onChange={e => setNewEmployee({...newEmployee, militaryStatus: e.target.value as MilitaryStatus})}
                                    >
                                        <option value="completed">مؤدي الخدمة</option>
                                        <option value="postponة">تأجيل</option>
                                        <option value="exempt">إعفاء</option>
                                        <option value="none">غير مطلوب (إناث)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100">
                            <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2 border-b border-emerald-200 pb-2"><Percent size={18} /> إعدادات الضرائب والتأمينات</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-700 mb-2">طريقة احتساب الضريبة</label>
                                    <div className="flex bg-white rounded-xl border border-emerald-200 p-1">
                                        <button type="button" onClick={() => setNewEmployee({...newEmployee, taxCalculationMethod: 'auto'})} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${newEmployee.taxCalculationMethod === 'auto' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500'}`}>تلقائي (شرائح)</button>
                                        <button type="button" onClick={() => setNewEmployee({...newEmployee, taxCalculationMethod: 'manual'})} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${newEmployee.taxCalculationMethod === 'manual' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500'}`}>يدوي (نسبة مئوية)</button>
                                    </div>
                                </div>
                                
                                {newEmployee.taxCalculationMethod === 'manual' && (
                                    <div>
                                        <label className="block text-xs font-bold text-amber-700 mb-2">نسبة الضريبة اليدوية (%)</label>
                                        <select className="w-full border border-amber-300 p-3 rounded-xl bg-white outline-none font-bold" value={newEmployee.manualTaxRate} onChange={e => setNewEmployee({...newEmployee, manualTaxRate: Number(e.target.value)})}>
                                            {manualTaxRates.map(r => <option key={r} value={r}>{r}%</option>)}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-blue-700 mb-2">الموقف من المعاش (التأمينات)</label>
                                    <div className="flex bg-white rounded-xl border border-blue-200 p-1">
                                        <button type="button" onClick={() => setNewEmployee({...newEmployee, isPensionSubject: true})} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${newEmployee.isPensionSubject !== false ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>خاضع للمعاش</button>
                                        <button type="button" onClick={() => setNewEmployee({...newEmployee, isPensionSubject: false})} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${newEmployee.isPensionSubject === false ? 'bg-red-600 text-white shadow-md' : 'text-slate-500'}`}>غير خاضع</button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-2">
                                <div className="flex items-center gap-3 py-2 bg-white/60 p-3 rounded-xl border border-emerald-100 w-fit">
                                    <input type="checkbox" id="special" checked={newEmployee.isSpecialNeeds} onChange={(e) => setNewEmployee({...newEmployee, isSpecialNeeds: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-gray-300" />
                                    <label htmlFor="special" className="text-sm font-bold text-blue-800 flex items-center gap-1 cursor-pointer"><Accessibility size={16} /> من ذوي الاحتياجات الخاصة</label>
                                </div>
                                <div className="flex items-center gap-3 py-2 bg-white/60 p-3 rounded-xl border border-emerald-100 w-fit">
                                    <input type="checkbox" id="exp-bonus" checked={newEmployee.hasExperience} onChange={(e) => setNewEmployee({...newEmployee, hasExperience: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded border-gray-300" />
                                    <label htmlFor="exp-bonus" className="text-sm font-bold text-emerald-800 flex items-center gap-1 cursor-pointer"><Medal size={16} /> يستحق علاوة خبرة (10%)</label>
                                </div>
                                {newEmployee.isPensionSubject === false && (
                                    <div className="flex items-center gap-2 py-2 px-3 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-pulse">
                                        <ShieldAlert size={18} />
                                        <span className="text-[11px] font-bold">تنبيه: سيتم إلغاء خصم التأمينات آلياً.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                            <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2 border-b border-emerald-200 pb-2"><Wallet size={18} /> الرواتب والمؤهل</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-700 mb-1.5">الدرجة الوظيفية</label>
                                    <select className="w-full border border-emerald-200 p-3.5 rounded-xl outline-none" value={newEmployee.grade || ''} onChange={(e) => {
                                            setNewEmployee({ ...newEmployee, grade: e.target.value });
                                        }}>
                                        <option value="">-- اختر الدرجة --</option>
                                        {JOB_GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-700 mb-1.5">المؤهل العلمي</label>
                                    <select className="w-full border border-emerald-200 p-3.5 rounded-xl outline-none" value={newEmployee.educationLevel || 'none'} onChange={(e) => setNewEmployee({...newEmployee, educationLevel: e.target.value as EducationLevel})}>
                                        {DEGREE_TYPES.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الجامعة</label>
                                    <input type="text" className="w-full border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl outline-none" value={newEmployee.university || ''} onChange={e => setNewEmployee({...newEmployee, university: e.target.value})} list="univ-list" />
                                    <datalist id="univ-list">{EGYPTIAN_UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الكلية / المعهد</label>
                                    <input type="text" className="w-full border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl outline-none" value={newEmployee.faculty || ''} onChange={e => setNewEmployee({...newEmployee, faculty: e.target.value})} list="faculty-list" />
                                    <datalist id="faculty-list">{FACULTIES_INSTITUTES.map(f => <option key={f} value={f} />)}</datalist>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">سنة التخرج</label>
                                    <input type="text" className="w-full border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl outline-none font-mono" value={newEmployee.graduationYear || ''} onChange={e => setNewEmployee({...newEmployee, graduationYear: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-700 mb-1.5">الأساسي الحالي</label>
                                    <input required type="number" className="border border-emerald-200 p-3.5 rounded-xl w-full bg-emerald-50/30 font-mono text-lg font-bold outline-none" value={newEmployee.basicSalary || ''} onChange={e => setNewEmployee({ ...newEmployee, basicSalary: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-700 mb-1.5">حوافز أخرى / متغير</label>
                                    <input required type="number" className="border border-emerald-200 p-3.5 rounded-xl w-full outline-none font-mono" value={newEmployee.variableSalary || ''} onChange={e => setNewEmployee({ ...newEmployee, variableSalary: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-amber-700 mb-1.5">حافز النقابة (يدوي)</label>
                                    <input type="number" className="border border-amber-200 p-3.5 rounded-xl w-full outline-none font-mono" value={newEmployee.manualSyndicateIncentive || ''} onChange={e => setNewEmployee({ ...newEmployee, manualSyndicateIncentive: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-700 mb-1.5">علاوة 2015 (يدوي)</label>
                                    <input type="number" className="border border-blue-200 p-3.5 rounded-xl w-full outline-none font-mono" value={newEmployee.manualSpecialRaise2015 || ''} onChange={e => setNewEmployee({ ...newEmployee, manualSpecialRaise2015: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-700 mb-1.5">منحة العمال (يدوي)</label>
                                    <input type="number" className="border border-emerald-300 p-3.5 rounded-xl w-full outline-none font-mono font-bold" value={newEmployee.manualLaborGrant || ''} onChange={e => setNewEmployee({ ...newEmployee, manualLaborGrant: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-amber-700 mb-1.5">إجمالي قيمة صندوق الزمالة</label>
                                <input type="number" className="border border-amber-200 p-3.5 rounded-xl w-full outline-none font-mono text-lg font-bold" value={newEmployee.manualFellowshipValue || ''} onChange={e => setNewEmployee({ ...newEmployee, manualFellowshipValue: Number(e.target.value) })} />
                            </div>
                        </div>

                        <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <div className="flex justify-between items-center border-b border-slate-300 pb-2">
                                <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2"><Briefcase size={18} /> البدلات الشهرية الخاضعة للتأمينات</h4>
                                <button type="button" onClick={addCustomAllowance} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-700 shadow-sm transition-all"><Plus size={14} /> إضافة بدل مخصص</button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {Object.entries(ALLOWANCE_LABELS).map(([key, label]) => (
                                    <div key={key} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
                                        <label className="block text-[10px] text-slate-500 font-bold mb-1 truncate" title={label}>{label}</label>
                                        <input type="number" className="w-full outline-none font-mono font-bold text-emerald-700 text-sm" value={newEmployee.allowances?.[key as keyof EmployeeAllowances] || 0} onChange={e => setNewEmployee({ ...newEmployee, allowances: { ...newEmployee.allowances!, [key]: Number(e.target.value) } })} />
                                    </div>
                                ))}
                            </div>

                            {(newEmployee.customAllowances || []).length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-slate-200">
                                    <h5 className="text-xs font-bold text-emerald-700">بدلات مخصصة إضافية (خاضعة):</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(newEmployee.customAllowances || []).map((ca) => (
                                            <div key={ca.id} className="flex gap-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 shadow-sm">
                                                <input type="text" placeholder="اسم البدل" className="flex-1 text-xs border-none bg-transparent outline-none font-bold" value={ca.name} onChange={(e) => updateCustomAllowance(ca.id, 'name', e.target.value)} />
                                                <input type="number" placeholder="القيمة" className="w-20 text-xs border-none bg-white rounded-lg px-2 py-1 outline-none font-mono font-bold text-emerald-700" value={ca.value} onChange={(e) => updateCustomAllowance(ca.id, 'value', Number(e.target.value))} />
                                                <button type="button" onClick={() => removeCustomAllowance(ca.id)} className="text-red-400 hover:text-red-600 p-1"><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        </>
                        ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded text-amber-900 text-sm">
                                <p className="font-bold mb-1 flex items-center gap-2"><ShieldAlert size={18}/> تنبيه محاسبي هام:</p>
                                <p>هذه البدلات تضاف إلى "جملة المستحق" وصافي الراتب، ولكنها <strong>لا تدخل</strong> في حساب حصص التأمينات الاجتماعية (الأجر التأميني).</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-6">
                                <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                                    <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                                        <Coins className="text-amber-500" size={20} />
                                        قائمة البدلات غير الخاضعة للتأمينات
                                    </h4>
                                    <button 
                                        type="button" 
                                        onClick={addNonPensionableAllowance} 
                                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-md transition-all"
                                    >
                                        <Plus size={18} />
                                        إضافة بند بدل جديد
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(newEmployee.nonPensionableAllowances || []).map((npa) => (
                                        <div key={npa.id} className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 group hover:border-emerald-300 transition-all">
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-slate-500 font-bold mb-1">اسم البدل (مثلاً: تعويض سفر)</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="أدخل اسم البند..." 
                                                    className="w-full bg-white border border-slate-100 p-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-200 outline-none" 
                                                    value={npa.name} 
                                                    onChange={(e) => updateNonPensionableAllowance(npa.id, 'name', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="block text-[10px] text-slate-500 font-bold mb-1">القيمة (ج.م)</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    className="w-full bg-white border border-slate-100 p-3 rounded-xl text-sm font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-200 outline-none" 
                                                    value={npa.value || ''} 
                                                    onChange={(e) => updateNonPensionableAllowance(npa.id, 'value', Number(e.target.value))} 
                                                />
                                            </div>
                                            <div className="flex items-end pb-1">
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeNonPensionableAllowance(npa.id)} 
                                                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="حذف البند"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {(newEmployee.nonPensionableAllowances || []).length === 0 && (
                                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                                            <Coins className="mx-auto text-slate-200 mb-4" size={48} />
                                            <p className="text-slate-400 font-bold">لا يوجد بدلات غير خاضعة مسجلة حالياً.</p>
                                            <p className="text-xs text-slate-300 mt-1">اضغط على زر "إضافة بند" للبدء.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        )}

                        <div className="flex gap-4 pt-6 border-t border-emerald-100">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-700 to-emerald-900 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all text-lg">حفظ بيانات الموظف</button>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl hover:bg-slate-50 font-bold transition-all text-lg">إلغاء</button>
                        </div>
                    </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
