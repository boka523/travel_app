import React from 'react'
import './Hero.css'
import { Link, Links } from 'react-router-dom'

const Hero = ({darkMode}) => {
  return (
    <div className={`hero container ${darkMode ? "dark": ""}`}>
        <div className={`hero-text ${darkMode ? "tint" : "black-letters"}`}>
          <h1>Welcome to WayAway!</h1>
          <h2>An app that takes you one step closer to your desired getaway</h2>
          <p>WayAway is detailed trip expenses calculator. Just enter destination, time-stamps and a few other tweaks to get fully calculated budget for your trip without any hidden expenses.</p>
        </div>
        <div className={`login-signup ${darkMode ? "tint" : ""}`}>
            <Link to="/login"><button className={`btn ${darkMode ? "" : "dark-btn"}`}>Login</button></Link>
            <Link to="/signup"><button className={`btn ${darkMode ? "" : "dark-btn"}`}>Signup</button></Link>
        </div>
    </div>
  )
}

export default Hero