import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import MatchRing from "./MatchRing";
import Button from "./Button";
import CareerImage from "./CareerImage";
import { careerContent, defaultCareerContent } from "../data/careerContent";

export default function CareerCard({
  career,
  compareMode = false,
  selected = false,
  onToggleCompare,
  isTopMatch = false,
  showMatch = true,
}) {
  const navigate = useNavigate();
  const content = careerContent[career.id] || defaultCareerContent;
  const visibleSkills = career.skills.slice(0, 3);
  const extraSkills = Math.max(career.skills.length - visibleSkills.length, 0);

  return (
    <Card padded={false} interactive className="flex h-full flex-col overflow-hidden">
      <CareerImage content={content} className="aspect-[16/8] border-b border-border" />
      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {isTopMatch && <p className="type-eyebrow mb-1">Your strongest current match</p>}
            <h3 className="font-heading text-xl font-bold text-dark-green">{career.title}</h3>
            <p className="mt-1 text-base leading-6 text-text-muted">{career.tagline}</p>
          </div>
          {showMatch && Number.isFinite(Number(career.match)) && (
            <div className="flex shrink-0 flex-col items-center gap-1">
              <MatchRing value={career.match} size={64} />
              <span className="type-meta">match</span>
            </div>
          )}
        </div>

        <p className="type-supporting line-clamp-3 text-text-dark">{career.description}</p>

        {career.strongestTraits?.length > 0 && (
          <div className="border-l-2 border-sage pl-3">
            <p className="type-meta mb-1 text-dark-green">Why it surfaced</p>
            <p className="text-sm leading-6 text-text-dark">{career.strongestTraits.slice(0, 3).join(" · ")}</p>
          </div>
        )}

        {career.growthAreas?.length > 0 && (
          <p className="text-sm leading-6 text-text-muted">
            <span className="font-semibold text-text-dark">Build next:</span> {career.growthAreas.slice(0, 2).join(" · ")}
          </p>
        )}

        <div className="mt-auto border-t border-border pt-4">
          <p className="type-meta mb-1 text-dark-green">Core skills</p>
          <p className="text-sm leading-6 text-text-dark">
            {visibleSkills.join(" · ")}{extraSkills > 0 ? ` · +${extraSkills} more` : ""}
          </p>
        </div>

        <div className="pt-1">
          {compareMode ? (
            <Button variant={selected ? "primary" : "outline"} size="sm" fullWidth onClick={() => onToggleCompare(career.id)}>
              {selected ? "Selected" : "Select to compare"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" fullWidth icon={ArrowRight} iconPosition="right" onClick={() => navigate(`/careers/${career.id}${showMatch ? "" : "?mode=browse"}`)}>
              View career details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
