import type { RoundType } from '../types';

/**
 * Web Audio API Sound Synthesizer for The Bureau
 * Generates tactile physical mechanical sound effects directly in browser
 */

export interface BureauAudioSettings {
  muted: boolean;
  masterVolume: number;
  effectsVolume: number;
}

export type DepartmentSoundEvent = 'MOVE' | 'PROCESSING' | 'ACCEPTED' | 'REJECTED' | 'RESULT' | 'ELIMINATED';

export type MechanicalSoundMotif = 'RATCHET'|'SHUTTER'|'GAVEL'|'PRESSURE'|'CAPSULE'|'RAIL'|'IRIS'|'GAUGE';
export interface DepartmentSoundProfile { wave: OscillatorType; base: number; interval: number; motif: MechanicalSoundMotif; noiseCentre: number; clicks: number; }

/** Seventeen recognisable signatures assembled from eight restrained physical
 * motifs. No downloaded recording or licensed sample is required. */
export const DEPARTMENT_SOUND_FAMILIES: Record<RoundType, DepartmentSoundProfile> = {
  WHERE_IN_BRITAIN: { wave:'sine',base:196,interval:1.5,motif:'RATCHET',noiseCentre:1800,clicks:2 },
  TOP_10: { wave:'square',base:148,interval:2,motif:'SHUTTER',noiseCentre:920,clicks:3 },
  PUT_UP_OR_SHUT_UP: { wave:'triangle',base:174,interval:1.25,motif:'GAVEL',noiseCentre:560,clicks:1 },
  THE_LIST: { wave:'sawtooth',base:92,interval:1.34,motif:'PRESSURE',noiseCentre:420,clicks:2 },
  CLOSEST_WINS: { wave:'sine',base:246,interval:1.2,motif:'CAPSULE',noiseCentre:1450,clicks:2 },
  RANK_IT: { wave:'square',base:220,interval:1.125,motif:'RAIL',noiseCentre:2300,clicks:3 },
  IMAGE_REVEAL: { wave:'sine',base:330,interval:1.618,motif:'IRIS',noiseCentre:2850,clicks:4 },
  STOP_THE_SCORE: { wave:'triangle',base:124,interval:1.75,motif:'GAUGE',noiseCentre:1950,clicks:1 },
  MISFILED_RECORDS: { wave:'square',base:164,interval:1.4,motif:'SHUTTER',noiseCentre:1080,clicks:2 },
  REDACTED_RECORDS: { wave:'sawtooth',base:138,interval:1.55,motif:'GAVEL',noiseCentre:680,clicks:2 },
  COMMON_DOSSIER: { wave:'sine',base:208,interval:1.33,motif:'CAPSULE',noiseCentre:1320,clicks:3 },
  MISSING_MINUTES: { wave:'triangle',base:188,interval:1.25,motif:'RATCHET',noiseCentre:1680,clicks:4 },
  PUBLIC_ENQUIRY: { wave:'sine',base:262,interval:1.5,motif:'GAUGE',noiseCentre:2120,clicks:2 },
  CHAIN_OF_COMMAND: { wave:'square',base:184,interval:1.2,motif:'RAIL',noiseCentre:2480,clicks:4 },
  COMPLAINTS_DESK: { wave:'sawtooth',base:112,interval:1.45,motif:'PRESSURE',noiseCentre:510,clicks:1 },
  SEATING_COMMITTEE: { wave:'triangle',base:156,interval:1.3,motif:'RAIL',noiseCentre:2050,clicks:5 },
  DISPATCH_BOX: { wave:'square',base:232,interval:1.6,motif:'SHUTTER',noiseCentre:1240,clicks:5 },
};

