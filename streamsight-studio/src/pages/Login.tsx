import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoginForm from '../components/LoginForm'
import { apiFetch } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUsername, setUserId } = useAuth()
  const [oauthHandled, setOauthHandled] = React.useState(false)

  React.useEffect(() => {
    const token = searchParams.get('token')
    if (token && !oauthHandled) {
      // Handle OAuth callback
      setOauthHandled(true)
      handleOAuthCallback(token)
    }
  }, [searchParams, oauthHandled])

  async function handleOAuthCallback(token: string) {
    // Store token
    localStorage.setItem('streamsight_access_token', token)
    try {
      const meRes = await apiFetch('/api/v1/auth/me')
      const meData = await meRes.json()
      setUsername(meData.username ?? 'User')
      setUserId(Number(meData.user_id))
      toast.success('Login successful')
      navigate('/')
    } catch (err) {
      toast.error('Failed to get user info')
      localStorage.removeItem('streamsight_access_token')
    }
  }

  async function submitLogin(username: string, password: string) {
    const body = new URLSearchParams()
    body.append('username', username)
    body.append('password', password)

    const res = await apiFetch(
      `/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Login failed: ${res.status}`)
    }

    const data = await res.json()
    const token = data?.access_token
    if (!token) throw new Error('No token returned from server')

    // store token and redirect
    localStorage.setItem('streamsight_access_token', token)
    try {
      const meRes = await apiFetch('/api/v1/auth/me')
      const meData = await meRes.json()
      setUsername(meData.username ?? username)
      // backend always returns user_id; coerce to number and set
      setUserId(Number(meData.user_id))
    } catch (err) {
      // if /me fails, still set the username to the submitted value as a fallback
      setUsername(username)
      setUserId(null)
    }
    // show success toast and redirect to home
    toast.success('Login is successful')
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-semibold mb-4">Sign in to streamsight</h2>
      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-md shadow">
        <LoginForm onSubmit={submitLogin} />
      </div>
    </div>
  )
}

export default Login
