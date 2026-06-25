import React from 'react'
import './Navbar.css'
import dark_logo from '../../assets/dark_logo.png'
import white_logo from '../../assets/white_logo.png'
import dark_moon from '../../assets/dark_moon.png'
import white_sun from '../../assets/white_sun.png'


const Navbar = ({darkMode, toggleMode}) => {
  return (
    <nav className='container'>
        <div className="logo-wrapper">
          <img src={white_logo} className={`logo ${darkMode ? "show" : "hide"}`} />
          <img src={dark_logo} className={`logo ${darkMode ? "hide" : "show"}`} />
        </div>
        <button className={darkMode ? 'btn' : 'btn dark-btn'} onClick={toggleMode}>
          <img src={white_sun} alt="" className='mode'/>
          <img src={dark_moon} alt="" className='mode'/>
        </button>
    </nav>
  )
}

export default Navbar