const AUDIO_SETTINGS_KEY = 'the-bureau.audio-settings-v1';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioUnavailable = false;
  public isMuted: boolean = typeof window !== 'undefined' && window.localStorage?.getItem('the-bureau.audio-muted') === 'true';
  private masterVolume = 0.8;
  private effectsVolume = 0.8;

  constructor() {
    try {
      const saved = JSON.parse(window.localStorage?.getItem(AUDIO_SETTINGS_KEY) ?? '{}') as Partial<BureauAudioSettings>;
      this.isMuted = saved.muted ?? this.isMuted;
      this.masterVolume = Math.max(0, Math.min(1, saved.masterVolume ?? .8));
      this.effectsVolume = Math.max(0, Math.min(1, saved.effectsVolume ?? .8));
    } catch { /* use safe defaults */ }
  }

  private level(value: number) { return value * this.masterVolume * this.effectsVolume; }
  private persistSettings() {
    try { window.localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(this.getSettings())); } catch { /* preference remains session-only */ }
  }
  public getSettings(): BureauAudioSettings { return { muted:this.isMuted, masterVolume:this.masterVolume, effectsVolume:this.effectsVolume }; }
  public setMasterVolume(value:number) { this.masterVolume=Math.max(0,Math.min(1,value));this.persistSettings(); }
  public setEffectsVolume(value:number) { this.effectsVolume=Math.max(0,Math.min(1,value));this.persistSettings(); }

  /** A short, department-specific mechanical signature. Dynamic state remains
   * visible in live HTML, so audio reinforces rather than carries information. */
  public playDepartmentCue(roundType: RoundType, event: DepartmentSoundEvent) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const family = DEPARTMENT_SOUND_FAMILIES[roundType];
      const now = this.ctx.currentTime;
      const eventShape: Record<DepartmentSoundEvent, { notes: number[]; duration: number; level: number; texture: number }> = {
        MOVE: { notes:[1],duration:.055,level:.075,texture:.045 },
        PROCESSING: { notes:[1,family.interval],duration:.12,level:.085,texture:.055 },
        ACCEPTED: { notes:[1,family.interval,family.interval*1.5],duration:.26,level:.095,texture:.06 },
        REJECTED: { notes:[1,.72],duration:.29,level:.11,texture:.075 },
        RESULT: { notes:[1,family.interval,2],duration:.4,level:.1,texture:.065 },
        ELIMINATED: { notes:[1,.78,.55],duration:.38,level:.115,texture:.08 },
      };
      const shape = eventShape[event];
      const output=this.ctx.createDynamicsCompressor();
      output.threshold.setValueAtTime(-22,now);output.knee.setValueAtTime(18,now);output.ratio.setValueAtTime(5,now);output.attack.setValueAtTime(.002,now);output.release.setValueAtTime(.12,now);output.connect(this.ctx.destination);
      const clickCount=event==='MOVE'?1:Math.min(family.clicks,event==='PROCESSING'?3:5);
      for(let click=0;click<clickCount;click+=1){
        const length=Math.max(32,Math.floor(this.ctx.sampleRate*.045));
        const buffer=this.ctx.createBuffer(1,length,this.ctx.sampleRate);const data=buffer.getChannelData(0);
        for(let sample=0;sample<length;sample+=1)data[sample]=(Math.random()*2-1)*Math.pow(1-sample/length,3);
        const source=this.ctx.createBufferSource();const filter=this.ctx.createBiquadFilter();const gain=this.ctx.createGain();const start=now+click*.035;
        filter.type=family.motif==='PRESSURE'?'lowpass':'bandpass';filter.frequency.setValueAtTime(family.noiseCentre,start);filter.Q.setValueAtTime(family.motif==='IRIS'?4.2:2.1,start);
        gain.gain.setValueAtTime(this.level(shape.texture/(click+1)**.25),start);gain.gain.exponentialRampToValueAtTime(.001,start+.05);
        source.buffer=buffer;source.connect(filter);filter.connect(gain);gain.connect(output);source.start(start);source.stop(start+.055);
      }
      shape.notes.forEach((ratio, index) => {
        if (!this.ctx) return;
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + index * Math.min(.09, shape.duration / shape.notes.length);
        oscillator.type = family.wave;
        oscillator.frequency.setValueAtTime(Math.max(35, family.base * ratio), start);
        gain.gain.setValueAtTime(this.level(shape.level / (index + 1) ** .35), start);
        gain.gain.exponentialRampToValueAtTime(.001, start + shape.duration);
        oscillator.connect(gain);
        gain.connect(output);
        oscillator.start(start);
        oscillator.stop(start + shape.duration);
      });
    } catch {
      this.disableAudio();
    }
  }

  private initCtx() {
    if (this.audioUnavailable) return;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => this.disableAudio());
      }
    } catch {
      this.disableAudio();
    }
  }

  private disableAudio() {
    this.audioUnavailable = true;
    this.ctx = null;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try { window.localStorage.setItem('the-bureau.audio-muted',String(this.isMuted)); } catch { /* preference remains valid for this session */ }
    this.persistSettings();
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try { window.localStorage.setItem('the-bureau.audio-muted',String(this.isMuted)); } catch { /* preference remains valid for this session */ }
    this.persistSettings();
  }

  // Tactile button click / mechanical switch
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(this.level(0.3), this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Typewriter keystroke
  public playTypewriter() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);

    gain.gain.setValueAtTime(this.level(0.15), now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.03);
  }

  // Classified Stamp (Heavy Thud + Seal)
  public playStamp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Bass thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);
    gain.gain.setValueAtTime(this.level(0.6), now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.18);

    // High snap
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(600, now);
    snap.frequency.exponentialRampToValueAtTime(120, now + 0.06);
    snapGain.gain.setValueAtTime(this.level(0.2), now);
    snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
    snap.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snap.start();
    snap.stop(now + 0.06);
  }

  // Brass Bell Chime (Correct answer or Bank)
  public playBrassChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 1046.5, 1567.98]; // C5, C6, G6
    freqs.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      
      const vol = (0.2 / (i + 1));
      gain.gain.setValueAtTime(this.level(vol), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 1.2);
    });
  }

  // Bureau Disapproval / Wrong answer buzzer
  public playDisapproval() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.35);

    gain.gain.setValueAtTime(this.level(0.35), now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.35);
  }

  // Pneumatic Tube Whoosh (Room transition)
  public playPneumatic() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);

    gain.gain.setValueAtTime(this.level(0.05), now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.6);
  }

  // Stop The Score Needle Tick
  public playNeedleTick(pitchRatio: number = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300 + pitchRatio * 600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    gain.gain.setValueAtTime(this.level(0.12), now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.04);
  }

  public playArchiveMechanism(outcome: 'MOVE' | 'ACCEPTED' | 'REJECTED') {
    if (outcome === 'ACCEPTED') this.playBrassChime();
    else if (outcome === 'REJECTED') this.playDisapproval();
    else this.playTypewriter();
  }

  public playPressureMechanism(outcome: 'MOVE' | 'ACCEPTED' | 'REJECTED') {
    if (outcome === 'ACCEPTED') this.playStamp();
    else if (outcome === 'REJECTED') this.playDisapproval();
    else this.playClick();
  }

  public playOpticalMechanism(outcome: 'MOVE' | 'ACCEPTED' | 'REJECTED') {
    if (outcome === 'ACCEPTED') this.playBrassChime();
    else if (outcome === 'REJECTED') this.playDisapproval();
    else this.playNeedleTick(0.65);
  }

  // Grand Fanfare for Awards / Victory
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 392.00, t: 0.0, d: 0.2 }, // G4
      { f: 523.25, t: 0.2, d: 0.2 }, // C5
      { f: 659.25, t: 0.4, d: 0.2 }, // E5
      { f: 783.99, t: 0.6, d: 0.7 }  // G5
    ];

    notes.forEach(n => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(this.level(0.25), now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }
}

export const sound = new AudioEngine();
