import { FullSlug, joinSegments, pathToRoot, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

type MediaKind = "movie" | "series" | "anime" | "album"

type MediaItem = {
  slug: FullSlug
  title: string
  kind: MediaKind
  year?: string
  creator?: string
  status?: string
  finished?: string
  cover?: string
  summary?: string
  featured: boolean
  tags: string[]
  sortTime: number
}

const kindOrder: MediaKind[] = ["movie", "series", "anime", "album"]

const kindMeta: Record<MediaKind, { label: string; noun: string; statusLabel: string }> = {
  movie: { label: "电影", noun: "部", statusLabel: "看过" },
  series: { label: "剧集", noun: "部", statusLabel: "看过" },
  anime: { label: "动画", noun: "部", statusLabel: "看过" },
  album: { label: "专辑", noun: "张", statusLabel: "听过" },
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim() !== "") return value
  if (typeof value === "number") return String(value)
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "string") return value.toLowerCase() === "true"
  return false
}

function isMediaKind(value: unknown): value is MediaKind {
  return typeof value === "string" && kindOrder.includes(value as MediaKind)
}

function dateTime(value: string | undefined): number {
  return value ? Date.parse(value) || 0 : 0
}

function coverUrl(currentSlug: FullSlug, cover: string | undefined): string | undefined {
  if (!cover) return undefined
  if (/^https?:\/\//i.test(cover) || cover.startsWith("/")) return cover
  return joinSegments(pathToRoot(currentSlug), cover)
}

function toMediaItem(page: QuartzPluginData): MediaItem | undefined {
  const frontmatter = page.frontmatter as Record<string, unknown> | undefined
  if (!frontmatter || !isMediaKind(frontmatter.kind) || !page.slug) return undefined
  if (frontmatter.collection !== "media" && !page.slug.startsWith("media/")) return undefined

  const finished = asString(frontmatter.finished)
  const title = asString(frontmatter.title) ?? page.slug

  return {
    slug: page.slug,
    title,
    kind: frontmatter.kind,
    year: asString(frontmatter.year),
    creator: asString(frontmatter.creator),
    status: asString(frontmatter.status),
    finished,
    cover: asString(frontmatter.cover),
    summary: asString(frontmatter.summary),
    featured: asBoolean(frontmatter.featured),
    tags: (frontmatter.tags as string[] | undefined) ?? [],
    sortTime: dateTime(finished) || dateTime(asString(frontmatter.date)),
  }
}

function sortRecent(a: MediaItem, b: MediaItem): number {
  if (a.sortTime !== b.sortTime) return b.sortTime - a.sortTime
  return a.title.localeCompare(b.title, "zh-Hans-CN", { numeric: true, sensitivity: "base" })
}

function Cover({ item, currentSlug }: { item: MediaItem; currentSlug: FullSlug }) {
  const src = coverUrl(currentSlug, item.cover)

  if (src) {
    return (
      <img
        class={`mi-cover mi-cover-${item.kind}`}
        src={src}
        alt={`${item.title} 封面`}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <div
      class={`mi-cover mi-cover-${item.kind} mi-cover-fallback`}
      aria-label={`${item.title} 封面占位`}
    >
      <span>{item.year}</span>
      <strong>{item.title}</strong>
    </div>
  )
}

function FeatureCard({ item, currentSlug }: { item: MediaItem; currentSlug: FullSlug }) {
  return (
    <a class="mi-feat-card internal" href={resolveRelative(currentSlug, item.slug)}>
      <Cover item={item} currentSlug={currentSlug} />
      <div class="mi-feat-copy">
        <span class="mi-feat-kind">{kindMeta[item.kind].label}</span>
        <strong>{item.title}</strong>
        {item.summary && <p>{item.summary}</p>}
      </div>
    </a>
  )
}

function PosterCard({ item, currentSlug }: { item: MediaItem; currentSlug: FullSlug }) {
  return (
    <a class="mi-poster internal" href={resolveRelative(currentSlug, item.slug)}>
      <Cover item={item} currentSlug={currentSlug} />
      <div class="mi-poster-info">
        <strong>{item.title}</strong>
        {item.year && <span class="mi-poster-year">{item.year}</span>}
      </div>
    </a>
  )
}

const MediaIndex: QuartzComponent = ({ allFiles, fileData }: QuartzComponentProps) => {
  const currentSlug = fileData.slug!
  const items = allFiles
    .map(toMediaItem)
    .filter((item): item is MediaItem => item !== undefined)
    .sort(sortRecent)

  if (items.length === 0) {
    return (
      <section class="mi-root mi-empty" aria-labelledby="mi-title">
        <h2 id="mi-title">还没有条目</h2>
        <p>在 media 目录里添加带有 kind 字段的 Markdown，就会出现在这里。</p>
      </section>
    )
  }

  const groups = kindOrder
    .map((kind) => ({
      kind,
      items: items.filter((item) => item.kind === kind),
    }))
    .filter((g) => g.items.length > 0)

  const featured = items.filter((item) => item.featured).sort(sortRecent)

  return (
    <section class="mi-root" aria-labelledby="mi-title">
      <header class="mi-header">
        <div>
          <p class="mi-kicker">Archive / {String(items.length).padStart(2, "0")} entries</p>
          <h2 id="mi-title">一间小型私人资料室</h2>
          <p class="mi-desc">不是完整目录和推荐清单，慢慢记录我看过听过的一些喜欢的作品。</p>
        </div>
      </header>

      {groups.length > 1 && (
        <nav class="mi-nav" aria-label="媒体分类">
          {groups.map(({ kind, items: kindItems }) => (
            <a class="internal" href={`#mi-${kind}`}>
              <span>{kindMeta[kind].label}</span>
              <small>
                {kindItems.length}
                {kindMeta[kind].noun}
              </small>
            </a>
          ))}
        </nav>
      )}

      {featured.length > 0 && (
        <section class="mi-featured" aria-labelledby="mi-feat-title">
          <div class="mi-section-head">
            <p>精选</p>
          </div>
          <div class="mi-feat-grid">
            {featured.map((item) => (
              <FeatureCard item={item} currentSlug={currentSlug} />
            ))}
          </div>
        </section>
      )}

      <div class="mi-catalog">
        {groups.map(({ kind, items: kindItems }) => (
          <section class="mi-kind-section" id={`mi-${kind}`} aria-labelledby={`mi-${kind}-title`}>
            <div class="mi-kind-head">
              <h2 id={`mi-${kind}-title`}>
                {kindMeta[kind].label}
                <span class="mi-kind-count">
                  {kindItems.length}
                  {kindMeta[kind].noun}
                </span>
              </h2>
            </div>
            <div class={`mi-poster-grid mi-poster-grid-${kind}`}>
              {kindItems.map((item) => (
                <PosterCard item={item} currentSlug={currentSlug} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

MediaIndex.css = `
.mi-root {
  margin-top: 1.5rem;
}

/* ── Header ── */
.mi-header {
  padding: 1.2rem 0 1.4rem;
  border-bottom: 1px solid var(--lightgray);
}

.mi-header h2 {
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.4;
  max-width: 14em;
}

.mi-kicker {
  margin: 0 0 0.15rem;
  color: var(--gray);
  font-size: 0.75rem;
  font-family: var(--codeFont);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.mi-desc {
  max-width: 36em;
  margin: 0.45rem 0 0;
  color: var(--darkgray);
  font-size: 0.92rem;
  line-height: 1.65;
}

/* ── Category nav ── */
.mi-nav {
  display: flex;
  gap: 0;
  margin: 0;
  border-bottom: 1px solid var(--lightgray);
}

.mi-nav a {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 0.7rem 1rem 0.7rem 0;
  font-weight: 500;
  transition: color 180ms ease;
}

.mi-nav a + a {
  padding-left: 1rem;
  border-left: 1px solid var(--lightgray);
}

.mi-nav span {
  color: var(--dark);
  font-size: 0.88rem;
}

.mi-nav small {
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

.mi-nav a:hover span {
  color: var(--secondary);
}

/* ── Section headings ── */
.mi-section-head {
  margin-bottom: 0.8rem;
}

.mi-section-head p {
  margin: 0;
  color: var(--gray);
  font-size: 0.75rem;
}

.mi-section-head h2 {
  margin: 0;
}

/* ── Featured grid ── */
.mi-featured {
  margin-top: 1.8rem;
}

.mi-feat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.mi-root a.mi-feat-card {
  display: grid;
  grid-template-columns: 5.2rem minmax(0, 1fr);
  gap: 0.85rem;
  align-items: start;
  padding: 0.8rem;
  border: 1px solid color-mix(in srgb, var(--lightgray) 80%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--light) 94%, var(--lightgray));
  transition: border-color 200ms ease, transform 200ms ease;
}

.mi-root a.mi-feat-card:hover {
  border-color: color-mix(in srgb, var(--secondary) 35%, var(--lightgray));
  transform: translateY(-1px);
}

.mi-feat-copy {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding-top: 0.1rem;
}

.mi-feat-kind {
  color: var(--gray);
  font-size: 0.72rem;
}

.mi-feat-copy strong {
  color: var(--dark);
  font-size: 0.94rem;
  line-height: 1.35;
}

.mi-feat-copy p {
  margin: 0.15rem 0 0;
  color: var(--darkgray);
  font-size: 0.85rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

/* ── Cover ── */
.mi-cover {
  display: block;
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid color-mix(in srgb, var(--lightgray) 72%, var(--gray));
  background: var(--lightgray);
}

.mi-cover-album {
  aspect-ratio: 1;
}

.mi-cover-fallback {
  box-sizing: border-box;
  display: grid;
  align-content: end;
  gap: 0.4rem;
  padding: 0.6rem;
}

.mi-cover-fallback span {
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.7rem;
}

.mi-cover-fallback strong {
  color: var(--dark);
  font-size: 0.82rem;
  line-height: 1.25;
}

/* ── Catalog ── */
.mi-catalog {
  margin-top: 2rem;
}

.mi-kind-section {
  scroll-margin-top: 1.5rem;
}

.mi-kind-section + .mi-kind-section {
  margin-top: 2rem;
}

.mi-kind-head {
  padding-top: 1rem;
  border-top: 1px solid var(--lightgray);
  margin-bottom: 0.5rem;
}

.mi-kind-head h2 {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin: 0;
  font-size: 1.1rem;
}

.mi-kind-count {
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.75rem;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

/* ── Poster grid ── */
.mi-poster-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.9rem 0.7rem;
}

.mi-poster-grid-album {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.mi-root a.mi-poster {
  display: block;
  text-decoration: none;
  transition: transform 200ms ease;
}

.mi-root a.mi-poster:hover {
  transform: translateY(-2px);
}

.mi-root a.mi-poster:hover .mi-cover {
  border-color: color-mix(in srgb, var(--secondary) 50%, var(--lightgray));
}

.mi-poster-info {
  padding: 0.4rem 0.1rem 0;
}

.mi-poster-info strong {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.35;
  color: var(--dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mi-poster-year {
  display: block;
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
  margin-top: 0.1rem;
}

/* ── Empty state ── */
.mi-empty {
  padding: 2rem 0;
}

.mi-empty h2 {
  margin: 0;
}

.mi-empty p {
  margin: 0.4rem 0 0;
  color: var(--gray);
  font-size: 0.88rem;
}

/* ── Responsive ── */
@media all and (max-width: 800px) {
  .mi-feat-grid {
    grid-template-columns: 1fr;
  }

  .mi-poster-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .mi-poster-grid-album {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media all and (max-width: 600px) {
  .mi-nav {
    flex-wrap: wrap;
  }

  .mi-nav a + a {
    border-left: none;
  }

  .mi-root a.mi-feat-card {
    grid-template-columns: 4.5rem minmax(0, 1fr);
  }

  .mi-poster-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem 0.5rem;
  }

  .mi-poster-grid-album {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
`

export default (() => MediaIndex) satisfies QuartzComponentConstructor
