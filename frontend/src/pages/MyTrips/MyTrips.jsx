import React from 'react'
import './MyTrips.css'
import Navbar from '../../components/Navbar/Navbar'
import MyTripsForm from '../../components/MyTripsForm/MyTripsForm'

const MyTrips = ({darkMode, toggleMode}) => {
    return (
        <div>
            <Navbar darkMode={darkMode} toggleMode={toggleMode}/>
            <MyTripsForm darkMode={darkMode}/>
        </div>
    )
}

export default MyTrips