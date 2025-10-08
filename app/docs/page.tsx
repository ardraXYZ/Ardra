import type { Metadata } from "next"

import { DocsContent } from "@/components/docs/docs-content"

export const metadata: Metadata = {
  title: "Ardra Docs",
  description: "Deep dive into Ardra's automation stack, economics, data layer, and operating procedures.",
}

export default function DocsPage() {
  return <DocsContent />
}
