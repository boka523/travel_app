import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import ProfileForm from '../../components/ProfileForm/ProfileForm'

const Profile = ({darkMode, toggleMode}) => {
  return (
    <div>
      <Navbar darkMode={darkMode} toggleMode={toggleMode} variant="profile"/>
      <ProfileForm darkMode={darkMode}/>
    </div>
  )
}

export default Profile