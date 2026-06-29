#!/usr/bin/env python3
"""Synthesize a fun, quirky, upbeat background track for the GPay Money Wrapped video.

Pure-Python (no numpy/ffmpeg). Writes a 16-bit stereo WAV to public/audio/wrapped-theme.wav.
Style: bouncy I-V-vi-IV pop with a plucky lead, walking bass, kick+hat groove and coin chimes.
"""
import math
import struct
import wave
import os

SR = 44100
BPM = 124.0
BEAT = 60.0 / BPM          # seconds per beat
BAR = BEAT * 4             # 4/4
TOTAL_BARS = 32            # ~ 62s (covers the 60s video)
DUR = BAR * TOTAL_BARS

N = int(SR * DUR)
buf = [0.0] * N            # mono mix; stereo-ised on write

# ---- note helpers -----------------------------------------------------------
def midi(n):
    return 440.0 * (2 ** ((n - 69) / 12.0))

# note names -> midi
NAMES = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
def note(name, octave):
    return 12 * (octave + 1) + NAMES[name]

def adsr(i, total, a, d, s, r):
    # i, total in samples; a,d,r in samples; s sustain level 0..1
    if i < a:
        return i / max(1, a)
    if i < a + d:
        return 1.0 - (1.0 - s) * (i - a) / max(1, d)
    if i < total - r:
        return s
    return s * max(0.0, (total - i) / max(1, r))

def add(start_t, dur_t, freq, amp, kind="lead", pan=0.5):
    start = int(start_t * SR)
    total = int(dur_t * SR)
    a = int(0.005 * SR)
    if kind == "lead":
        dpar, spar, rpar = int(0.06 * SR), 0.35, int(0.10 * SR)
    elif kind == "bass":
        dpar, spar, rpar = int(0.04 * SR), 0.8, int(0.06 * SR)
    elif kind == "pad":
        a = int(0.04 * SR); dpar, spar, rpar = int(0.1 * SR), 0.7, int(0.25 * SR)
    elif kind == "chime":
        a = int(0.002 * SR); dpar, spar, rpar = int(0.02 * SR), 0.0, int(0.4 * SR)
    else:
        dpar, spar, rpar = int(0.05 * SR), 0.5, int(0.08 * SR)
    w = 2 * math.pi * freq / SR
    for i in range(total):
        idx = start + i
        if idx >= N:
            break
        env = adsr(i, total, a, dpar, spar, rpar)
        ph = w * i
        if kind == "lead":
            # soft square-ish: blend of sine + odd harmonics
            s = 0.6 * math.sin(ph) + 0.25 * math.sin(3 * ph) + 0.12 * math.sin(5 * ph)
        elif kind == "bass":
            s = 0.7 * math.sin(ph) + 0.3 * math.sin(2 * ph)
        elif kind == "pad":
            s = math.sin(ph) + 0.5 * math.sin(2 * ph) + 0.3 * math.sin(ph * 1.005)
        elif kind == "chime":
            s = math.sin(ph) + 0.6 * math.sin(2.01 * ph) + 0.4 * math.sin(3.0 * ph)
        else:
            s = math.sin(ph)
        buf[idx] += env * amp * s

# percussion
def kick(start_t, amp=0.9):
    start = int(start_t * SR)
    total = int(0.18 * SR)
    for i in range(total):
        idx = start + i
        if idx >= N:
            break
        t = i / SR
        f = 120 * math.exp(-t * 28) + 45
        env = math.exp(-t * 16)
        buf[idx] += amp * env * math.sin(2 * math.pi * f * t)

_seed = 1234567
def _rnd():
    global _seed
    _seed = (1103515245 * _seed + 12345) & 0x7FFFFFFF
    return _seed / 0x7FFFFFFF * 2 - 1

def hat(start_t, amp=0.22, dur=0.04):
    start = int(start_t * SR)
    total = int(dur * SR)
    last = 0.0
    for i in range(total):
        idx = start + i
        if idx >= N:
            break
        env = math.exp(-i / SR * 60)
        n = _rnd()
        hp = n - last  # crude high-pass
        last = n
        buf[idx] += amp * env * hp

