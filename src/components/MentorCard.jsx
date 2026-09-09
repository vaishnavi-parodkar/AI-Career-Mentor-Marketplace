import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import Avatar from "./Avatar";

export default function MentorCard({ mentor }) {
  const navigate = useNavigate();
  return (
    <Card
      className="flex cursor-pointer items-center gap-4 transition-shadow hover:shadow-soft"
      onClick={() => navigate(`/mentors/${mentor.id}`)}
      role="button"
      tabIndex={0}
    >
      <Avatar name={mentor.name} color={mentor.avatarColor} size={52} />
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-base font-bold text-dark-green">{mentor.name}</h3>
        <p className="text-xs font-medium text-coral">{mentor.profession}</p>
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">{mentor.description}</p>
      </div>
      <ChevronRight className="shrink-0 text-text-muted" size={20} />
    </Card>
  );
}
