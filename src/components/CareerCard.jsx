import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import MatchRing from "./MatchRing";
import Button from "./Button";

export default function CareerCard({ career, compareMode = false, selected = false, onToggleCompare }) {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col gap-4 transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-dark-green">{career.title}</h3>
          <p className="text-sm text-text-muted">{career.tagline}</p>
        </div>
        <MatchRing value={career.match} size={52} />
      </div>

      <p className="line-clamp-2 text-sm text-text-dark/80">{career.description}</p>

      <div className="flex flex-wrap gap-2">
        {career.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-light-sage px-3 py-1 text-xs font-medium text-dark-green"
          >
            {skill}
          </span>
        ))}
        {career.skills.length > 3 && (
          <span className="rounded-full bg-light-sage px-3 py-1 text-xs font-medium text-dark-green">
            +{career.skills.length - 3}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center gap-2">
        {compareMode ? (
          <Button
            variant={selected ? "primary" : "outline"}
            size="sm"
            fullWidth
            onClick={() => onToggleCompare(career.id)}
          >
            {selected ? "Selected" : "Select to Compare"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate(`/careers/${career.id}`)}
          >
            View Career
          </Button>
        )}
      </div>
    </Card>
  );
}
