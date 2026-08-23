import React, { useEffect, useRef, useState } from 'react';
import { WhereInBritainChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { MapPin, Navigation, Compass, Crosshair } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { ApparatusFrame } from '../common/ApparatusFrame';
import { haversineDistanceKm, type GeoPoint } from '../../game/geo';
import { applyBureauMapStyle, getMapStyleUrl, UK_MAP_BOUNDS, UK_MAP_CENTER } from '../../game/mapConfig';
import { scoreMapDistance } from '../../game/scoring';

interface WhereInBritainProps { challenge: WhereInBritainChallenge; currentPlayer: Player; onComplete: (score: number, errorKm: number) => void; }

export const WhereInBritainRound: React.FC<WhereInBritainProps> = ({ challenge, currentPlayer, onComplete }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const guessMarkerRef = useRef<any>(null);
  const targetMarkerRef = useRef<any>(null);
  const submittedRef = useRef(false);
  const [guess, setGuess] = useState<GeoPoint | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [earnedScore, setEarnedScore] = useState(0);

  useEffect(() => {
    const maplibregl = (window as any).maplibregl;
    if (!mapContainerRef.current || !maplibregl) {
      setMapError('The Atlas Room failed to load its map engine. Refresh the page and try again.');
      return;
    }
    if (typeof maplibregl.supported === 'function' && !maplibregl.supported()) {
      setMapError('This browser is not providing the WebGL graphics support required by the Atlas Room.');
      return;
    }

    let map: any;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapStyleUrl(),
        center: UK_MAP_CENTER,
        zoom: 4.8,
        minZoom: 4.2,
        maxZoom: 9,
        maxBounds: UK_MAP_BOUNDS,
        attributionControl: true,
        dragRotate: false,
        pitchWithRotate: false,
        cooperativeGestures: false
      });
    } catch (error) {
      console.error('Bureau map initialisation failed', error);
      setMapError('The Atlas Room could not initialise the map. Refresh the page and try again.');
      return;
    }

    mapRef.current = map;
    map.dragRotate?.disable();
    map.touchZoomRotate?.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right');

    map.on('load', () => {
      applyBureauMapStyle(map);
      requestAnimationFrame(() => {
        map.resize?.();
        setIsMapReady(true);
      });
    });

    map.on('error', (event: any) => {
      console.error('Bureau map error', event?.error ?? event);
      if (!map.loaded?.()) setMapError('The Atlas Room could not retrieve its map tiles. Check the connection and reload.');
    });

    map.on('click', (event: any) => {
      if (submittedRef.current) return;
      const nextGuess = { lat: event.lngLat.lat, lng: event.lngLat.lng };
      setGuess(nextGuess);
      sound.playClick();
      guessMarkerRef.current?.remove();
      guessMarkerRef.current = new maplibregl.Marker({ color: '#e65b4b' }).setLngLat([nextGuess.lng, nextGuess.lat]).addTo(map);
    });

    const resizeMap = () => map.resize?.();
    window.addEventListener('orientationchange', resizeMap);
    window.addEventListener('resize', resizeMap);

    return () => {
      window.removeEventListener('orientationchange', resizeMap);
      window.removeEventListener('resize', resizeMap);
      guessMarkerRef.current?.remove();
      targetMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [challenge.id]);

  const revealAnswer = (playerGuess: GeoPoint) => {
    const maplibregl = (window as any).maplibregl;
    const map = mapRef.current;
    if (!map || !maplibregl) return;
    const target: GeoPoint = { lat: challenge.lat, lng: challenge.lng };
    targetMarkerRef.current?.remove();
    targetMarkerRef.current = new maplibregl.Marker({ color: '#168f69' }).setLngLat([target.lng, target.lat]).addTo(map);
    const lineData = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[playerGuess.lng, playerGuess.lat], [target.lng, target.lat]] } };
    if (map.getLayer('bureau-answer-line')) map.removeLayer('bureau-answer-line');
    if (map.getSource('bureau-answer-line')) map.removeSource('bureau-answer-line');
    map.addSource('bureau-answer-line', { type: 'geojson', data: lineData });
    map.addLayer({ id: 'bureau-answer-line', type: 'line', source: 'bureau-answer-line', paint: { 'line-color': '#7c4c92', 'line-width': 4, 'line-dasharray': [1.5, 1.5] } });
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([playerGuess.lng, playerGuess.lat]);
    bounds.extend([target.lng, target.lat]);
    map.fitBounds(bounds, { padding: 90, maxZoom: 7.3, duration: 800 });
  };

  const handleConfirmPin = () => {
    if (!guess || !isMapReady) return;
    sound.playStamp();
    submittedRef.current = true;
    const dist = haversineDistanceKm(guess, { lat: challenge.lat, lng: challenge.lng });
    const score = scoreMapDistance(dist);
    setDistanceKm(dist);
    setEarnedScore(score);
    setIsSubmitted(true);
    revealAnswer(guess);
  };

  return (
    <div className="w-full max-w-6xl mx-auto font-['Plus_Jakarta_Sans'] space-y-5">
      <ApparatusFrame eyebrow="Atlas Room • Illuminated Ordnance Table" title={challenge.prompt} subtitle={<><strong>{currentPlayer.name}</strong>, place the plotting pin. All names have been removed by people who would quite like you to know this yourself.</>} icon={<Compass size={28}/>} accent="#2fa8ae" instrumentLabel="MAP TABLE">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_310px] gap-5 items-start">
          <div className="relative rounded-[24px] border-[5px] border-[#68462d] bg-[#1d7277] p-3 shadow-[inset_0_0_0_5px_#84d2ce,0_10px_0_#68462d]">
            <div className="absolute -top-3 left-8 right-8 h-5 rounded-full border-2 border-[#68462d] bg-[#f0cd61] shadow-[0_3px_0_#68462d]" />
            <div className="relative h-[500px] sm:h-[620px] overflow-hidden rounded-2xl border-[3px] border-[#68462d] bg-[#dfe7df] shadow-inner touch-manipulation">
              <div ref={mapContainerRef} className="absolute inset-0" aria-label="Interactive unlabelled map of the United Kingdom" />
              {!isMapReady && !mapError && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#d8eadc]/90 font-['Cinzel'] font-black text-[#31515a]">Illuminating survey table…</div>}
              {mapError && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f2d1c7]/95 p-8 text-center font-['Fraunces'] text-[#733d37]">{mapError}</div>}
              <div className="absolute bottom-8 left-3 z-10 rounded-lg border-2 border-[#765139] bg-[#fff0bf]/90 px-3 py-1.5 font-['Courier_Prime'] text-[9px] font-black uppercase tracking-wider text-[#60442d] shadow">names removed • geography remains</div>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">{['COAST','RIVERS','ROADS','RELIEF','NERVE'].map((label,i)=><div key={label} className={`rounded-md border-2 border-[#68462d] px-1 py-2 text-center font-['Courier_Prime'] text-[8px] font-black ${i===4?'bg-[#e75e4f] text-white':'bg-[#f4d36d] text-[#65452e]'}`}>{label}</div>)}</div>
          </div>

          <aside className="rounded-2xl border-[4px] border-[#68462d] bg-[#fff5d8] p-5 shadow-[0_7px_0_#68462d]">
            <div className="mb-4 rounded-xl border-2 border-[#68462d] bg-[#e75e4f] p-4 text-white shadow-[0_4px_0_#68462d]">
              <div className="font-['Courier_Prime'] text-[9px] font-black uppercase tracking-widest">Target file</div>
              <h3 className="font-['Cinzel'] text-lg font-black">{challenge.targetName}</h3>
            </div>
            {!isSubmitted ? <>
              <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-[#9e8258] bg-[#efe0ba] p-3 text-[#5a4a38]"><Crosshair size={18} className={guess?'text-[#e65b4b]':'text-[#927e64]'}/><span className="font-['Courier_Prime'] text-xs font-bold">{guess?'Plotting pin positioned':'Tap the map to place the plotting pin'}</span></div>
              <button disabled={!guess || !isMapReady} onClick={handleConfirmPin} className="flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#68462d] bg-[#e65d4e] py-4 font-['Cinzel'] text-xs font-black uppercase tracking-widest text-white shadow-[0_5px_0_#68462d] active:translate-y-1 active:shadow-none disabled:opacity-40"><Navigation size={18}/> Lock Coordinates</button>
            </> : <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border-[3px] border-[#68462d] bg-[#f3d66f] p-3 text-center shadow-[0_4px_0_#68462d]"><span className="font-['Courier_Prime'] text-[9px] font-black uppercase text-[#715139]">Distance out</span><strong className="block font-['Space_Mono'] text-xl text-[#374c52]">{distanceKm!==null?`${distanceKm.toFixed(distanceKm<10?1:0)} km`:'—'}</strong></div>
                <div className="rounded-xl border-[3px] border-[#68462d] bg-[#53b9b4] p-3 text-center text-white shadow-[0_4px_0_#68462d]"><span className="font-['Courier_Prime'] text-[9px] font-black uppercase">Bureau score</span><strong className="block font-['Space_Mono'] text-2xl">{earnedScore}</strong></div>
              </div>
              <div className="mt-4 rounded-xl border-2 border-[#9e8258] bg-[#efe0ba] p-3 font-['Courier_Prime'] text-[10px] text-[#654a34]"><div className="flex items-center gap-2"><MapPin size={15} className="text-[#e65b4b]"/>Your pin</div><div className="mt-1 flex items-center gap-2"><MapPin size={15} className="text-[#168f69]"/>Correct location</div></div>
            </>}
          </aside>
        </div>
      </ApparatusFrame>
      {isSubmitted && <CommentaryPlaque score={earnedScore} playerName={currentPlayer.name} roundType="WHERE_IN_BRITAIN" questionPrompt={challenge.prompt} explanation={challenge.explanation} source={challenge.source} correctAnswer={challenge.targetName} errorKm={distanceKm ?? undefined} history={currentPlayer.stats} isCorrect={earnedScore>=700} onProceed={()=>onComplete(earnedScore,distanceKm??0)} />}
    </div>
  );
};
