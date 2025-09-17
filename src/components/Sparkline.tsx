"use client";

import * as React from "react";

type Props = {
  data: number[];
  color?: string;
  strokeWidth?: number;
};

export default function Sparkline({ data, color = "#22c55e", strokeWidth = 2 }: Props) {
  const width = 300;
  const height = 48;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 8) + 4;
    const y = height - ((d - min) / (max - min || 1)) * (height - 8) - 4;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        points={points.join(" ")}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}