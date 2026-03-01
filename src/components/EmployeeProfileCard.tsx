
import React, { useState } from 'react';
import { Employee, Loan } from '../types';
import { JOB_GRADES, ALLOWANCE_LABELS, DEGREE_TYPES } from '../constants';
import { X, Phone, Calendar, CreditCard, User, Briefcase, Building, Building2, Star, Coins, GraduationCap, TrendingUp, FileText, Upload, Eye, Accessibility, Hash, School, CalendarClock, Hourglass, Clock, Wallet, Smartphone, ShieldCheck } from 'lucide-react';
import { calculateLoanBalances } from '../utils/payrollLogic';

interface EmployeeProfileCardProps {
  employee: Employee;
  loans: Loan[];
  onClose: () => void;
  onEdit: () => void;
}

export const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({ employee, loans, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'docs'>('info');
  
  const gradeDetails = JOB_GRADES.find(g => g.id === employee.grade);
  
  const syndicateIncentive = Number(employee.manualSyndicateIncentive) || 0;
  const specialRaise2015 = Number(employee.manualSpecialRaise2015) || 0;
  const additionalIncentiveValue = Number(employee.allowances?.additionalIncentive) || (gradeDetails ? gradeDetails.additionalIncentive : 0);
  const cashAllowance = Number(employee.allowances?.cashAllowance) || 0;
  const livingCost = Number(employee.allowances?.livingCost) || 0;

  const totalCustomAllowances = (employee.customAllowances || []).reduce((a, b) => a + (Number(b.value) || 0), 0);
  const totalNonPensionable = (employee.nonPensionableAllowances || []).reduce((a, b) => a + (Number(b.value) || 0), 0);
  
  const standardAllowancesValues = (Object.values(employee.allowances || {}) as number[]).reduce((a, b) => a + (Number(b) || 0), 0);
  const fullAllowancesSum = standardAllowancesValues + totalCustomAllowances + totalNonPensionable;

  const experienceBonus = employee.hasExperience ? (employee.basicSalary * 0.10) : 0;
  let educationBonus = 0;
  if (employee.educationLevel === 'phd' || employee.educationLevel === 'diploma') {
      educationBonus = employee.basicSalary * 0.05;
  }
  const totalEduExpBonus = experienceBonus + educationBonus;

  const grossSalary = employee.basicSalary + employee.variableSalary + fullAllowancesSum + syndicateIncentive + totalEduExpBonus + specialRaise2015 + 10;

  const today = new Date();
  const activeEmpLoan = loans.find(l => l.employeeId === employee.id && l.status === 'active' && l.type !== 'bank');
  const activeEmpBank = loans.find(l => l.employeeId === employee.id && l.status === 'active' && l.type === 'bank');
  
  const loanInstallment = activeEmpLoan ? calculateLoanBalances(activeEmpLoan, today).installment : 0;
  const bankInstallment = activeEmpBank ? calculateLoanBalances(activeEmpBank, today).installment : 0;

  const getEduLabel = (level: string) => {
      const type = DEGREE_TYPES.find(d => d.id === level);
      return type ? type.label : 'غير محدد';
  };

  const calculateAge = (nid: string) => {
      if (!nid || nid.length !== 14) return 'غير محدد';
      const centuryCode = nid[0];
      const yearPart = nid.substring(1, 3);
      const monthPart = nid.substring(3, 5);
      const dayPart = nid.substring(5, 7);
      let fullYear = centuryCode === '2' ? '19' + yearPart : '20' + yearPart;
      const birthDate = new Date(`${fullYear}-${monthPart}-${dayPart}`);
      const now = new Date();
      let age = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
      return `${age} سنة`;
  };

  return (
    <div className="fixed inset-0 bg-emerald-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-emerald-900 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-4 left-4 text-emerald-200 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all">
            <X size={24} />
          </button>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-emerald-800 border-4 border-emerald-400/30 shadow-xl relative">
              {employee.name.charAt(0)}
              {employee.isSpecialNeeds && <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white"><Accessibility size={16} /></div>}
            </div>
            <div className="text-center md:text-right">
              <h2 className="text-3xl font-bold">{employee.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-4 text-emerald-100 mt-2">
                <div className="flex items-center gap-1"><Briefcase size={16} /><span>{employee.position}</span></div>
                <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                <div className="flex items-center gap-1"><Star size={16} className="text-yellow-400" /><span className="text-yellow-400 font-bold">{gradeDetails?.name}</span></div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8 border-b border-emerald-700">
              <button onClick={() => setActiveTab('info')} className={`pb-2 px-2 text-sm font-bold transition-colors ${activeTab === 'info' ? 'text-white border-b-2 border-white' : 'text-emerald-400 hover:text-emerald-100'}`}>بيانات الموظف والراتب</button>
              <button onClick={() => setActiveTab('docs')} className={`pb-2 px-2 text-sm font-bold transition-colors ${activeTab === 'docs' ? 'text-white border-b-2 border-white' : 'text-emerald-400 hover:text-emerald-100'}`}>أرشيف المستندات</button>
          </div>
        </div>

        <div className="p-8">
            {activeTab === 'info' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-emerald-600 uppercase border-b border-emerald-100 pb-2 mb-4">البيانات الوظيفية والشخصية</h3>
                        <InfoItem icon={<User size={18} />} label="الرقم القومي" value={employee.nationalId} />
                        <InfoItem icon={<Hash size={18} />} label="الرقم التأميني" value={employee.insuranceNumber} highlight />
                        <InfoItem icon={<Phone size={18} />} label="رقم الهاتف" value={employee.phone} />
                        <InfoItem icon={<Building size={18} />} label="القسم" value={employee.department} />
                        <InfoItem icon={<Calendar size={18} />} label="تاريخ التعيين" value={employee.joinDate} />
                        <InfoItem icon={<CalendarClock size={18} />} label="بلوغ المعاش" value={employee.retirementDate} />
                        
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 space-y-2">
                            <InfoItem icon={<GraduationCap size={18} />} label="المؤهل" value={getEduLabel(employee.educationLevel)} />
                            {employee.faculty && <InfoItem icon={<School size={18} />} label="الكلية" value={`${employee.university || ''} - ${employee.faculty}`} />}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-emerald-600 uppercase border-b border-emerald-100 pb-2 mb-4">الاستحقاقات والخصومات</h3>
                        <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 space-y-3">
                            <Row label="الراتب الأساسي" val={employee.basicSalary} icon={<CreditCard size={16} />} />
                            <Row label="الحافز الإضافي" val={additionalIncentiveValue} icon={<TrendingUp size={16} className="text-blue-500" />} color="text-blue-700" bold />
                            
                            {totalNonPensionable > 0 && (
                                <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 mt-2">
                                    <p className="text-[9px] font-bold text-amber-600 mb-1 flex items-center gap-1"><ShieldCheck size={10}/> بدلات غير خاضعة للتأمينات:</p>
                                    {(employee.nonPensionableAllowances || []).map(npa => (
                                        <div key={npa.id} className="flex justify-between text-[11px] font-bold text-slate-700 px-1">
                                            <span>{npa.name}</span>
                                            <span>{npa.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="py-2 border-t border-dashed border-emerald-200 mt-2">
                                <p className="text-[10px] font-bold text-emerald-500 mb-2">الاستقطاعات المتوقعة:</p>
                                {loanInstallment > 0 && <Row label="قسط سلفة" val={loanInstallment} icon={<Wallet size={14} className="text-red-400" />} color="text-red-600" />}
                                {bankInstallment > 0 && <Row label="قسط بنك" val={bankInstallment} icon={<Building2 size={14} className="text-blue-400" />} color="text-blue-600" />}
                                {employee.vodafoneDeduction ? <Row label="فودافون" val={employee.vodafoneDeduction} icon={<Smartphone size={14} className="text-rose-400" />} color="text-rose-600" /> : null}
                            </div>

                            <div className="pt-3 border-t border-emerald-200 flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                                <span className="text-sm font-bold text-emerald-800">إجمالي الاستحقاق (Gross)</span>
                                <span className="font-mono font-bold text-emerald-900 text-lg">{grossSalary.toLocaleString()} ج.م</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center"><h3 className="font-bold text-emerald-800">المستندات المؤرشفة</h3><button className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-100"><Upload size={16} />رفع مستند جديد</button></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-emerald-100 p-4 rounded-xl flex items-center gap-3 hover:bg-emerald-50 cursor-pointer"><div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"><FileText size={20} /></div><div className="flex-1"><h4 className="font-bold text-sm text-slate-800">صورة البطاقة</h4><p className="text-[10px] text-slate-400">PDF • 2023-01-01</p></div><Eye size={16} className="text-slate-400" /></div>
                    </div>
                </div>
            )}
        </div>
        
        <div className="bg-emerald-50 p-4 border-t border-emerald-200 flex justify-end gap-3">
             <button onClick={onClose} className="px-6 py-2 bg-white border border-emerald-300 rounded-lg text-emerald-700 font-medium">إغلاق</button>
             <button onClick={onEdit} className="px-6 py-2 bg-emerald-900 text-white rounded-lg font-medium shadow-lg">تعديل البيانات</button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, highlight }: { icon: React.ReactNode, label: string, value: string | number | undefined, highlight?: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${highlight ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${highlight ? 'bg-blue-100 text-blue-600' : 'bg-white text-emerald-600 shadow-sm'}`}>{icon}</div>
        <div><p className="text-[10px] text-slate-500 font-bold mb-0.5">{label}</p><p className={`font-bold text-xs ${highlight ? 'text-blue-900' : 'text-slate-800'}`}>{value || '-'}</p></div>
    </div>
);

const Row = ({ label, val, icon, color = 'text-emerald-800', bold }: { label: string, val: number, icon: React.ReactNode, color?: string, bold?: boolean }) => (
    <div className={`flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors ${bold ? 'bg-white/50' : ''}`}>
        <div className="flex items-center gap-2"><div className="text-slate-400">{icon}</div><span className={`text-xs ${bold ? 'font-bold' : 'font-medium'} text-slate-600`}>{label}</span></div>
        <span className={`font-mono font-bold ${color}`}>{val.toLocaleString()}</span>
    </div>
);
