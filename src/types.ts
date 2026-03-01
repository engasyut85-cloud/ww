
export interface EmployeeAllowances {
  transportation: number; // بدل انتقال
  housing: number;        // بدل سكن
  clothing: number;       // بدل ملبس
  meal: number;          // بدل غذاء
  
  // بدلات اللائحة الجديدة (صورة 6)
  screen: number;         // بدل شاشة
  dedication: number;     // بدل تفرغ (مهندس، محاسب، محامي)
  risk: number;           // بدل مخاطر
  cashier: number;        // بدل صرافة
  secretariat: number;    // بدل سكرتارية
  infection: number;      // بدل عدوى
  workNature: number;     // بدل طبيعة عمل

  representation: number; // بدل تمثيل
  driving: number;        // بدل قيادة
  livingCost: number;     // علاوة غلاء معيشة (300)
  overtimeAllowance: number; // بدل إضافي
  cashAllowance: number; // بدل نقدي

  // New Allowances requested
  complementaryIncentive: number; // بدل حافز تكميلي
  residenceAllowance: number;     // بدل اقامة
  minSocialPackage: number;       // بدل الحد الادنى للحزمة الاجتماعية
  laborGrantAllowance: number;    // بدل منحة العمال
  additionalSocialAllowance: number; // بدل علاوة اجتماعية اضافية
  
  // Added Manual Additional Incentive
  additionalIncentive: number;    // الحافز الإضافي (يدوي)
  masterIncentive: number;        // بدل حافز الماجستير (جديد)
}

export interface CustomAllowance {
  id: string;
  name: string;
  value: number;
}

export interface NonPensionableAllowance {
  id: string;
  name: string;
  value: number;
}

// "none" acts as Bachelor/Licentiate/General Higher Education for calculation purposes
export type EducationLevel = 'none' | 'diploma' | 'master' | 'phd' | 'institute_high' | 'institute_mid' | 'technical_diploma' | 'prep';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type MilitaryStatus = 'completed' | 'postponed' | 'exempt' | 'none';

// New Type for Employment Category
export type EmploymentCategory = 'syndicate_permanent' | 'syndicate_contract' | 'club_permanent' | 'club_contract';

export interface EmployeeDocument {
  id: string;
  name: string; // e.g., "صورة البطاقة", "شهادة الميلاد"
  type: 'image' | 'pdf';
  url: string; // For mock, we'll use local URLs
  uploadDate: string;
}

export interface SalaryIncrease {
  id: string;
  name: string; // اسم العلاوة (دورية، تشجيعية، ترقية، استثنائية...)
  type: 'percentage' | 'fixed'; // نوع العلاوة (نسبة مئوية / قيمة مقطوعة)
  value: number; // القيمة (10% أو 100 جنيه)
  amountAdded: number; // القيمة النقدية المضافة فعلياً
  previousBasic: number; // الأساسي قبل الزيادة
  newBasic: number; // الأساسي بعد الزيادة
  date: string; // تاريخ الإقرار
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  nationalId: string;
  documentNumber?: string; // رقم المستند (للمجموعات)
  position: string;
  department: string;
  grade?: string; // الدرجة الوظيفية
  
  // Education Details
  educationLevel: EducationLevel; // Base level for calculations
  university?: string; // e.g., جامعة أسيوط
  faculty?: string; // e.g., كلية الهندسة
  graduationYear?: string; // e.g., 2015

  hasExperience: boolean; // هل لديه خبرة سابقة (لحساب علاوة الخبرة 10%)
  isSpecialNeeds?: boolean; // من ذوي الاحتياجات الخاصة (50% إعفاء ضريبي إضافي)
  isPensionSubject?: boolean; // خاضع للمعاش (يخصم منه تأمينات وتتحمل النقابة حصة صاحب العمل)
  employmentCategory: EmploymentCategory; // تصنيف التعيين (نقابة/نادي - مثبت/متعاقد)
  
  initialBasicSalary: number; // الراتب الأساسي الأولي (عند التعيين)
  basicSalary: number; // الراتب الأساسي التأميني الحالي (المطبق فعلياً)
  variableSalary: number; // المتغير والحوافز (أخرى)
  
  salaryHistory?: SalaryIncrease[]; // سجل تدرج المرتب الأساسي

  manualFellowshipValue?: number; // قيمة صندوق الزمالة (يدوي)
  manualSyndicateIncentive?: number; // حافز النقابة (يدوي)
  manualSpecialRaise2015?: number; // علاوة 2015 (يدوي)
  manualLaborGrant?: number; // منحة العمال (يدوي)

  allowances: EmployeeAllowances; // البدلات
  customAllowances?: CustomAllowance[]; // بدلات إضافية مخصصة
  nonPensionableAllowances?: NonPensionableAllowance[]; // بدلات غير خاضعة للتأمينات (جديد)
  
  joinDate: string;
  retirementDate?: string; // تاريخ بلوغ سن المعاش
  phone: string;
  
  // New Fields
  email?: string;
  address?: string;
  insuranceNumber?: string;
  maritalStatus?: MaritalStatus;
  militaryStatus?: MilitaryStatus;

  bankName?: string; // اسم البنك للتحويل
  bankAccountNumber?: string; // رقم الحساب البنكي - Added
  documents?: EmployeeDocument[]; // أرشيف المستندات
  lastModifiedDate?: string; // تاريخ آخر تعديل
  
  vodafoneDeduction?: number; // خصم فودافون (اشتراك شهري) - Added

