import { useState } from 'react'

// Tracks values, touched fields and errors from a shared validator.
export default function useForm(initial, validate) {
  const [values, setValues] = useState(initial)
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const { errors } = validate(values)
  const visible = {}
  for (const key of Object.keys(values)) {
    if (serverErrors[key]) visible[key] = serverErrors[key]
    else if ((touched[key] || submitted) && errors[key]) visible[key] = errors[key]
  }

  const field = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: (e) => {
      const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setValues((prev) => ({ ...prev, [name]: v }))
      setServerErrors((prev) => ({ ...prev, [name]: undefined }))
    },
    onBlur: () => setTouched((prev) => ({ ...prev, [name]: true }))
  })

  // Returns true when the form is valid and ready to submit.
  const trySubmit = () => {
    setSubmitted(true)
    return Object.keys(validate(values).errors).length === 0
  }

  return { values, setValues, errors: visible, field, trySubmit, setServerErrors }
}
