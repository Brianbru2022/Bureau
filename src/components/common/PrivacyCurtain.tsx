import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { EyeOff, LockKeyhole, UserCheck } from 'lucide-react';
import type { Player } from '../../types';
import { sound } from '../../sound/audioEngine';
import { BureauAvatar } from './BureauAvatar';

interface PrivacyCurtainProps {
  recipient: Player;
  purpose: string;
  confirmationLabel: string;
  onConfirm: () => void;
}

export const PrivacyCurtain = ({ recipient, purpose, confirmationLabel, onConfirm }: PrivacyCurtainProps) => {
  const titleId = useId();
  const detailId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    confirmRef.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  const confirm = () => {
    sound.playPneumatic();
    onConfirm();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={detailId}
      data-testid="privacy-curtain"
      className="bureau-privacy-curtain"
      onKeyDown={event => {
        if (event.key === 'Tab') {
          event.preventDefault();
          confirmRef.current?.focus();
        }
      }}
    >
      <div className="bureau-privacy-curtain__shutter" aria-hidden="true" />
      <section className="bureau-privacy-curtain__dossier">
        <div className="bureau-privacy-curtain__seal" aria-hidden="true"><LockKeyhole size={30}/></div>
        <span className="font-['Courier_Prime'] text-xs font-black uppercase tracking-[.22em] text-[#f0c65f]">Confidential handover</span>
        <h2 id={titleId} className="mt-2 font-['Cinzel'] text-2xl font-black text-[#fff4d4] sm:text-4xl">Pass to {recipient.name}</h2>
        <div className="my-5 flex items-center justify-center gap-4 rounded-2xl border-2 border-[#c89b4d] bg-[#fff4d4] p-4 text-left text-[#244b55] shadow-[0_5px_0_#4b3023]">
          <BureauAvatar player={recipient} size={64}/>
          <div><span className="block font-['Courier_Prime'] text-xs font-black uppercase tracking-widest text-[#a9443d]">Authorised candidate</span><strong className="font-['Cinzel'] text-xl">{recipient.name}</strong></div>
        </div>
        <p id={detailId} className="mx-auto max-w-lg font-['Fraunces'] text-base leading-relaxed text-[#e9dfc5]">{purpose} Other candidates should look away until the next handover notice appears.</p>
        <div className="mt-5 flex items-center justify-center gap-2 font-['Courier_Prime'] text-xs font-bold uppercase tracking-wider text-[#d5c39a]"><EyeOff size={17}/>Screen contents remain concealed</div>
        <button ref={confirmRef} type="button" onClick={confirm} className="bureau-button mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#f0c65f] bg-[#d75f4e] px-5 py-3 font-['Cinzel'] text-sm font-black uppercase tracking-wide text-white shadow-[0_6px_0_#4b3023] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#fff4d4]"><UserCheck size={21}/>{confirmationLabel}</button>
      </section>
    </div>,
    document.body,
  );
};
