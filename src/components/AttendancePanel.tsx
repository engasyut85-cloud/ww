
import React, { useState } from 'react';
import { Employee, AttendanceRecord } from '../types';
import { Clock, CheckCircle, XCircle, CalendarCheck, UserCheck, Edit, Save, X, Printer, FileText } from 'lucide-react';

interface AttendancePanelProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  setAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendancePanel: React.FC<AttendancePanelProps> = ({ employees, attendance, setAttendance }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State for manual editing
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [manualIn, setManualIn] = useState('');
  const [manualOut, setManualOut] = useState('');

  // Helper to format time to 12h format for display
  const formatTime = (isoString: string | null) => {
      if (!isoString) return '--:--';
      return new Date(isoString).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to extract HH:mm for input type="time"
  const getTimeFromIso = (isoString: string | null) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toTimeString().slice(0, 5); // Returns HH:mm
  };

  // Helper to combine Date + Time Input -> ISO String
  const combineDateAndTime = (dateStr: string, timeStr: string) => {
      if (!timeStr) return null;
      return new Date(`${dateStr}T${timeStr}`).toISOString();
  };

  const handleCheckIn = (empId: string) => {
      const existingRecord = attendance.find(r => r.employeeId === empId && r.date === date);
      if (existingRecord) { alert('تم تسجيل حضور هذا الموظف مسبقاً اليوم'); return; }

      const newRecord: AttendanceRecord = {
          id: `ATT-${Date.now()}`,
          employeeId: empId,
          date: date,
          checkIn: new Date().toISOString(),
          checkOut: null,
          status: 'present',
          overtimeHours: 0
      };
      setAttendance([...attendance, newRecord]);
  };

  const handleCheckOut = (empId: string) => {
      const existingRecord = attendance.find(r => r.employeeId === empId && r.date === date);
      if (!existingRecord) { alert('يجب تسجيل الدخول أولاً'); return; }
      if (existingRecord.checkOut) { alert('تم تسجيل الانصراف مسبقاً'); return; }

      updateRecord(existingRecord, existingRecord.checkIn!, new Date().toISOString());
  };

  const updateRecord = (record: AttendanceRecord, checkInIso: string, checkOutIso: string | null) => {
      let overtime = 0;
      if (checkInIso && checkOutIso) {
          const start = new Date(checkInIso).getTime();
          const end = new Date(checkOutIso).getTime();
          const hoursWorked = (end - start) / (1000 * 60 * 60);
          overtime = Math.max(0, hoursWorked - 8);
      }

      const updated = attendance.map(r => r.id === record.id ? { 
          ...r, 
          checkIn: checkInIso, 
          checkOut: checkOutIso, 
          overtimeHours: parseFloat(overtime.toFixed(2)),
          status: (checkInIso ? 'present' : 'absent') as AttendanceRecord['status']
      } : r);
      setAttendance(updated);
  };

  // Manual Edit Handlers
  const openEditModal = (empId: string) => {
      const record = attendance.find(r => r.employeeId === empId && r.date === date);
      setEditingEmpId(empId);
      setManualIn(record ? getTimeFromIso(record.checkIn) : '');
      setManualOut(record ? getTimeFromIso(record.checkOut) : '');
  };

  const saveManualEdit = () => {
      if (!editingEmpId) return;
      
      const inIso = manualIn ? combineDateAndTime(date, manualIn) : null;
      const outIso = manualOut ? combineDateAndTime(date, manualOut) : null;

      if (!inIso && !outIso) {
          setAttendance(attendance.filter(r => !(r.employeeId === editingEmpId && r.date === date)));
          setEditingEmpId(null);
          return;
      }

      if (!inIso) {
          alert('يجب تحديد وقت الدخول');
          return;
      }

      const existingRecord = attendance.find(r => r.employeeId === editingEmpId && r.date === date);
      
      if (existingRecord) {
          updateRecord(existingRecord, inIso, outIso);
      } else {
          const newRecord: AttendanceRecord = {
            id: `ATT-${Date.now()}`,
            employeeId: editingEmpId,
            date: date,
            checkIn: inIso,
            checkOut: outIso,
            status: 'present',
            overtimeHours: 0
        };
        if (outIso) {
            const start = new Date(inIso).getTime();
            const end = new Date(outIso).getTime();
            const hoursWorked = (end - start) / (1000 * 60 * 60);
            newRecord.overtimeHours = Math.max(0, parseFloat((hoursWorked - 8).toFixed(2)));
        }
        setAttendance([...attendance, newRecord]);
      }
      setEditingEmpId(null);
  };

  // Printing Function - Monthly
  const printAttendanceReport = () => {
      const selectedMonth = date.substring(0, 7); // YYYY-MM
      const filteredRecords = attendance.filter(r => r.date.startsWith(selectedMonth));
      
      // Sort by date then by employee name
      filteredRecords.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          const empA = employees.find(e => e.id === a.employeeId)?.name || '';
          const empB = employees.find(e => e.id === b.employeeId)?.name || '';
          return empA.localeCompare(empB);
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const rows = filteredRecords.map((r, idx) => {
          const emp = employees.find(e => e.id === r.employeeId);
          return `
            <tr>
                <td>${idx + 1}</td>
                <td>${r.date}</td>
                <td style="text-align: right;">${emp?.name}</td>
                <td>${emp?.department}</td>
                <td style="font-family: monospace;">${formatTime(r.checkIn)}</td>
                <td style="font-family: monospace;">${formatTime(r.checkOut)}</td>
                <td style="font-weight: bold; color: ${r.overtimeHours > 0 ? '#b45309' : 'inherit'};">${r.overtimeHours}</td>
                <td>${r.status === 'present' ? 'حضور' : 'غائب'}</td>
            </tr>
          `;
      }).join('');

      const totalOvertime = filteredRecords.reduce((sum, r) => sum + r.overtimeHours, 0);

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>تقرير الحضور والانصراف - ${selectedMonth}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; padding: 20px; }
                .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 20px; }
                .header-text { text-align: center; flex: 1; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: center; }
                th { background: #ecfdf5; color: #065f46; font-weight: bold; }
                .summary { margin-top: 20px; padding: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 5px; font-weight: bold; }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">🖨️ طباعة التقرير</button>
            
            <div class="header-container">
                <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 120px;" /></div>
                <div class="header-text">
                    <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                    <h3>سجل الحضور والانصراف (شهري)</h3>
                    <p>عن شهر: ${selectedMonth}</p>
                </div>
                <div style="width: 120px;"></div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th width="5%">م</th>
                        <th width="12%">التاريخ</th>
                        <th width="20%">الموظف</th>
                        <th width="15%">القسم</th>
                        <th width="12%">وقت الدخول</th>
                        <th width="12%">وقت الخروج</th>
                        <th width="12%">ساعات إضافي</th>
                        <th width="12%">الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>

            <div class="summary">
                إجمالي الساعات الإضافية المحتسبة خلال الشهر: ${totalOvertime.toFixed(2)} ساعة
            </div>
            
            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 14px;">
                <div>الموارد البشرية</div>
                <div>المدير العام</div>
            </div>
        </body>
        </html>
      `;

      printWindow.document.write(content);
      printWindow.document.close();
  };

  // Printing Function - Daily (Shows Absences)
  const printDailyReport = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const rows = employees.map((emp, idx) => {
          const record = attendance.find(r => r.employeeId === emp.id && r.date === date);
          const isPresent = !!record && !!record.checkIn;
          
          return `
            <tr>
                <td>${idx + 1}</td>
                <td style="text-align: right;">${emp.name}</td>
                <td>${emp.department}</td>
                <td style="font-family: monospace;">${isPresent ? formatTime(record.checkIn) : '-'}</td>
                <td style="font-family: monospace;">${isPresent ? formatTime(record.checkOut) : '-'}</td>
                <td style="font-weight: bold;">${isPresent ? record.overtimeHours : '-'}</td>
                <td style="font-weight: bold; color: ${isPresent ? '#059669' : '#dc2626'}; background-color: ${isPresent ? '#ecfdf5' : '#fef2f2'};">
                    ${isPresent ? 'حضور' : 'غياب'}
                </td>
            </tr>
          `;
      }).join('');

      const content = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <title>تقرير الغياب والحضور اليومي - ${date}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: 'Cairo', sans-serif; padding: 20px; }
                .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 20px; }
                .header-text { text-align: center; flex: 1; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: center; }
                th { background: #f1f5f9; color: #1e293b; font-weight: bold; }
            </style>
        </head>
        <body>
            <button onclick="window.print()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">🖨️ طباعة التقرير</button>
            
            <div class="header-container">
                <div><img src="/logo.png" onerror="this.onerror=null; this.src='/logo.svg';" alt="logo" style="height: 120px;" /></div>
                <div class="header-text">
                    <h2>نقابة المهندسين - النقابة الفرعية بأسيوط</h2>
                    <h3>تقرير الغياب والحضور اليومي الشامل</h3>
                    <p>عن يوم: ${date}</p>
                </div>
                <div style="width: 120px;"></div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th width="5%">م</th>
                        <th width="25%">الموظف</th>
                        <th width="20%">القسم</th>
                        <th width="10%">وقت الدخول</th>
                        <th width="10%">وقت الخروج</th>
                        <th width="10%">إضافي</th>
                        <th width="10%">الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
            
            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 14px;">
                <div>الموارد البشرية</div>
                <div>المدير العام</div>
            </div>
        </body>
        </html>
      `;

      printWindow.document.write(content);
      printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
         <div>
            <h2 className="text-3xl font-bold text-emerald-900">سجل الحضور والانصراف</h2>
            <p className="text-emerald-600 mt-1">متابعة دوام الموظفين وحساب ساعات العمل الفعلي</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-emerald-200 shadow-sm">
                <Clock size={20} className="text-emerald-400" />
                <span className="font-bold text-slate-700 ml-2">التاريخ:</span>
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="outline-none text-emerald-800 font-mono font-bold bg-transparent"
                />
            </div>
            
            <button 
                onClick={printDailyReport}
                className="flex items-center gap-2 bg-white text-emerald-800 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm font-bold"
                title="طباعة تقرير شامل لليوم يوضح الغياب والحضور"
            >
                <FileText size={20} />
                تقرير يومي (غياب/حضور)
            </button>

            <button 
                onClick={printAttendanceReport}
                className="flex items-center gap-2 bg-emerald-800 text-white px-4 py-2 rounded-lg hover:bg-emerald-900 transition-colors shadow-sm font-bold"
                title="طباعة سجل الحركات للشهر المحدد"
            >
                <Printer size={20} />
                سجل شهري
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => {
            const record = attendance.find(r => r.employeeId === emp.id && r.date === date);
            const isCheckedIn = !!record?.checkIn;
            const isCheckedOut = !!record?.checkOut;

            return (
                <div key={emp.id} className={`rounded-xl shadow-sm border p-6 flex flex-col gap-4 transition-all ${
                    isCheckedIn ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                }`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-emerald-900">{emp.name}</h3>
                            <p className="text-sm text-slate-500">{emp.position}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                isCheckedIn ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-400'
                            }`}>
                                {emp.name.charAt(0)}
                            </div>
                            <button 
                                onClick={() => openEditModal(emp.id)}
                                className="text-slate-400 hover:text-emerald-600 transition-colors"
                                title="تعديل يدوي"
                            >
                                <Edit size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold">
                        {isCheckedOut ? (
                            <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-full flex items-center gap-1">
                                <UserCheck size={12} /> انصراف
                            </span>
                        ) : isCheckedIn ? (
                            <span className="bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                <CalendarCheck size={12} /> متواجد حالياً
                            </span>
                        ) : (
                            <span className="bg-slate-100 text-slate-400 px-2 py-1 rounded-full">لم يسجل دخول</span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <button 
                            onClick={() => handleCheckIn(emp.id)}
                            disabled={isCheckedIn}
                            className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                                isCheckedIn 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200'
                            }`}
                        >
                            <CheckCircle size={16} />
                            دخول
                        </button>
                        <button 
                             onClick={() => handleCheckOut(emp.id)}
                             disabled={!isCheckedIn || isCheckedOut}
                            className={`py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                                !isCheckedIn || isCheckedOut
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200'
                            }`}
                        >
                            <XCircle size={16} />
                            انصراف
                        </button>
                    </div>
                    
                    <div className="bg-white/60 rounded-lg p-3 text-xs border border-emerald-100 mt-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-500">وقت الدخول:</span>
                            <span className="font-mono font-bold text-emerald-700 text-sm">
                                {formatTime(record?.checkIn || null)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">وقت الخروج:</span>
                            <span className="font-mono font-bold text-red-600 text-sm">
                                {formatTime(record?.checkOut || null)}
                            </span>
                        </div>
                        {record?.overtimeHours ? (
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-emerald-200">
                                <span className="text-slate-500">ساعات إضافي:</span>
                                <span className="font-mono font-bold text-amber-600">
                                    {record.overtimeHours} س
                                </span>
                            </div>
                        ) : null}
                    </div>
                </div>
            );
        })}
      </div>

      {editingEmpId && (
          <div className="fixed inset-0 bg-emerald-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold text-lg text-emerald-900">تعديل مواعيد الحضور</h3>
                      <button onClick={() => setEditingEmpId(null)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-emerald-700 mb-1">وقت الدخول</label>
                          <input 
                            type="time" 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none font-mono"
                            value={manualIn}
                            onChange={(e) => setManualIn(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-emerald-700 mb-1">وقت الانصراف</label>
                          <input 
                            type="time" 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-200 outline-none font-mono"
                            value={manualOut}
                            onChange={(e) => setManualOut(e.target.value)}
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                      <button onClick={saveManualEdit} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center justify-center gap-2">
                          <Save size={18} />
                          حفظ التعديلات
                      </button>
                      <button onClick={() => setEditingEmpId(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-200">
                          إلغاء
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};