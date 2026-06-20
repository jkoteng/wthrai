import React from "react";
import styles from "../../style/appshell.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <div className={styles.sidebarLabel}>Navigation</div>
        <button className={styles.sidebarItemActive}>Dashboard</button>
        <button className={styles.sidebarItem}>Saved cities</button>
        <button className={styles.sidebarItem}>Forecast</button>
        <button className={styles.sidebarItem}>Analytics</button>
      </div>

      <div className={styles.sidebarSection}>
        <div className={styles.sidebarLabel}>Quick actions</div>
        <button className={styles.sidebarItem}>Use my location</button>
        <button className={styles.sidebarItem}>Search city</button>
        <button className={styles.sidebarItem}>Refresh data</button>
      </div>
    </aside>
  );
}