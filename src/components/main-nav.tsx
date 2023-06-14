import * as React from "react"
import Link from "next/link"

import { siteConfig } from "~/config/site"
import { Ungroup } from "lucide-react"


export function MainNav() {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
      <Ungroup className="h-6 w-6"/>
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
    </div>
  )
}