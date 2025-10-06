import { ProfileClient } from "@/components/profile/profile-client"
import { SiteHeader } from "@/components/site-header"

export default function ProfilePage() {
  return (
    <div className="min-h-[100svh] bg-black text-white">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-6 pt-32 pb-24">
        <ProfileClient />
      </div>
    </div>
  )
}

