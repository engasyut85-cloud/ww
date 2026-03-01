
import { MAX_INSURANCE_SALARY, MIN_INSURANCE_SALARY, INSURANCE_RATE_EMPLOYEE, PERSONAL_EXEMPTION, JOB_GRADES } from '../constants';
import { Employee, PayrollSlip, Loan, PerformanceReview, BonusRecord, TaxDebt, SalaryIncrease } from '../types';

/**
 * حساب المبالغ المتبقية والقسط المستحق وتاريخ الانتهاء للسلفة أو قسط البنك
 */
export const calculateLoanBalances = (loan: Loan, targetDate: Date) => {
    const startDate = new Date(loan.startDate);
    
    const totalInstallmentsNeeded = Math.ceil(loan.totalAmount / loan.monthlyInstallment);
    const expectedEndDate = new Date(startDate);
    expectedEndDate.setMonth(startDate.getMonth() + (totalInstallmentsNeeded - 1));
    const endDateStr = expectedEndDate.toISOString().split('T')[0];

    const yearDiff = targetDate.getFullYear() - startDate.getFullYear();
    const monthDiff = targetDate.getMonth() - startDate.getMonth();
    const totalMonthsElapsed = (yearDiff * 12) + monthDiff;

    if (totalMonthsElapsed < 0) {
        return { 
            remainingBefore: loan.totalAmount, 
            installment: 0, 
            remainingAfter: loan.totalAmount,
            expectedEndDate: endDateStr 
        };
    }

    const installmentsPaidPreviously = totalMonthsElapsed;
    const amountPaidPreviously = installmentsPaidPreviously * loan.monthlyInstallment;
    
    const remainingBeforeCurrent = Math.max(0, loan.totalAmount - amountPaidPreviously);
    const currentInstallment = Math.min(loan.monthlyInstallment, remainingBeforeCurrent);
    const remainingAfterCurrent = Math.max(0, remainingBeforeCurrent - currentInstallment);

    return {
        remainingBefore: remainingBeforeCurrent,
        installment: currentInstallment,
        remainingAfter: remainingAfterCurrent,
        expectedEndDate: endDateStr
    };
};

/**
 * دالة لتحديد الراتب الأساسي المستحق في تاريخ معين بناءً على سجل التدرج
 */
export const getBasicSalaryOnDate = (employee: Employee, targetDate: Date): number => {
    if (!employee.salaryHistory || employee.salaryHistory.length === 0) {
        return employee.basicSalary;
    }

    const sortedHistory = [...employee.salaryHistory].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const endOfTargetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    
    let effectiveBasic = employee.initialBasicSalary || employee.basicSalary;
    
    for (const record of sortedHistory) {
        if (new Date(record.date) <= endOfTargetMonth) {
            effectiveBasic = record.newBasic;
        } else {
            break; 
        }
    }

    return effectiveBasic;
};

export const calculateTaxFromBrackets = (annualTaxableIncome: number): number => {
    let annualTax = 0;
    const safeIncome = isNaN(annualTaxableIncome) ? 0 : annualTaxableIncome;
    const income = Math.floor(safeIncome / 10) * 10;

    if (income > 0) {
        if (income > 40000) {
            const taxableAmount = Math.min(income, 55000) - 40000;
            annualTax += taxableAmount * 0.10;
        }
        if (income > 55000) {
            const taxableAmount = Math.min(income, 70000) - 55000;
            annualTax += taxableAmount * 0.15;
        }
        if (income > 70000) {
            const taxableAmount = Math.min(income, 200000) - 70000;
            annualTax += taxableAmount * 0.20;
        }
        if (income > 200000) {
            const taxableAmount = Math.min(income, 400000) - 200000;
            annualTax += taxableAmount * 0.225;
        }
        if (income > 400000) {
            const taxableAmount = income - 400000;
            annualTax += taxableAmount * 0.25;
        }
    }
    return annualTax;
};

interface CalculationOptions {
    date?: Date;
    forceFullMonth?: boolean;
}

