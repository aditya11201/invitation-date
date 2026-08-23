import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Heart } from 'lucide-react';
import { sound } from '../../utils/sound';
import { formatLocalDateString, parseLocalDate, isValidLocalDate } from '../../utils/date';

export default function CalendarJourney({
  config,
  selectedDate,
  onSelectDate,
  onConfirmDate,
  selectedPlace,
  isLocked = false,
}) {
  const ui = config.ui.calendarSection;
  const MONTH_NAMES = ui.months;
  const DAYS_OF_WEEK = ui.days;
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
      className="relative py-10 border-b border-burgundy-200/60 space-y-8"
    >
      {/* Section Header */}
      <div className="text-center space-y-2 relative z-10">
        <span className="text-xs font-mono tracking-widest text-burgundy-600 uppercase font-bold">{ui.eyebrow}</span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-burgundy-900">{ui.heading}</h2>
        <p className="text-xs sm:text-sm text-ink/70">
          {isLocked ? ui.confirmedHint : config.calendar.subtitle}
        </p>
      </div>

      {/* 3D Calendar Deck Container */}
      <div className="relative w-full max-w-md mx-auto z-10">
        {/* Calendar Card */}
        <div
          className="rounded-xl bg-white/70 backdrop-blur-sm border border-burgundy-200/70 shadow-inner p-5 sm:p-6 relative"
        >
          {/* Month Header & Controls */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              disabled={isLocked || activeMonth === 0}
              aria-label="Previous month"
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all min-h-[44px] min-w-[44px] ${
                isLocked || activeMonth === 0
                  ? 'opacity-30 border-burgundy-100 text-burgundy-200 cursor-not-allowed'
                  : 'bg-white hover:bg-burgundy-50 border-burgundy-200 text-burgundy-800 shadow-sm active:scale-95 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="font-serif font-bold text-xl text-burgundy-900">
                {MONTH_NAMES[activeMonth]}
              </h3>
              <span className="text-xs font-mono tracking-widest text-burgundy-600 uppercase">
                {targetYear}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              disabled={isLocked || activeMonth === 11}
              aria-label="Next month"
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all min-h-[44px] min-w-[44px] ${
                isLocked || activeMonth === 11
                  ? 'opacity-30 border-burgundy-100 text-burgundy-200 cursor-not-allowed'
                  : 'bg-white hover:bg-burgundy-50 border-burgundy-200 text-burgundy-800 shadow-sm active:scale-95 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {DAYS_OF_WEEK.map((d, i) => (
              <span key={i} className="text-[10px] font-mono font-bold text-burgundy-600 uppercase py-1">
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
                    className="w-full aspect-square flex items-center justify-center rounded-xl text-ink/25 text-sm font-medium opacity-60 cursor-not-allowed select-none"
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
                  className={`relative circled-option w-full aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 min-h-[40px] ${
                    isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    isSelected
                      ? 'selected bg-burgundy-50 text-burgundy-900 font-bold scale-105 z-10'
                      : 'bg-white/60 hover:bg-burgundy-50/80 text-ink border border-burgundy-200/70 active:scale-95'
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
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-burgundy-50 border border-burgundy-200 shadow-sm text-burgundy-800 font-bold text-sm">
              <CalendarIcon className="w-4 h-4 text-burgundy-600" />
              <span>{formattedTempDate} 💗</span>
            </div>

            {/* Destination + Date Combined Summary */}
            {selectedPlace && (
              <p className="text-xs font-semibold text-ink/50 mt-2">
                {ui.destinationLabel} <span className="text-ink">{selectedPlace}</span>
              </p>
            )}

            {/* Required Date Confirmation CTA */}
            {isLocked ? (
              <div className="mt-4 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-burgundy-50 border border-burgundy-200 text-burgundy-800 font-bold text-base shadow-sm">
                <Check className="w-5 h-5 text-burgundy-600" />
                <span>{`${ui.lockedPrefix} ${formattedTempDate} 💗`}</span>
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                className="group mt-4 inline-flex items-center gap-2 px-8 py-3.5 bg-burgundy-900 hover:bg-burgundy-800 text-amber-100 font-bold text-sm rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition duration-200 border border-gold-300 cursor-pointer min-h-[44px]"
              >
                <Heart className="w-4 h-4 fill-rose-400 text-rose-400 group-hover:scale-125 transition-transform" />
                <span>{ui.chooseButton}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
