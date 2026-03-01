
import React, { useState, useMemo } from 'react';
import { Employee, PayrollSlip, Loan, PerformanceReview, BonusRecord, TaxDebt } from '../types';
import { calculateSalary } from '../utils/payrollLogic';
import { Printer, FileText, FileSpreadsheet, CheckSquare, Square, Filter, ShieldCheck, Calendar, Search, FileText as FileIcon } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState(''); 
  const [searchDocNum, setSearchDocNum] = useState(''); 
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const months = [
      { value: 0, label: 'يناير' }, { value: 1, label: 'فبراير' }, { value: 2, label: 'مارس' },
      { value: 3, label: 'أبريل' }, { value: 4, label: 'مايو' }, { value: 5, label: 'يونيو' },
      { value: 6, label: 'يوليو' }, { value: 7, label: 'أغسطس' }, { value: 8, label: 'سبتمبر' },
      { value: 9, label: 'أكتوبر' }, { value: 10, label: 'نوفمبر' }, { value: 11, label: 'ديسمبر' }
  ];
  
  const years = [selectedYear - 1, selectedYear, selectedYear + 1];

  const handleCalcChange = (id: string, type: 'incentive' | 'penalty', value: string) => {
      const numVal = parseFloat(value) || 0;
      if (type === 'incentive') setIncentives({ ...incentives, [id]: numVal });
      else setPenalties({ ...penalties, [id]: numVal });
  };

  const allPayrolls: PayrollSlip[] = useMemo(() => {
    const calculationDate = new Date(selectedYear, selectedMonth, 15);
    return employees.map(emp => 
        calculateSalary(
            emp, 
            loans, 
            reviews, 
            bonuses, 
            incentives[emp.id] || 0, 
            penalties[emp.id] || 0, 
            0, 
            taxDebts,
            { date: calculationDate }
        )
    );
  }, [employees, loans, reviews, incentives, penalties, bonuses, taxDebts, selectedMonth, selectedYear]);

  const filteredPayrolls = useMemo(() => {
      return allPayrolls.filter(p => {
          const emp = employees.find(e => e.id === p.employeeId);
          if (!emp) return false;
          
          const matchDept = selectedDept === 'all' || emp.department === selectedDept;
          const matchCat = selectedCategory === 'all' || emp.employmentCategory === selectedCategory;
          
          const matchSearch = searchTerm 
            ? emp.name.includes(searchTerm) || emp.nationalId.includes(searchTerm)
            : true;
            
          // تعديل: مطابقة تامة لرقم المستند
          const matchDoc = searchDocNum.trim() ? (emp.documentNumber === searchDocNum.trim()) : true;

          return matchDept && matchCat && matchSearch && matchDoc;
      });
  }, [allPayrolls, selectedDept, selectedCategory, searchTerm, searchDocNum, employees]);

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
    
    const totalDeductions = slip.grossTotal - slip.netSalary;
    const rawNonPensionableSum = (employee.nonPensionableAllowances || []).reduce((sum, item) => sum + (item.value || 0), 0);
    const nonPensionableRatio = rawNonPensionableSum > 0 ? (slip.nonPensionableTotal / rawNonPensionableSum) : 1;

    const nonPensionableRows = (employee.nonPensionableAllowances || []).map(npa => `
        <tr style="background-color: #fffbeb; color: #92400e;">
            <td>+ ${npa.name}</td>
            <td>${fmt(npa.value * nonPensionableRatio)}</td>
        </tr>
    `).join('');

    const content = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <title>مفردات مرتب - ${employee.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
          <style>
              @page { size: A4; margin: 5mm; }
              body { font-family: 'Cairo', sans-serif; padding: 10px; background: white; -webkit-print-color-adjust: exact; color: #000; zoom: 85%; }
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
          <button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 20px;">طباعة</button>
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
                          <tr style="background-color: #f8fafc; font-weight: bold;"><td>الحافز الإضافي</td><td>${fmt(slip.additionalIncentive)}</td></tr>
                          <tr><td>علاوة مؤهل/خبرة</td><td>${fmt(slip.educationExperienceBonus)}</td></tr>
                          <tr><td>علاوة تقييم أداء</td><td>${fmt(slip.performanceRaise)}</td></tr>
                          <tr><td>علاوة 2015</td><td>${fmt(slip.specialRaise2015)}</td></tr>
                          <tr><td>منحة عيد العمال</td><td>${fmt(slip.laborGrant)}</td></tr>
                          <tr style="background-color: #f0fdf4; font-weight: bold;"><td>علاوة غلاء معيشة</td><td>${fmt(slip.socialPackage)}</td></tr>
                          <tr><td>بدلات أخرى صافي</td><td>${fmt(slip.allowancesTotal)}</td></tr>
                          ${slip.incentives > 0 ? `<tr><td>مكافآت ومتغير (يدوي)</td><td>${fmt(slip.incentives)}</td></tr>` : ''}
                          <tr class="sub-total-row"><td>الأجر الخاضع (المجموع)</td><td>${fmt(slip.insurableWage)}</td></tr>
                          <tr style="background-color: #fff7ed;"><td>+ البدل النقدي</td><td>${fmt(slip.cashAllowance)}</td></tr>
                          ${nonPensionableRows}
                          <tr style="background-color: #f0fdfa;"><td>+ حصة النقابة تأمينات (18.75%)</td><td>${fmt(slip.syndicateSocialShare)}</td></tr>
                          <tr style="background-color: #eff6ff;"><td>+ حصة النقابة زمالة (50%)</td><td>${fmt(slip.syndicateFellowshipShare)}</td></tr>
                          <tr class="total-row"><td>= جملة الاستحقاق</td><td>${fmt(slip.grossTotal)}</td></tr>
                      </tbody>
                  </table>
              </div>
              <div style="flex:1">
                  <table>
                      <thead><tr><th colspan="2">الاستقطاعات</th></tr></thead>
                      <tbody>
                          <tr><td>تأمينات (حصة الموظف + صاحب العمل)</td><td>${fmt(slip.totalInsurance)}</td></tr>
                          <tr><td>ضريبة الدخل</td><td>${fmt(slip.taxDeduction)}</td></tr>
                          <tr><td>الدمغة</td><td>${fmt(slip.stampDuty)}</td></tr>
                          <tr style="background-color: #eff6ff;"><td>صندوق الزمالة (حصة النقابة)</td><td>${fmt(slip.syndicateFellowshipShare)}</td></tr>
                          <tr style="background-color: #f0fdfa;"><td>صندوق الزمالة (حصة الموظف)</td><td>${fmt(slip.fellowshipFund)}</td></tr>
                          ${slip.penalties > 0 ? `<tr><td>جزاءات</td><td>${fmt(slip.penalties)}</td></tr>` : ''}
                          ${Math.abs(slip.loanDeduction) > 0.01 ? `
                            <tr style="background-color: #fffbeb; font-weight: bold;">
                                <td>قسط سلفة (عادية)</td>
                                <td>${fmt(slip.loanDeduction)}</td>
                            </tr>
                          ` : ''}
                          ${Math.abs(slip.bankInstallment) > 0.01 ? `
                            <tr style="background-color: #eff6ff; font-weight: bold;">
                                <td>قسط بنك</td>
                                <td>${fmt(slip.bankInstallment)}</td>
                            </tr>
                          ` : ''}
                          ${slip.taxSettlementDeduction > 0 ? `<tr><td>تسوية ضريبية</td><td>${fmt(slip.taxSettlementDeduction)}</td></tr>` : ''}
                          ${slip.vodafoneDeduction > 0 ? `<tr style="background-color:#fef2f2; color:#b91c1c;"><td>خصم فودافون</td><td>${fmt(slip.vodafoneDeduction)}</td></tr>` : ''}
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
    
    const grandTotals = slipsToPrint.reduce((acc, slip) => {
        const totalDeductions = slip.grossTotal - slip.netSalary;
        const variableGroupSum = 
            slip.additionalIncentive + 
            slip.specialRaise2015 + 
            slip.educationExperienceBonus + 
            slip.performanceRaise + 
            slip.socialPackage + 
            slip.laborGrant + 
            slip.variableSalary + 
            slip.incentives + 
            slip.allowancesTotal;

        return {
            basic: acc.basic + slip.basicSalary,
            syndicate: acc.syndicate + slip.syndicateIncentive,
            variableGroup: acc.variableGroup + variableGroupSum,
            insurable: acc.insurable + slip.insurableWage,
            cash: acc.cash + slip.cashAllowance,
            syndicateShare: acc.syndicateShare + slip.syndicateSocialShare,
            nonPen: acc.nonPen + slip.nonPensionableTotal,
            syndicateFellowship: acc.syndicateFellowship + slip.syndicateFellowshipShare,
            gross: acc.gross + slip.grossTotal,
            insurance: acc.insurance + slip.totalInsurance,
            tax: acc.tax + slip.taxDeduction,
            stamp: acc.stamp + slip.stampDuty,
            fellowshipEmp: acc.fellowshipEmp + slip.fellowshipFund,
            penalty: acc.penalty + slip.penalties,
            loan: acc.loan + (slip.loanDeduction || 0), 
            bank: acc.bank + (slip.bankInstallment || 0), 
            settlement: acc.settlement + slip.taxSettlementDeduction,
            vodafone: acc.vodafone + (slip.vodafoneDeduction || 0),
            totalDed: acc.totalDed + totalDeductions,
            net: acc.net + slip.netSalary
        };
    }, {
        basic: 0, syndicate: 0, variableGroup: 0, insurable: 0, cash: 0, syndicateShare: 0, nonPen: 0, syndicateFellowship: 0, gross: 0,
        insurance: 0, tax: 0, stamp: 0, fellowshipEmp: 0, penalty: 0, loan: 0, bank: 0, settlement: 0, vodafone: 0, totalDed: 0, net: 0
    });

    const CHUNK_SIZE = 8;
    const chunks = Array.from({ length: Math.ceil(slipsToPrint.length / CHUNK_SIZE) }, (_, i) => slipsToPrint.slice(i * CHUNK_SIZE, i * CHUNK_SIZE + CHUNK_SIZE));
    const categoryTitle = selectedCategory !== 'all' ? EMPLOYMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label : 'جميع العاملين';

    let allPagesHtml = '';

    chunks.forEach((chunk, pageIdx) => {
        const pageTotals = chunk.reduce((acc, slip) => {
            const totalDeductions = slip.grossTotal - slip.netSalary;
            const variableGroupSum = 
                slip.additionalIncentive + 
                slip.specialRaise2015 + 
                slip.educationExperienceBonus + 
                slip.performanceRaise + 
                slip.socialPackage + 
                slip.laborGrant + 
                slip.variableSalary + 
                slip.incentives + 
                slip.allowancesTotal;
            
            return {
                basic: acc.basic + slip.basicSalary,
                syndicate: acc.syndicate + slip.syndicateIncentive,
                variableGroup: acc.variableGroup + variableGroupSum,
                insurable: acc.insurable + slip.insurableWage,
                cash: acc.cash + slip.cashAllowance,
                syndicateShare: acc.syndicateShare + slip.syndicateSocialShare,
                nonPen: acc.nonPen + slip.nonPensionableTotal,
                syndicateFellowship: acc.syndicateFellowship + slip.syndicateFellowshipShare,
                gross: acc.gross + slip.grossTotal,
                insurance: acc.insurance + slip.totalInsurance,
                tax: acc.tax + slip.taxDeduction,
                stamp: acc.stamp + slip.stampDuty,
                fellowshipEmp: acc.fellowshipEmp + slip.fellowshipFund,
                penalty: acc.penalty + slip.penalties,
                loan: acc.loan + (slip.loanDeduction || 0), 
                bank: acc.bank + (slip.bankInstallment || 0), 
                settlement: acc.settlement + slip.taxSettlementDeduction,
                vodafone: acc.vodafone + (slip.vodafoneDeduction || 0),
                totalDed: acc.totalDed + totalDeductions,
                net: acc.net + slip.netSalary
            };
        }, {
            basic: 0, syndicate: 0, variableGroup: 0, insurable: 0, cash: 0, syndicateShare: 0, nonPen: 0, syndicateFellowship: 0, gross: 0,
            insurance: 0, tax: 0, stamp: 0, fellowshipEmp: 0, penalty: 0, loan: 0, bank: 0, settlement: 0, vodafone: 0, totalDed: 0, net: 0
        });

        const rowsHtml = chunk.map((slip, index) => {
            const employee = employees.find(e => e.id === slip.employeeId);
            if (!employee) return '';
            const totalDeductions = slip.grossTotal - slip.netSalary;
            
            const variableGroupSum = 
                slip.additionalIncentive + 
                slip.specialRaise2015 + 
                slip.educationExperienceBonus + 
                slip.performanceRaise + 
                slip.socialPackage + 
                slip.laborGrant + 
                slip.variableSalary + 
                slip.incentives + 
                slip.allowancesTotal;
            
            return `
            <tr>
                <td>${(pageIdx * CHUNK_SIZE) + index + 1}</td>
                <td class="name-cell">${employee.name}</td>
                <td class="grade-cell">${employee.grade || '-'}</td>
                <td class="num">${fmt(slip.basicSalary)}</td>
                <td class="num">${fmt(slip.syndicateIncentive)}</td>
                <td class="num" style="background-color:#f0f9ff; font-weight:700;">${fmt(variableGroupSum)}</td>
                <td class="num" style="background-color:#fff7ed; color:#ea580c; font-weight:700;">${fmt(slip.insurableWage)}</td>
                <td class="num" style="background-color:#f0fdf4; color:#15803d;">${fmt(slip.cashAllowance)}</td>
                <td class="num" style="background-color:#e0f2fe; color:#0369a1;">${fmt(slip.syndicateSocialShare)}</td>
                <td class="num" style="background-color:#fffbeb; color:#92400e;">${fmt(slip.nonPensionableTotal)}</td>
                <td class="num" style="background-color:#eff6ff; color:#1d4ed8;">${fmt(slip.syndicateFellowshipShare)}</td>
                <td class="num bold-cell">${fmt(slip.grossTotal)}</td>
                <td class="num" style="font-weight:700;">${fmt(slip.totalInsurance)}</td>
                <td class="num">${fmt(slip.taxDeduction)}</td>
                <td class="num">${fmt(slip.stampDuty)}</td>
                <td class="num">${fmt(slip.fellowshipFund)}</td>
                <td class="num">${fmt(slip.penalties)}</td>
                <td class="num" style="background-color:#fffbeb;">${fmt(slip.loanDeduction || 0)}</td>
                <td class="num" style="background-color:#eff6ff;">${fmt(slip.bankInstallment || 0)}</td>
                <td class="num">${fmt(slip.taxSettlementDeduction)}</td>
                <td class="num" style="background-color:#fff1f2; color:#be123c;">${fmt(slip.vodafoneDeduction)}</td>
                <td class="num bold-cell" style="color:#b91c1c;">${fmt(totalDeductions)}</td>
                <td class="num net-column">${fmt(slip.netSalary)}</td>
            </tr>
            `;
        }).join('');

        allPagesHtml += `
            <div class="print-page">
                <div class="header-container">
                    <div class="logo-box"><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 32px;" /></div>
                    <div style="text-align:center">
                        <h2 style="margin:0; font-size:11px; font-weight:900; color: #064e3b; line-height:1;">نقابة المهندسين - الفرعية بأسيوط</h2>
                        <h3 style="margin:1px 0; font-size:9px; font-weight:700; line-height:1;">استمارة (132) كشف مرتبات الموظفين المجمع</h3>
                        <p style="margin:0; font-size:8px; font-weight:700; line-height:1;">${categoryTitle} | ${slipsToPrint[0].month} ${slipsToPrint[0].year} | صفحة ${pageIdx + 1} من ${chunks.length}</p>
                    </div>
                    <div style="width: 32px;"></div>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th rowspan="2" style="width:18px">م</th>
                                <th rowspan="2" style="width:150px">اسم الموظف بالكامل</th>
                                <th rowspan="2" style="width:28px">درجة</th>
                                <th colspan="8">الاستحقاقات والمزايا (الترتيب المعتمد)</th>
                                <th rowspan="2" style="width:55px">الإجمالي</th>
                                <th colspan="10">الاستقطاعات والخصومات</th>
                                <th rowspan="2" style="width:80px">الصافي</th>
                            </tr>
                            <tr>
                                <th class="num" style="width:40px;">الأساسي</th>
                                <th class="num" style="width:40px;">نقابة</th>
                                <th class="num" style="background-color:#f0f9ff; width:65px;">بدلات متغيرة</th>
                                <th class="num" style="background-color:#fff7ed; width:45px;">الخاضع</th>
                                <th class="num" style="background-color:#f0fdf4; width:40px;">النقدي</th>
                                <th class="num" style="background-color:#e0f2fe; width:45px;">18.75%</th>
                                <th class="num" style="background-color:#fffbeb; width:45px;">إضافات</th>
                                <th class="num" style="background-color:#eff6ff; width:45px;">الزمالة</th>
                                <th class="num">تأمينات</th><th class="num">ضرائب</th><th class="num">دمغة</th><th class="num">زمالة(م)</th><th class="num">جزاءات</th><th class="num">سلف</th><th class="num">بنك</th><th class="num">تسوية</th><th class="num">فودافون</th>
                                <th class="bold-cell">المستقطع</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                        <tfoot>
                            <tr class="footer-totals-page">
                                <td colspan="3" class="total-label-cell">إجمالي الصفحة</td>
                                <td class="total-num">${fmt(pageTotals.basic)}</td>
                                <td class="total-num">${fmt(pageTotals.syndicate)}</td>
                                <td class="total-num">${fmt(pageTotals.variableGroup)}</td>
                                <td class="total-num">${fmt(pageTotals.insurable)}</td>
                                <td class="total-num">${fmt(pageTotals.cash)}</td>
                                <td class="total-num">${fmt(pageTotals.syndicateShare)}</td>
                                <td class="total-num">${fmt(pageTotals.nonPen)}</td>
                                <td class="total-num">${fmt(pageTotals.syndicateFellowship)}</td>
                                <td class="total-num">${fmt(pageTotals.gross)}</td>
                                <td class="total-num">${fmt(pageTotals.insurance)}</td><td class="total-num">${fmt(pageTotals.tax)}</td><td class="total-num">${fmt(pageTotals.stamp)}</td><td class="total-num">${fmt(pageTotals.fellowshipEmp)}</td><td class="total-num">${fmt(pageTotals.penalty)}</td>
                                <td class="total-num">${fmt(pageTotals.loan)}</td><td class="total-num">${fmt(pageTotals.bank)}</td>
                                <td class="total-num">${fmt(pageTotals.settlement)}</td><td class="total-num">${fmt(pageTotals.vodafone)}</td><td class="total-num">${fmt(pageTotals.totalDed)}</td><td class="total-net">${fmt(pageTotals.net)}</td>
                            </tr>
                            <tr class="footer-totals-grand">
                                <td colspan="3" class="total-label-cell">الإجمالي العام</td>
                                <td class="total-num">${fmt(grandTotals.basic)}</td>
                                <td class="total-num">${fmt(grandTotals.syndicate)}</td>
                                <td class="total-num">${fmt(grandTotals.variableGroup)}</td>
                                <td class="total-num">${fmt(grandTotals.insurable)}</td>
                                <td class="total-num">${fmt(grandTotals.cash)}</td>
                                <td class="total-num">${fmt(grandTotals.syndicateShare)}</td>
                                <td class="total-num">${fmt(grandTotals.nonPen)}</td>
                                <td class="total-num">${fmt(grandTotals.syndicateFellowship)}</td>
                                <td class="total-num">${fmt(grandTotals.gross)}</td>
                                <td class="total-num">${fmt(grandTotals.insurance)}</td><td class="total-num">${fmt(grandTotals.tax)}</td><td class="total-num">${fmt(grandTotals.stamp)}</td><td class="total-num">${fmt(grandTotals.fellowshipEmp)}</td><td class="total-num">${grandTotals.penalty > 0 ? fmt(grandTotals.penalty) : '-'}</td>
                                <td class="total-num">${grandTotals.loan > 0 ? fmt(grandTotals.loan) : '-'}</td><td class="total-num">${grandTotals.bank > 0 ? fmt(grandTotals.bank) : '-'}</td>
                                <td class="total-num">${grandTotals.settlement > 0 ? fmt(grandTotals.settlement) : '-'}</td><td class="total-num">${grandTotals.vodafone > 0 ? fmt(grandTotals.vodafone) : '-'}</td><td class="total-num">${fmt(grandTotals.totalDed)}</td><td class="total-net-grand">${fmt(grandTotals.net)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div class="signatures">
                    <div class="sig-box">شئون العاملين<br>..........</div>
                    <div class="sig-box">المراجعة المالية<br>..........</div>
                    <div class="sig-box">المدير المالي<br>..........</div>
                    <div class="sig-box">أمين الصندوق<br>..........</div>
                    <div class="sig-box">رئيس النقابة<br>..........</div>
                </div>
            </div>
        `;
    });

    const content = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <title>استمارة 132 المعتمدة</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
          <style>
              @page { size: A4 landscape; margin: 0; }
              * { box-sizing: border-box; }
              body { font-family: 'Cairo', sans-serif; padding: 0; margin: 0; background: #f3f4f6; -webkit-print-color-adjust: exact; color: #000; direction: rtl; }
              
              .print-page { 
                  width: 297mm; min-height: 209mm; margin: 0 auto; padding: 2mm 4mm; background: white; position: relative; page-break-after: always; display: flex; flex-direction: column; overflow: hidden;
              }
              
              .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #000; padding: 0 2px; margin-bottom: 1px; }
              .table-wrapper { flex: 0 1 auto; width: 100%; overflow: hidden; margin-bottom: 1px; }
              
              table { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0; border: 1px solid #000; }
              
              th, td { 
                  border: 1px solid #000; padding: 2px !important; text-align: center; vertical-align: middle; 
                  font-size: 7.2pt; overflow: visible; line-height: 0.85; 
                  word-wrap: break-word; word-break: break-all;
              }
              
              th { background: #f8fafc; font-weight: 700; font-size: 6.2pt; padding: 1px !important; }
              
              .name-cell { 
                  text-align: right !important; padding-right: 3px !important; font-weight: 700; font-size: 8pt; 
                  white-space: normal !important; width: 150px; line-height: 1; height: 35px;
              }
              
              .num { 
                  font-weight: 700; letter-spacing: -0.3px; font-family: "Arial", sans-serif; 
                  font-size: 7.5pt;
                  white-space: normal !important;
                  height: 35px;
              } 
              
              .bold-cell { background-color: #f9fafb; font-weight: 700; }
              
              .net-column { 
                  background-color: #f0fdf4 !important; color: #166534 !important; font-weight: 700; font-size: 9pt;
                  font-family: "Arial", sans-serif; letter-spacing: -0.2px;
                  white-space: normal !important;
                  height: 35px;
              }
              
              .footer-totals-page { background-color: #374151 !important; color: white !important; }
              .footer-totals-grand { background-color: #111827 !important; color: white !important; }
              
              .total-label-cell {
                  font-weight: 700 !important;
                  font-size: 7.5pt !important;
                  height: 35px !important;
                  text-align: left !important;
                  padding-left: 10px !important;
                  border-color: #4b5563 !important;
              }

              .total-num { 
                  font-size: 8pt !important; 
                  font-weight: 700 !important; 
                  letter-spacing: -0.3px !important; 
                  font-family: "Arial", sans-serif !important;
                  height: 35px !important;
                  padding: 2px !important;
                  border-color: #4b5563 !important;
                  white-space: normal !important;
                  word-break: break-all !important;
              }
              
              .total-net { 
                  background-color: #059669 !important; 
                  color: white !important; 
                  font-size: 9.5pt !important; 
                  font-weight: 700 !important;
                  font-family: "Arial", sans-serif !important;
                  border-color: #059669 !important;
                  white-space: normal !important;
                  height: 35px;
              }

              .total-net-grand { 
                  background-color: #064e3b !important; 
                  color: #fff !important; 
                  font-size: 11pt !important; 
                  font-weight: 700 !important;
                  font-family: "Arial", sans-serif !important;
                  border: 1.5px solid white !important;
                  white-space: normal !important;
                  height: 35px;
              }
              
              .signatures { 
                  margin-top: 5px; 
                  padding: 4px 0; 
                  display: flex; 
                  justify-content: space-around; 
                  text-align: center; 
                  font-weight: 700; 
                  font-size: 8.5pt; 
                  border-top: 1px dashed #000; 
                  page-break-inside: avoid;
              }
              .sig-box { flex: 1; line-height: 1.1; }
              
              @media print { 
                  body { background: white; } .print-page { margin: 0; box-shadow: none; width: 100%; border: none; }
                  #print-btn { display: none; } thead { display: table-header-group; } tfoot { display: table-footer-group; } 
              }
          </style>
      </head>
      <body>
          <button id="print-btn" onclick="window.print()" style="position:fixed; top:20px; right:20px; z-index:1000; padding: 15px 35px; background: #064e3b; color: white; border: none; border-radius: 50px; cursor: pointer; font-family: Cairo; font-weight:700;">طباعة</button>
          ${allPagesHtml}
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
      const totalTaxSum = slipsToPrint.reduce((acc, p) => acc + p.taxDeduction, 0);
      const totalGrossSum = slipsToPrint.reduce((acc, p) => acc + p.grossTotal, 0);
      const categoryTitle = selectedCategory !== 'all' ? EMPLOYMENT_CATEGORIES.find(c => c.id === selectedCategory)?.label : 'جميع العاملين';
      const rowsHtml = slipsToPrint.map((slip, index) => {
          const emp = employees.find(e => e.id === slip.employeeId);
          const totalDeductions = slip.grossTotal - slip.netSalary;
          const otherDeductions = totalDeductions - slip.taxDeduction;
          return `<tr><td>${index + 1}</td><td style="text-align: right; font-weight: bold;">${emp?.name}</td><td>${fmt(slip.basicSalary)}</td><td>${fmt(slip.grossTotal)}</td><td>${fmt(slip.taxDeduction)}</td><td>${fmt(otherDeductions)}</td><td style="font-weight: bold;">${fmt(slip.netSalary)}</td><td>${emp?.bankName || '-'}</td><td></td></tr>`;
      }).join('');
      const content = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><title>صافي مرتبات الموظفين</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"><style>@page { size: A4 landscape; margin: 10mm; } body { font-family: 'Cairo', sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; font-size: 12px; } th, td { border: 1px solid #000; padding: 6px; text-align: center; } th { background: #d1d5db; } .header-container { display: flex; justify-content: space-between; align-items: center; border: 1px solid #000; padding: 15px; border-radius: 8px; background: #e0f2f1; margin-bottom: 20px; } @media print { button { display: none; } } </style></head><body><button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer;">طباعة</button><div class="header-container"><div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 100px;" /></div><div style="text-align:center; flex:1"><h2>نقابة المهندسين الفرعية بأسيوط</h2><h3>كشف صافي المرتبات</h3><p>${categoryTitle}</p><p>عن شهر ${slipsToPrint[0].month} لسنة ${slipsToPrint[0].year}</p></div><div style="width:100px;"></div></div><table><thead><tr><th>م</th><th>اسم الموظف</th><th>الأساسي</th><th>المستحق</th><th>الضريبة</th><th>استقطاعات أخرى</th><th>الصافي</th><th>البنك</th><th>التوقيع</th></tr></thead><tbody>${rowsHtml}<tr><td colspan="3">الإجمالي</td><td>${fmt(totalGrossSum)}</td><td>${fmt(totalTaxSum)}</td><td>${fmt(totalGrossSum - totalNetSum - totalTaxSum)}</td><td>${fmt(totalNetSum)}</td><td colspan="2"></td></tr></tbody></table></body></html>`;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  const printInsuranceSheet = () => {
      const slipsToPrint = selectedIds.length > 0 ? filteredPayrolls.filter(p => selectedIds.includes(p.employeeId)) : filteredPayrolls;
      if (slipsToPrint.length === 0) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      let totalInsuranceAll = 0;
      let totalEmpShareAll = 0;
      let totalOrgShareAll = 0;

      const rows = slipsToPrint.map((slip, idx) => {
          const emp = employees.find(e => e.id === slip.employeeId);
          if (emp?.isPensionSubject === false) return '';
          
          totalEmpShareAll += slip.insuranceEmployeeShare;
          totalOrgShareAll += slip.syndicateSocialShare;
          totalInsuranceAll += slip.totalInsurance;

          return `
            <tr>
                <td>${idx + 1}</td>
                <td style="text-align:right; font-weight:bold;">${emp?.name}</td>
                <td>${emp?.department}</td>
                <td style="font-family:monospace;">${fmt(slip.insurableWage)}</td>
                <td style="font-family:monospace;">${fmt(slip.insuranceEmployeeShare)}</td>
                <td style="font-family:monospace;">${fmt(slip.syndicateSocialShare)}</td>
                <td style="font-family:monospace; font-weight:900; background:#fff7ed;">${fmt(slip.totalInsurance)}</td>
            </tr>
          `;
      }).join('');

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>كشف التأمينات التفصيلي</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: A4 landscape; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; padding: 20px; -webkit-print-color-adjust: exact; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #064e3b; padding-bottom: 10px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 11px; }
                th, td { border: 1px solid #000; padding: 6px; text-align: center; }
                th { background: #f0fdf4; color: #064e3b; font-weight: 900; }
                .total-row { background: #064e3b; color: white; font-weight: 900; }
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">🖨️ طباعة الكشف</button>
            <div class="header">
                <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 80px;" /></div>
                <div style="text-align:center; flex:1">
                    <h2 style="margin:0;">نقابة المهندسين بأسيوط</h2>
                    <h3 style="margin:5px 0;">بيان مبالغ التأمينات الاجتماعية المستحقة (مطابق لاستمارة 132)</h3>
                    <p style="margin:0; font-weight:bold;">عن شهر ${slipsToPrint[0].month} لسنة ${slipsToPrint[0].year}</p>
                </div>
                <div style="width:80px;"></div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>م</th>
                        <th>اسم الموظف</th>
                        <th>الإدارة</th>
                        <th>الأجر التأميني</th>
                        <th>حصة الموظف (11%)</th>
                        <th>حصة صاحب العمل (18.75%)</th>
                        <th>إجمالي التأمينات</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="4" style="text-align:left; padding-left:20px;">الإجمالي العام للكشف</td>
                        <td>${fmt(totalEmpShareAll)}</td>
                        <td>${fmt(totalOrgShareAll)}</td>
                        <td>${fmt(totalInsuranceAll)}</td>
                    </tr>
                </tfoot>
            </table>
            <div style="margin-top:30px; font-size:12px; font-weight:bold; display:flex; justify-content:space-around; text-align:center;">
                <div>إعداد الموارد البشرية<br><br>...................</div>
                <div>المدير المالي<br><br>...................</div>
                <div>يعتمد، أمين الصندوق<br><br>...................</div>
            </div>
        </body>
        </html>
      `;
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
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 border border-emerald-200 rounded-lg px-3 py-2 bg-emerald-50/50">
                    <Filter size={18} className="text-emerald-600" />
                    <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedIds([]); }} className="bg-transparent outline-none text-sm font-bold text-emerald-800 border-l border-emerald-300 pl-2 ml-2"><option value="all">جميع الأقسام</option>{Array.from(new Set(employees.map(e => e.department))).map(dept => <option key={dept} value={dept}>{dept}</option>)}</select>
                    <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedIds([]); }} className="bg-transparent outline-none text-sm font-bold text-emerald-800"><option value="all">جميع الفئات</option>{EMPLOYMENT_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}</select>
                </div>
                <div className="flex items-center gap-2 border border-emerald-200 rounded-lg px-3 py-2 bg-white">
                    <Calendar size={18} className="text-emerald-500" />
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-transparent outline-none text-sm font-bold text-emerald-800 border-l border-emerald-200 pl-2 ml-2">{months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent outline-none text-sm font-bold text-emerald-800">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                </div>
                <div className="relative"><Search className="absolute right-3 top-2.5 text-emerald-400" size={16} /><input type="text" placeholder="بحث الاسم/الرقم..." className="pl-4 pr-9 py-2 border border-emerald-200 rounded-lg outline-none bg-white text-sm w-36" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <div className="relative"><FileIcon className="absolute right-3 top-2.5 text-emerald-400" size={16} /><input type="text" placeholder="رقم المستند" className="pl-4 pr-9 py-2 border border-emerald-200 rounded-lg outline-none bg-white text-sm w-32 font-mono" value={searchDocNum} onChange={(e) => setSearchDocNum(e.target.value)} /></div>
                <div className="text-xs text-emerald-600 font-medium">{filteredPayrolls.length} موظف</div>
            </div>
            <div className="flex gap-2 flex-wrap">
                 <button onClick={() => printForm132(filteredPayrolls.filter(p => selectedIds.includes(p.employeeId)))} disabled={selectedIds.length === 0} className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 transition-colors text-sm font-bold"><FileSpreadsheet size={16} />طباعة</button>
                <button onClick={printNetSalarySheet} className="flex items-center gap-2 bg-emerald-800 text-white px-3 py-2 rounded-lg hover:bg-emerald-900 transition-colors text-sm font-bold"><FileText size={16} />كشف الصافي</button>
                 <button onClick={printInsuranceSheet} className="flex items-center gap-2 bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-bold"><ShieldCheck size={16} />كشف التأمينات</button>
                <button onClick={() => printForm132(filteredPayrolls)} className="flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-bold"><Printer size={16} />طباعة الكل</button>
            </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[1800px]">
                <thead className="bg-emerald-50 border-b border-emerald-100">
                    <tr>
                        <th className="p-4 w-12 text-center"><button onClick={toggleSelectAll}>{selectedIds.length === filteredPayrolls.length && filteredPayrolls.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}</button></th>
                        <th className="p-4 text-xs font-bold text-emerald-800 uppercase">الموظف</th>
                        <th className="p-4 text-xs font-bold text-emerald-800 uppercase">الأساسي</th>
                        <th className="p-4 text-xs font-bold text-emerald-600 uppercase">حافز إضافي</th>
                        <th className="p-4 text-xs font-bold text-blue-600 uppercase">بدلات أخرى</th>
                        <th className="p-4 text-xs font-bold text-amber-600 uppercase">غير خاضع</th>
                        <th className="p-4 text-xs font-bold text-emerald-800 uppercase">مكافآت</th>
                        <th className="p-4 text-xs font-bold text-emerald-800 uppercase">جزاءات</th>
                        <th className="p-4 text-xs font-bold text-red-600 uppercase">تأمينات</th>
                        <th className="p-4 text-xs font-bold text-red-600 uppercase">ضرائب</th>
                        <th className="p-4 text-xs font-bold text-red-600 uppercase">سلف</th>
                        <th className="p-4 text-xs font-bold text-blue-600 uppercase">قسط بنك</th>
                        <th className="p-4 text-xs font-bold text-rose-600 uppercase">فودافون</th>
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
                                <td className="p-4 text-center"><button onClick={() => toggleSelectOne(slip.employeeId)} className={isSelected ? 'text-emerald-600' : 'text-slate-300'}>{isSelected ? <CheckSquare size={20} /> : <Square size={20} />}</button></td>
                                <td className="p-4 font-medium text-slate-800"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{employee?.name.charAt(0)}</div><div className="flex flex-col"><span>{employee?.name}</span><span className="text-[10px] text-slate-400">{employee?.documentNumber ? `مستند: ${employee.documentNumber}` : employee?.position}</span></div></div></td>
                                <td className="p-4 text-slate-600 font-mono">{slip.basicSalary}</td>
                                <td className="p-4 text-emerald-600 font-mono font-bold bg-emerald-50/50">{slip.additionalIncentive}</td>
                                <td className="p-4 text-blue-600 font-mono font-medium">{slip.allowancesTotal}</td>
                                <td className="p-4 text-amber-600 font-mono font-bold bg-amber-50/30">{slip.nonPensionableTotal}</td>
                                <td className="p-4"><input type="number" className="w-16 border border-slate-300 rounded px-1 py-1 text-sm outline-none" value={incentives[slip.employeeId] || ''} onChange={(e) => handleCalcChange(slip.employeeId, 'incentive', e.target.value)} /></td>
                                <td className="p-4"><input type="number" className="w-16 border border-slate-300 rounded px-1 py-1 text-sm outline-none" value={penalties[slip.employeeId] || ''} onChange={(e) => handleCalcChange(slip.employeeId, 'penalty', e.target.value)} /></td>
                                <td className="p-4 text-red-500 font-mono text-sm">-{slip.totalInsurance}</td>
                                <td className="p-4 text-red-500 font-mono text-sm">-{slip.taxDeduction}</td>
                                <td className="p-4 text-red-500 font-mono text-sm font-bold">{Math.abs(slip.loanDeduction) > 0.01 ? `-${slip.loanDeduction}` : '-'}</td>
                                <td className="p-4 text-blue-600 font-mono text-sm font-bold bg-blue-50/30">{Math.abs(slip.bankInstallment) > 0.01 ? `-${slip.bankInstallment}` : '-'}</td>
                                <td className="p-4 text-rose-500 font-mono text-sm">{slip.vodafoneDeduction > 0 ? `-${slip.vodafoneDeduction}` : '-'}</td>
                                <td className="p-4 bg-emerald-50 font-bold text-emerald-700 font-mono text-lg border-l border-emerald-100">{slip.netSalary.toLocaleString()}</td>
                                <td className="p-4 flex gap-2 justify-center"><button onClick={() => printSimplePayslip(slip)} className="bg-white border border-emerald-200 text-emerald-700 px-3 py-1 rounded text-xs font-bold hover:bg-emerald-50 flex items-center gap-1 shadow-sm"><FileIcon size={14} />مفردات</button></td>
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
