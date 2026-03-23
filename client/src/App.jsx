import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage           from './pages/HomePage'
import ListingsPage       from './pages/ListingsPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import ProfilePage        from './pages/ProfilePage'
import AdminPage          from './pages/AdminPage'
import NotFoundPage       from './pages/NotFoundPage'
import Navbar             from './components/layout/Navbar'
import Footer             from './components/layout/Footer'
import ProtectedRoute     from './components/common/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/listings"     element={<ListingsPage />} />
            <Route path="/listings/:id" element={<PropertyDetailPage />} />
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/register"     element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile"    element={<ProfilePage />} />
            </Route>
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin"      element={<AdminPage />} />
            </Route>
            <Route path="*"             element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
        }}
      />
    </BrowserRouter>
  )
}

export default App