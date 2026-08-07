import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./TripDetails.css";
import dark_location from "../../../../assets/dark_location.png";
import white_location from "../../../../assets/white_location.png";
import dark_destination from "../../../../assets/dark_destination.png";
import white_destination from "../../../../assets/white_destination.png";
import dark_start_date from "../../../../assets/dark_start_date.png";
import white_start_date from "../../../../assets/white_start_date.png";
import dark_end_date from "../../../../assets/dark_end_date.png";
import white_end_date from "../../../../assets/white_end_date.png";
import dark_passengers from "../../../../assets/dark_passengers.png";
import white_passengers from "../../../../assets/white_passengers.png";
import dark_car from "../../../../assets/dark_car.png";
import white_car from "../../../../assets/white_car.png";
import dark_plane from "../../../../assets/dark_plane.png";
import white_plane from "../../../../assets/white_plane.png";
import dark_question from "../../../../assets/dark_question.png";
import white_question from "../../../../assets/white_question.png";
import toast from "react-hot-toast";
import { API_URL } from "../../../../config";

const TripDetails = ({
  darkMode,
  departure,
  setDeparture,
  destination,
  setDestination,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  passengersNum,
  setPassengersNum,
  transportType,
  setTransportType,
  loading,
  hasSearched,
  handleSubmit,
  resultsRef,
}) => {
  const getTransportIcon = () => {
    const transport = transportType.trim().toLowerCase();

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
    };

    return (
      transportIcons[transport] || {
        white: dark_question,
        dark: white_question,
      }
    );
  };

  const selectedTransportIcons = getTransportIcon();

  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const formatDestinationName = (name) => {
    return name
      .split("-")[0]
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const handleDepartureChange = async (e) => {
    const value = e.target.value;

    setDeparture(value);
    setSelectedDeparture(null);

    if (value.trim().length < 2) {
      setDepartureSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/destinations/autocomplete?text=${encodeURIComponent(value)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Autocomplete request failed.");
        return;
      }

      setDepartureSuggestions(data);
    } catch (error) {
      console.error("Failed to load departure suggestions:", error);
      setDepartureSuggestions([]);
    }
  };

  const handleDestinationChange = async (e) => {
    const value = e.target.value;

    setDestination(value);
    setSelectedDestination(null);

    if (value.trim().length < 2) {
      setDestinationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/destinations/autocomplete?text=${encodeURIComponent(value)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Autocomplete request failed.");
        return;
      }

      setDestinationSuggestions(data);
    } catch (error) {
      console.error("Failed to load destination suggestions:", error);
      setDestinationSuggestions([]);
    }
  };

  return (
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
          <div className="input-wrapper">
            <input
              id="departure"
              type="text"
              placeholder="Enter your departure:"
              value={departure}
              onChange={handleDepartureChange}
              required
            />

            {departureSuggestions.length > 0 && (
              <div className="address-suggestions">
                {departureSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="address-suggestion"
                    onClick={() => {
                      setDeparture(formatDestinationName(suggestion.name));
                      setSelectedDeparture(suggestion);
                      setDepartureSuggestions([]);
                    }}
                  >
                    {formatDestinationName(suggestion.name)}{" "}
                    {`(${suggestion.countryCode})`}
                  </button>
                ))}
              </div>
            )}
          </div>
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
          <div className="input-wrapper">
            <input
              id="destination"
              type="text"
              placeholder="Enter your destination:"
              value={destination}
              onChange={handleDestinationChange}
              required
            />
            {destinationSuggestions.length > 0 && (
              <div className="address-suggestions">
                {destinationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="address-suggestion"
                    onClick={() => {
                      setDestination(formatDestinationName(suggestion.name));
                      setSelectedDestination(suggestion);
                      setDestinationSuggestions([]);
                    }}
                  >
                    {formatDestinationName(suggestion.name)}{" "}
                    {`(${suggestion.countryCode})`}
                  </button>
                ))}
              </div>
            )}
          </div>
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
            value={passengersNum}
            onChange={(e) => setPassengersNum(e.target.value)}
            required
          />
        </div>
        <div className="inputs">
          {/* <div className="email-icon">
            <img src={getTransportIcon()} alt="" className="icon show" />
          </div> */}
          <div className="email-icon">
            <img
              src={selectedTransportIcons.white}
              alt=""
              className={`icon ${darkMode ? "hide" : "show"}`}
            />
            <img
              src={selectedTransportIcons.dark}
              alt=""
              className={`icon ${darkMode ? "show" : "hide"}`}
            />
          </div>
          <input
            id="transport_type"
            type="text"
            placeholder="Enter transport type (car or plane):"
            value={transportType}
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
  );
};

export default TripDetails;
