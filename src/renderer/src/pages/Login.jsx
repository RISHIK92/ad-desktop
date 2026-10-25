import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useForm from '../lib/useForm'
import { useAuth } from '../context/AuthContext'
import { validateLogin } from '@shared/validators'
import FormField from '../components/FormField'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { values, errors, field, trySubmit } = useForm({ email: '', password: '' }, validateLogin)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!trySubmit()) return
    setBusy(true)
    try {
      signIn(await api.auth.login(values))
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <form className="card auth__card" onSubmit={onSubmit} noValidate>
        <div className="auth__brand">
          <span className="logo">CF</span>
          <h1>CampusFind</h1>
        </div>
        <p className="muted">Log in to report and find lost items on campus.</p>
        {error && <div className="alert alert--error">{error}</div>}
        <FormField label="Email" error={errors.email} htmlFor="email">
          <input type="email" autoComplete="email" autoFocus {...field('email')} />
        </FormField>
        <FormField label="Password" error={errors.password} htmlFor="password">
          <input type="password" autoComplete="current-password" {...field('password')} />
        </FormField>
        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
        <p className="auth__switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <div className="demo-note">
          <strong>Demo accounts</strong>
          <span>aarav@campusfind.demo · priya@campusfind.demo · rahul@campusfind.demo</span>
          <span>
            Password: <code>Demo1234</code>
          </span>
        </div>
      </form>
    </div>
  )
}
