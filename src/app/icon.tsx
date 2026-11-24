import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#090d16",
          borderRadius: 8,
          border: "1.5px solid #38bdf8",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Wing */}
          <path
            d="M 49 15 L 18 36 L 31 38 L 49 15 Z"
            fill="#38bdf8"
          />
          {/* Right Wing */}
          <path
            d="M 49 15 L 31 38 L 37 49 L 49 15 Z"
            fill="#2563eb"
          />
          {/* Spine */}
          <line
            x1="31"
            y1="38"
            x2="49"
            y2="15"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Apex beacon */}
          <circle cx="49" cy="15" r="4" fill="#ffffff" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
