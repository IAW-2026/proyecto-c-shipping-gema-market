import React from "react";

import Image from "next/image";

interface AvatarProps {
  name?: string;
  size?: number;
  src?: string;
}

export const Avatar = ({ name = "", size = 40, src }: AvatarProps) => {
  const initials =
    name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const palette = ["#a4ac86", "#7f4f24", "#656d4a", "#936639", "#414833"];
  const c = palette[name.charCodeAt(0) % palette.length];

  return (
    <div
      className="rounded-full text-paper flex items-center justify-center font-semibold tracking-[0.02em] shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: src ? "transparent" : c,
        fontSize: size * 0.36,
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
};
