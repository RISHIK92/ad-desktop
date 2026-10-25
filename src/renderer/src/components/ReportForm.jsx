import { useState } from 'react'
import useForm from '../lib/useForm'
import FormField from './FormField'
import { CATEGORIES, LOCATIONS, LIMITS } from '@shared/constants'
import { validateReport, todayYmd } from '@shared/validators'

export const EMPTY_REPORT = {
  type: 'lost',
  title: '',
  category: '',
  description: '',
  date: todayYmd(),
  location: '',
  locationDetail: '',
  privateNote: ''
}

export default function ReportForm({ initial = EMPTY_REPORT, submitLabel, onSubmit, onCancel }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { values, setValues, errors, field, trySubmit, setServerErrors } = useForm(
    initial,
    validateReport
  )
  const isFound = values.type === 'found'

  const setType = (type) =>
    setValues((v) => ({ ...v, type, privateNote: type === 'lost' ? '' : v.privateNote }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!trySubmit()) return
    setBusy(true)
    try {
      await onSubmit(values)
    } catch (err) {
      if (Object.keys(err.fields || {}).length) setServerErrors(err.fields)
      else setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form className="card report-form" onSubmit={submit} noValidate>
      <div className="segmented">
        <button
          type="button"
          className={`segmented__opt${!isFound ? ' segmented__opt--lost' : ''}`}
          onClick={() => setType('lost')}
        >
          I lost something
        </button>
        <button
          type="button"
          className={`segmented__opt${isFound ? ' segmented__opt--found' : ''}`}
          onClick={() => setType('found')}
        >
          I found something
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <FormField label="Item name" error={errors.title} htmlFor="title">
        <input
          placeholder="e.g. Black leather wallet"
          maxLength={LIMITS.titleMax}
          {...field('title')}
        />
      </FormField>

      <div className="grid-2">
        <FormField label="Category" error={errors.category} htmlFor="category">
          <select {...field('category')}>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </FormField>
        <FormField
          label={isFound ? 'Date found' : 'Date lost'}
          error={errors.date}
          htmlFor="date"
        >
          <input type="date" max={todayYmd()} {...field('date')} />
        </FormField>
      </div>

      <FormField
        label="Description"
        error={errors.description}
        hint="Color, brand, size and any distinguishing marks"
        htmlFor="description"
      >
        <textarea maxLength={LIMITS.descriptionMax} {...field('description')} />
      </FormField>

      <div className="grid-2">
        <FormField label="Location" error={errors.location} htmlFor="location">
          <select {...field('location')}>
            <option value="">Select a location</option>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Location detail (optional)"
          error={errors.locationDetail}
          htmlFor="locationDetail"
        >
          <input
            placeholder="e.g. 2nd floor, near printers"
            maxLength={LIMITS.locationDetailMax}
            {...field('locationDetail')}
          />
        </FormField>
      </div>

      {isFound && (
        <FormField
          label="Private verification detail (optional)"
          error={errors.privateNote}
          hint="Only you will see this. Ask people claiming the item to describe it, and compare their answer to this detail."
          htmlFor="privateNote"
        >
          <input
            placeholder="e.g. Has a blue sticker inside"
            maxLength={LIMITS.privateNoteMax}
            {...field('privateNote')}
          />
        </FormField>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        )}
        <button className="btn btn--primary" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
