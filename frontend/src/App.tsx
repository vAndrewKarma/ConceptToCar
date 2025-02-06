import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavScroll from './components/navbar'
import Login from './pages/auth/login'
import Home from './pages/home'
import SignUp from './pages/auth/sign-up'
import Contact from './pages/contact'
import PageNotFound from './pages/404'
import Copyright from './components/copyright'
import Recover from './pages/auth/forgot-password/recover.tsx'
import NewPassword from './pages/auth/forgot-password/new-password.tsx'
import EmailVerification from './pages/auth/email-verification.tsx'

function App() {
  return (
    <BrowserRouter>
      <NavScroll />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/recover" element={<Recover />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Copyright />
    </BrowserRouter>
  )
}

export default App
