import { Root as HtmlRoot, Element, Text } from "hast"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

type TimelineEntry = {
  content: string
}

type TimelineGroup = {
  date: string
  entries: TimelineEntry[]
}

function extractText(node: Element | Text): string {
  if (node.type === "text") return node.value
  if ("children" in node) {
    return (node.children as (Element | Text)[]).map(extractText).join("")
  }
  return ""
}

function parseTimeline(tree: HtmlRoot): TimelineGroup[] {
  const groups: TimelineGroup[] = []
  let current: TimelineGroup | null = null

  for (const node of tree.children) {
    if (node.type !== "element") continue

    if (node.tagName === "h3") {
      const text = extractText(node).trim()
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        current = { date: text, entries: [] }
        groups.push(current)
      }
    } else if (node.tagName === "ul" && current) {
      for (const li of node.children) {
        if (li.type === "element" && li.tagName === "li") {
          const text = extractText(li).trim()
          if (text) current.entries.push({ content: text })
        }
      }
    }
  }

  return groups
}

const Timeline: QuartzComponent = ({ tree }: QuartzComponentProps) => {
  const groups = parseTimeline(tree as HtmlRoot)

  if (groups.length === 0) {
    return (
      <article class="tl-root tl-empty-state">
        <div class="tl-empty-inner">
          <p class="tl-empty-hint">
            用 <code>### YYYY-MM-DD</code> 加列表写第一条想法
          </p>
        </div>
      </article>
    )
  }

  return (
    <article class="tl-root">
      <div class="tl-stream">
        {groups.map((group, gi) => (
          <section class="tl-day" key={group.date + gi}>
            <div class="tl-date-col">
              <time class="tl-date" datetime={group.date}>
                {group.date}
              </time>
              <span class="tl-dot" aria-hidden="true" />
            </div>
            <div class="tl-entries">
              {group.entries.map((entry, ei) => (
                <div class="tl-card" key={ei}>
                  <p>{entry.content}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}

Timeline.css = `
.tl-root {
  margin-top: 0.5rem;
}

/* ── Stream ── */
.tl-stream {
  position: relative;
  padding-left: 1px;
}

.tl-stream::before {
  content: "";
  position: absolute;
  left: 5.8rem;
  top: 0.6rem;
  bottom: 0;
  width: 1px;
  background: var(--lightgray);
}

/* ── Day group ── */
.tl-day {
  display: grid;
  grid-template-columns: 5.8rem minmax(0, 1fr);
  position: relative;
}

.tl-day + .tl-day {
  margin-top: 1.6rem;
}

/* ── Date column ── */
.tl-date-col {
  position: relative;
  padding-top: 0.72rem;
  padding-right: 1.5rem;
  text-align: right;
}

.tl-date {
  display: block;
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.tl-dot {
  position: absolute;
  right: -3px;
  top: 0.72rem;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--lightgray);
  transition: background 200ms ease;
}

.tl-day:first-child .tl-dot {
  background: var(--secondary);
}

/* ── Entry cards ── */
.tl-entries {
  display: grid;
  gap: 0.45rem;
  padding-left: 1.5rem;
}

.tl-card {
  padding: 0.7rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--lightgray) 60%, transparent);
}

.tl-day:last-child .tl-entries .tl-card:last-child {
  border-bottom: none;
}

.tl-card p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.8;
  color: var(--darkgray);
}

/* ── Empty state ── */
.tl-empty-state {
  display: grid;
  place-items: center;
  min-height: 12rem;
}

.tl-empty-inner {
  text-align: center;
}

.tl-empty-hint {
  color: var(--gray);
  font-size: 0.88rem;
}

.tl-empty-hint code {
  font-size: 0.82rem;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  background: var(--lightgray);
}

/* ── Responsive ── */
@media all and (max-width: 600px) {
  .tl-stream::before {
    display: none;
  }

  .tl-dot {
    display: none;
  }

  .tl-day {
    grid-template-columns: 1fr;
  }

  .tl-date-col {
    text-align: left;
    padding-right: 0;
    padding-top: 0;
    padding-bottom: 0.3rem;
  }

  .tl-entries {
    padding-left: 0;
    border-left: 2px solid var(--lightgray);
    padding-left: 1rem;
  }
}
`

export default (() => Timeline) satisfies QuartzComponentConstructor
