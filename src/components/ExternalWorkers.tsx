
import React, { useState } from 'react';
import { ExternalWorkerRecord } from '../types';
import { Briefcase, Printer, Plus, Trash2, Search, User, CreditCard, FileText } from 'lucide-react';

interface ExternalWorkersProps {
  records: ExternalWorkerRecord[];
  setRecords: (records: ExternalWorkerRecord[]) => void;
}

export const ExternalWorkers: React.FC<ExternalWorkersProps> = ({ records, setRecords }) => {
  const [newRecord, setNewRecord] = useState<Partial<ExternalWorkerRecord>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = () => {
    if (!newRecord.name || !newRecord.nationalId || !newRecord.jobType || !newRecord.amount) {
        alert('يرجى ملء جميع البيانات المطلوبة');
        return;
    }

    const record: ExternalWorkerRecord = {
        id: `EXT-${Date.now()}`,
        name: newRecord.name!,
        nationalId: newRecord.nationalId!,
        jobType: newRecord.jobType!,
        amount: Number(newRecord.amount),
        date: new Date().toISOString().split('T')[0]
    };

    setRecords([...records, record]);
    setNewRecord({});
    alert('تم إضافة السجل بنجاح');
  };

  const handleDelete = (id: string) => {
      if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
          setRecords(records.filter(r => r.id !== id));
      }
  };

  const filteredRecords = records.filter(r => 
      r.name.includes(searchTerm) || r.nationalId.includes(searchTerm) || r.jobType.includes(searchTerm)
  );

  const printVoucher = (record: ExternalWorkerRecord) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>استمارة صرف عميل خارجي</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; padding: 20px; background: white; color: #000; }
                .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #064e3b; padding-bottom: 10px; margin-bottom: 30px; }
                .header-text { text-align: center; flex: 1; }
                .header-text h2 { margin: 5px 0; color: #064e3b; font-size: 24px; }
                .header-text h3 { margin: 5px 0; font-size: 18px; text-decoration: underline; }
                
                .voucher-box { border: 2px solid #000; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
                .row { display: flex; margin-bottom: 15px; align-items: center; font-size: 16px; }
                .label { font-weight: bold; width: 150px; color: #333; }
                .value { flex: 1; border-bottom: 1px dotted #000; padding-bottom: 2px; font-weight: bold; }
                
                .amount-box { 
                    text-align: center; 
                    margin: 30px 0; 
                    padding: 15px; 
                    background: #f0fdf4; 
                    border: 1px solid #064e3b; 
                    font-size: 20px; 
                    font-weight: bold; 
                    color: #064e3b;
                }

                .signatures { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-top: 60px; 
                    text-align: center; 
                    font-weight: bold;
                    font-size: 14px;
                }
                .sig-box { width: 30%; }
                
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">🖨️ طباعة الاستمارة</button>
            
            <div class="header-container">
                <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 120px;" /></div>
                <div class="header-text">
                    <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                    <h3>استمارة صرف (عمالة خارجية / من الخارج)</h3>
                    <p>تحريراً في: ${record.date}</p>
                </div>
                <div style="width: 120px;"></div>
            </div>

            <div class="voucher-box">
                <div class="row">
                    <span class="label">اسم المستفيد:</span>
                    <span class="value">${record.name}</span>
                </div>
                <div class="row">
                    <span class="label">الرقم القومي:</span>
                    <span class="value">${record.nationalId}</span>
                </div>
                <div class="row">
                    <span class="label">طبيعة العمل:</span>
                    <span class="value">${record.jobType}</span>
                </div>
            </div>

            <div class="amount-box">
                مبلغ وقدره: ${record.amount.toLocaleString()} جنيهاً مصرياً لا غير
            </div>

            <div style="font-size: 14px; margin-bottom: 20px;">
                أقر أنا الموقع أعلاه بأنني استلمت المبلغ الموضح نظير الأعمال المذكورة، وهذا إيصال مني بذلك.
                <br><br>
                <strong>توقيع المستلم:</strong> ......................................
            </div>

            <div class="signatures">
                <div class="sig-box">
                    الموارد البشرية المختص<br><br><br>......................
                </div>
                <div class="sig-box">
                    الادارة المالية<br><br><br>......................
                </div>
                <div class="sig-box">
                    أمين الصندوق<br><br><br>......................
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <Briefcase className="text-emerald-600" size={32} />
            عملاء وعمالة من الخارج
        </h2>
        <p className="text-emerald-600 mt-1">تسجيل وصرف مستحقات المتعاملين من خارج النقابة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          {/* Form Side */}
          <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                  <h3 className="font-bold text-lg text-emerald-900 mb-6 flex items-center gap-2 border-b pb-2">
                      <Plus size={20} />
                      تسجيل عملية جديدة
                  </h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">الاسم الرباعي</label>
                          <div className="relative">
                              <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-emerald-500" 
                                value={newRecord.name || ''}
                                onChange={e => setNewRecord({...newRecord, name: e.target.value})}
                              />
                              <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">الرقم القومي</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-emerald-500 font-mono" 
                            value={newRecord.nationalId || ''}
                            onChange={e => setNewRecord({...newRecord, nationalId: e.target.value})}
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">نوع العمل / الخدمة</label>
                          <div className="relative">
                              <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-emerald-500" 
                                placeholder="مثلاً: صيانة تكييفات، أعمال نظافة..."
                                value={newRecord.jobType || ''}
                                onChange={e => setNewRecord({...newRecord, jobType: e.target.value})}
                              />
                              <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ المستحق</label>
                          <div className="relative">
                              <input 
                                type="number" 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-emerald-500 font-bold" 
                                value={newRecord.amount || ''}
                                onChange={e => setNewRecord({...newRecord, amount: Number(e.target.value)})}
                              />
                              <CreditCard className="absolute left-3 top-2.5 text-slate-400" size={18} />
                          </div>
                      </div>

                      <button 
                        onClick={handleAdd}
                        className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-md transition-colors flex items-center justify-center gap-2 mt-4"
                      >
                          <Plus size={20} />
                          إضافة وحفظ
                      </button>
                  </div>
              </div>
          </div>

          {/* List Side */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-emerald-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-emerald-100 bg-emerald-50/50">
                  <div className="relative">
                      <Search className="absolute right-3 top-3 text-emerald-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="بحث بالاسم أو الرقم القومي..." 
                        className="w-full pl-4 pr-10 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                  <table className="w-full text-right text-sm">
                      <thead className="bg-emerald-50 text-emerald-800 sticky top-0">
                          <tr>
                              <th className="p-3 rounded-r-lg">الاسم</th>
                              <th className="p-3">نوع العمل</th>
                              <th className="p-3">التاريخ</th>
                              <th className="p-3">المبلغ</th>
                              <th className="p-3 text-center rounded-l-lg">إجراءات</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-50">
                          {filteredRecords.map(rec => (
                              <tr key={rec.id} className="hover:bg-slate-50">
                                  <td className="p-3 font-bold text-slate-800">
                                      {rec.name}
                                      <div className="text-[10px] text-slate-400 font-mono">{rec.nationalId}</div>
                                  </td>
                                  <td className="p-3">{rec.jobType}</td>
                                  <td className="p-3 font-mono text-slate-500">{rec.date}</td>
                                  <td className="p-3 font-bold font-mono text-emerald-700">{rec.amount.toLocaleString()} ج.م</td>
                                  <td className="p-3 flex justify-center gap-2">
                                      <button 
                                        onClick={() => printVoucher(rec)}
                                        className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                        title="طباعة إذن صرف"
                                      >
                                          <Printer size={16} />
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(rec.id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        title="حذف"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                          {filteredRecords.length === 0 && (
                              <tr>
                                  <td colSpan={5} className="p-8 text-center text-slate-400">لا توجد سجلات</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
};
