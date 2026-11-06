import { ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import Avatar from "./Avatar";

export default function MentorCard({ mentor }) {
  const navigate = useNavigate();
  const openMentor = () => navigate(`/mentors/${mentor.id}`);
  const hasScore = typeof mentor.matchScore === "number";

  return (
    <Card
      className="focus-ring flex cursor-pointer flex-col gap-3 transition-shadow hover:shadow-soft"
      onClick={openMentor}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openMentor();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-4">
        <Avatar name={mentor.name} color={mentor.avatarColor} size={52} />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-bold text-dark-green">{mentor.name}</h3>
          <p className="text-sm font-semibold text-coral">{mentor.profession}</p>
        </div>
        {hasScore && (
          <span className="shrink-0 rounded-full bg-dark-green px-3 py-1 text-sm font-bold text-off-white" title="Match score">
            {mentor.matchScore}%
          </span>
        )}
        <ChevronRight className="shrink-0 text-text-muted" size={20} aria-hidden="true" />
      </div>
      <p className="type-supporting line-clamp-2">{mentor.description}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
        {mentor.rating && <span className="inline-flex items-center gap-1"><Star size={12} aria-hidden="true" /> {mentor.rating}</span>}
        {mentor.hourlyRate && <span>Rs. {mentor.hourlyRate}/hr</span>}
        {mentor.languages?.length > 0 && <span>{mentor.languages.join(", ")}</span>}
      </div>
      {mentor.matchReasons?.length > 0 && (
        <ul className="space-y-0.5 border-t border-border pt-2 text-xs text-text-dark">
          {mentor.matchReasons.slice(0, 3).map((reason) => <li key={reason}>• {reason}</li>)}
        </ul>
      )}
    </Card>
  );
}
