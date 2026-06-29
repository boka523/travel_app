import React from 'react'
import './SignupForm.css'
import black_email from '../../assets/black_email.png'
import white_email from '../../assets/white_email.png'
import black_password from '../../assets/black_password.png'
import white_password from '../../assets/white_password.png'
import black_name from '../../assets/black_name.png'
import white_name from '../../assets/white_name.png'

const SignupForm = ({darkMode, toggleMode}) => {
  return (
    <div className='signup-form container'>
      <div className={`signup-text ${darkMode ? "tint white-letters" : ""}`}>
        <h1>Welcome! Please fill in the signup form below:</h1>
      </div>
      <form className={`form ${darkMode ? "tint white-letters" : ""}`}>
        <div className='inputs'>
          <div className='email-icon'>
            <img src={white_name} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
            <img src={black_name} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
          </div>
          <label htmlFor="email">Name</label>
          <input id='email' type="email" placeholder='Enter your full name:' required/>
        </div> 
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
        <button type='submit' className={`btn ${darkMode ? "" : "dark-btn"}`}>Signup</button>
      </form>
    </div>
  )
}

export default SignupForm