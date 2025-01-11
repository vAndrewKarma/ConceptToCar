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

function App() {
  return (
    <BrowserRouter>
      <NavScroll />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Copyright />
    </BrowserRouter>
  )
}

export default App
