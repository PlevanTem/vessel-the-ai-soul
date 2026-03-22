import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthModal from './components/AuthModal'
import AsciiBackground from './generative/AsciiBackground'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import SoulDetailPage from './pages/SoulDetailPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative" style={{ background: 'var(--color-paper)' }}>
          <AsciiBackground density="sparse" />

          <Navbar />

          <main style={{ position: 'relative', zIndex: 10 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/soul/:slug" element={<SoulDetailPage />} />
            </Routes>
          </main>

          <Footer />

          {/* Global auth modal — rendered at root so it overlays everything */}
          <AuthModal />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
