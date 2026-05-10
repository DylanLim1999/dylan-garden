import { ComponentChildren } from "preact"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { concatenateResources } from "../../util/resources"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import FolderContent from "./FolderContent"
import MediaIndex from "../MediaIndex"

const DefaultFolderContent = FolderContent()
const MediaIndexContent = MediaIndex()

const SmartFolderContent: QuartzComponent = (props: QuartzComponentProps) => {
  const { tree, fileData } = props

  if (fileData.slug !== "media/index") {
    return <DefaultFolderContent {...props} />
  }

  const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
  const classes = ["popover-hint", ...cssClasses].join(" ")
  const content = (
    (tree as Root).children.length === 0
      ? fileData.description
      : htmlToJsx(fileData.filePath!, tree)
  ) as ComponentChildren

  return (
    <div class="media-folder-content">
      <article class={classes}>{content}</article>
      <MediaIndexContent {...props} />
    </div>
  )
}

SmartFolderContent.css = concatenateResources(DefaultFolderContent.css, MediaIndexContent.css)

export default (() => SmartFolderContent) satisfies QuartzComponentConstructor
