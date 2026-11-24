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
          background: "#09090b",
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 34L26 22L36 12M36 12H27M36 12V21"
            stroke="#3b82f6"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="34" r="3.5" fill="#3b82f6" />
          <circle cx="26" cy="22" r="4.5" fill="#60a5fa" />
          <circle cx="36" cy="12" r="3.5" fill="#93c5fd" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
