import { BatteryLow, Brain, Frown, Smile, Zap } from 'lucide-react';

export const MOODS = [
  { id: 'energized', key: 'energized', label: 'Energized', Icon: Zap, color: '#d97706', softColor: '#fffbeb' },
  { id: 'focused', key: 'focused', label: 'Focused', Icon: Brain, color: '#16a34a', softColor: '#f0fdf4' },
  { id: 'happy', key: 'happy', label: 'Happy', Icon: Smile, color: '#2563eb', softColor: '#eff6ff' },
  { id: 'tired', key: 'tired', label: 'Tired', Icon: BatteryLow, color: '#64748b', softColor: '#f1f5f9' },
  { id: 'stressed', key: 'stressed', label: 'Stressed', Icon: Frown, color: '#dc2626', softColor: '#fef2f2' },
];

export const FOCUS_MOODS = MOODS.filter((mood) => mood.id !== 'happy');

export function getMoodMeta(moodId) {
  return MOODS.find((mood) => mood.id === moodId) || {
    id: moodId,
    key: moodId,
    label: moodId ? moodId.charAt(0).toUpperCase() + moodId.slice(1) : 'Unknown',
    Icon: Brain,
    color: '#64748b',
    softColor: '#f1f5f9',
  };
}
