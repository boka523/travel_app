import { useState, React } from 'react'
import { useNavigate } from 'react-router-dom'
import './SignupForm.css'
import black_email from '../../assets/black_email.png'
import white_email from '../../assets/white_email.png'
import black_password from '../../assets/black_password.png'
import white_password from '../../assets/white_password.png'
import black_name from '../../assets/black_name.png'
import white_name from '../../assets/white_name.png'
import toast from 'react-hot-toast'

const SignupForm = ({darkMode}) => {
  const navigate = useNavigate("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) =>  {
    e.preventDefault();
    setIsLoading(true);
    try{
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        }),
      });

      const data = await response.json();
      if (!response.ok){
        toast.error(data.error || "Signup nije uspio.");
        return
      }

      localStorage.setItem("token", data.token);
      toast.success(data.message || "Uspješna prijava!")
      setTimeout(() => {
        navigate("/mytrips");
      }, 1000)
    }
    catch(error){
      console.error("Signup error", error);
      toast.error("Greška pri spajanju na server!");
    }
    finally{
      setIsLoading(false);
    }
  }; 

  return (
    <div className='signup-form container'>
      <div className={`signup-text ${darkMode ? "tint white-letters" : ""}`}>
        <h1>Welcome! Please fill in the signup form below:</h1>
      </div>
      <form onSubmit={handleSignup} className={`form ${darkMode ? "tint white-letters" : ""}`}>
        <div className='inputs'>
          <div className='email-icon'>
            <img src={white_name} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
            <img src={black_name} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
          </div>
          <label htmlFor="name">Name</label>
          <input id='name' placeholder='Enter your full name:' value={name} onChange={(e) => setName(e.target.value)} autoComplete='name' required/>
        </div> 
        <div className='inputs'>
          <div className='email-icon'>
            <img src={white_email} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
            <img src={black_email} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
          </div>
          <label htmlFor="email">Email</label>
          <input id='email' type="email" placeholder='Enter your email:' value={email} onChange={(e) => setEmail(e.target.value)} autoComplete='email' required/>
        </div>
        <div className='inputs'>
          <div className='email-icon'>
            <img src={white_password} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
            <img src={black_password} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
          </div>
          <label htmlFor="password">Password</label>
          <input id='password' type="password" placeholder='Enter your password:' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current_password' required/>
        </div>
        <button type='submit' className={`btn ${darkMode ? "" : "dark-btn"}`} disabled={isLoading}>{isLoading ? "Signing up..." : "Signup"}</button>
      </form>
    </div>
  )
}

export default SignupForm