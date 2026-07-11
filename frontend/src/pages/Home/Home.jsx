import React from 'react'
import './Home.css'
import Navbar from '../../components/Navbar/Navbar'
import Hero from '../../components/Hero/Hero'

const Home = ({darkMode, toggleMode}) => {
    return (
        <div>
            <Navbar darkMode={darkMode} toggleMode={toggleMode}/>
            <Hero darkMode={darkMode}/>
        </div>
    )
}

export default Home