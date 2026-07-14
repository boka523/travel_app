import { useEffect, useState, React }from 'react'
import toast from 'react-hot-toast'
import Select from "react-select"
import './MyTripsForm.css'
import dark_plus_sign from '../../assets/dark_plus_sign.png'
import white_plus_sign from '../../assets/white_plus_sign.png'
import { useNavigate } from 'react-router-dom'

const MyTripsForm = ({darkMode}) => {

  const sortOptions = [
  { value: "alphabetical", label: "Abecedno" },
  { value: "priceAsc", label: "Po cijeni - uzlazno" },
  { value: "priceDesc", label: "Po cijeni - silazno" },
  { value: "dateAsc", label: "Po datumu polaska - uzlazno" },
  { value: "dateDesc", label: "Po datumu polaska - silazno" },
  ];
  
  const [sortOption, setSortOption] = useState(null);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? "white" : "black",
      border: "none",
      borderRadius: "30px",
      height: "46px",
      width: "309px",
      boxShadow: "none",
      transition: "0.3s",
      cursor: "pointer"
    }),
    placeholder: (provided) => ({
      ...provided,
      color: darkMode ? "black" : "white",
      fontSize: "20px",
      transition: "0.3s",
      textAlign: "center"
    }),
    singleValue: (provided) => ({
      ...provided,
      color: darkMode ? "black" : "white",
      fontSize: "20px",
      transition: "0.3s",
      textAlign: "center"
    }),
    menu: (provided) => ({
      ...provided,
      marginTop: "10px",
      borderRadius: "30px",
      backgroundColor: darkMode ? "white" : "black",
      transition: "0.3s",
      overflow: "hidden",
    }),
    menuList: (provided) => ({
      ...provided,
      padding: 0,
      transition: "0.3s",
      backgroundColor: darkMode ? "white" : "black",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? darkMode
        ? "#362A19"
        : "#B6AA99"
        : darkMode
        ? "white"
        : "black",
      transition: "0.3s",
      color: state.isFocused
        ? darkMode
        ? "white"
        : "black"
        : darkMode
        ? "black"
        : "white",
      cursor: "pointer",
      fontSize: "18px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      transition: "0.3s",
      color: darkMode ? "white" : "black",
    }),
    indicatorSeparator: () => ({
      display: "none",
      transition: "0.3s",
    }),
  };

  const navigate = useNavigate();
  const [trips, setTrips] = useState([])
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const token = localStorage.getItem("token");
      if(!token){
        toast.error("Morate se prijaviti!");
        setTimeout(() => {
          navigate("/login");
        }, 1000)
        return;
      }
      try{
        const response = await fetch("http://localhost:5000/my_trips", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        if(!response.ok){
          toast.error(data.error || "Putovanja nisu učitana.");
          if(response.status === 401 || response.status === 403){
            localStorage.removeItem("token");
            setTimeout(() => {
              navigate("/login");
            }, 1000)
        return;
          }
          return;
        }
        setTrips(data);
      }
      catch(error){
        toast.error("Greška pri spajanju na server.");
      }
      finally{
        setIsLoadingTrips(false);
      }
    };
    fetchTrips();
  }, [navigate]);

  return (
    <div className='my-trips-form container'>
      <div className='title'>
        <div className='buttons'>
          <Select
            options={sortOptions}
            value={sortOption}
            className='sort-select'
            onChange={setSortOption}
            placeholder="Sortiraj putovanja"
            isSearchable={false}
            styles={customStyles}
          />
          <button className={darkMode ? 'btn' : 'btn dark-btn'}>
            <div className='email-icon'>
              <img src={dark_plus_sign} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
              <img src={white_plus_sign} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/>
            </div>
          </button>
        </div>
        <div className={`my-trips-text ${darkMode ? "tint white-letters" : ""}`}>
          <h1>My trips</h1>
        </div>
      </div>
      <div className={`all-trips ${darkMode ? "tint white-letters" : ""}`}>
        {isLoadingTrips 
          ? ( <div className='message'>Učitavanje putovanja...</div> )
          : trips.length === 0 
            ? ( <div className='message'>Nemate putovanja.</div>)
            : (
              trips.map((trip) => (
                <div className={`trip ${darkMode ? "tint" : ""}`}>
                  <h1>{trip.destination}</h1>
                  <h1>{trip.total_cost} €</h1>
                  <div className='trip-details'>
                    <h2>Polazak: {new Date(trip.start_date).toLocaleDateString("hr-HR")}</h2>
                    <h2>Povratak: {new Date(trip.end_date).toLocaleDateString("hr-HR")}</h2>
                    <div className='trip-subdetails'>
                      <h3>Broj putnika: {trip.passengers_num}</h3>
                      <h3>Transport: {trip.transport_type}</h3>
                    </div>
                  </div>
                  <button className={darkMode ? 'btn' : 'btn dark-btn'}>Uredi</button>
                </div>
              ))
            )}
      </div>
    </div>
  )
}

export default MyTripsForm