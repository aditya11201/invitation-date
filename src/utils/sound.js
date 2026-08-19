import { resolveAssetUrl } from './assets.js';

/**
 * Web Audio API synthesizer for romantic sound effects and background ambient music.
 * Works with zero external files, and gracefully attempts to load external audio if available.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.bgMusicAudio = null;
    this.synthMusicInterval = null;
    this.musicStarted = false;
    this.enableSynthesizerFallback = true;
    this.initAudioContext = this.initAudioContext.bind(this);
  }

  initAudioContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        try {
          this.ctx.resume().catch(() => {});
        } catch (e) {
          console.debug('AudioContext resume error', e);
        }
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.debug('AudioContext construction not supported or blocked', e);
      this.ctx = null;
    }
  }

  setMuted(muted, customAudioPath = null, enableSynthesizerFallback = true) {
    this.isMuted = muted;
    this.enableSynthesizerFallback = enableSynthesizerFallback !== false;
    this.initAudioContext();

    if (muted) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic(customAudioPath);
    }
  }

  // Play soft tactile click
  playClick() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.debug('Audio playback error', e);
    }
  }

  // Play soft paper rustle
  playPaperRustle() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.15);
      filter.Q.setValueAtTime(2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.15);
    } catch (e) {
      console.debug('Audio playback error', e);
    }
  }

  // Play soft pop for hearts & button presses
  playPop(pitchMultiplier = 1) {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 520 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.15);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.debug('Audio playback error', e);
    }
  }

  // Play sweet sparkle chime sequence
  playSparkle() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    try {
      const notes = [587.33, 659.25, 880.00, 1046.50, 1318.51]; // D5, E5, A5, C6, E6
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch (e) {
      console.debug('Audio playback error', e);
    }
  }

  // Play romantic fanfare celebration
  playCelebration() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    try {
      const chords = [
        [349.23, 440.00, 523.25, 659.25], // F major 7
        [392.00, 493.88, 587.33, 783.99], // G
        [523.25, 659.25, 783.99, 1046.50] // C maj (high)
      ];

      chords.forEach((chord, chordIdx) => {
        const chordTime = this.ctx.currentTime + chordIdx * 0.22;
        chord.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, chordTime);

          gain.gain.setValueAtTime(0.08, chordTime);
          gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 0.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(chordTime);
          osc.stop(chordTime + 0.8);
        });
      });
    } catch (e) {
      console.debug('Audio playback error', e);
    }
  }

  // Start background romantic music
  startBackgroundMusic(customAudioPath) {
    if (this.musicStarted) return;
    this.musicStarted = true;

    // First try HTML5 audio if path provided
    if (customAudioPath) {
      try {
        const resolvedAudioPath = resolveAssetUrl(customAudioPath);
        if (!this.bgMusicAudio) {
          this.bgMusicAudio = new Audio(resolvedAudioPath);
          this.bgMusicAudio.loop = true;
          this.bgMusicAudio.volume = 0.35;
        }
        const playPromise = this.bgMusicAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Fallback to Web Audio synthesis if file not found or autoplay error
            if (this.enableSynthesizerFallback) {
              this.startAmbientSynth();
            }
          });
          return;
        }
      } catch (err) {
        if (this.enableSynthesizerFallback) {
          this.startAmbientSynth();
        }
        return;
      }
    }

    if (this.enableSynthesizerFallback) {
      this.startAmbientSynth();
    }
  }

  // Soft lush romantic ambient synth chord generator
  startAmbientSynth() {
    if (!this.enableSynthesizerFallback || this.synthMusicInterval || this.isMuted) return;
    this.initAudioContext();
    if (!this.ctx) return;

    const progression = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Amin7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G7
    ];

    let step = 0;
    const playChord = () => {
      if (this.isMuted || !this.ctx) return;
      try {
        const chord = progression[step % progression.length];
        step++;
        const now = this.ctx.currentTime;

        chord.forEach((freq, idx) => {
          const noteTime = now + idx * 0.12;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(0.04, noteTime + 0.6);
          gain.gain.exponentialRampToValueAtTime(0.0005, noteTime + 2.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 3.0);
        });
      } catch (e) {
        console.debug('Synth chord error', e);
      }
    };

    playChord();
    this.synthMusicInterval = setInterval(playChord, 3200);
  }

  stopBackgroundMusic() {
    this.musicStarted = false;
    if (this.bgMusicAudio) {
      try {
        this.bgMusicAudio.pause();
      } catch (e) {}
    }
    if (this.synthMusicInterval) {
      clearInterval(this.synthMusicInterval);
      this.synthMusicInterval = null;
    }
  }
}

export const sound = new SoundEngine();
