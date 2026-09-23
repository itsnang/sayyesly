import Link from "next/link";

/** Tells the Creator they're looking at their own Invite and nothing they do is recorded. */
export function PreviewBanner() {
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        gap: 12,
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        padding: "8px 16px",
        background: "var(--ink)",
        color: "#fff",
        fontSize: 13,
        textAlign: "center",
      }}
    >
      <span>preview: this is your own invite, so answers aren&apos;t saved</span>
      <Link href="/dashboard" style={{ color: "#ffd6e6", textDecoration: "underline" }}>
        back to dashboard
      </Link>
    </div>
  );
}
