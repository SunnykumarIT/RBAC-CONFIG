// components/LogoutButton.tsx

'use client'

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <Button variant="destructive" onClick={handleLogout}>
      Logout
    </Button>
  )
}

export default LogoutButton