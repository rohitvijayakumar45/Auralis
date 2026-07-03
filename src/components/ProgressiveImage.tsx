import { useState } from "react";
import { cn } from "../lib/cn";

export function ProgressiveImage({
  src,
  blurSrc,
  alt,
  className
}: {
  src: string;
  blurSrc: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-linen", className)}>
      <img
        src={blurSrc}
        alt=""
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-70"
        )}
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-contain transition duration-700 group-hover:scale-105",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
