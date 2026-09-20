import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import Avatar from "./Avatar";

export default function MentorCard({ mentor }) {
  const navigate = useNavigate();
  const openMentor = () => navigate(`/mentors/${mentor.id}`);

  return (
    <Card
      className="focus-ring flex cursor-pointer items-center gap-4 transition-shadow hover:shadow-soft"
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
      <Avatar name={mentor.name} color={mentor.avatarColor} size={52} />
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-lg font-bold text-dark-green">{mentor.name}</h3>
        <p className="text-sm font-semibold text-coral">{mentor.profession}</p>
        <p className="mt-1 type-supporting line-clamp-2">{mentor.description}</p>
      </div>
      <ChevronRight className="shrink-0 text-text-muted" size={20} aria-hidden="true" />
    </Card>
  );
}
