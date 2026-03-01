
import React, { useState } from 'react';
import { Employee, PerformanceReview } from '../types';
import { Search, Printer, FileBadge, User, FileText } from 'lucide-react';
import { JOB_GRADES } from '../constants';
import { calculateSalary } from '../utils/payrollLogic';

interface StatusStatementProps {
  employees: Employee[];
  reviews: PerformanceReview[];
  penalties: Record<string, number>;
}

export const StatusStatement: React.FC<StatusStatementProps> = ({ employees, reviews, penalties }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDocNum, setSearchDocNum] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => {
    const matchGeneral = emp.name.includes(searchTerm) || emp.nationalId.includes(searchTerm);
    
    // تعديل: مطابقة تامة لرقم المستند
    const matchDoc = searchDocNum.trim() ? (emp.documentNumber === searchDocNum.trim()) : true;
    return matchGeneral && matchDoc;
  });

  const payroll = selectedEmp 
    ? calculateSalary(selectedEmp, [], reviews, [], 0, 0, 0, [], { forceFullMonth: true })
    : null;

  const getMaritalLabel = (status?: string) => {
      switch(status) {
          case 'single': return 'أعزب / عزباء';
          case 'married': return 'متزوج / متزوجة';
          case 'divorced': return 'مطلق / مطلقة';
          case 'widowed': return 'أرمل / أرملة';
          default: return 'غير محدد';
      }
  };

  const getMilitaryLabel = (status?: string) => {
      switch(status) {
          case 'completed': return 'مؤدي الخدمة';
          case 'exempt': return 'إعفاء نهائي';
          case 'postponed': return 'مؤجل';
          case 'none': return 'غير مطلوب';
          default: return 'غير محدد';
      }
  };

  const getEducationLabel = (level?: string) => {
      switch(level) {
          case 'phd': return 'دكتوراه';
          case 'master': return 'ماجستير';
          case 'diploma': return 'دبلوم';
          case 'institute_high': return 'معهد عالي';
          case 'institute_mid': return 'معهد متوسط';
          case 'technical_diploma': return 'دبلوم فني';
          case 'prep': return 'إعدادية';
          default: return 'مؤهل عالي';
      }
  };

  const calculateAge = (nid: string) => {
      if (!nid || nid.length !== 14) return 'غير محدد';
      const centuryCode = nid[0];
      const yearPart = nid.substring(1, 3);
      const monthPart = nid.substring(3, 5);
      const dayPart = nid.substring(5, 7);
      let fullYear = (centuryCode === '2') ? '19' + yearPart : '20' + yearPart;
      const birthDate = new Date(`${fullYear}-${monthPart}-${dayPart}`);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return `${age} سنة`;
  };

  const printStatement = () => {
      if (!selectedEmp) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const gradeInfo = JOB_GRADES.find(g => g.id === selectedEmp.grade);
      const payrollData = calculateSalary(selectedEmp, [], reviews, [], 0, 0, 0, [], { forceFullMonth: true });
      const educationIncentive = payrollData.educationExperienceBonus > 0 ? (selectedEmp.educationLevel === 'phd' || selectedEmp.educationLevel === 'master' ? 'تميز علمي' : 'علاوة مؤهل') : 'لا يوجد';
      const empPenalty = penalties[selectedEmp.id] || 0;
      const content = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><title>بيان حالة - ${selectedEmp.name}</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"><style>@page { size: A4; margin: 10mm; } body { font-family: 'Cairo', sans-serif; padding: 10px; color: #000; } .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #064e3b; padding-bottom: 10px; margin-bottom: 20px; } table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; } th, td { border: 1px solid #000; padding: 6px; text-align: right; } th { background-color: #f0fdf4; font-weight: bold; } </style></head><body><div class="header"><div><img src="/logo.png" style="height: 120px;" /></div><div style="text-align:center;"><h2>نقابة المهندسين بأسيوط</h2><h3>بيان حالة وظيفية</h3><p>تحريراً في: ${new Date().toLocaleDateString('ar-EG')}</p></div><div style="width:120px;"></div></div><h3>أولاً: البيانات الشخصية</h3><table><tr><th>الاسم</th><td>${selectedEmp.name}</td><th>الرقم القومي</th><td>${selectedEmp.nationalId}</td></tr><tr><th>تاريخ التعيين</th><td>${selectedEmp.joinDate}</td><th>التأمين</th><td>${selectedEmp.insuranceNumber || '-'}</td></tr><tr><th>العنوان</th><td>${selectedEmp.address || '-'}</td><th>الهاتف</th><td>${selectedEmp.phone}</td></tr></table><h3>ثانياً: المؤهلات والدرجة</h3><table><tr><th>المؤهل</th><td>${getEducationLabel(selectedEmp.educationLevel)}</td><th>الإدارة</th><td>${selectedEmp.department}</td></tr><tr><th>الوظيفة</th><td>${selectedEmp.position}</td><th>الدرجة</th><td>${gradeInfo ? gradeInfo.name : '-'}</td></tr></table></body></html>`;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="mb-8"><h2 className="text-3xl font-bold text-emerald-900">بيان الحالة الوظيفية</h2><p className="text-emerald-600 mt-1">استخراج تقرير تفصيلي ببيانات الموظف الشخصية والمالية</p></div>
      <div className="flex gap-6 h-[calc(100vh-200px)]">
          <div className="w-1/3 bg-white rounded-xl shadow-sm border border-emerald-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-emerald-100 bg-emerald-50/50 space-y-3">
                  <div className="relative"><Search className="absolute right-3 top-3 text-emerald-400" size={18} /><input type="text" placeholder="بحث بالاسم..." className="w-full pl-4 pr-10 py-2 border border-emerald-200 rounded-lg outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                  <div className="relative"><FileText className="absolute right-3 top-3 text-emerald-400" size={18} /><input type="text" placeholder="رقم المستند" className="w-full pl-4 pr-10 py-2 border border-emerald-200 rounded-lg outline-none font-mono" value={searchDocNum} onChange={(e) => setSearchDocNum(e.target.value)} /></div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredEmployees.map(emp => (
                      <button key={emp.id} onClick={() => setSelectedEmp(emp)} className={`w-full text-right p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedEmp?.id === emp.id ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-emerald-50 text-slate-700'}`}><div className="w-8 h-8 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold">{emp.name.charAt(0)}</div><div className="flex-1"><p className="text-sm truncate">{emp.name}</p><p className="text-[10px] opacity-70">{emp.position}</p></div></button>
                  ))}
              </div>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-emerald-100 p-8 overflow-y-auto">
              {selectedEmp ? (
                  <div className="animate-fade-in"><div className="flex justify-between items-start mb-6 border-b border-emerald-100 pb-4"><div className="flex items-center gap-4"><div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-bold">{selectedEmp.name.charAt(0)}</div><div><h2 className="text-2xl font-bold text-emerald-900">{selectedEmp.name}</h2><p className="text-emerald-600">{selectedEmp.position}</p></div></div><button onClick={printStatement} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow-md"><Printer size={20} /> طباعة</button></div>
                      <div className="space-y-6">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><User size={18} /> البيانات الشخصية</h4><div className="grid grid-cols-2 gap-y-3 text-sm"><div className="flex justify-between border-b pb-1"><span className="text-slate-500">الرقم القومي</span><span className="font-bold">{selectedEmp.nationalId}</span></div><div className="flex justify-between border-b pb-1"><span className="text-slate-500">رقم المستند</span><span className="font-bold">{selectedEmp.documentNumber || '-'}</span></div></div></div>
                      </div>
                  </div>
              ) : (<div className="h-full flex flex-col items-center justify-center text-slate-400"><FileBadge size={64} className="mb-4 text-emerald-100" /><p className="text-lg font-medium text-emerald-800">اختر موظفاً لعرض بيان الحالة</p></div>)}
          </div>
      </div>
    </div>
  );
};
