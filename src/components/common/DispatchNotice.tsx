import React from 'react';
import { Send } from 'lucide-react';

export interface DispatchNoticeCopy { eyebrow:string; title:string; detail:string }

export const DispatchNotice:React.FC<{notice:DispatchNoticeCopy}> = ({notice}) => (
  <div data-testid="dispatch-notice" className="fixed inset-0 z-[80] flex items-center justify-center bg-[#183138]/45 p-4" role="status" aria-live="assertive">
    <div className="bureau-paper animate-in fade-in zoom-in-95 duration-300 w-full max-w-lg rounded-[24px] border-[4px] border-[#765139] p-5 text-center shadow-[0_10px_0_#5a3925,0_24px_40px_rgba(57,35,20,.4)]">
      <Send className="mx-auto mb-2 text-[#2f8f95]" size={30}/>
      <span className="font-['Courier_Prime'] text-xs font-black uppercase tracking-[.18em] text-[#a9443d]">{notice.eyebrow}</span>
      <h2 className="mt-1 font-['Cinzel'] text-xl font-black text-[#244b55]">{notice.title}</h2>
      <p className="mt-2 font-['Fraunces'] text-sm text-[#665348]">{notice.detail}</p>
    </div>
  </div>
);
