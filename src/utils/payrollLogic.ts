
import { MAX_INSURANCE_SALARY, MIN_INSURANCE_SALARY, INSURANCE_RATE_EMPLOYEE, PERSONAL_EXEMPTION, JOB_GRADES } from '../constants';
import { Employee, PayrollSlip, Loan, PerformanceReview, BonusRecord, TaxDebt } from '../types';

export const calculateTaxFromBrackets = (annualTaxableIncome: number): number => {
    let annualTax = 0;
    // LEGAL RULE: Round down to the nearest 10 EGP
    const income = Math.floor(annualTaxableIncome / 10) * 10;

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

export const calculateSalary = (
    employee: Employee, 
    activeLoans: Loan[],
    reviews: PerformanceReview[],
    bonuses: BonusRecord[] = [],
    incentives: number = 0, 
    penalties: number = 0, 
    overtimePay: number = 0,
    taxDebts: TaxDebt[] = [] 
): PayrollSlip => {
  // 1. Allowances
  const allAllowances = Object.values(employee.allowances || {});
  const allowancesTotal = allAllowances.reduce((sum, val) => sum + (Number(val) || 0), 0);
  
  // Specific Allowances
  const cashAllowance = Number(employee.allowances?.cashAllowance) || 0;
  const nonCashAllowancesTotal = allowancesTotal - cashAllowance;

  const livingCost = Number(employee.allowances?.livingCost) || 300; 
  const socialPackage = livingCost;

  // 2. Incentives (Manual Input instead of 100%)
  const syndicateIncentive = Number(employee.manualSyndicateIncentive) || 0;
  
  const gradeInfo = JOB_GRADES.find(g => g.id === employee.grade);
  const additionalIncentive = gradeInfo ? gradeInfo.additionalIncentive : 0;

  // 3. Education
  const experienceBonus = employee.hasExperience ? (employee.basicSalary * 0.10) : 0;
  let educationBonus = 0;
  if (employee.educationLevel === 'phd' || employee.educationLevel === 'diploma') {
      educationBonus = employee.basicSalary * 0.05;
  }
  const educationExperienceBonus = experienceBonus + educationBonus;

  // 4. Raises & Grants (Manual Special Raise 2015 instead of 10%)
  const specialRaise2015 = Number(employee.manualSpecialRaise2015) || 0;
  const laborGrant = 10;

  // 5. Performance
  const employeeReviews = reviews.filter(r => r.employeeId === employee.id);
  employeeReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestReview = employeeReviews.length > 0 ? employeeReviews[0] : null;
  const raisePercentage = latestReview ? latestReview.suggestedRaise : 0;
  const performanceRaise = employee.basicSalary * (raisePercentage / 100);

  // 6. Bonuses
  const currentMonthStr = new Date().toISOString().slice(0, 7); 
  const monthlyBonuses = bonuses
    .filter(b => b.employeeId === employee.id && b.date.startsWith(currentMonthStr))
    .reduce((sum, b) => sum + b.amount, 0);

  const totalIncentives = incentives + monthlyBonuses;

  // --- NEW LOGIC: Insurable Wage Calculation (The Base) ---
  // Formula: Basic + Incentives + Raises + Grants + Non-Cash Allowances (EXCLUDING CASH ALLOWANCE)
  const insurableWageComponents = employee.basicSalary + 
                                  employee.variableSalary +
                                  syndicateIncentive +
                                  additionalIncentive +
                                  educationExperienceBonus +
                                  performanceRaise +
                                  specialRaise2015 +
                                  laborGrant +
                                  nonCashAllowancesTotal +
                                  totalIncentives +
                                  overtimePay;

  // Cap for Calculation Only (Insurance)
  let cappedInsurableWage = insurableWageComponents;
  if (cappedInsurableWage > MAX_INSURANCE_SALARY) cappedInsurableWage = MAX_INSURANCE_SALARY;
  if (cappedInsurableWage < MIN_INSURANCE_SALARY) cappedInsurableWage = MIN_INSURANCE_SALARY;

  // 10. Insurance Shares
  const insuranceEmployeeShare = cappedInsurableWage * INSURANCE_RATE_EMPLOYEE;
  const syndicateSocialShare = cappedInsurableWage * 0.1875;
  const totalInsurance = insuranceEmployeeShare + syndicateSocialShare;

  // 12. Stamp Duty
  // Note: Stamp duty usually calculated on the Full Gross including Cash Allowance
  const grossBeforeStamp = insurableWageComponents + cashAllowance + syndicateSocialShare;
  const stampDuty = grossBeforeStamp * 0.006;
  
  // 13. Fellowship Fund (Split 50/50)
  const totalFellowshipManual = Number(employee.manualFellowshipValue) || 0;
  const fellowshipFund = totalFellowshipManual / 2; // Employee deduction part (50%)
  const syndicateFellowshipShare = totalFellowshipManual / 2; // Syndicate part (50%)

  // 11. Final Gross Total (The Entitlement Display)
  // REQUESTED FORMULA: InsurableWage + SyndicateShare + CashAllowance
  // Note: This excludes 'syndicateFellowshipShare' from the displayed Gross Total per user request.
  const grossTotal = insurableWageComponents + 
                     syndicateSocialShare + 
                     cashAllowance;

  // 14. Tax
  const personalExemptionLimit = employee.isSpecialNeeds 
      ? PERSONAL_EXEMPTION * 1.5 
      : PERSONAL_EXEMPTION;

  // Taxable Base (Calculated on actual income components)
  const monthlyIncomeForTax = insurableWageComponents + cashAllowance; 
  const monthlyTaxableBase = monthlyIncomeForTax - insuranceEmployeeShare - stampDuty - fellowshipFund;
  const annualTaxableIncome = (monthlyTaxableBase * 12) - personalExemptionLimit;
  const annualTax = calculateTaxFromBrackets(annualTaxableIncome);
  const monthlyTax = Math.max(0, annualTax / 12);

  // 15. Loans
  const empLoan = activeLoans.find(l => l.employeeId === employee.id && l.status === 'active');
  const loanDeduction = empLoan ? Math.min(empLoan.monthlyInstallment, empLoan.remainingAmount) : 0;

  // 16. Tax Settlement Deduction
  const activeTaxDebt = taxDebts.find(d => 
      String(d.employeeId) === String(employee.id) && 
      d.remainingAmount > 0
  );
  
  const taxSettlementDeduction = activeTaxDebt 
      ? Math.min(activeTaxDebt.monthlyInstallment, activeTaxDebt.remainingAmount) 
      : 0;

  // 17. Net
  // Deductions must align with what was added to Gross.
  // Since we added SyndicateSocialShare to Gross, we deduct totalInsurance (Emp+Syn).
  // We deduct Tax, Stamp, Penalties, Loans.
  // We deduct Employee Fellowship Share (from basic/var).
  // We DO NOT deduct Syndicate Fellowship Share because it was NOT added to Gross in the formula above.
  const totalDeductions = totalInsurance + // Includes Emp + Syn Share
                          monthlyTax + 
                          stampDuty + 
                          fellowshipFund + // Only Emp Share
                          penalties + 
                          loanDeduction + 
                          taxSettlementDeduction;
  
  const netSalary = grossTotal - totalDeductions;

  return {
    employeeId: employee.id,
    month: new Date().toLocaleString('ar-EG', { month: 'long' }),
    year: new Date().getFullYear(),
    basicSalary: employee.basicSalary,
    
    specialRaise2015: parseFloat(specialRaise2015.toFixed(2)),
    laborGrant: parseFloat(laborGrant.toFixed(2)),
    socialPackage: parseFloat(socialPackage.toFixed(2)),

    syndicateIncentive: parseFloat(syndicateIncentive.toFixed(2)),
    additionalIncentive: parseFloat(additionalIncentive.toFixed(2)),
    educationExperienceBonus: parseFloat(educationExperienceBonus.toFixed(2)),
    performanceRaise: parseFloat(performanceRaise.toFixed(2)),
    variableSalary: employee.variableSalary,
    allowancesTotal: parseFloat(allowancesTotal.toFixed(2)),
    
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
    
    taxSettlementDeduction: Number(taxSettlementDeduction.toFixed(2)), 
    
    netSalary: parseFloat(netSalary.toFixed(2))
  };
};