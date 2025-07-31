'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setEmail(user.email ?? '')
      setUserId(user.id)

      // Optional: fetch extra profile data from 'profiles' table
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (data?.full_name) setFullName(data.full_name)
    }
  }

  const updateProfile = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, full_name: fullName })

    setLoading(false)
    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated')
    }
  }

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      toast.error('Failed to send reset link')
    } else {
      toast.success('Password reset link sent to your email')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-black">Profile Settings</h1>
      <p className="text-gray-600 mt-2">View and update your profile info below.</p>

      <Card className="max-w-md mt-6">
        <CardContent className="space-y-4 p-4">
          <div>
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>

          <div>
            <Label>User ID</Label>
            <Input value={userId} disabled />
          </div>

          <div>
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <Button onClick={updateProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Update Profile'}
          </Button>

          <Button
            variant="secondary"
            onClick={handlePasswordReset}
            disabled={!email}
          >
            Send Password Reset Email
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
