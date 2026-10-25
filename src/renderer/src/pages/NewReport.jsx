import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import ReportForm from '../components/ReportForm'
import { useToast } from '../components/Toast'

export default function NewReport() {
  const navigate = useNavigate()
  const toast = useToast()

  const create = async (values) => {
    const report = await api.reports.create(values)
    toast('Report posted')
    navigate(`/reports/${report.id}`)
  }

  return (
    <div className="page__inner page__inner--narrow">
      <div className="page__header">
        <h1>Report an item</h1>
      </div>
      <ReportForm submitLabel="Post report" onSubmit={create} onCancel={() => navigate(-1)} />
    </div>
  )
}
