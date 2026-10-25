import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import useAsync from '../lib/useAsync'
import ReportForm from '../components/ReportForm'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { Loading, ErrorState } from '../components/EmptyState'

export default function EditReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { data: report, error, loading, reload } = useAsync(() => api.reports.get(id), [id])

  if (loading) return <Loading />
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (report.userId !== user.id) {
    return <ErrorState error={{ message: 'Only the poster can edit this report' }} />
  }

  const save = async (values) => {
    await api.reports.update(id, values)
    toast('Report updated')
    navigate(`/reports/${id}`)
  }

  const initial = {
    type: report.type,
    title: report.title,
    category: report.category,
    description: report.description,
    date: report.date,
    location: report.location,
    locationDetail: report.locationDetail || '',
    privateNote: report.privateNote || ''
  }

  return (
    <div className="page__inner page__inner--narrow">
      <div className="page__header">
        <h1>Edit report</h1>
      </div>
      <ReportForm
        initial={initial}
        submitLabel="Save changes"
        onSubmit={save}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
