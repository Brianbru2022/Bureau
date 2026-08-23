import React from 'react';

type BureauSceneryProps = {
  roomName?: string;
};

const paletteForRoom = (roomName = '') => {
  const room = roomName.toLowerCase();
  if (room.includes('ordnance') || room.includes('cartograph')) return { primary: '#2f8f95', secondary: '#67c4c1', accent: '#d9644f' };
  if (room.includes('risk') || room.includes('confidence') || room.includes('vault')) return { primary: '#a9443d', secondary: '#d9644f', accent: '#e0a83f' };
  if (room.includes('records') || room.includes('archive') || room.includes('registry')) return { primary: '#376d9b', secondary: '#e0a83f', accent: '#d9644f' };
  if (room.includes('visual') || room.includes('reconnaissance')) return { primary: '#6d5e97', secondary: '#d9644f', accent: '#67c4c1' };
  if (room.includes('statistics')) return { primary: '#4f7457', secondary: '#67c4c1', accent: '#e0a83f' };
  return { primary: '#2f8f95', secondary: '#e0a83f', accent: '#d9644f' };
};

export const BureauScenery: React.FC<BureauSceneryProps> = ({ roomName = '' }) => {
  const palette = paletteForRoom(roomName);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Sunlit institutional wall */}
      <div className="absolute inset-0 bg-[#d9cba7]" />
      <div className="absolute inset-x-0 top-0 h-[58%] bureau-room-grid opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[#b4865c]" />
      <div className="absolute inset-x-0 bottom-[39%] h-5 bg-[#73482f] shadow-[0_5px_0_rgba(71,44,27,.2)]" />

      {/* Left filing tower */}
      <div className="absolute -left-14 bottom-[8%] hidden h-[58%] w-48 rotate-[-1.5deg] rounded-[28px] border-[5px] border-[#6f4933] bg-[#f0d790] shadow-[18px_20px_0_rgba(94,60,37,.18)] lg:block">
        <div className="absolute inset-x-4 top-5 h-10 rounded-xl bg-[#2f8f95] bureau-enamel" />
        {[0,1,2,3,4].map(i => (
          <div key={i} className="absolute left-5 right-5 h-[13%] rounded-xl border-2 border-[#8f643e] bg-[#f7e6b7] shadow-inner" style={{ top: `${19 + i * 15}%` }}>
            <div className="absolute left-1/2 top-1/2 h-3 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b7882f] shadow-[inset_0_1px_0_#fff4c2]" />
          </div>
        ))}
      </div>

      {/* Right pneumatic apparatus */}
      <div className="absolute -right-10 top-[12%] hidden h-[56%] w-52 xl:block">
        <div className="absolute right-16 top-0 h-[82%] w-12 rounded-full border-4 border-[#8c6546] bg-[#b8e0dc]/70 shadow-[inset_7px_0_0_rgba(255,255,255,.26)]" />
        <div className="absolute right-8 top-[12%] h-24 w-24 rounded-full border-[7px] border-[#7e5c24] bg-[#f0d790] shadow-[0_8px_0_rgba(93,61,34,.2)]">
          <div className="absolute inset-3 rounded-full" style={{ backgroundColor: palette.primary }} />
          <div className="absolute left-1/2 top-1/2 h-1 w-8 origin-left -translate-y-1/2 rotate-[-32deg] rounded bg-[#fff7df]" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff7df]" />
        </div>
        <div className="absolute right-3 bottom-0 h-32 w-36 rounded-[28px] border-[5px] border-[#724a31] bureau-enamel" style={{ backgroundColor: palette.secondary }}>
          <div className="absolute left-5 right-5 top-5 h-8 rounded-lg bg-[#fff1bd] border-2 border-[#7e5c24]" />
          <div className="bureau-lamp absolute bottom-7 left-7 h-5 w-5 rounded-full bg-[#ffd55c] border-2 border-[#7e5c24]" />
          <div className="absolute bottom-6 right-7 h-8 w-8 rounded-full border-4 border-[#7e5c24]" style={{ backgroundColor: palette.accent }} />
        </div>
      </div>

      {/* Hanging lamps */}
      <div className="absolute left-[12%] top-0 hidden h-28 w-1 bg-[#6f4933] md:block" />
      <div className="absolute left-[calc(12%-32px)] top-24 hidden h-12 w-16 rounded-t-full border-4 border-[#6f4933] bg-[#4f7457] shadow-[0_12px_28px_rgba(255,225,133,.2)] md:block" />
      <div className="bureau-lamp absolute left-[calc(12%-6px)] top-[130px] hidden h-3 w-3 rounded-full bg-[#ffd65f] md:block" />

      {/* Centre desk silhouette, kept low so game UI sits above it */}
      <div className="absolute bottom-[-86px] left-1/2 h-40 w-[64%] min-w-[620px] -translate-x-1/2 rounded-[50%_50%_0_0] border-[6px] border-[#68422d] bg-[#865938] shadow-[0_-7px_0_#a97951,0_-18px_32px_rgba(55,40,28,.14)]" />

      {/* Loose colourful folders */}
      <div className="absolute bottom-8 left-[18%] hidden h-4 w-32 rotate-[-7deg] rounded-sm bg-[#d9644f] shadow-[0_4px_0_rgba(94,60,37,.2)] lg:block" />
      <div className="absolute bottom-11 left-[20%] hidden h-4 w-28 rotate-[3deg] rounded-sm bg-[#e0a83f] shadow-[0_4px_0_rgba(94,60,37,.2)] lg:block" />
    </div>
  );
};
