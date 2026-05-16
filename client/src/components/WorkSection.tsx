import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProjectDetail, fetchProjectList } from "../api/projects";
import type { ProjectDetail, ProjectListItem } from "../types/project";

export function WorkSection() {
  const [list, setList] = useState<ProjectListItem[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const cacheRef = useRef<Record<string, ProjectDetail>>({});

  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    setListError(null);
    fetchProjectList()
      .then((items) => {
        if (cancelled) return;
        setList(items);
        setListLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setListError(e instanceof Error ? e.message : "Could not load projects");
        setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!list?.length) return;
    setSelectedSlug((current) => current ?? list[0].slug);
  }, [list]);

  useEffect(() => {
    if (!selectedSlug) return;

    const cached = cacheRef.current[selectedSlug];
    if (cached) {
      setDetail(cached);
      setDetailLoading(false);
      setDetailError(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);

    fetchProjectDetail(selectedSlug)
      .then((d) => {
        if (cancelled) return;
        cacheRef.current[selectedSlug] = d;
        setDetail(d);
        setDetailLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setDetailError(e instanceof Error ? e.message : "Could not load project");
        setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSlug]);

  const onSelect = useCallback((slug: string) => {
    setSelectedSlug(slug);
    const hit = cacheRef.current[slug];
    if (hit) {
      setDetail(hit);
      setDetailLoading(false);
      setDetailError(null);
    } else {
      setDetail(null);
      setDetailLoading(true);
      setDetailError(null);
    }
  }, []);

  const detailMatches = detail?.slug === selectedSlug;
  const showPanelSpinner = detailLoading && !detailMatches;
  const showPanelError = Boolean(detailError && !detailMatches);
  const panelContentVisible = detailMatches || showPanelSpinner || showPanelError;

  return (
    <section className="work" id="work" aria-labelledby="work-heading">
      <div className="work__intro">
        <h2 id="work-heading" className="glow-hover">Work</h2>
        <p className="work__lede">
          Selected projects across direction, edit, and cinematography—tap a title to open
          detail.
        </p>
      </div>

      {listLoading && (
        <div className="work__state" role="status">
          <span className="work__spinner" aria-hidden />
          Loading projects…
        </div>
      )}

      {!listLoading && listError && (
        <div className="work__state work__state--error" role="alert">
          {listError}
        </div>
      )}

      {!listLoading && !listError && list && list.length === 0 && (
        <p className="work__state">No projects yet.</p>
      )}

      {!listLoading && !listError && list && list.length > 0 && (
        <div className="work__layout">
          <div className="work__tabs-wrap">
            <div
              className="work__tabs"
              role="tablist"
              aria-label="Projects"
              onKeyDown={(e) => {
                if (!list?.length || !selectedSlug) return;
                const idx = list.findIndex((p) => p.slug === selectedSlug);
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  const next = list[Math.min(idx + 1, list.length - 1)];
                  if (next) onSelect(next.slug);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const next = list[Math.max(idx - 1, 0)];
                  if (next) onSelect(next.slug);
                }
              }}
            >
              {list.map((p) => {
                const selected = p.slug === selectedSlug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    role="tab"
                    id={`tab-${p.slug}`}
                    aria-selected={selected}
                    aria-controls={`panel-${p.slug}`}
                    tabIndex={selected ? 0 : -1}
                    className={`work__tab${selected ? " work__tab--active" : ""}`}
                    onClick={() => onSelect(p.slug)}
                  >
                    <span className="work__tab-title">{p.title}</span>
                    <span className="work__tab-meta">{p.year}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="work__panel"
            role="tabpanel"
            id={selectedSlug ? `panel-${selectedSlug}` : undefined}
            aria-labelledby={selectedSlug ? `tab-${selectedSlug}` : undefined}
          >
            <div
              className={`work__panel-inner${
                panelContentVisible ? " work__panel-inner--visible" : ""
              }`}
            >
              {showPanelSpinner && (
                <div className="work__panel-loading" role="status">
                  <span className="work__spinner" aria-hidden />
                  Loading project…
                </div>
              )}

              {showPanelError && (
                <div className="work__panel-error" role="alert">
                  {detailError}
                </div>
              )}

              {detailMatches && detail && (
                <article className="work__article work__article--motion" key={detail.slug}>
                  <header className="work__article-head">
                    <h3>{detail.title}</h3>
                    <p className="work__article-role">
                      {detail.role}
                      <span className="work__dot" aria-hidden>
                        ·
                      </span>
                      <span>{detail.year}</span>
                    </p>
                    <p className="work__article-summary">{detail.summary}</p>
                    <ul className="work__tags">
                      {detail.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </header>

                  <div className="work__article-body">
                    {detail.body.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {detail.highlights.length > 0 && (
                    <div className="work__highlights">
                      <h4>Highlights</h4>
                      <ul>
                        {detail.highlights.map((h) => (
                          <li key={h.label}>
                            <strong>{h.label}</strong>
                            <span>{h.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="work__gallery" aria-label="Project media placeholders">
                    {detail.media.map((m, i) => (
                      <figure
                        key={`${m.label}-${i}`}
                        className="work__media"
                        style={{ aspectRatio: m.ratio.replace(/\s/g, "") }}
                      >
                        <figcaption>{m.label}</figcaption>
                      </figure>
                    ))}
                  </div>
                </article>
              )}

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
