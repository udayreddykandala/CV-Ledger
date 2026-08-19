import React from "react";

const STOP = new Set(("a an and are as at be by for from has have in into is it its of on or that the their they this to will with you your we our not but also about across over under per within" +
  " experience role team work working years year plus preferred required ideally comfortable strong good great some most " +
  "job company candidate candidates apply application").split(/\s+/));

/** Significant terms in the pasted JD, most frequent first. */
export function jdTerms(jdText, limit = 22) {
  if (!jdText) return [];
  const counts = new Map();
  const words = jdText.toLowerCase().match(/[a-z][a-z+#.\-]{2,}/g) || [];
  words.forEach((w) => {
    const term = w.replace(/[.\-]+$/, "");
    if (term.length < 3 || STOP.has(term)) return;
    counts.set(term, (counts.get(term) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term]) => term);
}

export function diff(jdText, cvTerms) {
  const cv = (cvTerms || "").toLowerCase().split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean);
  const terms = jdTerms(jdText);
  const hit = (t) => cv.some((c) => c === t || c.includes(t) || t.includes(c));
  const matched = terms.filter(hit);
  const missing = terms.filter((t) => !hit(t));
  const coverage = terms.length ? Math.round((matched.length / terms.length) * 100) : 0;
  return { terms, matched, missing, coverage };
}

const verdictFor = (coverage) =>
  coverage >= 70
    ? "Good overlap — the CV you sent speaks their language."
    : coverage >= 40
    ? "Half covered. Worth adding the missing terms before the next application like this."
    : "Thin overlap. This is likely why the CV did not get a reply.";

export default function KeywordDiff({ jdText, cv }) {
  if (!jdText) {
    return <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>Paste the job description to see the keyword diff.</div>;
  }
  if (!cv) {
    return <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>Attach a CV version to this record to see the keyword diff.</div>;
  }

  const { terms, matched, missing, coverage } = diff(jdText, cv.terms);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
        <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>
          Keyword diff — JD against the CV I sent
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1 }}>{coverage}%</div>
      </div>
      <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginBottom: 14 }}>
        {matched.length} of {terms.length} terms from this JD appear in {cv.file_name}. {verdictFor(coverage)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 8 }}>In both</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {matched.map((t) => <span key={t} className="tag tag-accent">{t}</span>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 8 }}>
            In the JD, missing from the CV
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {missing.map((t) => <span key={t} className="tag tag-outline" style={{ textDecoration: "line-through" }}>{t}</span>)}
          </div>
        </div>
      </div>
      {!cv.terms && (
        <div style={{ fontSize: 12, color: "var(--color-neutral-600)", marginTop: 12 }}>
          This CV version has no terms listed yet — add them in the CV library so the diff has something to compare against.
        </div>
      )}
    </div>
  );
}
