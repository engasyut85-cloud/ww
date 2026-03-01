
import { Employee, TaxBracket, EmployeeGrade, Loan, LeaveRequest, PerformanceReview, User, Page } from './types';

// Job Grades Configuration (Image 5) - Added General Manager
export const JOB_GRADES: EmployeeGrade[] = [
  { id: 'GM', name: 'مدير عام', salary: 2500, additionalIncentive: 2000, description: 'مدير عام النقابة' },
  { id: '1A', name: 'الدرجة الأولى (أ)', salary: 2000, additionalIncentive: 1800, description: 'نائب مدير' },
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
  livingCost: 'علاوة غلاء معيشة', // تم تعديل المسمى هنا
  overtimeAllowance: 'بدل إضافي ثابت',
  cashAllowance: 'بدل نقدي',

  // New Allowances
  complementaryIncentive: 'بدل حافز تكميلي',
  residenceAllowance: 'بدل إقامة',
  minSocialPackage: 'بدل الحد الأدنى للحزمة الاجتماعية',
  laborGrantAllowance: 'بدل منحة العمال',
  additionalSocialAllowance: 'بدل علاوة اجتماعية إضافية',
  
  // Added Manual Incentive Label
  additionalIncentive: 'الحافز الإضافي (يدوي)',
  masterIncentive: 'بدل حافز الماجستير',
};

// --- Education Data Lists ---

export const DEGREE_TYPES = [
    { id: 'none', label: 'بكالوريوس / ليسانس (عالي)' },
    { id: 'diploma', label: 'دبلوم دراسات عليا' },
    { id: 'master', label: 'درجة الماجستير' },
    { id: 'phd', label: 'درجة الدكتوراه' },
    { id: 'institute_high', label: 'معهد عالي (4 سنوات)' },
    { id: 'institute_mid', label: 'معهد متوسط (سنتين)' },
    { id: 'technical_diploma', label: 'دبلوم فني / صناعي / تجاري' },
    { id: 'prep', label: 'إعدادية / محو أمية' }
];

export const EGYPTIAN_UNIVERSITIES = [
    "جامعة أسيوط",
    "جامعة الأزهر",
    "جامعة القاهرة",
    "جامعة عين شمس",
    "جامعة الاسكندرية",
    "جامعة المنصورة",
    "جامعة الزقازيق",
    "جامعة حلوان",
    "جامعة المنيا",
    "جامعة المنوفية",
    "جامعة قناة السويس",
    "جامعة جنوب الوادي",
    "جامعة بني سويف",
    "جامعة الفيوم",
    "جامعة سوهاج",
    "جامعة كفر الشيخ",
    "جامعة بورسعيد",
    "جامعة dمنهور",
    "جامعة أسوان",
    "جامعة مدينة السادات",
    "جامعة العريش",
    "جامعة الوادي الجديد",
    "جامعة مطروح",
    "جامعة الاقصر",
    "الجامعة الأمريكية بالقاهرة",
    "الجامعة الألمانية بالقاهرة",
    "جامعة أكتوبر للعلوم الحديثة والآداب",
    "جامعة مصر الدولية",
    "جامعة مصر للعلوم والتكنولوجيا",
    "جامعة المستقبل",
    "الجامعة المصرية الروسية",
    "الجامعة البريطانية في مصر",
    "جامعة النيل",
    "الجامعة الفرنسية في مصر",
    "جامعة الدلتا للعلوم والتكنولوجيا",
    "جامعة النهضة",
    "جامعة فاروس",
    "الجامعة المصرية للتعلم الإلكتروني",
    "جامعة بدر",
    "جامعة هليوبوليس",
    "جامعة دراية",
    "جامعة نيو جيزة",
    "جامعة حورس",
    "الجامعة المصرية الصينية",
    "جامعة ميريت",
    "جامعة سفنكس",
    "جامعة السلام",
    "أكاديمية السادات للعلوم الإدارية",
    "الأكاديمية العربية للعلوم والتكنولوجيا والنقل البحري",
    "المعهد العالي للتكنولوجيا ببنها",
    "الجامعة العمالية",
    "أخرى"
];

