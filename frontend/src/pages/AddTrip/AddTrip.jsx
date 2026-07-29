import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import AddTripForm from '../../components/AddTripForm/AddTripForm'

const AddTrip = ({darkMode, toggleMode}) => {
    return (
        <div>
            <Navbar darkMode={darkMode} toggleMode={toggleMode} variant="add-trips"/>
            <AddTripForm darkMode={darkMode}/>
        </div>
    )
}

export default AddTrip