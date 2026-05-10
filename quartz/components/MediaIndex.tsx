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

function formatDate(value: string | undefined): string {
  const time = dateTime(value)
  if (time === 0) return "未记录"

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(time))
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

function statusText(item: MediaItem): string {
  if (item.status === "listened") return "听过"
  if (item.status === "watching") return "在看"
  if (item.status === "listening") return "在听"
  if (item.status === "paused") return "暂停"
  return kindMeta[item.kind].statusLabel
}

function tagLabel(tag: string): string {
  return tag.replace(/\//g, " / ")
}

function Cover({ item, currentSlug }: { item: MediaItem; currentSlug: FullSlug }) {
  const src = coverUrl(currentSlug, item.cover)

  if (src) {
    return (
      <img
        class={`media-cover media-cover-${item.kind}`}
        src={src}
        alt={`${item.title} 封面`}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <div
      class={`media-cover media-cover-${item.kind} media-cover-fallback`}
      aria-label={`${item.title} 封面占位`}
    >
      <span>{item.year}</span>
      <strong>{item.title}</strong>
    </div>
  )
}

function FeatureCard({ item, currentSlug }: { item: MediaItem; currentSlug: FullSlug }) {
  return (
    <a class="media-feature-card internal" href={resolveRelative(currentSlug, item.slug)}>
      <Cover item={item} currentSlug={currentSlug} />
      <span class="media-feature-copy">
        <span class="media-feature-kind">{kindMeta[item.kind].label}</span>
        <strong>{item.title}</strong>
        <span>{item.summary}</span>
      </span>
    </a>
  )
}

function MediaRow({ item, currentSlug }: { item: MediaItem; currentSlug: FullSlug }) {
  const visibleTags = item.tags.filter((tag) => !tag.startsWith("media/")).slice(0, 2)

  return (
    <article class="media-entry">
      <a class="media-entry-cover internal" href={resolveRelative(currentSlug, item.slug)}>
        <Cover item={item} currentSlug={currentSlug} />
      </a>
      <div class="media-entry-main">
        <p class="media-entry-meta">
          <span>{kindMeta[item.kind].label}</span>
          {item.year && <span>{item.year}</span>}
          {item.creator && <span>{item.creator}</span>}
        </p>
        <h3>
          <a class="internal" href={resolveRelative(currentSlug, item.slug)}>
            {item.title}
          </a>
        </h3>
        {item.summary && <p class="media-entry-summary">{item.summary}</p>}
        {visibleTags.length > 0 && (
          <ul class="media-tags">
            {visibleTags.map((tag) => (
              <li>
                <a
                  class="internal tag-link"
                  href={resolveRelative(currentSlug, `tags/${tag}` as FullSlug)}
                >
                  {tagLabel(tag)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <dl class="media-entry-facts">
        <div>
          <dt>状态</dt>
          <dd>{statusText(item)}</dd>
        </div>
        <div>
          <dt>日期</dt>
          <dd>{formatDate(item.finished)}</dd>
        </div>
      </dl>
    </article>
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
      <section class="media-index media-empty" aria-labelledby="media-index-title">
        <h2 id="media-index-title">还没有条目</h2>
        <p>在 media 目录里添加带有 kind 字段的 Markdown，就会出现在这里。</p>
      </section>
    )
  }

  const groups = kindOrder.map((kind) => ({
    kind,
    items: items.filter((item) => item.kind === kind),
  }))
  const featured = items.filter((item) => item.featured).sort(sortRecent)
  const latest = items[0]

  return (
    <section class="media-index" aria-labelledby="media-index-title">
      <div class="media-dashboard">
        <div>
          <p class="media-kicker">Archive / {String(items.length).padStart(2, "0")} entries</p>
          <h2 id="media-index-title">一间小型私人资料室</h2>
          <p>不是完整目录和推荐清单，慢慢记录我看过听过的一些喜欢的作品。</p>
        </div>
        <dl class="media-stats" aria-label="媒体档案统计">
          <div>
            <dt>记录</dt>
            <dd>{items.length}</dd>
          </div>
          <div>
            <dt>精选</dt>
            <dd>{featured.length}</dd>
          </div>
          <div>
            <dt>最近</dt>
            <dd>{latest ? formatDate(latest.finished) : "未记录"}</dd>
          </div>
        </dl>
      </div>

      <nav class="media-kind-nav" aria-label="媒体分类">
        {groups.map(({ kind, items }) => (
          <a class="internal" href={`#media-${kind}`}>
            <span>{kindMeta[kind].label}</span>
            <small>
              {items.length}
              {kindMeta[kind].noun}
            </small>
          </a>
        ))}
      </nav>

      {featured.length > 0 && (
        <section class="media-featured" aria-labelledby="media-featured-title">
          <div class="media-section-heading">
            <p>精选</p>
            <h2 id="media-featured-title">几条可以先看的记录</h2>
          </div>
          <div class="media-feature-grid">
            {featured.map((item) => (
              <FeatureCard item={item} currentSlug={currentSlug} />
            ))}
          </div>
        </section>
      )}

      <div class="media-catalog">
        {groups.map(({ kind, items }) => (
          <section
            class="media-kind-section"
            id={`media-${kind}`}
            aria-labelledby={`media-${kind}-title`}
          >
            <div class="media-kind-heading">
              <div>
                <p>{kindMeta[kind].label}</p>
                <h2 id={`media-${kind}-title`}>{kindMeta[kind].label}记录</h2>
              </div>
              <span>
                {items.length}
                {kindMeta[kind].noun}
              </span>
            </div>
            <div class="media-entry-list">
              {items.slice(0, 10).map((item) => (
                <MediaRow item={item} currentSlug={currentSlug} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

MediaIndex.css = `
.media-index {
  margin-top: 2rem;
}

.media-dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(14rem, 0.55fr);
  gap: 1.25rem;
  align-items: stretch;
  padding: 1.25rem 0 1.5rem;
  border-top: 1px solid var(--lightgray);
  border-bottom: 1px solid var(--lightgray);
}

.media-dashboard h2,
.media-section-heading h2,
.media-kind-heading h2 {
  margin: 0;
  text-wrap: balance;
}

.media-dashboard h2 {
  max-width: 13em;
  font-size: 1.62rem;
  line-height: 1.45;
}

.media-dashboard p {
  max-width: 48rem;
  margin: 0.7rem 0 0;
  text-wrap: pretty;
}

.media-kicker,
.media-section-heading p,
.media-kind-heading p,
.media-feature-kind,
.media-entry-meta,
.media-entry-facts dt {
  margin: 0;
  color: var(--gray);
  font-size: 0.78rem;
  line-height: 1.35;
}

.media-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin: 0;
  border-left: 1px solid var(--lightgray);
}

.media-stats > div {
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  gap: 0.75rem;
  align-items: baseline;
  padding: 0.65rem 0 0.65rem 1rem;
  border-bottom: 1px solid var(--lightgray);
}

.media-stats > div:last-child {
  border-bottom: 0;
}

.media-stats dt,
.media-stats dd,
.media-entry-facts dt,
.media-entry-facts dd {
  margin: 0;
}

.media-stats dd {
  color: var(--dark);
  font-family: var(--codeFont);
  font-size: 1.15rem;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.media-kind-nav {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6rem;
  margin: 1rem 0 2rem;
}

.media-kind-nav a {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: baseline;
  min-width: 0;
  padding: 0.68rem 0.8rem;
  border: 1px solid var(--lightgray);
  border-radius: 8px;
  background: color-mix(in srgb, var(--light) 86%, var(--lightgray));
  transition:
    border-color 160ms ease,
    transform 160ms ease;
}

.media-kind-nav a:hover {
  border-color: var(--secondary);
  transform: translateY(-1px);
}

.media-kind-nav span {
  color: var(--dark);
}

.media-kind-nav small {
  color: var(--gray);
  font-family: var(--codeFont);
  font-variant-numeric: tabular-nums;
}

.media-section-heading {
  display: grid;
  gap: 0.2rem;
  margin-bottom: 0.9rem;
}

.media-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.media-index a.media-feature-card {
  display: grid;
  grid-template-columns: 5.6rem minmax(0, 1fr);
  gap: 0.85rem;
  align-items: center;
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid var(--lightgray);
  border-radius: 8px;
  background: color-mix(in srgb, var(--light) 92%, var(--lightgray));
  transition:
    border-color 160ms ease,
    transform 160ms ease;
}

.media-index a.media-feature-card:hover {
  border-color: var(--secondary);
  transform: translateY(-1px);
}

.media-feature-copy {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
  overflow-wrap: anywhere;
}

.media-feature-copy strong {
  color: var(--dark);
  line-height: 1.35;
}

.media-feature-copy span:last-child {
  color: var(--darkgray);
  font-size: 0.92rem;
  line-height: 1.55;
  text-wrap: pretty;
}

.media-cover {
  display: block;
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--lightgray) 72%, var(--gray));
  background: var(--lightgray);
}

.media-cover-album {
  aspect-ratio: 1;
}

.media-cover-fallback {
  box-sizing: border-box;
  display: grid;
  align-content: end;
  gap: 0.5rem;
  padding: 0.75rem;
}

.media-cover-fallback span {
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.75rem;
}

.media-cover-fallback strong {
  color: var(--dark);
  line-height: 1.25;
}

.media-catalog {
  display: grid;
  gap: 2.2rem;
  margin-top: 2.4rem;
}

.media-kind-section {
  scroll-margin-top: 1.5rem;
}

.media-kind-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  margin-bottom: 0.8rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--lightgray);
}

.media-kind-heading > span {
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.88rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.media-entry-list {
  display: grid;
  gap: 0;
}

.media-entry {
  display: grid;
  grid-template-columns: 4.75rem minmax(0, 1fr) minmax(7rem, 0.22fr);
  gap: 0.9rem;
  align-items: start;
  padding: 0.85rem 0;
  border-top: 1px solid color-mix(in srgb, var(--lightgray) 78%, transparent);
}

.media-entry:last-child {
  border-bottom: 1px solid color-mix(in srgb, var(--lightgray) 78%, transparent);
}

.media-entry-cover {
  display: block;
}

.media-entry h3 {
  margin: 0.2rem 0 0;
  font-size: 1rem;
  line-height: 1.45;
}

.media-entry-summary {
  margin: 0.25rem 0 0;
  font-size: 0.92rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
  text-wrap: pretty;
}

.media-entry-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.55rem;
}

.media-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0.55rem 0 0;
  padding: 0;
  list-style: none;
}

.media-tags li {
  line-height: 1;
}

.media-tags a {
  font-size: 0.78rem;
  line-height: 1.3;
}

.media-entry-facts {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  text-align: right;
}

.media-entry-facts dd {
  color: var(--dark);
  font-family: var(--codeFont);
  font-size: 0.88rem;
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
}

.media-empty {
  padding: 1rem 0;
  border-top: 1px solid var(--lightgray);
}

@media all and (max-width: 800px) {
  .media-dashboard,
  .media-feature-grid,
  .media-entry {
    grid-template-columns: 1fr;
  }

  .media-dashboard h2 {
    font-size: 1.38rem;
  }

  .media-stats {
    border-left: 0;
    border-top: 1px solid var(--lightgray);
  }

  .media-stats > div {
    padding-left: 0;
  }

  .media-kind-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .media-index a.media-feature-card {
    grid-template-columns: 5rem minmax(0, 1fr);
  }

  .media-entry {
    grid-template-columns: 4.5rem minmax(0, 1fr);
  }

  .media-entry-facts {
    grid-column: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    text-align: left;
  }
}

@media all and (max-width: 520px) {
  .media-kind-nav {
    grid-template-columns: 1fr;
  }

}
`

export default (() => MediaIndex) satisfies QuartzComponentConstructor