# ---- arrangement ------------------------------------------------------------
# I-V-vi-IV in C major: C  G  Am  F  (one bar each, repeating)
prog = [
    ("C", [note("C", 3), note("E", 3), note("G", 3)]),
    ("G", [note("G", 2), note("B", 2), note("D", 3)]),
    ("A", [note("A", 2), note("C", 3), note("E", 3)]),
    ("F", [note("F", 2), note("A", 2), note("C", 3)]),
]

# pentatonic-ish melody offsets (in semitones from chord root, upper octave)
mel_patterns = [
    [0, 7, 12, 7, 4, 7, 12, 16],
    [0, 4, 7, 12, 7, 4, 0, 7],
    [12, 7, 4, 0, 4, 7, 12, 19],
    [0, 12, 7, 12, 16, 12, 7, 4],
]

for bar in range(TOTAL_BARS):
    t0 = bar * BAR
    chord_name, chord_notes = prog[bar % 4]
    root = chord_notes[0]

    # intro: bars 0-1 lighter (no drums), build energy
    drums = bar >= 2
    full_lead = bar >= 4

    # --- bass: root on every beat, octave bounce on the "and" ---
    for b in range(4):
        bt = t0 + b * BEAT
        add(bt, BEAT * 0.55, midi(root), 0.34, "bass")
        add(bt + BEAT * 0.5, BEAT * 0.35, midi(root + 12), 0.22, "bass")

    # --- pad chord stab on beat 1 & 3 ---
    if bar >= 2:
        for cn in chord_notes:
            add(t0, BAR * 0.9, midi(cn + 12), 0.06, "pad")

    # --- drums ---
    if drums:
        for b in range(4):
            kick(t0 + b * BEAT, 0.85 if b in (0, 2) else 0.5)
        for h in range(8):
            hat(t0 + h * BEAT * 0.5, 0.18 if h % 2 else 0.10)

    # --- lead melody (eighth notes) ---
    if full_lead:
        pat = mel_patterns[bar % 4]
        for j, off in enumerate(pat):
            nt = t0 + j * BEAT * 0.5
            add(nt, BEAT * 0.48, midi(root + 24 + off), 0.16, "lead")

    # --- coin chime accents on phrase starts ---
    if bar % 4 == 0 and bar >= 4:
        add(t0, 0.5, midi(note("C", 6)), 0.10, "chime")
        add(t0 + 0.12, 0.5, midi(note("E", 6)), 0.08, "chime")
        add(t0 + 0.24, 0.6, midi(note("G", 6)), 0.07, "chime")

# little ascending coin run at the very start (the "cha-ching" intro)
for k, n in enumerate([note("C", 5), note("E", 5), note("G", 5), note("C", 6)]):
    add(0.02 + k * 0.10, 0.45, midi(n), 0.12, "chime")

# ---- normalise + soft clip --------------------------------------------------
peak = max(1e-6, max(abs(x) for x in buf))
gain = 0.82 / peak
for i in range(N):
    x = buf[i] * gain
    # gentle tanh soft-clip
    x = math.tanh(x * 1.1)
    buf[i] = x

# tiny fade in/out
fade = int(0.25 * SR)
for i in range(fade):
    buf[i] *= i / fade
    buf[N - 1 - i] *= i / fade

# ---- write stereo wav (slight stereo widening) ------------------------------
out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
out_dir = os.path.abspath(out_dir)
os.makedirs(out_dir, exist_ok=True)
path = os.path.join(out_dir, "wrapped-theme.wav")

frames = bytearray()
for i in range(N):
    l = buf[i]
    r = buf[i - 220] if i >= 220 else buf[i]  # ~5ms haas widening
    li = max(-32767, min(32767, int(l * 32767)))
    ri = max(-32767, min(32767, int(r * 32767)))
    frames += struct.pack("<hh", li, ri)

with wave.open(path, "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(bytes(frames))

print(f"wrote {path} ({len(frames)/1e6:.1f} MB, {DUR:.1f}s, {TOTAL_BARS} bars @ {BPM:.0f} BPM)")
