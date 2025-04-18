// components/BulkEntryCard.js
import React, { useState } from 'react';
import { differenceInDays } from 'date-fns';

const BulkEntryCard = ({ entry, index, onUpdate, onDelete }) => {
  const [localData, setLocalData] = useState(entry);
  const [result, setResult] = useState(null);

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onUpdate(index, updated);
  };

  const calculate = () => {
    const principal = parseFloat(localData.principal);
    const rate = parseFloat(localData.rate);

    if (isNaN(principal) || isNaN(rate) || !localData.startDate || !localData.endDate) return;

    const days = differenceInDays(new Date(localData.endDate), new Date(localData.startDate));
    const months = Math.floor(days / 30);
    const dailyRate = rate / 30;

    let interest = 0;

    if (localData.interestType === 'simple') {
      interest =
        (principal *
          (localData.rateType === 'monthly' ? rate : dailyRate) *
          (localData.rateType === 'monthly' ? months : days)) /
        100;
    } else {
      // Placeholder for compound logic
    }

    const total = principal + interest;

    const calculatedResult = {
      interest: interest.toFixed(2),
      total: total.toFixed(2),
      days,
    };

    setResult(calculatedResult);
  };

  return (
    <div className="bg-zinc-800 p-4 rounded-xl space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Principal"
          className="bg-zinc-900 p-2 rounded-md text-white"
          value={localData.principal}
          onChange={(e) => handleChange('principal', e.target.value)}
        />
        <input
          type="number"
          placeholder="Rate"
          className="bg-zinc-900 p-2 rounded-md text-white"
          value={localData.rate}
          onChange={(e) => handleChange('rate', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          className="bg-zinc-900 p-2 rounded-md text-white"
          value={localData.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />
        <input
          type="date"
          className="bg-zinc-900 p-2 rounded-md text-white"
          value={localData.endDate}
          onChange={(e) => handleChange('endDate', e.target.value)}
        />
      </div>

      <div className="flex justify-between">
        <button onClick={onDelete} className="text-sm text-red-400">
          Delete
        </button>
        <button onClick={calculate} className="text-sm text-teal-400">
          Calculate
        </button>
      </div>

      {result && (
        <div className="text-sm text-white space-y-1 mt-2 border-t border-zinc-700 pt-2">
          <div>Interest: ₹{result.interest}</div>
          <div>Total: ₹{result.total}</div>
          <div>Days: {result.days}</div>
        </div>
      )}
    </div>
  );
};

export default BulkEntryCard;
