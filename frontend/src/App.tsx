import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { HashRouter, Routes, Route } from 'react-router-dom'
import NavScrollExample from './components/navbar'
import Login from './pages/auth/login'
import Home from './pages/home'
import SignUp from './pages/sign-up'
import Contact from './pages/contact'
import PageNotFound from './pages/404'

function App() {
  return (
    <HashRouter>
      <NavScrollExample />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </HashRouter>
  )
}

export default App
