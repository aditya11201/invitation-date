import React, { useState, useEffect } from 'react';
import { invitationConfig } from './config/config';
import ThreeScene from './components/ThreeCanvas/ThreeScene';
import Preloader from './components/Preloader/Preloader';
import Hero from './components/Hero/Hero';
import InvitationLetter from './components/InvitationLetter/InvitationLetter';
import CelebrationScene from './components/CelebrationScene/CelebrationScene';
import LocationPicker from './components/LocationPicker/LocationPicker';
import CalendarJourney from './components/CalendarJourney/CalendarJourney';
import GifReveal from './components/GifReveal/GifReveal';
import DateTicket from './components/DateTicket/DateTicket';
import LongPaper from './components/LongPaper/LongPaper';
import { sound } from './utils/sound';

export default function App() {
  // Application State
  const [hasEntered, setHasEntered] = useState(false);
  const [acceptedInvitation, setAcceptedInvitation] = useState(false);
  const [isQuestionLocked, setIsQuestionLocked] = useState(false);
  const [noClickCount, setNoClickCount] = useState(0);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeConfirmed, setPlaceConfirmed] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [dateConfirmed, setDateConfirmed] = useState(false);

  const [viewTicket, setViewTicket] = useState(false);

  // Envelope → paper handoff: rect of the 3D letter at open-complete, and
  // whether the fading preloader is still mounted over the live content.
  const [handoffRect, setHandoffRect] = useState(null);
  const [preloaderMounted, setPreloaderMounted] = useState(true);

  const [scrollProgress, setScrollProgress] = useState(0);

  // PRD Scroll Lock: lock scrolling only once the question is fully revealed, unlock on YES, clean up on unmount/reset
  useEffect(() => {
    if (isQuestionLocked && !acceptedInvitation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isQuestionLocked, acceptedInvitation]);

  // Track scroll progress for global journey progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enter from preloader
  const handleAudioUnlock = () => {
    sound.setMuted(false, invitationConfig.audio?.backgroundMusic, invitationConfig.audio?.enableSynthesizerFallback);
  };

  // Preloader hands off: mount content under the fading preloader and FLIP
  // the paper sheet from the letter's on-screen rect to full size.
  const handleHandoffStart = (rect) => {
    setHandoffRect(rect && Number.isFinite(rect.left) ? rect : null);
    setHasEntered(true);
  };

  const handleFadeDone = () => setPreloaderMounted(false);

  // Scroll smoothly to letter section
  const handleScrollToLetter = () => {
    const el = document.getElementById('invitation-letter-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Accept Yes: unlocks scroll and moves forward
  const handleAcceptInvitation = () => {
    setIsQuestionLocked(false);
    document.body.style.overflow = '';
    setAcceptedInvitation(true);

    // Smooth scroll down slightly to celebration
    setTimeout(() => {
      window.scrollBy({ top: 350, behavior: 'smooth' });
    }, 300);
  };

  // Proceed from celebration to Destination Picker
  const handleContinueToDestination = () => {
    const el = document.getElementById('destination-picker-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Confirm Place & scroll to Calendar Journey
  const handleConfirmPlace = () => {
    setPlaceConfirmed(true);
    setTimeout(() => {
      const el = document.getElementById('calendar-journey-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  // Confirm Date & scroll to GIF Surprise
  const handleConfirmDate = () => {
    setDateConfirmed(true);
    setTimeout(() => {
      const el = document.getElementById('gif-reveal-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  // Proceed to Final Ticket
  const handleProceedToTicket = () => {
    setViewTicket(true);
    setTimeout(() => {
      const el = document.getElementById('date-ticket-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  // Reset to initial state
  const handleReset = () => {
    setIsQuestionLocked(false);
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setHasEntered(false);
      setAcceptedInvitation(false);
      setIsQuestionLocked(false);
      setNoClickCount(0);
      setSelectedPlace(null);
      setPlaceConfirmed(false);
      setSelectedDate(null);
      setDateConfirmed(false);
      setViewTicket(false);
      sound.setMuted(true);
    }, 400);
  };

  return (
    <div className="relative min-h-screen font-sans bg-romantic-50 text-slate-800 overflow-x-hidden selection:bg-pink-200">
      {/* 3D Three.js Floating Love Bubble Scene */}
      {hasEntered && (
        <ThreeScene isCelebration={acceptedInvitation} sceneProgress={scrollProgress} />
      )}

      {/* Scene 0: 3D Preloader (stays mounted while fading over the content) */}
      {(!hasEntered || preloaderMounted) && (
        <Preloader
          onAudioUnlock={handleAudioUnlock}
          preloaderConfig={invitationConfig.preloader}
          recipientName={invitationConfig.recipientName}
          senderName={invitationConfig.senderName}
          year={invitationConfig.calendar.year}
          heroContent={{
            badge: invitationConfig.hero?.badge,
            greeting: invitationConfig.hero?.greeting,
            subtitle: invitationConfig.hero?.subtitle,
            scrollPrompt: invitationConfig.hero?.scrollPrompt,
          }}
          onLetterRect={() => {}}
          onHandoffStart={handleHandoffStart}
          onFadeDone={handleFadeDone}
        />
      )}

      {/* Experience Content (Mounted once user enters) */}
      {hasEntered && (
        <>
          {/* Scenes 1–10 on one continuous long paper.
              Sits outside <main> so the dark desk runs full-bleed like the reference. */}
          <LongPaper handoffRect={handoffRect}>
            {/* Scene 1: Hero Greeting (paper cover) */}
            <Hero
              config={invitationConfig}
              onScrollDown={handleScrollToLetter}
            />

            {/* Scene 2, 3, 4: Letter & YES/NO Interaction */}
            <InvitationLetter
              config={invitationConfig}
              onAccept={handleAcceptInvitation}
              isAccepted={acceptedInvitation}
              noClickCount={noClickCount}
              setNoClickCount={setNoClickCount}
              onQuestionReady={(ready) => setIsQuestionLocked(ready)}
            />

            {/* Scene 5 & 6: YES celebration intro */}
            <CelebrationScene ui={invitationConfig.ui} onContinue={handleContinueToDestination} />

            {/* Scene 7: Destination carousel */}
            <LocationPicker
              config={invitationConfig}
              places={invitationConfig.places}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              onConfirmPlace={handleConfirmPlace}
              isConfirmed={placeConfirmed}
            />

            {/* Scene 8: Calendar journey */}
            {placeConfirmed && (
              <CalendarJourney
                config={invitationConfig}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onConfirmDate={handleConfirmDate}
                selectedPlace={selectedPlace}
                isLocked={dateConfirmed}
              />
            )}

            {/* Scene 9: GIF surprise reveal */}
            {dateConfirmed && (
              <GifReveal
                config={invitationConfig}
                selectedPlace={selectedPlace}
                selectedDate={selectedDate}
                onProceedToTicket={handleProceedToTicket}
              />
            )}

            {/* Scene 10: Final date ticket */}
            {viewTicket && (
              <DateTicket
                config={invitationConfig}
                selectedPlace={selectedPlace}
                selectedDate={selectedDate}
                onReset={handleReset}
              />
            )}
          </LongPaper>
        </>
      )}
    </div>
  );
}