  // Tax settings
  taxCalculationMethod: 'auto' | 'manual'; // طريقة حساب الضريبة
  manualTaxRate?: number; // نسبة الضريبة اليدوية (5-25)

  trainingCourses?: string; // الدورات التدريبية
}

export interface EmployeeGrade {
  id: string;
  name: string;
  salary: number;
  additionalIncentive: number; // الحافز الإضافي طبقا للائحة (صورة 5)
  description: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'present' | 'absent' | 'late' | 'vacation';
  overtimeHours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'casual' | 'unpaid' | 'mission'; // Added mission
  startDate: string;
  endDate: string;
  location?: string; // New field for mission destination
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Loan {
  id: string;
  employeeId: string;
  type: 'loan' | 'bank'; // تحديد نوع المديونية (سلفة أو قسط بنك)
  totalAmount: number; // قيمة السلفة
  remainingAmount: number; // المتبقي
  monthlyInstallment: number; // القسط الشهري
  startDate: string;
  endDate?: string; // تاريخ انتهاء السلفة
  status: 'active' | 'completed';
}

// New Interface for Tax Debts resulting from Settlement
export interface TaxDebt {
  id: string;
  employeeId: string;
  year: number;
  totalAmount: number; // إجمالي المديونية
  remainingAmount: number; // المتبقي
  monthlyInstallment: number; // القسط الشهري
  createdAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  year: number;
  score: number; // Out of 100
  rating: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  notes: string;
  suggestedRaise: number; // Suggested raise amount/percentage
  date: string;
}

export interface BonusRecord {
  id: string;
  employeeId: string;
  type: string; // جهود غير عادية، مولد نبوي، إلخ
  category: 'bonus' | 'grant' | 'overtime';
  amount: number; // This acts as Gross Amount for Payroll Logic compatibility
  
  // Detailed Breakdown for Report
  grossAmount: number;
  taxRate: number; // Percentage
  taxAmount: number;
  stampAmount: number;
  netAmount: number;

  docNumber?: string; // رقم المستند الخاص بالمنحة/المكافأة
  date: string; // تاريخ الاستحقاق
  details?: string; // تفاصيل (مثلا عدد الساعات في حالة الاضافي)
}

export interface ExternalWorkerRecord {
  id: string;
  name: string;
  nationalId: string;
  documentNumber?: string; // Added field for Document Number
  jobType: string;
  amount: number;
  date: string;
  // Financial details
  taxRate?: number;
  taxAmount?: number;
  stampAmount?: number;
  netAmount?: number;
}

export interface PayrollSlip {
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  
  // New specific components for Form 132
  specialRaise2015: number; // علاوة خاصة 10%
  laborGrant: number; // منحة عيد العمال
  socialPackage: number; // حزمة اجتماعية (غلاء معيشة)

  syndicateIncentive: number; // حافز النقابة (100% من الأساسي)
  additionalIncentive: number; // الحافز الإضافي (حسب الدرجة)
  educationExperienceBonus: number; // علاوات المؤهل والخبرة
  performanceRaise: number; // العلاوة الدورية من التقييم
  variableSalary: number;
  allowancesTotal: number;
  
  // New Calculation Fields for Payslip
  cashAllowance: number; // البدل النقدي
  insurableWage: number; // الأجر الخاضع (الأساسي + البدلات - النقدي)

  syndicateSocialShare: number; // حصة النقابة في التأمينات (18.75%)
  syndicateFellowshipShare: number; // حصة النقابة في صندوق الزمالة (50%) - Added
  grossTotal: number;
  
  // Deductions
  insuranceEmployeeShare: number; // 11%
  totalInsurance: number; // 29.75% (11% + 18.75%)
  
  taxDeduction: number; // Based on brackets
  stampDuty: number; // الدمغة
  fellowshipFund: number; // صندوق الزمالة (Employee Share)
  
  incentives: number; // Now includes Bonuses/Grants
  penalties: number;
  loanDeduction: number; // خصم السلفة
  bankInstallment: number; // خصم قسط البنك (جديد)
  taxSettlementDeduction: number; // خصم التسوية الضريبية
  netSalary: number;
  
  vodafoneDeduction: number; // Added to slip
  nonPensionableTotal: number; // إجمالي البدلات غير الخاضعة (جديد)
}

// Added missing TaxBracket interface to resolve compilation errors
export interface TaxBracket {
  limit: number;
  rate: number;
}

// Added missing UserRole type to resolve compilation errors
export type UserRole = 'admin' | 'editor';

// Added missing User interface to resolve compilation errors
export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this should be hashed
  name: string;
  role: UserRole;
  permissions?: Page[];
}

// Added missing Page enum to resolve compilation errors
export enum Page {
  DASHBOARD = 'DASHBOARD',
  EMPLOYEES = 'EMPLOYEES',
  STATUS_STATEMENT = 'STATUS_STATEMENT',
  SALARY_PROGRESSION = 'SALARY_PROGRESSION',
  ATTENDANCE = 'ATTENDANCE',
  PAYROLL = 'PAYROLL',
  LEAVES = 'LEAVES', 
  LOANS = 'LOANS', 
  PERFORMANCE = 'PERFORMANCE', 
  BONUSES = 'BONUSES',
  TAX_SETTLEMENT = 'TAX_SETTLEMENT',
  EXTERNAL_WORKERS = 'EXTERNAL_WORKERS',
  REPORTS = 'REPORTS',
  AI_ADVISOR = 'AI_ADVISOR',
  USERS = 'USERS',
  SETTINGS = 'SETTINGS'
}
