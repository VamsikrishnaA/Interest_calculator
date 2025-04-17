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

return ( <div className="p-4 max-w-md mx-auto space-y-4"> <h1 className="text-xl font-bold">Interest Generator</h1>

<input
    type="number"
    placeholder="Principal Amount"
    value={principal}
    onChange={(e) => setPrincipal(e.target.value)}
    className="w-full p-2 border rounded"
  />

  <input
    type="number"
    placeholder="Interest Rate (Monthly)"
    value={rate}
    onChange={(e) => setRate(e.target.value)}
    className="w-full p-2 border rounded"
  />

  <select
    value={rateType}
    onChange={(e) => setRateType(e.target.value)}
    className="w-full p-2 border rounded"
  >
    <option value="monthly">Monthly</option>
    <option value="daily">Daily</option>
  </select>

  <select
    value={compound}
    onChange={(e) => setCompound(e.target.value)}
    className="w-full p-2 border rounded"
  >
    <option value="no">Simple Interest</option>
    <option value="yes">Compound After 12M/365D</option>
  </select>

  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    className="w-full p-2 border rounded"
  />

  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    className="w-full p-2 border rounded"
  />

  <button onClick={calculateInterest} className="w-full bg-blue-500 text-white p-2 rounded">
    Calculate
  </button>

  {result && (
    <div className="p-2 bg-green-100 rounded text-center">
      Interest: ₹{result}
    </div>
  )}
</div>

); }
