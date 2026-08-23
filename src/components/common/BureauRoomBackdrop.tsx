import React from 'react';
import { BureauScenery } from './BureauScenery';

interface BackdropProps {
  roomName?: string;
  children: React.ReactNode;
}

export const BureauRoomBackdrop: React.FC<BackdropProps> = ({ roomName = '', children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#d9cba7] text-[#263238] flex flex-col font-['Plus_Jakarta_Sans']">
      <BureauScenery roomName={roomName} />

      {/* Warm daylight wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,251,223,.88),transparent_43%),linear-gradient(to_bottom,rgba(255,255,255,.12),rgba(94,61,36,.06))]" />

      {/* Main playable glass/paper stage */}
      <div className="relative z-20 flex-1 flex flex-col w-full max-w-[1480px] mx-auto px-3 sm:px-6 py-3 sm:py-5">
        <div className="relative flex-1 flex flex-col rounded-[30px] border-[4px] border-[#7e5c24] bg-[#fff7df]/88 backdrop-blur-[3px] shadow-[0_12px_0_#7b4f32,0_24px_55px_rgba(57,43,29,.26)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-3 bg-[linear-gradient(90deg,#2f8f95_0_19%,#e0a83f_19%_39%,#d9644f_39%_59%,#4f7457_59%_79%,#376d9b_79%)]" />
          <div className="relative flex-1 flex flex-col p-3 sm:p-5 pt-5 sm:pt-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
