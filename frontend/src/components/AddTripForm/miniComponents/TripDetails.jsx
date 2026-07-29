import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./TripDetails.css";
import dark_location from "../../../assets/dark_location.png";
import white_location from "../../../assets/white_location.png";
import dark_destination from "../../../assets/dark_destination.png";
import white_destination from "../../../assets/white_destination.png";
import dark_start_date from "../../../assets/dark_start_date.png";
import white_start_date from "../../../assets/white_start_date.png";
import dark_end_date from "../../../assets/dark_end_date.png";
import white_end_date from "../../../assets/white_end_date.png";
import dark_passengers from "../../../assets/dark_passengers.png";
import white_passengers from "../../../assets/white_passengers.png";
import dark_car from "../../../assets/dark_car.png";
import white_car from "../../../assets/white_car.png";
import dark_bus from "../../../assets/dark_bus.png";
import white_bus from "../../../assets/white_bus.png";
import dark_boat from "../../../assets/dark_boat.png";
import white_boat from "../../../assets/white_boat.png";
import dark_plane from "../../../assets/dark_plane.png";
import white_plane from "../../../assets/white_plane.png";
import dark_train from "../../../assets/dark_train.png";
import white_train from "../../../assets/white_train.png";
import dark_question from "../../../assets/dark_question.png";
import white_question from "../../../assets/white_question.png";

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
            value={passengersNum}
            onChange={(e) => setPassengersNum(e.target.value)}
            required
          />
        </div>
        <div className="inputs">
          <div className="email-icon">
            <img src={getTransportIcon()} alt="" className="icon show" />
          </div>
          <input
            id="transport_type"
            type="text"
            placeholder="Enter transport type:"
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
