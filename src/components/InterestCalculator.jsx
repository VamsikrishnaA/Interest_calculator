import React, { useState } from 'react';
import { differenceInDays } from 'date-fns';

const InterestCalculator = () => {
  const [Principal, setPrincipal] = useState('');
  const [InterestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interestType, setInterestType] = useState('simple');
  const [rateType, setRateType] = useState('monthly');
  const [result, setResult] = useState(null);

  const calculateInterest = () => {
    const principal = parseFloat(Principal);
    const interestRate = parseFloat(InterestRate);

    if (isNaN(principal) || !startDate || !endDate || isNaN(interestRate)) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = differenceInDays(end, start)+1;

    let interest = 0;
    let totalAmount = 0;

    if (rateType === 'monthly') {
      if (interestType === 'simple') {
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
        // Compound Interest with 365-day slab + simple interest for remaining days
        let amount = principal;
        let remainingDays = days;
        let totalInterest = 0;

        while (remainingDays >= 365) {
          const slabInterest = (amount * interestRate * 12) / 100;
          amount += slabInterest;
          totalInterest += slabInterest;
          remainingDays -= 365;
        }

        const dailyRate = interestRate / 30;
        const leftoverInterest = (amount * dailyRate * remainingDays) / 100;
        amount += leftoverInterest;
        totalInterest += leftoverInterest;

        interest = totalInterest;
        totalAmount = amount;
      }
    } else if (rateType === 'daily') {
      if (interestType === 'simple') {
        const dailyRate = interestRate / 30;
        interest = (principal * dailyRate * days) / 100;
        totalAmount = principal + interest;
      } else {
        // Compound Interest with 365-day slab + simple interest for remaining days
        let amount = principal;
        let remainingDays = days;
        let totalInterest = 0;

        while (remainingDays >= 365) {
          const slabInterest = (amount * interestRate * 12) / 100;
          amount += slabInterest;
          totalInterest += slabInterest;
          remainingDays -= 365;
        }

        const dailyRate = interestRate / 30;
        const leftoverInterest = (amount * dailyRate * remainingDays) / 100;
        amount += leftoverInterest;
        totalInterest += leftoverInterest;

        interest = totalInterest;
        totalAmount = amount;
      }
    }

    setResult({
      interest: parseFloat(interest.toFixed(2)),
      total: parseFloat(totalAmount.toFixed(2)),
      days,
    });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Gold Loan Interest Calculator</h2>
      <div className="grid gap-2">
        <input type="number" placeholder="Principal Amount" value={Principal} onChange={(e) => setPrincipal(e.target.value)} className="p-2 border rounded" />
        <input type="number" placeholder="Interest Rate (%)" value={InterestRate} onChange={(e) => setInterestRate(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border rounded" />
        <select value={interestType} onChange={(e) => setInterestType(e.target.value)} className="p-2 border rounded">
          <option value="simple">Simple Interest</option>
          <option value="compound">Compound Interest</option>
        </select>
        <select value={rateType} onChange={(e) => setRateType(e.target.value)} className="p-2 border rounded">
          <option value="monthly">Monthly Rate</option>
          <option value="daily">Daily Rate</option>
        </select>
        <button onClick={calculateInterest} className="p-2 bg-blue-600 text-white rounded">Calculate</button>
      </div>

      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <p><strong>Total Days:</strong> {result.days}</p>
          <p><strong>Interest:</strong> ₹{result.interest}</p>
          <p><strong>Total Amount:</strong> ₹{result.total}</p>
        </div>
      )}
    </div>
  );
};

export default InterestCalculator;