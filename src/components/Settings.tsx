
import React, { useState, useRef } from 'react';
import { Save, Upload, Download, RefreshCw, Plus, Trash2, Building, Key, Shield, FileSpreadsheet } from 'lucide-react';
import { User } from '../types';
import { exportToExcel, parseExcel } from '../utils/excelUtils';
import { calculateSalary } from '../utils/payrollLogic';

interface SettingsProps {
  departments: string[];
  setDepartments: (depts: string[]) => void;
  getAllData: () => any;
  restoreData: (data: any) => void;
  resetSystem: () => void;
  currentUser: User;
  updateUserPassword: (password: string) => void;
  
  // Setters for Import
  setEmployees: (data: any[]) => void;
  setAttendance: (data: any[]) => void;
  setLeaves: (data: any[]) => void;
  setLoans: (data: any[]) => void;
  setReviews: (data: any[]) => void;
  setBonuses: (data: any[]) => void;
  setTaxDebts: (data: any[]) => void;
  setExternalWorkers: (data: any[]) => void;
  setPenalties: (data: Record<string, number>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
    departments, setDepartments, getAllData, restoreData, resetSystem, currentUser, updateUserPassword,
    setEmployees, setAttendance, setLeaves, setLoans, setReviews, setBonuses, setTaxDebts, setExternalWorkers, setPenalties
}) => {
  const [newDept, setNewDept] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Import Refs
  const importRefs: Record<string, React.RefObject<HTMLInputElement>> = {
      employees: useRef(null),
      attendance: useRef(null),
      leaves: useRef(null),
      loans: useRef(null),
      bonuses: useRef(null),
      tax_settlement: useRef(null),
      external_workers: useRef(null),
      reviews: useRef(null),
      payroll: useRef(null)
  };

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

  // Backup & Restore (JSON)
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

  // Excel Exports (XLSX)
  const handleExportExcel = (type: string) => {
      const allData = getAllData();
      const date = new Date().toISOString().split('T')[0];
      
      switch(type) {
          case 'employees':
              exportToExcel(allData.employees, `Employees_${date}`);
              break;
          case 'attendance':
              exportToExcel(allData.attendance, `Attendance_${date}`);
              break;
          case 'leaves':
              exportToExcel(allData.leaves, `Leaves_Missions_${date}`);
              break;
          case 'loans':
              exportToExcel(allData.loans, `Loans_${date}`);
              break;
          case 'reviews':
              exportToExcel(allData.reviews, `Performance_${date}`);
              break;
          case 'payroll':
              // Calculate current month payroll for all employees
              const payrollData = allData.employees.map((emp: any) => {
                  return calculateSalary(
                      emp,
                      allData.loans,
                      allData.reviews,
                      allData.bonuses,
                      0, // Incentives in calculator are transient, so 0 for static export
                      allData.penalties[emp.id] || 0,
                      0,
                      allData.taxDebts
                  );
              });
              exportToExcel(payrollData, `Payroll_Calculated_${date}`);
              break;
          case 'tax_settlement':
              exportToExcel(allData.taxDebts, `Tax_Settlements_${date}`);
              break;
          case 'external_workers':
              exportToExcel(allData.externalWorkers, `External_Workers_${date}`);
              break;
          case 'bonuses':
              exportToExcel(allData.bonuses, `Bonuses_Grants_${date}`);
              break;
      }
  };

  // Excel Imports
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const parsedData = await parseExcel(file);
              if (parsedData && parsedData.length > 0) {
                  const confirmMsg = `تم قراءة ${parsedData.length} سجل من الملف.\nسيتم استبدال البيانات الحالية لهذه الفئة.\nهل أنت متأكد؟`;
                  if (confirm(confirmMsg)) {
                      switch (type) {
                          case 'employees':
                              // Special handling for Employee types (nested allowances often handled by parseExcel but double check booleans)
                              const formattedEmps = parsedData.map((d: any) => ({
                                  ...d,
                                  hasExperience: d.hasExperience === true || d.hasExperience === 'true',
                                  isSpecialNeeds: d.isSpecialNeeds === true || d.isSpecialNeeds === 'true'
                              }));
                              setEmployees(formattedEmps);
                              break;
                          case 'attendance':
                              setAttendance(parsedData);
                              break;
                          case 'leaves':
                              setLeaves(parsedData);
                              break;
                          case 'loans':
                              setLoans(parsedData);
                              break;
                          case 'reviews':
                              setReviews(parsedData);
                              break;
                          case 'bonuses':
                              setBonuses(parsedData);
                              break;
                          case 'tax_settlement':
                              setTaxDebts(parsedData);
                              break;
                          case 'external_workers':
                              setExternalWorkers(parsedData);
                              break;
                          case 'payroll':
                              const importedPenalties: Record<string, number> = {};
                              parsedData.forEach((row: any) => {
                                  if (row.employeeId && row.penalties) {
                                      importedPenalties[row.employeeId] = Number(row.penalties);
                                  }
                              });
                              // This will replace penalties for the found IDs
                              setPenalties(importedPenalties);
                              break;
                      }
                      alert('تم الاستيراد بنجاح!');
                  }
              } else {
                  alert('الملف فارغ أو لا يحتوي على بيانات صالحة.');
              }
          } catch (error) {
              console.error(error);
              alert('خطأ في قراءة ملف Excel. تأكد من الصيغة.');
          }
          // Reset Input
          if (e.target) e.target.value = '';
      }
  };

  const handleReset = () => {
      const confirmText = prompt('تحذير: هذا الإجراء سيقوم بمسح جميع البيانات والعودة لضبط المصنع. للتأكيد اكتب "حذف"');
      if (confirmText === 'حذف') {
          resetSystem();
          alert('تم إعادة ضبط النظام بنجاح.');
      }
  };

  const DataControlRow = ({ label, type, exportType }: { label: string, type: string, exportType?: string }) => (
      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
          <span className="font-bold text-slate-700 text-sm">{label}</span>
          <div className="flex gap-2">
              <input 
                  type="file" 
                  ref={importRefs[type]} 
                  accept=".xlsx, .xls" 
                  onChange={(e) => handleImportExcel(e, type)} 
                  className="hidden" 
              />
              <button 
                  onClick={() => importRefs[type].current?.click()}
                  className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100 border border-amber-200"
                  title="استيراد من Excel"
              >
                  <Upload size={14} /> استيراد
              </button>
              <button 
                  onClick={() => handleExportExcel(exportType || type)} 
                  className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 border border-emerald-200"
                  title="تصدير إلى Excel"
              >
                  <Download size={14} /> تصدير
              </button>
          </div>
      </div>
  );

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* JSON Backup */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
                <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <Save size={24} className="text-blue-600" />
                    النسخ الاحتياطي للنظام (JSON)
                </h3>
                <p className="text-sm text-slate-500 mb-4">هذه النسخة تحتوي على كل تفاصيل النظام ويمكن استخدامها لاستعادة الحالة بالكامل.</p>
                <div className="flex gap-4">
                    <button onClick={handleDownloadBackup} className="flex-1 bg-blue-50 text-blue-700 py-3 rounded-lg font-bold text-sm hover:bg-blue-100 flex items-center justify-center gap-2">
                        <Download size={18} /> تحميل نسخة
                    </button>
                    <input type="file" ref={fileInputRef} accept=".json" onChange={handleUploadBackup} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-amber-50 text-amber-700 py-3 rounded-lg font-bold text-sm hover:bg-amber-100 flex items-center justify-center gap-2">
                        <Upload size={18} /> استعادة نسخة
                    </button>
                </div>
            </div>

            {/* Excel Import/Export */}
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
                <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <FileSpreadsheet size={24} className="text-green-600" />
                    بيانات Excel (تصدير / استيراد)
                </h3>
                <p className="text-sm text-slate-500 mb-4">التحكم في البيانات عبر ملفات Excel (XLSX).</p>
                <div className="grid grid-cols-1 gap-3">
                    <DataControlRow label="بيانات الموظفين" type="employees" />
                    <DataControlRow label="سجل الحضور" type="attendance" />
                    <DataControlRow label="الإجازات والمأموريات" type="leaves" />
                    <DataControlRow label="السلف" type="loans" />
                    <DataControlRow label="المكافآت والمنح" type="bonuses" />
                    <DataControlRow label="التسوية الضريبية" type="tax_settlement" />
                    <DataControlRow label="عميل من الخارج" type="external_workers" />
                    <DataControlRow label="المرتبات والأجور (الخصومات والجزاءات)" type="payroll" />
                </div>
            </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6">
            <h3 className="text-xl font-bold text-red-800 mb-2 flex items-center gap-2">
                <RefreshCw size={24} />
                منطقة الخطر
            </h3>
            <div className="flex justify-between items-center">
                <p className="text-sm text-red-600">مسح جميع البيانات والعودة للإعدادات الافتراضية.</p>
                <button onClick={handleReset} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700">تهيئة النظام</button>
            </div>
        </div>
    </div>
  );
};
