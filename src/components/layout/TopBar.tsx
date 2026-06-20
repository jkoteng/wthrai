import React from "react";
import styles from "../../style/appshell.module.css";

export default function TopBar() {
  return (
    <header className={styles.topBar}>
      <div className={styles.brandBlock}>
        <div className={styles.brandMark}>W</div>
        <div>
          <div className={styles.brandTitle}>WHTRAI Dashboard</div>
          <div className={styles.brandSubtitle}>Weather intelligence overview</div>
        </div>
      </div>     
    </header>
  );
}