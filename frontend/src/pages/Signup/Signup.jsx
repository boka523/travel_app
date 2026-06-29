import React from 'react'
import './Signup.css'
import Navbar from '../../components/Navbar/Navbar'
import SignupForm from '../../components/SignupForm/SignupForm'

const Signup = ({darkMode, toggleMode}) => {
    return (
        <div>
            <Navbar darkMode={darkMode} toggleMode={toggleMode}/>
            <SignupForm darkMode={darkMode} toggleMode={toggleMode}/>
        </div>
    )
}

export default Signup