import { useState, React } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './LoginForm.css'
import black_email from '../../assets/black_email.png'
import white_email from '../../assets/white_email.png'
import black_password from '../../assets/black_password.png'
import white_password from '../../assets/white_password.png'


const LoginForm = ({darkMode}) => {
  const navigate = useNavigate(); //sluzi za programsku navigaciju izmedu ruta iz JS koda, a ne klikom na <Link>

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); //sprijeci browser da izvrsi svoju uobicajenu akciju, tj. refresh, jer nam je cilj da se ona ne refresha, nego da React obradi podatke
    setIsLoading(true);
    try{
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json" //podaci koje ti saljen su u JSON formatu
        },
        body: JSON.stringify({ //.stringify pretvara JS objekt u JSON tekst
          email,
          password
        }),
      });

      const data = await response.json(); //.json pretvara odgovor servera iz JSON formata u JS objekt
      if (!response.ok){
        toast.error(data.error || "Prijava nije uspjela.");
        return;
      }

      localStorage.setItem("token", data.token);
      toast.success(data.message || "Uspješna prijava!");
      setTimeout(() => {
        navigate("/mytrips");
      }, 1000)
    }
    catch(error){
      console.error("Login error", error);
      toast.error("Greška pri spajanju na server!");
    }
    finally{
      setIsLoading(false);
    }
  };

  return (
    <div className='login-form container'>
      <div className={`login-text ${darkMode ? "tint white-letters" : ""}`}>
        <h1>Welcome back!</h1>
      </div>
        <form onSubmit={handleLogin} className={`form ${darkMode ? "tint white-letters" : ""}`}> 
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
          <button type='submit' className={`btn ${darkMode ? "" : "dark-btn"}`} disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</button>
        </form>
    </div>
  )
}

export default LoginForm