import React, { useState, useRef } from 'react';
import {
  HeartIcon,
  DownloadIcon,
  CalendarIcon,
  ArrowCounterClockwiseIcon,
  FilePdfIcon,
  ArrowSquareOutIcon,
  WhatsappLogoIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';
import { exportTicketAsPng, exportTicketAsPdf } from '../../utils/exportTicket';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../../utils/calendar';
import { generateWhatsAppUrl } from '../../utils/whatsapp';
import { sound } from '../../utils/sound';
import { formatLocalDateString } from '../../utils/date.js';
import { SurpriseVisual } from '../PlacePreviews/SurpriseVisual';

export default function DateTicket({
  config,
  selectedPlace,
  selectedDate,
  onReset,
}) {
  const ticketRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null); // 'png' | 'pdf' | null
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Format the date using local timezone
  const formattedDate = formatLocalDateString(selectedDate, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Compact date for the postmark stamp
  const postmarkDate = formatLocalDateString(selectedDate, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();

  // Parallax tilt on mouse move (reduced amplitude, PRD-required)
  const handleMouseMove = (e) => {
    if (!ticketRef.current) return;
    const rect = ticketRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 6, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleWhatsApp = () => {
    sound.playClick();
    const url = generateWhatsAppUrl(config, { selectedPlace, selectedDate });
    window.open(url, '_blank');
  };

  const handleSavePng = async () => {
    sound.playSparkle();
    setIsExporting(true);
    setExportError(null);
    try {
      const ok = await exportTicketAsPng(ticketRef.current, `Date-with-${config.recipientName || 'Love'}.png`);
      if (!ok) setExportError('png');
    } catch {
      setExportError('png');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleSavePdf = async () => {
    sound.playSparkle();
    setIsExporting(true);
    setExportError(null);
    try {
      const ok = await exportTicketAsPdf(ticketRef.current, `Date-with-${config.recipientName || 'Love'}.pdf`);
      if (!ok) setExportError('pdf');
    } catch {
      setExportError('pdf');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleGoogleCalendar = () => {
    sound.playClick();
    const url = generateGoogleCalendarUrl({
      recipientName: config.recipientName,
      selectedPlace,
      selectedDate,
    });
    window.open(url, '_blank');
    setShowCalendarMenu(false);
  };

  const handleIcsDownload = () => {
    sound.playSparkle();
    downloadIcsFile({
      recipientName: config.recipientName,
      senderName: config.senderName,
      selectedPlace,
      selectedDate,
    });
    setShowCalendarMenu(false);
  };

  return (
    <section
      id="date-ticket-section"
      className="relative py-10 flex flex-col items-center text-center space-y-8"
    >
      {/* Header */}
      <div className="text-center max-w-lg mx-auto relative z-10">
        <p className="font-handwritingPaper text-xl text-burgundy-600 mb-1">for the record</p>
        <span className="text-xs font-mono tracking-widest text-burgundy-600 uppercase font-bold">THE KEEPSAKE</span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-burgundy-900 mb-1" style={{ textWrap: 'balance' }}>
          Our Official Date Pass
        </h2>
        <p className="text-ink/70 text-sm sm:text-base font-serif italic">
          A small keepsake for the day we chose together.
        </p>
      </div>

      {/* 3D Ticket Card Container */}
      <div
        className="relative w-full max-w-lg perspective-[1200px] z-20"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ticket Element for Display and PNG/PDF Export */}
        <div
          id="date-ticket-card"
          ref={ticketRef}
          className="relative rounded-2xl bg-gradient-to-r from-burgundy-900 to-burgundy-800 text-amber-100 p-6 sm:p-8 shadow-2xl border-2 border-gold-500/40 overflow-hidden text-left transition-transform duration-200 ease-out"
          style={{
            transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Postmark confirmation stamp */}
          <div className="absolute top-4 right-3 sm:top-6 sm:right-6 z-10 rotate-6 rounded-full border-2 border-dashed border-gold-500/50 px-3 py-1.5 text-center">
            <span className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-300">
              <CheckCircleIcon size={12} weight="fill" aria-hidden="true" />
              Confirmed
            </span>
            {postmarkDate && (
              <span className="block text-[9px] font-semibold tracking-[0.1em] text-amber-200/80 mt-0.5 tabular-nums">
                {postmarkDate}
              </span>
            )}
          </div>

          {/* Ticket Header — wax seal echo */}
          <div className="flex items-center gap-3 border-b border-gold-500/30 pb-5 pr-24 sm:pr-28">
            <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-500/30 -rotate-6 flex items-center justify-center flex-shrink-0">
              <HeartIcon size={20} weight="fill" className="text-gold-300" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/80 block">
                Admit Two
              </span>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-white tracking-tight leading-snug">
                Romantic Date Pass
              </h3>
            </div>
          </div>

          {/* Ticket Body — stationery ledger + polaroid thumbnail */}
          <div className="py-6 flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="flex flex-col flex-grow min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-gold-500/20 py-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200/80">Date With</span>
                <p className="font-serif font-bold text-lg text-white">
                  {config.recipientName || 'You'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-gold-500/20 py-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200/80">From</span>
                <p className="font-serif font-bold text-lg text-white">
                  {config.senderName || 'Me'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-gold-500/20 py-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200/80">Destination</span>
                <p className="font-sans font-semibold text-base sm:text-lg text-gold-300 sm:text-right">
                  {selectedPlace || 'Somewhere Special'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200/80">Date &amp; Schedule</span>
                <div className="sm:text-right">
                  <p className="font-sans font-semibold text-white text-sm sm:text-base">
                    {formattedDate || 'To be scheduled'}
                  </p>
                  <span className="text-[11px] text-amber-200/70 font-medium">All-Day Romantic Experience</span>
                </div>
              </div>
            </div>

            {/* Small Surprise Thumbnail — polaroid tucked into the paper */}
            <div className="flex-shrink-0 self-center sm:self-start w-24 sm:w-28 bg-white border border-gold-500/30 p-1.5 rotate-3 shadow-md">
              <SurpriseVisual
                gifSrc={config.surprise?.gif}
                title={config.surprise?.title}
              />
            </div>
          </div>

          {/* Ticket Footer — perforation rule and sign-off */}
          <div className="pt-4 border-t border-dashed border-gold-500/30 flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold tracking-[0.18em] text-amber-200/70 uppercase">
              For • {(config.recipientName || 'You').toUpperCase()} • Only
            </span>
            <span className="font-handwritingPaper text-lg text-gold-300">see you there</span>
            <div className="flex gap-1 h-5 items-center" aria-hidden="true">
              <div className="w-1 h-full bg-amber-200/80"></div>
              <div className="w-2 h-full bg-amber-200/80"></div>
              <div className="w-0.5 h-full bg-amber-200/80"></div>
              <div className="w-1.5 h-full bg-amber-200/80"></div>
              <div className="w-1 h-full bg-amber-200/80"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="relative z-30 w-full max-w-lg flex flex-col gap-3">
        {/* 1. Primary: WhatsApp Deep Link */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold text-amber-100 text-base bg-burgundy-900 hover:bg-burgundy-800 border border-gold-300 shadow-lg active:scale-[0.96] transition-all duration-300 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-romantic-50"
        >
          <WhatsappLogoIcon size={20} weight="fill" className="text-amber-100" aria-hidden="true" />
          <span className="tracking-wide">Send to WhatsApp</span>
        </button>

        {/* 2. Secondary Row: Save Ticket & Add to Calendar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Save Ticket CTA & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowExportMenu(!showExportMenu);
                setShowCalendarMenu(false);
              }}
              disabled={isExporting}
              aria-busy={isExporting}
              aria-expanded={showExportMenu}
              aria-controls="date-ticket-export-menu"
              aria-haspopup="menu"
              className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-full font-semibold text-burgundy-800 bg-white hover:bg-burgundy-50 border border-burgundy-200 shadow-sm active:scale-[0.96] transition-all duration-200 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-romantic-50 ${
                isExporting ? 'opacity-60 cursor-wait' : ''
              }`}
            >
              <DownloadIcon size={16} weight="regular" className="text-burgundy-600" aria-hidden="true" />
              <span>{isExporting ? 'Exporting…' : 'Save Ticket'}</span>
            </button>

            {/* Export failure — inline retry message */}
            {exportError && !isExporting && (
              <div
                role="alert"
                className="mt-2 flex items-center justify-between gap-2 rounded-md border border-burgundy-200 bg-burgundy-50 px-3 py-1.5"
              >
                <span className="text-xs font-semibold text-burgundy-800">
                  Couldn't save the ticket.
                </span>
                <button
                  type="button"
                  onClick={exportError === 'pdf' ? handleSavePdf : handleSavePng}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 text-xs font-bold uppercase tracking-wider text-burgundy-800 underline underline-offset-4 decoration-burgundy-200 hover:text-burgundy-900 hover:decoration-burgundy-400 transition-colors cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-romantic-50"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Export Menu Dropdown */}
            {showExportMenu && (
              <div
                id="date-ticket-export-menu"
                role="menu"
                aria-label="Save ticket options"
                className="absolute left-0 right-0 bottom-full mb-2 bg-paper rounded-lg border border-burgundy-200/70 shadow-lg p-2 z-40 animate-heartPop"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSavePng}
                  disabled={isExporting}
                  aria-disabled={isExporting}
                  className="w-full text-left px-4 py-2.5 rounded-md hover:bg-burgundy-50 disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-burgundy-900 flex items-center justify-between cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-50"
                >
                  <span className="flex items-center gap-2">
                    <DownloadIcon size={16} weight="regular" className="text-burgundy-400" aria-hidden="true" />
                    <span>Save as Image (PNG)</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-burgundy-100 text-burgundy-800 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSavePdf}
                  disabled={isExporting}
                  aria-disabled={isExporting}
                  className="w-full text-left px-4 py-2.5 rounded-md hover:bg-burgundy-50 disabled:hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-burgundy-900 flex items-center gap-2 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-50"
                >
                  <FilePdfIcon size={16} weight="regular" className="text-burgundy-400" aria-hidden="true" />
                  <span>Export as PDF Document</span>
                </button>
              </div>
            )}
          </div>

          {/* Add to Calendar CTA & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowCalendarMenu(!showCalendarMenu);
                setShowExportMenu(false);
              }}
              aria-expanded={showCalendarMenu}
              aria-controls="date-ticket-calendar-menu"
              aria-haspopup="menu"
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-full font-semibold text-burgundy-800 bg-white hover:bg-burgundy-50 border border-burgundy-200 shadow-sm active:scale-[0.96] transition-all duration-200 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-romantic-50"
            >
              <CalendarIcon size={16} weight="regular" className="text-burgundy-600" aria-hidden="true" />
              <span>Add to Calendar</span>
            </button>

            {/* Calendar Menu Dropdown */}
            {showCalendarMenu && (
              <div
                id="date-ticket-calendar-menu"
                role="menu"
                aria-label="Add to calendar options"
                className="absolute left-0 right-0 bottom-full mb-2 bg-paper rounded-lg border border-burgundy-200/70 shadow-lg p-2 z-40 animate-heartPop"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleGoogleCalendar}
                  className="w-full text-left px-4 py-2.5 rounded-md hover:bg-burgundy-50 text-sm font-semibold text-burgundy-900 flex items-center justify-between cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-50"
                >
                  <span>Google Calendar</span>
                  <ArrowSquareOutIcon size={16} weight="regular" className="text-burgundy-400" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleIcsDownload}
                  className="w-full text-left px-4 py-2.5 rounded-md hover:bg-burgundy-50 text-sm font-semibold text-burgundy-900 flex items-center justify-between cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-50"
                >
                  <span>Apple / Outlook (.ICS)</span>
                  <DownloadIcon size={16} weight="regular" className="text-burgundy-400" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Reset & Replay Journey Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onReset();
          }}
          className="mt-2 text-xs font-semibold text-burgundy-600 hover:text-burgundy-800 underline underline-offset-4 decoration-burgundy-200 transition-colors flex items-center justify-center gap-1.5 py-2 cursor-pointer min-h-[44px] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-romantic-50"
        >
          <ArrowCounterClockwiseIcon size={14} weight="regular" aria-hidden="true" />
          <span>Replay Our Journey From The Start</span>
        </button>
      </div>
    </section>
  );
}
