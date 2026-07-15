import { useState, React } from 'react'
import './AddTripForm.css'
import dark_destination from '../../assets/dark_destination.png'
import white_destination from '../../assets/white_destination.png'
import dark_start_date from '../../assets/dark_start_date.png'
import white_start_date from '../../assets/white_start_date.png'
import dark_end_date from '../../assets/dark_end_date.png'
import white_end_date from '../../assets/white_end_date.png'
import dark_passengers from '../../assets/dark_passengers.png'
import white_passengers from '../../assets/white_passengers.png'
import dark_car from '../../assets/dark_car.png'
import white_car from '../../assets/white_car.png'
import dark_bus from '../../assets/dark_bus.png'
import white_bus from '../../assets/white_bus.png'
import dark_boat from '../../assets/dark_boat.png'
import white_boat from '../../assets/white_boat.png'
import dark_plane from '../../assets/dark_plane.png'
import white_plane from '../../assets/white_plane.png'
import dark_question from '../../assets/dark_question.png'
import white_question from '../../assets/white_question.png'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";

const AddTripForm = ({darkMode}) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
  return (
    <div className='add-trips-form container'>
        <div className='title'>
            <div className={`add-trips-text ${darkMode ? "tint white-letters" : ""}`}>
            <h1>Create trip</h1>
            </div>
        </div>
        <div className={`add-trips-card ${darkMode ? "tint white-letters" : ""}`}>
            <form className={`trip-form ${darkMode ? "white-letters" : ""}`}> 
                <div className='inputs'>
                    <div className='email-icon'>
                        <img src={white_destination} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_destination} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
                    </div>
                    <input id='destination' type="text" placeholder='Enter your destination:' required/>
                </div>
                <div className='inputs'>
                    <div className='email-icon'>
                        <img src={white_start_date} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_start_date} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
                    </div>
                    <DatePicker dateFormat="dd/MM/yyyy" className="date-input" placeholderText="Enter start date:" selected={endDate} onChange={(date) => setEndDate(date)}/>
                </div>
                <div className='inputs'>
                    <div className='email-icon'>
                        <img src={white_end_date} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_end_date} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
                    </div>
                    {/* <input id='end_date' type="date" placeholder='Enter end date:' required/> */}
                    <DatePicker dateFormat="dd/MM/yyyy" className="date-input" placeholderText="Enter end date:" selected={startDate} onChange={(date) => setStartDate(date)}/>
                </div>
                <div className='inputs'>
                    <div className='email-icon'>
                        <img src={white_passengers} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_passengers} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
                    </div>
                    <input id='passengers' type="number" min="1" placeholder='Enter the number of passengers:' required/>
                </div>
                <div className='inputs'>
                    <div className='email-icon'>
                        <img src={white_question} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_question} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
                    </div>
                    <input id='transport_type' type="text" placeholder='Enter transport type:' required/>
                </div>
                <button type='submit' className={`btn ${darkMode ? "" : "dark-btn"}`}>Show options</button>
            </form>
        </div>
    </div>
  )
}

export default AddTripForm