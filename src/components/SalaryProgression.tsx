
import React, { useState } from 'react';
import { Employee, SalaryIncrease } from '../types';
import { Search, TrendingUp, Plus, Calendar, FileText, ArrowUp, History, User, Printer, AlertCircle, Clock, Edit2, Trash2, Check, X, ShieldCheck, Banknote } from 'lucide-react';

interface SalaryProgressionProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
}

export const SalaryProgression: React.FC<SalaryProgressionProps> = ({ employees, setEmployees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDocNum, setSearchDocNum] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [increaseType, setIncreaseType] = useState<'percentage' | 'fixed'>('fixed');
  const [increaseName, setIncreaseName] = useState('');
  const [increaseValue, setIncreaseValue] = useState<number | ''>('');
  const [increaseDate, setIncreaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const filteredEmployees = employees.filter(emp => {
    const matchGeneral = emp.name.includes(searchTerm) || emp.nationalId.includes(searchTerm);
    // مطابقة تامة لرقم المستند
    const matchDoc = searchDocNum.trim() ? (emp.documentNumber === searchDocNum.trim()) : true;
    return matchGeneral && matchDoc;
  });

  // دالة إعادة بناء التاريخ المالي للموظف (حساب تراكمي)
  const rebuildEmployeeData = (emp: Employee, rawHistory: Partial<SalaryIncrease>[]): Employee => {
      const sortedHistory = [...rawHistory].sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
      const anchorSalary = emp.initialBasicSalary || emp.basicSalary;
      
      let runningSalary = anchorSalary;
      const processedHistory: SalaryIncrease[] = sortedHistory.map(inc => {
          const previousBasic = runningSalary;
          let amountAdded = 0;
          if (inc.type === 'percentage') {
              amountAdded = (previousBasic * (inc.value || 0)) / 100;
          } else {
              amountAdded = inc.value || 0;
          }

          amountAdded = parseFloat(amountAdded.toFixed(2));
          const newBasic = parseFloat((previousBasic + amountAdded).toFixed(2));
          runningSalary = newBasic;

          return {
              ...inc,
              id: inc.id || `INC-${Date.now()}-${Math.random()}`,
              previousBasic,
              amountAdded,
              newBasic
          } as SalaryIncrease;
      });

      // تحديد الراتب الفعلي الحالي بناءً على تاريخ اليوم
      const today = new Date();
      let currentEffectiveBasic = anchorSalary;
      for (const rec of processedHistory) {
          if (new Date(rec.date) <= today) {
              currentEffectiveBasic = rec.newBasic;
          }
      }

      return {
          ...emp,
          initialBasicSalary: anchorSalary,
          basicSalary: currentEffectiveBasic,
          salaryHistory: processedHistory
      };
  };

  const handleApplyIncrease = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedEmp || !increaseValue || !increaseName) return;

      let newHistory: Partial<SalaryIncrease>[] = selectedEmp.salaryHistory ? [...selectedEmp.salaryHistory] : [];
      
      if (editingId) {
          newHistory = newHistory.map(inc => inc.id === editingId ? { 
              ...inc, 
              name: increaseName, 
              type: increaseType, 
              value: Number(increaseValue), 
              date: increaseDate, 
              notes 
          } : inc);
      } else {
          newHistory.push({
              name: increaseName,
              type: increaseType,
              value: Number(increaseValue),
              date: increaseDate,
              notes: notes
          });
      }

      const updatedEmp = rebuildEmployeeData(selectedEmp, newHistory);
      setEmployees(employees.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp));
      setSelectedEmp(updatedEmp);
      resetForm();
      alert('تم تحديث التدرج المالي للموظف بنجاح.');
  };

  const handleDelete = (id: string) => {
      if (!selectedEmp || !confirm('هل أنت متأكد من حذف هذه العلاوة؟ سيتم إعادة حساب التدرج بالكامل.')) return;
      
      const newHistory = (selectedEmp.salaryHistory || []).filter(inc => inc.id !== id);
      const updatedEmp = rebuildEmployeeData(selectedEmp, newHistory);
      setEmployees(employees.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp));
      setSelectedEmp(updatedEmp);
  };

  const handleEditClick = (inc: SalaryIncrease) => {
      setEditingId(inc.id);
      setIncreaseName(inc.name);
      setIncreaseType(inc.type);
      setIncreaseValue(inc.value);
      setIncreaseDate(inc.date);
      setNotes(inc.notes || '');
  };

  const resetForm = () => {
      setEditingId(null);
      setIncreaseName('');
      setIncreaseValue('');
      setNotes('');
      setIncreaseType('fixed');
  };

  const printStatement = () => {
      if (!selectedEmp) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      const rows = (selectedEmp.salaryHistory || []).map((inc, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td style="font-family: monospace;">${inc.date}</td>
            <td style="text-align: right;">${inc.name}</td>
            <td>${inc.type === 'percentage' ? '%' + inc.value : 'مبلغ ثابت'}</td>
            <td style="font-family: monospace;">${fmt(inc.previousBasic)}</td>
            <td style="color:#059669; font-weight:bold;">+${fmt(inc.amountAdded)}</td>
            <td style="font-weight:bold; background: #f0fdf4;">${fmt(inc.newBasic)}</td>
        </tr>
      `).join('');

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>بيان تدرج - ${selectedEmp.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; padding: 20px; background: white; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #064e3b; padding-bottom: 15px; margin-bottom: 25px; }
                .title { text-align: center; flex: 1; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
                th, td { border: 1px solid #000; padding: 10px; text-align: center; }
                th { background-color: #f1f5f9; font-weight: 900; }
                .emp-info { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">🖨️ طباعة البيان</button>
            
            <div class="header">
                <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" style="height: 100px;" /></div>
                <div class="title">
                    <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                    <h3>بيان تدرج الراتب الأساسي (التأميني)</h3>
                    <p>تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-EG')}</p>
                </div>
                <div style="width: 100px;"></div>
            </div>

            <div class="emp-info">
                <strong>اسم الموظف:</strong> ${selectedEmp.name} <br>
                <strong>الرقم القومي:</strong> ${selectedEmp.nationalId} <br>
                <strong>تاريخ التعيين:</strong> ${selectedEmp.joinDate} <br>
                <strong>رقم المستند:</strong> ${selectedEmp.documentNumber || '-'}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>م</th>
                        <th>تاريخ الاستحقاق</th>
                        <th>بيان العلاوة / القرار</th>
                        <th>نوع الزيادة</th>
                        <th>الأساسي السابق</th>
                        <th>قيمة الزيادة</th>
                        <th>الأساسي الجديد</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>

            <div style="margin-top: 50px; display: flex; justify-content: space-around; font-weight: bold; text-align: center;">
                <div>إعداد الموارد البشرية<br><br>...................</div>
                <div>المدير المالي<br><br>...................</div>
                <div>يعتمد / أمين الصندوق<br><br>...................</div>
            </div>
        </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
          <TrendingUp className="text-emerald-600" size={32} />
          تدرج أساسي العاملين
        </h2>
        <p className="text-emerald-600 mt-1">تسجيل العلاوات الدورية والتشجيعية وحفظ تاريخ المرتب الأساسي</p>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
          {/* قائمة الموظفين (جانبية) */}
          <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-emerald-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-emerald-100 bg-emerald-50/50 space-y-3">
                  <div className="relative">
                      <Search className="absolute right-3 top-2.5 text-emerald-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="بحث بالاسم..." 
                        className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:border-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
                  <div className="relative">
                      <FileText className="absolute right-3 top-2.5 text-emerald-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="رقم المستند (مطابقة تامة)" 
                        className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none font-mono text-sm"
                        value={searchDocNum}
                        onChange={(e) => setSearchDocNum(e.target.value)}
                      />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredEmployees.map(emp => (
                      <button 
                        key={emp.id} 
                        onClick={() => { setSelectedEmp(emp); resetForm(); }}
                        className={`w-full text-right p-3 rounded-xl flex items-center gap-3 transition-all ${selectedEmp?.id === emp.id ? 'bg-emerald-600 text-white font-bold shadow-lg' : 'hover:bg-emerald-50 text-slate-700'}`}
                      >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs ${selectedEmp?.id === emp.id ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700'}`}>
                              {emp.name.charAt(0)}
                          </div>
                          <div className="flex-1 overflow-hidden">
                              <p className="text-sm truncate">{emp.name}</p>
                              <p className={`text-[10px] ${selectedEmp?.id === emp.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                                 {emp.position}
                              </p>
                          </div>
                      </button>
                  ))}
                  {filteredEmployees.length === 0 && (
                      <div className="text-center p-8 text-slate-400">لا توجد نتائج</div>
                  )}
              </div>
          </div>

          {/* مساحة العمل (يمين) */}
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
              {selectedEmp ? (
                  <div className="space-y-6 pb-12 animate-fade-in">
                      {/* ملخص الموظف */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-bold">
                                  {selectedEmp.name.charAt(0)}
                              </div>
                              <div>
                                  <h3 className="text-xl font-bold text-emerald-900">{selectedEmp.name}</h3>
                                  <p className="text-sm text-slate-500">الأساسي الأولي عند التعيين: <span className="font-mono font-bold text-emerald-700">{selectedEmp.initialBasicSalary?.toLocaleString() || selectedEmp.basicSalary.toLocaleString()} ج.م</span></p>
                                  <p className="text-xs text-blue-600 font-bold mt-1">الأساسي الحالي المطبق: {selectedEmp.basicSalary.toLocaleString()} ج.م</p>
                              </div>
                          </div>
                          <button onClick={printStatement} className="bg-white text-emerald-700 border-2 border-emerald-600 px-6 py-2 rounded-xl font-bold hover:bg-emerald-50 flex items-center gap-2 transition-all">
                              <Printer size={20} />
                              طباعة البيان
                          </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* فورم إضافة العلاوة */}
                          <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-amber-400 ring-4 ring-amber-50' : 'border-emerald-100'}`}>
                              <h4 className="font-bold text-emerald-900 mb-6 flex items-center gap-2 border-b pb-3">
                                  {editingId ? <Edit2 className="text-amber-500" size={20} /> : <Plus className="text-emerald-500" size={20} />}
                                  {editingId ? 'تعديل بيانات العلاوة' : 'إقرار علاوة / زيادة جديدة'}
                              </h4>
                              
                              <form onSubmit={handleApplyIncrease} className="space-y-4">
                                  <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-1">مسمى الزيادة (البيان)</label>
                                      <input 
                                        required 
                                        type="text" 
                                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none" 
                                        placeholder="مثلاً: علاوة دورية 2024"
                                        value={increaseName}
                                        onChange={e => setIncreaseName(e.target.value)}
                                      />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-sm font-bold text-slate-700 mb-1">نوع الزيادة</label>
                                          <div className="flex bg-slate-100 p-1 rounded-xl">
                                              <button type="button" onClick={() => setIncreaseType('fixed')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${increaseType === 'fixed' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>مبلغ مقطوع</button>
                                              <button type="button" onClick={() => setIncreaseType('percentage')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${increaseType === 'percentage' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>نسبة مئوية</button>
                                          </div>
                                      </div>
                                      <div>
                                          <label className="block text-sm font-bold text-slate-700 mb-1">القيمة</label>
                                          <div className="relative">
                                              <input 
                                                required 
                                                type="number" 
                                                step="0.01"
                                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-emerald-700 pl-10" 
                                                value={increaseValue}
                                                onChange={e => setIncreaseValue(e.target.value === '' ? '' : Number(e.target.value))}
                                              />
                                              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{increaseType === 'fixed' ? 'ج.م' : '%'}</span>
                                          </div>
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-1">تاريخ الاستحقاق (بدء التطبيق)</label>
                                      <input 
                                        required 
                                        type="date" 
                                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-mono" 
                                        value={increaseDate}
                                        onChange={e => setIncreaseDate(e.target.value)}
                                      />
                                  </div>

                                  <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                                      <textarea 
                                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none h-20 text-sm" 
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                      />
                                  </div>

                                  <div className="flex gap-3 pt-2">
                                      <button type="submit" className={`flex-1 text-white py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
                                          {editingId ? <Check size={20}/> : <Plus size={20}/>}
                                          {editingId ? 'حفظ التعديلات' : 'إضافة العلاوة للسجل'}
                                      </button>
                                      {editingId && (
                                          <button type="button" onClick={resetForm} className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold">إلغاء</button>
                                      )}
                                  </div>
                              </form>
                          </div>

                          {/* عرض السجل التاريخي */}
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col">
                              <h4 className="font-bold text-emerald-900 mb-6 flex items-center gap-2 border-b pb-3">
                                  <History size={20} className="text-blue-500" />
                                  تاريخ التدرج المالي
                              </h4>
                              
                              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                                  {(selectedEmp.salaryHistory || []).length > 0 ? (
                                      [...(selectedEmp.salaryHistory || [])].reverse().map((inc) => (
                                          <div key={inc.id} className="group relative border-r-4 border-emerald-500 bg-slate-50 p-4 rounded-xl hover:bg-emerald-50 transition-all border border-slate-100">
                                              <div className="flex justify-between items-start">
                                                  <div>
                                                      <h5 className="font-bold text-slate-800">{inc.name}</h5>
                                                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-1">
                                                          <Calendar size={10} /> {inc.date}
                                                      </p>
                                                  </div>
                                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <button onClick={() => handleEditClick(inc)} className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 border border-blue-100"><Edit2 size={14}/></button>
                                                      <button onClick={() => handleDelete(inc.id)} className="p-1.5 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50 border border-red-100"><Trash2 size={14}/></button>
                                                  </div>
                                              </div>
                                              <div className="mt-3 flex items-center justify-between bg-white/60 p-2 rounded-lg border border-slate-200/50">
                                                  <div className="text-center">
                                                      <span className="block text-[9px] text-slate-400 font-bold">قبل</span>
                                                      <span className="text-xs font-mono font-bold text-slate-600">{inc.previousBasic.toLocaleString()}</span>
                                                  </div>
                                                  <div className="text-emerald-600 font-bold text-sm flex flex-col items-center">
                                                      <ArrowUp size={14} />
                                                      <span>+{inc.amountAdded.toLocaleString()}</span>
                                                  </div>
                                                  <div className="text-center">
                                                      <span className="block text-[9px] text-emerald-400 font-bold">بعد</span>
                                                      <span className="text-xs font-mono font-bold text-emerald-800">{inc.newBasic.toLocaleString()}</span>
                                                  </div>
                                              </div>
                                              {inc.notes && <p className="text-[10px] text-slate-500 mt-2 italic">"{inc.notes}"</p>}
                                          </div>
                                      ))
                                  ) : (
                                      <div className="text-center py-12">
                                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-300">
                                              <History size={32} className="text-slate-300" />
                                          </div>
                                          <p className="text-slate-400 text-sm">لا يوجد تاريخ زيادات مسجل حتى الآن</p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-emerald-100">
                      <TrendingUp size={64} className="mb-4 text-emerald-50" />
                      <h3 className="text-xl font-bold text-emerald-900/40">اختر موظفاً لعرض تدرجه المالي</h3>
                      <p className="text-sm">يمكنك البحث بالاسم أو برقم المستند للمجموعات</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
