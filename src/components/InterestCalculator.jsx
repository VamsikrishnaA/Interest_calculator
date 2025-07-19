import React, { useState } from 'react'; import dayjs from 'dayjs'; import { saveAs } from 'file-saver'; import html2canvas from 'html2canvas';import BulkEntryCard from './components/BulkEntryCard';

export default function InterestCalculator() { const [principal, setPrincipal] = useState(''); const [rate, setRate] = useState(''); const [startDate, setStartDate] = useState(''); const [endDate, setEndDate] = useState(''); const [result, setResult] = useState(null);

const calculateCompoundMonthlyInterest = () => { let p = parseFloat(principal); const r = parseFloat(rate); // monthly rate const start = dayjs(startDate); const end = dayjs(endDate); const totalDays = end.diff(start, 'day');

let current = start;
let monthsPassed = 0;
let lastCompounded = start;

while (true) {
  const nextMonth = current.add(1, 'month');
  if (nextMonth.date() !== start.date()) {
    // Align to same day if possible
    const alignedNext = nextMonth.date(start.date());
    if (alignedNext.isAfter(end)) break;
    current = alignedNext;
  } else {
    if (nextMonth.isAfter(end)) break;
    current = nextMonth;
  }
  p = p * (1 + r / 100);
  monthsPassed++;

  // Every 12 months, treat as simple interest and compound once
  if (monthsPassed % 12 === 0) {
    const si = p * (r / 100) * 12;
    p += si;
  }
  lastCompounded = current;
}

// Remaining days simple interest
const remainingDays = end.diff(lastCompounded, 'day');
const dailyRate = r / 30; // monthly to daily
const remainingInterest = p * (dailyRate / 100) * remainingDays;
const finalAmount = p + remainingInterest;

setResult({
  interest: finalAmount - parseFloat(principal),
  total: finalAmount,
  months: monthsPassed,
  totalDays
});

};

const exportResult = async () => { const element = document.getElementById('result'); const canvas = await html2canvas(element); canvas.toBlob(blob => { saveAs(blob, 'interest-result.png'); }); };

return ( <div className="max-w-xl mx-auto space-y-4"> <input type="number" placeholder="Principal Amount" className="w-full p-2 rounded bg-gray-800 text-white" value={principal} onChange={e => setPrincipal(e.target.value)} /> <input type="number" placeholder="Monthly Interest Rate (%)" className="w-full p-2 rounded bg-gray-800 text-white" value={rate} onChange={e => setRate(e.target.value)} /> <div className="flex justify-between gap-4"> <div className="flex-1"> <label className="block mb-1">Start Date</label> <input type="date" className="w-full p-2 rounded bg-gray-800 text-white" value={startDate} onChange={e => setStartDate(e.target.value)} /> </div> <div className="flex-1"> <label className="block mb-1">End Date</label> <input type="date" className="w-full p-2 rounded bg-gray-800 text-white" value={endDate} onChange={e => setEndDate(e.target.value)} /> </div> </div> <button
onClick={calculateCompoundMonthlyInterest}
className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded"
> Calculate </button>

{result && (
    <div
      id="result"
      className="bg-gray-800 p-4 rounded shadow-lg space-y-2 mt-4"
    >
      <p>Interest: ₹{result.interest.toFixed(2)}</p>
      <p>Total Amount: ₹{result.total.toFixed(2)}</p>
      <p>Duration: {result.months} months ({result.totalDays} days)</p>
      <button
        onClick={exportResult}
        className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
      >
        Export Result
      </button>
    </div>
  )}
</div>

); }

// package.json (add these dependencies) { "dependencies": { "dayjs": "^1.11.9", "file-saver": "^2.0.5", "html2canvas": "^1.4.1", "react": "^18.2.0", "react-dom": "^18.2.0", "vite": "^4.5.13" }, "devDependencies": { "@vitejs/plugin-react": "^4.1.0" } }

