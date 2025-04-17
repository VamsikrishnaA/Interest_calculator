// Gold Loan Interest Calculator with Bethal Logic (Monthly and Daily)

import React, { useState } from 'react'; import { differenceInDays, parseISO } from 'date-fns';

export default function InterestCalculator() { const [principal, setPrincipal] = useState(''); const [rate, setRate] = useState(''); const [startDate, setStartDate] = useState(''); const [endDate, setEndDate] = useState(''); const [rateType, setRateType] = useState('monthly'); const [compound, setCompound] = useState('no'); const [result, setResult] = useState(null);

const calculateInterest = () => { const p = parseFloat(principal); const r = parseFloat(rate); const days = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;

let interest = 0;

if (rateType === 'daily') {
  const dailyRate = r / 30;
  if (compound === 'yes') {
    if (days <= 365) {
      interest = p * (dailyRate / 100) * days;
    } else {
      const interestFirstYear = p * (dailyRate / 100) * 365;
      const newPrincipal = p + interestFirstYear;
      const remainingDays = days - 365;
      const interestAfterYear = newPrincipal * (dailyRate / 100) * remainingDays;
      interest = interestFirstYear + interestAfterYear;
    }
  } else {
    interest = p * (dailyRate / 100) * days;
  }
} else {
  // Monthly logic
  const months = Math.floor(days / 30);
  const extraDays = days % 30;
  let adjustedMonths = months;

  if (extraDays >= 5 && extraDays < 17) {
    adjustedMonths += 0.5;
  } else if (extraDays >= 17) {
    adjustedMonths += 1;
  } else if (extraDays > 0 && extraDays < 5) {
    interest += p * (r / 100 / 30) * extraDays;
  }

  if (compound === 'yes') {
    if (adjustedMonths <= 12) {
      interest += p * (r / 100) * adjustedMonths;
    } else {
      const interestFirstYear = p * (r / 100) * 12;
      const newPrincipal = p + interestFirstYear;
      const remainingMonths = adjustedMonths - 12;
      const interestAfterYear = newPrincipal * (r / 100) * remainingMonths;
      interest += interestFirstYear + interestAfterYear;
    }
  } else {
    interest += p * (r / 100) * adjustedMonths;
  }
}

setResult(interest.toFixed(2));

};

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
      <h1 className="text-xl font-bold mb-4 text-center">Interest Calculator</h1>

      <div className="flex flex-col space-y-4">
        <input
          type="number"
          placeholder="Principal Amount"
          className="p-3 border rounded-md"
        />

        <input
          type="text"
          onFocus={(e) => (e.target.type = 'date')}
          onBlur={(e) => (e.target.type = 'text')}
          placeholder="Start Date"
          className="p-3 border rounded-md"
        />

        <input
          type="text"
          onFocus={(e) => (e.target.type = 'date')}
          onBlur={(e) => (e.target.type = 'text')}
          placeholder="End Date"
          className="p-3 border rounded-md"
        />

        <input
          type="number"
          placeholder="Interest Rate"
          className="p-3 border rounded-md"
        />

        <select className="p-3 border rounded-md">
          <option value="monthly">Monthly</option>
          <option value="daily">Daily</option>
        </select>

        <select className="p-3 border rounded-md">
          <option value="no">Simple Interest</option>
          <option value="yes">Compound Interest</option>
        </select>

        <button className="bg-blue-600 text-white p-3 rounded-md">
          Calculate
        </button>
      </div>
    </div>
  </div>
); }

