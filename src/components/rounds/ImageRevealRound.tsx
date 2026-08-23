import React, { useState } from 'react';
import { ImageRevealChallenge, Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { Image as ImageIcon, Eye, Zap } from 'lucide-react';
import { CommentaryPlaque } from '../common/CommentaryPlaque';
import { scoreImageReveal } from '../../game/scoring';

interface ImageRevealProps {
  challenge: ImageRevealChallenge;
  currentPlayer: Player;
  onComplete: (score: number) => void;
}

export const ImageRevealRound: React.FC<ImageRevealProps> = ({
  challenge,
  currentPlayer,
  onComplete
}) => {
  const [revealStep, setRevealStep] = useState(0);
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [earnedScore, setEarnedScore] = useState(0);

  const potentialScore = scoreImageReveal(challenge.id, revealStep);

  const handleNextReveal = () => {
    if (revealStep < 3) {
      sound.playClick();
      setRevealStep(prev => prev + 1);
    }
  };

  const handleBuzzIn = () => {
    sound.playBrassChime();
    setHasBuzzed(true);
  };

  const handleSelectAnswer = (option: string) => {
    sound.playStamp();
    setSelectedOption(option);

    const normalized = option.trim().toLowerCase();
    const isCorrect = normalized === challenge.subjectName.toLowerCase() ||
      challenge.aliases.some(alias => alias.toLowerCase() === normalized);
    const score = isCorrect ? potentialScore : 0;
    setEarnedScore(score);
    setIsFinished(true);
    if (isCorrect) sound.playVictoryFanfare();
    else sound.playDisapproval();
  };

  const getFilterStyle = () => {
    if (isFinished) return { filter: 'none', transform: 'scale(1)' };
    switch (revealStep) {
      case 0: return { filter: 'blur(20px) contrast(140%)', transform: 'scale(2.2)' };
      case 1: return { filter: 'blur(10px) contrast(120%)', transform: 'scale(1.6)' };
      case 2: return { filter: 'blur(4px) contrast(110%)', transform: 'scale(1.2)' };
      default: return { filter: 'none', transform: 'scale(1)' };
    }
  };

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto font-['Plus_Jakarta_Sans']">
      <div className="w-full bg-[#162235] border-2 border-[#d4af37] rounded-lg p-4 mb-4 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ImageIcon className="text-[#ffd700]" size={20} />
          <span className="font-['Courier_Prime'] text-xs font-bold text-[#e6c875] tracking-widest uppercase">
            Visual Reconnaissance • Image Reveal
          </span>
        </div>
        <h2 className="font-['Cinzel'] font-black text-xl sm:text-2xl text-white tracking-wide">
          {challenge.prompt}
        </h2>
        <p className="font-['Courier_Prime'] text-xs text-slate-300 mt-1">
          Candidate <strong className="text-[#ffd700]">{currentPlayer.name}</strong>, inspect the lens aperture. Earlier identification awards more merit.
        </p>
      </div>

      {!isFinished ? (
        <div className="w-full flex flex-col lg:flex-row gap-5 items-center justify-center">
          <div className="relative w-full max-w-md h-72 sm:h-80 bg-[#070d17] border-4 border-[#d4af37] rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.9)] flex items-center justify-center">
            <img
              src={challenge.imageUrl}
              alt="Bureau Reconnaissance Subject"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-700 ease-out select-none pointer-events-none"
              style={getFilterStyle()}
            />

            <div className="absolute inset-0 border border-[#d4af37]/30 pointer-events-none flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-[#d4af37]/40" />
              <div className="absolute w-full h-[1px] bg-[#d4af37]/20" />
              <div className="absolute h-full w-[1px] bg-[#d4af37]/20" />
            </div>

            <div className="absolute top-3 left-3 px-3 py-1 rounded bg-[#0b121d]/90 border border-[#d4af37] text-xs font-['Space_Mono'] text-[#ffd700] font-bold">
              Potential: {potentialScore} PTS (Stage {revealStep + 1}/4)
            </div>
          </div>

          <div className="w-full lg:w-80 bg-[#121d2e] border border-[#d4af37]/50 rounded-lg p-5 flex flex-col gap-4 shadow-xl">
            {!hasBuzzed ? (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-[#0d1624] rounded border border-slate-700 text-xs font-['Courier_Prime'] text-slate-300">
                  <span className="text-amber-300 font-bold block mb-1">Archival Hint:</span>
                  {challenge.visualHint}
                </div>

                <button
                  onClick={handleBuzzIn}
                  className="w-full py-4 rounded bg-gradient-to-r from-[#d4af37] to-[#ffd700] hover:brightness-110 text-[#0a101d] font-['Cinzel'] font-extrabold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                >
                  <Zap size={18} />
                  <span>Identify Subject ({potentialScore} Pts)</span>
                </button>

                {revealStep < 3 && (
                  <button
                    onClick={handleNextReveal}
                    className="w-full py-2.5 rounded bg-[#1b2b40] hover:bg-[#253d5a] border border-[#d4af37]/40 text-[#ffd700] font-['Cinzel'] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={15} />
                    <span>Sharpen Lens ({scoreImageReveal(challenge.id, revealStep + 1)} Pts)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 animate-in fade-in zoom-in-95">
                <span className="font-['Cinzel'] font-bold text-xs text-[#e6c875] uppercase tracking-wider">
                  Select Identified Subject:
                </span>
                {(challenge.options || [challenge.subjectName]).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(opt)}
                    className="w-full p-3 rounded bg-[#18283d] hover:bg-[#223957] border border-[#d4af37]/40 hover:border-[#ffd700] text-left text-xs font-['Cinzel'] font-bold text-white transition-all shadow"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <CommentaryPlaque
          score={earnedScore}
          playerName={currentPlayer.name}
          roundType="IMAGE_REVEAL"
          questionPrompt={challenge.prompt}
          explanation={challenge.explanation}
          source={challenge.source}
          isCorrect={earnedScore > 0}
          onProceed={() => onComplete(earnedScore)}
        />
      )}
    </div>
  );
};
