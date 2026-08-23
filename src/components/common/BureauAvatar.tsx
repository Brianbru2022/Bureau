import React, { useState } from 'react';
import type { Player } from '../../types';
import { PORTRAIT_ART } from '../../data/visualAssets';

interface BureauAvatarProps {
  player?: Pick<Player, 'avatar' | 'portraitIndex' | 'name'>;
  avatar?: string;
  portraitIndex?: number;
  size?: number;
  className?: string;
}

export const BureauAvatar: React.FC<BureauAvatarProps> = ({ player, avatar, portraitIndex, size = 44, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const index = player?.portraitIndex ?? portraitIndex;
  const fallback = player?.avatar ?? avatar ?? '🧐';
  const src = index !== undefined ? PORTRAIT_ART[index % PORTRAIT_ART.length] : undefined;

  if (src && !failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#765139] bg-[#efe0ba] shadow-sm ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt={player?.name ? `${player.name} portrait` : 'Bureau candidate'}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          style={{ objectPosition: '50% 28%', transform: 'scale(1.22)' }}
        />
      </span>
    );
  }

  return <span className={`inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size, fontSize: size * .58 }}>{fallback}</span>;
};
