import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import SignupForm from '../../components/SignupForm/SignupForm'

const Signup = ({darkMode, toggleMode}) => {
    return (
        <div>
            <Navbar darkMode={darkMode} toggleMode={toggleMode}/>
            <SignupForm darkMode={darkMode}/>
        </div>
    )
}

export default Signup