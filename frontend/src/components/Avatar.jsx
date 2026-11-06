import { useState } from "react";

export default function Avatar({ name = "?", color = "#0A634D", size = 48, image, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-heading font-bold text-off-white ${className}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
    >
      {image && !imageFailed ? (
        <img
          src={image}
          alt=""
          className="h-full w-full rounded-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : initials}
    </div>
  );
}
