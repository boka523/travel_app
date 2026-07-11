import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import AddTrip from './pages/AddTrip/AddTrip'
import Trips from './pages/Trips/Trips'
import { Toaster } from 'react-hot-toast'
function App() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleMode = () => {
    darkMode ? setDarkMode(false) : setDarkMode(true);
  }
  return (
    <>
      <Toaster position='top-center'/>
      <Router>
        <Routes>
          <Route path='/' element={<Home darkMode={darkMode} toggleMode={toggleMode}/>}/>
          <Route path='/login' element={<Login darkMode={darkMode} toggleMode={toggleMode}/>}/>
          <Route path='/signup' element={<Signup darkMode={darkMode} toggleMode={toggleMode}/>}/>
          <Route path='/addtrip' element={<AddTrip darkMode={darkMode} toggleMode={toggleMode}/>}/>
          <Route path='/trips' element={<Trips darkMode={darkMode} toggleMode={toggleMode}/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
