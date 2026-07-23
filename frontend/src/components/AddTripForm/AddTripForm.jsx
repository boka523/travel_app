import { useState, React, useRef } from 'react'
import toast from 'react-hot-toast'
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
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [passengers_num, setPassengersNum] = useState(1);
    const [transport_type, setTransportType] = useState("");

    const [accommodations, setAcommodations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const resultsRef = useRef(null);

    const scrollToResults = () => {
        resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const formatDate = (date) => {
        if(!date){
            return "";
        }
        const year = date.getFullYear();
        const month = String(date.getMonth()+1).padStart(2, "0"); //getMonth vraca redni broj mjeseca pa je zato +1 iza; sve pretvaramo u string jer padStart radi samo na stringovima; padStart na svaki string manji od dva znaka dodaje nulu na pocetak
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAcommodations([]);
        if(!startDate || !endDate){
            toast.error("Odaberi datum dolaska i odlaska.");
            return;
        }
        if(endDate <= startDate){
            toast.error("Datum odlaska mora biti nakon datuma dolaska.");
            return;
        }
        try{
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/accommodations", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    destination,
                    checkin: formatDate(startDate),
                    checkout: formatDate(endDate),
                    adults: Number(passengers_num),
                }),
            });
            const data = await response.json();
            if(!response.ok){
                toast.error(data.message || "Dohvat smještaja nije uspio.")
                return;
            }
            setAcommodations(data.accommodations || []);
        }
        catch(error){
            toast.error(error.message);
        }
        finally{
            setLoading(false);
            setHasSearched(true);
        }
    };

  return (
    <div className='add-trips-form container'>
        <div className='title'>
            <div className={`add-trips-text ${darkMode ? "tint white-letters" : ""}`}>
            <h1>Create trip</h1>
            </div>
        </div>
        <div className={`add-trips-card ${darkMode ? "tint white-letters" : ""}`}>
            <form className={`trip-form ${darkMode ? "white-letters" : ""}`} onSubmit={handleSubmit}> 
                <div className='inputs'>
                    <div className='email-icon'>
                        <img src={white_destination} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_destination} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
                    </div>
                    <input id='destination' type="text" placeholder='Enter your destination:' value={destination} onChange={(e) => setDestination(e.target.value)} required/>
                </div>
                <div className='inputs'>
                    <div className='email-icon'>
                        <img src={white_start_date} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_start_date} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
                    </div>
                    <DatePicker dateFormat="dd/MM/yyyy" className="date-input" placeholderText="Enter start date:" selected={startDate} onChange={setStartDate} minDate={new Date()} required/>
                </div>
                <div className='inputs'>
                    <div className='email-icon'>
                        <img src={white_end_date} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_end_date} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
                    </div>
                    <DatePicker dateFormat="dd/MM/yyyy" className="date-input" placeholderText="Enter end date:" selected={endDate} onChange={setEndDate} minDate={startDate || new Date()} disabled={!startDate} required/>
                </div>
                <div className='inputs'>
                    <div className='email-icon'>
                        <img src={white_passengers} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_passengers} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
                    </div>
                    <input id='passengers' type="number" min="1" placeholder='Enter the number of passengers:' value={passengers_num} onChange={(e) => setPassengersNum(e.target.value)} required/>
                </div>
                <div className='inputs'>
                    <div className='email-icon'>
                        <img src={white_question} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_question} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
                    </div>
                    <input id='transport_type' type="text" placeholder='Enter transport type:' value={transport_type} onChange={(e) => setTransportType(e.target.value)} required/>
                </div>
                <button type='submit' className={`btn ${darkMode ? "" : "dark-btn"}`} disabled={loading}>{loading ? "Loading..." : "Show options"}</button>
                {hasSearched && !loading && (
                    <button type="button" className={`btn ${darkMode ? "" : "dark-btn"}`} onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start"})}>
                        See options below ↓
                    </button>
)}
            </form>
        </div>
        <div className={`accommodation-results ${darkMode ? "white-letters" : ""}`}>
            {!loading && accommodations.length > 0 && ( //ako se vec loadalo i ako postoji bar jedan smjestaj, prikazi sljedece
                <>
                    <h2>Accommodation options</h2>
                    <div className='accommodation-grid' ref={resultsRef} >
                        {accommodations.map((accommodation) => (
                            <article className={`accommodation-card ${darkMode ? "tint" : ""}`} key={accommodation.id}>
                                {accommodation.photo && (
                                    <img src={accommodation.photo} alt={accommodation.name} className='accommodation-image'/>
                                )}
                                <div className='accommodation-info'>
                                    <h3>{accommodation.name}</h3>
                                    {accommodation.address && (
                                        <p>{accommodation.address}</p>
                                    )}
                                    {accommodation.reviewScore && (
                                        <p>
                                            Rating: {accommodation.reviewScore}
                                            {accommodation.reviewCount
                                                ? `(${accommodation.reviewCount} reviews)`
                                                : ""}
                                        </p>
                                    )}
                                    <p className='accommodation-boardName'>
                                        {accommodation.boardName
                                            ? `BoardNames: ${accommodation.boardName}`
                                            : "BoardName unavaliable"}
                                    </p>
                                    <p className='accommodation-price'>
                                        {accommodation.price
                                            ? `${accommodation.price} ${accommodation.currency}`
                                            : "Price unavaliable"}
                                    </p>
                                    {accommodation.url && (
                                        <a href={accommodation.url} target='_blank' rel='noopener noreferrer' className={`btn ${darkMode ? "" : "dark-btn"}`}>
                                            View accommodation
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            )}
            {!loading && accommodations.length === 0 && (
                <p className='accommodation-message'>Unesi podatke putovanja za prikaz smještaja.</p>
            )}
        </div>
    </div>
  )
}

export default AddTripForm