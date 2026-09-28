import { Link, useParams } from 'react-router-dom'
import BuyerProfile from '../components/BuyerProfile'

export default function BuyerProfilePage() {
  const { id = '' } = useParams()
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link to="/buyers" className="hover:text-ink hover:underline">Buyer Discovery</Link>
        <span className="mx-2 text-faint">/</span>
        <span className="text-ink">Buyer profile</span>
      </nav>
      <BuyerProfile id={id} />
    </>
  )
}
