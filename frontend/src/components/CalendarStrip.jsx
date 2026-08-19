import React from "react";
import { Blueprint } from "../ui.jsx";

const DAY_MS = 86400000;
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Fourteen days from today. Cells are filled from real application data:
 * timeline events dated in the window, and chase reminders derived from
 * applied_on + remind_after_days on records that have had no reply.
 */
export function buildDays(applications, today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const marks = {};
  const add = (date, kind, label) => {
    const key = new Date(date).toISOString().slice(0, 10);
    if (!marks[key]) marks[key] = [];
    marks[key].push({ kind, label });
  };

  applications.forEach((app) => {
    (app.events || []).forEach((ev) => {
      add(ev.happened_on, "Event", `${app.company} — ${ev.label}`);
    });
    if (app.status === "applied" || app.status === "no_response") {
      const days = app.remind_after_days ?? 10;
      const due = new Date(new Date(app.applied_on).getTime() + days * DAY_MS);
      add(due, "Chase", `${app.company} — no reply yet`);
    }
  });

  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start.getTime() + i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    const items = marks[key] || [];
    return {
      key,
      day: String(d.getDate()).padStart(2, "0"),
      wd: WD[d.getDay()],
      today: i === 0,
      items,
    };
  });
}

export default function CalendarStrip({ applications }) {
  const days = buildDays(applications);
  const months = [...new Set(days.map((d) => new Date(d.key).toLocaleString("en", { month: "long" })))];

  return (
    <div style={{ marginBottom: 34 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
          Next two weeks
        </div>
        <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
          {months.join(" — ")} {new Date(days[0].key).getFullYear()}
        </div>
      </div>
      <Blueprint style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)" }}>
        {days.map((d) => (
          <div
            key={d.key}
            style={{
              borderRight: "1px solid var(--color-divider)",
              padding: "12px 8px 14px",
              minHeight: 108,
              background: d.today ? "var(--color-accent)" : d.items.length ? "var(--color-accent-100)" : "transparent",
              color: d.today ? "var(--color-bg)" : "var(--color-text)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: d.today ? "var(--color-accent-200)" : "var(--color-neutral-600)" }}>
              {d.wd}
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, lineHeight: 1 }}>{d.day}</div>
            {d.items.slice(0, 2).map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ width: 6, height: 6, background: "var(--color-accent-700)" }} />
                <span style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-accent-800)" }}>
                  {item.kind}
                </span>
                <span style={{ fontSize: 11, lineHeight: 1.3, color: "var(--color-neutral-800)", textWrap: "pretty" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        ))}
      </Blueprint>
    </div>
  );
}
