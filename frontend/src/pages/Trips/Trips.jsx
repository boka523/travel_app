import React from 'react'
import './Trips.css'
import Navbar from '../../components/Navbar/Navbar'
import MyTrips from '../../components/MyTrips/MyTrips'

const Trips = ({darkMode, toggleMode}) => {
    return (
        <div>
            <Navbar darkMode={darkMode} toggleMode={toggleMode}/>
            <MyTrips darkMode={darkMode} toggleMode={toggleMode}/>
        </div>
    )
}

export default Trips