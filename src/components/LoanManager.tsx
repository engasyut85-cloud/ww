
import React, { useState } from 'react';
import { Employee, Loan } from '../types';
import { Wallet, Plus, AlertCircle, Trash2, Search, FileText, Smartphone, Edit2, Check, X, Printer, CalendarClock, History, Clock, Building2 } from 'lucide-react';
import { calculateLoanBalances } from '../utils/payrollLogic';

interface LoanManagerProps {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  loans: Loan[];
  setLoans: (loans: Loan[]) => void;
}

export const LoanManager: React.FC<LoanManagerProps> = ({ employees, setEmployees, loans, setLoans }) => {
  const [activeTab, setActiveTab] = useState<'loans' | 'bank' | 'vodafone'>('loans');
  const [showModal, setShowModal] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [newLoan, setNewLoan] = useState<Partial<Loan>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDocNum, setSearchDocNum] = useState('');
  
  const [editingVodafoneId, setEditingVodafoneId] = useState<string | null>(null);
  const [vodafoneInput, setVodafoneInput] = useState<string>('');

  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.employeeId || !newLoan.totalAmount || !newLoan.monthlyInstallment) return;
    
    const type: 'loan' | 'bank' = activeTab === 'bank' ? 'bank' : 'loan';

    if (editingLoanId) {
        const updatedLoans = loans.map(l => {
            if (l.id === editingLoanId) {
                return {
                    ...l,
                    totalAmount: Number(newLoan.totalAmount),
                    monthlyInstallment: Number(newLoan.monthlyInstallment),
                    startDate: newLoan.startDate || l.startDate,
                    remainingAmount: Number(newLoan.totalAmount), 
                    type: type 
                };
            }
            return l;
        });
        setLoans(updatedLoans);
    } else {
        const loan: Loan = {
            id: `LN${Date.now()}`,
            employeeId: newLoan.employeeId!,
            type: type,
            totalAmount: Number(newLoan.totalAmount),
            remainingAmount: Number(newLoan.totalAmount),
            monthlyInstallment: Number(newLoan.monthlyInstallment),
            startDate: newLoan.startDate || new Date().toISOString().split('T')[0],
            status: 'active'
        };
        setLoans([...loans, loan]);
    }
    closeModal();
  };

  const handleEditLoan = (loan: Loan) => {
      setEditingLoanId(loan.id);
      setNewLoan({ ...loan });
      setShowModal(true);
  };

  const closeModal = () => {
      setShowModal(false);
      setEditingLoanId(null);
      setNewLoan({});
  };

  const deleteLoan = (id: string) => {
      const typeLabel = activeTab === 'bank' ? 'قسط البنك' : 'السلفة';
      if(confirm(`هل أنت متأكد من إلغاء ${typeLabel}؟`)) {
          setLoans(loans.filter(l => l.id !== id));
      }
  };

  const updateVodafoneDeduction = (empId: string, amount: number) => {
      const updatedEmployees = employees.map(emp => 
        emp.id === empId ? { ...emp, vodafoneDeduction: amount, lastModifiedDate: new Date().toISOString().split('T')[0] } : emp
      );
      setEmployees(updatedEmployees);
      setEditingVodafoneId(null);
      setVodafoneInput('');
  };

  const filteredEmployees = employees.filter(emp => {
      const matchGeneral = emp.name.includes(searchTerm) || emp.nationalId.includes(searchTerm);
      // تعديل: مطابقة تامة لرقم المستند
      const matchDoc = searchDocNum.trim() ? (emp.documentNumber === searchDocNum.trim()) : true;
      return matchGeneral && matchDoc;
  });

  const currentTypeFilteredLoans = loans.filter(l => {
      const matchesType = activeTab === 'bank' ? l.type === 'bank' : (l.type === 'loan' || !l.type);
      const emp = employees.find(e => e.id === l.employeeId);
      if (!emp) return false;
      const matchGeneral = emp.name.includes(searchTerm) || emp.nationalId.includes(searchTerm);
      
      // تعديل: مطابقة تامة لرقم المستند
      const matchDoc = searchDocNum.trim() ? (emp.documentNumber === searchDocNum.trim()) : true;
      return matchesType && matchGeneral && matchDoc;
  });

  const printLoansReport = () => {
      const today = new Date();
      const reportTitle = activeTab === 'bank' ? 'بيان مديونيات أقساط البنك' : 'بيان مديونيات السلف والقروض';
      let totalAmountSum = 0;
      let monthlyInstallmentSum = 0;
      let remainingBalanceSum = 0;
      const rows = currentTypeFilteredLoans.map((l, idx) => {
          const emp = employees.find(e => e.id === l.employeeId);
          const balances = calculateLoanBalances(l, today);
          const remaining = balances.remainingAfter;
          totalAmountSum += l.totalAmount;
          monthlyInstallmentSum += l.monthlyInstallment;
          remainingBalanceSum += remaining;
          return `<tr><td>${idx + 1}</td><td style="text-align: right; font-weight: bold;">${emp?.name || '-'}</td><td>${emp?.department || '-'}</td><td style="font-family: monospace;">${l.startDate}</td><td style="font-family: monospace; font-weight: bold; color: #065f46;">${balances.expectedEndDate}</td><td>${l.totalAmount.toLocaleString()}</td><td style="color: #059669; font-weight: bold;">${l.monthlyInstallment.toLocaleString()}</td><td style="background-color: #fef2f2; color: #b91c1c; font-weight: 900;">${remaining.toLocaleString()}</td></tr>`;
      }).filter(Boolean).join('');
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const content = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><title>${reportTitle}</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"><style>@page { size: A4 landscape; margin: 10mm; } body { font-family: 'Cairo', sans-serif; padding: 20px; color: #000; } .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #064e3b; padding-bottom: 15px; margin-bottom: 25px; } .title { text-align: center; flex: 1; } table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; } th, td { border: 1px solid #000; padding: 8px; text-align: center; } th { background-color: #f1f5f9; font-weight: 900; } .footer-total { background-color: #064e3b; color: white; font-weight: 900; font-size: 12px; } .footer-total td { border-color: #fff; } .signatures { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-weight: bold; } @media print { button { display: none; } } </style></head><body><button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">🖨️ طباعة الكشف</button><div class="header"><div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" style="height: 110px;" /></div><div class="title"><h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2><h3>${reportTitle}</h3><p>تاريخ الكشف: ${new Date().toLocaleDateString('ar-EG')}</p></div><div style="width: 110px;"></div></div><table><thead><tr><th width="4%">م</th><th width="20%">اسم الموظف</th><th width="15%">الإدارة</th><th width="10%">تاريخ البدء</th><th width="10%">تاريخ الانتهاء</th><th width="12%">إجمالي المبلغ</th><th width="12%">القسط الشهري</th><th width="12%">المتبقي الفعلي</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="footer-total"><td colspan="5" style="text-align: left; padding-left: 20px;">الإجمالي العام</td><td>${totalAmountSum.toLocaleString()}</td><td>${monthlyInstallmentSum.toLocaleString()}</td><td>${remainingBalanceSum.toLocaleString()}</td></tr></tfoot></table><div class="signatures"><div>شئون العاملين<br><br>...................</div><div>المدير المالي<br><br>...................</div><div>أمين الصندوق<br><br>...................</div></div></body></html>`;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  const printVodafoneReport = () => {
      const monthLabel = new Date().toLocaleString('ar-EG', { month: 'long' });
      const year = new Date().getFullYear();
      const reportTitle = 'كشف اشتراكات فودافون بيزنس';
      let totalSum = 0;
      const employeesWithVodafone = filteredEmployees.filter(e => (e.vodafoneDeduction || 0) > 0);
      const rows = employeesWithVodafone.map((emp, idx) => {
          totalSum += (emp.vodafoneDeduction || 0);
          return `<tr><td>${idx + 1}</td><td style="text-align: right; font-weight: bold;">${emp.name}</td><td>${emp.department}</td><td>${emp.documentNumber || '-'}</td><td style="font-weight: bold; color: #b91c1c;">${(emp.vodafoneDeduction || 0).toLocaleString()} ج.م</td></tr>`;
      }).join('');
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const content = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><title>${reportTitle}</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"><style>@page { size: A4; margin: 15mm; } body { font-family: 'Cairo', sans-serif; padding: 20px; color: #000; -webkit-print-color-adjust: exact; } .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #064e3b; padding-bottom: 15px; margin-bottom: 25px; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #000; padding: 10px; text-align: center; } th { background-color: #f1f5f9; font-weight: 900; } .footer-total { background-color: #064e3b; color: white; font-weight: 900; } @media print { button { display: none; } } </style></head><body><button onclick="window.print()" style="padding: 10px 20px; background: #064e3b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">🖨️ طباعة الكشف</button><div class="header"><div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" style="height: 100px;" /></div><div style="text-align: center; flex: 1;"><h2>نقابة المهندسين - الفرعية بأسيوط</h2><h3>${reportTitle}</h3><p>عن شهر: ${monthLabel} ${year}</p></div><div style="width: 100px;"></div></div><table><thead><tr><th>م</th><th>اسم الموظف</th><th>الإدارة</th><th>رقم المستند</th><th>قيمة الاشتراك</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="footer-total"><td colspan="4" style="text-align: left; padding-left: 20px;">الإجمالي العام</td><td>${totalSum.toLocaleString()} ج.م</td></tr></tfoot></table></body></html>`;
      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div><h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">{activeTab === 'loans' ? <Wallet className="text-emerald-600" size={32} /> : activeTab === 'bank' ? <Building2 className="text-blue-600" size={32} /> : <Smartphone className="text-emerald-600" size={32} />}{activeTab === 'loans' ? 'السلف والقروض' : activeTab === 'bank' ? 'أقساط البنك' : 'اشتراكات فودافون'}</h2><p className="text-emerald-600 mt-1">إدارة الاستقطاعات الشهرية الاختيارية من الراتب الصافي</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={activeTab === 'vodafone' ? printVodafoneReport : printLoansReport} className="bg-white text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50 shadow-sm transition-all"><Printer size={18} /> {activeTab === 'vodafone' ? 'طبع كشف فودافون' : 'طبع كشف المديونيات'}</button><div className="flex bg-white p-1 rounded-xl border border-emerald-100 shadow-sm"><button onClick={() => setActiveTab('loans')} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'loans' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-emerald-50'}`}>السلف</button><button onClick={() => setActiveTab('bank')} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'bank' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-emerald-50'}`}>أقساط بنك</button><button onClick={() => setActiveTab('vodafone')} className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'vodafone' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-emerald-50'}`}>فودافون</button></div></div>
      </div>
      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm"><div className="relative flex-1 min-w-[200px]"><Search className="absolute right-3 top-2.5 text-emerald-400" size={18} /><input type="text" placeholder="بحث بالاسم أو الرقم القومي..." className="w-full pl-4 pr-10 py-2 border border-emerald-200 rounded-lg outline-none bg-slate-50/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><div className="relative w-48"><FileText className="absolute right-3 top-2.5 text-emerald-400" size={18} /><input type="text" placeholder="رقم المستند" className="w-full pl-4 pr-10 py-2 border border-emerald-200 rounded-lg outline-none bg-slate-50/50 font-mono" value={searchDocNum} onChange={(e) => setSearchDocNum(e.target.value)} /></div>{(activeTab === 'loans' || activeTab === 'bank') && (<button onClick={() => { setEditingLoanId(null); setNewLoan({}); setShowModal(true); }} className={`text-white px-5 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md transition-all ${activeTab === 'bank' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}><Plus size={18} /> {activeTab === 'bank' ? 'تسجيل قسط بنك' : 'تسجيل سلفة'}</button>)}</div>
      {(activeTab === 'loans' || activeTab === 'bank') ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{currentTypeFilteredLoans.map(loan => { const emp = employees.find(e => e.id === loan.employeeId); const balances = calculateLoanBalances(loan, new Date()); const remaining = balances.remainingAfter; const progress = ((loan.totalAmount - remaining) / loan.totalAmount) * 100; return (<div key={loan.id} className={`bg-white p-6 rounded-xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-all ${activeTab === 'bank' ? 'border-blue-100' : 'border-emerald-100'}`}><div className="absolute top-0 left-0 w-full h-1 bg-slate-50"><div className={`h-full transition-all duration-500 ${activeTab === 'bank' ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }}></div></div><div className="flex justify-between items-start mb-4"><div><h3 className="font-bold text-slate-900 text-lg">{emp?.name}</h3><p className="text-[10px] text-slate-500 font-mono flex items-center gap-1"><Clock size={12}/> البدء: {loan.startDate}</p></div><div className="flex gap-1 transition-opacity"><button onClick={() => handleEditLoan(loan)} className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50"><Edit2 size={16} /></button><button onClick={() => deleteLoan(loan.id)} className="text-slate-200 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button></div></div><div className="space-y-3"><div className="flex justify-between text-sm"><span className="text-slate-500">إجمالي المبلغ</span><span className="font-bold text-slate-800">{loan.totalAmount.toLocaleString()} ج.م</span></div><div className="flex justify-between text-sm"><span className="text-slate-500">القسط الشهري</span><span className={`font-bold ${activeTab === 'bank' ? 'text-blue-600' : 'text-emerald-600'}`}>{loan.monthlyInstallment.toLocaleString()} ج.م</span></div><div className="flex justify-between text-sm pt-2 border-t"><span className="text-slate-500">المتبقي (تلقائي)</span><span className="font-bold text-red-500">{remaining.toLocaleString()} ج.م</span></div><div className={`p-2 rounded border flex items-center justify-between mt-2 ${activeTab === 'bank' ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'}`}><span className={`text-[10px] font-bold flex items-center gap-1 ${activeTab === 'bank' ? 'text-blue-800' : 'text-emerald-800'}`}><History size={12}/> آخر قسط متوقع:</span><span className={`text-[10px] font-mono font-bold ${activeTab === 'bank' ? 'text-blue-700' : 'text-emerald-700'}`}>{balances.expectedEndDate}</span></div></div>{remaining <= 0 && <div className="absolute top-0 right-0 p-2"><span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">تم السداد بالكامل</span></div>}</div>); })}</div>) : (<div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden"><table className="w-full text-right text-sm"><thead className="bg-emerald-50 text-emerald-800 border-b border-emerald-100"><tr><th className="p-4">الموظف</th><th className="p-4">قيمة الاشتراك (شهرياً)</th><th className="p-4 text-center">إجراءات</th></tr></thead><tbody className="divide-y divide-emerald-50">{filteredEmployees.map(emp => (<tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group"><td className="p-4"><div className="font-bold text-slate-800">{emp.name}</div></td><td className="p-4">{editingVodafoneId === emp.id ? (<div className="flex items-center gap-2"><input autoFocus type="number" className="w-24 border rounded px-2 py-1" value={vodafoneInput} onChange={(e) => setVodafoneInput(e.target.value)} /><button onClick={() => updateVodafoneDeduction(emp.id, Number(vodafoneInput))} className="bg-emerald-600 text-white p-1 rounded"><Check size={14} /></button></div>) : (<span className="font-bold text-emerald-700">{emp.vodafoneDeduction || 0} ج.م</span>)}</td><td className="p-4 text-center"><button onClick={() => {setEditingVodafoneId(emp.id); setVodafoneInput(String(emp.vodafoneDeduction || ''));}} className="text-emerald-400 hover:text-emerald-600 mx-2"><Edit2 size={16} /></button><button onClick={() => updateVodafoneDeduction(emp.id, 0)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>)}
      {showModal && (<div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"><div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scale-in border border-emerald-100"><div className="flex justify-between items-center mb-6"><h3 className={`text-xl font-bold ${activeTab === 'bank' ? 'text-blue-900' : 'text-emerald-900'}`}>{editingLoanId ? (activeTab === 'bank' ? 'تعديل قسط بنك' : 'تعديل سلفة') : (activeTab === 'bank' ? 'تسجيل قسط بنك' : 'تسجيل سلفة')}</h3><button onClick={closeModal} className="text-slate-400 hover:text-red-500"><X size={20} /></button></div><form onSubmit={handleSaveLoan} className="space-y-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">الموظف</label><select required disabled={!!editingLoanId} className="w-full border p-3 rounded-xl outline-none" value={newLoan.employeeId || ''} onChange={e => setNewLoan({...newLoan, employeeId: e.target.value})}><option value="">-- اختر الموظف --</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-700 mb-1">إجمالي المبلغ</label><input required type="number" className="w-full border p-3 rounded-xl outline-none" value={newLoan.totalAmount || ''} onChange={e => setNewLoan({...newLoan, totalAmount: Number(e.target.value)})} /></div><div><label className="block text-sm font-bold text-slate-700 mb-1">القسط الشهري</label><input required type="number" className="w-full border p-3 rounded-xl outline-none" value={newLoan.monthlyInstallment || ''} onChange={e => setNewLoan({...newLoan, monthlyInstallment: Number(e.target.value)})} /></div></div><div><label className="block text-sm font-bold text-slate-700 mb-1">تاريخ البدء</label><input required type="date" className="w-full border p-3 rounded-xl outline-none" value={newLoan.startDate || ''} onChange={e => setNewLoan({...newLoan, startDate: e.target.value})} /></div><div className={`p-4 rounded-xl text-xs border flex gap-2 ${activeTab === 'bank' ? 'bg-blue-50 text-blue-800 border-blue-100' : 'bg-amber-50 text-amber-800 border-amber-100'}`}><CalendarClock size={24} className={activeTab === 'bank' ? 'text-blue-600' : 'text-amber-600'} /><p>سيقوم النظام بحساب تاريخ الانتهاء والمتبقي آلياً وتطبيق الخصم في كشف المرتبات.</p></div><div className="flex gap-3 mt-8"><button type="submit" className={`flex-1 text-white py-3 rounded-xl font-bold shadow-lg ${activeTab === 'bank' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-emerald-700 hover:bg-emerald-800'}`}>حفظ</button><button type="button" onClick={closeModal} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold">إلغاء</button></div></form></div></div>)}
    </div>
  );
};
