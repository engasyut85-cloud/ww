
import React, { useState, useRef } from 'react';
import { Save, Upload, Download, RefreshCw, Plus, Trash2, Building, Key, Shield } from 'lucide-react';
import { User } from '../types';

interface SettingsProps {
  departments: string[];
  setDepartments: (depts: string[]) => void;
  getAllData: () => any;
  restoreData: (data: any) => void;
  resetSystem: () => void;
  currentUser: User;
  updateUserPassword: (password: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ departments, setDepartments, getAllData, restoreData, resetSystem, currentUser, updateUserPassword }) => {
  const [newDept, setNewDept] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Department Management
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDept && !departments.includes(newDept)) {
        setDepartments([...departments, newDept]);
        setNewDept('');
    }
  };

  const handleDeleteDept = (dept: string) => {
      if (confirm(`هل أنت متأكد من حذف قسم "${dept}"؟`)) {
          setDepartments(departments.filter(d => d !== dept));
      }
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPass.length < 3) {
          alert('كلمة المرور قصيرة جداً');
          return;
      }
      if (newPass !== confirmPass) {
          alert('كلمتا المرور غير متطابقتين');
          return;
      }
      updateUserPassword(newPass);
      alert('تم تغيير كلمة المرور بنجاح');
      setNewPass('');
      setConfirmPass('');
  };

  // Backup & Restore
  const handleDownloadBackup = () => {
    const data = getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HR_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                restoreData(data);
                alert('تم استعادة البيانات بنجاح!');
            } catch (error) {
                alert('ملف غير صالح. يرجى التأكد من اختيار ملف النسخة الاحتياطية الصحيح.');
            }
        };
        reader.readAsText(file);
    }
  };

  const handleReset = () => {
      const confirmText = prompt('تحذير: هذا الإجراء سيقوم بمسح جميع البيانات والعودة لضبط المصنع. للتأكيد اكتب "حذف"');
      if (confirmText === 'حذف') {
          resetSystem();
          alert('تم إعادة ضبط النظام بنجاح.');
      }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
        <header className="mb-6">
            <h2 className="text-3xl font-bold text-emerald-900">الإعدادات</h2>
            <p className="text-emerald-600 mt-1">إدارة الأقسام، الحساب، النسخ الاحتياطي، وأمان النظام</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
                <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <Shield size={24} className="text-emerald-600" />
                    إعدادات الحساب
                </h3>
                <div className="mb-4 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-800">
                    <p>أنت مسجل الدخول باسم: <strong>{currentUser.name}</strong> ({currentUser.username})</p>
                    <p>الصلاحية: {currentUser.role === 'admin' ? 'مدير نظام' : 'محرر'}</p>
                </div>
                
                <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">كلمة المرور الجديدة</label>
                        <input 
                            type="password" 
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            className="w-full border border-emerald-200 p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">تأكيد كلمة المرور</label>
                        <input 
                            type="password" 
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            className="w-full border border-emerald-200 p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none"
                        />
                    </div>
                    <button type="submit" disabled={!newPass} className="w-full bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700 flex items-center justify-center gap-2">
                        <Key size={16} />
                        تغيير كلمة المرور
                    </button>
                </form>
            </div>

            {/* Departments Management */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
                <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <Building size={24} className="text-emerald-600" />
                    إدارة الأقسام والإدارات
                </h3>
                <p className="text-sm text-slate-500 mb-6">قم بإضافة أو حذف الأقسام التي تظهر في قائمة الموظفين.</p>

                <form onSubmit={handleAddDept} className="flex gap-4 mb-6">
                    <input 
                        type="text" 
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        placeholder="اسم الإدارة الجديدة..." 
                        className="flex-1 border border-emerald-200 p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                    <button type="submit" disabled={!newDept} className="bg-emerald-600 text-white px-4 py-2 rounded font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                        <Plus size={20} />
                        إضافة
                    </button>
                </form>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {departments.map((dept, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 text-sm">
                            <span className="font-medium text-emerald-800">{dept}</span>
                            <button onClick={() => handleDeleteDept(dept)} className="text-emerald-300 hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
            <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Save size={24} className="text-blue-600" />
                النسخ الاحتياطي واستعادة البيانات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Backup */}
                <div className="border border-emerald-100 rounded-xl p-5 text-center hover:bg-emerald-50 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Download size={24} />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">تحميل نسخة احتياطية</h4>
                    <p className="text-xs text-slate-500 mb-4">حفظ جميع بيانات الموظفين والحسابات في ملف على جهازك.</p>
                    <button onClick={handleDownloadBackup} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700">تحميل الآن</button>
                </div>

                {/* Restore */}
                <div className="border border-emerald-100 rounded-xl p-5 text-center hover:bg-emerald-50 transition-colors">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload size={24} />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">استعادة البيانات</h4>
                    <p className="text-xs text-slate-500 mb-4">رفع ملف نسخة احتياطية لاسترجاع البيانات السابقة.</p>
                    <input type="file" ref={fileInputRef} accept=".json" onChange={handleUploadBackup} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full bg-amber-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-amber-600">رفع ملف</button>
                </div>

                {/* Reset */}
                <div className="border border-red-100 rounded-xl p-5 text-center hover:bg-red-50 transition-colors">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <RefreshCw size={24} />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">ضبط المصنع</h4>
                    <p className="text-xs text-slate-500 mb-4">مسح جميع البيانات والعودة للإعدادات الافتراضية.</p>
                    <button onClick={handleReset} className="w-full bg-red-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-700">تهيئة النظام</button>
                </div>
            </div>
        </div>
    </div>
  );
};
