
import React, { useState } from 'react';
import { Employee, Loan } from '../types';
import { Wallet, Plus, AlertCircle, Trash2 } from 'lucide-react';

interface LoanManagerProps {
  employees: Employee[];
  loans: Loan[];
  setLoans: (loans: Loan[]) => void;
}

export const LoanManager: React.FC<LoanManagerProps> = ({ employees, loans, setLoans }) => {
  const [showModal, setShowModal] = useState(false);
  const [newLoan, setNewLoan] = useState<Partial<Loan>>({});

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.totalAmount || !newLoan.monthlyInstallment) return;
    
    const loan: Loan = {
        id: `LN${Date.now()}`,
        employeeId: newLoan.employeeId!,
        totalAmount: Number(newLoan.totalAmount),
        remainingAmount: Number(newLoan.totalAmount),
        monthlyInstallment: Number(newLoan.monthlyInstallment),
        startDate: newLoan.startDate || new Date().toISOString().split('T')[0],
        status: 'active'
    };
    setLoans([...loans, loan]);
    setShowModal(false);
    setNewLoan({});
  };

  const deleteLoan = (id: string) => {
      if(confirm('هل أنت متأكد من إلغاء هذه السلفة؟')) {
          setLoans(loans.filter(l => l.id !== id));
      }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-emerald-900">السلف والقروض</h2>
            <p className="text-emerald-600 mt-1">إدارة السلف المالية وخصم الأقساط تلقائياً من الراتب</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-emerald-900/10">
            <Plus size={18} />
            تسجيل سلفة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map(loan => {
              const emp = employees.find(e => e.id === loan.employeeId);
              const progress = ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100;
              
              return (
                  <div key={loan.id} className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-50">
                          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="font-bold text-emerald-900 text-lg">{emp?.name}</h3>
                              <p className="text-sm text-emerald-500 font-mono">{loan.startDate}</p>
                          </div>
                          <button onClick={() => deleteLoan(loan.id)} className="text-emerald-200 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>

                      <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                              <span className="text-slate-500">قيمة السلفة</span>
                              <span className="font-bold font-mono text-slate-800">{loan.totalAmount.toLocaleString()} ج.م</span>
                          </div>
                          <div className="flex justify-between text-sm">
                              <span className="text-slate-500">القسط الشهري</span>
                              <span className="font-bold text-emerald-600 font-mono">{loan.monthlyInstallment.toLocaleString()} ج.م</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-emerald-50">
                              <span className="text-slate-500">المتبقي</span>
                              <span className="font-bold text-red-500 font-mono">{loan.remainingAmount.toLocaleString()} ج.م</span>
                          </div>
                      </div>

                      {loan.remainingAmount <= 0 && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold text-sm border border-emerald-200">تم السداد بالكامل</span>
                          </div>
                      )}
                  </div>
              );
          })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-emerald-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
                <h3 className="text-xl font-bold mb-4 text-emerald-900">تسجيل سلفة مالية</h3>
                <form onSubmit={handleAddLoan} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">الموظف</label>
                        <select required className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewLoan({...newLoan, employeeId: e.target.value})}>
                            <option value="">-- اختر الموظف --</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ الإجمالي</label>
                             <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewLoan({...newLoan, totalAmount: Number(e.target.value)})} />
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">القسط الشهري</label>
                             <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewLoan({...newLoan, monthlyInstallment: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-slate-700 mb-1">تاريخ البدء</label>
                         <input required type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewLoan({...newLoan, startDate: e.target.value})} />
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded text-xs text-amber-800 flex gap-2">
                        <AlertCircle size={16} className="flex-shrink-0" />
                        سيتم خصم القسط تلقائياً من راتب الموظف كل شهر حتى انتهاء المبلغ.
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button type="submit" className="flex-1 bg-emerald-900 text-white py-2 rounded-lg font-bold hover:bg-emerald-800">حفظ</button>
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-emerald-50">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};