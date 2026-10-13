import { Award, Flag, Footprints, Lock, Map, Mic, Target, Trophy, UserCheck } from "lucide-react";
import Card from "./Card";

const ICONS = {
  profile: UserCheck,
  map: Map,
  steps: Footprints,
  flag: Flag,
  target: Target,
  trophy: Trophy,
  mic: Mic,
  award: Award,
};

export default function BadgeShelf({ badges }) {
  const earnedCount = badges.filter((badge) => badge.earned).length;

  return (
    <Card elevated className="mt-5 p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="type-meta">Badges</p>
          <p className="font-heading text-2xl font-bold text-dark-green">
            {earnedCount} <span className="text-base font-semibold text-text-muted">of {badges.length} earned</span>
          </p>
        </div>
        <p className="max-w-[15rem] text-right text-sm leading-6 text-text-muted">
          Earned by finishing your profile, roadmap and practice.
        </p>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {badges.map((badge) => {
          const Icon = ICONS[badge.icon] || Award;
          return (
            <li
              key={badge.id}
              title={badge.earned ? badge.description : badge.hint}
              className={`flex flex-col items-center rounded-xl p-3 text-center ${
                badge.earned ? "bg-light-sage" : "border border-dashed border-border"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  badge.earned ? "bg-dark-green text-off-white" : "bg-cream text-text-muted"
                }`}
              >
                {badge.earned ? <Icon size={22} /> : <Lock size={18} />}
              </span>
              <p className={`mt-2 text-sm font-semibold ${badge.earned ? "text-dark-green" : "text-text-muted"}`}>
                {badge.title}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-text-muted">
                {badge.earned ? badge.description : badge.hint}
              </p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
