import React from 'react'
import './ProfileForm.css'

const ProfileForm = ({darkMode}) => {
  return (
    <div className='profile-form container'>
        <div className={`profile-text ${darkMode ? "tint white-letters" : ""}`}>
            <h1>Your profile</h1>
        </div>
        <div className='profile-content'>
            <div className='profile-picture'>
                Here im trying to change profile pic
            </div>
            <div className='profile-info'>
                Heres all the info
            </div>
        </div>
    </div>
  )
}

export default ProfileForm