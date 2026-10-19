import { Outlet } from 'react-router'

import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import Starfield from '@/components/starfield/Starfield'

export default function Root() {
  return (
    <>
      <Starfield />
      <div className="relative z-10 flex min-h-svh flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}
