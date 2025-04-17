import React, { useState } from "react";
import dayjs from "dayjs";
import "./App.css";

function App() {
  const [principal, setPrincipal] = useState(0);
  const [rate, setRate] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interest, setInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [duration, setDuration] = useState("");
  const [mode, setMode] = useState("daily");
  const [isCompound, setIsCompound] = useState(false);

const handleCalculate = () => { if (!startDate || !endDate || principal <= 0 || rate <= 0) return;

const start = dayjs(startDate);
const end = dayjs(endDate);
const days = end.diff(start, "day")+1;

let calculatedInterest = 0;
let total = 0;
let months = 0;

if (mode === "daily") {
  const dailyRate = rate / 30;

  if (isCompound) {
    let tempPrincipal = principal;
    let interestAccrued = 0;
    if (days > 365) {
      const firstYearInterest = (tempPrincipal * dailyRate * 365) / 100;
      interestAccrued += firstYearInterest;
      tempPrincipal += firstYearInterest;
      const remainingInterest = (tempPrincipal * dailyRate * (days - 365)) / 100;
      interestAccrued += remainingInterest;
    } else {
      interestAccrued = (tempPrincipal * dailyRate * days) / 100;
    }
    calculatedInterest = interestAccrued;
    total = principal + interestAccrued;
  } else {
    calculatedInterest = (principal * dailyRate * days) / 100;
    total = principal + calculatedInterest;
  }

  setDuration(`${days} Days`);
} else {
  const totalDays = end.diff(start, "day");
  const fullMonths = Math.floor(totalDays / 30);
  const remainingDays = totalDays % 30;

  if (remainingDays >= 6 && remainingDays <= 16) {
    months = fullMonths + 0.5;
  } else if (remainingDays > 16) {
    months = fullMonths + 1;
  } else if (remainingDays < 6) {
    months = fullMonths;
    const simpleInterest = (principal * rate * remainingDays) / (30 * 100);
    calculatedInterest = (principal * rate * months) / 100 + simpleInterest;
    total = principal + calculatedInterest;
    setInterest(calculatedInterest.toFixed(2));
    setTotalAmount(total.toFixed(2));
    setDuration(`${months} Months ${remainingDays} Days`);
    return;
  }

  if (isCompound) {
    let tempPrincipal = principal;
    let interestAccrued = 0;

    if (months > 12) {
      const firstYearInterest = (tempPrincipal * rate * 12) / 100;
      interestAccrued += firstYearInterest;
      tempPrincipal += firstYearInterest;
      const remainingInterest = (tempPrincipal * rate * (months - 12)) / 100;
      interestAccrued += remainingInterest;
    } else {
      interestAccrued = (tempPrincipal * rate * months) / 100;
    }

    calculatedInterest = interestAccrued;
    total = principal + calculatedInterest;
  } else {
    calculatedInterest = (principal * rate * months) / 100;
    total = principal + calculatedInterest;
  }

  setDuration(`${months} Months`);
}

setInterest(calculatedInterest.toFixed(2));
setTotalAmount(total.toFixed(2));

};

const clearZero = (e, setter) => { if (e.target.value === "0") { e.target.value = ""; } };

const resetIfEmpty = (e, setter) => { if (e.target.value === "") { setter(0); e.target.value = "0"; } };

return ( <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6 text-gray-900"> <h1 className="text-3xl font-bold text-center mb-6">Gold Loan Interest Calculator</h1> <div className="max-w-md mx-auto space-y-4 bg-white p-6 rounded-2xl shadow-xl"> <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} onFocus={(e) => clearZero(e, setPrincipal)} onBlur={(e) => resetIfEmpty(e, setPrincipal)} placeholder="Enter Principal" className="w-full p-2 border rounded text-black" /> <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} onFocus={(e) => clearZero(e, setRate)} onBlur={(e) => resetIfEmpty(e, setRate)} placeholder="Monthly Interest Rate %" className="w-full p-2 border rounded text-black" /> <label className="block text-sm font-medium">Start Date</label> <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" className="w-full p-2 border rounded text-black" /> <label className="block text-sm font-medium">End Date</label> <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" className="w-full p-2 border rounded text-black" />

<div className="flex justify-between">
      <label>
        <input
          type="radio"
          value="daily"
          checked={mode === "daily"}
          onChange={() => setMode("daily")}
        />
        Daily
      </label>
      <label>
        <input
          type="radio"
          value="monthly"
          checked={mode === "monthly"}
          onChange={() => setMode("monthly")}
        />
        Monthly
      </label>
    </div>

    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={isCompound}
        onChange={() => setIsCompound(!isCompound)}
      />
      <span>Compound Interest</span>
    </label>

    <button
      onClick={handleCalculate}
      className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
    >
      Calculate
    </button>

    <div className="text-center">
      <p>Interest: ₹{interest}</p>
      <p>Total Amount: ₹{totalAmount}</p>
      <p>Duration: {duration}</p>
    </div>
  </div>
</div>

); }

export default App;
