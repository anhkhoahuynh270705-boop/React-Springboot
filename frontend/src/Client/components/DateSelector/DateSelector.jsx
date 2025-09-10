import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import './DateSelector.css';

const DateSelector = ({ selectedDate, onDateChange }) => {
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayName = dayNames[date.getDay()];
      
      dates.push({
        date: date,
        day: date.getDate(),
        month: date.getMonth() + 1,
        dayName: dayName,
        fullDate: date.toISOString().split('T')[0] 
      });
    }
    
    return dates;
  };

  const dates = generateDates();
  const [currentDate, setCurrentDate] = useState(selectedDate || dates[0].fullDate);

  const handleDateClick = (dateObj) => {
    setCurrentDate(dateObj.fullDate);
    if (onDateChange) {
      onDateChange(dateObj.fullDate);
    }
  };

  return (
    <div className="date-selector">     
      <div className="date-list">  
        {dates.map((dateObj, index) => (
          <button
             key={index}
             className={`date-item ${currentDate === dateObj.fullDate ? 'active' : ''}`}
             onClick={() => handleDateClick(dateObj)}
           >
             <div className="date-month-day">{dateObj.day}/{dateObj.month}</div>
             <div className="date-day">{dateObj.dayName}</div>  
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateSelector;
