#!/usr/bin/env python3
"""Synthesize a catchy, upbeat, anthemic background track for the GPay Money Wrapped video.

Pure-Python (no numpy/ffmpeg). Writes a 16-bit stereo WAV to public/audio/wrapped-theme.wav.
Style: festival EDM-pop in A-minor (vi-IV-I-V). Through-composed so it never feels like a
4-bar loop: intro -> build -> drop 1 -> breakdown -> re-build -> bigger drop 2, with an
8-bar non-repeating supersaw hook, melodic variation, sidechain pump, claps, risers & fills.
"""
import math
import struct
import wave
import os

SR = 44100
BPM = 128.0
BEAT = 60.0 / BPM          # seconds per beat
BAR = BEAT * 4             # 4/4
TOTAL_BARS = 36            # ~67.5s (covers the 60s video + a clean tail)
DUR = BAR * TOTAL_BARS

N = int(SR * DUR)
buf = [0.0] * N            # mono mix; stereo-ised on write

# ---- note helpers -----------------------------------------------------------
def midi(n):
    return 440.0 * (2 ** ((n - 69) / 12.0))

NAMES = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
def note(name, octave):
    return 12 * (octave + 1) + NAMES[name]

def adsr(i, total, a, d, s, r):
    if i < a:
        return i / max(1, a)
    if i < a + d:
        return 1.0 - (1.0 - s) * (i - a) / max(1, d)
    if i < total - r:
        return s
    return s * max(0.0, (total - i) / max(1, r))

# sidechain-style ducking synced to the four-on-the-floor kick — the "pump"
# that makes the track breathe and feel danceable.
def pump(t):
    p = (t % BEAT) / BEAT
    return 0.32 + 0.68 * (p ** 0.55)

def add(start_t, dur_t, freq, amp, kind="lead", sidechain=False):
    start = int(start_t * SR)
    total = int(dur_t * SR)
    a = int(0.005 * SR)
    if kind == "lead":          # supersaw topline
        dpar, spar, rpar = int(0.05 * SR), 0.55, int(0.10 * SR)
    elif kind == "pluck":       # short, plucky arp
        a = int(0.002 * SR); dpar, spar, rpar = int(0.05 * SR), 0.0, int(0.07 * SR)
    elif kind == "soft":        # clean sine lead for the breakdown
        a = int(0.02 * SR); dpar, spar, rpar = int(0.08 * SR), 0.6, int(0.30 * SR)
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
        if sidechain:
            env *= pump(idx / SR)
        ph = w * i
        if kind == "lead":
            # band-limited "supersaw": detuned sine partials (continuous, so no
            # clicks) with harmonics capped well below Nyquist (no aliasing).
            # Slight unison detune gives the wide, anthemic shimmer.
            s = (
                0.50 * math.sin(ph)
                + 0.30 * math.sin(ph * 1.006)   # detuned unison -> width
                + 0.20 * math.sin(2 * ph)
                + 0.12 * math.sin(3 * ph * 0.997)
                + 0.07 * math.sin(4 * ph)
            )
        elif kind == "pluck":
            s = 0.6 * math.sin(ph) + 0.3 * math.sin(2 * ph) + 0.12 * math.sin(3 * ph)
        elif kind == "soft":
            s = math.sin(ph) + 0.18 * math.sin(2 * ph)
        elif kind == "bass":
            s = 0.7 * math.sin(ph) + 0.3 * math.sin(2 * ph)
        elif kind == "pad":
            s = math.sin(ph) + 0.5 * math.sin(2 * ph) + 0.3 * math.sin(ph * 1.005)
        elif kind == "chime":
            s = math.sin(ph) + 0.6 * math.sin(2.01 * ph) + 0.4 * math.sin(3.0 * ph)
        else:
            s = math.sin(ph)
        buf[idx] += env * amp * s

# ---- percussion -------------------------------------------------------------
def kick(start_t, amp=0.95):
    start = int(start_t * SR)
    total = int(0.20 * SR)
    for i in range(total):
        idx = start + i
        if idx >= N:
            break
        t = i / SR
        f = 135 * math.exp(-t * 30) + 48
        env = math.exp(-t * 15)
        buf[idx] += amp * env * math.tanh(1.5 * math.sin(2 * math.pi * f * t))

_seed = 1234567
def _rnd():
    global _seed
    _seed = (1103515245 * _seed + 12345) & 0x7FFFFFFF
    return _seed / 0x7FFFFFFF * 2 - 1

def hat(start_t, amp=0.20, dur=0.04):
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