export const calculateSalary = (
    employee: Employee, 
    activeLoans: Loan[],
    reviews: PerformanceReview[],
    bonuses: BonusRecord[] = [],
    incentives: number = 0, 
    penalties: number = 0, 
    overtimePay: number = 0,
    taxDebts: TaxDebt[],
    options: CalculationOptions = {}
): PayrollSlip => {
  const calculationDate = options.date || new Date();
  
  const dynamicBasicSalary = getBasicSalaryOnDate(employee, calculationDate);

  let workRatio = 1.0;
  if (!options.forceFullMonth) {
      const joinDate = new Date(employee.joinDate);
      if (joinDate.getFullYear() > calculationDate.getFullYear() || (joinDate.getFullYear() === calculationDate.getFullYear() && joinDate.getMonth() > calculationDate.getMonth())) {
          workRatio = 0;
      } else if (joinDate.getFullYear() === calculationDate.getFullYear() && joinDate.getMonth() === calculationDate.getMonth()) {
          const daysInMonth = new Date(calculationDate.getFullYear(), calculationDate.getMonth() + 1, 0).getDate();
          workRatio = Math.max(0, (daysInMonth - joinDate.getDate() + 1) / daysInMonth);
      }
  }

  const val = (n: any) => (parseFloat(n) || 0) * workRatio;

  const standardAllowancesTotal = Object.values(employee.allowances || {}).reduce((sum, v) => sum + val(v), 0);
  const customAllowancesTotal = (employee.customAllowances || []).reduce((sum, item) => sum + val(item.value), 0);
  const allAllowancesSum = standardAllowancesTotal + customAllowancesTotal;
  
  const nonPensionableTotal = (employee.nonPensionableAllowances || []).reduce((sum, item) => sum + val(item.value), 0);
  
  const cashAllowance = val(employee.allowances?.cashAllowance);
  const additionalIncentive = val(employee.allowances?.additionalIncentive);
  const livingCost = val(employee.allowances?.livingCost) || 0; 
  const socialPackage = livingCost;

  const otherAllowancesTotal = allAllowancesSum - cashAllowance - additionalIncentive - socialPackage;

  const syndicateIncentive = val(employee.manualSyndicateIncentive);
  const experienceBonus = employee.hasExperience ? (dynamicBasicSalary * 0.10 * workRatio) : 0;
  const educationBonus = (employee.educationLevel === 'phd' || employee.educationLevel === 'diploma') ? (dynamicBasicSalary * 0.05 * workRatio) : 0;
  const educationExperienceBonus = experienceBonus + educationBonus;

  const specialRaise2015 = val(employee.manualSpecialRaise2015);
  const laborGrant = (employee.manualLaborGrant !== undefined ? val(employee.manualLaborGrant) : 10 * workRatio);

  const employeeReviews = reviews.filter(r => r.employeeId === employee.id);
  employeeReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const raisePercentage = employeeReviews.length > 0 ? employeeReviews[0].suggestedRaise : 0;
  const performanceRaise = (dynamicBasicSalary * (raisePercentage / 100)) * workRatio;

  // تم إلغاء دمج المنح والمكافآت (Bonuses) في الراتب الشهري بناءً على طلب المستخدم
  const totalIncentives = incentives; 
  
  const scaledBasic = val(dynamicBasicSalary);
  const scaledVariable = val(employee.variableSalary);

  const insurableWageComponents = scaledBasic + scaledVariable + syndicateIncentive + additionalIncentive + 
                                  educationExperienceBonus + performanceRaise + specialRaise2015 + laborGrant + 
                                  otherAllowancesTotal + totalIncentives + overtimePay + socialPackage;

  const isSubject = employee.isPensionSubject !== false;

  const insuranceEmployeeShare = isSubject ? (insurableWageComponents * INSURANCE_RATE_EMPLOYEE) : 0;
  const syndicateSocialShare = isSubject ? (insurableWageComponents * 0.1875) : 0;
  const totalInsurance = insuranceEmployeeShare + syndicateSocialShare;

  const stampDuty = (insurableWageComponents + cashAllowance + nonPensionableTotal + syndicateSocialShare) * 0.006;
  
  const totalFellowshipManual = val(employee.manualFellowshipValue);
  const fellowshipFund = totalFellowshipManual / 2;
  const syndicateFellowshipShare = totalFellowshipManual / 2;

  const grossTotal = insurableWageComponents + syndicateSocialShare + cashAllowance + syndicateFellowshipShare + nonPensionableTotal;

  const personalExemptionLimit = employee.isSpecialNeeds ? PERSONAL_EXEMPTION * 1.5 : PERSONAL_EXEMPTION;
  const monthlyTaxableBase = (insurableWageComponents + cashAllowance + nonPensionableTotal) - insuranceEmployeeShare - stampDuty - fellowshipFund;
  
  let monthlyTax = 0;
  if (employee.taxCalculationMethod === 'manual' && employee.manualTaxRate) {
      monthlyTax = Math.max(0, monthlyTaxableBase * (employee.manualTaxRate / 100));
  } else {
      const annualTaxableIncome = (monthlyTaxableBase * 12) - personalExemptionLimit;
      monthlyTax = Math.max(0, calculateTaxFromBrackets(annualTaxableIncome) / 12);
  }

  const loanDeduction = activeLoans
    .filter(l => l.employeeId === employee.id && l.status === 'active' && (l.type === 'loan' || !l.type))
    .reduce((sum, l) => sum + calculateLoanBalances(l, calculationDate).installment, 0);

  const bankInstallment = activeLoans
    .filter(l => l.employeeId === employee.id && l.status === 'active' && l.type === 'bank')
    .reduce((sum, l) => sum + calculateLoanBalances(l, calculationDate).installment, 0);

  const activeTaxDebt = taxDebts.find(d => String(d.employeeId) === String(employee.id) && d.remainingAmount > 0.01);
  const taxSettlementDeduction = activeTaxDebt ? Math.min(activeTaxDebt.monthlyInstallment, activeTaxDebt.remainingAmount) : 0;
  const vodafoneDeduction = employee.vodafoneDeduction || 0;

  const totalDeductions = totalInsurance + monthlyTax + stampDuty + fellowshipFund + syndicateFellowshipShare + 
                          penalties + loanDeduction + bankInstallment + taxSettlementDeduction + vodafoneDeduction;
  
  return {
    employeeId: employee.id,
    month: calculationDate.toLocaleString('ar-EG', { month: 'long' }),
    year: calculationDate.getFullYear(),
    basicSalary: scaledBasic,
    specialRaise2015: parseFloat(specialRaise2015.toFixed(2)),
    laborGrant: parseFloat(laborGrant.toFixed(2)),
    socialPackage: parseFloat(socialPackage.toFixed(2)),
    syndicateIncentive: parseFloat(syndicateIncentive.toFixed(2)),
    additionalIncentive: parseFloat(additionalIncentive.toFixed(2)),
    educationExperienceBonus: parseFloat(educationExperienceBonus.toFixed(2)),
    performanceRaise: parseFloat(performanceRaise.toFixed(2)),
    variableSalary: scaledVariable,
    allowancesTotal: parseFloat(otherAllowancesTotal.toFixed(2)),
    cashAllowance: parseFloat(cashAllowance.toFixed(2)),
    insurableWage: parseFloat(insurableWageComponents.toFixed(2)),
    syndicateSocialShare: parseFloat(syndicateSocialShare.toFixed(2)),
    syndicateFellowshipShare: parseFloat(syndicateFellowshipShare.toFixed(2)),
    grossTotal: parseFloat(grossTotal.toFixed(2)),
    insuranceEmployeeShare: parseFloat(insuranceEmployeeShare.toFixed(2)),
    totalInsurance: parseFloat(totalInsurance.toFixed(2)),
    taxDeduction: parseFloat(monthlyTax.toFixed(2)),
    stampDuty: parseFloat(stampDuty.toFixed(2)),
    fellowshipFund: parseFloat(fellowshipFund.toFixed(2)),
    incentives: totalIncentives,
    penalties: penalties,
    loanDeduction: parseFloat(loanDeduction.toFixed(2)),
    bankInstallment: parseFloat(bankInstallment.toFixed(2)), 
    taxSettlementDeduction: Number(taxSettlementDeduction.toFixed(2)), 
    netSalary: parseFloat((grossTotal - totalDeductions).toFixed(2)),
    vodafoneDeduction: vodafoneDeduction,
    nonPensionableTotal: parseFloat(nonPensionableTotal.toFixed(2))
  };
};
