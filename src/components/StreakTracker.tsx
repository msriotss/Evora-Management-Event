import React from 'react';
import { Check, Gamepad2, Calendar, Trophy, Sparkles, Snowflake, Flame } from 'lucide-react';
import { StreakState } from '../types/evora';
import { StreakFlameBadge } from './StreakFlameBadge';

interface StreakTrackerProps {
  streak: StreakState;
  onToggleGoal: (goalId: string) => void;
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
  { id: 'koko-kamera', name: 'Koko Kamera', color: '#377EC0', bg: '#E8F5FA' },
  { id: 'mika-mic', name: 'Mika Mic', color: '#F7891F', bg: '#FFF4E5' },
  { id: 'bimo-baju', name: 'Bimo Baju', color: '#F04F52', bg: '#FDECEC' },
  { id: 'kala-kalender', name: 'Kala Kalender', color: '#12BAAA', bg: '#E6F9F7' },
];

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  streak,
  onToggleGoal,
  onOpenGame,
  onCreateEventClick,
}) => {
  const hostProgress = Math.min(
    100,
    Math.round((streak.monthlyEventsHosted / streak.monthlyHostGoal) * 100)
  );

  // November 2026 starts on Sunday (30 days)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const binderRings = [0, 1, 2, 3, 4, 5, 6];

  return (
    <section id="streak-panitia" className="py-8 md:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: Monthly Panitia Streak + Illustrated Blue Pixel Desk Calendar */}
          <div
            className={`lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 border-2 flex flex-col justify-between gap-6 transition-all duration-700 ease-in-out ${
              streak.isFrozen
                ? 'border-[#9FD2D6] shadow-[0_6px_0_rgba(55,126,192,0.16),0_18px_36px_-12px_rgba(55,126,192,0.18)]'
                : 'border-[#F7891F]/55 shadow-[0_6px_0_rgba(247,137,31,0.16),0_18px_36px_-12px_rgba(247,137,31,0.2)]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <StreakFlameBadge isFrozen={streak.isFrozen} days={streak.currentDays} size="md" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-arcade text-[10px] tracking-wider uppercase text-[#377EC0]">
                      Streak Panitia Bulanan
                    </p>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 transition-all duration-500 ${
                        streak.isFrozen
                          ? 'bg-[#E8F5FA] text-[#377EC0] border border-[#9FD2D6]'
                          : 'bg-[#FFF4E5] text-[#F7891F] border border-[#F7891F]/40'
                      }`}
                    >
                      {streak.isFrozen ? (
                        <>
                          <Snowflake className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} /> Api Beku
                        </>
                      ) : (
                        <>
                          <Flame className="w-3 h-3 fill-[#F7891F]" /> Api Menyala
                        </>
                      )}
                    </span>
                  </div>

                  <h2 className="font-pixel text-2xl sm:text-3xl text-[#0F2347] leading-tight mt-0.5 transition-colors duration-500">
                    {streak.isFrozen
                      ? 'Daftar & Ikut Panitia'
                      : `${streak.currentDays} Hari Api Menyala!`}
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    {streak.isFrozen ? (
                      <span>
                        Api streak menyala otomatis setelah kamu{' '}
                        <strong className="text-[#377EC0]">daftar akun & ikut kepanitiaan event</strong>.
                      </span>
                    ) : (
                      <span>
                        Aktif di Kepanitiaan · Rekor: {streak.longestDays} hari · Tier:{' '}
                        <strong className="text-[#F7891F]">
                          {streak.monthlyEventsHosted >= 5
                            ? 'Super Rainbow'
                            : streak.monthlyEventsHosted >= 3
                            ? 'Pixel Blaze'
                            : 'Starter Flame'}
                        </strong>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCreateEventClick}
                className="px-4 py-2.5 rounded-2xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-xs font-extrabold pixel-btn whitespace-nowrap shrink-0 cursor-pointer"
              >
                + Ikut / Buat Event Panitia
              </button>
            </div>

            {/* Monthly Panitia Goal Meter */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#E8F5FA] border-2 border-[#9FD2D6]/70 space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-extrabold text-[#0F2347] flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#F7891F]" />
                  Target Jadi Panitia Bulan Ini (Nov 2026)
                </span>
                <span className="font-arcade text-sm text-[#377EC0] tabular-nums">
                  {streak.monthlyEventsHosted} / {streak.monthlyHostGoal}
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-white overflow-hidden border border-[#377EC0]/25">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#377EC0] via-[#12BAAA] to-[#FBDF54] transition-all duration-500"
                  style={{ width: `${hostProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600">
                Bergabung jadi panitia di peta event atau ajukan event barumu — api streak menyala seketika!
              </p>
            </div>

            {/* ILLUSTRATED BLUE PIXEL DESK CALENDAR */}
            <div className="pt-2">
              {/* Spiral Binder Rings Above Calendar Top */}
              <div className="flex items-end justify-around px-8 -mb-2.5 relative z-10" aria-hidden="true">
                {binderRings.map((r) => (
                  <div key={r} className="flex flex-col items-center">
                    <div className="w-2.5 h-5 rounded-full bg-gradient-to-b from-white via-[#9FD2D6] to-[#377EC0] border border-[#1E4E7E]/50 shadow-sm" />
                  </div>
                ))}
              </div>

              {/* Calendar Frame */}
              <div className="rounded-[24px] border-2 border-[#377EC0] bg-white overflow-hidden shadow-[0_6px_0_#9FD2D6]">
                {/* Calendar Header Strip (Main Blue #377EC0 -> #5460AC) */}
                <div className="bg-gradient-to-r from-[#377EC0] via-[#377EC0] to-[#5460AC] px-4 sm:px-5 pt-4 pb-3 flex flex-wrap items-center justify-between gap-2 text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#FBDF54]" />
                    </span>
                    <div>
                      <p className="font-arcade text-xs sm:text-sm tracking-wider leading-none">
                        NOVEMBER 2026
                      </p>
                      <p className="text-[10px] font-bold text-[#E8F5FA] mt-0.5">
                        Kalender Aktivitas Panitia
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-white/15 border border-white/20 text-[10px] font-extrabold text-[#FBDF54] tabular-nums">
                    {streak.activeDaysInMonth.length} hari tercatat · {streak.monthlyEventsJoined} event
                  </span>
                </div>

                {/* Weekday Column Headers */}
                <div className="grid grid-cols-7 bg-[#E8F5FA] border-b border-[#9FD2D6] px-2.5 sm:px-3.5 py-2">
                  {WEEKDAYS.map((dayName, idx) => (
                    <div
                      key={dayName}
                      className={`text-center text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider ${
                        idx === 0 ? 'text-[#F04F52]' : 'text-[#377EC0]'
                      }`}
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Calendar Date Cells */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 bg-white">
                  {daysInMonth.map((day) => {
                    const isActive = streak.activeDaysInMonth.includes(day);
                    const isToday = day === 26;
                    const isSunday = (day - 1) % 7 === 0;
                    return (
                      <div
                        key={day}
                        className={`relative h-10 sm:h-11 rounded-xl border-2 flex flex-col items-center justify-center text-xs font-extrabold tabular-nums transition-all ${
                          isToday
                            ? streak.isFrozen
                              ? 'bg-[#E8F5FA] border-[#377EC0] text-[#0F2347] shadow-sm'
                              : 'bg-[#F7891F] border-[#FBDF54] text-white shadow-md scale-[1.04]'
                            : isActive
                            ? 'bg-[#E8F5FA] border-[#9FD2D6] text-[#377EC0]'
                            : 'bg-slate-50/75 border-slate-200/80 text-slate-400'
                        }`}
                        title={`Nov ${day}: ${
                          isToday
                            ? streak.isFrozen
                              ? 'Hari Ini (Daftar & ikut panitia untuk menyalakan api)'
                              : 'Hari Ini — Api Panitia Menyala!'
                            : isActive
                            ? 'Aktivitas Tercatat'
                            : 'Belum ada aktivitas'
                        }`}
                      >
                        <span className={isSunday && !isToday && !isActive ? 'text-[#F04F52]/65' : ''}>
                          {day}
                        </span>
                        {isToday ? (
                          <span className="mt-0.5 inline-flex items-center">
                            {streak.isFrozen ? (
                              <Snowflake className="w-2.5 h-2.5 text-[#377EC0]" />
                            ) : (
                              <Flame className="w-2.5 h-2.5 text-[#FBDF54] fill-[#FBDF54]" />
                            )}
                          </span>
                        ) : isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#12BAAA] mt-0.5" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Daily Quests + Micropets + Game Launcher */}
          <div className="lg:col-span-5 bg-white rounded-[32px] p-6 sm:p-8 pixel-card flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-arcade text-[10px] tracking-wider uppercase text-[#12BAAA]">
                    Misi & Koleksi
                  </p>
                  <h3 className="font-pixel text-xl text-[#0F2347]">
                    Misi Harian & Micropet
                  </h3>
                </div>
                <span className="font-arcade text-xs px-3 py-1.5 rounded-xl bg-[#FBDF54]/55 text-[#0F2347] tabular-nums border-2 border-[#F7891F]/40">
                  Skor: {streak.questBestScore}
                </span>
              </div>

              {/* Daily Checkable Goals */}
              <div className="space-y-2.5">
                {DAILY_GOALS.map((goal) => {
                  const done = streak.completedDailyGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => onToggleGoal(goal.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        done
                          ? 'bg-[#E6F9F7] border-[#12BAAA]/60'
                          : 'bg-[#F4FAFE] border-[#9FD2D6]/60 hover:border-[#377EC0]'
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
                              done ? 'line-through text-slate-500' : 'text-[#0F2347]'
                            }`}
                          >
                            {goal.title}
                          </p>
                          <p className="text-[11px] font-bold text-[#377EC0] tabular-nums">
                            +{goal.points} Poin Misi
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Micropet Collection */}
              <div>
                <p className="text-xs font-extrabold text-[#0F2347] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#377EC0]" />
                  Koleksi Maskot Event ({streak.unlockedPets.length}/4)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {MICROPETS.map((pet) => {
                    const unlocked = streak.unlockedPets.includes(pet.id);
                    return (
                      <div
                        key={pet.id}
                        className={`p-2 rounded-2xl text-center border-2 transition-all ${
                          unlocked
                            ? 'border-[#9FD2D6] shadow-sm'
                            : 'bg-slate-100 border-slate-200 opacity-50 grayscale'
                        }`}
                        style={{ backgroundColor: unlocked ? pet.bg : undefined }}
                      >
                        <div
                          className="w-8 h-8 mx-auto rounded-xl flex items-center justify-center text-white font-arcade text-[10px] mb-1"
                          style={{ backgroundColor: pet.color }}
                        >
                          {pet.name.slice(0, 2)}
                        </div>
                        <p className="text-[10px] font-bold text-[#0F2347] truncate">
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
              className="w-full py-3.5 px-5 rounded-2xl bg-[#377EC0] hover:bg-[#5460AC] text-white text-sm font-extrabold pixel-btn flex items-center justify-center gap-2.5 cursor-pointer"
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
