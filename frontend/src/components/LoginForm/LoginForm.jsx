import React from 'react'
import './LoginForm.css'
import black_email from '../../assets/black_email.png'
import white_email from '../../assets/white_email.png'
import black_password from '../../assets/black_password.png'
import white_password from '../../assets/white_password.png'


const LoginForm = () => {
  return (
    <div className='login-form container'>
      <div className='login-text'>
        <h1>Welcome back!</h1>
      </div>
        <form className='form'> 
          <div className='inputs'>
            <img src={black_email} alt="" className='icon'/>
            <label htmlFor="email">Email</label>
            <input id='email' type="email" placeholder='Enter your email:' required/>
          </div>
          <div className='inputs'>
            <img src={black_password} alt="" className='icon'/>
            <label htmlFor="password">Password</label>
            <input id='password' type="password" placeholder='Enter your password:'/>
          </div>
          <button className='btn dark-btn' type='submit'>Login</button>
        </form>
    </div>
  )
}

export default LoginForm