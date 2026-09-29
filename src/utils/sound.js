// ponytail: all web audio disabled per request; call sites kept so sound can be restored by reviving SoundEngine.
export const sound = {
  setMuted() {},
  startBackgroundMusic() {},
  startAmbientSynth() {},
  stopBackgroundMusic() {},
  playClick() {},
  playPaperRustle() {},
  playPop() {},
  playSparkle() {},
  playCelebration() {},
};
