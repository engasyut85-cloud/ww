
import React, { useState } from 'react';
import { Employee, EmployeeAllowances, EducationLevel, MaritalStatus, MilitaryStatus, EmploymentCategory } from '../types';
import { Plus, Search, Trash2, Edit, Eye, Wallet, GraduationCap, Building, User, Phone, Mail, MapPin, Hash, Flag, Accessibility, CreditCard, Filter } from 'lucide-react';
import { EmployeeProfileCard } from './EmployeeProfileCard';
import { JOB_GRADES, ALLOWANCE_LABELS, EMPLOYMENT_CATEGORIES } from '../constants';

interface EmployeeListProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  departments: string[];
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, setEmployees, departments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Initialize with default allowances structure
  const defaultAllowances: EmployeeAllowances = {
      transportation: 0, housing: 0, clothing: 0, meal: 0,
      screen: 0, dedication: 0, risk: 0, cashier: 0, secretariat: 0, infection: 0, workNature: 0,
      representation: 0, driving: 0, livingCost: 300, overtimeAllowance: 0, cashAllowance: 0,
      complementaryIncentive: 0, residenceAllowance: 0, minSocialPackage: 0, laborGrantAllowance: 0, additionalSocialAllowance: 0
  };

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({ 
      allowances: defaultAllowances,
      educationLevel: 'none',
      hasExperience: false,
      isSpecialNeeds: false,
      maritalStatus: 'single',
      militaryStatus: 'exempt',
      employmentCategory: 'syndicate_permanent',
      manualFellowshipValue: 0,
      manualSyndicateIncentive: 0,
      manualSpecialRaise2015: 0
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => 
    emp.name.includes(searchTerm) || emp.position.includes(searchTerm) || emp.department.includes(searchTerm)
  );

  const handleSaveEmployee = (e: React.FormEvent) => {
      e.preventDefault();
      const allowances = newEmployee.allowances || defaultAllowances;

      if (newEmployee.id) {
          // Edit existing
          const updatedEmployees = employees.map(emp => 
            emp.id === newEmployee.id ? { ...emp, ...newEmployee, allowances } as Employee : emp
          );
          setEmployees(updatedEmployees);
      } else {
          // Create new
          const id = `EMP${Math.floor(Math.random() * 10000)}`;
          const emp: Employee = {
              id,
              name: newEmployee.name || '',
              nationalId: newEmployee.nationalId || '',
              department: newEmployee.department || '',
              position: newEmployee.position || '',
              grade: newEmployee.grade,
              educationLevel: newEmployee.educationLevel || 'none',
              hasExperience: newEmployee.hasExperience || false,
              isSpecialNeeds: newEmployee.isSpecialNeeds || false,
              employmentCategory: newEmployee.employmentCategory || 'syndicate_permanent',
              basicSalary: Number(newEmployee.basicSalary) || 0,
              variableSalary: Number(newEmployee.variableSalary) || 0,
              
              manualFellowshipValue: Number(newEmployee.manualFellowshipValue) || 0,
              manualSyndicateIncentive: Number(newEmployee.manualSyndicateIncentive) || 0,
              manualSpecialRaise2015: Number(newEmployee.manualSpecialRaise2015) || 0,

              allowances: allowances,
              phone: newEmployee.phone || '',
              email: newEmployee.email || '',
              address: newEmployee.address || '',
              insuranceNumber: newEmployee.insuranceNumber || '',
              maritalStatus: newEmployee.maritalStatus,
              militaryStatus: newEmployee.militaryStatus,
              bankName: newEmployee.bankName || '',
              bankAccountNumber: newEmployee.bankAccountNumber || '',
              joinDate: newEmployee.joinDate || new Date().toISOString().split('T')[0]
          };
          setEmployees([...employees, emp]);
      }
      setIsModalOpen(false);
      setNewEmployee({ 
          allowances: defaultAllowances, 
          educationLevel: 'none', 
          hasExperience: false, 
          isSpecialNeeds: false, 
          maritalStatus: 'single', 
          militaryStatus: 'exempt', 
          employmentCategory: 'syndicate_permanent',
          manualFellowshipValue: 0,
          manualSyndicateIncentive: 0,
          manualSpecialRaise2015: 0
      });
  };

  const handleEdit = (employee: Employee) => {
      setNewEmployee({ ...employee, allowances: { ...defaultAllowances, ...employee.allowances } });
      setIsModalOpen(true);
      setSelectedEmployee(null);
  };

  const deleteEmployee = (id: string) => {
      if(confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
          setEmployees(employees.filter(e => e.id !== id));
      }
  };

  const getGradeName = (id?: string) => JOB_GRADES.find(g => g.id === id)?.name;
  
  const getCategoryLabel = (id: string) => EMPLOYMENT_CATEGORIES.find(c => c.id === id)?.label;

  return (
    <div className="p-8 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8 animate-slide-up">
        <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-emerald-900 to-emerald-600">سجل الموظفين</h2>
            <p className="text-emerald-600 mt-1 font-medium">إدارة بيانات المهندسين والموظفين بالنقابة</p>
        </div>
        <button 
            onClick={() => { setNewEmployee({ allowances: defaultAllowances, educationLevel: 'none', hasExperience: false, isSpecialNeeds: false, maritalStatus: 'single', militaryStatus: 'exempt', employmentCategory: 'syndicate_permanent', manualFellowshipValue: 0, manualSyndicateIncentive: 0, manualSpecialRaise2015: 0 }); setIsModalOpen(true); }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 btn-interactive"
        >
            <Plus size={20} />
            موظف جديد
        </button>
      </div>

      <div className="glass-panel p-2 rounded-2xl shadow-sm mb-6 flex items-center gap-3 animate-slide-up delay-100">
        <div className="flex-1 bg-white/50 rounded-xl flex items-center px-4 py-3 border border-emerald-100 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300">
            <Search className="text-emerald-400 mr-3" size={22} />
            <input 
                type="text" 
                placeholder="بحث بالاسم أو الوظيفة أو القسم..." 
                className="flex-1 outline-none text-slate-700 font-bold placeholder:font-normal bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden animate-slide-up delay-200">
        <table className="w-full text-right border-collapse">
            <thead className="bg-emerald-50/80 text-emerald-900">
                <tr>
                    <th className="p-5 text-sm font-bold border-b border-emerald-100">الاسم</th>
                    <th className="p-5 text-sm font-bold border-b border-emerald-100">التصنيف</th>
                    <th className="p-5 text-sm font-bold border-b border-emerald-100">القسم</th>
                    <th className="p-5 text-sm font-bold border-b border-emerald-100">الوظيفة</th>
                    <th className="p-5 text-sm font-bold border-b border-emerald-100">الدرجة</th>
                    <th className="p-5 text-sm font-bold border-b border-emerald-100">إجراءات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50/50">
                {filteredEmployees.map((emp, index) => (
                    <tr 
                        key={emp.id} 
                        style={{animationDelay: `${index * 50}ms`}} 
                        className="hover:bg-emerald-50/40 transition-all duration-300 group animate-slide-up"
                    >
                        <td className="p-5 font-medium text-slate-800">
                            <button onClick={() => setSelectedEmployee(emp)} className="hover:text-emerald-700 font-bold flex items-center gap-3 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform duration-300 border border-emerald-200">
                                    {emp.name.charAt(0)}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">{emp.name}</span>
                                    {emp.isSpecialNeeds && (
                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 mt-1 border border-blue-100">
                                            <Accessibility size={10} />
                                            ذوي همم
                                        </span>
                                    )}
                                </div>
                            </button>
                        </td>
                        <td className="p-5"><span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">{getCategoryLabel(emp.employmentCategory)}</span></td>
                        <td className="p-5 text-slate-600 text-sm font-medium">{emp.department}</td>
                        <td className="p-5 text-slate-600 text-sm">{emp.position}</td>
                        <td className="p-5 text-slate-600 text-sm"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold border border-slate-200">{getGradeName(emp.grade) || '-'}</span></td>
                        <td className="p-5">
                            <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => setSelectedEmployee(emp)} className="p-2 bg-white border border-emerald-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded-xl transition-all shadow-sm" title="عرض"><Eye size={18} /></button>
                                <button onClick={() => handleEdit(emp)} className="p-2 bg-white border border-blue-100 text-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 rounded-xl transition-all shadow-sm" title="تعديل"><Edit size={18} /></button>
                                <button onClick={() => deleteEmployee(emp.id)} className="p-2 bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-xl transition-all shadow-sm" title="حذف"><Trash2 size={18} /></button>
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
            onClose={() => setSelectedEmployee(null)} 
            onEdit={() => handleEdit(selectedEmployee)}
        />
      )}

      {isModalOpen && (
          <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in border border-emerald-100">
                  <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-8 py-5 border-b border-emerald-100 flex justify-between items-center shadow-sm">
                      <h3 className="text-2xl font-bold text-emerald-900 flex items-center gap-3">
                          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700"><User size={24} /></div>
                          {newEmployee.id ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 p-2 rounded-full transition-all duration-300 transform hover:rotate-90"><Trash2 size={0} className="hidden" /><span className="text-xl px-2 font-bold">✕</span></button>
                  </div>
                  
                  <div className="p-8">
                    <form onSubmit={handleSaveEmployee} className="space-y-8">
                        {/* Sections remain same logic but styled */}
                        {/* Section 1: Personal & Job */}
                        <div className="space-y-4 animate-slide-up delay-100">
                            <h4 className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit flex items-center gap-2"><Building size={16} /> البيانات الأساسية والوظيفية</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم الكامل</label>
                                    <input required type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none transition-all" value={newEmployee.name || ''} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الرقم القومي</label>
                                    <input required type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none transition-all font-mono" value={newEmployee.nationalId || ''} onChange={e => setNewEmployee({...newEmployee, nationalId: e.target.value})} />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الرقم التأميني</label>
                                    <input type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none transition-all font-mono" value={newEmployee.insuranceNumber || ''} onChange={e => setNewEmployee({...newEmployee, insuranceNumber: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الإدارة / القسم</label>
                                    <select 
                                        className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none transition-all appearance-none" 
                                        required 
                                        value={newEmployee.department || ''} 
                                        onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                                    >
                                        <option value="">-- اختر --</option>
                                        {departments.map((dept, idx) => (
                                            <option key={idx} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                    <Building className="absolute left-3 top-10 text-slate-400 pointer-events-none" size={16} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">المسمى الوظيفي</label>
                                    <input required type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none transition-all" value={newEmployee.position || ''} onChange={e => setNewEmployee({...newEmployee, position: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">فئة التعيين (التعاقد)</label>
                                <select 
                                    required
                                    className="w-full border border-emerald-100 bg-emerald-50/30 p-3.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none font-bold text-emerald-800"
                                    value={newEmployee.employmentCategory || 'syndicate_permanent'}
                                    onChange={e => setNewEmployee({...newEmployee, employmentCategory: e.target.value as EmploymentCategory})}
                                >
                                    {EMPLOYMENT_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Section 2: Contact & Status Info */}
                        <div className="space-y-4 animate-slide-up delay-200">
                            <h4 className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit flex items-center gap-2"><Phone size={16} /> بيانات الاتصال والحالة</h4>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم الهاتف</label>
                                    <input type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none font-mono" value={newEmployee.phone || ''} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">البريد الإلكتروني</label>
                                    <input type="email" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" value={newEmployee.email || ''} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">العنوان بالتفصيل</label>
                                <input type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" value={newEmployee.address || ''} onChange={e => setNewEmployee({...newEmployee, address: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الحالة الاجتماعية</label>
                                    <select 
                                        className="w-full border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl outline-none"
                                        value={newEmployee.maritalStatus || 'single'}
                                        onChange={e => setNewEmployee({...newEmployee, maritalStatus: e.target.value as MaritalStatus})}
                                    >
                                        <option value="single">أعزب / عزباء</option>
                                        <option value="married">متزوج / متزوجة</option>
                                        <option value="divorced">مطلق / مطلقة</option>
                                        <option value="widowed">أرمل / أرملة</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الخدمة العسكرية</label>
                                    <select 
                                        className="w-full border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl outline-none"
                                        value={newEmployee.militaryStatus || 'exempt'}
                                        onChange={e => setNewEmployee({...newEmployee, militaryStatus: e.target.value as MilitaryStatus})}
                                    >
                                        <option value="completed">مؤدي الخدمة</option>
                                        <option value="exempt">إعفاء نهائي</option>
                                        <option value="postponed">مؤجل</option>
                                        <option value="none">غير مطلوب (إناث)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم البنك</label>
                                    <input type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" value={newEmployee.bankName || ''} onChange={e => setNewEmployee({...newEmployee, bankName: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">رقم الحساب البنكي</label>
                                    <input type="text" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none font-mono" value={newEmployee.bankAccountNumber || ''} onChange={e => setNewEmployee({...newEmployee, bankAccountNumber: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5">تاريخ التعيين</label>
                                    <input type="date" className="border border-emerald-100 bg-slate-50/50 p-3.5 rounded-xl w-full focus:bg-white focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 outline-none" value={newEmployee.joinDate || ''} onChange={e => setNewEmployee({...newEmployee, joinDate: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Salary */}
                        <div className="space-y-4 bg-gradient-to-br from-emerald-50/80 to-white p-6 rounded-2xl border border-emerald-100 shadow-sm animate-slide-up delay-300">
                            <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2 border-b border-emerald-200 pb-2"><Wallet size={18} /> الدرجة والمؤهل والراتب</h4>
                            
                            {/* Salary Inputs - Keeping functional but styled better */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-700 mb-1.5">الدرجة الوظيفية</label>
                                        <select 
                                            className="w-full border border-emerald-200 p-3.5 rounded-xl bg-white focus:ring-2 focus:ring-emerald-300 outline-none"
                                            value={newEmployee.grade || ''}
                                            onChange={(e) => {
                                                const gradeId = e.target.value;
                                                const grade = JOB_GRADES.find(g => g.id === gradeId);
                                                setNewEmployee({
                                                    ...newEmployee,
                                                    grade: gradeId,
                                                    basicSalary: grade ? grade.salary : newEmployee.basicSalary
                                                });
                                            }}
                                        >
                                            <option value="">-- اختر الدرجة --</option>
                                            {JOB_GRADES.map(g => (
                                                <option key={g.id} value={g.id}>
                                                    {g.name} - {g.salary} ج.م ({g.description})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-700 mb-1.5">المؤهل العلمي</label>
                                        <select 
                                            className="w-full border border-emerald-200 p-3.5 rounded-xl bg-white focus:ring-2 focus:ring-emerald-300 outline-none"
                                            value={newEmployee.educationLevel || 'none'}
                                            onChange={(e) => setNewEmployee({...newEmployee, educationLevel: e.target.value as EducationLevel})}
                                        >
                                            <option value="none">بدون / مؤهل عالي عادي</option>
                                            <option value="diploma">دبلوم (علاوة 5%)</option>
                                            <option value="master">ماجستير</option>
                                            <option value="phd">دكتوراه (علاوة 5%)</option>
                                        </select>
                                    </div>
                            </div>

                            <div className="flex flex-col gap-3 py-2 bg-white/60 p-3 rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        id="exp" 
                                        checked={newEmployee.hasExperience} 
                                        onChange={(e) => setNewEmployee({...newEmployee, hasExperience: e.target.checked})}
                                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                                    />
                                    <label htmlFor="exp" className="text-sm font-medium text-slate-700 cursor-pointer select-none">لديه خبرة سابقة (يستحق علاوة خبرة 10% من الأساسي)</label>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        id="special" 
                                        checked={newEmployee.isSpecialNeeds} 
                                        onChange={(e) => setNewEmployee({...newEmployee, isSpecialNeeds: e.target.checked})}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                    />
                                    <label htmlFor="special" className="text-sm font-bold text-blue-800 flex items-center gap-1 cursor-pointer select-none">
                                        <Accessibility size={16} />
                                        من ذوي الاحتياجات الخاصة (زيادة 50% في الإعفاء الضريبي)
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-700 mb-1.5">الراتب الأساسي</label>
                                    <input required type="number" className="border border-emerald-200 p-3.5 rounded-xl w-full bg-white font-mono text-lg font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-300 outline-none" value={newEmployee.basicSalary || ''} onChange={e => setNewEmployee({...newEmployee, basicSalary: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-700 mb-1.5">حوافز أخرى (متغير)</label>
                                    <input required type="number" className="border border-emerald-200 p-3.5 rounded-xl w-full bg-white font-mono text-lg font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-300 outline-none" value={newEmployee.variableSalary || ''} onChange={e => setNewEmployee({...newEmployee, variableSalary: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-amber-700 mb-1.5" title="القيمة الإجمالية تقسم على 2 (نصف على الموظف ونصف على النقابة)">قيمة صندوق الزمالة (إجمالي)</label>
                                    <input 
                                        type="number" 
                                        className="border border-amber-200 p-3.5 rounded-xl w-full bg-white font-mono text-lg font-bold text-amber-800 focus:ring-2 focus:ring-amber-300 outline-none" 
                                        value={newEmployee.manualFellowshipValue || ''} 
                                        onChange={e => setNewEmployee({...newEmployee, manualFellowshipValue: Number(e.target.value)})} 
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 bg-white/60 p-3 rounded-xl border border-emerald-100">
                                <div>
                                    <label className="block text-xs font-bold text-amber-700 mb-1.5">حافز النقابة (قيمة مادية)</label>
                                    <input 
                                        type="number" 
                                        className="border border-amber-200 p-3.5 rounded-xl w-full bg-white font-mono text-lg font-bold text-amber-800 focus:ring-2 focus:ring-amber-300 outline-none" 
                                        value={newEmployee.manualSyndicateIncentive || ''} 
                                        onChange={e => setNewEmployee({...newEmployee, manualSyndicateIncentive: Number(e.target.value)})} 
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-amber-600 mt-1">يُدخل يدوياً بدلاً من 100%</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-700 mb-1.5">علاوة خاصة 2015 (قيمة مادية)</label>
                                    <input 
                                        type="number" 
                                        className="border border-blue-200 p-3.5 rounded-xl w-full bg-white font-mono text-lg font-bold text-blue-800 focus:ring-2 focus:ring-blue-300 outline-none" 
                                        value={newEmployee.manualSpecialRaise2015 || ''} 
                                        onChange={e => setNewEmployee({...newEmployee, manualSpecialRaise2015: Number(e.target.value)})} 
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-blue-600 mt-1">تُدخل يدوياً بدلاً من 10%</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Allowances */}
                        <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-slide-up delay-400">
                            <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2 border-b border-slate-300 pb-2"><Plus size={18} /> بدلات طبيعة العمل والبدلات الأخرى</h4>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(ALLOWANCE_LABELS).map(([key, label]) => (
                                    <div key={key} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
                                        <label className="block text-[10px] text-slate-500 font-bold mb-1 truncate" title={label}>{label}</label>
                                        <input 
                                            type="number" 
                                            className="w-full outline-none font-mono font-bold text-emerald-700 text-sm bg-transparent border-b border-transparent focus:border-emerald-300 transition-colors" 
                                            placeholder="0"
                                            value={newEmployee.allowances?.[key as keyof EmployeeAllowances] || 0}
                                            onChange={e => setNewEmployee({
                                                ...newEmployee,
                                                allowances: {
                                                    ...newEmployee.allowances!,
                                                    [key]: Number(e.target.value)
                                                }
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex gap-4 pt-4 border-t border-emerald-100 animate-slide-up delay-500">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-700 to-emerald-900 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-1 transition-all duration-300 btn-interactive">حفظ البيانات</button>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-700 py-4 rounded-xl hover:bg-slate-50 font-bold transition-all duration-300">إلغاء</button>
                        </div>
                    </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};