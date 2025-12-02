
import { Employee, TaxBracket, EmployeeGrade, Loan, LeaveRequest, PerformanceReview, User } from './types';

// Job Grades Configuration with Additional Incentive (Image 5)
export const JOB_GRADES: EmployeeGrade[] = [
  { id: '1A', name: 'الدرجة الأولى (أ)', salary: 2000, additionalIncentive: 1800, description: 'مدير عام / نائب مدير' },
  { id: '1B', name: 'الدرجة الأولى (ب)', salary: 1900, additionalIncentive: 1800, description: 'مدير تنفيذي' },
  { id: '2A', name: 'الدرجة الثانية (أ)', salary: 1850, additionalIncentive: 1700, description: 'مدير إدارة / فرع' },
  { id: '2B', name: 'الدرجة الثانية (ب)', salary: 1700, additionalIncentive: 1700, description: 'رئيس قسم' },
  { id: '3A', name: 'الدرجة الثالثة (أ)', salary: 1800, additionalIncentive: 1650, description: 'مهندس / محاسب (خبرة)' },
  { id: '3B', name: 'الدرجة الثالثة (ب)', salary: 1700, additionalIncentive: 1650, description: 'أخصائي علاقات' },
  { id: '3C', name: 'الدرجة الثالثة (ج)', salary: 1600, additionalIncentive: 1650, description: 'بداية التعيين' },
  { id: '4A', name: 'الدرجة الرابعة (أ)', salary: 1750, additionalIncentive: 1600, description: 'مؤهل متوسط (خبرة)' },
  { id: '4B', name: 'الدرجة الرابعة (ب)', salary: 1650, additionalIncentive: 1600, description: 'مؤهل متوسط' },
  { id: '4C', name: 'الدرجة الرابعة (ج)', salary: 1550, additionalIncentive: 1600, description: 'بداية التعيين' },
  { id: '56A', name: 'الدرجة الخامسة والسادسة (أ)', salary: 1500, additionalIncentive: 1550, description: 'خدمات معاونة (خبرة)' },
  { id: '56B', name: 'الدرجة الخامسة والسادسة (ب)', salary: 1400, additionalIncentive: 1550, description: 'سائق / حارس' },
  { id: '56C', name: 'الدرجة الخامسة والسادسة (ج)', salary: 1200, additionalIncentive: 1550, description: 'بداية التعيين' },
];

export const INITIAL_DEPARTMENTS = [
  'إدارة مكتب النقيب',
  'إدارة الاسكان',
  'إدارة الامن',
  'إدارة الخدمات النقابية',
  'إدارة الخزنة',
  'إدارة الرعاية الصحية',
  'إدارة العقود',
  'إدارة العلاقات العامة والاعلام',
  'إدارة اللجنة الاجتماعية',
  'الإدارة المالية',
  'إدارة المخزن',
  'إدارة المشتريات',
  'إدارة المعاشات',
  'إدارة الموارد البشرية',
  'إدارة النادي',
  'إدارة التدريب',
  'إدارة الشئون الادارية والمالية',
  'إدارة الشئون القانونية',
  'إدارة مزاولة المهنة'
];

export const EMPLOYMENT_CATEGORIES = [
    { id: 'syndicate_permanent', label: 'موظف نقابة مثبت' },
    { id: 'syndicate_contract', label: 'موظف نقابة متعاقد' },
    { id: 'club_permanent', label: 'موظف نادي مثبت' },
    { id: 'club_contract', label: 'موظف نادي متعاقد' },
];

export const ALLOWANCE_LABELS = {
  // General
  transportation: 'بدل انتقال/سفر',
  housing: 'بدل سكن',
  clothing: 'بدل ملبس',
  meal: 'بدل غذاء',
  
  // Specific from Image 6
  screen: 'بدل شاشة',
  dedication: 'بدل تفرغ (مهندس/محاسب/محامي)',
  risk: 'بدل مخاطر',
  cashier: 'بدل صرافة',
  secretariat: 'بدل سكرتارية',
  infection: 'بدل عدوى',
  workNature: 'بدل طبيعة عمل (أخرى)',

  representation: 'بدل تمثيل',
  driving: 'بدل قيادة',
  livingCost: 'علاوة غلاء معيشة (300ج)',
  overtimeAllowance: 'بدل إضافي ثابت',
  cashAllowance: 'بدل نقدي',

  // New Allowances
  complementaryIncentive: 'بدل حافز تكميلي',
  residenceAllowance: 'بدل إقامة',
  minSocialPackage: 'بدل الحد الأدنى للحزمة الاجتماعية',
  laborGrantAllowance: 'بدل منحة العمال',
  additionalSocialAllowance: 'بدل علاوة اجتماعية إضافية',
};

