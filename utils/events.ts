import { EventType } from '../types';

export function getEventDisplayName(type: EventType): string {
  const names: Record<EventType, string> = {
    nursing: 'Nursing',
    sleep: 'Sleep',
    diaper: 'Diaper change',
    pumping: 'Pumping',
    bottle: 'Bottle feed',
    solids: 'Solid food'
  };
  return names[type];
}