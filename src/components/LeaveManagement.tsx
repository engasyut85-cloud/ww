
import React, { useState } from 'react';
import { Employee, LeaveRequest } from '../types';
import { CheckCircle, XCircle, Clock, Plus, MapPin, Briefcase, Calendar, Printer, Filter, Search, FileText } from 'lucide-react';

interface LeaveManagementProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  setLeaves: (leaves: LeaveRequest[]) => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({ employees, leaves, setLeaves }) => {
  const [activeTab, setActiveTab] = useState<'leaves' | 'missions'>('leaves');
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<LeaveRequest>>({ type: 'annual' });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDocNum, setSearchDocNum] = useState('');

  // Date Filtering
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  const months = [
      { value: 0, label: 'يناير' }, { value: 1, label: 'فبراير' }, { value: 2, label: 'مارس' },
      { value: 3, label: 'أبريل' }, { value: 4, label: 'مايو' }, { value: 5, label: 'يونيو' },
      { value: 6, label: 'يوليو' }, { value: 7, label: 'أغسطس' }, { value: 8, label: 'سبتمبر' },
      { value: 9, label: 'أكتوبر' }, { value: 10, label: 'نوفمبر' }, { value: 11, label: 'ديسمبر' }
  ];
  const years = [filterYear - 1, filterYear, filterYear + 1];

  // Filter requests based on active tab AND selected month/year AND search term
  const displayedRequests = leaves.filter(l => {
    const emp = employees.find(e => e.id === l.employeeId);
    
    const isCorrectType = activeTab === 'missions' ? l.type === 'mission' : l.type !== 'mission';
    const startDate = new Date(l.startDate);
    const isCorrectDate = startDate.getMonth() === filterMonth && startDate.getFullYear() === filterYear;
    
    const isMatchSearch = searchTerm 
        ? emp?.name.includes(searchTerm) 
        : true;
        
    // تعديل: مطابقة تامة لرقم المستند
    const isMatchDoc = searchDocNum.trim() ? (emp?.documentNumber === searchDocNum.trim()) : true;

    return isCorrectType && isCorrectDate && isMatchSearch && isMatchDoc;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const request: LeaveRequest = {
        id: `REQ${Date.now()}`,
        employeeId: newRequest.employeeId!,
        type: activeTab === 'missions' ? 'mission' : (newRequest.type || 'annual'),
        startDate: newRequest.startDate!,
        endDate: newRequest.endDate!,
        reason: newRequest.reason || '',
        location: newRequest.location,
        status: 'pending'
    };
    setLeaves([...leaves, request]);
    setShowModal(false);
    setNewRequest({ type: 'annual' });
  };

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
      setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
  };

  const getTypeLabel = (type: string) => {
      switch(type) {
          case 'annual': return 'إجازة اعتيادية';
          case 'sick': return 'إجازة مرضية';
          case 'casual': return 'إجازة عارضة';
          case 'unpaid': return 'بدون راتب';
          case 'mission': return 'مأمورية عمل';
          default: return type;
      }
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'approved': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> مقبول</span>;
          case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12} /> مرفوض</span>;
          default: return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> معلق</span>;
      }
  };

  const printReport = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const title = activeTab === 'missions' ? 'سجل المأموريات الخارجية' : 'سجل الإجازات';
      const monthLabel = months.find(m => m.value === filterMonth)?.label;

      const rows = displayedRequests.map((req, idx) => {
        const emp = employees.find(e => e.id === req.employeeId);
        const typeOrLoc = activeTab === 'missions' ? req.location : getTypeLabel(req.type);
        const reason = req.reason;
        
        return `
            <tr>
                <td>${idx + 1}</td>
                <td>${emp?.name}</td>
                <td>${emp?.department}</td>
                <td>${typeOrLoc}</td>
                <td>${req.startDate}</td>
                <td>${req.endDate}</td>
                <td>${reason}</td>
                <td>${req.status === 'approved' ? 'مقبول' : req.status === 'rejected' ? 'مرفوض' : 'معلق'}</td>
            </tr>
        `;
      }).join('');

      const headers = activeTab === 'missions' 
        ? `<th>الجهة / الموقع</th>` 
        : `<th>نوع الإجازة</th>`;

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>${title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: A4 landscape; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; padding: 20px; }
                .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 20px; }
                .header-text { text-align: center; flex: 1; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: center; }
                th { background: #ecfdf5; color: #065f46; font-weight: bold; }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">🖨️ طباعة السجل</button>
            <div class="header-container">
                <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 120px;" /></div>
                <div class="header-text">
                    <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                    <h3>${title}</h3>
                    <p>عن شهر: ${monthLabel} ${filterYear}</p>
                </div>
                <div style="width: 120px;"></div>
            </div>
            <table>
                <thead>
                    <tr><th width="5%">م</th><th width="20%">الموظف</th><th width="15%">القسم</th>${headers}<th width="12%">من تاريخ</th><th width="12%">إلى تاريخ</th><th width="20%">${activeTab === 'missions' ? 'الغرض' : 'السبب'}</th><th width="10%">الحالة</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-3xl font-bold text-emerald-900">إدارة الإجازات والمأموريات</h2><p className="text-emerald-600 mt-1">تقديم ومتابعة سجلات الغياب والعمل الخارجي</p></div>
        <div className="flex items-center gap-3">
            <div className="relative"><Search className="absolute right-3 top-2.5 text-emerald-400" size={16} /><input type="text" placeholder="بحث بالاسم..." className="pl-4 pr-9 py-2 border border-emerald-200 rounded-lg outline-none bg-white text-sm w-48" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="relative"><FileText className="absolute right-3 top-2.5 text-emerald-400" size={16} /><input type="text" placeholder="رقم المستند" className="pl-4 pr-9 py-2 border border-emerald-200 rounded-lg outline-none bg-white text-sm w-40 font-mono" value={searchDocNum} onChange={(e) => setSearchDocNum(e.target.value)} /></div>
            <div className="flex items-center gap-2 border border-emerald-200 rounded-lg px-2 py-1 bg-white"><Filter size={16} className="text-emerald-500 ml-1" /><select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className="bg-transparent outline-none text-sm font-bold text-emerald-800 border-l border-emerald-200 pl-2 ml-2">{months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select><select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="bg-transparent outline-none text-sm font-bold text-emerald-800">{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
            <button onClick={printReport} className="bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium"><Printer size={18} />طباعة السجل</button>
            <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-emerald-900/10"><Plus size={18} />{activeTab === 'missions' ? 'تسجيل مأمورية' : 'طلب إجازة'}</button>
        </div>
      </div>
      <div className="flex gap-4 mb-6 border-b border-emerald-200"><button onClick={() => setActiveTab('leaves')} className={`pb-3 px-6 font-bold flex items-center gap-2 transition-all ${activeTab === 'leaves' ? 'border-b-4 border-emerald-600 text-emerald-800' : 'text-slate-500 hover:text-emerald-600'}`}><Calendar size={20} />سجل الإجازات</button><button onClick={() => setActiveTab('missions')} className={`pb-3 px-6 font-bold flex items-center gap-2 transition-all ${activeTab === 'missions' ? 'border-b-4 border-emerald-600 text-emerald-800' : 'text-slate-500 hover:text-emerald-600'}`}><Briefcase size={20} />المأموريات</button></div>
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden"><table className="w-full text-right"><thead className="bg-emerald-50 border-b border-emerald-100"><tr><th className="p-4 text-sm font-bold text-emerald-800">الموظف</th><th className="p-4 text-sm font-bold text-emerald-800">{activeTab === 'missions' ? 'جهة المأمورية' : 'نوع الإجازة'}</th><th className="p-4 text-sm font-bold text-emerald-800">من</th><th className="p-4 text-sm font-bold text-emerald-800">إلى</th><th className="p-4 text-sm font-bold text-emerald-800">{activeTab === 'missions' ? 'الغرض' : 'السبب'}</th><th className="p-4 text-sm font-bold text-emerald-800">الحالة</th><th className="p-4 text-sm font-bold text-emerald-800">إجراءات</th></tr></thead><tbody className="divide-y divide-emerald-50">{displayedRequests.map(item => { const emp = employees.find(e => e.id === item.employeeId); return (<tr key={item.id} className="hover:bg-emerald-50/50"><td className="p-4 font-bold text-slate-800">{emp?.name || item.employeeId}{emp?.documentNumber && <div className="text-[10px] text-emerald-600 font-normal">مستند: {emp.documentNumber}</div>}</td><td className="p-4 text-slate-600">{activeTab === 'missions' ? (<div className="flex items-center gap-1"><MapPin size={14} className="text-emerald-500" />{item.location || 'غير محدد'}</div>) : (getTypeLabel(item.type))}</td><td className="p-4 text-slate-600 font-mono text-sm">{item.startDate}</td><td className="p-4 text-slate-600 font-mono text-sm">{item.endDate}</td><td className="p-4 text-slate-600 text-sm max-w-xs truncate">{item.reason}</td><td className="p-4">{getStatusBadge(item.status)}</td><td className="p-4 flex gap-2">{item.status === 'pending' && (<><button onClick={() => updateStatus(item.id, 'approved')} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg" title="قبول"><CheckCircle size={18} /></button><button onClick={() => updateStatus(item.id, 'rejected')} className="text-red-600 hover:bg-red-50 p-2 rounded-lg" title="رفض"><XCircle size={18} /></button></>)}</td></tr>); })}</tbody></table></div>
      {showModal && (<div className="fixed inset-0 bg-emerald-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"><div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl animate-fade-in-up"><h3 className="text-xl font-bold mb-4 text-emerald-900">{activeTab === 'missions' ? 'تسجيل مأمورية عمل خارجية' : 'تقديم طلب إجازة'}</h3><form onSubmit={handleAdd} className="space-y-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">الموظف</label><select required className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewRequest({...newRequest, employeeId: e.target.value})}><option value="">-- اختر الموظف --</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
      {activeTab === 'missions' ? (<div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">جهة المأمورية</label><input required type="text" placeholder="جهة الزيارة" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewRequest({...newRequest, location: e.target.value})} /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">الغرض</label><input required type="text" placeholder="السبب" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewRequest({...newRequest, reason: e.target.value})} /></div></div>) : (<div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">نوع الإجازة</label><select className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewRequest({...newRequest, type: e.target.value as any})} value={newRequest.type}><option value="annual">اعتيادية</option><option value="casual">عارضة</option><option value="sick">مرضية</option><option value="unpaid">بدون راتب</option></select></div><div><label className="block text-sm font-bold text-slate-700 mb-1">السبب</label><input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewRequest({...newRequest, reason: e.target.value})} /></div></div>)}
      <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">من تاريخ</label><input required type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewRequest({...newRequest, startDate: e.target.value})} /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">إلى تاريخ</label><input required type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewRequest({...newRequest, endDate: e.target.value})} /></div></div><div className="flex gap-3 mt-4"><button type="submit" className="flex-1 bg-emerald-900 text-white py-2 rounded-lg font-bold hover:bg-emerald-800">حفظ الطلب</button><button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50">إلغاء</button></div></form></div></div>)}
    </div>
  );
};
