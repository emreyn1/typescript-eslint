import type { Metadata } from "next"
import { ProfileContent } from "@/components/account/profile-content"

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your Alliance Aroma account profile and settings.",
}

export default function AccountPage() {
  return <ProfileContent />
}
