import React, { useState } from "react";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

const InterestCalculator = () => {
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    interest: "",
    startDate: "",
    endDate: "",
    type: "monthly",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = (e) => {
    if (e.target.value === "0") {
      setForm({ ...form, [e.target.name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { amount, interest, startDate, endDate, type } = form;
    if (!amount || !interest || !startDate || !endDate) return;

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const duration =
      type === "monthly"
        ? end.diff(start, "month", true)
        : end.diff(start, "day") + 1;

    const monthlyRate = parseFloat(interest);
    const dailyRate = monthlyRate / 30;
    const rateToUse = type === "monthly" ? monthlyRate : dailyRate;

    const interestAmount = (
      (amount * rateToUse * duration) /
      100
    ).toFixed(2);

    const totalAmount = (parseFloat(amount) + parseFloat(interestAmount)).toFixed(2);

    const loan = {
      ...form,
      interestAmount,
      totalAmount,
      duration: duration.toFixed(2),
      id: Date.now(),
    };

    setLoans([loan, ...loans]);

    setForm({
      amount: "",
      interest: "",
      startDate: "",
      endDate: "",
      type: "monthly",
    });
  };

  const handleDelete = (id) => {
    setLoans(loans.filter((loan) => loan.id !== id));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Loan Interest Report", 10, 10);

    loans.forEach((loan, index) => {
      const y = 20 + index * 10;
      doc.text(
        `${index + 1}) ₹${loan.amount} | ${loan.type} | ${loan.startDate} to ${loan.endDate} | Interest: ₹${loan.interestAmount} | Total: ₹${loan.totalAmount}`,
        10,
        y
      );
    });

    doc.save("interest-report.pdf");
  };

  return (
    <div className="p-4 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Interest Calculator</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900 p-4 rounded-xl shadow-md"
      >
        <input
          type="number"
          name="amount"
          placeholder="Principal Amount"
          value={form.amount}
          onChange={handleChange}
          onFocus={handleFocus}
          className="p-2 rounded bg-gray-800 focus:outline-none"
        />
        <input
          type="number"
          name="interest"
          placeholder="Interest Rate (%)"
          value={form.interest}
          onChange={handleChange}
          onFocus={handleFocus}
          className="p-2 rounded bg-gray-800 focus:outline-none"
        />
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800"
        />
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800"
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 col-span-full"
        >
          <option value="monthly">Monthly</option>
          <option value="daily">Daily</option>
        </select>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 transition col-span-full py-2 rounded-xl mt-2"
        >
          Calculate
        </button>
      </form>

      {loans.length > 0 && (
        <>
          <div className="flex justify-end mt-4">
            <button
              onClick={exportToPDF}
              className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg"
            >
              Export PDF
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="bg-gray-800 p-4 rounded-lg shadow-lg flex justify-between items-center"
              >
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">Amount:</span> ₹{loan.amount}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Type:</span> {loan.type}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Duration:</span> {loan.duration}{" "}
                    {loan.type === "monthly" ? "months" : "days"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Interest:</span> ₹{loan.interestAmount}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Total:</span> ₹{loan.totalAmount}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(loan.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InterestCalculator;
