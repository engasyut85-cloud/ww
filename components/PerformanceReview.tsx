
import React, { useState } from 'react';
import { Employee, PerformanceReview } from '../types';
import { Star, TrendingUp, Award, Plus } from 'lucide-react';

interface PerformanceReviewProps {
  employees: Employee[];
  reviews: PerformanceReview[];
  setReviews: (reviews: PerformanceReview[]) => void;
}

export const PerformanceReviewComp: React.FC<PerformanceReviewProps> = ({ employees, reviews, setReviews }) => {
  const [showModal, setShowModal] = useState(false);
  const [newReview, setNewReview] = useState<Partial<PerformanceReview>>({ score: 90, year: new Date().getFullYear() });

  const calculateRating = (score: number): any => {
      if (score >= 90) return 'Excellent';
      if (score >= 80) return 'Very Good';
      if (score >= 70) return 'Good';
      if (score >= 60) return 'Fair';
      return 'Poor';
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      const rating = calculateRating(newReview.score || 0);
      const review: PerformanceReview = {
          id: `REV${Date.now()}`,
          employeeId: newReview.employeeId!,
          year: newReview.year!,
          score: newReview.score!,
          rating: rating,
          notes: newReview.notes || '',
          suggestedRaise: newReview.suggestedRaise || 0,
          date: new Date().toISOString().split('T')[0]
      };
      setReviews([...reviews, review]);
      setShowModal(false);
      setNewReview({ score: 90, year: new Date().getFullYear() });
  };

  const getRatingBadge = (rating: string) => {
      const colors = {
          'Excellent': 'bg-emerald-100 text-emerald-700',
          'Very Good': 'bg-green-100 text-green-700',
          'Good': 'bg-blue-100 text-blue-700',
          'Fair': 'bg-amber-100 text-amber-700',
          'Poor': 'bg-red-100 text-red-700'
      };
      const labels = {
          'Excellent': 'ممتاز',
          'Very Good': 'جيد جداً',
          'Good': 'جيد',
          'Fair': 'متوسط',
          'Poor': 'ضعيف'
      };
      return <span className={`${colors[rating as keyof typeof colors]} px-2 py-1 rounded-lg text-xs font-bold`}>{labels[rating as keyof typeof labels]}</span>;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-emerald-900">تقييم الأداء السنوي</h2>
            <p className="text-emerald-600 mt-1">تقارير الكفاءة واقتراحات العلاوة الدورية</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-900 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-emerald-900/10">
            <Plus size={18} />
            إضافة تقييم جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(review => {
              const emp = employees.find(e => e.id === review.employeeId);
              return (
                  <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-3">
                              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center font-bold text-emerald-700 text-lg">
                                  {emp?.name.charAt(0)}
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800">{emp?.name}</h3>
                                  <p className="text-xs text-slate-500">تقييم عام {review.year}</p>
                              </div>
                          </div>
                          {getRatingBadge(review.rating)}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 bg-emerald-50 rounded-full h-3 overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${review.score}%` }}></div>
                          </div>
                          <span className="font-bold text-sm text-emerald-700">{review.score}%</span>
                      </div>

                      <p className="text-sm text-slate-600 bg-emerald-50/50 p-3 rounded-lg mb-4 italic">"{review.notes}"</p>

                      <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg justify-center border border-emerald-100">
                          <TrendingUp size={18} />
                          <span>علاوة مقترحة: {review.suggestedRaise}%</span>
                      </div>
                  </div>
              );
          })}
      </div>

      {showModal && (
          <div className="fixed inset-0 bg-emerald-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
               <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl animate-fade-in-up">
                   <h3 className="text-xl font-bold mb-4 text-emerald-900">نموذج تقييم أداء</h3>
                   <form onSubmit={handleSave} className="space-y-4">
                       <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">الموظف</label>
                            <select required className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewReview({...newReview, employeeId: e.target.value})}>
                                <option value="">-- اختر الموظف --</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">السنة</label>
                                <input type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" value={newReview.year} onChange={e => setNewReview({...newReview, year: Number(e.target.value)})} />
                           </div>
                           <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">الدرجة (من 100)</label>
                                <input type="number" max="100" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" value={newReview.score} onChange={e => setNewReview({...newReview, score: Number(e.target.value)})} />
                           </div>
                       </div>
                       <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">ملاحظات المدير</label>
                            <textarea className="w-full border p-2 rounded h-20 focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewReview({...newReview, notes: e.target.value})} />
                       </div>
                       <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">نسبة العلاوة المقترحة %</label>
                            <input type="number" step="0.5" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" onChange={e => setNewReview({...newReview, suggestedRaise: Number(e.target.value)})} />
                       </div>
                       <div className="flex gap-3 mt-4">
                            <button type="submit" className="flex-1 bg-emerald-900 text-white py-2 rounded-lg font-bold hover:bg-emerald-800">حفظ التقييم</button>
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50">إلغاء</button>
                       </div>
                   </form>
               </div>
          </div>
      )}
    </div>
  );
};