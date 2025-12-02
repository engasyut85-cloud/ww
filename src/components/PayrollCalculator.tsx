
import React, { useState, useMemo } from 'react';
import { Employee, PayrollSlip, Loan, PerformanceReview, BonusRecord, TaxDebt } from '../types';
import { calculateSalary } from '../utils/payrollLogic';
import { Printer, FileText, FileSpreadsheet, CheckSquare, Square, Filter, ShieldCheck } from 'lucide-react';
import { EMPLOYMENT_CATEGORIES, MAX_INSURANCE_SALARY, MIN_INSURANCE_SALARY } from '../constants';

interface PayrollCalculatorProps {
  employees: Employee[];
  loans: Loan[];
  reviews: PerformanceReview[];
  penalties: Record<string, number>;
  setPenalties: (penalties: Record<string, number>) => void;
  bonuses: BonusRecord[];
  taxDebts: TaxDebt[];
}

export const PayrollCalculator: React.FC<PayrollCalculatorProps> = ({ employees, loans, reviews, penalties, setPenalties, bonuses, taxDebts }) => {
  const [incentives, setIncentives] = useState<Record<string, number>>({});
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleCalcChange = (id: string, type: 'incentive' | 'penalty', value: string) => {
      const numVal = parseFloat(value) || 0;
      if (type === 'incentive') setIncentives({ ...incentives, [id]: numVal });
      else setPenalties({ ...penalties, [id]: numVal });
  };

  const allPayrolls: PayrollSlip[] = useMemo(() => {
    return employees.map(emp => 
        calculateSalary(emp, loans, reviews, bonuses, incentives[emp.id] || 0, penalties[emp.id] || 0, 0, taxDebts)
    );
  }, [employees, loans, reviews, incentives, penalties, bonuses, taxDebts]);

  const filteredPayrolls = useMemo(() => {
      return allPayrolls.filter(p => {
          const emp = employees.find(e => e.id === p.employeeId);
          if (!emp) return false;
          const matchDept = selectedDept === 'all' || emp.department === selectedDept;
          const matchCat = selectedCategory === 'all' || emp.employmentCategory === selectedCategory;
          return matchDept && matchCat;
      });
  }, [allPayrolls, selectedDept, selectedCategory, employees]);

  const totalNet = filteredPayrolls.reduce((acc, p) => acc + p.netSalary, 0);

  const toggleSelectAll = () => {
      if (selectedIds.length === filteredPayrolls.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(filteredPayrolls.map(p => p.employeeId));
      }
  };

  const toggleSelectOne = (id: string) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(sid => sid !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  const printSimplePayslip = (slip: PayrollSlip) => {
    const employee = employees.find(e => e.id === slip.employeeId);
    if (!employee) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Net Salary calculation balance for display
    const totalDeductions = slip.grossTotal - slip.netSalary;

    const content = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <title>مفردات مرتب - ${employee.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
          <style>
              @page { size: A4; margin: 5mm; }
              body { font-family: 'Cairo', sans-serif; padding: 10px; background: white; -webkit-print-color-adjust: exact; color: #000; zoom: 80%; }
              .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
              .header-text { text-align: center; flex: 1; }
              h2 { margin: 0; font-size: 22px; color: #064e3b; }
              h3 { margin: 5px 0; font-size: 18px; }
              p { margin: 0; font-size: 14px; }
              .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px; border: 1px solid #000; padding: 10px; border-radius: 8px; font-size: 14px; }
              .tables-container { display: flex; gap: 15px; align-items: flex-start; }
              table { width: 100%; border-collapse: collapse; font-size: 13px; }
              th, td { border: 1px solid #000; padding: 4px 8px; text-align: right; }
              th { background: #f0f0f0; text-align: center; font-weight: bold; }
              .total-row { font-weight: bold; background: #e0f2f1; }
              .sub-total-row { background: #fffbeb; font-weight: bold; }
              .net-box { border: 2px solid #000; padding: 10px; text-align: center; font-size: 18px; font-weight: bold; margin-top: 20px; width: 60%; margin-left: auto; margin-right: auto; background: #f0fdf4; border-radius: 10px; }
              .signatures { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; font-weight: bold; font-size: 13px; page-break-inside: avoid; }
              @media print { button { display: none; } body { height: 100vh; overflow: hidden; } }
          </style>
      </head>
      <body>
          <button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 20px;">🖨️ طباعة الشهادة</button>
          <div class="header-container">
              <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 100px;" /></div>
              <div class="header-text">
                  <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                  <h3>شهادة مفردات مرتب</h3>
                  <p>عن شهر ${slip.month} لسنة ${slip.year}</p>
              </div>
              <div style="width: 100px;"></div>
          </div>
          <div class="info-grid">
              <div><strong>الاسم:</strong> ${employee.name}</div>
              <div><strong>الرقم القومي:</strong> ${employee.nationalId}</div>
              <div><strong>القسم:</strong> ${employee.department}</div>
              <div><strong>الوظيفة:</strong> ${employee.position}</div>
              <div><strong>الدرجة:</strong> ${employee.grade || '-'}</div>
              <div><strong>تاريخ التعيين:</strong> ${employee.joinDate}</div>
          </div>
          <div class="tables-container">
              <div style="flex:1">
                  <table>
                      <thead><tr><th colspan="2">الاستحقاقات</th></tr></thead>
                      <tbody>
                          <tr><td>الراتب الأساسي</td><td>${fmt(slip.basicSalary)}</td></tr>
                          <tr><td>حافز النقابة (يدوي)</td><td>${fmt(slip.syndicateIncentive)}</td></tr>
                          <tr><td>حافز إضافي</td><td>${fmt(slip.additionalIncentive)}</td></tr>
                          <tr><td>علاوة مؤهل/خبرة</td><td>${fmt(slip.educationExperienceBonus)}</td></tr>
                          <tr><td>علاوة تقييم أداء</td><td>${fmt(slip.performanceRaise)}</td></tr>
                          <tr><td>علاوة 2015</td><td>${fmt(slip.specialRaise2015)}</td></tr>
                          <tr><td>منحة عيد العمال</td><td>${fmt(slip.laborGrant)}</td></tr>
                          <tr><td>حزمة اجتماعية (غلاء)</td><td>${fmt(slip.socialPackage)}</td></tr>
                          <tr><td>البدلات (بدون النقدي)</td><td>${fmt(slip.allowancesTotal - slip.cashAllowance)}</td></tr>
                          ${slip.incentives > 0 ? `<tr><td>مكافآت ومتغير</td><td>${fmt(slip.incentives)}</td></tr>` : ''}
                          
                          <tr class="sub-total-row"><td>الأجر الخاضع (المجموع)</td><td>${fmt(slip.insurableWage)}</td></tr>
                          
                          <tr style="background-color: #f0fdfa;"><td>+ حصة النقابة (18.75%)</td><td>${fmt(slip.syndicateSocialShare)}</td></tr>
                          <tr style="background-color: #fff7ed;"><td>+ البدل النقدي</td><td>${fmt(slip.cashAllowance)}</td></tr>
                          
                          <tr class="total-row"><td>= جملة الاستحقاق</td><td>${fmt(slip.grossTotal)}</td></tr>
                      </tbody>
                  </table>
              </div>
              <div style="flex:1">
                  <table>
                      <thead><tr><th colspan="2">الاستقطاعات</th></tr></thead>
                      <tbody>
                          <tr><td>تأمينات (حصة الموظف + النقابة)</td><td>${fmt(slip.totalInsurance)}</td></tr>
                          <tr><td>ضريبة الدخل</td><td>${fmt(slip.taxDeduction)}</td></tr>
                          <tr><td>الدمغة</td><td>${fmt(slip.stampDuty)}</td></tr>
                          <tr style="background-color: #f0fdfa;"><td>صندوق الزمالة (حصة الموظف)</td><td>${fmt(slip.fellowshipFund)}</td></tr>
                          ${slip.penalties > 0 ? `<tr><td>جزاءات</td><td>${fmt(slip.penalties)}</td></tr>` : ''}
                          ${slip.loanDeduction > 0 ? `<tr><td>قسط سلفة</td><td>${fmt(slip.loanDeduction)}</td></tr>` : ''}
                          ${slip.taxSettlementDeduction > 0 ? `<tr><td>تسوية ضريبية</td><td>${fmt(slip.taxSettlementDeduction)}</td></tr>` : ''}
                          <tr class="total-row"><td>إجمالي الاستقطاع</td><td>${fmt(totalDeductions)}</td></tr>
                      </tbody>
                  </table>
              </div>
          </div>
          <div class="net-box">صافي المرتب: ${fmt(slip.netSalary)} جنيه مصري</div>
          <div class="signatures">
              <div>إعداد الموارد البشرية<br><br>......................</div>
              <div>المدير المالي<br><br>......................</div>
              <div>يعتمد، أمين الصندوق<br><br>......................</div>
          </div>
      </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const printForm132 = (slipsToPrint: PayrollSlip[]) => {
    if (slipsToPrint.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const totals = slipsToPrint.reduce((acc, slip) => {
        const totalDeductions = slip.grossTotal - slip.netSalary;
        return {
            basic: acc.basic + slip.basicSalary,
            raise2015: acc.raise2015 + slip.specialRaise2015,
            syndicate: acc.syndicate + slip.syndicateIncentive,
            additional: acc.additional + slip.additionalIncentive,
            edu: acc.edu + slip.educationExperienceBonus,
            perf: acc.perf + slip.performanceRaise,
            social: acc.social + slip.socialPackage,
            grant: acc.grant + slip.laborGrant,
            allowances: acc.allowances + slip.allowancesTotal,
            var: acc.var + (slip.variableSalary + slip.incentives),
            // Shares
            insurable: acc.insurable + slip.insurableWage,
            empFellowship: acc.empFellowship + slip.fellowshipFund,
            syndicateShare: acc.syndicateShare + slip.syndicateSocialShare, 
            gross: acc.gross + slip.grossTotal,
            insurance: acc.insurance + slip.totalInsurance,
            tax: acc.tax + slip.taxDeduction,
            stamp: acc.stamp + slip.stampDuty,
            // Deductions
            fellowship: acc.fellowship + slip.fellowshipFund, // Only emp share now
            penalty: acc.penalty + slip.penalties,
            loan: acc.loan + slip.loanDeduction,
            settlement: acc.settlement + slip.taxSettlementDeduction,
            totalDed: acc.totalDed + totalDeductions,
            net: acc.net + slip.netSalary
        };
    }, {
        basic: 0, raise2015: 0, syndicate: 0, additional: 0, edu: 0, perf: 0, social: 0, grant: 0, allowances: 0, var: 0, 
        insurable: 0, empFellowship: 0, syndicateShare: 0, gross: 0,
        insurance: 0, tax: 0, stamp: 0, fellowship: 0, penalty: 0, loan: 0, settlement: 0, totalDed: 0, net: 0
    });

    const rowsHtml = slipsToPrint.map((slip, index) => {
        const employee = employees.find(e => e.id === slip.employeeId);
        if (!employee) return '';
        const totalDeductions = slip.grossTotal - slip.netSalary;
        
        return `
        <tr>
            <td>${index + 1}</td>
            <td style="text-align:right; white-space:nowrap;">${employee.name}</td>
            <td>${employee.grade || '-'}</td>
            <td>${fmt(slip.basicSalary)}</td>
            <td>${fmt(slip.specialRaise2015)}</td>
            <td>${fmt(slip.syndicateIncentive)}</td>
            <td>${fmt(slip.additionalIncentive)}</td>
            <td>${fmt(slip.educationExperienceBonus)}</td>
            <td>${fmt(slip.performanceRaise)}</td>
            <td>${fmt(slip.socialPackage)}</td>
            <td>${fmt(slip.laborGrant)}</td>
            <td>${fmt(slip.allowancesTotal)}</td>
            <td>${fmt(slip.variableSalary + slip.incentives)}</td>
            <td style="background-color:#fff7ed; color:#ea580c; font-weight:bold;">${fmt(slip.insurableWage)}</td>
            <td style="background-color:#dbeafe; color:#1e40af; font-weight:bold;">${fmt(slip.fellowshipFund)}</td>
            <td style="background-color:#e0f2fe; color:#0369a1; font-weight:bold;">${fmt(slip.syndicateSocialShare)}</td>
            <td class="bold-cell">${fmt(slip.grossTotal)}</td>
            <td style="font-weight:bold;">${fmt(slip.totalInsurance)}</td>
            <td>${fmt(slip.taxDeduction)}</td>
            <td>${fmt(slip.stampDuty)}</td>
            <td>${fmt(slip.fellowshipFund)}</td>
            <td>${fmt(slip.penalties)}</td>
            <td>${fmt(slip.loanDeduction)}</td>
            <td style="background-color:#fef2f2; color:#b91c1c; font-weight:bold;">${fmt(slip.taxSettlementDeduction)}</td>
            <td class="bold-cell" style="color:#b91c1c;">${fmt(totalDeductions)}</td>
            <td class="bold-cell grand-total">${fmt(slip.netSalary)}</td>
        </tr>
        `;
    }).join('');

    const categoryTitle = selectedCategory !== 'all' ? EMPLOYMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label : 'جميع العاملين';

    const content = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <title>استمارة 132 مجمعة - ${slipsToPrint[0].month} ${slipsToPrint[0].year}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
          <style>
              @page { size: A4 landscape; margin: 5mm; }
              body { font-family: 'Cairo', sans-serif; padding: 10px; background: white; -webkit-print-color-adjust: exact; color: #000; font-size: 8px; }
              .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
              .header-text { text-align: center; flex: 1; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #444; padding: 3px; text-align: center; vertical-align: middle; }
              th { background: #f0f0f0; font-weight: bold; font-size: 8px; white-space: normal; }
              .bold-cell { font-weight: bold; background-color: #f9fafb; }
              .grand-total { background-color: #dcfce7; font-weight: 900; font-size: 9px; }
              .footer-totals { background-color: #374151; color: white; font-weight: bold; }
              .footer-totals td { border-color: #fff; }
              .signatures { margin-top: 30px; display: flex; justify-content: space-around; text-align: center; font-weight: bold; font-size: 12px; page-break-inside: avoid; }
              @media print { button { display: none; } thead { display: table-header-group; } tfoot { display: table-footer-group; } tr { page-break-inside: avoid; } }
          </style>
      </head>
      <body>
          <button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 10px;">🖨️ طباعة الكشف المجمع</button>
          <div class="header-container">
              <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 100px;" /></div>
              <div class="header-text">
                  <h2 style="margin:0; font-size:16px;">نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                  <h3 style="margin:2px 0; font-size:14px;">استمارة (132) كشف مرتبات العاملين المجمع</h3>
                  <p style="margin:0; font-size:12px; font-weight:bold;">الفئة: ${categoryTitle}</p>
                  <p style="margin:0; font-size:11px;">عن شهر ${slipsToPrint[0].month} لسنة ${slipsToPrint[0].year}</p>
              </div>
              <div style="width: 100px;"></div>
          </div>
          <table>
              <thead>
                  <tr style="background:#e5e7eb;">
                      <th rowspan="2" width="20">م</th>
                      <th rowspan="2" width="100">الاسم</th>
                      <th rowspan="2" width="30">الدرجة</th>
                      <th colspan="2">الأجور الأساسية</th>
                      <th colspan="12">الأجور المتغيرة والاستحقاقات</th>
                      <th colspan="1">الإجمالي</th>
                      <th colspan="8">الاستقطاعات</th>
                      <th rowspan="2" width="50">الصافي</th>
                  </tr>
                  <tr>
                      <th>الأساسي</th><th>علاوة 2015</th><th>حافز نقابة</th><th>حافز إضافي</th><th>مؤهل/خبرة</th><th>تقييم</th><th>غلاء</th><th>منحة</th><th>بدلات</th><th>متغير</th>
                      <th style="background-color:#fff7ed; color:#ea580c;">الأجر الخاضع</th>
                      <th style="background-color:#dbeafe; color:#1e40af;">حصة الموظف (زمالة)</th>
                      <th style="background-color:#e0f2fe; color:#0369a1;">حصة النقابة (تأمينات)</th>
                      <th class="bold-cell">جملة المستحق</th>
                      <th>تأمينات (29.75%)</th><th>ضرائب</th><th>دمغة</th><th>زمالة (موظف)</th><th>جزاءات</th><th>سلف</th><th>تسوية ضريبية</th>
                      <th class="bold-cell">جملة المستقطع</th>
                  </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
              <tfoot>
                  <tr class="footer-totals">
                      <td colspan="3">الإجمالي العام</td>
                      <td>${fmt(totals.basic)}</td><td>${fmt(totals.raise2015)}</td><td>${fmt(totals.syndicate)}</td><td>${fmt(totals.additional)}</td><td>${fmt(totals.edu)}</td><td>${fmt(totals.perf)}</td><td>${fmt(totals.social)}</td><td>${fmt(totals.grant)}</td><td>${fmt(totals.allowances)}</td><td>${fmt(totals.var)}</td>
                      <td>${fmt(totals.insurable)}</td><td>${fmt(totals.empFellowship)}</td><td>${fmt(totals.syndicateShare)}</td><td>${fmt(totals.gross)}</td>
                      <td>${fmt(totals.insurance)}</td><td>${fmt(totals.tax)}</td><td>${fmt(totals.stamp)}</td><td>${fmt(totals.fellowship)}</td><td>${fmt(totals.penalty)}</td><td>${fmt(totals.loan)}</td><td>${fmt(totals.settlement)}</td><td>${fmt(totals.totalDed)}</td><td>${fmt(totals.net)}</td>
                  </tr>
              </tfoot>
          </table>
          <div class="signatures">
              <div>إعداد<br><br>..................</div>
              <div>مراجعة<br><br>..................</div>
              <div>المدير المالي<br><br>..................</div>
              <div>أمين الصندوق<br><br>..................</div>
              <div>رئيس النقابة<br><br>م : ..................</div>
          </div>
      </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const printNetSalarySheet = () => {
      const slipsToPrint = selectedIds.length > 0 ? filteredPayrolls.filter(p => selectedIds.includes(p.employeeId)) : filteredPayrolls;
      if (slipsToPrint.length === 0) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const totalNetSum = slipsToPrint.reduce((acc, p) => acc + p.netSalary, 0);
      const categoryTitle = selectedCategory !== 'all' ? EMPLOYMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label : 'جميع العاملين';
      const rowsHtml = slipsToPrint.map((slip, index) => {
          const emp = employees.find(e => e.id === slip.employeeId);
          // Net Sheet Deductions must match calculation logic
          const totalDeductions = slip.grossTotal - slip.netSalary;
          return `<tr><td>${index + 1}</td><td style="text-align: right; font-weight: bold;">${emp?.name}</td><td>${fmt(slip.basicSalary)}</td><td>${fmt(slip.grossTotal)}</td><td>${fmt(totalDeductions)}</td><td style="font-weight: bold;">${fmt(slip.netSalary)}</td><td>${emp?.bankName || '-'}</td><td></td></tr>`;
      }).join('');
      const content = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><title>صافي مرتبات الموظفين</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet"><style>@page { size: A4 landscape; margin: 10mm; } body { font-family: 'Cairo', sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; font-size: 12px; } th, td { border: 1px solid #000; padding: 6px; text-align: center; } th { background: #d1d5db; } .header-container { display: flex; justify-content: space-between; align-items: center; border: 1px solid #000; padding: 15px; border-radius: 8px; background: #e0f2f1; margin-bottom: 20px; } @media print { button { display: none; } } </style></head><body><button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ طباعة</button><div class="header-container"><div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 100px;" /></div><div style="text-align:center; flex:1"><h2>نقابة المهندسين الفرعية بأسيوط</h2><h3>كشف صافي المرتبات</h3><p>${categoryTitle}</p></div><div style="width:100px;"></div></div><table><thead><tr><th>م</th><th>اسم الموظف</th><th>الأساسي</th><th>المستحق</th><th>المستقطع</th><th>الصافي</th><th>البنك</th><th>التوقيع</th></tr></thead><tbody>${rowsHtml}<tr><td colspan="5">الإجمالي</td><td>${fmt(totalNetSum)}</td><td colspan="2"></td></tr></tbody></table></body></html>`;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  const printInsuranceSheet = () => {
      const slipsToPrint = selectedIds.length > 0 ? filteredPayrolls.filter(p => selectedIds.includes(p.employeeId)) : filteredPayrolls;
      if (slipsToPrint.length === 0) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      let totalInsurableWage = 0;
      slipsToPrint.forEach(slip => {
          let baseGross = slip.grossTotal - slip.syndicateSocialShare - slip.syndicateFellowshipShare - slip.fellowshipFund; // Revert to base gross for insurance base
          let insurable = baseGross;
          if (insurable > MAX_INSURANCE_SALARY) insurable = MAX_INSURANCE_SALARY;
          if (insurable < MIN_INSURANCE_SALARY) insurable = MIN_INSURANCE_SALARY;
          totalInsurableWage += insurable;
      });
      const shares = [ { name: 'تأمين الشيخوخة', pct: '12%', val: totalInsurableWage * 0.12 }, { name: 'ضد المرض', pct: '3%', val: totalInsurableWage * 0.03 }, { name: 'نظام المكافأة', pct: '1%', val: totalInsurableWage * 0.01 }, { name: 'تأمين البطالة', pct: '1%', val: totalInsurableWage * 0.01 }, { name: 'إصابة عمل', pct: '2%', val: totalInsurableWage * 0.02 }, { name: 'تأمين الشيخوخة والوفاة', pct: '9%', val: totalInsurableWage * 0.09 }, { name: 'تأمين صحي', pct: '1%', val: totalInsurableWage * 0.01 }, { name: 'نظام المكافأة (إضافي)', pct: '1%', val: totalInsurableWage * 0.01 } ];
      const totalInsuranceDue = shares.reduce((acc, curr) => acc + curr.val, 0);
      const content = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><title>كشف التأمينات</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet"><style>@page { size: A4; margin: 10mm; } body { font-family: 'Cairo', sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 2px solid #000; padding: 8px; text-align: center; } th { background: #fbbf24; } @media print { button { display: none; } } </style></head><body><button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ طباعة</button><div style="text-align:center; margin-bottom:20px;"><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height:100px; display:inline-block;" /><h2>كشف التأمينات الاجتماعية</h2></div><table><thead><tr><th>المبلغ</th><th>النسبة</th><th>البيان</th></tr></thead><tbody>${shares.map(s => `<tr><td>${fmt(s.val)}</td><td>${s.pct}</td><td>${s.name}</td></tr>`).join('')}<tr style="background:#fbbf24; font-weight:bold;"><td>${fmt(totalInsuranceDue)}</td><td>30%</td><td>الإجمالي</td></tr></tbody></table></body></html>`;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-end">
            <div><h2 className="text-3xl font-bold text-emerald-900">الرواتب والأجور</h2><p className="text-emerald-600 mt-1">احتساب الرواتب شاملاً الحوافز والبدلات القانونية</p></div>
            <div className="bg-white text-emerald-700 px-6 py-3 rounded-xl border border-emerald-200 flex flex-col items-end shadow-sm"><span className="text-xs font-semibold uppercase text-emerald-500">إجمالي الصرف المستحق</span><span className="text-2xl font-bold font-mono">{totalNet.toLocaleString()} ج.م</span></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border border-emerald-200 rounded-lg px-3 py-2 bg-emerald-50/50">
                    <Filter size={18} className="text-emerald-600" />
                    <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedIds([]); }} className="bg-transparent outline-none text-sm font-bold text-emerald-800 border-l border-emerald-300 pl-2 ml-2"><option value="all">جميع الأقسام</option>{Array.from(new Set(employees.map(e => e.department))).map(dept => <option key={dept} value={dept}>{dept}</option>)}</select>
                    <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedIds([]); }} className="bg-transparent outline-none text-sm font-bold text-emerald-800"><option value="all">جميع الفئات</option>{EMPLOYMENT_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}</select>
                </div>
                <div className="text-xs text-emerald-600 font-medium">{filteredPayrolls.length} موظف</div>
            </div>
            <div className="flex gap-2 flex-wrap">
                 <button onClick={() => printForm132(filteredPayrolls.filter(p => selectedIds.includes(p.employeeId)))} disabled={selectedIds.length === 0} className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm font-bold"><FileSpreadsheet size={16} />استمارة 132 (محدد)</button>
                <button onClick={printNetSalarySheet} className="flex items-center gap-2 bg-emerald-800 text-white px-3 py-2 rounded-lg hover:bg-emerald-900 transition-colors text-sm font-bold"><FileText size={16} />كشف الصافي</button>
                 <button onClick={printInsuranceSheet} className="flex items-center gap-2 bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-bold"><ShieldCheck size={16} />كشف التأمينات</button>
                <button onClick={() => printForm132(filteredPayrolls)} className="flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-bold"><Printer size={16} />طباعة الكل (132)</button>
            </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[1600px]">
                <thead className="bg-emerald-50 border-b border-emerald-100">
                    <tr>
                        <th className="p-4 w-12 text-center"><button onClick={toggleSelectAll} className="text-emerald-800 hover:text-emerald-600">{selectedIds.length === filteredPayrolls.length && filteredPayrolls.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}</button></th>
                        <th className="p-4 text-xs font-bold text-emerald-800 uppercase">الموظف</th>
                        <th className="p-4 text-xs font-bold text-emerald-800 uppercase">الأساسي</th>
                        <th className="p-4 text-xs font-bold text-amber-600 uppercase">حافز نقابة</th>
                        <th className="p-4 text-xs font-bold text-emerald-600 uppercase">حافز إضافي</th>
                        <th className="p-4 text-xs font-bold text-blue-600 uppercase">بدلات</th>
                        <th className="p-4 text-xs font-bold text-emerald-800 uppercase">مكافآت</th>
                        <th className="p-4 text-xs font-bold text-emerald-800 uppercase">جزاءات</th>
                        <th className="p-4 text-xs font-bold text-red-600 uppercase">تأمينات</th>
                        <th className="p-4 text-xs font-bold text-red-600 uppercase">ضرائب</th>
                        <th className="p-4 text-xs font-bold text-red-600 uppercase">سلف</th>
                        <th className="p-4 text-xs font-bold text-red-600 uppercase bg-red-50">تسوية ضريبية</th>
                        <th className="p-4 text-xs font-bold text-emerald-900 uppercase bg-emerald-100">الصافي</th>
                        <th className="p-4 text-xs font-bold text-emerald-800 uppercase text-center">خيارات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                    {filteredPayrolls.map((slip) => {
                        const employee = employees.find(e => e.id === slip.employeeId);
                        const isSelected = selectedIds.includes(slip.employeeId);
                        return (
                            <tr key={slip.employeeId} className={`transition-colors group ${isSelected ? 'bg-emerald-50/80' : 'hover:bg-emerald-50/30'}`}>
                                <td className="p-4 text-center"><button onClick={() => toggleSelectOne(slip.employeeId)} className={`text-emerald-800 hover:text-emerald-600 ${isSelected ? 'text-emerald-600' : 'text-slate-300'}`}>{isSelected ? <CheckSquare size={20} /> : <Square size={20} />}</button></td>
                                <td className="p-4 font-medium text-slate-800"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{employee?.name.charAt(0)}</div><div className="flex flex-col"><span>{employee?.name}</span><span className="text-[10px] text-slate-400">{employee?.position}</span></div></div></td>
                                <td className="p-4 text-slate-600 font-mono">{slip.basicSalary}</td>
                                <td className="p-4 text-amber-600 font-mono font-medium">{slip.syndicateIncentive}</td>
                                <td className="p-4 text-emerald-600 font-mono font-medium">{slip.additionalIncentive}</td>
                                <td className="p-4 text-blue-600 font-mono font-medium">{slip.allowancesTotal}</td>
                                <td className="p-4"><input type="number" className="w-16 border border-slate-300 rounded px-1 py-1 text-sm focus:border-emerald-500 outline-none" placeholder="0" value={incentives[slip.employeeId] || ''} onChange={(e) => handleCalcChange(slip.employeeId, 'incentive', e.target.value)} />{slip.incentives > (incentives[slip.employeeId] || 0) && <span className="block text-[9px] text-emerald-600 mt-1">+ مكافآت مسجلة</span>}</td>
                                <td className="p-4"><input type="number" className="w-16 border border-slate-300 rounded px-1 py-1 text-sm focus:border-red-500 outline-none" placeholder="0" value={penalties[slip.employeeId] || ''} onChange={(e) => handleCalcChange(slip.employeeId, 'penalty', e.target.value)} /></td>
                                <td className="p-4 text-red-500 font-mono text-sm">-{slip.totalInsurance}</td>
                                <td className="p-4 text-red-500 font-mono text-sm">-{slip.taxDeduction}</td>
                                <td className="p-4 text-red-500 font-mono text-sm font-bold">{slip.loanDeduction > 0 ? `-${slip.loanDeduction}` : '-'}</td>
                                <td className="p-4 text-red-600 font-mono text-sm font-bold bg-red-50">{slip.taxSettlementDeduction > 0 ? `-${slip.taxSettlementDeduction}` : '-'}</td>
                                <td className="p-4 bg-emerald-50 font-bold text-emerald-700 font-mono text-lg border-l border-emerald-100">{slip.netSalary.toLocaleString()}</td>
                                <td className="p-4 flex gap-2 justify-center"><button onClick={() => printSimplePayslip(slip)} className="bg-white border border-emerald-200 text-emerald-700 px-3 py-1 rounded text-xs font-bold hover:bg-emerald-50 flex items-center gap-1 shadow-sm"><FileText size={14} />مفردات</button></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};