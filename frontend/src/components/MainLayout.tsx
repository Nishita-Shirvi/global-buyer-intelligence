import { Outlet } from 'react-router-dom'
import Header from './Header'

/**
 * Shell for the working pages (Markets, Buyer Discovery, Data Sources, buyer profiles).
 * It never blocks on the backend: each page handles its own loading and unavailable states.
 * The landing page renders its own full-screen layout instead.
 */
export default function MainLayout() {
  return (
    <div className="min-h-full bg-paper">
      <Header variant="solid" />
      <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <Outlet />
      </main>
    </div>
  )
}