def clap(start_t, amp=0.45):
    # filtered noise burst with a couple of quick repeats -> backbeat "clap"
    start = int(start_t * SR)
    total = int(0.16 * SR)
    last = 0.0
    for i in range(total):
        idx = start + i
        if idx >= N:
            break
        t = i / SR
        burst = 1.0 if (t < 0.012 or 0.012 < t < 0.022 or 0.024 < t < 0.034) else 0.0
        env = burst + 0.6 * math.exp(-t * 28)
        n = _rnd()
        hp = n - last
        last = n
        buf[idx] += amp * env * hp

def riser(start_t, dur_t, amp=0.30):
    # rising filtered-noise + pitch sweep -> the chills-inducing build into a drop
    start = int(start_t * SR)
    total = int(dur_t * SR)
    last = 0.0
    for i in range(total):
        idx = start + i
        if idx >= N:
            break
        p = i / total
        env = (p ** 2) * amp
        n = _rnd()
        hp = 0.7 * (n - last) * (0.3 + 0.7 * p)
        last = n
        f = midi(note("A", 4)) * (1.0 + 1.5 * p)
        tone = 0.5 * math.sin(2 * math.pi * f * (i / SR))
        buf[idx] += env * (hp + tone)

def fill(bar_start):
    # accelerating clap/snare roll across the last beat -> transition into a section
    t0 = bar_start + 3 * BEAT
    hits = 7
    for k in range(hits):
        t = t0 + (k / hits) * BEAT
        clap(t, 0.22 + 0.035 * k)

# ---- arrangement ------------------------------------------------------------
# vi-IV-I-V in C major (A-minor feel): Am  F  C  G  -> the anthemic "epic" loop
prog = [
    ("A", [note("A", 2), note("C", 3), note("E", 3)]),
    ("F", [note("F", 2), note("A", 2), note("C", 3)]),
    ("C", [note("C", 3), note("E", 3), note("G", 3)]),
    ("G", [note("G", 2), note("B", 2), note("D", 3)]),
]

def nm(*pairs):
    return [note(n, o) for (n, o) in pairs]

# An 8-bar, non-repeating topline hook (C-major pentatonic so it sings over
# every chord). Eighth notes; develops + climbs so the drop never feels looped.
HOOK8 = [
    nm(("A",4),("A",4),("C",5),("D",5),("E",5),("D",5),("C",5),("A",4)),  # Am
    nm(("G",4),("G",4),("A",4),("C",5),("D",5),("C",5),("A",4),("G",4)),  # F
    nm(("E",5),("E",5),("D",5),("C",5),("D",5),("E",5),("G",5),("E",5)),  # C
    nm(("D",5),("D",5),("E",5),("G",5),("A",5),("G",5),("E",5),("D",5)),  # G
    nm(("A",4),("C",5),("E",5),("A",5),("G",5),("E",5),("C",5),("E",5)),  # Am (develops)
    nm(("A",4),("C",5),("D",5),("E",5),("G",5),("E",5),("D",5),("C",5)),  # F
    nm(("G",5),("G",5),("E",5),("G",5),("A",5),("G",5),("E",5),("D",5)),  # C
    nm(("E",5),("G",5),("A",5),("C",6),("A",5),("G",5),("E",5),("D",5)),  # G (peaks)
]

# plucky arp variants so the build sections don't repeat either
ARP_VARIANTS = [
    [0, 7, 12, 19, 12, 7, 12, 7],
    [0, 12, 7, 12, 16, 12, 7, 0],
    [7, 12, 16, 19, 16, 12, 7, 12],
]

# sparse, emotional breakdown motif (one phrase per bar)
BREAK_MOTIF = [
    [(note("E", 5), 0.0, 1.5), (note("C", 5), 2.0, 1.5)],
    [(note("D", 5), 0.0, 1.5), (note("A", 4), 2.0, 1.5)],
    [(note("E", 5), 0.0, 1.0), (note("G", 5), 1.0, 2.0)],
    [(note("A", 5), 0.0, 2.0), (note("G", 5), 2.0, 1.5)],
]

def section(bar):
    if bar < 2:   return "intro"
    if bar < 4:   return "build1"
    if bar < 8:   return "verse"
    if bar < 16:  return "drop1"
    if bar < 20:  return "break"
    if bar < 24:  return "build2"
    return "drop2"

