
import React, { useState } from 'react';
import { Employee, PerformanceReview } from '../types';
import { Search, Printer, FileBadge, User } from 'lucide-react';
import { JOB_GRADES } from '../constants';
import { calculateSalary } from '../utils/payrollLogic';

interface StatusStatementProps {
  employees: Employee[];
  reviews: PerformanceReview[];
  penalties: Record<string, number>;
}

export const StatusStatement: React.FC<StatusStatementProps> = ({ employees, reviews, penalties }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => 
    emp.name.includes(searchTerm) || emp.nationalId.includes(searchTerm)
  );

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
          default: return 'مؤهل عالي';
      }
  };

  const printStatement = () => {
      if (!selectedEmp) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const gradeInfo = JOB_GRADES.find(g => g.id === selectedEmp.grade);
      
      // Calculate Financials on the fly based on current logic
      const payroll = calculateSalary(selectedEmp, [], reviews);
      
      const educationIncentive = payroll.educationExperienceBonus > 0 
        ? (selectedEmp.educationLevel === 'phd' || selectedEmp.educationLevel === 'master' ? 'يستحق حافز تميز علمي' : 'يستحق علاوة مؤهل') 
        : 'لا يوجد';

      const empPenalty = penalties[selectedEmp.id] || 0;
      
      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>بيان حالة وظيفية - ${selectedEmp.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; padding: 10px; background: white; color: #000; zoom: 90%; }
                .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #064e3b; padding-bottom: 10px; margin-bottom: 20px; }
                .header-text { text-align: center; flex: 1; }
                .header-text h2 { margin: 5px 0; color: #064e3b; font-size: 22px; }
                .header-text h3 { margin: 5px 0; font-size: 16px; }
                
                .section-title { 
                    background-color: #ecfdf5; 
                    color: #064e3b; 
                    padding: 5px 15px; 
                    font-weight: bold; 
                    border-right: 5px solid #064e3b;
                    margin-top: 15px;
                    margin-bottom: 10px;
                    font-size: 14px;
                }

                .grid-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 5px;
                }

                .info-row {
                    display: flex;
                    border-bottom: 1px dotted #ccc;
                    padding-bottom: 2px;
                    margin-bottom: 2px;
                    font-size: 12px;
                }
                
                .label { font-weight: bold; width: 130px; color: #333; }
                .value { flex: 1; font-weight: 600; color: #000; }

                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                th, td { border: 1px solid #000; padding: 6px; text-align: center; }
                th { background-color: #f0fdf4; font-weight: bold; }

                .footer { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; font-weight: bold; font-size: 12px; }
                
                @media print { 
                    button { display: none; } 
                    body { -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">🖨️ طباعة البيان</button>
            
            <div class="header-container">
                <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 120px;" /></div>
                <div class="header-text">
                    <h3>نقابة المهندسين - الفرعية بأسيوط</h3>
                    <h2>بيان حالة وظيفية</h2>
                    <p style="margin:0; font-size:12px;">تحريراً في: ${new Date().toLocaleDateString('ar-EG')}</p>
                </div>
                <div style="width: 120px;"></div>
            </div>

            <div class="section-title">أولاً: البيانات الشخصية</div>
            <div class="grid-container">
                <div class="info-row"><span class="label">الاسم رباعي:</span><span class="value">${selectedEmp.name}</span></div>
                <div class="info-row"><span class="label">الرقم القومي:</span><span class="value">${selectedEmp.nationalId}</span></div>
                
                <div class="info-row"><span class="label">تاريخ التعيين:</span><span class="value">${selectedEmp.joinDate}</span></div>
                <div class="info-row"><span class="label">الرقم التأميني:</span><span class="value">${selectedEmp.insuranceNumber || '-'}</span></div>

                <div class="info-row"><span class="label">العنوان:</span><span class="value">${selectedEmp.address || '-'}</span></div>
                <div class="info-row"><span class="label">رقم الهاتف:</span><span class="value">${selectedEmp.phone}</span></div>

                <div class="info-row"><span class="label">الحالة الاجتماعية:</span><span class="value">${getMaritalLabel(selectedEmp.maritalStatus)}</span></div>
                <div class="info-row"><span class="label">الموقف التجنيدي:</span><span class="value">${getMilitaryLabel(selectedEmp.militaryStatus)}</span></div>
                
                <div class="info-row"><span class="label">البريد الإلكتروني:</span><span class="value">${selectedEmp.email || '-'}</span></div>
            </div>

            <div class="section-title">ثانياً: المؤهلات والدرجة الوظيفية</div>
            <div class="grid-container">
                <div class="info-row"><span class="label">المؤهل الدراسي:</span><span class="value">${getEducationLabel(selectedEmp.educationLevel)}</span></div>
                <div class="info-row"><span class="label">الإدارة / القسم:</span><span class="value">${selectedEmp.department}</span></div>
                <div class="info-row"><span class="label">المسمى الوظيفي:</span><span class="value">${selectedEmp.position}</span></div>
                <div class="info-row"><span class="label">الدرجة الحالية:</span><span class="value">${gradeInfo ? gradeInfo.name : '-'}</span></div>
            </div>

            <div class="section-title">ثالثاً: البيانات المالية والعلاوات</div>
            <table>
                <thead>
                    <tr>
                        <th width="40%">البيان</th>
                        <th>التفاصيل / القيمة</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>العلاوات الخاصة (2015)</td>
                        <td>${payroll.specialRaise2015.toLocaleString()} ج.م (10% من الأساسي)</td>
                    </tr>
                    <tr>
                        <td>حافز التميز العلمي / المؤهل</td>
                        <td>${educationIncentive} (${payroll.educationExperienceBonus.toLocaleString()} ج.م)</td>
                    </tr>
                    <tr>
                        <td>علاوة غلاء معيشة (حزمة اجتماعية)</td>
                        <td>${payroll.socialPackage.toLocaleString()} ج.م</td>
                    </tr>
                    <tr>
                        <td>الحافز الإضافي للدرجة</td>
                        <td>${payroll.additionalIncentive.toLocaleString()} ج.م</td>
                    </tr>
                    <tr>
                        <td>الجزاءات (الشهر الحالي)</td>
                        <td style="color:${empPenalty > 0 ? '#b91c1c' : 'inherit'}; font-weight:bold;">
                            ${empPenalty > 0 ? `${empPenalty.toLocaleString()} جنيه مصري` : 'لا يوجد جزاءات مسجلة'}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top: 15px; font-size: 11px; color: #666;">
                * هذا البيان مستخرج من واقع سجلات الموارد البشرية بالنقابة وتم إعداده بناءً على طلب الموظف لتقديمه لمن يهمه الأمر.
            </div>

            <div class="footer">
                <div>إعداد / الموارد البشرية<br><br>......................</div>
                <div>مدير الموارد البشرية<br><br>......................</div>
                <div>اعتماد المدير العام<br><br>......................</div>
            </div>
        </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-emerald-900">بيان الحالة الوظيفية</h2>
        <p className="text-emerald-600 mt-1">استخراج تقرير تفصيلي ببيانات الموظف الشخصية والمالية</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar List */}
          <div className="w-1/3 bg-white rounded-xl shadow-sm border border-emerald-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-emerald-100 bg-emerald-50/50">
                  <div className="relative">
                      <Search className="absolute right-3 top-3 text-emerald-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="ابحث عن موظف..." 
                        className="w-full pl-4 pr-10 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredEmployees.map(emp => (
                      <button 
                        key={emp.id}
                        onClick={() => setSelectedEmp(emp)}
                        className={`w-full text-right p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedEmp?.id === emp.id ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-emerald-50 text-slate-700'}`}
                      >
                          <div className="w-8 h-8 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold">
                              {emp.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                              <p className="text-sm truncate">{emp.name}</p>
                              <p className="text-[10px] opacity-70">{emp.position}</p>
                          </div>
                      </button>
                  ))}
              </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-emerald-100 p-8 overflow-y-auto">
              {selectedEmp ? (
                  <div className="animate-fade-in">
                      <div className="flex justify-between items-start mb-6 border-b border-emerald-100 pb-4">
                          <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-bold">
                                  {selectedEmp.name.charAt(0)}
                              </div>
                              <div>
                                  <h2 className="text-2xl font-bold text-emerald-900">{selectedEmp.name}</h2>
                                  <p className="text-emerald-600">{selectedEmp.position} - {selectedEmp.department}</p>
                              </div>
                          </div>
                          <button 
                            onClick={printStatement}
                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-md transition-colors"
                          >
                              <Printer size={20} />
                              طباعة البيان
                          </button>
                      </div>

                      <div className="space-y-6">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                  <User size={18} /> البيانات الشخصية
                              </h4>
                              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                                  <div className="flex justify-between border-b border-slate-200 pb-1">
                                      <span className="text-slate-500">الرقم القومي</span>
                                      <span className="font-bold text-slate-800">{selectedEmp.nationalId}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-200 pb-1">
                                      <span className="text-slate-500">رقم الهاتف</span>
                                      <span className="font-bold text-slate-800">{selectedEmp.phone}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-200 pb-1">
                                      <span className="text-slate-500">الحالة الاجتماعية</span>
                                      <span className="font-bold text-slate-800">{getMaritalLabel(selectedEmp.maritalStatus)}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-200 pb-1">
                                      <span className="text-slate-500">الموقف التجنيدي</span>
                                      <span className="font-bold text-slate-800">{getMilitaryLabel(selectedEmp.militaryStatus)}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-200 pb-1">
                                      <span className="text-slate-500">العنوان</span>
                                      <span className="font-bold text-slate-800">{selectedEmp.address || '-'}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-200 pb-1">
                                      <span className="text-slate-500">الرقم التأميني</span>
                                      <span className="font-bold text-slate-800">{selectedEmp.insuranceNumber || '-'}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                              <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                  <FileBadge size={18} /> البيانات المالية والإدارية
                              </h4>
                              <div className="text-sm space-y-2">
                                  <div className="flex justify-between bg-white p-2 rounded border border-emerald-100">
                                      <span className="text-emerald-700">المؤهل الدراسي</span>
                                      <span className="font-bold">{getEducationLabel(selectedEmp.educationLevel)}</span>
                                  </div>
                                  <div className="flex justify-between bg-white p-2 rounded border border-emerald-100">
                                      <span className="text-emerald-700">حافز التميز العلمي</span>
                                      <span className="font-bold">
                                          {selectedEmp.educationLevel === 'phd' || selectedEmp.educationLevel === 'master' ? 'مستحق' : 'غير مستحق (أو علاوة مؤهل)'}
                                      </span>
                                  </div>
                                  <div className="flex justify-between bg-white p-2 rounded border border-emerald-100">
                                      <span className="text-emerald-700">علاوة 2015 / غلاء معيشة</span>
                                      <span className="font-bold">مدرجة بالمرتب</span>
                                  </div>
                                  <div className="flex justify-between bg-white p-2 rounded border border-emerald-100">
                                      <span className="text-emerald-700">الجزاءات (الحالية)</span>
                                      <span className={`font-bold ${penalties[selectedEmp.id] > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                                          {penalties[selectedEmp.id] > 0 ? `${penalties[selectedEmp.id]} ج.م` : 'لا يوجد'}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <FileBadge size={64} className="mb-4 text-emerald-100" />
                      <p className="text-lg font-medium text-emerald-800">اختر موظفاً لعرض بيان الحالة</p>
                      <p className="text-sm">يمكنك البحث بالاسم أو الرقم القومي</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
