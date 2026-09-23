import Link from "next/link";

export default function InviteNotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
        textAlign: "center",
      }}
    >
      <h1 style={{ fontFamily: "var(--hand)", fontWeight: 700, fontSize: "clamp(34px, 7vw, 52px)", color: "var(--ink)" }}>
        this invite no longer exists
      </h1>
      <p style={{ marginTop: 14, fontSize: 16, color: "var(--ink-soft)" }}>
        {"// maybe the link got cut off, or it was taken down"}
      </p>
      <Link href="/" style={{ marginTop: 26, color: "var(--accent)", fontSize: 15 }}>
        ← back home
      </Link>
    </main>
  );
}
