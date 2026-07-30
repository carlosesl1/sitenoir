"use client";

import styles from "./SiteCanvas.module.css";

const GRID_COLUMNS = ["start", "first", "second", "end"] as const;
const GRID_ROWS = ["start", "first", "second", "end"] as const;

export function PersistentSiteGrid() {
  return (
    <div className={styles["gridLayer"]} data-site-grid="true">
      {GRID_COLUMNS.map((column) => (
        <span className={styles["gridColumn"]} data-grid-column={column} key={column}>
          {GRID_ROWS.map((row) => (
            <span className={styles["gridCross"]} data-grid-row={row} key={row} />
          ))}
        </span>
      ))}
    </div>
  );
}
