import { useEffect, useState, React }from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Select from "react-select" //koristin umisto <select> jer je puno manipulativniji
import './MyTripsForm.css'
import dark_plus_sign from '../../assets/dark_plus_sign.png'
import white_plus_sign from '../../assets/white_plus_sign.png'

const MyTripsForm = ({darkMode}) => {
  const navigate = useNavigate();
  
  const [sortOption, setSortOption] = useState(null);
  const [trips, setTrips] = useState([])
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [isDeletingTripId, setIsDeletingTripId] = useState(null);

  const sortOptions = [
  { value: "alphabetical", label: "Abecedno" },
  { value: "priceAsc", label: "Po cijeni - uzlazno" },
  { value: "priceDesc", label: "Po cijeni - silazno" },
  { value: "dateAsc", label: "Po datumu polaska - uzlazno" },
  { value: "dateDesc", label: "Po datumu polaska - silazno" },
  ];

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

  useEffect(() => { 
    setIsLoadingTrips(true);

    const fetchTrips = async () => { //ovo je slicna sema ko handleLogin, samo je pisemo unutar useEffect jer zelimo da se izvrsi odmah
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
            toast.error("Neautoriziran pristup! Odjava...")
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
    fetchTrips(); //zadali smo sta radi fetchTrips, al odma ga zelimo i odradit bez ikakvog klika botuna i slicno nego bas automatski
  }, [navigate]); //"ovaj useEffect ovisi o navigate; ako se on promijeni, ponovno pokreni useEffect"

  const handleDeleteTrip = async (tripId) => {
    const confirmed = window.confirm("Jeste li sigurni da želite izbrisati ovo putovanje?");

    if(!confirmed){
      return;
    }

    try{
      setIsDeletingTripId(tripId);

      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/trips/${tripId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if(!response.ok){
        toast.error(data.error || "Brisanje nije uspjelo.");
        return;
      }

      toast.success(data.message);
      setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
    } catch(error){
      toast.error(error.message);
    } finally{
      setIsDeletingTripId(null);
    }
  };

  const addNewTrip = () => {
    navigate("/addtrip");
  }

  const handleEditTrip = (tripId) => {
    navigate(`/edittrip/${tripId}`);
  }

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
          <button className={darkMode ? 'btn' : 'btn dark-btn'} onClick={addNewTrip}>
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
                <div key={trip.id} className={`trip ${darkMode ? "tint" : ""}`}>
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
                  <div className='card-buttons'>
                  <button className={darkMode ? 'btn' : 'btn dark-btn'} onClick={() => handleDeleteTrip(trip.id)} disabled={isDeletingTripId === trip.id}>
                    {isDeletingTripId === trip.id ? "Brisanje..." : "Izbriši"}
                  </button>
                  <button className={darkMode ? 'btn' : 'btn dark-btn'} onClick={() => handleEditTrip(trip.id)}>
                    Uredi
                  </button>
                  </div>
                </div>
              ))
            )}
      </div>
    </div>
  )
}

export default MyTripsForm