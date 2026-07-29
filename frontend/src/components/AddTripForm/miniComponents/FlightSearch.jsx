import { useState, React, useRef } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { formatDate } from "../utilities/DateUtilities";
import "./FlightSearch.css";

const FlightSearch = ({
  darkMode,
  departureAirports,
  arrivalAirports,
  startDate,
  endDate,
  passengersNum,
}) => {
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState("");
  const [selectedArrivalAirport, setSelectedArrivalAirport] = useState("");
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
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
  return (
    <div className={`transport-results ${darkMode ? "white-letters" : ""}`}>
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
                      {new Date(flight.outbound.arrivalTime).toLocaleDateString(
                        "hr-HR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>
                <div className="flight-date">
                  Outbound:{" "}
                  {new Date(flight.outbound.departureTime).toLocaleDateString(
                    "hr-HR",
                  )}
                </div>
                <div className="flight-divider"></div>
                <div className="flight-route">
                  <div className="flight-airport">
                    <strong>{flight.return.departureAirport}</strong>
                    <span>
                      {new Date(flight.return.departureTime).toLocaleDateString(
                        "hr-HR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flight-route-middle">
                    <span>{formatFlightDuration(flight.return.duration)}</span>
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
                      {new Date(flight.return.arrivalTime).toLocaleDateString(
                        "hr-HR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>
                <div className="flight-date">
                  Return:{" "}
                  {new Date(flight.return.departureTime).toLocaleDateString(
                    "hr-HR",
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    </div>
  );
};

export default FlightSearch;
