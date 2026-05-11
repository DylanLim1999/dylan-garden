import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { type Options } from "./quartz/components/Explorer"

const explorerSort: Options["sortFn"] = (a, b) => {
  if (a.isFolder !== b.isFolder) {
    return a.isFolder ? -1 : 1
  }

  const aTime = Date.parse(String(a.data?.date ?? "")) || 0
  const bTime = Date.parse(String(b.data?.date ?? "")) || 0

  if (aTime !== bTime) {
    return bTime - aTime
  }

  return a.displayName.localeCompare(b.displayName, "zh-Hans-CN", {
    numeric: true,
    sensitivity: "base",
  })
}

const explorer = Component.Explorer({
  folderDefaultState: "collapsed",
  folderClickBehavior: "link",
  sortFn: explorerSort,
})

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments({
      provider: "giscus",
      options: {
        repo: "DylanLim1999/dylan-garden",
        repoId: "R_kgDOSYjtMg",
        category: "Announcements",
        categoryId: "DIC_kwDOSYjtMs4C8xF3",
        mapping: "pathname",
        strict: true,
        reactionsEnabled: true,
        inputPosition: "bottom",
        lang: "zh-CN",
      },
    }),
  ],
  footer: Component.Footer({
    links: {},
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta(), Component.TagList()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    explorer,
  ],
  right: [Component.DesktopOnly(Component.TableOfContents()), Component.Backlinks()],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    explorer,
  ],
  right: [],
}
