import React, { useState } from 'react'; import { differenceInDays } from 'date-fns';

const InterestCalculator = () => { const [Principal, setPrincipal] = useState(''); const [InterestRate, setInterestRate] = useState(''); const [startDate, setStartDate] = useState(''); const [endDate, setEndDate] = useState(''); const [rateType, setRateType] = useState('monthly'); const [interestType, setInterestType] = useState('simple'); const [result, setResult] = useState(null);

const calculateInterest = () => { const principal = parseFloat(Principal); const interestRate = parseFloat(InterestRate);

if (isNaN(principal) || !startDate || !endDate || isNaN(interestRate)) return;

const days = differenceInDays(new Date(endDate), new Date(startDate));
const monthlyRate = interestRate;
const dailyRate = monthlyRate / 30;
let interest = 0;
let totalAmount = 0;

if (rateType === 'monthly') {
  let months = Math.floor(days / 30);
  const remDays = days % 30;

  if (remDays >= 16) months += 1;
  else if (remDays >= 6) months += 0.5;

  if (interestType === 'simple') {
    interest = (principal * monthlyRate * months) / 100;
    totalAmount = principal + interest;
  } else {
    let amount = principal;
    const fullYears = Math.floor(days / 365);
    let rem = days % 365;

    for (let i = 0; i < fullYears; i++) {
      const ci = (amount * monthlyRate * 12) / 100;
      amount += ci;
    }

    let remMonths = Math.floor(rem / 30);
    const extraDays = rem % 30;

    if (extraDays >= 16) remMonths += 1;
    else if (extraDays >= 6) remMonths += 0.5;

    const ciRem = (amount * monthlyRate * remMonths) / 100;
    interest = ciRem;
    totalAmount = amount + interest;
  }
} else {
  if (interestType === 'simple') {
    interest = (principal * dailyRate * days) / 100;
    totalAmount = principal + interest;
  } else {
    let amount = principal;
    const fullYears = Math.floor(days / 365);
    const remDays = days % 365;

    for (let i = 0; i < fullYears; i++) {
      const ci = (amount * dailyRate * 365) / 100;
      amount += ci;
    }

    const ciRem = (amount * dailyRate * remDays) / 100;
    interest = ciRem;
    totalAmount = amount + interest;
  }
}

setResult({
  interest: parseFloat(interest.toFixed(2)),
  total: parseFloat(totalAmount.toFixed(2)),
  days,
});

};

return ( <div className="p-4"> <h2 className="text-xl font-bold mb-4">Interest Calculator</h2> <div className="grid gap-2"> <input type="number" placeholder="Principal" value={Principal} onChange={(e) => setPrincipal(e.target.value)} className="input" /> <input type="number" placeholder="Interest Rate" value={InterestRate} onChange={(e) => setInterestRate(e.target.value)} className="input" /> <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" /> <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" /> <select value={rateType} onChange={(e) => setRateType(e.target.value)} className="input"> <option value="monthly">Monthly</option> <option value="daily">Daily</option> </select> <select value={interestType} onChange={(e) => setInterestType(e.target.value)} className="input"> <option value="simple">Simple</option> <option value="compound">Compound</option> </select> <button onClick={calculateInterest} className="btn">Calculate</button> </div> {result && ( <div className="mt-4 p-2 border rounded"> <p><strong>Interest:</strong> ₹{result.interest}</p> <p><strong>Total Amount:</strong> ₹{result.total}</p> <p><strong>Days:</strong> {result.days}</p> </div> )} </div> ); };

export default InterestCalculator;

