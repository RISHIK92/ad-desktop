import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useForm from '../lib/useForm'
import { useAuth } from '../context/AuthContext'
import { validateRegister } from '@shared/validators'
import FormField from '../components/FormField'

export default function Register() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { values, errors, field, trySubmit, setServerErrors } = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    validateRegister
  )

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!trySubmit()) return
    setBusy(true)
    try {
      signIn(await api.auth.register(values))
      navigate('/', { replace: true })
    } catch (err) {
      if (Object.keys(err.fields).length) setServerErrors(err.fields)
      else setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <form className="card auth__card" onSubmit={onSubmit} noValidate>
        <div className="auth__brand">
          <span className="logo">CF</span>
          <h1>Create account</h1>
        </div>
        {error && <div className="alert alert--error">{error}</div>}
        <FormField label="Full name" error={errors.name} htmlFor="name">
          <input autoComplete="name" autoFocus {...field('name')} />
        </FormField>
        <FormField label="Email" error={errors.email} htmlFor="email">
          <input type="email" autoComplete="email" {...field('email')} />
        </FormField>
        <FormField
          label="Password"
          error={errors.password}
          hint="At least 8 characters with a letter and a number"
          htmlFor="password"
        >
          <input type="password" autoComplete="new-password" {...field('password')} />
        </FormField>
        <FormField label="Confirm password" error={errors.confirmPassword} htmlFor="confirmPassword">
          <input type="password" autoComplete="new-password" {...field('confirmPassword')} />
        </FormField>
        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="auth__switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