// Mock Employees Data
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'أحمد محمد علي',
    nationalId: '29001012501234',
    position: 'مدير الشئون المالية',
    department: 'الإدارة المالية',
    grade: '1A',
    educationLevel: 'none',
    hasExperience: true,
    employmentCategory: 'syndicate_permanent',
    basicSalary: 4000, 
    variableSalary: 0,
    allowances: {
      transportation: 500,
      housing: 0,
      clothing: 0,
      meal: 0,
      screen: 200,
      dedication: 250,
      risk: 0,
      cashier: 0,
      secretariat: 0,
      infection: 0,
      workNature: 0,
      representation: 500,
      driving: 0,
      livingCost: 300,
      overtimeAllowance: 0,
      cashAllowance: 0,
      complementaryIncentive: 0,
      residenceAllowance: 0,
      minSocialPackage: 0,
      laborGrantAllowance: 0,
      additionalSocialAllowance: 0
    },
    joinDate: '2019-03-01',
    phone: '01000000001',
    documents: []
  },
  {
    id: 'EMP002',
    name: 'سارة محمود حسن',
    nationalId: '29505052509876',
    position: 'مهندس نظم معلومات',
    department: 'إدارة الخدمات النقابية',
    grade: '2A',
    educationLevel: 'master',
    hasExperience: true,
    employmentCategory: 'syndicate_contract',
    basicSalary: 3500,
    variableSalary: 0,
    allowances: {
      transportation: 300,
      housing: 0,
      clothing: 0,
      meal: 0,
      screen: 200,
      dedication: 250,
      risk: 0,
      cashier: 0,
      secretariat: 0,
      infection: 0,
      workNature: 0,
      representation: 0,
      driving: 0,
      livingCost: 300,
      overtimeAllowance: 0,
      cashAllowance: 0,
      complementaryIncentive: 0,
      residenceAllowance: 0,
      minSocialPackage: 0,
      laborGrantAllowance: 0,
      additionalSocialAllowance: 0
    },
    joinDate: '2021-06-15',
    phone: '01100000002',
    documents: []
  },
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'L001',
    employeeId: 'EMP002',
    type: 'annual',
    startDate: '2023-11-01',
    endDate: '2023-11-05',
    reason: 'ظروف عائلية',
    status: 'approved'
  },
  {
    id: 'M001',
    employeeId: 'EMP001',
    type: 'mission',
    startDate: '2023-11-10',
    endDate: '2023-11-10',
    reason: 'تجديد تراخيص النقابة',
    location: 'ديوان محافظة أسيوط',
    status: 'pending'
  }
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'LN001',
    employeeId: 'EMP001',
    totalAmount: 10000,
    remainingAmount: 5000,
    monthlyInstallment: 1000,
    startDate: '2023-06-01',
    status: 'active'
  }
];

export const INITIAL_REVIEWS: PerformanceReview[] = [];

export const INITIAL_USERS: User[] = [
    {
        id: 'USR001',
        username: 'admin',
        password: '123',
        name: 'مدير النظام',
        role: 'admin'
    }
];

// Egyptian Social Insurance Constants
export const MIN_INSURANCE_SALARY = 2000;
export const MAX_INSURANCE_SALARY = 12600;
export const INSURANCE_RATE_EMPLOYEE = 0.11; // 11%

// Annual Personal Exemption (Updated to 20,000 as per recent amendments accompanying Law 7)
export const PERSONAL_EXEMPTION = 20000; 

// Egyptian Tax Brackets (Law No. 7 of 2024) - First Category (Base)
export const TAX_BRACKETS: TaxBracket[] = [
  { limit: 40000, rate: 0 },      // 1 - 40,000
  { limit: 55000, rate: 0.10 },   // 40,001 - 55,000
  { limit: 70000, rate: 0.15 },   // 55,001 - 70,000
  { limit: 200000, rate: 0.20 },  // 70,001 - 200,000
  { limit: 400000, rate: 0.225 }, // 200,001 - 400,000
  { limit: Infinity, rate: 0.25 } // > 400,000
];
