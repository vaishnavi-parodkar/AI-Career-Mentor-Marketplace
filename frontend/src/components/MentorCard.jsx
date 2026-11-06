import { ChevronRight, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import Avatar from "./Avatar";
import { getMentorImage } from "../data/mentorImages";

export default function MentorCard({ mentor }) {
  const navigate = useNavigate();
  const hasScore = typeof mentor.matchScore === "number";

  return (
    <Card
      className="group focus-ring flex cursor-pointer flex-col gap-4 overflow-hidden p-0 transition-shadow hover:shadow-soft"
    >
      <div className="flex min-h-32 items-end gap-4 bg-gradient-to-br from-dark-green to-green px-5 pb-4 pt-5">
        <Avatar name={mentor.name} color={mentor.avatarColor} image={getMentorImage(mentor)} size={68} className="border-2 border-off-white shadow-soft" />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-bold text-off-white">{mentor.name}</h3>
          <p className="text-sm font-semibold text-off-white/80">{mentor.profession}</p>
        </div>
        {hasScore && (
          <span className="shrink-0 rounded-full bg-dark-green px-3 py-1 text-sm font-bold text-off-white" title="Match score">
            {mentor.matchScore}%
          </span>
        )}
        <ChevronRight className="shrink-0 text-off-white/70 transition-transform group-hover:translate-x-1" size={20} aria-hidden="true" />
      </div>
      <div className="space-y-3 px-5 pb-5">
      <p className="type-supporting line-clamp-2">{mentor.description}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
        {mentor.languages?.length > 0 && <span>{mentor.languages.join(", ")}</span>}
      </div>
      {mentor.matchReasons?.length > 0 && (
        <ul className="space-y-0.5 border-t border-border pt-2 text-xs text-text-dark">
          {mentor.matchReasons.slice(0, 3).map((reason) => <li key={reason}>• {reason}</li>)}
        </ul>
      )}
      <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-dark-green">
        <button type="button" onClick={() => navigate(`/mentors/${mentor.id}/chat`)} className="focus-ring inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-left hover:text-coral"><MessageCircle size={15} aria-hidden="true" /> Chat instantly</button>
        <button type="button" onClick={() => navigate(`/mentors/${mentor.id}`)} className="focus-ring rounded-md px-1 py-1 text-coral hover:text-dark-green">Explore persona</button>
      </div>
      </div>
    </Card>
  );
}
