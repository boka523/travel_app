import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import AddTrip from './pages/AddTrip/AddTrip'
import Trips from './pages/Trips/Trips'
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/addtrip' element={<AddTrip/>}/>
        <Route path='/trips' element={<Trips/>}/>
      </Routes>
    </Router>
  )
}

export default App
