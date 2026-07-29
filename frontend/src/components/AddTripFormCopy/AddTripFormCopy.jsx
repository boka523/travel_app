import { useState, React, useRef } from "react";
import toast from "react-hot-toast";
import "./AddTripForm.css";
import dark_location from "../../assets/dark_location.png";
import white_location from "../../assets/white_location.png";
import dark_destination from "../../assets/dark_destination.png";
import white_destination from "../../assets/white_destination.png";
import dark_start_date from "../../assets/dark_start_date.png";
import white_start_date from "../../assets/white_start_date.png";
import dark_end_date from "../../assets/dark_end_date.png";
import white_end_date from "../../assets/white_end_date.png";
import dark_passengers from "../../assets/dark_passengers.png";
import white_passengers from "../../assets/white_passengers.png";
import dark_car from "../../assets/dark_car.png";
import white_car from "../../assets/white_car.png";
import dark_bus from "../../assets/dark_bus.png";
import white_bus from "../../assets/white_bus.png";
import dark_boat from "../../assets/dark_boat.png";
import white_boat from "../../assets/white_boat.png";
import dark_plane from "../../assets/dark_plane.png";
import white_plane from "../../assets/white_plane.png";
import dark_train from "../../assets/dark_train.png";
import white_train from "../../assets/white_train.png";
import dark_question from "../../assets/dark_question.png";
import white_question from "../../assets/white_question.png";
import dark_left_arrow from "../../assets/dark_left_arrow.png";
import white_left_arrow from "../../assets/white_left_arrow.png";
import dark_right_arrow from "../../assets/dark_right_arrow.png";
import white_right_arrow from "../../assets/white_right_arrow.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { fromUnixTime } from "date-fns";

