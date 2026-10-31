/**
 * Nexora Tools — EMI / Loan Calculator Script
 * 100% Client-Side Financial Mathematical Computation
 */

(function () {
  'use strict';

  const loanAmountInput = document.getElementById('emiLoanAmount');
  const interestRateInput = document.getElementById('emiInterestRate');
  const tenureInput = document.getElementById('emiTenure');
  const tenureTypeSelect = document.getElementById('emiTenureType');
  const calcBtn = document.getElementById('calculateEmiBtn');
  const currencySelect = document.getElementById('emiCurrency');

  const resultMonthlyEmi = document.getElementById('resultMonthlyEmi');
  const resultTotalInterest = document.getElementById('resultTotalInterest');
  const resultTotalAmount = document.getElementById('resultTotalAmount');

  const principalBar = document.getElementById('barPrincipal');
  const interestBar = document.getElementById('barInterest');
  const principalPctLabel = document.getElementById('principalPctLabel');
  const interestPctLabel = document.getElementById('interestPctLabel');

  const scheduleTableBody = document.getElementById('amortizationTableBody');
  const scheduleViewToggle = document.getElementById('scheduleViewToggle');

  let currentScheduleData = [];

  if (!loanAmountInput || !calcBtn) return;

  function calculateEMI() {
    const P = parseFloat(loanAmountInput.value);
    const annualRate = parseFloat(interestRateInput.value);
    const tenureVal = parseFloat(tenureInput.value);
    const tenureType = tenureTypeSelect.value;
    const curr = currencySelect.value || '$';

    if (isNaN(P) || P <= 0 || isNaN(annualRate) || annualRate < 0 || isNaN(tenureVal) || tenureVal <= 0) {
      window.showToast('Please enter valid positive numbers for loan calculation.', 'warning');
      return;
    }

    const totalMonths = tenureType === 'years' ? Math.round(tenureVal * 12) : Math.round(tenureVal);
    const monthlyRate = annualRate / (12 * 100);

    let emi = 0;
    let totalPayment = 0;
    let totalInterest = 0;

    if (monthlyRate === 0) {
      // 0% interest edge-case
      emi = P / totalMonths;
      totalPayment = P;
      totalInterest = 0;
    } else {
      // Standard Equated Monthly Installment Formula:
      // EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      emi = (P * monthlyRate * factor) / (factor - 1);
      totalPayment = emi * totalMonths;
      totalInterest = totalPayment - P;
    }

    // Update Result Numbers
    resultMonthlyEmi.textContent = `${curr}${formatNumber(emi.toFixed(2))}`;
    resultTotalInterest.textContent = `${curr}${formatNumber(totalInterest.toFixed(2))}`;
    resultTotalAmount.textContent = `${curr}${formatNumber(totalPayment.toFixed(2))}`;

    // Update Visual Breakdown Bar
    const principalPct = Math.round((P / totalPayment) * 100);
    const interestPct = 100 - principalPct;

    if (principalBar && interestBar) {
      principalBar.style.width = `${principalPct}%`;
      interestBar.style.width = `${interestPct}%`;
      principalPctLabel.textContent = `Principal: ${principalPct}% (${curr}${formatNumber(P.toFixed(0))})`;
      interestPctLabel.textContent = `Interest: ${interestPct}% (${curr}${formatNumber(totalInterest.toFixed(0))})`;
    }

    // Build Amortization Data
    buildAmortizationData(P, monthlyRate, emi, totalMonths, curr);
    renderAmortizationSchedule(curr);
  }

  function buildAmortizationData(principal, monthlyRate, emi, totalMonths, curr) {
    currentScheduleData = [];
    let balance = principal;

    let yearNum = 1;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;
    let yearlyOpening = balance;

    for (let m = 1; m <= totalMonths; m++) {
      const interestForMonth = balance * monthlyRate;
      let principalForMonth = emi - interestForMonth;

      if (m === totalMonths) {
        principalForMonth = balance;
      }

      balance = Math.max(0, balance - principalForMonth);
      yearlyPrincipal += principalForMonth;
      yearlyInterest += interestForMonth;

      if (m % 12 === 0 || m === totalMonths) {
        currentScheduleData.push({
          year: yearNum,
          opening: yearlyOpening,
          principalPaid: yearlyPrincipal,
          interestPaid: yearlyInterest,
          totalPaid: yearlyPrincipal + yearlyInterest,
          closing: balance
        });
        yearNum++;
        yearlyOpening = balance;
        yearlyPrincipal = 0;
        yearlyInterest = 0;
      }
    }
  }

  function renderAmortizationSchedule(curr) {
    if (!scheduleTableBody) return;
    scheduleTableBody.innerHTML = '';

    currentScheduleData.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">Year ${row.year}</td>
        <td>${curr}${formatNumber(row.opening.toFixed(0))}</td>
        <td>${curr}${formatNumber(row.principalPaid.toFixed(0))}</td>
        <td style="color: var(--accent-cyan);">${curr}${formatNumber(row.interestPaid.toFixed(0))}</td>
        <td style="font-weight: 600;">${curr}${formatNumber(row.totalPaid.toFixed(0))}</td>
        <td>${curr}${formatNumber(row.closing.toFixed(0))}</td>
      `;
      scheduleTableBody.appendChild(tr);
    });
  }

  function formatNumber(numStr) {
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  calcBtn.addEventListener('click', calculateEMI);

  [loanAmountInput, interestRateInput, tenureInput, tenureTypeSelect, currencySelect].forEach(elem => {
    elem.addEventListener('change', calculateEMI);
  });

  // Calculate default on load
  calculateEMI();
})();
