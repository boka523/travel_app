import React from 'react'
import './LoginForm.css'
import black_email from '../../assets/black_email.png'
import white_email from '../../assets/white_email.png'
import black_password from '../../assets/black_password.png'
import white_password from '../../assets/white_password.png'


const LoginForm = ({darkMode, toggleMode}) => {
  return (
    <div className='login-form container'>
      <div className={`login-text ${darkMode ? "tint white-letters" : ""}`}>
        <h1>Welcome back!</h1>
      </div>
        <form className={`form ${darkMode ? "tint white-letters" : ""}`}> 
          <div className='inputs'>
            <div className='email-icon'>
              <img src={white_email} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
              <img src={black_email} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
            </div>
            <label htmlFor="email">Email</label>
            <input id='email' type="email" placeholder='Enter your email:' required/>
          </div>
          <div className='inputs'>
            <div className='email-icon'>
              <img src={white_password} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
              <img src={black_password} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
            </div>
            <label htmlFor="password">Password</label>
            <input id='password' type="password" placeholder='Enter your password:'/>
          </div>
          <button type='submit' className={`btn ${darkMode ? "" : "dark-btn"}`}>Login</button>
        </form>
    </div>
  )
}

export default LoginForm