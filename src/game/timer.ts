export const tickTurnTimer = (remaining:number, paused:boolean):number => paused ? remaining : Math.max(0,remaining-1);
