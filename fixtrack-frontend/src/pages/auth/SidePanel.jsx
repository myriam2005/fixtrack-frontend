// src/components/auth/SidePanel.jsx
export default function SidePanel({ mode }) {
  return (
    <div style={{
      background: "linear-gradient(170deg, #1565D8 0%, #0D47A1 100%)",
      padding: "36px 28px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      height: "100%",
    }}>
      {/* Background decorative circles */}
      <div style={{
        position: "absolute", top: "-80px", right: "-80px",
        width: "260px", height: "260px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "30px", left: "-60px",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <h2 style={{
          color: "#fff",
          fontSize: "26px",
          fontWeight: 800,
          lineHeight: 1.25,
          letterSpacing: "-0.3px",
          margin: "0 0 10px",
        }}>
          WELCOME
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.70)",
          fontSize: "14px",
          lineHeight: 1.65,
          margin: 0,
        }}>
          YOUR HEALING NAME
        </p>
        <p style={{
          color: "rgba(255,255,255,0.60)",
          fontSize: "12px",
          lineHeight: 1.6,
          margin: "16px 0 0",
          maxWidth: "220px",
        }}>
          If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing
        </p>
      </div>
    </div>
  );
}