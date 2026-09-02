import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, Crosshair } from 'lucide-react';
import type { WhereInBritainChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { haversineDistanceKm, type GeoPoint } from '../../game/geo';
import { scoreMapDistance } from '../../game/scoring';
import { UK_MAP_BOUNDS } from '../../game/mapConfig';
import { motionDuration, PRESENTATION_TIMING } from '../../game/presentation';

interface WhereInBritainProps { challenge: WhereInBritainChallenge; currentPlayer: Player; onComplete: (score: number, errorKm: number) => void; }

const [[MAP_WEST, MAP_SOUTH], [MAP_EAST, MAP_NORTH]] = UK_MAP_BOUNDS;
const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
const NORTH_Y = mercatorY(MAP_NORTH);
const SOUTH_Y = mercatorY(MAP_SOUTH);

const pointToPercent = ({ lat, lng }: GeoPoint) => ({
  x: ((lng - MAP_WEST) / (MAP_EAST - MAP_WEST)) * 100,
  y: ((NORTH_Y - mercatorY(lat)) / (NORTH_Y - SOUTH_Y)) * 100
});

const percentToPoint = (x: number, y: number): GeoPoint => {
  const lng = MAP_WEST + (x / 100) * (MAP_EAST - MAP_WEST);
  const projectedY = NORTH_Y - (y / 100) * (NORTH_Y - SOUTH_Y);
  return { lat: Math.atan(Math.sinh(projectedY)) * 180 / Math.PI, lng };
};

export const WhereInBritainRound: React.FC<WhereInBritainProps> = ({ challenge, currentPlayer, onComplete }) => {
  const submittedRef = useRef(false);
  const [guess, setGuess] = useState<GeoPoint | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [earnedScore, setEarnedScore] = useState(0);

  useEffect(() => {
    submittedRef.current = false;
    setGuess(null);
    setIsSubmitted(false);
    setShowResult(false);
    setDistanceKm(null);
    setEarnedScore(0);
  }, [challenge.id, currentPlayer.id]);

  useEffect(() => {
    if (!isSubmitted) return;
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const destinationTimer = window.setTimeout(() => sound.playDepartmentCue('WHERE_IN_BRITAIN', 'RESULT'), motionDuration(PRESENTATION_TIMING.mapRouteMs, reducedMotion));
    const resultTimer = window.setTimeout(() => setShowResult(true), motionDuration(PRESENTATION_TIMING.majorRevealMs, reducedMotion));
    return () => {
      window.clearTimeout(destinationTimer);
      window.clearTimeout(resultTimer);
    };
  }, [isSubmitted]);

  const placePin = (event: React.PointerEvent<HTMLDivElement>) => {
    if (submittedRef.current || !isMapReady) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100));
    const y = Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100));
    setGuess(percentToPoint(x, y));
    sound.playDepartmentCue('WHERE_IN_BRITAIN', 'MOVE');
  };

  const handleConfirmPin = () => {
    if (!guess || !isMapReady) return;
    sound.playDepartmentCue('WHERE_IN_BRITAIN', 'PROCESSING');
    submittedRef.current = true;
    const dist = haversineDistanceKm(guess, { lat: challenge.lat, lng: challenge.lng });
    const score = scoreMapDistance(dist);
    setDistanceKm(dist);
    setEarnedScore(score);
    setIsSubmitted(true);
  };

  const handleMapKeyDown = (event:React.KeyboardEvent<HTMLDivElement>) => {
    if (submittedRef.current || !isMapReady) return;
    if (event.key === 'Enter' && guess) { event.preventDefault(); handleConfirmPin(); return; }
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key)) return;
    event.preventDefault();
    const current=guess?pointToPercent(guess):{x:50,y:50};
    const step=event.shiftKey?5:1.5;
    const next={x:Math.max(0,Math.min(100,current.x+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0))),y:Math.max(0,Math.min(100,current.y+(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0)))};
    setGuess(percentToPoint(next.x,next.y));sound.playDepartmentCue('WHERE_IN_BRITAIN', 'MOVE');
  };

  const guessPosition = guess ? pointToPercent(guess) : null;
  const targetPosition = pointToPercent({ lat: challenge.lat, lng: challenge.lng });

  return (
    <div className="w-full max-w-6xl mx-auto font-['Plus_Jakarta_Sans']">
      <ApparatusFrame compact state={isSubmitted&&!showResult?'PROCESSING':showResult?'RESULT':'ACTIVE'} eyebrow="Atlas Room • Illuminated Ordnance Table" title={challenge.prompt} subtitle={<><strong>{currentPlayer.name}</strong>, place the plotting pin. All names have been removed by people who would quite like you to know this yourself.</>} icon={<Compass size={24}/>} accent="#2fa8ae" instrumentLabel="MAP TABLE">
        <div className="relative overflow-hidden rounded-[22px] border-[3px] border-[#68462d] bg-[#254e52]/90 p-3 sm:p-5">
          <div className="relative mx-auto grid w-full max-w-[980px] grid-cols-1 md:grid-cols-[minmax(390px,650px)_minmax(240px,285px)] justify-center gap-3 sm:gap-5 items-stretch">
          <div className="relative rounded-[20px] border-[4px] border-[#68462d] bg-[#1d7277] p-2 shadow-[inset_0_0_0_4px_#84d2ce,0_7px_0_#4c3121]">
            <div className="absolute -top-2 left-8 right-8 h-3 rounded-full border-2 border-[#68462d] bg-[#f0cd61] shadow-[0_2px_0_#68462d]" />
            <div className="relative flex h-[clamp(300px,calc(100dvh-410px),500px)] items-center justify-center overflow-hidden rounded-xl border-[3px] border-[#68462d] bg-[linear-gradient(90deg,#b8c7c9,#d7dfe0_18%,#d7dfe0_82%,#b8c7c9)] shadow-inner touch-manipulation">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-[18%] border-r border-[#8da2a5]/60 bg-[repeating-linear-gradient(0deg,transparent_0_23px,rgba(73,99,103,.10)_23px_24px)]" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-[18%] border-l border-[#8da2a5]/60 bg-[repeating-linear-gradient(0deg,transparent_0_23px,rgba(73,99,103,.10)_23px_24px)]" />
              <p id="bureau-map-keyboard-help" className="sr-only">Use the arrow keys to position the plotting pin. Hold Shift for a larger movement. Press Space to place the initial pin and Enter to lock the coordinates.</p>
              <div className="relative h-full max-w-full cursor-crosshair select-none aspect-[1110/1905]" onPointerDown={placePin} onKeyDown={handleMapKeyDown} role="application" tabIndex={0} aria-label="Unlabelled map of the United Kingdom" aria-describedby="bureau-map-keyboard-help" aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space">
                <img src="/assets/maps/uk-osm-nolabels-v2.webp" alt="Unlabelled map of the United Kingdom" draggable={false} className="absolute inset-0 h-full w-full" onLoad={() => { setMapError(false); setIsMapReady(true); }} onError={() => { setMapError(true); setIsMapReady(false); }} />
                {guessPosition && <><span aria-hidden="true" className="bureau-map-crosshair bureau-map-crosshair--guess" style={{ left: `${guessPosition.x}%`, top: `${guessPosition.y}%` }}/><MapPin aria-hidden="true" className="absolute z-10 -translate-x-1/2 -translate-y-1/2 drop-shadow" size={30} fill="#e65b4b" color="#ffffff" strokeWidth={3} style={{ left: `${guessPosition.x}%`, top: `${guessPosition.y}%` }} /></>}
                {isSubmitted && <>
                  <svg key={`route-${challenge.id}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                    <line className="bureau-map-trace-shadow" pathLength="1" x1={`${guessPosition?.x ?? 0}%`} y1={`${guessPosition?.y ?? 0}%`} x2={`${targetPosition.x}%`} y2={`${targetPosition.y}%`} />
                    <line className="bureau-map-trace" pathLength="1" x1={`${guessPosition?.x ?? 0}%`} y1={`${guessPosition?.y ?? 0}%`} x2={`${targetPosition.x}%`} y2={`${targetPosition.y}%`} />
                  </svg>
                  <span key={`target-dot-${challenge.id}`} aria-hidden="true" className="bureau-map-crosshair bureau-map-crosshair--target" style={{ left: `${targetPosition.x}%`, top: `${targetPosition.y}%` }}/>
                  <Crosshair key={`target-${challenge.id}`} aria-hidden="true" className="bureau-map-target absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff6d5] p-0.5 drop-shadow" size={31} color="#08795c" strokeWidth={3.5} style={{ left: `${targetPosition.x}%`, top: `${targetPosition.y}%` }} />
                </>}
                <span className="sr-only" role="status" aria-live="polite">{guessPosition ? `Plotting pin positioned ${guessPosition.x.toFixed(0)} per cent west to east and ${guessPosition.y.toFixed(0)} per cent north to south.` : 'No plotting pin positioned.'}</span>
              </div>
              {!isMapReady && !mapError && <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#d8eadc]/90 font-['Cinzel'] font-black text-[#31515a]">Opening local survey sheet…</div>}
              {mapError && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#f2d1c7]/95 p-8 text-center font-['Fraunces'] text-[#733d37]" role="alert"><strong className="font-['Cinzel']">Survey sheet unavailable</strong><span>The bundled UK map could not be opened.</span></div>}
              <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg border-2 border-[#765139] bg-[#fff0bf]/90 px-3 py-1.5 font-['Courier_Prime'] text-xs font-black uppercase tracking-wider text-[#60442d] shadow">names removed • geography remains</div>
              <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded bg-white/80 px-2 py-1 text-xs text-[#5f6670]">© OpenStreetMap contributors © CARTO</div>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1.5">{['COAST','RIVERS','ROADS','RELIEF','NERVE'].map((label,i)=><div key={label} className={`rounded-md border-2 border-[#68462d] px-1 py-1 text-center font-['Courier_Prime'] text-[7px] font-black ${i===4?'bg-[#e75e4f] text-white':'bg-[#f4d36d] text-[#65452e]'}`}>{label}</div>)}</div>
          </div>
          <aside className="self-center rounded-2xl border-[4px] border-[#68462d] bg-[#fff5d8]/95 p-3 sm:p-4 shadow-[0_7px_0_#4c3121]">
            <div className="mb-3 flex items-center justify-between border-b-2 border-dashed border-[#b69561] pb-2 font-['Courier_Prime'] text-xs font-black uppercase tracking-[.18em] text-[#76563d]"><span>Ordnance dossier</span><Compass size={17}/></div>
            <div className="mb-3 rounded-xl border-2 border-[#68462d] bg-[#e75e4f] p-3 text-white shadow-[0_4px_0_#68462d]"><div className="font-['Courier_Prime'] text-xs font-black uppercase tracking-widest">Target file</div><h3 className="font-['Cinzel'] text-base font-black">{challenge.targetName}</h3></div>
            {!isSubmitted ? <>
              <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-[#9e8258] bg-[#efe0ba] p-3 text-[#5a4a38]"><Crosshair size={18} className={guess?'text-[#e65b4b]':'text-[#927e64]'}/><span className="font-['Courier_Prime'] text-xs font-bold">{guess?'Plotting pin positioned':'Tap the map to place the plotting pin'}</span></div>
              <button disabled={!guess || !isMapReady} onClick={handleConfirmPin} className="flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#68462d] bg-[#e65d4e] py-4 font-['Cinzel'] text-xs font-black uppercase tracking-widest text-white shadow-[0_5px_0_#68462d] active:translate-y-1 active:shadow-none disabled:opacity-40"><Navigation size={18}/> Lock Coordinates</button>
            </> : !showResult ? <div className="rounded-xl border-[3px] border-[#68462d] bg-[#294b55] p-4 text-center text-[#fff4cf] shadow-[0_4px_0_#68462d]" role="status" aria-live="polite"><Navigation className="bureau-route-spinner mx-auto mb-2" size={24}/><strong className="block font-['Cinzel'] text-xs uppercase tracking-widest">Plotting route</strong><span className="mt-1 block font-['Courier_Prime'] text-xs">Consulting the certified coordinates…</span></div> : <>
              <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border-[3px] border-[#68462d] bg-[#f3d66f] p-3 text-center shadow-[0_4px_0_#68462d]"><span className="font-['Courier_Prime'] text-xs font-black uppercase text-[#715139]">Distance out</span><strong className="block font-['Space_Mono'] text-xl text-[#374c52]">{distanceKm!==null?`${distanceKm.toFixed(distanceKm<10?1:0)} km`:'—'}</strong></div><div className="rounded-xl border-[3px] border-[#68462d] bg-[#53b9b4] p-3 text-center text-white shadow-[0_4px_0_#68462d]"><span className="font-['Courier_Prime'] text-xs font-black uppercase">Bureau score</span><strong className="block font-['Space_Mono'] text-2xl">{earnedScore}</strong></div></div>
              <div className="mt-4 rounded-xl border-2 border-[#9e8258] bg-[#efe0ba] p-3 font-['Courier_Prime'] text-[10px] text-[#654a34]"><div className="flex items-center gap-2"><MapPin size={15} className="fill-[#e65b4b] text-white"/>Your pin</div><div className="mt-1 flex items-center gap-2"><Crosshair size={15} className="text-[#08795c]"/>Certified location</div></div>
            </>}
          </aside></div>
        </div>
      </ApparatusFrame>
      {showResult && <CommentaryPlaque score={earnedScore} playerName={currentPlayer.name} roundType="WHERE_IN_BRITAIN" questionPrompt={challenge.prompt} explanation={challenge.explanation} source={challenge.source} correctAnswer={challenge.targetName} errorKm={distanceKm ?? undefined} history={currentPlayer.stats} isCorrect={earnedScore>=700} onProceed={()=>onComplete(earnedScore,distanceKm??0)} />}
    </div>
  );
};
