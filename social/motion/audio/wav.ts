import { readFileSync, writeFileSync } from "node:fs";

// Sound as numbers: mono Float32 at one sample rate for everything the engine mixes. Reading
// and writing 16-bit PCM WAV is all the file format work there is.

export const RATE = 48000;

/** A 16-bit PCM WAV file (any rate, any channel count) as mono samples at RATE. */
export function readWav(path: string): Float32Array {
  const b = readFileSync(path);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") throw new Error(`${path} is not a WAV file.`);
  let pos = 12;
  let rate = RATE;
  let channels = 1;
  let bits = 16;
  while (pos + 8 <= b.length) {
    const id = b.toString("ascii", pos, pos + 4);
    const size = b.readUInt32LE(pos + 4);
    if (id === "fmt ") {
      channels = b.readUInt16LE(pos + 10);
      rate = b.readUInt32LE(pos + 12);
      bits = b.readUInt16LE(pos + 22);
    } else if (id === "data") {
      if (bits !== 16) throw new Error(`${path}: ${bits}-bit audio; export it as 16-bit PCM.`);
      // Some writers leave the size open (0 or 0xFFFFFFFF) when they stream.
      const end = size === 0 || pos + 8 + size > b.length ? b.length : pos + 8 + size;
      const frames = Math.floor((end - pos - 8) / (2 * channels));
      const mono = new Float32Array(frames);
      for (let i = 0; i < frames; i++) {
        let sum = 0;
        for (let c = 0; c < channels; c++) sum += b.readInt16LE(pos + 8 + (i * channels + c) * 2);
        mono[i] = sum / channels / 32768;
      }
      return resample(mono, rate, RATE);
    }
    pos += 8 + size + (size % 2);
  }
  throw new Error(`${path} has no audio data.`);
}

/** Linear interpolation: plenty for speech going from 22 kHz to 48 kHz. `speed` above 1 also raises the pitch. */
export function resample(x: Float32Array, from: number, to: number, speed = 1): Float32Array {
  const step = (from / to) * speed;
  if (step === 1) return x;
  const out = new Float32Array(Math.floor((x.length - 1) / step));
  for (let i = 0; i < out.length; i++) {
    const p = i * step;
    const k = Math.floor(p);
    out[i] = x[k] + (x[k + 1] - x[k]) * (p - k);
  }
  return out;
}

/** Interleaved stereo, 16-bit, at RATE. */
export function writeWav(path: string, left: Float32Array, right: Float32Array = left) {
  const n = left.length;
  const b = Buffer.alloc(44 + n * 4);
  b.write("RIFF", 0, "ascii");
  b.writeUInt32LE(36 + n * 4, 4);
  b.write("WAVEfmt ", 8, "ascii");
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(2, 22);
  b.writeUInt32LE(RATE, 24);
  b.writeUInt32LE(RATE * 4, 28);
  b.writeUInt16LE(4, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36, "ascii");
  b.writeUInt32LE(n * 4, 40);
  const pcm = (v: number) => Math.round(Math.max(-1, Math.min(1, v)) * 32767);
  for (let i = 0; i < n; i++) {
    b.writeInt16LE(pcm(left[i]), 44 + i * 4);
    b.writeInt16LE(pcm(right[i]), 46 + i * 4);
  }
  writeFileSync(path, b);
}

/** Loudness over time, 0 to 1, one value a video frame: what moves a mouth. */
export function envelope(x: Float32Array, fps: number): number[] {
  const hop = RATE / fps;
  const out: number[] = [];
  let peak = 1e-6;
  for (let f = 0; f * hop < x.length; f++) {
    let sum = 0;
    const from = Math.floor(f * hop);
    const to = Math.min(x.length, Math.floor((f + 1) * hop));
    for (let i = from; i < to; i++) sum += x[i] * x[i];
    const rms = Math.sqrt(sum / Math.max(1, to - from));
    out.push(rms);
    peak = Math.max(peak, rms);
  }
  // A square root opens the mouth on quiet syllables too; two decimals keep the props small.
  return out.map((v) => Math.round(Math.sqrt(v / peak) * 100) / 100);
}
