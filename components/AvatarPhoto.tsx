"use client";

import { useState } from "react";

/** The photo layer of <Avatar>: sits over the initials and removes itself if there's no photo. */
export default function AvatarPhoto({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny, private, auth-gated image
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full rounded-full object-cover"
    />
  );
}
