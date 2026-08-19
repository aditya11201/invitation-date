import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, Check, Heart } from 'lucide-react';
import { sound } from '../../utils/sound';
import { formatLocalDateString, parseLocalDate, isValidLocalDate } from '../../utils/date';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CalendarJourney({
  config,
  selectedDate,
  onSelectDate,
  onConfirmDate,
  selectedPlace,
  isLocked = false,
}) {
  const targetYear = config.calendar?.year || 2026;
  const now = new Date();
  
  // Default to current month of target year (or August default)
  const initialMonth = now.getFullYear() === targetYear ? now.getMonth() : 7;
  const [activeMonth, setActiveMonth] = useState(initialMonth);
  const [tempDate, setTempDate] = useState(selectedDate);

  // Month navigation
  const handlePrevMonth = () => {
    if (isLocked) return;
    sound.playClick();
    setActiveMonth((prev) => Math.max(0, prev - 1));
  };

  const handleNextMonth = () => {
    if (isLocked) return;
    sound.playClick();
    setActiveMonth((prev) => Math.min(11, prev + 1));
  };

  // Generate grid of days for the active month
  const monthData = useMemo(() => {
    const firstDayIndex = new Date(targetYear, activeMonth, 1).getDay();
    const daysInMonth = new Date(targetYear, activeMonth + 1, 0).getDate();
    
    // Normalize today for comparison (midnight timestamp)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Max date from config
    const configuredMaxStr = config.calendar?.maxDate || `${targetYear}-12-31`;
    const maxDateObj = parseLocalDate(configuredMaxStr);
    maxDateObj.setHours(23, 59, 59, 999);

    const days = [];
    // Leading empty slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, isSelectable: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(targetYear, activeMonth, d);
      dateObj.setHours(0, 0, 0, 0);

      // Date is selectable if >= today and <= configured maxDate
      const isPast = dateObj.getTime() < today.getTime();
      const isTooFar = dateObj.getTime() > maxDateObj.getTime();
      const isSelectable = !isPast && !isTooFar;

      // Format ISO string YYYY-MM-DD
      const dateString = `${targetYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      days.push({
        day: d,
        dateString,
        dateObj,
        isSelectable,
        isPast,
      });
    }

    return days;
  }, [targetYear, activeMonth, config.calendar?.maxDate]);

  const handleDateClick = (dayItem) => {
    if (isLocked || !dayItem.isSelectable) return;
    sound.playPop(1.1);
    setTempDate(dayItem.dateString);
    onSelectDate(dayItem.dateString);
  };

  const handleConfirm = () => {
    if (isLocked || !tempDate || !isValidLocalDate(tempDate)) return;
    sound.playCelebration();
    sound.playSparkle();
    onConfirmDate();
  };

  // Format chosen date string nicely for badge using local timezone
  const formattedTempDate = useMemo(() => {
    if (!tempDate || !isValidLocalDate(tempDate)) return null;
    return formatLocalDateString(tempDate, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  }, [tempDate]);

  return (
    <section
      id="calendar-journey-section"
      className="relative min-h-[90vh] py-16 px-4 sm:px-6 flex flex-col items-center justify-center select-none"
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-gradient-to-tr from-pink-300/30 via-lavender-300/30 to-rose-200/30 blur-3xl" />
      </div>

      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto mb-8 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 shadow-sm text-romantic-600 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Step 2: The Date 📅</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 mb-2" style={{ textWrap: 'balance' }}>
          When are you free? 💗
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-medium">
          {isLocked ? 'Date confirmed!' : (config.calendar?.subtitle || `Choose any date in ${targetYear}`)}
        </p>
      </div>

      {/* 3D Calendar Deck Container */}
      <div className="relative w-full max-w-md mx-auto z-10">
        {/* Calendar Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 bg-white/85 backdrop-blur-xl border border-white/90 shadow-2xl transition-all duration-500"
          style={{
            transform: 'perspective(1000px) rotateX(4deg)',
            boxShadow: '0 20px 50px -10px rgba(236, 72, 153, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
          }}
        >
          {/* Month Header & Controls */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              disabled={isLocked || activeMonth === 0}
              aria-label="Previous month"
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all min-h-[44px] min-w-[44px] ${
                isLocked || activeMonth === 0
                  ? 'opacity-30 border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'bg-white hover:bg-romantic-50 border-pink-200 text-slate-700 shadow-sm active:scale-95 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="font-display font-bold text-2xl text-slate-800">
                {MONTH_NAMES[activeMonth]}
              </h3>
              <span className="text-xs font-semibold text-romantic-600 tracking-widest uppercase">
                {targetYear}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              disabled={isLocked || activeMonth === 11}
              aria-label="Next month"
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all min-h-[44px] min-w-[44px] ${
                isLocked || activeMonth === 11
                  ? 'opacity-30 border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'bg-white hover:bg-romantic-50 border-pink-200 text-slate-700 shadow-sm active:scale-95 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {DAYS_OF_WEEK.map((d, i) => (
              <span key={i} className="text-xs font-bold text-slate-400 py-1 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {monthData.map((item, idx) => {
              if (!item.day) {
                return <div key={`empty-${idx}`} className="w-full aspect-square" />;
              }

              const isSelected = tempDate === item.dateString;

              if (item.isPast) {
                // Past Date: Faded glass effect
                return (
                  <div
                    key={item.dateString}
                    className="w-full aspect-square flex items-center justify-center rounded-xl bg-white/20 text-slate-300 text-sm font-medium blur-[0.4px] opacity-40 cursor-not-allowed select-none"
                    title="Past date (unavailable)"
                  >
                    {item.day}
                  </div>
                );
              }

              // Available Future Date
              return (
                <button
                  key={item.dateString}
                  disabled={isLocked}
                  onClick={() => handleDateClick(item)}
                  className={`w-full aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 min-h-[40px] ${
                    isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    isSelected
                      ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-bold shadow-glow-pink scale-110 -translate-y-1 z-10'
                      : 'bg-white/70 hover:bg-pink-50 hover:text-pink-600 text-slate-700 border border-pink-100 shadow-sm active:scale-95'
                  }`}
                >
                  <span>{item.day}</span>
                  {isSelected && <span className="text-[9px] -mt-1">💗</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Selected Date Badge */}
        {formattedTempDate && (
          <div className="mt-6 flex flex-col items-center animate-heartPop">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 shadow-sm text-romantic-700 font-bold text-sm">
              <CalendarIcon className="w-4 h-4 text-pink-500" />
              <span>{formattedTempDate} 💗</span>
            </div>

            {/* Destination + Date Combined Summary */}
            {selectedPlace && (
              <p className="text-xs font-semibold text-slate-500 mt-2">
                Destination: <span className="text-slate-800">{selectedPlace}</span>
              </p>
            )}

            {/* Required Date Confirmation CTA */}
            {isLocked ? (
              <div className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-base shadow-sm">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>Date Locked: {formattedTempDate} 💗</span>
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                className="group mt-4 inline-flex items-center gap-2.5 px-9 py-4 rounded-full font-bold text-white text-base bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-glow-pink hover:shadow-glow-lavender hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer min-h-[44px]"
              >
                <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
                <span>This date 💗</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
