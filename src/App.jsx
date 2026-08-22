import React, { useState, useEffect } from 'react';
import { invitationConfig } from './config/config';
import ThreeScene from './components/ThreeCanvas/ThreeScene';
import Preloader from './components/Preloader/Preloader';
import Navbar from './components/Navbar/Navbar';
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

  const [musicEnabled, setMusicEnabled] = useState(false);
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
  const handleStart = () => {
    setHasEntered(true);
    setMusicEnabled(true);
    sound.setMuted(false, invitationConfig.audio?.backgroundMusic, invitationConfig.audio?.enableSynthesizerFallback);
  };

  // Toggle music on/off
  const handleToggleMusic = () => {
    const nextState = !musicEnabled;
    setMusicEnabled(nextState);
    sound.setMuted(!nextState, invitationConfig.audio?.backgroundMusic, invitationConfig.audio?.enableSynthesizerFallback);
  };

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
      setMusicEnabled(false);
      sound.setMuted(true);
    }, 400);
  };

  return (
    <div className="relative min-h-screen font-sans bg-romantic-50 text-slate-800 overflow-x-hidden selection:bg-pink-200">
      {/* 3D Three.js Floating Love Bubble Scene */}
      <ThreeScene
        isCelebration={acceptedInvitation}
        sceneProgress={scrollProgress}
      />

      {/* Scene 0: 3D Preloader */}
      {!hasEntered && (
        <Preloader
          onStart={handleStart}
          recipientName={invitationConfig.recipientName}
        />
      )}

      {/* Experience Content (Mounted once user enters) */}
      {hasEntered && (
        <>
          {/* Glassmorphic Global Navigation */}
          <Navbar
            recipientName={invitationConfig.recipientName}
            musicEnabled={musicEnabled}
            onToggleMusic={handleToggleMusic}
            scrollProgress={scrollProgress}
          />

          <main className="relative z-10 max-w-5xl mx-auto pb-24">
            {/* Scene 1: Hero Greeting */}
            <Hero
              config={invitationConfig}
              onScrollDown={handleScrollToLetter}
            />

            {/* Scene 2, 3, 4: Envelope, Staged Letter & YES/NO Interaction */}
            <InvitationLetter
              config={invitationConfig}
              onAccept={handleAcceptInvitation}
              isAccepted={acceptedInvitation}
              noClickCount={noClickCount}
              setNoClickCount={setNoClickCount}
              onQuestionReady={(ready) => setIsQuestionLocked(ready)}
            />
          </main>

          {/* Scenes 5–10: Post-envelope journey on one continuous long paper.
              Sits outside <main> so the dark desk runs full-bleed like the reference. */}
          {acceptedInvitation && (
            <LongPaper>
              {/* Scene 5 & 6: YES celebration intro */}
              <CelebrationScene onContinue={handleContinueToDestination} />

              {/* Scene 7: Destination carousel */}
              <LocationPicker
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
          )}
        </>
      )}
    </div>
  );
}
