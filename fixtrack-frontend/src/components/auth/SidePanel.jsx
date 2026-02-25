// src/components/auth/SidePanel.jsx
import styles from "../../pages/auth/auth.module.css";

const FEATURES = [
  { icon: "🔧", text: "Gestion des tickets de maintenance" },
  { icon: "🤖", text: "Assignation intelligente par IA" },
  { icon: "📊", text: "Dashboards par rôle" },
  { icon: "📈", text: "Reporting & analytics temps réel" },
];

export default function SidePanel({ mode }) {
  return (
    <div className={styles.sidePanel}>
      <div className={styles.sidePanelCircle1} />
      <div className={styles.sidePanelCircle2} />

      {/* Top content */}
      <div>
        {/* Logo */}
        <div className={styles.sideLogo}>
          <div className={styles.sideLogoIcon}>◆</div>
          <span className={styles.sideLogoText}>FixTrack</span>
        </div>

        {/* Headline */}
        <p className={styles.sideTitle}>
          {mode === "login"
            ? <>Efficiency in<br />Maintenance</>
            : <>Start Managing<br />Smarter Today</>}
        </p>
        <p className={styles.sideSub}>
          {mode === "login"
            ? "The complete ecosystem for tracking repairs, managing assets, and optimizing your facility operations."
            : "Join 500+ maintenance teams and streamline your operations with AI-powered tools."}
        </p>

        {/* Feature list */}
        <div className={styles.featureList}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureItem}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <span className={styles.featureText}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom box */}
      <div className={styles.sideBottom}>
        <div className={styles.sideBottomIcon}>⚙️</div>
        <div>
          <div className={styles.sideBottomName}>Maintenance Pro Platform</div>
          <div className={styles.sideBottomSub}>Trusted by 500+ maintenance teams</div>
        </div>
      </div>
    </div>
  );
}