let audioContext = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext || null;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

async function ensureRunningContext() {
  const context = getAudioContext();

  if (!context) {
    return null;
  }

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return null;
    }
  }

  return context.state === "running" ? context : null;
}

function getTonePattern(type) {
  if (type === "arrived") {
    return [
      { frequency: 740, duration: 0.12, gain: 0.18 },
      { frequency: 880, duration: 0.16, gain: 0.22 },
    ];
  }

  if (type === "next") {
    return [
      { frequency: 620, duration: 0.11, gain: 0.14 },
      { frequency: 740, duration: 0.13, gain: 0.18 },
    ];
  }

  return [
    { frequency: 520, duration: 0.1, gain: 0.12 },
  ];
}

export async function primeNotificationAudio() {
  const context = await ensureRunningContext();
  return Boolean(context);
}

export async function playNotificationTone(type = "next") {
  const context = await ensureRunningContext();

  if (!context) {
    return false;
  }

  const pattern = getTonePattern(type);
  let cursor = context.currentTime + 0.02;

  pattern.forEach((tone) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(tone.frequency, cursor);
    gainNode.gain.setValueAtTime(0.0001, cursor);
    gainNode.gain.exponentialRampToValueAtTime(tone.gain, cursor + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      cursor + tone.duration,
    );

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(cursor);
    oscillator.stop(cursor + tone.duration + 0.03);

    cursor += tone.duration + 0.05;
  });

  return true;
}
