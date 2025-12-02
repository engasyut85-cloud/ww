import React, { useState } from 'react';
import { Employee, BonusRecord, PerformanceReview, TaxDebt } from '../types';
import { calculateSalary, calculateTaxFromBrackets } from '../utils/payrollLogic';
import { Search, Calculator, ArrowDown, ArrowUp, AlertCircle, Printer, Scale, CheckSquare, Save, Lock, Calendar } from 'lucide-react';

interface TaxSettlementProps {
  employees: Employee[];
  bonuses: BonusRecord[];
  reviews: PerformanceReview[];
  taxDebts: TaxDebt[];
  setTaxDebts: (debts: TaxDebt[]) => void;
}

export const TaxSettlement: React.FC<TaxSettlementProps> = ({ employees, bonuses, reviews, taxDebts, setTaxDebts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  
  // Fixed to 12 months as requested
  const installmentMonths = 12;

  const filteredEmployees = employees.filter(emp => 
    emp.name.includes(searchTerm) || emp.nationalId.includes(searchTerm)
  );

  // Helper to ensure numbers are valid (Safe Math)
  const safe = (val: any) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
  };

  // Helper to find existing debt for the current view
  const getExistingDebt = (empId: string) => {
      return taxDebts.find(d => 
          String(d.employeeId) === String(empId) && 
          d.year === year && 
          d.remainingAmount > 0
      );
  };

  const existingDebt = selectedEmp ? getExistingDebt(selectedEmp.id) : null;

  const calculateSettlement = (emp: Employee) => {
      // --- 1. Determine Eligible Months (Based on Join Date) ---
      const joinDate = new Date(emp.joinDate);
      let monthsWorked = 12;
      let startMonthName = "يناير";

      if (joinDate.getFullYear() === year) {
          const joinMonthIndex = joinDate.getMonth(); // 0-11
          // If joined in Sept (index 8), worked months = 12 - 8 = 4 (Sept, Oct, Nov, Dec)
          monthsWorked = 12 - joinMonthIndex;
          startMonthName = joinDate.toLocaleString('ar-EG', { month: 'long' });
      } else if (joinDate.getFullYear() > year) {
          monthsWorked = 0;
      }

      // Safety check
      monthsWorked = Math.max(0, Math.min(12, monthsWorked));

      if (monthsWorked <= 0) {
          return null;
      }

      // --- 2. Annualized REGULAR Income ---
      const monthlyPayroll = calculateSalary(emp, [], reviews);
      
      // Safe extraction of values
      const monthlyGrossTotal = safe(monthlyPayroll.grossTotal);
      const monthlySyndicateShare = safe(monthlyPayroll.syndicateSocialShare);
      
      // Taxable Gross = Gross - Syndicate Share (Employer Share shouldn't be taxed on employee)
      const monthlyGrossTaxable = monthlyGrossTotal - monthlySyndicateShare; 
      const annualRegularGross = monthlyGrossTaxable * monthsWorked;

      // --- 3. Annual VARIABLE Income (Bonuses & Grants) ---
      const annualBonuses = bonuses
        .filter(b => String(b.employeeId) === String(emp.id) && new Date(b.date).getFullYear() === year)
        .reduce((sum, b) => sum + safe(b.grossAmount || b.amount), 0);

      const totalAnnualGross = annualRegularGross + annualBonuses;

      // --- 4. Annual Deductions ---
      const annualInsurance = safe(monthlyPayroll.insuranceEmployeeShare) * monthsWorked;
      
      const annualPayrollStamp = safe(monthlyPayroll.stampDuty) * monthsWorked;
      const annualBonusStamp = bonuses
        .filter(b => String(b.employeeId) === String(emp.id) && new Date(b.date).getFullYear() === year)
        .reduce((sum, b) => sum + safe(b.stampAmount), 0);
      const annualStamp = annualPayrollStamp + annualBonusStamp;

      const annualFellowship = safe(monthlyPayroll.fellowshipFund) * monthsWorked;

      // --- 5. Personal Exemption ---
      // Apply 50% increase if special needs
      const baseExemption = 20000;
      const exemptionLimit = emp.isSpecialNeeds ? (baseExemption * 1.5) : baseExemption;
      
      // Prorate exemption based on months worked
      const personalExemption = exemptionLimit * (monthsWorked / 12);

      // --- 6. Net Taxable Base ---
      const totalExemptions = annualInsurance + annualStamp + annualFellowship + personalExemption;
      
      // Raw Taxable Income
      let rawAnnualTaxableIncome = Math.max(0, totalAnnualGross - totalExemptions);
      
      // LEGAL RULE: Round down to nearest 10 EGP
      const annualTaxableIncome = Math.floor(rawAnnualTaxableIncome / 10) * 10;

      // --- 7. Calculate CORRECT Tax ---
      const correctAnnualTax = calculateTaxFromBrackets(annualTaxableIncome);

      // --- 8. Actual Tax Paid ---
      const projectedPayrollTaxPaid = safe(monthlyPayroll.taxDeduction) * monthsWorked;
      const actualBonusTaxPaid = bonuses
        .filter(b => String(b.employeeId) === String(emp.id) && new Date(b.date).getFullYear() === year)
        .reduce((sum, b) => sum + safe(b.taxAmount), 0);

      const totalTaxPaid = projectedPayrollTaxPaid + actualBonusTaxPaid;

      // --- 9. The Difference ---
      const diff = safe(correctAnnualTax - totalTaxPaid);
      
      // --- 10. Installment Logic (Round UP to nearest 0.01) ---
      let monthlyAdjustment = 0;
      if (diff > 0) {
          monthlyAdjustment = Math.ceil((diff / installmentMonths) * 100) / 100;
      }

      return {
          monthsWorked, startMonthName, 
          annualRegularGross: safe(annualRegularGross), 
          annualBonuses: safe(annualBonuses), 
          totalAnnualGross: safe(totalAnnualGross),
          annualInsurance: safe(annualInsurance), 
          annualStamp: safe(annualStamp), 
          annualFellowship: safe(annualFellowship), 
          personalExemption: safe(personalExemption), 
          totalExemptions: safe(totalExemptions),
          annualTaxableIncome: safe(annualTaxableIncome), 
          correctAnnualTax: safe(correctAnnualTax), 
          totalTaxPaid: safe(totalTaxPaid), 
          diff: safe(diff), 
          monthlyAdjustment: safe(monthlyAdjustment)
      };
  };

  const settlement = selectedEmp ? calculateSettlement(selectedEmp) : null;

  const handleSaveDebt = () => {
      if (!selectedEmp) return;
      
      // Re-calculate to be 100% sure
      const calcs = calculateSettlement(selectedEmp);

      if (!calcs || calcs.diff <= 0.01) { // Ignore extremely small debts
          alert('⚠️ قيمة المديونية صغيرة جداً أو لا توجد مديونية مستحقة.');
          return;
      }

      // Check duplicate
      if (getExistingDebt(selectedEmp.id)) {
          alert('⚠️ هذا الموظف لديه بالفعل مديونية معتمدة وجاري خصمها.');
          return;
      }

      // Use the ROUNDED UP installment
      const installmentAmount = calcs.monthlyAdjustment;
      
      const confirmed = window.confirm(
          `تأكيد اعتماد التسوية:\n` +
          `---------------------\n` +
          `إجمالي الفرق المستحق: ${calcs.diff.toLocaleString()} ج.م\n` +
          `سيتم خصم قسط شهري قدره: ${installmentAmount} ج.م\n` +
          `لمدة 12 شهر.\n\n` +
          `هل أنت متأكد؟ سيظهر الخصم فوراً في استمارة 132.`
      );

      if (confirmed) {
          const newDebt: TaxDebt = {
              id: `TAX-${Date.now()}`,
              employeeId: selectedEmp.id,
              year: year,
              totalAmount: parseFloat(calcs.diff.toFixed(2)),
              remainingAmount: parseFloat(calcs.diff.toFixed(2)),
              monthlyInstallment: installmentAmount,
              createdAt: new Date().toISOString()
          };

          // Functional update to ensure state consistency
          setTaxDebts([...taxDebts, newDebt]);
          
          alert('✅ تم الاعتماد بنجاح!\nيمكنك الآن مراجعة استمارة 132 للتأكد من نزول الخصم.');
          
          // Force UI refresh logic is handled by React state change
          setSelectedEmp({...selectedEmp}); 
      }
  };

  const printReport = () => {
      if (!selectedEmp || !settlement) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const displayInstallment = existingDebt ? existingDebt.monthlyInstallment : settlement.monthlyAdjustment;
      const isOfficial = !!existingDebt;

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>التسوية الضريبية - ${selectedEmp.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; padding: 10px; background: white; color: #000; zoom: 85%; }
                .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #064e3b; padding-bottom: 5px; margin-bottom: 15px; }
                .header-text { text-align: center; flex: 1; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 4px 8px; }
                th { background-color: #f1f5f9; text-align: right; width: 60%; font-weight: bold; }
                .val-cell { font-family: monospace; font-weight: bold; text-align: left; direction: ltr; width: 40%; }
                .result-box { text-align: center; padding: 10px; border: 2px solid #000; font-weight: bold; font-size: 16px; margin-top: 15px; background: #fff; }
                .debt { border-color: #b91c1c; color: #b91c1c; background: #fef2f2; }
                .credit { border-color: #047857; color: #047857; background: #ecfdf5; }
                .installment-box { margin-top: 15px; padding: 10px; border: 1px dashed #666; background: #fafafa; font-size: 12px; }
                .stamp { border: 3px solid #b91c1c; color: #b91c1c; padding: 5px 15px; border-radius: 5px; display: inline-block; transform: rotate(-10deg); font-size: 18px; position: absolute; top: 130px; left: 20px; opacity: 0.8; }
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">🖨️ طباعة التقرير</button>
            ${isOfficial ? '<div class="stamp">معتمد - جاري الخصم</div>' : ''}
            <div class="header-container">
                <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 100px;" /></div>
                <div class="header-text">
                    <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                    <h3>تقرير التسوية الضريبية السنوي</h3>
                    <p style="font-size:12px;">عن فترة: ${settlement.monthsWorked} شهر (بداية من ${settlement.startMonthName} ${year})</p>
                </div>
                <div style="width: 100px;"></div>
            </div>
            
            <h3>أولاً: بيانات الموظف</h3>
            <table>
                <tr><th>الاسم</th><td>${selectedEmp.name}</td></tr>
                <tr><th>الرقم القومي</th><td>${selectedEmp.nationalId}</td></tr>
                <tr><th>الوظيفة / القسم</th><td>${selectedEmp.position} / ${selectedEmp.department}</td></tr>
            </table>

            <h3>ثانياً: الوعاء الضريبي</h3>
            <table>
                <tr><th>إجمالي الدخل السنوي (Gross)</th><td class="val-cell">${fmt(settlement.totalAnnualGross)}</td></tr>
                <tr><th>إجمالي الإعفاءات والاستقطاعات</th><td class="val-cell">${fmt(settlement.totalExemptions)}</td></tr>
                <tr style="background:#e0f2fe"><th>الوعاء الخاضع للضريبة (بعد التقريب)</th><td class="val-cell">${fmt(settlement.annualTaxableIncome)}</td></tr>
            </table>

            <h3>ثالثاً: الفروق المستحقة</h3>
            <table>
                <tr><th>الضريبة المستحقة سنوياً</th><td class="val-cell">${fmt(settlement.correctAnnualTax)}</td></tr>
                <tr><th>ما تم سداده فعلياً</th><td class="val-cell">${fmt(settlement.totalTaxPaid)}</td></tr>
            </table>

            <div class="result-box ${settlement.diff > 0 ? 'debt' : settlement.diff < 0 ? 'credit' : ''}">
                ${settlement.diff > 0 ? `مديونية مستحقة: ${fmt(settlement.diff)} ج.م` : settlement.diff < 0 ? `استرداد: ${fmt(Math.abs(settlement.diff))} ج.م` : 'لا توجد فروق'}
            </div>

            ${settlement.diff > 0 ? `
                <div class="installment-box">
                    <strong>آلية السداد:</strong><br>
                    يتم خصم قسط شهري قدره <strong>${displayInstallment} ج.م</strong> من الراتب لمدة 12 شهر.
                </div>
            ` : ''}
        </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <Scale className="text-emerald-600" size={32} />
            التسوية الضريبية السنوية
        </h2>
        <p className="text-emerald-600 mt-1">احتساب الفروق الضريبية وتحديد المستحقات والمديونيات (طبقاً لقانون 7 لسنة 2024)</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* List */}
          <div className="w-1/3 bg-white rounded-xl shadow-sm border border-emerald-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-emerald-100 bg-emerald-50/50">
                  {/* Year Selector */}
                  <div className="mb-3 flex items-center bg-white p-2 rounded border border-emerald-200">
                      <Calendar size={16} className="text-emerald-500 ml-2" />
                      <span className="text-sm font-bold text-slate-700 ml-2">سنة التسوية:</span>
                      <select 
                        value={year} 
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-transparent font-bold outline-none text-emerald-800"
                      >
                          <option value={2023}>2023</option>
                          <option value={2024}>2024</option>
                          <option value={2025}>2025</option>
                      </select>
                  </div>

                  <div className="relative">
                      <Search className="absolute right-3 top-3 text-emerald-400" size={18} />
                      <input type="text" placeholder="بحث عن موظف..." className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredEmployees.map(emp => (
                      <button key={emp.id} onClick={() => setSelectedEmp(emp)} className={`w-full text-right p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedEmp?.id === emp.id ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-emerald-50 text-slate-700'}`}>
                          <div className="w-8 h-8 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold">{emp.name.charAt(0)}</div>
                          <div className="flex-1"><p className="text-sm truncate">{emp.name}</p></div>
                      </button>
                  ))}
              </div>
          </div>

          {/* Details */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-emerald-100 p-8 overflow-y-auto">
              {selectedEmp ? (
                  settlement ? (
                  <div className="animate-fade-in space-y-6">
                      <div className="flex justify-between items-start border-b border-emerald-100 pb-4">
                          <div>
                              <h3 className="text-xl font-bold text-emerald-900">{selectedEmp.name}</h3>
                              <p className="text-sm text-slate-500">{selectedEmp.position} - {selectedEmp.department}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                  <span>تاريخ التعيين: {selectedEmp.joinDate}</span>
                                  <span>•</span>
                                  <span>مدة التسوية: {settlement.monthsWorked} شهر</span>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              {settlement.diff > 0.01 && (
                                  existingDebt ? (
                                      <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold border border-blue-200 cursor-default">
                                          <Lock size={18} /> تم الاعتماد (جاري الخصم)
                                      </div>
                                  ) : (
                                      <button type="button" onClick={handleSaveDebt} className="bg-emerald-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-900 shadow-md transition-colors animate-pulse">
                                          <Save size={18} /> اعتماد المديونية وبدء الخصم
                                      </button>
                                  )
                              )}
                              <button onClick={printReport} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-md">
                                  <Printer size={18} /> طباعة التقرير
                              </button>
                          </div>
                      </div>

                      {existingDebt && (
                          <div className="bg-blue-100 border-r-4 border-blue-500 p-4 rounded text-blue-900 font-bold flex items-center gap-3">
                              <CheckSquare className="text-blue-600" />
                              <div>
                                  <p>هذا الموظف لديه تسوية معتمدة بالفعل لعام {year}.</p>
                                  <p className="text-sm font-normal mt-1">القسط الشهري: {existingDebt.monthlyInstallment} جنيه | المتبقي: {existingDebt.remainingAmount.toLocaleString()} جنيه.</p>
                              </div>
                          </div>
                      )}

                      <div className="bg-white border border-emerald-100 rounded-xl overflow-hidden">
                          <table className="w-full text-sm">
                              <tbody>
                                  <tr className="bg-emerald-50 border-b border-emerald-100"><td className="p-3 font-bold text-emerald-800" colSpan={2}>احتساب الفروق الضريبية</td></tr>
                                  <tr className="border-b border-slate-100"><td className="p-3 text-slate-600">الضريبة المستحقة (سنوياً)</td><td className="p-3 font-mono font-bold text-right">{settlement.correctAnnualTax.toLocaleString()}</td></tr>
                                  <tr className="border-b border-slate-100"><td className="p-3 text-slate-600">ما تم سداده</td><td className="p-3 font-mono font-bold text-right text-slate-500">({settlement.totalTaxPaid.toLocaleString()})</td></tr>
                                  <tr className={`font-bold text-lg ${settlement.diff > 0.01 ? 'bg-red-50 text-red-700' : settlement.diff < -0.01 ? 'bg-green-50 text-green-700' : ''}`}>
                                      <td className="p-4 flex items-center gap-2">
                                          {settlement.diff > 0.01 ? <ArrowDown size={20} /> : settlement.diff < -0.01 ? <ArrowUp size={20} /> : <CheckSquare size={20} />} 
                                          {settlement.diff > 0.01 ? 'مستحق على الموظف (مديونية)' : settlement.diff < -0.01 ? 'مستحق للموظف (استرداد)' : 'تمت التسوية (لا توجد فروق)'}
                                      </td>
                                      <td className="p-4 text-right font-mono">{Math.abs(settlement.diff).toLocaleString()} ج.م</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>

                      {settlement.diff > 0.01 && !existingDebt && (
                          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col gap-3 animate-fade-in">
                              <div className="flex items-center gap-2"><AlertCircle className="text-amber-600 flex-shrink-0" /><h4 className="font-bold text-amber-800">تفاصيل السداد (قبل الاعتماد)</h4></div>
                              <div className="mt-2 bg-white p-3 rounded border border-amber-200 text-sm">
                                  قيمة القسط الشهري المقترح: <span className="font-mono font-bold text-lg text-amber-700 mx-2">{settlement.monthlyAdjustment} ج.م</span> لمدة 12 شهر.
                              </div>
                          </div>
                      )}
                  </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                          <AlertCircle size={64} className="mb-4 text-amber-200" />
                          <p className="text-lg font-medium text-slate-600">لا توجد فترة عمل مؤهلة في سنة {year}</p>
                          <p className="text-sm text-slate-400">تاريخ التعيين بعد سنة التسوية</p>
                      </div>
                  )
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400"><Calculator size={64} className="mb-4 text-emerald-100" /><p className="text-lg font-medium text-emerald-800">اختر موظفاً لبدء التسوية</p></div>
              )}
          </div>
      </div>
    </div>
  );
};