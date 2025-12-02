
import React, { useState } from 'react';
import { Employee, BonusRecord, PerformanceReview, TaxDebt } from '../types';
import { calculateSalary, calculateTaxFromBrackets } from '../utils/payrollLogic';
import { Search, Calculator, ArrowDown, ArrowUp, AlertCircle, Printer, Scale, CheckSquare, Save, Lock, Calendar } from 'lucide-react';

interface TaxSettlementProps {
  employees: Employee[];
  bonuses: BonusRecord[];
  reviews: PerformanceReview[];
  taxDebts: TaxDebt[];
  setTaxDebts: (debts: TaxDebt[]) => void;
}

export const TaxSettlement: React.FC<TaxSettlementProps> = ({ employees, bonuses, reviews, taxDebts, setTaxDebts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  
  // Fixed to 12 months as requested
  const installmentMonths = 12;

  const filteredEmployees = employees.filter(emp => 
    emp.name.includes(searchTerm) || emp.nationalId.includes(searchTerm)
  );

  // Helper to ensure numbers are valid (Safe Math)
  const safe = (val: any) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
  };

  // Helper to find existing debt for the current view
  const getExistingDebt = (empId: string) => {
      return taxDebts.find(d => 
          String(d.employeeId) === String(empId) && 
          d.year === year && 
          d.remainingAmount > 0
      );
  };

  const existingDebt = selectedEmp ? getExistingDebt(selectedEmp.id) : null;

  const calculateSettlement = (emp: Employee) => {
      // --- 1. Determine Eligible Months (Based on Join Date) ---
      const joinDate = new Date(emp.joinDate);
      let monthsWorked = 12;
      let startMonthName = "يناير";

      if (joinDate.getFullYear() === year) {
          const joinMonthIndex = joinDate.getMonth(); // 0-11
          // If joined in Sept (index 8), worked months = 12 - 8 = 4 (Sept, Oct, Nov, Dec)
          monthsWorked = 12 - joinMonthIndex;
          startMonthName = joinDate.toLocaleString('ar-EG', { month: 'long' });
      } else if (joinDate.getFullYear() > year) {
          monthsWorked = 0;
      }

      // Safety check
      monthsWorked = Math.max(0, Math.min(12, monthsWorked));

      if (monthsWorked <= 0) {
          return null;
      }

      // --- 2. Annualized REGULAR Income ---
      const monthlyPayroll = calculateSalary(emp, [], reviews);
      
      // Safe extraction of values
      const monthlyGrossTotal = safe(monthlyPayroll.grossTotal);
      const monthlySyndicateShare = safe(monthlyPayroll.syndicateSocialShare);
      
      // Taxable Gross = Gross - Syndicate Share (Employer Share shouldn't be taxed on employee)
      const monthlyGrossTaxable = monthlyGrossTotal - monthlySyndicateShare; 
      const annualRegularGross = monthlyGrossTaxable * monthsWorked;

      // --- 3. Annual VARIABLE Income (Bonuses & Grants) ---
      const annualBonuses = bonuses
        .filter(b => String(b.employeeId) === String(emp.id) && new Date(b.date).getFullYear() === year)
        .reduce((sum, b) => sum + safe(b.grossAmount || b.amount), 0);

      const totalAnnualGross = annualRegularGross + annualBonuses;

      // --- 4. Annual Deductions ---
      const annualInsurance = safe(monthlyPayroll.insuranceEmployeeShare) * monthsWorked;
      
      const annualPayrollStamp = safe(monthlyPayroll.stampDuty) * monthsWorked;
      const annualBonusStamp = bonuses
        .filter(b => String(b.employeeId) === String(emp.id) && new Date(b.date).getFullYear() === year)
        .reduce((sum, b) => sum + safe(b.stampAmount), 0);
      const annualStamp = annualPayrollStamp + annualBonusStamp;

      const annualFellowship = safe(monthlyPayroll.fellowshipFund) * monthsWorked;

      // --- 5. Personal Exemption ---
      // Apply 50% increase if special needs
      const baseExemption = 20000;
      const exemptionLimit = emp.isSpecialNeeds ? (baseExemption * 1.5) : baseExemption;
      
      // Prorate exemption based on months worked
      const personalExemption = exemptionLimit * (monthsWorked / 12);

      // --- 6. Net Taxable Base ---
      const totalExemptions = annualInsurance + annualStamp + annualFellowship + personalExemption;
      
      // Raw Taxable Income
      let rawAnnualTaxableIncome = Math.max(0, totalAnnualGross - totalExemptions);
      
      // LEGAL RULE: Round down to nearest 10 EGP
      const annualTaxableIncome = Math.floor(rawAnnualTaxableIncome / 10) * 10;

      // --- 7. Calculate CORRECT Tax ---
      const correctAnnualTax = calculateTaxFromBrackets(annualTaxableIncome);

      // --- 8. Actual Tax Paid ---
      const projectedPayrollTaxPaid = safe(monthlyPayroll.taxDeduction) * monthsWorked;
      const actualBonusTaxPaid = bonuses
        .filter(b => String(b.employeeId) === String(emp.id) && new Date(b.date).getFullYear() === year)
        .reduce((sum, b) => sum + safe(b.taxAmount), 0);

      const totalTaxPaid = projectedPayrollTaxPaid + actualBonusTaxPaid;

      // --- 9. The Difference ---
      const diff = safe(correctAnnualTax - totalTaxPaid);
      
      // --- 10. Installment Logic (Round UP to nearest 0.01) ---
      let monthlyAdjustment = 0;
      if (diff > 0) {
          monthlyAdjustment = Math.ceil((diff / installmentMonths) * 100) / 100;
      }

      return {
          monthsWorked, startMonthName, 
          annualRegularGross: safe(annualRegularGross), 
          annualBonuses: safe(annualBonuses), 
          totalAnnualGross: safe(totalAnnualGross),
          annualInsurance: safe(annualInsurance), 
          annualStamp: safe(annualStamp), 
          annualFellowship: safe(annualFellowship), 
          personalExemption: safe(personalExemption), 
          totalExemptions: safe(totalExemptions),
          annualTaxableIncome: safe(annualTaxableIncome), 
          correctAnnualTax: safe(correctAnnualTax), 
          totalTaxPaid: safe(totalTaxPaid), 
          diff: safe(diff), 
          monthlyAdjustment: safe(monthlyAdjustment)
      };
  };

  const settlement = selectedEmp ? calculateSettlement(selectedEmp) : null;

  const handleSaveDebt = () => {
      if (!selectedEmp) return;
      
      // Re-calculate to be 100% sure
      const calcs = calculateSettlement(selectedEmp);

      if (!calcs || calcs.diff <= 0.01) { // Ignore extremely small debts
          alert('⚠️ قيمة المديونية صغيرة جداً أو لا توجد مديونية مستحقة.');
          return;
      }

      // Check duplicate
      if (getExistingDebt(selectedEmp.id)) {
          alert('⚠️ هذا الموظف لديه بالفعل مديونية معتمدة وجاري خصمها.');
          return;
      }

      // Use the ROUNDED UP installment
      const installmentAmount = calcs.monthlyAdjustment;
      
      const confirmed = window.confirm(
          `تأكيد اعتماد التسوية:\n` +
          `---------------------\n` +
          `إجمالي الفرق المستحق: ${calcs.diff.toLocaleString()} ج.م\n` +
          `سيتم خصم قسط شهري قدره: ${installmentAmount} ج.م\n` +
          `لمدة 12 شهر.\n\n` +
          `هل أنت متأكد؟ سيظهر الخصم فوراً في استمارة 132.`
