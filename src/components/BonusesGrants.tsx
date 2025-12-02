
import React, { useState } from 'react';
import { Employee, BonusRecord } from '../types';
import { Gift, Plus, CheckSquare, Square, Filter, Coins, Clock, Printer, Search, Calculator, Trash2 } from 'lucide-react';
import { EMPLOYMENT_CATEGORIES } from '../constants';

interface BonusesGrantsProps {
  employees: Employee[];
  bonuses: BonusRecord[];
  setBonuses: (bonuses: BonusRecord[]) => void;
}

export const BonusesGrants: React.FC<BonusesGrantsProps> = ({ employees, bonuses, setBonuses }) => {
  const [activeTab, setActiveTab] = useState<'bonus' | 'grant'>('bonus');
  
  // Selection States
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Add Form State
  const [selectedType, setSelectedType] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState('10'); // Default Tax Percentage
  
  // Overtime specific state
  const [standardHours, setStandardHours] = useState('');
  const [restHours, setRestHours] = useState('');

  // Search/Filter History State
  const [searchName, setSearchName] = useState('');
  const [searchDateFrom, setSearchDateFrom] = useState('');
  const [searchDateTo, setSearchDateTo] = useState('');

  const bonusTypes = [
      'جهود غير عادية',
      'جهود مبذولة',
      'مكافأة دمغة هندسية',
      'مكافأة إضافي'
  ];

  const grantTypes = [
      'المولد النبوي الشريف',
      'عيد الفطر المبارك',
      'عيد الأضحى المبارك',
      'دخول مدارس',
      'نهاية السنة',
      'الميزانية',
      'الجمعية العمومية',
      'منحة الدمغة'
  ];

  // Filtering Employees for Selection
  const filteredEmployees = employees.filter(e => {
      const matchDept = selectedDept === 'all' || e.department === selectedDept;
      const matchCat = selectedCategory === 'all' || e.employmentCategory === selectedCategory;
      return matchDept && matchCat;
  });

  // Selection Logic
  const toggleSelectAll = () => {
      if (selectedIds.length === filteredEmployees.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(filteredEmployees.map(e => e.id));
      }
  };

  const toggleSelectOne = (id: string) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(sid => sid !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  // Add Handler with New Formulas
  const handleAdd = () => {
      if (selectedIds.length === 0) {
          alert('يرجى اختيار موظف واحد على الأقل');
          return;
      }
      if (!selectedType) {
          alert('يرجى اختيار نوع البند');
          return;
      }

      const isOvertime = selectedType === 'مكافأة إضافي';
      
      if (!isOvertime && !amount) {
          alert('يرجى إدخال المبلغ');
          return;
      }
      if (isOvertime && !standardHours && !restHours) {
          alert('يرجى إدخال عدد ساعات الإضافي');
          return;
      }

      const appliedTaxRate = parseFloat(taxRate) || 0;

      const newRecords: BonusRecord[] = selectedIds.map(empId => {
          let grossAmount = 0;
          let details = '';

          if (isOvertime) {
              const emp = employees.find(e => e.id === empId);
              if (emp) {
                  // New Overtime Logic:
                  // Standard: (Basic / 182) * 1.35 * Hours
                  // Rest Days: (Basic / 210) * 2.0 * Hours
                  const stdHourlyRate = (emp.basicSalary / 182) * 1.35;
                  const restHourlyRate = (emp.basicSalary / 210) * 2.0;

                  const stdVal = (Number(standardHours) || 0) * stdHourlyRate;
                  const restVal = (Number(restHours) || 0) * restHourlyRate;
                  
                  grossAmount = parseFloat((stdVal + restVal).toFixed(2));
                  
                  const stdTxt = standardHours ? `${standardHours} س عادي` : '';
                  const restTxt = restHours ? `${restHours} س راحات` : '';
                  details = [stdTxt, restTxt].filter(Boolean).join(' + ');
              }
          } else {
              grossAmount = Number(amount);
          }

          // Calculate Deductions
          // Stamp Duty: usually 0.6% on the gross amount
          const stampAmount = parseFloat((grossAmount * 0.006).toFixed(2));
          
          // Tax: Based on user input percentage
          const taxAmount = parseFloat((grossAmount * (appliedTaxRate / 100)).toFixed(2));

          // Net
          const netAmount = parseFloat((grossAmount - stampAmount - taxAmount).toFixed(2));

          return {
              id: `BNS-${Date.now()}-${Math.random()}`,
              employeeId: empId,
              type: selectedType,
              category: isOvertime ? 'overtime' : activeTab,
              amount: grossAmount, // Storing Gross for Main Payroll Compatibility
              
              grossAmount,
              taxRate: appliedTaxRate,
              taxAmount,
              stampAmount,
              netAmount,

              date: new Date().toISOString().split('T')[0],
              details: details
          };
      });

      setBonuses([...bonuses, ...newRecords]);
      alert(`تم إضافة ${selectedType} لـ ${selectedIds.length} موظف بنجاح`);
      
      // Reset
      setSelectedIds([]);
      setStandardHours('');
      setRestHours('');
      setAmount('');
  };

  const handleDeleteBonus = (id: string) => {
      if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
          setBonuses(bonuses.filter(b => b.id !== id));
      }
  };

  // Filter History Data based on Search
  const filteredHistory = bonuses.filter(b => {
      const emp = employees.find(e => e.id === b.employeeId);
      const nameMatch = searchName ? emp?.name.includes(searchName) : true;
      const fromMatch = searchDateFrom ? b.date >= searchDateFrom : true;
      const toMatch = searchDateTo ? b.date <= searchDateTo : true;
      return nameMatch && fromMatch && toMatch;
  });

  // Sort history by date descending
  filteredHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const printBonusReport = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const vouchersHtml = filteredHistory.map((b, i) => {
          const emp = employees.find(e => e.id === b.employeeId);
          
          // SAFE FALLBACKS FOR LEGACY DATA
          const safeGross = b.grossAmount || b.amount || 0;
          const safeTax = b.taxAmount || 0;
          const safeStamp = b.stampAmount || 0;
          const safeNet = b.netAmount || (safeGross - safeTax - safeStamp) || 0;
          
          return `
            <div class="voucher-page">
                <div class="header-container">
                    <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 120px;" /></div>
                    <div class="header-text">
                        <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                        <h3>استمارة صرف (مكافأة / منحة)</h3>
                        <p>رقم القيد: ${b.id.split('-')[1] || i}</p>
                    </div>
                    <div style="width: 120px;"></div>
                </div>

                <div class="info-box">
                    <table class="info-table">
                        <tr>
                            <td class="label">اسم الموظف:</td>
                            <td class="val">${emp?.name || '-'}</td>
                            <td class="label">القسم:</td>
                            <td class="val">${emp?.department || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">تاريخ الاستحقاق:</td>
                            <td class="val">${b.date}</td>
                            <td class="label">نوع الصرف:</td>
                            <td class="val">${b.type}</td>
                        </tr>
                        <tr>
                            <td class="label">تفاصيل الاحتساب:</td>
                            <td colspan="3" class="val">${b.details || 'مبلغ مقطوع'}</td>
                        </tr>
                    </table>
                </div>

                <div class="financial-section">
                    <h3>البيان المالي</h3>
                    <table class="financial-table">
                        <thead>
                            <tr>
                                <th>المبلغ الإجمالي (Gross)</th>
                                <th>قيمة الضريبة (${b.taxRate || 0}%)</th>
                                <th>الدمغة</th>
                                <th>صافي المستحق للصرف</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${safeGross.toLocaleString()} ج.م</td>
                                <td style="color: #b91c1c;">${safeTax.toLocaleString()} ج.م</td>
                                <td style="color: #b45309;">${safeStamp.toLocaleString()} ج.م</td>
                                <td class="net-cell">${safeNet.toLocaleString()} جنيه مصري</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="margin-top: 10px; font-size: 12px; font-weight: bold;">
                        فقط وقدره: ${safeNet} جنيهاً مصرياً لا غير.
                    </div>
                </div>

                <div class="signatures">
                    <div>إعداد الموارد البشرية<br><br>......................</div>
                    <div>المراجعة<br><br>......................</div>
                    <div>المدير المالي<br><br>......................</div>
                    <div>اعتماد الصرف<br><br>......................</div>
                </div>
                
                <div class="footer-note">
                    تم استخراج هذا المستند من النظام الإلكتروني لنقابة المهندسين - فرع أسيوط
                </div>
            </div>
          `;
      }).join('');

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>طباعة استمارات المكافآت</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; background: white; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
                
                .voucher-page {
                    width: 100%;
                    min-height: 95vh; /* Force full page height */
                    border: 2px solid #000;
                    padding: 30px;
                    box-sizing: border-box;
                    position: relative;
                    page-break-after: always; /* KEY: Force new page after each voucher */
                    display: flex;
                    flex-direction: column;
                }

                .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #064e3b; padding-bottom: 20px; margin-bottom: 40px; }
                .header-text { text-align: center; flex: 1; }
                .header-text h2 { margin: 0; font-size: 24px; color: #064e3b; }
                .header-text h3 { margin: 10px 0; font-size: 20px; text-decoration: underline; }
                .header-text p { margin: 0; font-size: 12px; color: #666; }

                .info-box { margin-bottom: 40px; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 12px; border-bottom: 1px dotted #ccc; font-size: 16px; }
                .label { font-weight: bold; width: 150px; color: #374151; }
                .val { font-weight: bold; color: #000; }

                .financial-section h3 { background: #ecfdf5; padding: 10px; color: #064e3b; border-right: 5px solid #064e3b; margin-bottom: 15px; }
                .financial-table { width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 20px; }
                .financial-table th { background: #f3f4f6; border: 1px solid #000; padding: 12px; font-size: 14px; }
                .financial-table td { border: 1px solid #000; padding: 15px; font-weight: bold; font-size: 16px; }
                .net-cell { background-color: #dcfce7; font-size: 20px !important; border: 2px solid #000 !important; }

                .signatures { margin-top: auto; display: flex; justify-content: space-between; text-align: center; font-weight: bold; font-size: 14px; padding-top: 50px; }
                
                .footer-note { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; }

                @media print {
                    button { display: none; }
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 20px; font-family: 'Cairo'; font-size: 16px;">🖨️ طباعة الاستمارات</button>
            ${vouchersHtml}
        </body>
        </html>
      `;

      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-emerald-900">المكافآت والمنح</h2>
            <p className="text-emerald-600 mt-1">إدارة صرف المكافآت، الجهود غير العادية، والمنح الموسمية</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-emerald-200">
            <button onClick={() => setActiveTab('bonus')} className={`px-4 py-2 rounded-md font-bold transition-all ${activeTab === 'bonus' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>المكافآت والإضافي</button>
            <button onClick={() => setActiveTab('grant')} className={`px-4 py-2 rounded-md font-bold transition-all ${activeTab === 'grant' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>المنح والمناسبات</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Form */}
          <div className="xl:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                  <h3 className="font-bold text-lg text-emerald-900 mb-4 flex items-center gap-2">
                      <Plus size={20} />
                      {activeTab === 'bonus' ? 'إضافة مكافأة / إضافي' : 'صرف منحة'}
                  </h3>

                  {/* Filters for Selection */}
                  <div className="space-y-3 mb-4 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-2 text-sm text-emerald-800 font-bold mb-1">
                          <Filter size={16} /> تصفية الموظفين:
                      </div>
                      <select 
                          className="w-full p-2 border rounded bg-white text-sm"
                          value={selectedDept}
                          onChange={(e) => { setSelectedDept(e.target.value); setSelectedIds([]); }}
                      >
                          <option value="all">كل الأقسام</option>
                          {Array.from(new Set(employees.map(e => e.department))).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select 
                          className="w-full p-2 border rounded bg-white text-sm"
                          value={selectedCategory}
                          onChange={(e) => { setSelectedCategory(e.target.value); setSelectedIds([]); }}
                      >
                          <option value="all">كل الفئات</option>
                          {EMPLOYMENT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                  </div>

                  {/* Employee Selection List */}
                  <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-bold text-slate-700">اختر الموظفين ({selectedIds.length})</label>
                          <button onClick={toggleSelectAll} className="text-xs text-blue-600 hover:underline">
                              {selectedIds.length === filteredEmployees.length ? 'إلغاء التحديد' : 'تحديد الكل'}
                          </button>
                      </div>
                      <div className="border border-emerald-200 rounded-lg max-h-40 overflow-y-auto p-1 bg-slate-50">
                          {filteredEmployees.map(emp => (
                              <div key={emp.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer" onClick={() => toggleSelectOne(emp.id)}>
                                  {selectedIds.includes(emp.id) ? <CheckSquare size={16} className="text-emerald-600" /> : <Square size={16} className="text-slate-400" />}
                                  <span className="text-sm">{emp.name}</span>
                              </div>
                          ))}
                          {filteredEmployees.length === 0 && <p className="text-xs text-center p-2 text-slate-400">لا يوجد موظفين</p>}
                      </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">نوع البند</label>
                          <select className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-200 outline-none" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                              <option value="">-- اختر النوع --</option>
                              {(activeTab === 'bonus' ? bonusTypes : grantTypes).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                      </div>

                      {selectedType === 'مكافأة إضافي' ? (
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-3">
                              <div className="flex items-center gap-2 text-amber-800 text-sm font-bold border-b border-amber-200 pb-2">
                                  <Clock size={16} />
                                  حساب الساعات الإضافية
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-600">ساعات عادية (1.35)</label>
                                      <input type="number" className="w-full p-2 border rounded bg-white text-center" placeholder="0" value={standardHours} onChange={e => setStandardHours(e.target.value)} />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-600">ساعات راحات (2.0)</label>
                                      <input type="number" className="w-full p-2 border rounded bg-white text-center" placeholder="0" value={restHours} onChange={e => setRestHours(e.target.value)} />
                                  </div>
                              </div>
                              <p className="text-[10px] text-amber-700">
                                  * القيمة = (الأساسي / 182 × 1.35) + (الأساسي / 210 × 2)
                              </p>
                          </div>
                      ) : (
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ (لكل موظف)</label>
                              <div className="relative">
                                  <input type="number" className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-200 outline-none pl-10" value={amount} onChange={e => setAmount(e.target.value)} />
                                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">ج.م</span>
                              </div>
                          </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 items-center bg-slate-50 p-2 rounded border border-slate-200">
                          <label className="text-sm font-bold text-slate-700">نسبة الضريبة %</label>
                          <input 
                            type="number" 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-200 outline-none text-center" 
                            value={taxRate} 
                            onChange={e => setTaxRate(e.target.value)}
                            placeholder="10"
                          />
                      </div>

                      <button onClick={handleAdd} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-md transition-colors flex items-center justify-center gap-2">
                          <Plus size={18} />
                          إضافة للسجلات
                      </button>
                  </div>
              </div>
          </div>

          {/* Right Column: History List */}
          <div className="xl:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-emerald-900 flex items-center gap-2">
                          <Coins size={20} />
                          سجل الصرف ({filteredHistory.length})
                      </h3>
                      <button onClick={printBonusReport} className="text-emerald-700 bg-emerald-100 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-200 transition-colors">
                          <Printer size={18} />
                          طباعة الاستمارات
                      </button>
                  </div>

                  {/* Search Toolbar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="relative">
                          <Search size={16} className="absolute top-3 right-3 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="بحث باسم الموظف..." 
                            className="w-full p-2 pr-9 border rounded text-sm focus:outline-none focus:border-emerald-400"
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                          />
                      </div>
                      <div className="flex items-center gap-2">
                          <label className="text-xs font-bold whitespace-nowrap">من:</label>
                          <input type="date" className="w-full p-2 border rounded text-sm" value={searchDateFrom} onChange={e => setSearchDateFrom(e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                          <label className="text-xs font-bold whitespace-nowrap">إلى:</label>
                          <input type="date" className="w-full p-2 border rounded text-sm" value={searchDateTo} onChange={e => setSearchDateTo(e.target.value)} />
                      </div>
                  </div>

                  <div className="flex-1 overflow-auto border border-emerald-100 rounded-lg">
                      <table className="w-full text-right text-sm">
                          <thead className="bg-emerald-50 text-emerald-800 sticky top-0">
                              <tr>
                                  <th className="p-3 font-bold">التاريخ</th>
                                  <th className="p-3 font-bold">الموظف</th>
                                  <th className="p-3 font-bold">النوع</th>
                                  <th className="p-3 font-bold">الإجمالي</th>
                                  <th className="p-3 font-bold text-red-600">خصم</th>
                                  <th className="p-3 font-bold text-emerald-700">الصافي</th>
                                  <th className="p-3 font-bold text-center">إجراء</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-50">
                              {filteredHistory.map(b => {
                                  const emp = employees.find(e => e.id === b.employeeId);
                                  
                                  // SAFE ACCESS to prevent crash on legacy data
                                  const safeGross = b.grossAmount || b.amount || 0;
                                  const safeTax = b.taxAmount || 0;
                                  const safeStamp = b.stampAmount || 0;
                                  const safeNet = b.netAmount || (safeGross - safeTax - safeStamp) || 0;
                                  const totalDeductions = safeTax + safeStamp;

                                  return (
                                      <tr key={b.id} className="hover:bg-slate-50">
                                          <td className="p-3 font-mono text-slate-500">{b.date}</td>
                                          <td className="p-3 font-bold text-slate-800">{emp?.name}</td>
                                          <td className="p-3">
                                              <span className="block font-medium">{b.type}</span>
                                              <span className="text-[10px] text-slate-400">{b.details}</span>
                                          </td>
                                          <td className="p-3 font-mono">{safeGross.toLocaleString()}</td>
                                          <td className="p-3 font-mono text-red-500" title={`ضريبة: ${safeTax} + دمغة: ${safeStamp}`}>
                                              -{totalDeductions.toLocaleString()}
                                          </td>
                                          <td className="p-3 font-mono font-bold text-emerald-700 bg-emerald-50/50">
                                              {safeNet.toLocaleString()}
                                          </td>
                                          <td className="p-3 text-center">
                                              <button onClick={() => handleDeleteBonus(b.id)} className="text-red-400 hover:text-red-600 p-1">
                                                  <Trash2 size={16} />
                                              </button>
                                          </td>
                                      </tr>
                                  );
                              })}
                              {filteredHistory.length === 0 && (
                                  <tr>
                                      <td colSpan={7} className="p-8 text-center text-slate-400">لا توجد سجلات مطابقة للبحث</td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};