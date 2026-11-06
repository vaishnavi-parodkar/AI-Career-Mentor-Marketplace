import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lightbulb } from "lucide-react";
import Card from "./Card";
import { progressApi } from "../services/platformApi";
import { useLanguage } from "../i18n";

/** Personalised next-best-action list from the backend rules engine. */
export default function NextActions() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);

  useEffect(() => {
    progressApi.nextActions().then(setItems).catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 type-section-title"><Lightbulb size={20} aria-hidden="true" /> {t("next.title")}</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => (
          <Card key={i} interactive className="focus-ring flex cursor-pointer items-start justify-between gap-3" role="button" tabIndex={0}
            onClick={() => navigate(a.link)} onKeyDown={(e) => { if (e.key === "Enter") navigate(a.link); }}>
            <div>
              <p className="font-semibold text-dark-green">{a.title}</p>
              <p className="mt-1 text-sm text-text-muted">{a.reason}</p>
            </div>
            <ArrowRight size={18} className="mt-1 shrink-0 text-green" aria-hidden="true" />
          </Card>
        ))}
      </div>
    </section>
  );
}
