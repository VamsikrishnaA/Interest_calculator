import React, { useState } from 'react';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState(null);

  const calculateInterest = () => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const totalDays = end.diff(start, 'day');
    const monthlyRate = parseFloat(rate);

    let interest = 0;
    let months = Math.floor(totalDays / 30);
    let remainingDays = totalDays % 30;

    if (remainingDays >= 16) months += 1;
    else if (remainingDays >= 6) months += 0.5;

    interest = principal * (monthlyRate / 100) * months;
    const total = parseFloat(principal) + interest;

    setResult({ interest, total, months, totalDays });
  };

  const exportResult = async () => {
    const element = document.getElementById('result');
    const canvas = await html2canvas(element);
    canvas.toBlob(blob => {
      saveAs(blob, 'interest-result.png');
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <input
        type="number"
        placeholder="Principal Amount"
        className="w-full p-2 rounded bg-gray-800 text-white"
        value={principal}
        onChange={e => setPrincipal(e.target.value)}
      />
      <input
        type="number"
        placeholder="Monthly Interest Rate (%)"
        className="w-full p-2 rounded bg-gray-800 text-white"
        value={rate}
        onChange={e => setRate(e.target.value)}
      />
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <label className="block mb-1">Start Date</label>
          <input
            type="date"
            className="w-full p-2 rounded bg-gray-800 text-white"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1">End Date</label>
          <input
            type="date"
            className="w-full p-2 rounded bg-gray-800 text-white"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <button
        onClick={calculateInterest}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded"
      >
        Calculate
      </button>

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
  );
}
