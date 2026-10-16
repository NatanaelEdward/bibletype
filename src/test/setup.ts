import '@testing-library/jest-dom';

// Mock Web Audio API for tests
class AudioContextMock {
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
    };
  }
}

const globalWindow = window as unknown as {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
};

globalWindow.AudioContext = globalWindow.AudioContext || (AudioContextMock as unknown as typeof AudioContext);
globalWindow.webkitAudioContext = globalWindow.webkitAudioContext || (AudioContextMock as unknown as typeof AudioContext);
