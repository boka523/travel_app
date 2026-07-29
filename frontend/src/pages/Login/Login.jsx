import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import LoginForm from '../../components/LoginForm/LoginForm'

const Login = ({darkMode, toggleMode}) => {
    return (
        <div>
            <Navbar darkMode={darkMode} toggleMode={toggleMode}/>
            <LoginForm darkMode={darkMode}/>
        </div>
    )
}

export default Login