import React from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import styles from "../../style/appshell.module.css";

interface Props {
  children: React.ReactNode;
}

export default function AppShell({ children }: Props) {
  return (
    <div className={styles.shell}>
      <TopBar />
      <Sidebar />

      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}