
import React, { useState } from 'react';
import { Employee } from '../types';
import { JOB_GRADES, ALLOWANCE_LABELS } from '../constants';
import { X, Phone, Calendar, CreditCard, User, Briefcase, Building, Star, Coins, GraduationCap, TrendingUp, FileText, Upload, Eye, Accessibility, Hash } from 'lucide-react';

interface EmployeeProfileCardProps {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
}

export const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({ employee, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'docs'>('info');
  
  const gradeDetails = JOB_GRADES.find(g => g.id === employee.grade);
  const totalAllowances = (Object.values(employee.allowances || {}) as number[]).reduce((a, b) => a + (Number(b) || 0), 0);
  
  const syndicateIncentive = Number(employee.manualSyndicateIncentive) || 0;
  const specialRaise2015 = Number(employee.manualSpecialRaise2015) || 0;

  const additionalIncentive = gradeDetails ? gradeDetails.additionalIncentive : 0;
  
  const experienceBonus = employee.hasExperience ? (employee.basicSalary * 0.10) : 0;
  let educationBonus = 0;
  if (employee.educationLevel === 'phd' || employee.educationLevel === 'diploma') {
      educationBonus = employee.basicSalary * 0.05;
  }
  const totalEduExpBonus = experienceBonus + educationBonus;

  const grossSalary = employee.basicSalary + employee.variableSalary + totalAllowances + syndicateIncentive + additionalIncentive + totalEduExpBonus + specialRaise2015;

  const getEduLabel = (level: string) => {
      switch(level) {
          case 'phd': return 'دكتوراه';
          case 'master': return 'ماجستير';
          case 'diploma': return 'دبلوم';
          default: return 'مؤهل عالي';
      }
  };

  return (
    <div className="fixed inset-0 bg-emerald-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* Header - Green Gradient */}
        <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-emerald-900 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-emerald-200 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-emerald-800 border-4 border-emerald-400/30 shadow-xl relative">
              {employee.name.charAt(0)}
              {employee.isSpecialNeeds && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white" title="ذوي احتياجات خاصة">
                      <Accessibility size={16} />
                  </div>
              )}
            </div>
            <div className="text-center md:text-right">
              <h2 className="text-3xl font-bold">{employee.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-4 text-emerald-100 mt-2">
                <div className="flex items-center gap-1">
                     <Briefcase size={16} />
                     <span className="font-medium">{employee.position}</span>
                </div>
                <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                <div className="flex items-center gap-1">
                     <Star size={16} className="text-yellow-400" />
                     <span className="font-medium text-yellow-400">{gradeDetails?.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-8 border-b border-emerald-700">
              <button 
                onClick={() => setActiveTab('info')}
                className={`pb-2 px-2 text-sm font-bold transition-colors ${activeTab === 'info' ? 'text-white border-b-2 border-white' : 'text-emerald-400 hover:text-emerald-100'}`}
              >
                  بيانات الموظف والراتب
              </button>
              <button 
                onClick={() => setActiveTab('docs')}
                className={`pb-2 px-2 text-sm font-bold transition-colors ${activeTab === 'docs' ? 'text-white border-b-2 border-white' : 'text-emerald-400 hover:text-emerald-100'}`}
              >
                  أرشيف المستندات
              </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
            {activeTab === 'info' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Personal Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2 mb-4">
                            البيانات الوظيفية
                        </h3>
                        
                        <InfoItem icon={<User size={18} />} label="الرقم القومي" value={employee.nationalId} />
                        <InfoItem icon={<Phone size={18} />} label="رقم الهاتف" value={employee.phone} />
                        <InfoItem icon={<Building size={18} />} label="القسم" value={employee.department} highlight />
                        <InfoItem icon={<Calendar size={18} />} label="تاريخ التعيين" value={employee.joinDate} />
                        <InfoItem 
                            icon={<GraduationCap size={18} />} 
                            label="المؤهل العلمي / الخبرة" 
                            value={`${getEduLabel(employee.educationLevel)} ${employee.hasExperience ? '+ خبرة سابقة' : ''}`} 
                        />
                        {employee.isSpecialNeeds && (
                            <InfoItem 
                                icon={<Accessibility size={18} className="text-blue-500" />} 
                                label="الحالة الخاصة" 
                                value="من ذوي الاحتياجات الخاصة (إعفاء ضريبي +50%)" 
                                highlight
                            />
                        )}
                        <InfoItem icon={<CreditCard size={18} />} label="البنك" value={employee.bankName} />
                        <InfoItem icon={<Hash size={18} />} label="رقم الحساب البنكي" value={employee.bankAccountNumber} />
                    </div>

                    {/* Financial Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2 mb-4">
                            الاستحقاقات المالية (شهرياً)
                        </h3>

                        <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 space-y-3">
                            <Row label="الراتب الأساسي" val={employee.basicSalary} icon={<CreditCard size={16} />} />
                            <Row label="حافز النقابة (يدوي)" val={syndicateIncentive} icon={<Coins size={16} className="text-amber-500" />} color="text-amber-700" />
                            <Row label="حافز إضافي (حسب الدرجة)" val={additionalIncentive} icon={<TrendingUp size={16} className="text-emerald-500" />} color="text-emerald-700" />
                            <Row label="علاوة خاصة 2015" val={specialRaise2015} icon={<Coins size={16} />} />
                            
                            {totalEduExpBonus > 0 && (
                                <Row label="علاوة مؤهل / خبرة" val={totalEduExpBonus} icon={<GraduationCap size={16} />} />
                            )}

                            <Row label="متغير / حوافز أخرى" val={employee.variableSalary} icon={<CreditCard size={16} />} />
                            
                            {/* Allowances Breakdown */}
                            {totalAllowances > 0 && (
                                <div className="py-2 border-t border-dashed border-emerald-200 mt-2">
                                    <p className="text-xs font-bold text-emerald-500 mb-2">تفاصيل البدلات:</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        {(Object.entries(employee.allowances || {}) as [string, number][]).map(([key, value]) => (
                                            Number(value) > 0 && (
                                                <div key={key} className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500 truncate">{ALLOWANCE_LABELS[key as keyof typeof ALLOWANCE_LABELS]}</span>
                                                    <span className="font-mono text-emerald-600">{Number(value).toLocaleString()}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between font-medium text-xs pt-2 border-t border-emerald-200 mt-2">
                                        <span className="text-emerald-700">إجمالي البدلات</span>
                                        <span className="font-mono text-emerald-700">{totalAllowances.toLocaleString()} ج.م</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t border-emerald-200 flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-100 shadow-sm">
                                <span className="text-sm font-bold text-emerald-800">إجمالي الراتب (Gross)</span>
                                <span className="font-mono font-bold text-emerald-900 text-lg">
                                    {grossSalary.toLocaleString()} ج.م
                                </span>
                            </div>
                            
                            <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-800">صندوق الزمالة (إجمالي)</span>
                                <span className="font-mono font-bold text-amber-700">
                                    {(employee.manualFellowshipValue || 0).toLocaleString()} ج.م
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-emerald-800">المستندات المؤرشفة</h3>
                        <button className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-100">
                            <Upload size={16} />
                            رفع مستند جديد
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Mock Documents */}
                        <div className="border border-emerald-100 p-4 rounded-xl flex items-center gap-3 hover:bg-emerald-50 cursor-pointer transition-colors">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-slate-800">صورة البطاقة الشخصية</h4>
                                <p className="text-xs text-slate-400">PDF • 2 MB • 2023-01-01</p>
                            </div>
                            <Eye size={16} className="text-slate-400" />
                        </div>
                        
                        <div className="border border-emerald-100 p-4 rounded-xl flex items-center gap-3 hover:bg-emerald-50 cursor-pointer transition-colors">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-slate-800">عقد العمل</h4>
                                <p className="text-xs text-slate-400">PDF • 5 MB • 2019-03-01</p>
                            </div>
                            <Eye size={16} className="text-slate-400" />
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-xl text-center text-sm text-emerald-600 border border-dashed border-emerald-300">
                        لا توجد مستندات أخرى. قم برفع صور الشهادات، الجيش، والفيش الجنائي.
                    </div>
                </div>
            )}
        </div>
        
        <div className="bg-emerald-50 p-4 border-t border-emerald-200 flex justify-end gap-3">
             <button onClick={onClose} className="px-6 py-2 bg-white border border-emerald-300 rounded-lg text-emerald-700 font-medium hover:bg-emerald-50">إغلاق</button>
             <button onClick={onEdit} className="px-6 py-2 bg-emerald-900 text-white rounded-lg font-medium hover:bg-emerald-800 shadow-lg shadow-emerald-900/20">تعديل البيانات</button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, highlight }: { icon: React.ReactNode, label: string, value: string | number | undefined, highlight?: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${highlight ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${highlight ? 'bg-blue-100 text-blue-600' : 'bg-white text-emerald-600 shadow-sm'}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-slate-500 font-bold mb-0.5">{label}</p>
            <p className={`font-bold ${highlight ? 'text-blue-900' : 'text-slate-800'}`}>{value || '-'}</p>
        </div>
    </div>
);

const Row = ({ label, val, icon, color = 'text-emerald-800' }: { label: string, val: number, icon: React.ReactNode, color?: string }) => (
    <div className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors">
        <div className="flex items-center gap-2">
            <div className="text-slate-400">{icon}</div>
            <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
        <span className={`font-mono font-bold ${color}`}>
            {val.toLocaleString()}
        </span>
    </div>
);