for bar in range(TOTAL_BARS):
    t0 = bar * BAR
    chord_name, chord_notes = prog[bar % 4]
    root = chord_notes[0]
    sec = section(bar)

    # --- bass ---
    if sec == "intro":
        pass  # atmosphere only
    elif sec == "break":
        # half-time, soft — gives contrast so the return hits fresh
        add(t0, BEAT * 1.6, midi(root), 0.22, "bass", sidechain=True)
        add(t0 + 2 * BEAT, BEAT * 1.6, midi(root), 0.22, "bass", sidechain=True)
    else:
        for b in range(4):
            bt = t0 + b * BEAT
            add(bt, BEAT * 0.5, midi(root), 0.36, "bass", sidechain=True)
            add(bt + BEAT * 0.5, BEAT * 0.4, midi(root + 12), 0.20, "bass", sidechain=True)

    # --- pad bed ---
    if sec in ("intro", "break"):
        for cn in chord_notes:
            add(t0, BAR * 0.97, midi(cn + 12), 0.09, "pad")
    elif sec != "build1":
        for cn in chord_notes:
            add(t0, BAR * 0.95, midi(cn + 12), 0.07, "pad", sidechain=True)

    # --- drums ---
    drop = sec in ("drop1", "drop2")
    if sec in ("build1",):
        for b in (0, 2):
            kick(t0 + b * BEAT, 0.6)
        for h in range(8):
            hat(t0 + h * BEAT * 0.5, 0.10)
    elif sec == "verse":
        for b in range(4):
            kick(t0 + b * BEAT, 0.75)
        for h in range(8):
            hat(t0 + h * BEAT * 0.5, 0.18 if h % 2 else 0.10)
    elif sec == "break":
        kick(t0, 0.6)                      # heartbeat kick on 1 only
        for h in range(4):
            hat(t0 + h * BEAT, 0.08)
    elif sec == "build2":
        for b in range(4):
            kick(t0 + b * BEAT, 0.8)
        for h in range(8):
            hat(t0 + h * BEAT * 0.5, 0.18 if h % 2 else 0.11)
        clap(t0 + 1 * BEAT); clap(t0 + 3 * BEAT)
    elif drop:
        for b in range(4):
            kick(t0 + b * BEAT, 0.95)
        for h in range(8):
            hat(t0 + h * BEAT * 0.5, 0.20 if h % 2 else 0.11)
        clap(t0 + 1 * BEAT); clap(t0 + 3 * BEAT)

    # --- plucky arp (build/verse energy), variant rotates so it evolves ---
    if sec in ("verse", "build1", "build2"):
        offs = ARP_VARIANTS[bar % len(ARP_VARIANTS)]
        for j, off in enumerate(offs):
            nt = t0 + j * BEAT * 0.5
            add(nt, BEAT * 0.45, midi(root + 24 + off), 0.12, "pluck")

    # --- supersaw hook in the drops (8-bar non-repeating topline) ---
    if drop:
        idx8 = bar - (8 if sec == "drop1" else 24)
        pat = HOOK8[idx8 % 8]
        for j, n in enumerate(pat):
            nt = t0 + j * BEAT * 0.5
            add(nt, BEAT * 0.5, midi(n), 0.17, "lead")
            if sec == "drop2":            # octave stack for the bigger climax
                add(nt, BEAT * 0.5, midi(n + 12), 0.07, "lead")
        # plucky counter-arp under the hook
        offs = ARP_VARIANTS[(bar + 1) % len(ARP_VARIANTS)]
        for j, off in enumerate(offs):
            nt = t0 + j * BEAT * 0.5
            add(nt, BEAT * 0.4, midi(root + 24 + off), 0.07, "pluck")

    # --- emotional breakdown motif ---
    if sec == "break":
        for n, off_beats, dur_beats in BREAK_MOTIF[bar % 4]:
            add(t0 + off_beats * BEAT, dur_beats * BEAT, midi(n), 0.14, "soft")

    # --- coin chime accents at phrase starts (in the drops) ---
    if drop and bar % 4 == 0:
        add(t0, 0.5, midi(note("C", 6)), 0.10, "chime")
        add(t0 + 0.12, 0.5, midi(note("E", 6)), 0.08, "chime")
        add(t0 + 0.24, 0.6, midi(note("G", 6)), 0.07, "chime")

# --- risers + fills into each new section (no two transitions feel the same) ---
riser((8 - 1) * BAR, BAR, 0.30); fill((8 - 1) * BAR)     # verse -> drop 1
fill((16 - 1) * BAR)                                      # drop 1 -> breakdown
riser((20 - 1) * BAR, BAR, 0.18)                          # breakdown lift
riser((24 - 1) * BAR, BAR, 0.34); fill((24 - 1) * BAR)    # build 2 -> drop 2

# little ascending coin run at the very start (the "cha-ching" intro)
for k, n in enumerate([note("C", 5), note("E", 5), note("G", 5), note("C", 6)]):
    add(0.02 + k * 0.10, 0.45, midi(n), 0.12, "chime")

# ---- normalise + soft clip --------------------------------------------------
peak = max(1e-6, max(abs(x) for x in buf))
gain = 0.82 / peak
for i in range(N):
    x = buf[i] * gain
    x = math.tanh(x * 1.15)   # gentle glue soft-clip
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
