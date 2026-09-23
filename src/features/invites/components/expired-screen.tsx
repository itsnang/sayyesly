/** Shown instead of the Theme when every Time slot has passed and no Custom time is allowed. */
export function ExpiredScreen() {
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
        this invite has expired
      </h1>
      <p style={{ marginTop: 14, fontSize: 16, color: "var(--ink-soft)", maxWidth: 380 }}>
        {"// all the offered times have passed. maybe ask them for a new invite ✦"}
      </p>
    </main>
  );
}
