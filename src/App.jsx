// Gold Loan Interest Calculator with Bethal Logic

import React, { useState } from 'react'; import { differenceInDays, parseISO } from 'date-fns';

export default function InterestCalculator() { const [principal, setPrincipal] = useState(''); const [rate, setRate] = useState(''); const [startDate, setStartDate] = useState(''); const [endDate, setEndDate] = useState(''); const [rateType, setRateType] = useState('monthly'); const [compound, setCompound] = useState('no'); const [result, setResult] = useState(null);

const calculateInterest = () => { const p = parseFloat(principal); const r = parseFloat(rate); const days = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;

let interest = 0;

if (compound === 'yes') {
  if (rateType === 'daily') {
    const dailyRate = r / 30;
    if (days <= 365) {
      interest = p * (dailyRate / 100) * days;
    } else {
      const interestFirst = p * (dailyRate / 100) * 365;
      const newPrincipal = p + interestFirst;
      const remainingDays = days - 365;
      const interestAfter = newPrincipal * (dailyRate / 100) * remainingDays;
      interest = interestFirst + interestAfter;
    }
  } else {
    const months = Math.floor(days / 30);
    const extraDays = days % 30;

    if (months <= 12) {
      interest = p * (r / 100) * months;
    } else {
      const interestFirst = p * (r / 100) * 12;
      const

