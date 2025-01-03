import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './pages/auth/login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login></Login>}>
          {' '}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
