
import React, { useState } from 'react';
import { User, Page } from '../types';
import { Users, Plus, Edit, Trash2, Key, CheckSquare, Square } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser: User;
}

// Arabic mapping for pages
const PAGE_LABELS: Record<Page, string> = {
    [Page.DASHBOARD]: 'لوحة التحكم',
    [Page.EMPLOYEES]: 'سجل الموظفين',
    [Page.STATUS_STATEMENT]: 'بيان حالة',
    [Page.ATTENDANCE]: 'الحضور والانصراف',
    [Page.LEAVES]: 'الإجازات والمأموريات',
    [Page.LOANS]: 'السلف والقروض',
    [Page.BONUSES]: 'المكافآت والمنح',
    [Page.EXTERNAL_WORKERS]: 'عمالة خارجية',
    [Page.PAYROLL]: 'المرتبات والأجور',
    [Page.TAX_SETTLEMENT]: 'التسوية الضريبية',
    [Page.PERFORMANCE]: 'تقييم الأداء',
    [Page.REPORTS]: 'مركز التقارير',
    [Page.USERS]: 'إدارة المستخدمين',
    [Page.SETTINGS]: 'الإعدادات',
    [Page.AI_ADVISOR]: 'المستشار القانوني'
};

export const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({ role: 'editor', permissions: [] });

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.username || !formData.name || (!formData.id && !formData.password)) {
          alert('يرجى ملء البيانات المطلوبة');
          return;
      }

      // If admin, they get all permissions implicitly (or explicit all)
      const permissions = formData.role === 'admin' ? Object.values(Page) : (formData.permissions || []);

      if (formData.id) {
          // Edit
          const updatedUsers = users.map(u => 
              u.id === formData.id ? { 
                  ...u, 
                  name: formData.name!, 
                  username: formData.username!, 
                  role: formData.role!, 
                  permissions,
                  ...(formData.password ? { password: formData.password } : {}) 
              } as User : u
          );
          setUsers(updatedUsers);
      } else {
          // Add
          const newUser: User = {
              id: `USR-${Date.now()}`,
              username: formData.username!,
              password: formData.password!,
              name: formData.name!,
              role: formData.role || 'editor',
              permissions
          };
          setUsers([...users, newUser]);
      }
      setShowModal(false);
      setFormData({ role: 'editor', permissions: [] });
  };

  const handleEdit = (user: User) => {
      setFormData({ ...user, password: '' }); // Don't show password
      setShowModal(true);
  };

  const handleDelete = (id: string) => {
      if (id === currentUser.id) {
          alert('لا يمكن حذف المستخدم الحالي');
          return;
      }
      if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
          setUsers(users.filter(u => u.id !== id));
      }
  };

  const togglePermission = (page: Page) => {
      const currentPerms = formData.permissions || [];
      if (currentPerms.includes(page)) {
          setFormData({ ...formData, permissions: currentPerms.filter(p => p !== page) });
      } else {
          setFormData({ ...formData, permissions: [...currentPerms, page] });
      }
  };

  const toggleAllPermissions = () => {
      const allPages = Object.values(Page).filter(p => p !== Page.USERS && p !== Page.SETTINGS); // Exclude admin pages from "Select All" helper
      const currentPerms = formData.permissions || [];
      if (currentPerms.length >= allPages.length) {
          setFormData({ ...formData, permissions: [] });
      } else {
          setFormData({ ...formData, permissions: allPages });
      }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-emerald-900">إدارة المستخدمين</h2>
            <p className="text-emerald-600 mt-1">إضافة وحذف مستخدمي النظام وتحديد الصلاحيات</p>
        </div>
        <button onClick={() => { setFormData({ role: 'editor', permissions: [] }); setShowModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-emerald-900/10">
            <Plus size={18} />
            مستخدم جديد
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
          <table className="w-full text-right">
              <thead className="bg-emerald-50 border-b border-emerald-100">
                  <tr>
                      <th className="p-4 text-emerald-800">الاسم</th>
                      <th className="p-4 text-emerald-800">اسم المستخدم</th>
                      <th className="p-4 text-emerald-800">الصلاحية</th>
                      <th className="p-4 text-emerald-800">الصفحات المسموحة</th>
                      <th className="p-4 text-emerald-800">إجراءات</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                  {users.map(user => (
                      <tr key={user.id} className="hover:bg-emerald-50/50">
                          <td className="p-4 font-bold text-slate-800">{user.name}</td>
                          <td className="p-4 font-mono text-slate-600">{user.username}</td>
                          <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {user.role === 'admin' ? 'مدير نظام' : 'محرر بيانات'}
                              </span>
                          </td>
                          <td className="p-4">
                              {user.role === 'admin' ? (
                                  <span className="text-xs text-purple-600 font-bold">كل الصلاحيات</span>
                              ) : (
                                  <div className="flex flex-wrap gap-1">
                                      {user.permissions && user.permissions.length > 0 ? (
                                          user.permissions.slice(0, 3).map(p => (
                                              <span key={p} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{PAGE_LABELS[p]}</span>
                                          ))
                                      ) : (
                                          <span className="text-xs text-red-400">لا توجد صلاحيات</span>
                                      )}
                                      {user.permissions && user.permissions.length > 3 && (
                                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">+{user.permissions.length - 3}</span>
                                      )}
                                  </div>
                              )}
                          </td>
                          <td className="p-4 flex gap-2">
                              <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="تعديل"><Edit size={16} /></button>
                              {user.id !== currentUser.id && (
                                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="حذف"><Trash2 size={16} /></button>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {showModal && (
          <div className="fixed inset-0 bg-emerald-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4 text-emerald-900">{formData.id ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h3>
                  <form onSubmit={handleSave} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">الاسم الكامل</label>
                              <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">اسم المستخدم</label>
                              <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">
                                  كلمة المرور {formData.id && <span className="text-xs font-normal text-slate-400">(اتركها فارغة للتجاهل)</span>}
                              </label>
                              <input type={formData.id ? "text" : "password"} required={!formData.id} className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1">الصلاحية</label>
                              <select className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                                  <option value="editor">محرر بيانات (صلاحيات محددة)</option>
                                  <option value="admin">مدير نظام (كامل الصلاحيات)</option>
                              </select>
                          </div>
                      </div>

                      {/* Permissions Selection for Editors */}
                      {formData.role === 'editor' && (
                          <div className="border-t border-slate-200 pt-4 mt-4">
                              <div className="flex justify-between items-center mb-3">
                                  <label className="block text-sm font-bold text-emerald-800">تحديد الصفحات المسموحة</label>
                                  <button type="button" onClick={toggleAllPermissions} className="text-xs text-blue-600 font-bold hover:underline">تحديد / إلغاء الكل</button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {Object.values(Page).filter(p => p !== Page.USERS && p !== Page.SETTINGS).map(page => (
                                      <div 
                                        key={page} 
                                        onClick={() => togglePermission(page)}
                                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${formData.permissions?.includes(page) ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                      >
                                          {formData.permissions?.includes(page) ? <CheckSquare size={18} className="text-emerald-600" /> : <Square size={18} className="text-slate-300" />}
                                          <span className="text-sm select-none">{PAGE_LABELS[page]}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      <div className="flex gap-3 mt-6 border-t pt-4">
                          <button type="submit" className="flex-1 bg-emerald-900 text-white py-2 rounded-lg font-bold hover:bg-emerald-800">حفظ</button>
                          <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50">إلغاء</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};