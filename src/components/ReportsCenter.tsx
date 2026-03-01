
import React from 'react';
import { Employee, LeaveRequest, Loan } from '../types';
import { Printer, Users, Calendar, Wallet } from 'lucide-react';

interface ReportsCenterProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  loans: Loan[];
}

export const ReportsCenter: React.FC<ReportsCenterProps> = ({ employees, leaves, loans }) => {
  
  const printReport = (title: string, columns: string[], rows: string[][], footerRow?: string[]) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const date = new Date().toLocaleDateString('ar-EG');
      
      const tableRows = rows.map((row, index) => `
        <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${index + 1}</td>
            ${row.map(cell => `<td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${cell}</td>`).join('')}
        </tr>
      `).join('');

      const tableHeaders = columns.map(col => `<th style="padding: 10px; border: 1px solid #94a3b8; background-color: #ecfdf5; color: #064e3b; text-align: center;">${col}</th>`).join('');

      // إنشاء سطر الإجماليات إذا وجد
      let footerHtml = '';
      if (footerRow) {
          footerHtml = `
            <tfoot style="background-color: #064e3b; color: white; font-weight: 900; font-size: 14px;">
                <tr>
                    <td colspan="2" style="padding: 12px; border: 1px solid #000; text-align: left; padding-left: 20px;">الإجمالي العام</td>
                    ${footerRow.map(cell => `<td style="padding: 12px; border: 1px solid #000; text-align: center;">${cell}</td>`).join('')}
                </tr>
            </tfoot>
          `;
      }

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>${title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Cairo', sans-serif; padding: 40px; background: white; -webkit-print-color-adjust: exact; }
                .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #064e3b; padding-bottom: 20px; margin-bottom: 30px; }
                .header-text { text-align: center; flex: 1; }
                .header-text h2 { font-size: 24px; color: #064e3b; margin: 0; }
                .header-text h3 { font-size: 18px; color: #047857; margin: 5px 0; }
                
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
                th { font-weight: 800; }
                td { color: #1e293b; border: 1px solid #94a3b8; }
                
                .footer-box-sign { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 14px; }
                .footer-box-sign div p { margin-bottom: 40px; font-weight: bold; }
                .line { border-bottom: 1px dotted #000; width: 150px; margin: 0 auto; }
                
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px; font-family: 'Cairo';">🖨️ طباعة التقرير</button>
            
            <div class="header-container">
                <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 120px;" /></div>
                <div class="header-text">
                    <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                    <h3>${title}</h3>
                    <p style="font-size: 12px; color: #666;">تاريخ التقرير: ${date}</p>
                </div>
                <div style="width: 120px;"></div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th width="5%">م</th>
                        ${tableHeaders}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
                ${footerHtml}
            </table>

            <div class="footer-box-sign">
                <div>
                    <p>إعداد / الموارد البشرية</p>
                    <div class="line"></div>
                </div>
                <div>
                    <p>يعتمد / المدير العام</p>
                    <div class="line"></div>
                </div>
            </div>
        </body>
        </html>
      `;

      printWindow.document.write(content);
      printWindow.document.close();
  };

  // التقرير 1: بيان قوة العمل
  const handlePrintEmployees = () => {
      const cols = ['اسم الموظف', 'الرقم القومي', 'القسم', 'الوظيفة', 'تاريخ التعيين'];
      const rows = employees.map(e => [e.name, e.nationalId, e.department, e.position, e.joinDate]);
      printReport('بيان بجميع العاملين بالنقابة', cols, rows);
  };

  // التقرير 2: الإجازات الشهرية
  const handlePrintLeaves = () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentLeaves = leaves.filter(l => {
          const leaveMonth = new Date(l.startDate).getMonth() + 1;
          return leaveMonth === currentMonth;
      });
      const cols = ['اسم الموظف', 'نوع الإجازة/المأمورية', 'من تاريخ', 'إلى تاريخ', 'السبب/الوجهة', 'الحالة'];
      const rows = currentLeaves.map(l => {
          const emp = employees.find(e => e.id === l.employeeId);
          const typeLabel = l.type === 'mission' ? 'مأمورية' : 'إجازة';
          const details = l.type === 'mission' ? l.location : l.reason;
          return [emp?.name || '-', typeLabel, l.startDate, l.endDate, details || '-', l.status === 'approved' ? 'مقبول' : 'معلق'];
      });
      printReport(`تقرير الإجازات والمأموريات لشهر ${currentMonth}`, cols, rows);
  };

  // التقرير 3: موقف السلف (مع الإجماليات)
  const handlePrintLoans = () => {
      const activeLoans = loans.filter(l => l.status === 'active');
      
      // حساب الإجماليات
      let totalLoanSum = 0;
      let totalRemainingSum = 0;
      let totalInstallmentSum = 0;

      const cols = ['اسم الموظف', 'إجمالي قيمة السلفة', 'المبلغ المتبقي', 'القسط الشهري', 'تاريخ البدء'];
      
      const rows = activeLoans.map(l => {
          const emp = employees.find(e => e.id === l.employeeId);
          
          totalLoanSum += l.totalAmount;
          totalRemainingSum += l.remainingAmount;
          totalInstallmentSum += l.monthlyInstallment;

          return [
              emp?.name || '-', 
              l.totalAmount.toLocaleString(), 
              l.remainingAmount.toLocaleString(), 
              l.monthlyInstallment.toLocaleString(), 
              l.startDate
          ];
      });

      // إنشاء سطر الإجماليات (يتجاهل المسلسل والاسم عبر colspan ويملأ باقي الأعمدة)
      const footerRow = [
          totalLoanSum.toLocaleString(),
          totalRemainingSum.toLocaleString(),
          totalInstallmentSum.toLocaleString(),
          '-' // عمود تاريخ البدء في سطر الإجمالي
      ];

      printReport('بيان السلف المالية المستحقة على العاملين', cols, rows, footerRow);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-emerald-900">مركز التقارير والإحصائيات</h2>
        <p className="text-emerald-600 mt-1">طباعة تقارير رسمية معتمدة للإدارة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex flex-col items-center text-center hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users size={32} />
              </div>
              <h3 className="font-bold text-lg text-emerald-900 mb-2">بيان قوة العمل</h3>
              <p className="text-sm text-slate-500 mb-6">تقرير شامل بأسماء جميع الموظفين، الأقسام، وتواريخ التعيين.</p>
              <button onClick={handlePrintEmployees} className="w-full py-2 bg-white border border-blue-200 text-blue-700 font-bold rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2">
                  <Printer size={18} />
                  طباعة الكشف
              </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex flex-col items-center text-center hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Calendar size={32} />
              </div>
              <h3 className="font-bold text-lg text-emerald-900 mb-2">الإجازات الشهرية</h3>
              <p className="text-sm text-slate-500 mb-6">كشف بالإجازات والمأموريات المسجلة خلال الشهر الحالي.</p>
              <button onClick={handlePrintLeaves} className="w-full py-2 bg-white border border-amber-200 text-amber-700 font-bold rounded-lg hover:bg-amber-50 flex items-center justify-center gap-2">
                  <Printer size={18} />
                  طباعة الكشف
              </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex flex-col items-center text-center hover:shadow-md transition-all group shadow-emerald-900/10">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Wallet size={32} />
              </div>
              <h3 className="font-bold text-lg text-emerald-900 mb-2">موقف السلف</h3>
              <p className="text-sm text-slate-500 mb-6">تقرير مالي يوضح أرصدة السلف المتبقية على الموظفين مع الإجماليات.</p>
              <button onClick={handlePrintLoans} className="w-full py-2 bg-white border border-red-200 text-red-700 font-bold rounded-lg hover:bg-red-50 flex items-center justify-center gap-2">
                  <Printer size={18} />
                  طباعة الكشف
              </button>
          </div>

      </div>
    </div>
  );
};
