import { Navigate, useParams } from 'react-router-dom'

// Tracking now lives on the order screen itself (live map on top, status and
// details below), so customers have one place for their order instead of two
// screens repeating the same status and addresses. Old /track links still work.
export default function TrackingPage() {
  const { id } = useParams()
  return <Navigate to={`/orders/${id}`} replace />
}
