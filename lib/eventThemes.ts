export interface EventVisualTheme {
  accent: string;
  secondary: string;
  gradient: string;
  pillClass: string;
  glowRgba: string;
  patternBg: string;
}

const CATEGORY_THEMES: Record<string, EventVisualTheme> = {
  'Hackathon': {
    accent: '#22D3EE',
    secondary: '#3B82F6',
    gradient: 'linear-gradient(135deg, #0E7490 0%, #1D4ED8 55%, #312E81 100%)',
    pillClass: 'border-cyan-400/35 bg-cyan-500/15 text-cyan-200',
    glowRgba: 'rgba(34, 211, 238, 0.25)',
    patternBg: 'radial-gradient(circle at 80% 20%, rgba(34,211,238,0.35), transparent 50%), radial-gradient(circle at 20% 80%, rgba(99,102,241,0.35), transparent 55%)',
  },
  'Tech Competition': {
    accent: '#A78BFA',
    secondary: '#6366F1',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #3730A3 55%, #0F172A 100%)',
    pillClass: 'border-violet-400/35 bg-violet-500/15 text-violet-200',
    glowRgba: 'rgba(167, 139, 250, 0.25)',
    patternBg: 'radial-gradient(circle at 75% 25%, rgba(167,139,250,0.38), transparent 50%), radial-gradient(circle at 15% 85%, rgba(56,189,248,0.28), transparent 55%)',
  },
  'Music Concert': {
    accent: '#FB7185',
    secondary: '#F59E0B',
    gradient: 'linear-gradient(135deg, #9F1239 0%, #C026D3 55%, #EA580C 100%)',
    pillClass: 'border-rose-400/35 bg-rose-500/15 text-rose-200',
    glowRgba: 'rgba(251, 113, 133, 0.28)',
    patternBg: 'radial-gradient(circle at 85% 20%, rgba(251,113,133,0.42), transparent 48%), radial-gradient(circle at 20% 75%, rgba(245,158,11,0.35), transparent 55%)',
  },
  'Cultural Fest': {
    accent: '#FBBF24',
    secondary: '#F97316',
    gradient: 'linear-gradient(135deg, #B45309 0%, #DB2777 55%, #581C87 100%)',
    pillClass: 'border-amber-400/35 bg-amber-500/15 text-amber-200',
    glowRgba: 'rgba(251, 191, 36, 0.26)',
    patternBg: 'radial-gradient(circle at 80% 25%, rgba(251,191,36,0.38), transparent 50%), radial-gradient(circle at 20% 80%, rgba(236,72,153,0.35), transparent 55%)',
  },
  'Sports Event': {
    accent: '#34D399',
    secondary: '#10B981',
    gradient: 'linear-gradient(135deg, #065F46 0%, #0D9488 55%, #0F172A 100%)',
    pillClass: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200',
    glowRgba: 'rgba(52, 211, 153, 0.25)',
    patternBg: 'radial-gradient(circle at 80% 20%, rgba(52,211,153,0.38), transparent 48%), radial-gradient(circle at 15% 80%, rgba(14,165,233,0.3), transparent 55%)',
  },
  'Workshop': {
    accent: '#38BDF8',
    secondary: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0369A1 0%, #1E40AF 55%, #111827 100%)',
    pillClass: 'border-sky-400/35 bg-sky-500/15 text-sky-200',
    glowRgba: 'rgba(56, 189, 248, 0.25)',
    patternBg: 'radial-gradient(circle at 75% 20%, rgba(56,189,248,0.35), transparent 50%), radial-gradient(circle at 25% 80%, rgba(99,102,241,0.28), transparent 55%)',
  },
  'Conference': {
    accent: '#818CF8',
    secondary: '#EC4899',
    gradient: 'linear-gradient(135deg, #312E81 0%, #6D28D9 55%, #0F172A 100%)',
    pillClass: 'border-indigo-400/35 bg-indigo-500/15 text-indigo-200',
    glowRgba: 'rgba(129, 140, 248, 0.25)',
    patternBg: 'radial-gradient(circle at 80% 25%, rgba(129,140,248,0.35), transparent 50%), radial-gradient(circle at 15% 85%, rgba(236,72,153,0.25), transparent 55%)',
  },
  'Meetup': {
    accent: '#2DD4BF',
    secondary: '#3B82F6',
    gradient: 'linear-gradient(135deg, #115E59 0%, #1D4ED8 55%, #0F172A 100%)',
    pillClass: 'border-teal-400/35 bg-teal-500/15 text-teal-200',
    glowRgba: 'rgba(45, 212, 191, 0.24)',
    patternBg: 'radial-gradient(circle at 80% 20%, rgba(45,212,191,0.35), transparent 50%), radial-gradient(circle at 20% 80%, rgba(59,130,246,0.28), transparent 55%)',
  },
  'Webinar': {
    accent: '#60A5FA',
    secondary: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #4338CA 55%, #090D16 100%)',
    pillClass: 'border-blue-400/35 bg-blue-500/15 text-blue-200',
    glowRgba: 'rgba(96, 165, 250, 0.24)',
    patternBg: 'radial-gradient(circle at 80% 20%, rgba(96,165,250,0.35), transparent 50%), radial-gradient(circle at 20% 80%, rgba(139,92,246,0.28), transparent 55%)',
  },
  'Social': {
    accent: '#F472B6',
    secondary: '#FB923C',
    gradient: 'linear-gradient(135deg, #9D174D 0%, #EA580C 55%, #3B0764 100%)',
    pillClass: 'border-pink-400/35 bg-pink-500/15 text-pink-200',
    glowRgba: 'rgba(244, 114, 182, 0.26)',
    patternBg: 'radial-gradient(circle at 82% 20%, rgba(244,114,182,0.4), transparent 48%), radial-gradient(circle at 18% 82%, rgba(251,146,60,0.35), transparent 55%)',
  },
};

const DEFAULT_THEME: EventVisualTheme = {
  accent: '#F59E0B',
  secondary: '#EC4899',
  gradient: 'linear-gradient(135deg, #1E293B 0%, #312E81 55%, #0F172A 100%)',
  pillClass: 'border-slate-400/35 bg-slate-500/15 text-slate-200',
  glowRgba: 'rgba(148, 163, 184, 0.22)',
  patternBg: 'radial-gradient(circle at 80% 20%, rgba(245,158,11,0.3), transparent 50%), radial-gradient(circle at 20% 80%, rgba(99,102,241,0.28), transparent 55%)',
};

export function getEventTheme(category?: string): EventVisualTheme {
  return (category && CATEGORY_THEMES[category]) || DEFAULT_THEME;
}

export function getCalendarBadgeParts(dateStr?: string): { month: string; day: string } {
  if (!dateStr) return { month: 'TBA', day: '--' };
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(d.getTime())) {
      return {
        month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        day: String(d.getDate()).padStart(2, '0'),
      };
    }
  }
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return { month: 'TBA', day: '--' };
  return {
    month: parsed.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(parsed.getDate()).padStart(2, '0'),
  };
}

