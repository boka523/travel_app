import React from 'react'
import './EditTripForm.css'

const EditTripForm = ({darkMode}) => {
  return (
    <div className='edit-trip-form container'>
        <div className='title'>
            <div className={`edit-trip-text ${darkMode ? "tint white-letters" : ""}`}>
                <h1>Edit trip details</h1>
            </div>
        </div>
        <div className={`edit-trip-card ${darkMode ? "tint white-letters" : ""}`}>
            blablablablabla
        </div>
    </div>
  )
}

export default EditTripForm