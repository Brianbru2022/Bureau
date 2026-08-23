import React, { useState } from 'react';
import type { Player } from '../../types';
import { PORTRAIT_ART } from '../../data/visualAssets';

interface BureauAvatarProps {
  player?: Pick<Player, 'avatar' | 'portraitIndex' | 'name'>;
  avatar?: string;
  portraitIndex?: number;
  size?: number;
  className?: string;
  variant?: 'avatar' | 'card';
}

export const BureauAvatar: React.FC<BureauAvatarProps> = ({
  player,
  avatar,
  portraitIndex,
  size = 44,
  className = '',
  variant = 'avatar'
}) => {
  const [failed, setFailed] = useState(false);
  const index = player?.portraitIndex ?? portraitIndex;
  const fallback = player?.avatar ?? avatar ?? '🧐';
  const src = index !== undefined ? PORTRAIT_ART[index % PORTRAIT_ART.length] : undefined;
  const width = size;
  const height = variant === 'card' ? Math.round(size * 1.28) : size;

  if (src && !failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden border-2 border-[#765139] bg-[#efe0ba] shadow-sm ${variant === 'card' ? 'rounded-[18px] p-1.5' : 'rounded-xl'} ${className}`}
        style={{ width, height }}
      >
        <img
          src={src}
          alt={player?.name ? `${player.name} portrait` : 'Bureau candidate'}
          onError={() => setFailed(true)}
          className={`block h-full w-full ${variant === 'card' ? 'object-contain' : 'object-cover'}`}
          style={variant === 'avatar' ? { objectPosition: '50% 20%' } : undefined}
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width, height, fontSize: size * .58 }}
    >
      {fallback}
    </span>
  );
};
