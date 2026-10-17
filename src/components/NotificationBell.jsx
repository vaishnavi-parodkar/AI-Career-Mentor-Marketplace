import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { notificationApi } from "../services/platformApi";
import { useLanguage } from "../i18n";

export default function NotificationBell() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState({ unread: 0, items: [] });
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const load = useCallback(() => {
    notificationApi.list().then(setData).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openItem = async (n) => {
    if (!n.read) await notificationApi.read(n.id).catch(() => {});
    setOpen(false);
    load();
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    await notificationApi.readAll().catch(() => {});
    load();
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); if (!open) load(); }}
        className="focus-ring relative flex h-11 w-11 items-center justify-center rounded-full bg-light-sage text-dark-green hover:brightness-95"
        aria-label={t("notif.title")}
        aria-expanded={open}
      >
        <Bell size={18} aria-hidden="true" />
        {data.unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-off-white">
            {data.unread > 9 ? "9+" : data.unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-off-white shadow-soft">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-heading text-base font-bold text-dark-green">{t("notif.title")}</p>
            {data.unread > 0 && (
              <button type="button" onClick={markAll} className="text-xs font-semibold text-green hover:underline">
                {t("notif.markAll")}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {data.items.length === 0 && <p className="px-4 py-6 text-center text-sm text-text-muted">{t("notif.empty")}</p>}
            {data.items.map((n) => (
              <button key={n.id} type="button" onClick={() => openItem(n)} className={`block w-full border-b border-border px-4 py-3 text-left last:border-0 hover:bg-light-sage/50 ${n.read ? "" : "bg-light-sage/40"}`}>
                <p className="text-sm font-semibold text-text-dark">{n.title}</p>
                {n.message && <p className="mt-0.5 text-xs text-text-muted">{n.message}</p>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