export const FACULTIES_INSTITUTES = [
    "كلية الهندسة",
    "كلية الطب البشري",
    "كلية طب الفم والأسنان",
    "كلية الصيدلة",
    "كلية العلوم",
    "كلية الزراعة",
    "كلية الطب البيطري",
    "كلية الحاسبات والمعلومات",
    "كلية الحاسبات والذكاء الاصطناعي",
    "كلية التمريض",
    "المعهد الفني للتمريض",
    "كلية العلاج الطبيعي",
    "كلية التجارة",
    "كلية الحقوق",
    "كلية الآداب",
    "كلية التربية",
    "كلية التربية النوعية",
    "كلية التربية الرياضية",
    "كلية الخدمة الاجتماعية",
    "كلية السياحة والفنادق",
    "كلية الألسن",
    "كلية الآثار",
    "كلية الإعلام",
    "كلية السياسة والاقتصاد",
    "كلية الفنون الجميلة",
    "كلية الفنون التطبيقية",
    "كلية دار العلوم",
    "كلية الشريعة والقانون",
    "كلية أصول الدين",
    "كلية الدراسات الإسلامية والعربية",
    "كلية اللغة العربية",
    "المعهد العالي للهندسة والتكنولوجيا",
    "المعهد العالي لعلوم الكمبيوتر",
    "المعهد العالي للخدمة الاجتماعية",
    "المعهد العالي للدراسات التعاونية",
    "المعهد العالي للإدارة والمحاسبة",
    "المعهد العالي للسياحة والفنادق",
    "المعهد العالي للإعلام",
    "أكاديمية طيبة المتكاملة للعلوم",
    "معهد فني تجاري",
    "معهد فني صناعي",
    "معهد مساحة",
    "معهد صرافة",
    "معهد سكرتارية",
    "دبلوم تجارة (3 سنوات)",
    "دبلوم تجارة (5 سنوات)",
    "دبلوم صنايع (3 سنوات)",
    "دبلوم صنايع (5 سنوات)",
    "دبلوم زراعة",
    "أخرى"
];

// Mock Employees Data
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'أحمد محمد علي',
    nationalId: '29001012501234',
    position: 'مدير عام النقابة',
    department: 'إدارة مكتب النقيب',
    grade: 'GM',
    educationLevel: 'none',
    university: 'جامعة أسيوط',
    faculty: 'كلية الهندسة',
    graduationYear: '1995',
    hasExperience: true,
    employmentCategory: 'syndicate_permanent',
    initialBasicSalary: 6000,
    basicSalary: 6000, 
    variableSalary: 0,
    allowances: {
      transportation: 1000,
      housing: 0,
      clothing: 0,
      meal: 0,
      screen: 0,
      dedication: 500,
      risk: 0,
      cashier: 0,
      secretariat: 0,
      infection: 0,
      workNature: 500,
      representation: 1000,
      driving: 0,
      livingCost: 0, // تم التصفير هنا
      overtimeAllowance: 0,
      cashAllowance: 0,
      complementaryIncentive: 0,
      residenceAllowance: 0,
      minSocialPackage: 0,
      laborGrantAllowance: 0,
      additionalSocialAllowance: 0,
      additionalIncentive: 2000,
      masterIncentive: 0
    },
    joinDate: '2010-01-01',
    phone: '01000000001',
    documents: [],
    taxCalculationMethod: 'auto'
  },
  {
    id: 'EMP002',
    name: 'سارة محمود حسن',
    nationalId: '29505052509876',
    position: 'مهندس نظم معلومات',
    department: 'إدارة الخدمات النقابية',
    grade: '3A',
    educationLevel: 'master',
    university: 'جامعة أسيوط',
    faculty: 'كلية الحاسبات والمعلومات',
    graduationYear: '2015',
    hasExperience: true,
    employmentCategory: 'syndicate_contract',
    initialBasicSalary: 3500,
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
      livingCost: 0, // تم التصفير هنا
      overtimeAllowance: 0,
      cashAllowance: 0,
      complementaryIncentive: 0,
      residenceAllowance: 0,
      minSocialPackage: 0,
      laborGrantAllowance: 0,
      additionalSocialAllowance: 0,
      additionalIncentive: 1650,
      masterIncentive: 500
    },
    joinDate: '2021-06-15',
    phone: '01100000002',
    documents: [],
    taxCalculationMethod: 'auto'
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
  }
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'LN001',
    employeeId: 'EMP001',
    /* FIX: Added missing 'type' property */
    type: 'loan',
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
        role: 'admin',
        permissions: Object.values(Page)
    }
];

export const MIN_INSURANCE_SALARY = 2000;
export const MAX_INSURANCE_SALARY = 12600;
export const INSURANCE_RATE_EMPLOYEE = 0.11; 
export const PERSONAL_EXEMPTION = 20000; 

export const TAX_BRACKETS: TaxBracket[] = [
  { limit: 40000, rate: 0 },
  { limit: 55000, rate: 0.10 },
  { limit: 70000, rate: 0.15 },
  { limit: 200000, rate: 0.20 },
  { limit: 400000, rate: 0.225 },
  { limit: Infinity, rate: 0.25 }
];
