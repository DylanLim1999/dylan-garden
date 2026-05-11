import { QuartzConfig } from "./quartz/cfg"
import * as Component from "./quartz/components"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "浮游空間",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "zh-CN",
    baseUrl: "piio.me",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: { name: "Noto Serif SC", weights: [400, 700], includeItalic: false },
        body: { name: "Noto Sans SC", weights: [400, 700], includeItalic: false },
        code: "monospace",
      },
      colors: {
        lightMode: {
          light: "#faf9f6",
          lightgray: "#e8e4df",
          gray: "#b8b4af",
          darkgray: "#4a4845",
          dark: "#2a2826",
          secondary: "#3a5f9e",
          tertiary: "#0077aa",
          highlight: "rgba(58, 95, 158, 0.06)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#1a1918",
          lightgray: "#302e2b",
          gray: "#6a6762",
          darkgray: "#d4d2cf",
          dark: "#eae9e7",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(123, 151, 170, 0.08)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage({
        pageBody: Component.SmartFolderContent(),
      }),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      // Plugin.CustomOgImages(),
    ],
  },
}

export default config
