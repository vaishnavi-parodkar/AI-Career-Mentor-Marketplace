import { useState } from "react";

export default function MediaFrame({
  src,
  alt,
  loading = "lazy",
  fetchPriority = "auto",
  className = "",
  objectPosition = "center",
  fallbackLabel = "Visual preview",
  fallbackIcon: Icon,
  caption,
}) {
  const [status, setStatus] = useState(src ? "loading" : "error");

  const showFallback = status !== "loaded";

  return (
    <figure className={`relative overflow-hidden bg-dark-green ${className}`}>
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-dark-green px-6 text-center text-off-white transition-opacity duration-300 ${showFallback ? "opacity-100" : "opacity-0"}`}
        role={status === "error" ? "img" : undefined}
        aria-label={status === "error" ? `${fallbackLabel} unavailable` : undefined}
        aria-hidden={status !== "error"}
      >
        {Icon && (
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-sage/60 bg-off-white/10 text-sage">
            <Icon size={24} strokeWidth={1.6} aria-hidden="true" />
          </span>
        )}
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-sage">
          {fallbackLabel}
        </span>
      </div>
      {src && (
        <img
          src={src}
          alt={alt}
          width="1600"
          height="1067"
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-500 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
          style={{ objectPosition }}
        />
      )}
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-dark-green/80 to-transparent px-4 pb-3 pt-8 text-xs font-semibold uppercase tracking-[0.12em] text-off-white">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
