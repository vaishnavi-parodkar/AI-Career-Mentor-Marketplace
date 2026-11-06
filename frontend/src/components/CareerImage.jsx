import MediaFrame from "./MediaFrame";

export default function CareerImage({
  content,
  className = "",
  loading = "lazy",
  fetchPriority = "auto",
}) {
  const Icon = content?.icon;
  const visualLabel = content?.visualLabel || "Career exploration";
  const alt = content?.heroImageAlt || `${visualLabel} career visual`;

  return (
    <MediaFrame
      key={`${content?.heroImage || "fallback"}-${visualLabel}`}
      src={content?.heroImage}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      objectPosition={content?.imagePosition || "center"}
      fallbackLabel={visualLabel}
      fallbackIcon={Icon}
      caption={visualLabel}
      className={className}
    />
  );
}