const AddTripForm = ({ darkMode }) => {
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [passengers_num, setPassengersNum] = useState(1);
  const [transport_type, setTransportType] = useState("");

  const [departureAirports, setDepartureAirports] = useState([]);
  const [arrivalAirports, setArrivalAirports] = useState([]);
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState("");
  const [selectedArrivalAirport, setSelectedArrivalAirport] = useState("");

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
    if (!date) {
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); //getMonth vraca redni broj mjeseca pa je zato +1 iza; sve pretvaramo u string jer padStart radi samo na stringovima; padStart na svaki string manji od dva znaka dodaje nulu na pocetak
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAcommodations([]);
    setCurrentAccommodationSlide(0);
    setDepartureAirports([]);
    setArrivalAirports([]);
    if (!startDate || !endDate) {
      toast.error("Odaberi datum dolaska i odlaska.");
      return;
    }
    if (endDate <= startDate) {
      toast.error("Datum odlaska mora biti nakon datuma dolaska.");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/accommodations", {
        method: "POST",
        headers: {
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
      if (!response.ok) {
        toast.error(data.message || "Dohvat smještaja nije uspio.");
        return;
      }
      setAcommodations(data.accommodations || []);
      if (transport_type === "plane" || transport_type === "aeroplane") {
        const [departureResponse, arrivalResponse] = await Promise.all([
          fetch(
            `http://localhost:5000/airports?city=${encodeURIComponent(departure)}`,
          ),
          fetch(
            `http://localhost:5000/airports?city=${encodeURIComponent(destination)}`,
          ),
        ]);
        const departureData = await departureResponse.json();
        const arrivalData = await arrivalResponse.json();
        if (!departureResponse.ok || !arrivalResponse.ok) {
          toast.error("Dohvat aerodroma nije uspio.");
          return;
        }
        setDepartureAirports(departureData);
        setArrivalAirports(arrivalData);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const getTransportIcon = () => {
    const transport = transport_type.trim().toLowerCase();
    const transportIcons = {
      car: {
        white: dark_car,
        dark: white_car,
      },
      auto: {
        white: dark_car,
        dark: white_car,
      },
      plane: {
        white: dark_plane,
        dark: white_plane,
      },
      aeroplane: {
        white: dark_plane,
        dark: white_plane,
      },
      bus: {
        white: dark_bus,
        dark: white_bus,
      },
      train: {
        white: dark_train,
        dark: white_train,
      },
      boat: {
        white: dark_boat,
        dark: white_boat,
      },
      ship: {
        white: dark_boat,
        dark: white_boat,
      },
    };
    const selectedIcons = transportIcons[transport];
    if (!selectedIcons) {
      return darkMode ? white_question : dark_question;
    }
    return darkMode ? selectedIcons.dark : selectedIcons.white;
  };

  const [selectedAccommodation, setSelectedAccommodation] = useState(null);

  const [currentAccommodationSlide, setCurrentAccommodationSlide] = useState(0);
  const hotelsPerSlide = 4;

  const accommodationSlides = Array.from(
    {
      length: Math.ceil(accommodations.length / hotelsPerSlide),
    },
    (_, index) =>
      accommodations.slice(
        index * hotelsPerSlide,
        index * hotelsPerSlide + hotelsPerSlide,
      ),
  );

  const totalAccommodationSlides = accommodations.length;

  const handlePreviousSlide = () => {
    setCurrentAccommodationSlide((previousSlide) =>
      Math.max(previousSlide - 1, 0),
    );
  };
  const handleNextSlide = () => {
    setCurrentAccommodationSlide((previousSlide) =>
      Math.min(previousSlide + 1, totalAccommodationSlides - 1),
    );
  };

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
      cursor: "pointer",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: darkMode ? "black" : "white",
      fontSize: "20px",
      transition: "0.3s",
      textAlign: "center",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: darkMode ? "black" : "white",
      fontSize: "20px",
      transition: "0.3s",
      textAlign: "center",
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

  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);

  const handleShowFlights = async () => {
    if (!selectedDepartureAirport || !selectedArrivalAirport) {
      toast.error("Odaberi oba aerodroma.");
      return;
    }
    try {
      setFlightsLoading(true);
      setFlights([]);
      const response = await fetch("http://localhost:5000/search-flights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departureAirport: selectedDepartureAirport,
          arrivalAirport: selectedArrivalAirport,
          departureDate: formatDate(startDate),
          returnDate: formatDate(endDate),
          passengers: Number(passengers_num),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Dohvat letova nije moguć.");
        return;
      }
      setFlights(data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFlightsLoading(false);
    }
  };

  const formatFlightDuration = (duration) => {
    if (!duration) {
      return "";
    }
    const hours = duration.match(/(\d+)H/);
    const minutes = duration.match(/(\d+)M/);
    const formattedHours = hours ? `${hours[1]} h` : "";
    const formattedMinutes = minutes ? `${minutes[1]} min` : "";
    return `${formattedHours} ${formattedMinutes}`.trim();
  };

  return (
    <div className="add-trips-form container">
      <div className="title">
        <div
          className={`add-trips-text ${darkMode ? "tint white-letters" : ""}`}
        >
          <h1>Create trip</h1>
        </div>
      </div>
      <div className={`add-trips-card ${darkMode ? "tint white-letters" : ""}`}>
        <form
          className={`trip-form ${darkMode ? "white-letters" : ""}`}
          onSubmit={handleSubmit}
        >
          <div className="inputs">
            <div className="email-icon">
              <img
                src={white_location}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={dark_location}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
            <input
              id="departure"
              type="text"
              placeholder="Enter your departure:"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              required
            />
          </div>
          <div className="inputs">
            <div className="email-icon">
              <img
                src={white_destination}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={dark_destination}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
            <input
              id="destination"
              type="text"
              placeholder="Enter your destination:"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>
          <div className="inputs">
            <div className="email-icon">
              <img
                src={white_start_date}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={dark_start_date}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
            <DatePicker
              dateFormat="dd/MM/yyyy"
              className="date-input"
              placeholderText="Enter start date:"
              selected={startDate}
              onChange={setStartDate}
              minDate={new Date()}
              required
            />
          </div>
          <div className="inputs">
            <div className="email-icon">
              <img
                src={white_end_date}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={dark_end_date}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
            <DatePicker
              dateFormat="dd/MM/yyyy"
              className="date-input"
              placeholderText="Enter end date:"
              selected={endDate}
              onChange={setEndDate}
              minDate={startDate || new Date()}
              disabled={!startDate}
              required
            />
          </div>
          <div className="inputs">
            <div className="email-icon">
              <img
                src={white_passengers}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={dark_passengers}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
            <input
              id="passengers"
              type="number"
              min="1"
              placeholder="Enter the number of passengers:"
              value={passengers_num}
              onChange={(e) => setPassengersNum(e.target.value)}
              required
            />
          </div>
          <div className="inputs">
            <div className="email-icon">
              {/* <img src={white_question} alt="" className={`icon ${darkMode ? "show" : "hide"}`}/>
                        <img src={dark_question} alt="" className={`icon ${darkMode ? "hide" : "show"}`}/> */}
              <img src={getTransportIcon()} alt="" className="icon show" />
            </div>
            <input
              id="transport_type"
              type="text"
              placeholder="Enter transport type:"
              value={transport_type}
              onChange={(e) => setTransportType(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`btn ${darkMode ? "" : "dark-btn"}`}
            disabled={loading}
          >
            {loading ? "Loading..." : "Show options"}
          </button>
          {hasSearched && !loading && (
            <button
              type="button"
              className={`btn ${darkMode ? "" : "dark-btn"}`}
              onClick={() =>
                resultsRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              See options below ↓
            </button>
          )}
        </form>
      </div>
      <div
        className={`accommodation-results ${darkMode ? "white-letters" : ""}`}
      >
        {!loading &&
          accommodations.length > 0 && ( //ako se vec loadalo i ako postoji bar jedan smjestaj, prikazi sljedece
            <>
              <h2>Accommodation options:</h2>
              <div className="accommodation-slider">
                <button
                  type="button"
                  className={`btn ${darkMode ? "" : "dark-btn"}`}
                  onClick={handlePreviousSlide}
                  disabled={currentAccommodationSlide === 0}
                  aria-label="Previous accommodations"
                >
                  <div className="email-icon">
                    <img
                      src={white_left_arrow}
                      alt=""
                      className={`icon ${darkMode ? "hide" : "show"}`}
                    />
                    <img
                      src={dark_left_arrow}
                      alt=""
                      className={`icon ${darkMode ? "show" : "hide"}`}
                    />
                  </div>
                </button>
                <div className="slider-viewport" ref={resultsRef}>
                  <div
                    className="slider-track"
                    style={{
                      transform: `translateX(-${currentAccommodationSlide * 100}%)`,
                    }}
                  >
                    {accommodationSlides.map((slide, slideIndex) => (
                      <div className="accommodation-slide" key={slideIndex}>
                        {slide.map((accommodation) => (
                          <article
                            className={`accommodation-card ${darkMode ? "tint" : ""} ${selectedAccommodation === accommodation.id ? "selected" : ""}`}
                            key={accommodation.id}
                            onClick={() => {
                              console.log(accommodation);
                              setSelectedAccommodation(accommodation.id);
                            }}
                          >
                            {accommodation.photo && (
                              <img
                                src={accommodation.photo}
                                alt={accommodation.name}
                                className="accommodation-image"
                              />
                            )}
                            <div className="accommodation-info">
                              <h3>{accommodation.name}</h3>
                              {accommodation.stars && (
                                <p className="accommodation-stars">
                                  {"Category:" +
                                    "⭐".repeat(accommodation.stars)}
                                </p>
                              )}
                              {accommodation.address && (
                                <p>Address: {accommodation.address}</p>
                              )}
                              {accommodation.reviewScore && (
                                <p>
                                  Rating: {accommodation.reviewScore}
                                  {accommodation.reviewCount
                                    ? `(${accommodation.reviewCount} reviews)`
                                    : ""}
                                </p>
                              )}
                              <p className="accommodation-boardName">
                                {accommodation.boardName
                                  ? `Type: ${accommodation.boardName}`
                                  : "BoardName unavaliable"}
                              </p>
                              <p className="accommodation-price">
                                {accommodation.price
                                  ? `${accommodation.price} ${accommodation.currency}`
                                  : "Price unavaliable"}
                              </p>
                              {accommodation.url && (
                                <a
                                  href={accommodation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`btn ${darkMode ? "" : "dark-btn"}`}
                                >
                                  View accommodation
                                </a>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className={`slider-arrow btn ${darkMode ? "" : "dark-btn"}`}
                  onClick={handleNextSlide}
                  disabled={
                    currentAccommodationSlide ===
                      totalAccommodationSlides - 1 ||
                    totalAccommodationSlides === 0
                  }
                  aria-label="Next accommodations"
                >
                  <div className="email-icon">
                    <img
                      src={white_right_arrow}
                      alt=""
                      className={`icon ${darkMode ? "hide" : "show"}`}
                    />
                    <img
                      src={dark_right_arrow}
                      alt=""
                      className={`icon ${darkMode ? "show" : "hide"}`}
                    />
                  </div>
                </button>
              </div>
            </>
          )}
        {!loading && accommodations.length === 0 && (
          <p className="accommodation-message">Unesi podatke putovanja.</p>
        )}
      </div>
      {(transport_type === "plane" || transport_type === "aeroplane") &&
        departureAirports.length > 0 &&
        arrivalAirports.length > 0 && (
          <div
            className={`transport-results ${darkMode ? "white-letters" : ""}`}
          >
            <>
              <h2>Transport options:</h2>
              <div className="airport-buttons">
                <div className="airport-selection">
                  <Select
                    styles={customStyles}
                    placeholder="Choose departure airport"
                    className="airport-select"
                    options={departureAirports.map((airport) => ({
                      value: airport.code,
                      label: `${airport.name} (${airport.code})`,
                    }))}
                    value={
                      departureAirports
                        .map((airport) => ({
                          value: airport.code,
                          label: `${airport.name} (${airport.code})`,
                        }))
                        .find(
                          (option) => option.value === selectedDepartureAirport,
                        ) || null
                    }
                    onChange={(option) =>
                      setSelectedDepartureAirport(option?.value || "")
                    }
                  />
                  <Select
                    styles={customStyles}
                    placeholder="Choose arrival airport"
                    className="airport-select"
                    options={arrivalAirports.map((airport) => ({
                      value: airport.code,
                      label: `${airport.name} (${airport.code})`,
                    }))}
                    value={
                      arrivalAirports
                        .map((airport) => ({
                          value: airport.code,
                          label: `${airport.name} (${airport.code})`,
                        }))
                        .find(
                          (option) => option.value === selectedArrivalAirport,
                        ) || null
                    }
                    onChange={(option) =>
                      setSelectedArrivalAirport(option?.value || "")
                    }
                  />
                </div>
                {selectedDepartureAirport && selectedArrivalAirport && (
                  <button
                    type="button"
                    className={`show-flights ${darkMode ? "btn" : "btn dark-btn"}`}
                    onClick={handleShowFlights}
                    disabled={flightsLoading}
                  >
                    {flightsLoading ? "Loading..." : "Show flights"}
                  </button>
                )}
              </div>
              {flights.length > 0 && (
                <div className="flight-results">
                  {flights.map((flight) => (
                    <div className="flight-card" key={flight.offerId}>
                      <div className="flight-card-header">
                        <h3>{flight.airlineName}</h3>
                        <p className="flight-price">
                          {new Intl.NumberFormat("hr-HR", {
                            style: "currency",
                            currency: flight.currency,
                          }).format(Number(flight.price))}
                        </p>
                      </div>
                      <div className="flight-route">
                        <div className="flight-airport">
                          <strong>{flight.outbound.departureAirport}</strong>
                          <span>
                            {new Date(
                              flight.outbound.departureTime,
                            ).toLocaleDateString("hr-HR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flight-route-middle">
                          <span>
                            {formatFlightDuration(flight.outbound.duration)}
                          </span>
                          <div className="flight-line">
                            <span>✈</span>
                          </div>
                          <span>
                            {flight.outbound.stops === 0
                              ? "Direct flight"
                              : `${flight.outbound.stops} ${
                                  flight.outbound.stops === 1 ? "stop" : "stops"
                                }`}
                          </span>
                        </div>
                        <div className="flight-airport">
                          <strong>{flight.outbound.arrivalAirport}</strong>
                          <span>
                            {new Date(
                              flight.outbound.arrivalTime,
                            ).toLocaleDateString("hr-HR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flight-date">
                        Outbound:{" "}
                        {new Date(
                          flight.outbound.departureTime,
                        ).toLocaleDateString("hr-HR")}
                      </div>
                      <div className="flight-divider"></div>
                      <div className="flight-route">
                        <div className="flight-airport">
                          <strong>{flight.return.departureAirport}</strong>
                          <span>
                            {new Date(
                              flight.return.departureTime,
                            ).toLocaleDateString("hr-HR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flight-route-middle">
                          <span>
                            {formatFlightDuration(flight.return.duration)}
                          </span>
                          <div className="flight-line">
                            <span>✈</span>
                          </div>
                          <span>
                            {flight.return.stops === 0
                              ? "Direct flight"
                              : `${flight.return.stops} ${
                                  flight.return.stops === 1 ? "stop" : "stops"
                                }`}
                          </span>
                        </div>
                        <div className="flight-airport">
                          <strong>{flight.return.arrivalAirport}</strong>
                          <span>
                            {new Date(
                              flight.return.arrivalTime,
                            ).toLocaleDateString("hr-HR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flight-date">
                        Return:{" "}
                        {new Date(
                          flight.return.departureTime,
                        ).toLocaleDateString("hr-HR")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          </div>
        )}
    </div>
  );
};

export default AddTripForm;
