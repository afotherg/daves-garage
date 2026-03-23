export function createImpactAudio() {
  let context = null;
  let master = null;
  let enabled = false;

  function ensureContext() {
    if (!context) {
      context = new window.AudioContext();
      master = context.createGain();
      master.gain.value = 0.18;
      master.connect(context.destination);
    }

    if (context.state === 'suspended') {
      context.resume();
    }

    enabled = true;
  }

  function playImpact({ strength, acousticProfile }) {
    if (!enabled || !context || strength < 0.08) {
      return;
    }

    const now = context.currentTime;
    const gain = context.createGain();
    const tone = context.createOscillator();
    const click = context.createBiquadFilter();
    const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.08, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    const noiseSource = context.createBufferSource();
    const noiseGain = context.createGain();

    for (let index = 0; index < noiseData.length; index += 1) {
      noiseData[index] = (Math.random() * 2 - 1) * Math.exp((-index / noiseData.length) * 8);
    }

    const level = Math.min(1, strength * 0.32);
    const baseFrequency = acousticProfile.baseFrequency + strength * 90;
    const decay = acousticProfile.decay + strength * 0.018;

    tone.type = 'triangle';
    tone.frequency.setValueAtTime(baseFrequency, now);
    tone.frequency.exponentialRampToValueAtTime(Math.max(180, baseFrequency * 0.58), now + decay);

    click.type = 'bandpass';
    click.frequency.value = 1800;
    click.Q.value = 0.8;

    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

    noiseGain.gain.setValueAtTime(level * acousticProfile.noise, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + decay * 0.7);

    tone.connect(gain);
    gain.connect(master);

    noiseSource.buffer = noiseBuffer;
    noiseSource.connect(click);
    click.connect(noiseGain);
    noiseGain.connect(master);

    tone.start(now);
    tone.stop(now + decay);
    noiseSource.start(now);
    noiseSource.stop(now + decay * 0.8);
  }

  return {
    enable() {
      ensureContext();
    },
    isEnabled() {
      return enabled;
    },
    playImpact,
  };
}
