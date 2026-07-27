import React, { useState } from 'react'
import './EditTripForm.css'

const EditTripForm = ({darkMode, trip, setTrip}) => {
    const [editingField, setEditingField] = useState(null);
  return (
    <div className='edit-trip-form container'>
        <div className='title'>
            <div className={`edit-trip-text ${darkMode ? "tint white-letters" : ""}`}>
                <h1>Edit trip details</h1>
            </div>
        </div>
        <div className={`edit-trip-card ${darkMode ? "tint white-letters" : ""}`}>
            <div className='detail-value'>
                <span>Destination: {trip.destination}</span>
            </div> 
            <div className='detail-value'>
                <span>Start date: {new Date(trip.start_date).toLocaleDateString("hr-HR")}</span>
            </div> 
            <div className='detail-value'>
                <span>End date: {new Date(trip.end_date).toLocaleDateString("hr-HR")}</span>
            </div> 
            <div className='detail-value'>
                <span>Number of passengers: {trip.passengers_num}</span>
            </div> 
            <div className='detail-value'>
                <span>Transport type: {trip.transport_type}</span>
            </div> 
            {trip.hotels ? (
                <div className='detail-value'>
                    <span>Hotel: {trip.hotels.name}</span>
                </div>
            ) : (
                <div className='detail-value'>
                    <span>Hotel nije odabran</span>
                </div>
            )}
            {trip.ai_cost ? (
                <div className='detail-value'>
                    <span>AI cost: {trip.ai_cost}</span>
                </div>
            ) : (
                <div className='detail-value'>
                    <span>AI cost nije izračunat</span>
                </div>
            )}
            <div className='detail-value'>
                <span>Total cost: {trip.total_cost}</span>
            </div>
        </div>
    </div>
  )
}

export default EditTripForm