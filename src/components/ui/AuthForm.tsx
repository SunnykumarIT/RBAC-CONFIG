'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function AuthForm() {
  const [type, setType] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (type === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      setLoading(false)

      if (error) {
        setError(error.message)
      } else if (!data.user?.confirmed_at) {
        setError('Email not confirmed. Please check your inbox.')
      } else {
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`, // ✅ Supabase redirect after email confirmation
        },
      })
      setLoading(false)

      if (error) {
        setError(error.message)
      } else {
        alert('Signup successful. Please check your email to verify your account before logging in.')
        router.push('/login')
      }
    }
  }

  return (
    <Card className="max-w-sm mx-auto mt-20">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-center">
          <ToggleGroup
            type="single"
            value={type}
            onValueChange={(val) => {
              if (val) setType(val as 'login' | 'signup')
            }}
            className="gap-2"
          >
            <ToggleGroupItem value="login">Login</ToggleGroupItem>
            <ToggleGroupItem value="signup">Signup</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? type === 'login'
                ? 'Logging in...'
                : 'Signing up...'
              : type === 'login'
              ? 'Login'
              : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}







