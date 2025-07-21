export interface BabyProfile {
  id: string;
  name: string;
  birthdate: Date;
  shareCode: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'guest';
  linkedBabies: string[];
}

export type EventType = 'nursing' | 'sleep' | 'diaper' | 'pumping' | 'bottle' | 'solids';

export type NursingSide = 'left' | 'right';

export interface Event {
  id: string;
  type: EventType;
  timestamp: Date;
  duration?: number;
  notes?: string;
  side?: NursingSide;
  babyId: string;
}

export interface NursingEvent extends Event {
  type: 'nursing';
  side: NursingSide;
  duration: number;
}