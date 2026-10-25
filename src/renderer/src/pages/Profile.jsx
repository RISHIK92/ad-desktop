import { useState } from 'react'
import api from '../lib/api'
import useForm from '../lib/useForm'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import FormField from '../components/FormField'
import { validateName } from '@shared/validators'
import { formatDateTime } from '../lib/format'

const validate = (v) => {
  const err = validateName(v.name)
  return { errors: err ? { name: err } : {} }
}

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const { values, errors, field, trySubmit, setServerErrors } = useForm({ name: user.name }, validate)

  const save = async (e) => {
    e.preventDefault()
    if (!trySubmit()) return
    setBusy(true)
    try {
      const { user: updated } = await api.auth.updateProfile({ name: values.name })
      setUser(updated)
      toast('Profile updated')
    } catch (err) {
      if (err.fields?.name) setServerErrors(err.fields)
      else toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page__inner page__inner--narrow">
      <div className="page__header">
        <h1>Profile</h1>
      </div>
      <form className="card" onSubmit={save} noValidate>
        <div className="poster profile__head">
          <div className="avatar avatar--lg">{user.name[0]}</div>
          <div>
            <h2>{user.name}</h2>
            <div className="muted">{user.email}</div>
            <div className="muted small">Member since {formatDateTime(user.createdAt)}</div>
          </div>
        </div>
        <FormField label="Name" error={errors.name} htmlFor="name">
          <input {...field('name')} />
        </FormField>
        <FormField label="Email" hint="Email can’t be changed" htmlFor="email">
          <input id="email" value={user.email} disabled />
        </FormField>
        <div className="form-actions">
          <button type="button" className="btn btn--danger" onClick={logout}>
            Logout
          </button>
          <button className="btn btn--primary" disabled={busy || values.name.trim() === user.name}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
