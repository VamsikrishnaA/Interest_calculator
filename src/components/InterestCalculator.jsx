import { differenceInDays } from 'date-fns';

const calculateInterest = () => {
  const principal = parseFloat(Principal);
  const interestRate = parseFloat(InterestRate);

  if (isNaN(principal) || !startDate || !endDate || isNaN(interestRate)) return;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = differenceInDays(end, start);

  let interest = 0;
  let totalAmount = 0;

  if (rateType === 'monthly') {
    if (interestType === 'simple') {
      // Simple Interest with custom partial month logic
      const months = Math.floor(days / 30);
      const extraDays = days % 30;
      let adjustedMonths = months;

      if (extraDays > 16) adjustedMonths += 1;
      else if (extraDays >= 6) adjustedMonths += 0.5;

      const dailyRate = interestRate / 30;

      interest =
        (principal * interestRate * adjustedMonths) / 100 +
        (extraDays < 6 ? (principal * dailyRate * extraDays) / 100 : 0);

      totalAmount = principal + interest;
    } else {
      // Compound Interest with 365-day slab logic
      let amount = principal;
      let remainingDays = days;

      const fullYears = Math.floor(remainingDays / 365);
      remainingDays %= 365;

      for (let i = 0; i < fullYears; i++) {
        const yearlyInterest = (amount * interestRate * 12) / 100;
        amount += yearlyInterest;
      }

      const leftoverMonths = Math.floor(remainingDays / 30);
      const extraDays = remainingDays % 30;
      let adjustedMonths = leftoverMonths;

      if (extraDays > 16) adjustedMonths += 1;
      else if (extraDays >= 6) adjustedMonths += 0.5;

      const monthlyInterest = (amount * interestRate * adjustedMonths) / 100;
      const dailyRate = interestRate / 30;
      const extraDaysInterest =
        extraDays < 6 ? (amount * dailyRate * extraDays) / 100 : 0;

      interest = monthlyInterest + extraDaysInterest;
      totalAmount = amount + interest;
    }
  } else if (rateType === 'daily') {
    if (interestType === 'simple') {
      const dailyRate = interestRate / 30;
      interest = (principal * dailyRate * days) / 100;
      totalAmount = principal + interest;
    } else {
      // Compound Interest with 365-day slab logic (daily)
      let amount = principal;
      let remainingDays = days;

      const fullYears = Math.floor(remainingDays / 365);
      remainingDays %= 365;

      for (let i = 0; i < fullYears; i++) {
        const yearlyInterest = (amount * interestRate * 12) / 100;
        amount += yearlyInterest;
      }

      const dailyRate = interestRate / 30;
      interest = (amount * dailyRate * remainingDays) / 100;
      totalAmount = amount + interest;
    }
  }

  setResult({
    interest: parseFloat(interest.toFixed(2)),
    total: parseFloat(totalAmount.toFixed(2)),
    days,
  });
};
