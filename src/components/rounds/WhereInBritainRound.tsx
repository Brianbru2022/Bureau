import React, { useEffect, useRef, useState } from 'react';
import { WhereInBritainChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { MapPin, Navigation, Compass, Crosshair } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { haversineDistanceKm, type GeoPoint } from '../../game/geo';
import { applyBureauMapStyle, getMapStyleUrl, UK_MAP_BOUNDS, UK_MAP_CENTER } from '../../game/mapConfig';
import { scoreMapDistance } from '../../game/scoring';

interface WhereInBritainProps {
  challenge: WhereInBritainChallenge;
  currentPlayer: Player;
  onComplete: (score: number, errorKm: number) => void;
}

export const WhereInBritainRound: React.FC<WhereInBritainProps> = ({
  challenge,
  currentPlayer,
  onComplete
}) => {
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
      setMapError('The Bureau map renderer failed to load. Reload the assessment and try again.');
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyleUrl(),
      center: UK_MAP_CENTER,
      zoom: 4.8,
      minZoom: 4.2,
      maxZoom: 9,
      maxBounds: UK_MAP_BOUNDS,
      attributionControl: true,
      dragRotate: false,
      pitchWithRotate: false
    });

    mapRef.current = map;
    map.dragRotate?.disable();
    map.touchZoomRotate?.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right');

    map.on('load', () => {
      applyBureauMapStyle(map);
      setIsMapReady(true);
    });

    map.on('click', (event: any) => {
      if (submittedRef.current) return;

      const nextGuess = { lat: event.lngLat.lat, lng: event.lngLat.lng };
      setGuess(nextGuess);
      sound.playClick();

      guessMarkerRef.current?.remove();
      guessMarkerRef.current = new maplibregl.Marker({ color: '#e7553c' })
        .setLngLat([nextGuess.lng, nextGuess.lat])
        .addTo(map);
    });

    return () => {
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
    targetMarkerRef.current = new maplibregl.Marker({ color: '#168f69' })
      .setLngLat([target.lng, target.lat])
      .addTo(map);

    const lineData = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [playerGuess.lng, playerGuess.lat],
          [target.lng, target.lat]
        ]
      }
    };

    if (map.getLayer('bureau-answer-line')) map.removeLayer('bureau-answer-line');
    if (map.getSource('bureau-answer-line')) map.removeSource('bureau-answer-line');

    map.addSource('bureau-answer-line', { type: 'geojson', data: lineData });
    map.addLayer({
      id: 'bureau-answer-line',
      type: 'line',
      source: 'bureau-answer-line',
      paint: {
        'line-color': '#7c4c92',
        'line-width': 4,
        'line-dasharray': [1.5, 1.5]
      }
    });

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([playerGuess.lng, playerGuess.lat]);
    bounds.extend([target.lng, target.lat]);
    map.fitBounds(bounds, { padding: 90, maxZoom: 7.3, duration: 800 });
  };

  const handleConfirmPin = () => {
    if (!guess || !isMapReady) return;

    sound.playStamp();
    submittedRef.current = true;

    const target = { lat: challenge.lat, lng: challenge.lng };
    const dist = haversineDistanceKm(guess, target);
    const score = scoreMapDistance(dist);

    setDistanceKm(dist);
    setEarnedScore(score);
    setIsSubmitted(true);
    revealAnswer(guess);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-6xl mx-auto font-['Plus_Jakarta_Sans']">
      <div className="w-full bg-[#162235] border-2 border-[#d4af37] rounded-lg p-4 mb-4 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Compass className="text-[#ffd700]" size={20} />
          <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] tracking-widest uppercase">
            Cartographical Assessment • Where in the UK?
          </span>
        </div>
        <h2 className="font-['Cinzel'] font-black text-xl sm:text-2xl text-white tracking-wide">
          {challenge.prompt}
        </h2>
        <p className="font-['Courier_Prime'] text-xs text-slate-300 mt-1">
          <strong className="text-[#ffd700]">{currentPlayer.name}</strong>, place the pin. The map has been stripped of labels because this is an assessment, not assisted shopping.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px] gap-4 items-start">
        <div className="relative w-full h-[540px] sm:h-[620px] overflow-hidden rounded-xl border-4 border-[#d4af37] bg-[#dfe7df] shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
          <div ref={mapContainerRef} className="absolute inset-0" aria-label="Interactive unlabelled map of the United Kingdom" />

          {!isMapReady && !mapError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#102034]/85 text-[#f5deb3] font-['Cinzel'] font-bold tracking-wider">
              Opening the Atlas Room…
            </div>
          )}

          {mapError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#2b1414]/95 p-8 text-center text-rose-100 font-['Fraunces']">
              {mapError}
            </div>
          )}

          <div className="absolute left-3 bottom-8 z-10 rounded-md border border-[#744f32]/40 bg-[#f4e8ca]/90 px-3 py-1.5 text-[10px] font-['Courier_Prime'] font-bold uppercase tracking-wider text-[#5a432f] shadow">
            Labels &amp; POI names suppressed by Bureau order
          </div>
        </div>

        <div className="w-full bg-[#121c2c] border-2 border-[#d4af37]/60 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
          {!isSubmitted ? (
            <>
              <div>
                <span className="font-['Courier_Prime'] text-[10px] text-[#ffd700] uppercase tracking-widest font-bold">
                  Target File
                </span>
                <h3 className="font-['Cinzel'] font-black text-xl text-white mt-1">{challenge.targetName}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Tap anywhere on the map to place your marker. You can move it as often as you like before locking the answer.
                </p>
              </div>

              <div className="rounded-lg border border-slate-700 bg-[#0b1320] p-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Crosshair size={16} className={guess ? 'text-[#ffd700]' : 'text-slate-500'} />
                  <span className="font-['Courier_Prime'] text-xs">
                    {guess ? 'Candidate marker positioned' : 'Awaiting candidate marker'}
                  </span>
                </div>
              </div>

              <button
                disabled={!guess || !isMapReady}
                onClick={handleConfirmPin}
                className={`w-full py-3.5 rounded-lg font-['Cinzel'] font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                  guess && isMapReady
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#f5deb3] text-[#0a101d] hover:brightness-110 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Navigation size={17} />
                Lock Location
              </button>
            </>
          ) : (
            <>
              <div className="border-b border-[#d4af37]/30 pb-3">
                <span className="font-['Courier_Prime'] text-[10px] text-emerald-300 uppercase tracking-widest font-bold">
                  Official Location Revealed
                </span>
                <h3 className="font-['Cinzel'] font-black text-xl text-white mt-1">{challenge.targetName}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#d4af37]/40 bg-[#0b1320] p-3 text-center">
                  <span className="text-[9px] font-['Courier_Prime'] text-slate-400 uppercase block">Distance out</span>
                  <strong className="font-['Space_Mono'] text-xl text-[#f5deb3]">
                    {distanceKm !== null ? `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km` : '—'}
                  </strong>
                </div>
                <div className="rounded-lg border border-[#d4af37] bg-[#16253b] p-3 text-center">
                  <span className="text-[9px] font-['Courier_Prime'] text-slate-400 uppercase block">Bureau score</span>
                  <strong className="font-['Space_Mono'] text-2xl text-[#ffd700]">{earnedScore}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-['Courier_Prime'] text-slate-400">
                <MapPin size={14} className="text-[#e7553c]" /> Your pin
                <span className="mx-1">•</span>
                <MapPin size={14} className="text-[#168f69]" /> Correct location
              </div>
            </>
          )}
        </div>
      </div>

      {isSubmitted && (
        <div className="w-full max-w-4xl mt-4">
          <CommentaryPlaque
            score={earnedScore}
            playerName={currentPlayer.name}
            roundType="WHERE_IN_BRITAIN"
            questionPrompt={challenge.prompt}
            explanation={challenge.explanation}
            source={challenge.source}
            errorKm={distanceKm ?? undefined}
            isCorrect={earnedScore >= 700}
            onProceed={() => onComplete(earnedScore, distanceKm ?? 0)}
          />
        </div>
      )}
    </div>
  );
};
