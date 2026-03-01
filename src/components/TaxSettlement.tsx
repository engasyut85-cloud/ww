
import React, { useState } from 'react';
import { Employee, BonusRecord, PerformanceReview, TaxDebt } from '../types';
import { calculateSalary, calculateTaxFromBrackets } from '../utils/payrollLogic';
import { Search, Calculator, ArrowDown, ArrowUp, AlertCircle, Printer, Scale, CheckSquare, Save, Lock, Calendar, FileText } from 'lucide-react';

interface TaxSettlementProps {
  employees: Employee[];
  bonuses: BonusRecord[];
  reviews: PerformanceReview[];
  taxDebts: TaxDebt[];
  setTaxDebts: (debts: TaxDebt[]) => void;
}

export const TaxSettlement: React.FC<TaxSettlementProps> = ({ employees, bonuses, reviews, taxDebts, setTaxDebts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDocNum, setSearchDocNum] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const installmentMonths = 12;

  const filteredEmployees = employees.filter(emp => {
    const matchGeneral = emp.name.includes(searchTerm) || emp.nationalId.includes(searchTerm);
    
    // تعديل: مطابقة تامة لرقم المستند
    const matchDoc = searchDocNum.trim() ? (emp.documentNumber === searchDocNum.trim()) : true;
    return matchGeneral && matchDoc;
  });

  const safe = (val: any) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
  };

  const getExistingDebt = (empId: string) => {
      return taxDebts.find(d => 
          String(d.employeeId) === String(empId) && 
          d.year === year && 
          d.remainingAmount > 0
      );
  };

  const existingDebt = selectedEmp ? getExistingDebt(selectedEmp.id) : null;

  const calculateSettlement = (emp: Employee) => {
      const joinDate = new Date(emp.joinDate);
      let monthsWorked = 12;
      let startMonthName = "يناير";

      if (joinDate.getFullYear() === year) {
          const joinMonthIndex = joinDate.getMonth();
          monthsWorked = 12 - joinMonthIndex;
          startMonthName = joinDate.toLocaleString('ar-EG', { month: 'long' });
      } else if (joinDate.getFullYear() > year) {
          monthsWorked = 0;
      }

      monthsWorked = Math.max(0, Math.min(12, monthsWorked));
      if (monthsWorked <= 0) return null;

      const monthlyPayroll = calculateSalary(emp, [], reviews, [], 0, 0, 0, [], { forceFullMonth: true });
      const annualRegularGross = (safe(monthlyPayroll.insurableWage) + safe(monthlyPayroll.cashAllowance)) * monthsWorked;
      const annualBonuses = bonuses
        .filter(b => String(b.employeeId) === String(emp.id) && new Date(b.date).getFullYear() === year)
        .reduce((sum, b) => sum + safe(b.grossAmount || b.amount), 0);

      const totalAnnualGross = annualRegularGross + annualBonuses;
      const annualInsurance = safe(monthlyPayroll.insuranceEmployeeShare) * monthsWorked;
      const annualPayrollStamp = safe(monthlyPayroll.stampDuty) * monthsWorked;
      const annualBonusStamp = bonuses
        .filter(b => String(b.employeeId) === String(emp.id) && new Date(b.date).getFullYear() === year)
        .reduce((sum, b) => sum + safe(b.stampAmount), 0);
      const annualStamp = annualPayrollStamp + annualBonusStamp;
      const annualFellowship = safe(monthlyPayroll.fellowshipFund) * monthsWorked;
      const baseExemption = 20000;
      const exemptionLimit = emp.isSpecialNeeds ? (baseExemption * 1.5) : baseExemption;
      const personalExemption = exemptionLimit * (monthsWorked / 12);
      const totalExemptions = annualInsurance + annualStamp + annualFellowship + personalExemption;
      let rawAnnualTaxableIncome = Math.max(0, totalAnnualGross - totalExemptions);
      const annualTaxableIncome = Math.floor(rawAnnualTaxableIncome / 10) * 10;

      let correctAnnualTax = (emp.taxCalculationMethod === 'manual' && emp.manualTaxRate) 
        ? Math.max(0, annualTaxableIncome * (emp.manualTaxRate / 100))
        : calculateTaxFromBrackets(annualTaxableIncome);

      const projectedPayrollTaxPaid = safe(monthlyPayroll.taxDeduction) * monthsWorked;
      const actualBonusTaxPaid = bonuses
        .filter(b => String(b.employeeId) === String(emp.id) && new Date(b.date).getFullYear() === year)
        .reduce((sum, b) => sum + safe(b.taxAmount), 0);
      const totalTaxPaid = projectedPayrollTaxPaid + actualBonusTaxPaid;

      const diff = safe(correctAnnualTax - totalTaxPaid);
      let monthlyAdjustment = (diff > 0) ? Math.ceil((diff / installmentMonths) * 100) / 100 : 0;

      return { monthsWorked, startMonthName, annualRegularGross, annualBonuses, totalAnnualGross, annualInsurance, annualStamp, annualFellowship, personalExemption, totalExemptions, annualTaxableIncome, correctAnnualTax, totalTaxPaid, diff, monthlyAdjustment };
  };

  const settlement = selectedEmp ? calculateSettlement(selectedEmp) : null;

  const handleSaveDebt = () => {
      if (!selectedEmp) return;
      const calcs = calculateSettlement(selectedEmp);
      if (!calcs || calcs.diff <= 0.01) { alert('⚠️ لا توجد مديونية.'); return; }
      if (getExistingDebt(selectedEmp.id)) { alert('⚠️ مديونية معتمدة بالفعل.'); return; }
      const installmentAmount = calcs.monthlyAdjustment;
      const confirmed = window.confirm(`تأكيد اعتماد مديونية: ${calcs.diff.toLocaleString()} ج.م؟`);
      if (confirmed) {
          const newDebt: TaxDebt = { id: `TAX-${Date.now()}`, employeeId: selectedEmp.id, year, totalAmount: parseFloat(calcs.diff.toFixed(2)), remainingAmount: parseFloat(calcs.diff.toFixed(2)), monthlyInstallment: installmentAmount, createdAt: new Date().toISOString() };
          setTaxDebts([...taxDebts, newDebt]);
          alert('✅ تم الاعتماد.');
          setSelectedEmp({...selectedEmp}); 
      }
  };

  const printReport = () => {
      if (!selectedEmp || !settlement) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const displayInstallment = existingDebt ? existingDebt.monthlyInstallment : settlement.monthlyAdjustment;
      const content = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><title>تسوية ضريبية</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"><style>@page { size: A4; margin: 10mm; } body { font-family: 'Cairo', sans-serif; padding: 10px; color: #000; } table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; } th, td { border: 1px solid #000; padding: 6px; } th { background-color: #f1f5f9; } </style></head><body><h2>نقابة المهندسين بأسيوط</h2><h3>تقرير تسوية ${year}</h3><p>الموظف: ${selectedEmp.name} | رقم المستند: ${selectedEmp.documentNumber || '-'}</p><table><tr><th>الضريبة المستحقة</th><td>${fmt(settlement.correctAnnualTax)}</td></tr><tr><th>المسدد</th><td>${fmt(settlement.totalTaxPaid)}</td></tr><tr style="background:#fef2f2"><th>الفرق (مديونية)</th><td>${fmt(settlement.diff)}</td></tr></table></body></html>`;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="mb-8"><h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3"><Scale className="text-emerald-600" size={32} /> التسوية الضريبية السنوية</h2><p className="text-emerald-600 mt-1">احتساب الفروق الضريبية وتحديد المستحقات والمديونيات</p></div>
      <div className="flex gap-6 h-[calc(100vh-200px)]">
          <div className="w-1/3 bg-white rounded-xl shadow-sm border border-emerald-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-emerald-100 bg-emerald-50/50 space-y-3">
                  <div className="flex items-center bg-white p-2 rounded border border-emerald-200"><Calendar size={16} className="text-emerald-500 ml-2" /><span className="text-sm font-bold text-slate-700 ml-2">سنة التسوية:</span><select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-transparent font-bold outline-none text-emerald-800"><option value={2023}>2023</option><option value={2024}>2024</option><option value={2025}>2025</option></select></div>
                  <div className="relative"><Search className="absolute right-3 top-2.5 text-emerald-400" size={18} /><input type="text" placeholder="بحث بالاسم..." className="w-full pl-4 pr-10 py-2 border rounded-lg outline-none text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                  <div className="relative"><FileText className="absolute right-3 top-2.5 text-emerald-400" size={16} /><input type="text" placeholder="رقم المستند" className="w-full pl-4 pr-10 py-2 border rounded-lg outline-none text-sm font-mono" value={searchDocNum} onChange={(e) => setSearchDocNum(e.target.value)} /></div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredEmployees.map(emp => (<button key={emp.id} onClick={() => setSelectedEmp(emp)} className={`w-full text-right p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedEmp?.id === emp.id ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-emerald-50 text-slate-700'}`}><div className="w-8 h-8 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold">{emp.name.charAt(0)}</div><div className="flex-1"><p className="text-sm truncate">{emp.name}</p></div></button>))}
              </div>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-emerald-100 p-8 overflow-y-auto text-right">
              {selectedEmp ? (settlement ? (<div className="animate-fade-in space-y-6"><div className="flex justify-between items-start border-b border-emerald-100 pb-4"><div className="text-right"><h3 className="text-xl font-bold text-emerald-900">{selectedEmp.name}</h3><p className="text-sm text-slate-500">{selectedEmp.position}</p></div><div className="flex gap-2">{settlement.diff > 0.01 && !existingDebt && (<button onClick={handleSaveDebt} className="bg-emerald-800 text-white px-4 py-2 rounded-lg font-bold shadow-md">اعتماد المديونية</button>)}<button onClick={printReport} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-md">طبع تقرير</button></div></div>{existingDebt && (<div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded text-blue-900 font-bold">تم الاعتماد. المتبقي: {existingDebt.remainingAmount.toLocaleString()} ج.م</div>)}
              <div className="bg-white border border-emerald-100 rounded-xl overflow-hidden"><table className="w-full text-sm"><tbody><tr className="bg-emerald-50"><td className="p-3 font-bold text-emerald-800" colSpan={2}>نتائج التسوية</td></tr><tr><td className="p-3">الضريبة المستحقة</td><td className="p-3 font-bold text-left">{settlement.correctAnnualTax.toLocaleString()}</td></tr><tr><td className="p-3">المسدد</td><td className="p-3 font-bold text-left text-slate-500">({settlement.totalTaxPaid.toLocaleString()})</td></tr><tr className={`font-bold text-lg ${settlement.diff > 0.01 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}><td className="p-4 flex items-center gap-2">{settlement.diff > 0.01 ? <ArrowDown size={20} /> : <CheckSquare size={20} />} {settlement.diff > 0.01 ? 'مديونية مستحقة' : 'لا توجد فروق'}</td><td className="p-4 text-left font-mono">{Math.abs(settlement.diff).toLocaleString()} ج.م</td></tr></tbody></table></div></div>) : (<div className="h-full flex flex-col items-center justify-center"><p>بيانات غير متاحة</p></div>)) : (<div className="h-full flex flex-col items-center justify-center text-slate-400"><Calculator size={64} className="mb-4 text-emerald-100" /><p className="text-lg font-medium text-emerald-800">اختر موظفاً لبدء التسوية</p></div>)}
          </div>
      </div>
    </div>
  );
};
