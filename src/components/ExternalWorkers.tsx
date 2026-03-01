
import React, { useState } from 'react';
import { ExternalWorkerRecord } from '../types';
import { Briefcase, Printer, Plus, Trash2, Search, User, CreditCard, FileText, Calendar, FileSpreadsheet, Edit2, X } from 'lucide-react';

interface ExternalWorkersProps {
  records: ExternalWorkerRecord[];
  setRecords: (records: ExternalWorkerRecord[]) => void;
}

export const ExternalWorkers: React.FC<ExternalWorkersProps> = ({ records, setRecords }) => {
  const [newRecord, setNewRecord] = useState<Partial<ExternalWorkerRecord>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDocNum, setSearchDocNum] = useState('');
  const [taxRateInput, setTaxRateInput] = useState('0');
  
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  const months = [
      { value: 0, label: 'يناير' }, { value: 1, label: 'فبراير' }, { value: 2, label: 'مارس' },
      { value: 3, label: 'أبريل' }, { value: 4, label: 'مايو' }, { value: 5, label: 'يونيو' },
      { value: 6, label: 'يوليو' }, { value: 7, label: 'أغسطس' }, { value: 8, label: 'سبتمبر' },
      { value: 9, label: 'أكتوبر' }, { value: 10, label: 'نوفمبر' }, { value: 11, label: 'ديسمبر' }
  ];
  const years = [filterYear - 1, filterYear, filterYear + 1];

  const handleSave = () => {
    if (!newRecord.name || !newRecord.nationalId || !newRecord.jobType || !newRecord.amount) {
        alert('يرجى ملء جميع البيانات المطلوبة');
        return;
    }
    const amount = Number(newRecord.amount);
    const taxRate = parseFloat(taxRateInput) || 0;
    const stampAmount = amount * 0.006;
    const taxAmount = amount * (taxRate / 100);
    const netAmount = amount - stampAmount - taxAmount;

    if (editingId) {
        const updatedRecords = records.map(r => r.id === editingId ? { ...r, name: newRecord.name!, nationalId: newRecord.nationalId!, documentNumber: newRecord.documentNumber || '', jobType: newRecord.jobType!, amount, taxRate, taxAmount: parseFloat(taxAmount.toFixed(2)), stampAmount: parseFloat(stampAmount.toFixed(2)), netAmount: parseFloat(netAmount.toFixed(2)) } : r);
        setRecords(updatedRecords);
        setEditingId(null);
        alert('تم التحديث');
    } else {
        const record: ExternalWorkerRecord = { id: `EXT-${Date.now()}`, name: newRecord.name!, nationalId: newRecord.nationalId!, documentNumber: newRecord.documentNumber || '', jobType: newRecord.jobType!, amount, taxRate, taxAmount: parseFloat(taxAmount.toFixed(2)), stampAmount: parseFloat(stampAmount.toFixed(2)), netAmount: parseFloat(netAmount.toFixed(2)), date: new Date().toISOString().split('T')[0] };
        setRecords([...records, record]);
        alert('تمت الإضافة');
    }
    setNewRecord({});
    setTaxRateInput('0');
  };

  const handleEdit = (record: ExternalWorkerRecord) => {
      setEditingId(record.id);
      setNewRecord({ name: record.name, nationalId: record.nationalId, documentNumber: record.documentNumber, jobType: record.jobType, amount: record.amount });
      setTaxRateInput(String(record.taxRate || 0));
  };

  const cancelEdit = () => { setEditingId(null); setNewRecord({}); setTaxRateInput('0'); };
  const handleDelete = (id: string) => { if (confirm('حذف؟')) setRecords(records.filter(r => r.id !== id)); };

  const filteredRecords = records.filter(r => {
      const matchSearch = r.name.includes(searchTerm) || r.nationalId.includes(searchTerm) || r.jobType.includes(searchTerm);
      
      // تعديل: مطابقة تامة لرقم المستند
      const matchDoc = searchDocNum.trim() ? (r.documentNumber === searchDocNum.trim()) : true;
      
      const recordDate = new Date(r.date);
      const matchDate = recordDate.getMonth() === filterMonth && recordDate.getFullYear() === filterYear;
      return matchSearch && matchDoc && matchDate;
  });

  const printStatement = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const monthLabel = months.find(m => m.value === filterMonth)?.label;
      const rowsHtml = filteredRecords.map((r, idx) => `<tr><td>${idx + 1}</td><td style="text-align:right;">${r.name}</td><td>${r.nationalId}</td><td>${r.documentNumber || '-'}</td><td>${r.jobType}</td><td>${r.amount.toLocaleString()}</td><td>${((r.taxAmount || 0) + (r.stampAmount || 0)).toLocaleString()}</td><td style="background:#f0fdf4">${(r.netAmount || r.amount).toLocaleString()}</td></tr>`).join('');
      const content = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><title>كشف عمالة خارجية</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"><style>@page { size: A4 landscape; margin: 10mm; } body { font-family: 'Cairo', sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed; } th, td { border: 1px solid #000; padding: 8px; text-align: center; overflow: hidden; } th { background:#f1f5f9; } </style></head><body><h2>نقابة المهندسين بأسيوط</h2><h3>كشف عمالة خارجية - شهر ${monthLabel} ${filterYear}</h3><table><thead><tr><th>م</th><th>المستفيد</th><th>الرقم القومي</th><th>المستند</th><th>العمل</th><th>الإجمالي</th><th>استقطاع</th><th>الصافي</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  const printVoucher = (record: ExternalWorkerRecord) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      const safeGross = record.amount || 0;
      const safeTax = record.taxAmount || 0;
      const safeStamp = record.stampAmount || 0;
      const safeNet = record.netAmount || (safeGross - safeTax - safeStamp);
      const totalDeductions = safeTax + safeStamp;

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>إذن صرف - ${record.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; padding: 0; margin: 0; background: white; -webkit-print-color-adjust: exact; }
                .voucher-page {
                    width: 100%; border: 2px solid #000; padding: 30px; box-sizing: border-box;
                    min-height: 95vh; display: flex; flex-direction: column; position: relative;
                }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #064e3b; padding-bottom: 15px; margin-bottom: 25px; }
                .header-text { text-align: center; flex: 1; }
                .header-text h2 { margin: 0; font-size: 24px; color: #064e3b; }
                .header-text h3 { margin: 10px 0; font-size: 18px; text-decoration: underline; }
                
                .info-section { margin-bottom: 30px; }
                .info-table { width: 100%; border-collapse: collapse; }
                .info-table td { padding: 10px; border-bottom: 1px dotted #ccc; font-size: 16px; }
                .label { font-weight: bold; width: 150px; color: #374151; }
                .val { font-weight: bold; }

                .financial-table { width: 100%; border-collapse: collapse; text-align: center; margin-top: 20px; }
                .financial-table th, .financial-table td { border: 1px solid #000; padding: 12px; }
                .financial-table th { background: #f3f4f6; font-size: 14px; }
                .financial-table td { font-weight: bold; font-size: 16px; }
                .net-cell { background-color: #dcfce7; font-size: 20px !important; border: 2px solid #000 !important; }

                .amount-text { margin: 20px 0; font-size: 14px; font-weight: bold; }
                .signatures { margin-top: auto; display: flex; justify-content: space-between; text-align: center; font-weight: bold; padding-top: 50px; }
                .sig-box { width: 30%; }
                
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <div style="padding: 10px; text-align: center;"><button onclick="window.print()" style="padding: 10px 25px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; font-family: Cairo; font-weight: bold;">🖨️ طباعة الاستمارة</button></div>
            
            <div class="voucher-page">
                <div class="header">
                    <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" style="height: 100px;" /></div>
                    <div class="header-text">
                        <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                        <h3>إذن صرف نقدية (عمالة خارجية)</h3>
                        <p>تاريخ الصرف: ${record.date}</p>
                    </div>
                    <div style="width: 100px;"></div>
                </div>

                <div class="info-section">
                    <table class="info-table">
                        <tr>
                            <td class="label">اسم المستفيد:</td>
                            <td class="val">${record.name}</td>
                            <td class="label">الرقم القومي:</td>
                            <td class="val">${record.nationalId}</td>
                        </tr>
                        <tr>
                            <td class="label">طبيعة العمل:</td>
                            <td class="val">${record.jobType}</td>
                            <td class="label">رقم المستند:</td>
                            <td class="val">${record.documentNumber || '-'}</td>
                        </tr>
                    </table>
                </div>

                <table class="financial-table">
                    <thead>
                        <tr>
                            <th>المبلغ الإجمالي (Gross)</th>
                            <th>إجمالي المستقطع</th>
                            <th>صافي المبلغ المنصرف</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${fmt(safeGross)} ج.م</td>
                            <td style="color: #b91c1c;">${fmt(totalDeductions)} ج.م</td>
                            <td class="net-cell">${fmt(safeNet)} ج.م</td>
                        </tr>
                    </tbody>
                </table>

                <div class="amount-text">
                    فقط وقدره: ${safeNet.toLocaleString('ar-EG')} جنيهاً مصرياً لا غير.
                    <br><br>
                    أقر أنا الموضح أعلاه بأنني استلمت المبلغ المذكور نظير الأعمال الموضحة، وهذا إيصال مني بالاستلام.
                </div>

                <div style="margin-top: 20px; font-weight: bold;">توقيع المستلم: ...........................................</div>

                <div class="signatures">
                    <div class="sig-box">إعداد / الموارد البشرية<br><br>......................</div>
                    <div class="sig-box">الادارة المالية<br><br>......................</div>
                    <div class="sig-box">يعتمد / أمين الصندوق<br><br>......................</div>
                </div>
            </div>
        </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3"><Briefcase className="text-emerald-600" size={32} /> عملاء وعمالة من الخارج</h2><p className="text-emerald-600 mt-1">تسجيل وصرف مستحقات المتعاملين من خارج النقابة</p></div>
        <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2 border border-emerald-200 rounded-lg px-2 py-1">
                <Calendar size={18} className="text-emerald-500" />
                <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className="bg-transparent outline-none text-sm font-bold text-emerald-800 border-l border-emerald-200 pl-2 ml-2">{months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
                <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="bg-transparent outline-none text-sm font-bold text-emerald-800">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
            </div>
            <button onClick={printStatement} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-md">طبع كشف مجمع</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-220px)]">
          <div className="lg:col-span-1">
              <div className={`bg-white p-6 rounded-xl shadow-sm border ${editingId ? 'border-amber-400 bg-amber-50/20' : 'border-emerald-100'}`}>
                  <h3 className="font-bold text-lg text-emerald-900 mb-6 flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">{editingId ? <Edit2 size={20} /> : <Plus size={20} />}{editingId ? 'تعديل المعاملة' : 'تسجيل عملية جديدة'}</div>
                      {editingId && (<button onClick={cancelEdit} className="text-slate-400 hover:text-red-500"><X size={18} /></button>)}
                  </h3>
                  <div className="space-y-4">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">الاسم الرباعي</label><input type="text" className="w-full px-4 py-2 border rounded-lg outline-none" value={newRecord.name || ''} onChange={e => setNewRecord({...newRecord, name: e.target.value})} /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">الرقم القومي</label><input type="text" maxLength={14} className="w-full px-4 py-2 border rounded-lg outline-none font-mono" value={newRecord.nationalId || ''} onChange={e => setNewRecord({...newRecord, nationalId: e.target.value})} /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">رقم المستند</label><input type="text" className="w-full px-4 py-2 border rounded-lg outline-none font-mono" value={newRecord.documentNumber || ''} onChange={e => setNewRecord({...newRecord, documentNumber: e.target.value})} /></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-sm font-bold text-slate-700 mb-1">المبلغ</label><input type="number" className="w-full px-4 py-2 border rounded-lg outline-none font-bold" value={newRecord.amount || ''} onChange={e => setNewRecord({...newRecord, amount: Number(e.target.value)})} /></div>
                          <div><label className="block text-sm font-bold text-slate-700 mb-1">نسبة الضريبة %</label><input type="number" className="w-full px-4 py-2 border rounded-lg outline-none text-center" value={taxRateInput} onChange={e => setTaxRateInput(e.target.value)} /></div>
                      </div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">العمل</label><input type="text" className="w-full px-4 py-2 border rounded-lg outline-none" value={newRecord.jobType || ''} onChange={e => setNewRecord({...newRecord, jobType: e.target.value})} /></div>
                      <button onClick={handleSave} className={`w-full text-white py-2.5 rounded-lg font-bold shadow-md transition-all ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>حفظ</button>
                  </div>
              </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-emerald-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-emerald-100 bg-emerald-50/50 flex gap-4">
                  <div className="relative flex-1"><Search className="absolute right-3 top-3 text-emerald-400" size={18} /><input type="text" placeholder="بحث بالاسم..." className="w-full pl-4 pr-10 py-2 border border-emerald-200 rounded-lg outline-none bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                  <div className="relative w-48"><FileText className="absolute right-3 top-3 text-emerald-400" size={18} /><input type="text" placeholder="رقم المستند" className="w-full pl-4 pr-10 py-2 border border-emerald-200 rounded-lg outline-none bg-white font-mono" value={searchDocNum} onChange={(e) => setSearchDocNum(e.target.value)} /></div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                  <table className="w-full text-right text-sm">
                      <thead className="bg-emerald-50 text-emerald-800 sticky top-0"><tr><th className="p-3">المستفيد</th><th className="p-3">المستند</th><th className="p-3">الصافي</th><th className="p-3 text-center">إجراءات</th></tr></thead>
                      <tbody className="divide-y divide-emerald-50">
                          {filteredRecords.map(rec => (
                              <tr key={rec.id} className="hover:bg-slate-50">
                                  <td className="p-3">
                                      <div className="font-bold">{rec.name}</div>
                                      <div className="text-[10px] text-slate-400 font-mono">{rec.nationalId}</div>
                                  </td>
                                  <td className="p-3 font-mono text-emerald-600">{rec.documentNumber || '-'}</td>
                                  <td className="p-3 font-bold text-emerald-700">{(rec.netAmount || rec.amount).toLocaleString()} ج.م</td>
                                  <td className="p-3 flex justify-center gap-2">
                                      <button onClick={() => handleEdit(rec)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="تعديل"><Edit2 size={16} /></button>
                                      <button onClick={() => printVoucher(rec)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="طباعة إذن صرف"><Printer size={16} /></button>
                                      <button onClick={() => handleDelete(rec.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="حذف"><Trash2 size={16} /></button>
                                  </td>
                              </tr>
                          ))}
                          {filteredRecords.length === 0 && (<tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد سجلات مطابقة للبحث في هذا الشهر</td></tr>)}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
};
