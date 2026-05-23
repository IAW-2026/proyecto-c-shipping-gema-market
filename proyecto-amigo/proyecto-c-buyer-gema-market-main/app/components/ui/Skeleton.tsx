import React from "react";

interface SkeletonProps {
  w?: string | number;
  h?: string | number;
  r?: number;
}

export const Skeleton = ({ w = "100%", h = 16, r = 8 }: SkeletonProps) => (
  <div
    className="animate-shimmer bg-gradient-to-r from-bone via-cream to-bone bg-[length:200%_100%]"
    style={{ width: w, height: h, borderRadius: r }}
  />
);
