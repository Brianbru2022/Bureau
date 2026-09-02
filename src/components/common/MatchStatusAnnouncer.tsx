import { useEffect, useRef, useState } from 'react';
import type { GamePhase, Player } from '../../types';

interface MatchStatusAnnouncerProps {
  players: Player[];
  phase: GamePhase;
  activePlayerName?: string;
  roundName?: string;
}

export const MatchStatusAnnouncer = ({ players, phase, activePlayerName, roundName }: MatchStatusAnnouncerProps) => {
  const previousScores = useRef<Record<string, number>>({});
  const previousTurn = useRef<string | undefined>(undefined);
  const previousPhase = useRef<GamePhase | undefined>(undefined);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const messages: string[] = [];
    for (const player of players) {
      const previous = previousScores.current[player.id];
      if (previous !== undefined && previous !== player.score) {
        const delta = player.score - previous;
        messages.push(`${player.name} ${delta >= 0 ? 'gained' : 'lost'} ${Math.abs(delta).toLocaleString()} points. Total ${player.score.toLocaleString()}.`);
      }
      previousScores.current[player.id] = player.score;
    }
    if (activePlayerName && previousTurn.current !== activePlayerName && phase === 'PLAYING_ROUND') {
      messages.push(`${activePlayerName} is now active.`);
    }
    if (previousPhase.current !== phase && phase === 'ROOM_TRANSITION' && roundName) {
      messages.push(`Next department: ${roundName}.`);
    }
    previousTurn.current = activePlayerName;
    previousPhase.current = phase;
    if (messages.length) setAnnouncement(messages.join(' '));
  }, [activePlayerName, phase, players, roundName]);

  return <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>;
};
