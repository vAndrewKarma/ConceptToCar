import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './hook/useAuth.tsx'
import { AuthProvider } from './contexts/authContext.tsx'
import NavScroll from './components/navbar'
import Login from './pages/auth/login'
import Home from './pages/home'
import SignUp from './pages/auth/sign-up'
import Contact from './pages/contact'
import PageNotFound from './pages/404'
// import Copyright from './components/copyright.tsx'
import Recover from './pages/auth/forgot-password/recover.tsx'
import NewPassword from './pages/auth/forgot-password/new-password.tsx'
import EmailVerification from './pages/auth/email-verification.tsx'
import PublicRoute from './pub_prot/public.tsx'
import ProtectedRoute from './pub_prot/prot.tsx'
import Dashboard from './pages/functionality/dashboard.tsx'
import Products from './pages/functionality/products.tsx'
import Profile from './pages/account/profile.tsx'
import Product from './pages/functionality/product.tsx'
import Materials from './pages/functionality/materials.tsx'

function App() {
  const auth = useAuth()

  if (auth.isLoading) {
    return <div>Loading app...</div>
  }
  return (
    <AuthProvider auth={auth}>
      <BrowserRouter>
        <NavScroll />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/sign-in"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/sign-up"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:name/:id"
            element={
              <ProtectedRoute>
                <Product />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:productName/:productId/materials"
            element={
              <ProtectedRoute>
                <Materials />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/recover" element={<Recover />} />
          <Route path="/new-password" element={<NewPassword />} />

          <Route
            path="/email-verification/:code"
            element={<EmailVerification />}
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        {/* <Copyright /> */}
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
