import React, { useState } from 'react'
import './Home.css'
import Navbar from '../../components/Navbar/Navbar'
import Hero from '../../components/Hero/Hero'

const Home = () => {
    const [darkMode, setDarkMode] = useState(false);
    const toggleMode = () => {
        darkMode ? setDarkMode(false) : setDarkMode(true);
    }
    return (
        <div>
            <Navbar darkMode={darkMode} toggleMode={toggleMode}/>
            <Hero darkMode={darkMode} toggleMode={toggleMode}/>
        </div>
    )
}

export default Home