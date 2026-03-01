
import React, { useState } from 'react';
import { Employee, BonusRecord } from '../types';
import { Gift, Plus, CheckSquare, Square, Filter, Coins, Clock, Printer, Search, Calculator, Trash2, Calendar, FileSpreadsheet, FileText, Hash, AlertTriangle, Edit2, X, Check, Layers, Eraser } from 'lucide-react';
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
  
  // Add/Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState('10'); 
  const [bonusDocNumber, setBonusDocNumber] = useState('');
  
  // Overtime specific state
  const [standardHours, setStandardHours] = useState('');
  const [restHours, setRestHours] = useState('');

  // Search/Filter History State
  const [searchName, setSearchName] = useState('');
  const [searchDocNum, setSearchDocNum] = useState(''); 
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  const months = [
      { value: 0, label: 'يناير' }, { value: 1, label: 'فبراير' }, { value: 2, label: 'مارس' },
      { value: 3, label: 'أبريل' }, { value: 4, label: 'مايو' }, { value: 5, label: 'يونيو' },
      { value: 6, label: 'يوليو' }, { value: 7, label: 'أغسطس' }, { value: 8, label: 'سبتمبر' },
      { value: 9, label: 'أكتوبر' }, { value: 10, label: 'نوفمبر' }, { value: 11, label: 'ديسمبر' }
  ];
  const years = [filterYear - 1, filterYear, filterYear + 1];

  const bonusTypes = [
      'جهود غير عادية',
      'جهود مبذولة',
      'مكافأة دمغة هندسية',
      'مكافأة إضافي'
  ];

  const grantTypes = [
      'منحة رمضان', 
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
      const matchSearch = searchName ? e.name.includes(searchName) : true;
      // تعديل: مطابقة تامة لرقم المستند
      const matchDoc = searchDocNum.trim() ? (e.documentNumber === searchDocNum.trim()) : true;
      return matchDept && matchCat && matchSearch && matchDoc;
  });

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

  const handleSave = () => {
      if (!editingId && selectedIds.length === 0) {
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

      const appliedTaxRate = parseFloat(taxRate) || 0;

      if (editingId) {
          const record = bonuses.find(b => b.id === editingId);
          if (!record) return;

          let updateAllGroup = false;
          if (record.docNumber && bonuses.filter(b => b.docNumber === record.docNumber).length > 1) {
              updateAllGroup = confirm(`هذا السجل جزء من مجموعة (مستند: ${record.docNumber}).\nهل تريد تعديل المبلغ لجميع الموظفين في هذه المجموعة؟`);
          }

          const updatedBonuses = bonuses.map(b => {
              const shouldUpdate = b.id === editingId || (updateAllGroup && b.docNumber === record.docNumber);
              if (shouldUpdate) {
                  let gross = Number(amount);
                  const stamp = parseFloat((gross * 0.006).toFixed(2));
                  const tax = parseFloat((gross * (appliedTaxRate / 100)).toFixed(2));
                  const net = parseFloat((gross - stamp - tax).toFixed(2));
                  return { ...b, amount: gross, grossAmount: gross, taxRate: appliedTaxRate, taxAmount: tax, stampAmount: stamp, netAmount: net, type: selectedType, docNumber: bonusDocNumber };
              }
              return b;
          });
          setBonuses(updatedBonuses);
          cancelEdit();
          return;
      }

      const newRecords: BonusRecord[] = selectedIds.map(empId => {
          let grossAmount = 0;
          let details = '';
          if (isOvertime) {
              const emp = employees.find(e => e.id === empId);
              if (emp) {
                  const stdHourlyRate = (emp.basicSalary / 182) * 1.35;
                  const restHourlyRate = (emp.basicSalary / 210) * 2.0;
                  grossAmount = parseFloat(((Number(standardHours) || 0) * stdHourlyRate + (Number(restHours) || 0) * restHourlyRate).toFixed(2));
                  details = `${standardHours || 0} س عادي + ${restHours || 0} س راحات`;
              }
          } else { grossAmount = Number(amount); }
          const stampAmount = parseFloat((grossAmount * 0.006).toFixed(2));
          const taxAmount = parseFloat((grossAmount * (appliedTaxRate / 100)).toFixed(2));
          const netAmount = parseFloat((grossAmount - stampAmount - taxAmount).toFixed(2));
          return { id: `BNS-${Date.now()}-${Math.random()}`, employeeId: empId, type: selectedType, category: isOvertime ? 'overtime' : activeTab, amount: grossAmount, grossAmount, taxRate: appliedTaxRate, taxAmount, stampAmount, netAmount, docNumber: bonusDocNumber, date: new Date().toISOString().split('T')[0], details: details };
      });
      setBonuses([...bonuses, ...newRecords]);
      setSelectedIds([]); setAmount(''); setStandardHours(''); setRestHours(''); setBonusDocNumber('');
  };

  const handleEditClick = (record: BonusRecord) => {
      setEditingId(record.id); setSelectedType(record.type); setAmount(String(record.grossAmount)); setTaxRate(String(record.taxRate)); setBonusDocNumber(record.docNumber || ''); setActiveTab(record.category === 'grant' ? 'grant' : 'bonus');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditingId(null); setSelectedType(''); setAmount(''); setTaxRate('10'); setBonusDocNumber(''); setSelectedIds([]); };

  const handleDeleteSingle = (id: string) => {
      if (confirm('هل أنت متأكد من حذف هذا السجل الفردي؟')) {
          setBonuses(bonuses.filter(b => b.id !== id));
      }
  };

  const handleDeleteByDocNum = () => {
      const docNum = prompt('يرجى إدخال رقم المستند المراد حذفه بالكامل:');
      if (!docNum) return;

      const group = bonuses.filter(b => b.docNumber === docNum);
      if (group.length === 0) {
          alert('لا توجد سجلات بهذا الرقم في التاريخ');
          return;
      }

      if (confirm(`تم العثور على (${group.length}) سجل مرتبط بالمستند رقم: ${docNum}\nهل أنت متأكد من حذف المجموعة بالكامل؟`)) {
          setBonuses(bonuses.filter(b => b.docNumber !== docNum));
          alert('تم حذف المجموعة بنجاح');
      }
  };

  const filteredHistory = bonuses.filter(b => {
      const emp = employees.find(e => e.id === b.employeeId);
      const nameMatch = searchName ? emp?.name.includes(searchName) : true;
      
      // تعديل: مطابقة تامة لرقم مستند المنحة أو رقم مستند الموظف
      const docMatch = searchDocNum.trim() ? (b.docNumber === searchDocNum.trim()) || (emp?.documentNumber === searchDocNum.trim()) : true;
      
      const recordDate = new Date(b.date);
      const dateMatch = recordDate.getMonth() === filterMonth && recordDate.getFullYear() === filterYear;
      return nameMatch && docMatch && dateMatch;
  });

  filteredHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const printStatement = () => {
      if (filteredHistory.length === 0) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const monthLabel = months.find(m => m.value === filterMonth)?.label;
      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const CHUNK_SIZE = 8; 
      const chunks = [];
      for (let i = 0; i < filteredHistory.length; i += CHUNK_SIZE) {
          chunks.push(filteredHistory.slice(i, i + CHUNK_SIZE));
      }

      const grandTotalGross = filteredHistory.reduce((sum, b) => sum + (b.grossAmount || 0), 0);
      const grandTotalDed = filteredHistory.reduce((sum, b) => sum + ((b.taxAmount || 0) + (b.stampAmount || 0)), 0);
      const grandTotalNet = filteredHistory.reduce((sum, b) => sum + (b.netAmount || 0), 0);

      let allPagesHtml = '';

      chunks.forEach((chunk, pageIdx) => {
          const pageTotalNet = chunk.reduce((sum, b) => sum + (b.netAmount || 0), 0);
          const rows = chunk.map((b, idx) => {
              const emp = employees.find(e => e.id === b.employeeId);
              const deductions = (b.taxAmount || 0) + (b.stampAmount || 0);
              return `
                <tr>
                    <td>${(pageIdx * CHUNK_SIZE) + idx + 1}</td>
                    <td style="text-align: right; font-weight: bold;">${emp?.name || '---'}</td>
                    <td>${b.type}</td>
                    <td class="num">${b.docNumber || '-'}</td>
                    <td class="num">${fmt(b.grossAmount || b.amount)}</td>
                    <td class="num" style="color: #b91c1c;">${fmt(deductions)}</td>
                    <td class="num" style="font-weight: 900; background: #f0fdf4;">${fmt(b.netAmount || b.amount)}</td>
                    <td class="sig-cell"></td>
                </tr>
              `;
          }).join('');

          allPagesHtml += `
            <div class="print-page">
                <div class="header-container">
                    <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" style="height: 60px;" /></div>
                    <div class="header-text">
                        <h2 style="margin: 0; font-size: 16px; color: #064e3b;">نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                        <h3 style="margin: 2px 0; font-size: 14px; text-decoration: underline;">كشف صرف المكافآت والمنح (الصافيات)</h3>
                        <p style="margin: 0; font-size: 11px;">عن شهر: ${monthLabel} ${filterYear} | صفحة ${pageIdx + 1} من ${chunks.length}</p>
                    </div>
                    <div style="width: 60px;"></div>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th width="4%">م</th>
                                <th width="24%">اسم الموظف</th>
                                <th width="15%">البيان</th>
                                <th width="10%">رقم المستند</th>
                                <th width="10%">الإجمالي</th>
                                <th width="10%">الاستقطاع</th>
                                <th width="12%">الصافي</th>
                                <th width="15%">التوقيع</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                        <tfoot>
                            ${pageIdx === chunks.length - 1 ? `
                            <tr class="grand-total">
                                <td colspan="4" style="text-align: left; padding-left: 20px;">الإجمالي العام النهائي للكشف</td>
                                <td class="num">${fmt(grandTotalGross)}</td>
                                <td class="num">${fmt(grandTotalDed)}</td>
                                <td class="num">${fmt(grandTotalNet)}</td>
                                <td></td>
                            </tr>
                            ` : `
                            <tr class="page-total">
                                <td colspan="6" style="text-align: left; padding-left: 20px;">إجمالي الصافي في هذه الصفحة</td>
                                <td class="num">${fmt(pageTotalNet)}</td>
                                <td></td>
                            </tr>
                            `}
                        </tfoot>
                    </table>
                </div>

                <div class="footer-sigs">
                    <div class="sig-box">إعداد / الموارد البشرية<br><br>......................</div>
                    <div class="sig-box">المراجعة المالية<br><br>......................</div>
                    <div class="sig-box">المدير المالي<br><br>......................</div>
                    <div class="sig-box">يعتمد / أمين الصندوق<br><br>......................</div>
                </div>
            </div>
          `;
      });

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>كشف المكافآت - ${monthLabel}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: A4 landscape; margin: 0; }
                body { font-family: 'Cairo', sans-serif; background: #f3f4f6; margin: 0; padding: 0; direction: rtl; -webkit-print-color-adjust: exact; }
                .print-page { 
                    width: 297mm; height: 210mm; margin: 0 auto; background: white; padding: 10mm 12mm; 
                    box-sizing: border-box; page-break-after: always; display: flex; flex-direction: column; overflow: hidden;
                }
                .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #064e3b; padding-bottom: 5px; margin-bottom: 10px; }
                .header-text { text-align: center; flex: 1; }
                .table-container { flex-grow: 1; }
                table { width: 100%; border-collapse: collapse; font-size: 10.5px; table-layout: fixed; }
                th, td { border: 1px solid #000; padding: 5px 3px; text-align: center; overflow: hidden; }
                th { background: #f0fdf4 !important; font-weight: 900; color: #064e3b; }
                .num { font-family: 'Arial', sans-serif; font-weight: bold; }
                .sig-cell { height: 40px; }
                .grand-total { background-color: #064e3b !important; color: white !important; font-weight: 900; }
                .grand-total td { border-color: #fff; }
                .page-total { background-color: #f8fafc; font-weight: bold; }
                .footer-sigs { display: flex; justify-content: space-between; margin-top: auto; padding-top: 15px; border-top: 1px dashed #ccc; }
                .sig-box { text-align: center; width: 22%; font-weight: bold; font-size: 11px; line-height: 1.4; }
                @media print { body { background: white; } .print-page { margin: 0; border: none; } .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="no-print" style="padding: 10px; text-align: center; background: #fff; border-bottom: 1px solid #ccc;">
                <button onclick="window.print()" style="padding: 10px 30px; background: #064e3b; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-family: Cairo; font-weight: bold; font-size: 16px;">🖨️ طباعة الكشف (A4 Landscape)</button>
            </div>
            ${allPagesHtml}
        </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  const printBonusReport = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const vouchersHtml = filteredHistory.map((b, i) => {
          const emp = employees.find(e => e.id === b.employeeId);
          return `
            <div class="voucher-page">
                <div class="header-container">
                    <div><img src="/logo.png" style="height: 100px;" /></div>
                    <div class="header-text">
                        <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                        <h3>استمارة صرف (مكافأة / منحة)</h3>
                        <p>رقم القيد: ${b.docNumber || b.id.split('-')[1]}</p>
                    </div>
                    <div style="width: 100px;"></div>
                </div>
                <div class="info-box">
                    <table class="info-table">
                        <tr><td class="label">اسم الموظف:</td><td class="val">${emp?.name || '-'}</td><td class="label">القسم:</td><td class="val">${emp?.department || '-'}</td></tr>
                        <tr><td class="label">تاريخ الاستحقاق:</td><td class="val">${b.date}</td><td class="label">نوع الصرف:</td><td class="val">${b.type}</td></tr>
                        <tr><td class="label">رقم المستند:</td><td class="val">${b.docNumber || 'غير محدد'}</td><td class="label">تفاصيل الاحتساب:</td><td class="val">${b.details || 'مبلغ مقطوع'}</td></tr>
                    </table>
                </div>
                <div class="financial-section">
                    <h3>البيان المالي</h3>
                    <table class="financial-table">
                        <thead><tr><th>المبلغ الإجمالي (Gross)</th><th>قيمة الضريبة (${b.taxRate || 0}%)</th><th>الدمغة</th><th>صافي المستحق للصرف</th></tr></thead>
                        <tbody><tr><td>${fmt(b.grossAmount || b.amount)} ج.م</td><td style="color: #b91c1c;">${fmt(b.taxAmount || 0)} ج.م</td><td style="color: #b45309;">${fmt(b.stampAmount || 0)} ج.م</td><td class="net-cell">${fmt(b.netAmount || b.amount)} ج.م</td></tr></tbody>
                    </table>
                </div>
                <div class="signatures">
                    <div>إعداد الموارد البشرية<br><br>......................</div>
                    <div>المراجعة<br><br>......................</div>
                    <div>المدير المالي<br><br>......................</div>
                    <div>اعتماد الصرف<br><br>......................</div>
                </div>
            </div>
          `;
      }).join('');

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>استمارات المكافآت</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; margin: 0; padding: 0; }
                .voucher-page { width: 100%; min-height: 95vh; border: 2px solid #000; padding: 25px; box-sizing: border-box; page-break-after: always; display: flex; flex-direction: column; }
                .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px double #064e3b; padding-bottom: 10px; }
                .header-text { text-align: center; flex: 1; }
                .info-box { margin: 20px 0; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 10px; border-bottom: 1px dotted #ccc; font-size: 14px; }
                .label { font-weight: bold; width: 140px; }
                .val { font-weight: bold; }
                .financial-section h3 { background: #ecfdf5; padding: 8px; border-right: 5px solid #064e3b; margin-bottom: 10px; font-size: 16px; }
                .financial-table { width: 100%; border-collapse: collapse; text-align: center; }
                .financial-table th, .financial-table td { border: 1px solid #000; padding: 10px; }
                .net-cell { background-color: #dcfce7; font-size: 18px !important; font-weight: bold; }
                .signatures { margin-top: auto; display: flex; justify-content: space-between; text-align: center; font-weight: bold; padding-top: 30px; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="no-print" style="padding: 20px; text-align: center;"><button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ طباعة الاستمارات</button></div>
            ${vouchersHtml}
        </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-emerald-900">المكافآت والمنح</h2>
            <p className="text-emerald-600 mt-1">إدارة صرف المكافآت وتعديل السجلات (فردي / جماعي)</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-emerald-200 shadow-sm">
            <button onClick={() => { setActiveTab('bonus'); cancelEdit(); }} className={`px-4 py-2 rounded-md font-bold transition-all ${activeTab === 'bonus' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>المكافآت والإضافي</button>
            <button onClick={() => { setActiveTab('grant'); cancelEdit(); }} className={`px-4 py-2 rounded-md font-bold transition-all ${activeTab === 'grant' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}>المنح والمناسبات</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-6">
              <div className={`bg-white p-6 rounded-xl shadow-sm border ${editingId ? 'border-amber-400 ring-2 ring-amber-100' : 'border-emerald-100'}`}>
                  <h3 className="font-bold text-lg text-emerald-900 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {editingId ? <Edit2 size={20} className="text-amber-500" /> : <Plus size={20} />}
                        {editingId ? 'تعديل البيانات' : (activeTab === 'bonus' ? 'إضافة مكافأة / إضافي' : 'صرف منحة')}
                      </div>
                      {editingId && (
                          <button onClick={cancelEdit} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"><X size={20} /></button>
                      )}
                  </h3>

                  {!editingId && (
                  <div className="space-y-3 mb-4 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-2 text-sm text-emerald-800 font-bold mb-1"><Filter size={16} /> تصفية الموظفين:</div>
                      <select className="w-full p-2 border rounded bg-white text-sm" value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedIds([]); }}>
                          <option value="all">كل الأقسام</option>
                          {Array.from(new Set(employees.map(e => e.department))).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select className="w-full p-2 border rounded bg-white text-sm" value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedIds([]); }}>
                          <option value="all">كل الفئات</option>
                          {/* 
                              Fix: Typo 'cat' replaced with 'c' to match map parameter
                          */}
                          {EMPLOYMENT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      <div className="mb-2">
                          <div className="flex justify-between items-center mb-2">
                              <label className="text-xs font-bold text-slate-700">اختر الموظفين ({selectedIds.length})</label>
                              <button onClick={toggleSelectAll} className="text-[10px] text-blue-600 hover:underline">{selectedIds.length === filteredEmployees.length ? 'إلغاء التحديد' : 'تحديد الكل'}</button>
                          </div>
                          <div className="border border-emerald-200 rounded-lg max-h-32 overflow-y-auto p-1 bg-white">
                              {filteredEmployees.map(emp => (
                                  <div key={emp.id} className="flex items-center gap-2 p-1.5 hover:bg-emerald-50 rounded cursor-pointer" onClick={() => toggleSelectOne(emp.id)}>
                                      {selectedIds.includes(emp.id) ? <CheckSquare size={14} className="text-emerald-600" /> : <Square size={14} className="text-slate-400" />}
                                      <span className="text-xs">{emp.name}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                  )}

                  <div className="space-y-4">
                      <div><label className="block text-xs font-bold text-slate-700 mb-1">نوع البند</label><select className="w-full p-2 border rounded outline-none text-sm" value={selectedType} onChange={e => setSelectedType(e.target.value)}><option value="">-- اختر النوع --</option>{(activeTab === 'bonus' ? bonusTypes : grantTypes).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                      <div><label className="block text-xs font-bold text-emerald-800 mb-1">رقم مستند الصرف</label><div className="relative"><input type="text" className="w-full p-2 pr-10 border rounded outline-none font-mono text-sm" placeholder="اختياري..." value={bonusDocNumber} onChange={e => setBonusDocNumber(e.target.value)} /><Hash className="absolute right-3 top-2.5 text-emerald-500" size={16} /></div></div>
                      {selectedType === 'مكافأة إضافي' && !editingId ? (
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-3">
                              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold border-b border-amber-200 pb-2"><Clock size={14} />حساب الساعات</div>
                              <div className="grid grid-cols-2 gap-2">
                                  <div><label className="block text-[10px] font-bold text-slate-600">عادي (1.35)</label><input type="number" className="w-full p-1.5 border rounded bg-white text-center text-sm" placeholder="0" value={standardHours} onChange={e => setStandardHours(e.target.value)} /></div>
                                  <div><label className="block text-[10px] font-bold text-slate-600">راحات (2.0)</label><input type="number" className="w-full p-1.5 border rounded bg-white text-center text-sm" placeholder="0" value={restHours} onChange={e => setRestHours(e.target.value)} /></div>
                              </div>
                          </div>
                      ) : (
                          <div><label className="block text-xs font-bold text-slate-700 mb-1">المبلغ الإجمالي (Gross)</label><div className="relative"><input type="number" className="w-full p-2 border rounded outline-none pl-10 text-sm font-bold" value={amount} onChange={e => setAmount(e.target.value)} /><span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">ج.م</span></div></div>
                      )}
                      <div className="grid grid-cols-2 gap-4 items-center bg-slate-50 p-2 rounded border border-slate-200"><label className="text-xs font-bold text-slate-700">نسبة الضريبة %</label><input type="number" className="w-full p-1.5 border rounded text-center text-sm" value={taxRate} onChange={e => setTaxRate(e.target.value)} /></div>
                      <button onClick={handleSave} className={`w-full text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{editingId ? <Check size={20} /> : <Plus size={18} />}{editingId ? 'حفظ التعديلات' : 'إضافة للسجلات'}</button>
                  </div>
              </div>
          </div>

          <div className="xl:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-emerald-900 flex items-center gap-2"><Coins size={20} /> سجل الصرف ({filteredHistory.length})</h3>
                      <div className="flex gap-2">
                        <button onClick={handleDeleteByDocNum} className="text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-100 text-sm shadow-sm transition-all">
                            <Eraser size={16} />
                            حذف مجموعة برقم مستند
                        </button>
                        <button onClick={printBonusReport} className="text-emerald-700 bg-emerald-100 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-200 text-sm shadow-sm">
                            <Printer size={16} /> 
                            طباعة الاستمارات
                        </button>
                        <button onClick={printStatement} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-md text-sm transition-all">
                            <FileSpreadsheet size={16} /> 
                            كشف الصافيات (للتوقيع)
                        </button>
                      </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="relative flex-1 min-w-[150px]"><Search size={16} className="absolute top-2.5 right-3 text-slate-400" /><input type="text" placeholder="بحث بالاسم..." className="w-full p-2 pr-9 border rounded text-sm outline-none" value={searchName} onChange={e => setSearchName(e.target.value)} /></div>
                      <div className="relative flex-1 min-w-[150px]"><Hash size={16} className="absolute top-2.5 right-3 text-slate-400" /><input type="text" placeholder="رقم المستند..." className="w-full p-2 pr-9 border rounded text-sm outline-none font-mono" value={searchDocNum} onChange={e => setSearchDocNum(e.target.value)} /></div>
                      <div className="flex items-center gap-2 border border-slate-300 rounded bg-white p-1"><Calendar size={16} className="text-slate-500 mx-2" /><select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className="bg-transparent outline-none text-xs font-bold text-emerald-800">{months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select><select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="bg-transparent outline-none text-xs font-bold text-emerald-800">{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  </div>

                  <div className="flex-1 overflow-auto border border-emerald-100 rounded-lg">
                      <table className="w-full text-right text-xs">
                          <thead className="bg-emerald-50 text-emerald-800 sticky top-0">
                              <tr><th className="p-3 font-bold">التاريخ</th><th className="p-3 font-bold">الموظف</th><th className="p-3 font-bold">المستند</th><th className="p-3 font-bold">النوع</th><th className="p-3 font-bold">الإجمالي</th><th className="p-3 font-bold text-emerald-700">الصافي</th><th className="p-3 font-bold text-center">إجراءات</th></tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-50">
                              {filteredHistory.map(b => {
                                  const emp = employees.find(e => e.id === b.employeeId);
                                  return (
                                      <tr key={b.id} className={`hover:bg-slate-50 transition-colors ${editingId === b.id ? 'bg-amber-50' : ''}`}>
                                          <td className="p-3 font-mono text-slate-500">{b.date}</td>
                                          <td className="p-3 font-bold text-slate-800">{emp?.name}</td>
                                          <td className="p-3 font-mono font-bold text-blue-600">{b.docNumber || '-'}</td>
                                          <td className="p-3 text-[10px]">{b.type}</td>
                                          <td className="p-3 font-mono">{fmt(b.grossAmount || b.amount)}</td>
                                          <td className="p-3 font-mono font-bold text-emerald-700 bg-emerald-50/50">{fmt(b.netAmount || b.amount)}</td>
                                          <td className="p-3 text-center">
                                              <div className="flex justify-center gap-1">
                                                <button onClick={() => handleEditClick(b)} className="text-amber-500 hover:text-amber-700 p-1.5 rounded-lg hover:bg-amber-50 transition-colors" title="تعديل"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteSingle(b.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="حذف فردي">
                                                    <Trash2 size={16} />
                                                </button>
                                              </div>
                                          </td>
                                      </tr>
                                  );
                              })}
                              {filteredHistory.length === 0 && (<tr><td colSpan={8} className="p-12 text-center text-slate-400">لا توجد سجلات مطابقة للبحث</td></tr>)}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
