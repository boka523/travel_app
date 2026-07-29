import { useState, React, useRef } from "react";
import toast from "react-hot-toast";
import "./AddTripForm.css";
import TripDetails from "./miniComponents/TripDetails";
import AccommodationResults from "./miniComponents/AccommodationResults";
import FlightSearch from "./miniComponents/FlightSearch";
import { formatDate } from "./utilities/DateUtilities";

const AddTripForm = ({ darkMode }) => {
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [passengers_num, setPassengersNum] = useState(1);
  const [transport_type, setTransportType] = useState("");

  const resultsRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [accommodations, setAccommodations] = useState([]);
  const [departureAirports, setDepartureAirports] = useState([]);
  const [arrivalAirports, setArrivalAirports] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAccommodations([]);
    // setCurrentAccommodationSlide(0);

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

      setAccommodations(data.accommodations || []);

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

  return (
    <div className="add-trips-form container">
      <div className="title">
        <div
          className={`add-trips-text ${darkMode ? "tint white-letters" : ""}`}
        >
          <h1>Create trip</h1>
        </div>
      </div>

      <TripDetails
        darkMode={darkMode}
        departure={departure}
        setDeparture={setDeparture}
        destination={destination}
        setDestination={setDestination}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        passengersNum={passengers_num}
        setPassengersNum={setPassengersNum}
        transportType={transport_type}
        setTransportType={setTransportType}
        loading={loading}
        hasSearched={hasSearched}
        handleSubmit={handleSubmit}
        resultsRef={resultsRef}
      />

      <AccommodationResults
        darkMode={darkMode}
        accommodations={accommodations}
        loading={loading}
        resultsRef={resultsRef}
      />

      {(transport_type === "plane" || transport_type === "aeroplane") &&
        departureAirports.length > 0 &&
        arrivalAirports.length > 0 && (
          <FlightSearch
            darkMode={darkMode}
            departureAirports={departureAirports}
            arrivalAirports={arrivalAirports}
            startDate={startDate}
            endDate={endDate}
            passengersNum={passengers_num}
          />
        )}
    </div>
  );
};

export default AddTripForm;
