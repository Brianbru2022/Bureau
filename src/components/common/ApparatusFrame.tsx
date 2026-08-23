import React from 'react';

interface ApparatusFrameProps {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
  instrumentLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export const ApparatusFrame: React.FC<ApparatusFrameProps> = ({
  eyebrow,
  title,
  subtitle,
  icon,
  accent = '#1e9fa8',
  instrumentLabel,
  children,
  className = ''
}) => (
  <section className={`relative w-full overflow-hidden rounded-[28px] border-[4px] border-[#6e4b31] bg-[#f3e5c4] shadow-[0_20px_0_#5a3925,0_30px_55px_rgba(57,35,20,.3)] ${className}`}>
    <div className="absolute inset-x-0 top-0 h-4" style={{ background: accent }} />
    <div className="absolute left-3 top-3 h-4 w-4 rounded-full border-2 border-[#74522f] bg-[#d8af58] shadow-inner" />
    <div className="absolute right-3 top-3 h-4 w-4 rounded-full border-2 border-[#74522f] bg-[#d8af58] shadow-inner" />
    <div className="absolute bottom-3 left-3 h-4 w-4 rounded-full border-2 border-[#74522f] bg-[#d8af58] shadow-inner" />
    <div className="absolute bottom-3 right-3 h-4 w-4 rounded-full border-2 border-[#74522f] bg-[#d8af58] shadow-inner" />

    <header className="relative border-b-[3px] border-[#7b5a38] bg-[#fff7df] px-6 pb-5 pt-8 text-[#253744] sm:px-8">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[#6e4b31] text-white shadow-[0_5px_0_#6e4b31]" style={{ background: accent }}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-['Courier_Prime'] text-[10px] font-bold uppercase tracking-[.22em] text-[#7a5940]">{eyebrow}</div>
          <h2 className="font-['Cinzel'] text-xl font-black leading-tight text-[#263b48] sm:text-2xl">{title}</h2>
          {subtitle && <div className="mt-1 font-['Fraunces'] text-sm text-[#5d5346]">{subtitle}</div>}
        </div>
        {instrumentLabel && (
          <span className="hidden rotate-2 rounded-md border-2 border-[#6e4b31] bg-[#f7d86d] px-3 py-1 font-['Courier_Prime'] text-[9px] font-black uppercase tracking-widest text-[#5e432b] shadow-[0_3px_0_#6e4b31] sm:block">
            {instrumentLabel}
          </span>
        )}
      </div>
    </header>

    <div className="relative p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-x-5 top-0 h-2 rounded-b-full bg-[#cda96a]/55" />
      {children}
    </div>
  </section>
);
