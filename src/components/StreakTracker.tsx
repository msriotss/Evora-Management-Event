import React from 'react';
import { Check, Gamepad2, Calendar, Trophy, Sparkles, Snowflake, Flame } from 'lucide-react';
import { StreakState } from '../types/evora';
import { StreakFlameBadge } from './StreakFlameBadge';

interface StreakTrackerProps {
  streak: StreakState;
  onToggleGoal: (goalId: string) => void;
  onToggleFreeze: () => void;
  onOpenGame: () => void;
  onCreateEventClick: () => void;
}

const DAILY_GOALS = [
  {
    id: 'goal-map',
    title: 'Cek lokasi event di Google Maps',
    points: 10,
    color: '#377EC0',
  },
  {
    id: 'goal-panitia',
    title: 'Susun atau review jadwal panitia',
    points: 20,
    color: '#F7891F',
  },
  {
    id: 'goal-quest',
    title: 'Mainkan 1 ronde EVORA Panitia Rush',
    points: 25,
    color: '#12BAAA',
  },
];

const MICROPETS = [
  { id: 'koko-kamera', name: 'Koko Kamera', color: '#377EC0', bg: '#E6F4FA' },
  { id: 'mika-mic', name: 'Mika Mic', color: '#F7891F', bg: '#FFF4E5' },
  { id: 'bimo-baju', name: 'Bimo Baju', color: '#F04F52', bg: '#FDECEC' },
  { id: 'kala-kalender', name: 'Kala Kalender', color: '#12BAAA', bg: '#E6F9F7' },
];

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  streak,
  onToggleGoal,
  onToggleFreeze,
  onOpenGame,
  onCreateEventClick,
}) => {
  const hostProgress = Math.min(
    100,
    Math.round((streak.monthlyEventsHosted / streak.monthlyHostGoal) * 100)
  );

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <section id="streak-panitia" className="py-8 md:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: TikTok-Style Monthly Panitia Streak Card */}
          <div
            className={`lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 border flex flex-col justify-between gap-6 transition-all duration-700 ease-in-out ${
              streak.isFrozen
                ? 'border-[#377EC0]/50 shadow-xl shadow-[#377EC0]/20 ring-2 ring-[#9FD2D6]/50'
                : 'border-[#9FD2D6]/50 shadow-xl shadow-[#377EC0]/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <StreakFlameBadge isFrozen={streak.isFrozen} days={streak.currentDays} size="md" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#377EC0]">
                      Streak Panitia Bulanan
                    </p>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 transition-all duration-500 ${
                        streak.isFrozen
                          ? 'bg-[#E8F5FA] text-[#377EC0] border border-[#377EC0]/40 shadow-sm shadow-[#377EC0]/20'
                          : 'bg-[#FFF4E5] text-[#F7891F] border border-[#FBDF54]'
                      }`}
                    >
                      {streak.isFrozen ? (
                        <>
                          <Snowflake className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} /> Api Beku
                        </>
                      ) : (
                        <>
                          <Flame className="w-3 h-3" /> Api Menyala
                        </>
                      )}
                    </span>
                  </div>
                  <h2 className="font-pixel text-2xl sm:text-3xl text-slate-900 leading-tight mt-0.5 transition-colors duration-500">
                    {streak.isFrozen
                      ? `${streak.currentDays} Hari Dibekukan (Aman)`
                      : `${streak.currentDays} Hari Api Menyala!`}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    Rekor: {streak.longestDays} hari · Token Es: {streak.freezeTokens} · Tier:{' '}
                    <strong className="text-[#377EC0]">
                      {streak.monthlyEventsHosted >= 5
                        ? 'Super Rainbow'
                        : streak.monthlyEventsHosted >= 3
                        ? 'Blue Flame'
                        : 'Starter Flame'}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onToggleFreeze}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-extrabold border transition-all duration-500 whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                    streak.isFrozen
                      ? 'bg-[#FFF4E5] hover:bg-[#FBDF54]/40 text-[#F7891F] border-[#FBDF54]'
                      : 'bg-[#E8F5FA] hover:bg-[#9FD2D6]/50 text-[#377EC0] border-[#9FD2D6]'
                  }`}
                >
                  {streak.isFrozen ? (
                    <>
                      <Flame className="w-3.5 h-3.5" /> Nyalakan Api
                    </>
                  ) : (
                    <>
                      <Snowflake className="w-3.5 h-3.5" /> Bekukan Api
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onCreateEventClick}
                  className="px-4 py-2.5 rounded-2xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold shadow-md shadow-[#377EC0]/20 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  + Ikut / Buat Event Panitia
                </button>
              </div>
            </div>

            {/* Monthly Panitia Goal Meter */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#EBF6FA] border border-[#9FD2D6]/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-extrabold text-slate-800 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#F7891F]" />
                  Target Jadi Panitia Bulan Ini (Nov 2026)
                </span>
                <span className="font-pixel text-base text-[#377EC0] tabular-nums">
                  {streak.monthlyEventsHosted} / {streak.monthlyHostGoal} Event
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-white overflow-hidden border border-[#9FD2D6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#377EC0] via-[#12BAAA] to-[#FBDF54] transition-all duration-500"
                  style={{ width: `${hostProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600">
                Setiap kali mengajukan atau mengelola event sebagai panitia, streak bulananmu bertambah otomatis seperti streak TikTok!
              </p>
            </div>

            {/* Monthly Streak Calendar Grid (Nov 2026) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#377EC0]" />
                  Kalender Aktivitas November 2026
                </span>
                <span className="text-[11px] font-bold text-[#12BAAA] tabular-nums">
                  {streak.activeDaysInMonth.length} hari aktif · {streak.monthlyEventsJoined} event diikuti
                </span>
              </div>
              <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                {daysInMonth.map((day) => {
                  const isActive = streak.activeDaysInMonth.includes(day);
                  const isToday = day === 25;
                  return (
                    <div
                      key={day}
                      className={`h-8 sm:h-9 rounded-xl flex items-center justify-center text-xs font-extrabold tabular-nums transition-transform ${
                        isToday
                          ? 'bg-[#F7891F] text-white ring-2 ring-[#FBDF54] shadow-sm scale-105'
                          : isActive
                          ? 'bg-[#377EC0] text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                      title={`Nov ${day}: ${isActive ? 'Streak Aktif' : 'Belum aktif'}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Finch-Style Daily Quests + Micropets + Game Launcher */}
          <div className="lg:col-span-5 bg-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-[#377EC0]/10 border border-[#9FD2D6]/50 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#12BAAA]">
                    Misi & Koleksi
                  </p>
                  <h3 className="font-pixel text-xl text-slate-900">
                    Misi Harian & Micropet
                  </h3>
                </div>
                <span className="font-pixel text-sm px-3 py-1 rounded-xl bg-[#FBDF54]/40 text-slate-900 tabular-nums">
                  Skor: {streak.questBestScore}
                </span>
              </div>

              {/* Daily Checkable Goals (Finch-inspired) */}
              <div className="space-y-2.5">
                {DAILY_GOALS.map((goal) => {
                  const done = streak.completedDailyGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => onToggleGoal(goal.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        done
                          ? 'bg-[#E6F9F7] border-[#12BAAA]/40'
                          : 'bg-slate-50 border-slate-100 hover:border-[#9FD2D6]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                          style={{ backgroundColor: goal.color }}
                        >
                          {done ? <Check className="w-4 h-4" /> : '+'}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              done ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {goal.title}
                          </p>
                          <p className="text-[11px] font-bold text-[#F7891F] tabular-nums">
                            +{goal.points} Poin Streak
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Micropet Collection (from reference image!) */}
              <div>
                <p className="text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F7891F]" />
                  Koleksi Maskot Event ({streak.unlockedPets.length}/4)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {MICROPETS.map((pet) => {
                    const unlocked = streak.unlockedPets.includes(pet.id);
                    return (
                      <div
                        key={pet.id}
                        className={`p-2 rounded-2xl text-center border transition-all ${
                          unlocked
                            ? 'border-[#9FD2D6] shadow-sm'
                            : 'bg-slate-100 border-slate-200 opacity-50 grayscale'
                        }`}
                        style={{ backgroundColor: unlocked ? pet.bg : undefined }}
                      >
                        <div
                          className="w-8 h-8 mx-auto rounded-xl flex items-center justify-center text-white font-pixel text-xs mb-1"
                          style={{ backgroundColor: pet.color }}
                        >
                          {pet.name.slice(0, 2)}
                        </div>
                        <p className="text-[10px] font-bold text-slate-800 truncate">
                          {pet.name.split(' ')[0]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Game Launcher CTA */}
            <button
              type="button"
              onClick={onOpenGame}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#377EC0] to-[#5460AC] hover:opacity-95 text-white text-sm font-extrabold shadow-lg shadow-[#377EC0]/25 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Gamepad2 className="w-5 h-5 text-[#FBDF54]" />
              <span className="font-pixel text-base">Mainkan EVORA Panitia Rush!</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
