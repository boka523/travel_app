import { useState, React, useRef } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { formatDate } from "../../utilities/DateUtilities";
import "./FlightSearch.css";
import dark_left_arrow from "../../../../assets/dark_left_arrow.png";
import white_left_arrow from "../../../../assets/white_left_arrow.png";
import dark_right_arrow from "../../../../assets/dark_right_arrow.png";
import white_right_arrow from "../../../../assets/white_right_arrow.png";
import { API_URL } from "../../../../config";

const FlightSearch = ({
  darkMode,
  departureAirports,
  arrivalAirports,
  startDate,
  endDate,
  passengersNum,
  selectedFlight,
  setSelectedFlight,
  screenWidth,
}) => {
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState("");
  const [selectedArrivalAirport, setSelectedArrivalAirport] = useState("");
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);

  const flightsRef = useRef(null);

  const [currentFlightSlide, setCurrentFlightSlide] = useState(0);
  const flightsPerSlide = screenWidth < 1000 ? 1 : 2;
  const flightSlides = Array.from(
    {
      length: Math.ceil(flights.length / flightsPerSlide),
    },
    (_, index) =>
      flights.slice(
        index * flightsPerSlide,
        index * flightsPerSlide + flightsPerSlide,
      ),
  );

  const totalFlightSlides = flightSlides.length;

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? "white" : "black",
      border: "none",
      borderRadius: "30px",
      height: screenWidth < 1000 ? "38px" : "46px",
      width:
        screenWidth < 1000 ? (screenWidth < 400 ? "240px" : "280px") : "309px",
      boxShadow: "none",
      transition: "0.3s",
      cursor: "pointer",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: darkMode ? "black" : "white",
      fontSize:
        screenWidth < 1000 ? (screenWidth < 400 ? "16px" : "18px") : "20px",
      transition: "0.3s",
      textAlign: "center",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: darkMode ? "black" : "white",
      fontSize:
        screenWidth < 1000 ? (screenWidth < 400 ? "16px" : "18px") : "20px",
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
      width:
        screenWidth < 1000 ? (screenWidth < 400 ? "240px" : "280px") : "309px",
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
      fontSize:
        screenWidth < 1000 ? (screenWidth < 400 ? "14px" : "16px") : "18px",
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
  const handleShowFlights = async () => {
    if (!selectedDepartureAirport || !selectedArrivalAirport) {
      toast.error("Odaberi oba aerodroma.");
      return;
    }
    try {
      setFlightsLoading(true);
      setFlights([]);
      const response = await fetch(`${API_URL}/search-flights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          departureAirport: selectedDepartureAirport,
          arrivalAirport: selectedArrivalAirport,
          departureDate: formatDate(startDate),
          returnDate: formatDate(endDate),
          passengers: Number(passengersNum),
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

  const handlePreviousFlightSlide = () => {
    setCurrentFlightSlide((previousSlide) => Math.max(previousSlide - 1, 0));
  };

  const handleNextFlightSlide = () => {
    setCurrentFlightSlide((previousSlide) =>
      Math.min(previousSlide + 1, totalFlightSlides - 1),
    );
  };

  return (
    <div className={`transport-results ${darkMode ? "white-letters" : ""}`}>
      <>
        <h2>Airplane tickets:</h2>
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
                  .find((option) => option.value === selectedArrivalAirport) ||
                null
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
          <div className="flight-slider">
            <button
              type="button"
              className={`btn ${darkMode ? "" : "dark-btn"}`}
              onClick={handlePreviousFlightSlide}
              disabled={currentFlightSlide === 0}
              aria-label="Previous flights"
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
            <div className="flight-slider-viewport" ref={flightsRef}>
              <div
                className="flight-slider-track"
                style={{
                  transform: `translateX(-${currentFlightSlide * 100}%)`,
                }}
              >
                {flightSlides.map((slide, slideIndex) => (
                  <div className="flight-slide" key={slideIndex}>
                    {slide.map((flight) => (
                      <div
                        className={`flight-card ${darkMode ? "tint" : ""} ${selectedFlight?.offerId === flight.offerId ? "selected" : ""}`}
                        key={flight.offerId}
                        onClick={() => {
                          console.log(flight);
                          setSelectedFlight(flight);
                        }}
                      >
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
                                    flight.outbound.stops === 1
                                      ? "stop"
                                      : "stops"
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
                ))}
              </div>
            </div>
            <button
              type="button"
              className={`slider-arrow btn ${darkMode ? "" : "dark-btn"}`}
              onClick={handleNextFlightSlide}
              disabled={
                currentFlightSlide === totalFlightSlides - 1 ||
                totalFlightSlides === 0
              }
              aria-label="Next flights"
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
        )}
      </>
    </div>
  );
};

export default FlightSearch;
