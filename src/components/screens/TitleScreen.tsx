import React from 'react';
import { BureauInsignia } from '../common/BureauInsignia';
import { GeneratedArtBackdrop } from '../common/GeneratedArtBackdrop';
import { sound } from '../../sound/audioEngine';
import { ArrowRight, Users } from 'lucide-react';

interface TitleScreenProps { onStartGame: (playerCount: number) => void; }

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  return (
    <div className="relative flex-1 overflow-hidden rounded-[24px]">
      <GeneratedArtBackdrop src="/assets/generated/grand-hall.jpg" dim={0.42} animate />
      <div className="relative z-10 flex min-h-[78vh] flex-col items-center justify-center text-center max-w-5xl mx-auto py-6 sm:py-9 px-3">
        <div className="bureau-float mb-3 rounded-[28px] border-[4px] border-[#7e5c24] bg-[#fff7df]/94 px-7 py-4 shadow-[0_8px_0_#7b4f32,0_18px_32px_rgba(76,52,33,.2)]">
          <BureauInsignia size={104} />
        </div>

        <div className="relative max-w-3xl bureau-paper rounded-[28px] border-[4px] border-[#7e5c24] px-7 sm:px-12 py-6 sm:py-8 mb-6 bg-[#fff7df]/94">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-[#7e5c24] bg-[#2f8f95] px-5 py-1.5 text-[#fff7df] font-['Courier_Prime'] text-[10px] font-bold uppercase tracking-[0.25em] shadow-[0_4px_0_#7b4f32]">
            Crown Bureau of Assessment &amp; Cataloguing
          </div>
          <h1 className="font-['Cinzel'] font-black text-5xl sm:text-7xl md:text-8xl text-[#244b55] tracking-[0.04em] uppercase leading-none drop-shadow-[0_3px_0_rgba(255,255,255,.7)]">The Bureau</h1>
          <p className="font-['Fraunces'] text-base sm:text-xl text-[#6b4f3a] max-w-2xl mx-auto leading-relaxed mt-4 italic">Britain's most overqualified institution for testing knowledge, judgement, nerve and your ability to be confidently wrong in public.</p>
        </div>

        <div className="w-full max-w-2xl rounded-[26px] border-[4px] border-[#6c4931] bg-[#67c4c1]/96 p-5 sm:p-7 bureau-enamel">
          <div className="flex items-center justify-center gap-2 mb-4 text-[#244b55]"><Users size={19}/><span className="font-['Cinzel'] font-black text-sm uppercase tracking-[0.13em]">How many candidates survived the journey here?</span></div>
          <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(num => <button key={num} onClick={() => { sound.playStamp(); onStartGame(num); }} className="bureau-button bureau-mechanical rounded-2xl bg-[#fff7df] px-2 py-4 text-[#244b55] flex flex-col items-center gap-1 cursor-pointer"><span className="font-['Space_Mono'] font-black text-3xl">{num}</span><span className="font-['Courier_Prime'] text-[9px] font-bold uppercase tracking-wider text-[#765c47]">{num===1?'Solo':`${num} Players`}</span></button>)}</div>
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border-2 border-[#7e5c24]/40 bg-[#2f8f95] px-4 py-2.5 text-[#fff7df] shadow-inner"><ArrowRight size={15}/><p className="font-['Courier_Prime'] text-[10px] sm:text-xs font-bold uppercase tracking-wider">One shared screen. No frantic handovers. Institutional mercy unavailable.</p></div>
        </div>
      </div>
    </div>
  );
};
