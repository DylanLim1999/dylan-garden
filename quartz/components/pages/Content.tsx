import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { concatenateResources } from "../../util/resources"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import TimelineConstructor from "../Timeline"

const TimelineComponent = TimelineConstructor()

const Content: QuartzComponent = ({ fileData, tree, ...rest }: QuartzComponentProps) => {
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []

  if (classes.includes("timeline-page")) {
    return <TimelineComponent fileData={fileData} tree={tree} {...rest} />
  }

  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren
  const classString = ["popover-hint", ...classes].join(" ")
  return <article class={classString}>{content}</article>
}

Content.css = concatenateResources(TimelineComponent.css)

export default (() => Content) satisfies QuartzComponentConstructor
