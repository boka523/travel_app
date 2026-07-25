import React from 'react'
import './EditTrip.css'
import Navbar from '../../components/Navbar/Navbar'
import EditTripForm from '../../components/EditTripForm/EditTripForm'

const EditTrip = ({darkMode, toggleMode}) => {
  return (
    <div>
        <Navbar darkMode={darkMode} toggleMode={toggleMode} variant="add-trips"/>
        <EditTripForm darkMode={darkMode}/>
    </div>
  )
}

export default EditTrip