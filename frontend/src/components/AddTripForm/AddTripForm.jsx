import { useState, React, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import "./AddTripForm.css";
import TripDetails from "./miniComponents/TripDetails/TripDetails";
import AccommodationResults from "./miniComponents/AccommodationResults/AccommodationResults";
import FlightSearch from "./miniComponents/FlightSearch/FlightSearch";
import CarRouteSearch from "./miniComponents/CarRouteSearch/CarRouteSearch";
import { formatDate } from "./utilities/DateUtilities";
import AIChat from "./miniComponents/AIChat/AIChat";
import TripPreview from "./miniComponents/TripPreview/TripPreview";
import { API_URL } from "../../config";
import { useNavigate } from "react-router-dom";

const AddTripForm = ({ darkMode }) => {
  const [departure, setDeparture] = useState("");
  const [departureCountryCode, setDepartureCountryCode] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationCountryCode, setDestinationCountryCode] = useState("");
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

  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [AICost, setAICost] = useState("");
  const [AIDescription, setAIDescription] = useState("");
  const [showAICost, setShowAICost] = useState(false);

  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const navigate = useNavigate();

  const handleGoToMyTrips = () => {
    setTimeout(() => {
      navigate("/mytrips");
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAccommodations([]);
    // setCurrentAccommodationSlide(0);

    setDepartureAirports([]);
    setArrivalAirports([]);

    if (!startDate || !endDate) {
      toast.error("Enter departure and return date.");
      return;
    }

    if (endDate <= startDate) {
      toast.error("Return date must be after departure date.");
      return;
    }

    if (
      transport_type.toLowerCase() !== "car" &&
      transport_type.toLowerCase() !== "auto" &&
      transport_type.toLowerCase() !== "plane" &&
      transport_type.toLowerCase() !== "airplane"
    ) {
      toast.error(
        "Unsupported transport type. Plase choose between car and plane.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/accommodations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: destination.toLowerCase(),
          checkin: formatDate(startDate),
          checkout: formatDate(endDate),
          adults: Number(passengers_num),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Accommodations fetch failed.");
        return;
      }

      setAccommodations(data.accommodations || []);

      if (
        transport_type.toLowerCase() === "plane" ||
        transport_type.toLowerCase() === "aeroplane"
      ) {
        const [departureResponse, arrivalResponse] = await Promise.all([
          fetch(`${API_URL}/airports?city=${encodeURIComponent(departure)}`),
          fetch(`${API_URL}/airports?city=${encodeURIComponent(destination)}`),
        ]);

        const departureData = await departureResponse.json();
        const arrivalData = await arrivalResponse.json();

        if (!departureResponse.ok || !arrivalResponse.ok) {
          toast.error("Airport fetch failed.");
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

  const transportPrice = selectedFlight
    ? Number(selectedFlight.price)
    : Number((carDetails?.fuelCost || 0) + (carDetails?.tollCost || 0));
  const totalPrice = (
    Number(selectedAccommodation?.totalPrice || 0) +
    transportPrice +
    Number(AICost || 0)
  ).toFixed(2);

  const handleSaveTrip = async () => {
    if (!destination || !startDate || !endDate || !transport_type) {
      toast.error("Please fill in all required trip details.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          transport_type: transport_type.toLowerCase(),
          passengers_num: Number(passengers_num),
          hotel_id: selectedAccommodation?.id || null,
          hotel_price: selectedAccommodation?.totalPrice || null,
          hotel_currency: selectedAccommodation?.currency || null,
          hotel_board_name: selectedAccommodation?.boardName || null,
          selectedFlight:
            (transport_type.toLowerCase() === "plane" ||
              transport_type.toLowerCase() === "aeroplane") &&
            selectedFlight
              ? selectedFlight
              : null,
          carDetails:
            (transport_type.toLowerCase() === "car" ||
              transport_type.toLowerCase() === "auto") &&
            carDetails
              ? carDetails
              : null,
          ai_cost: AICost ? Number(AICost) : null,
          ai_description: AIDescription || null,
          total_cost: totalPrice,
          departure: departure,
          notes: notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Trip could not be saved.");
        return;
      }

      toast.success("Trip saved successfully. Redirecting to trips page.");
      console.log("Saved trip:", data);
    } catch (error) {
      console.error("Save trip error:", error);
      toast.error("An error occured while saving the trip.");
    }
  };

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        departureCountryCode={departureCountryCode}
        setDepartureCountryCode={setDepartureCountryCode}
        destination={destination}
        setDestination={setDestination}
        destinationCountryCode={destinationCountryCode}
        setDestinationCountryCode={setDestinationCountryCode}
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
        selectedAccommodation={selectedAccommodation}
        setSelectedAccommodation={setSelectedAccommodation}
        screenWidth={screenWidth}
      />

      {hasSearched &&
        (transport_type.toLowerCase() === "plane" ||
          transport_type.toLowerCase() === "aeroplane") &&
        departureAirports.length > 0 &&
        arrivalAirports.length > 0 && (
          <FlightSearch
            darkMode={darkMode}
            departureAirports={departureAirports}
            arrivalAirports={arrivalAirports}
            startDate={startDate}
            endDate={endDate}
            passengersNum={passengers_num}
            selectedFlight={selectedFlight}
            setSelectedFlight={setSelectedFlight}
            screenWidth={screenWidth}
          />
        )}

      {hasSearched &&
        (transport_type.toLowerCase() === "car" ||
          transport_type.toLowerCase() === "auto") && (
          <CarRouteSearch
            darkMode={darkMode}
            departureCity={departure}
            departureCountryCode={departureCountryCode}
            destinationCity={destination}
            destinationCountryCode={destinationCountryCode}
            passengersNum={passengers_num}
            carDetails={carDetails}
            setCarDetails={setCarDetails}
          />
        )}

      <AIChat
        darkMode={darkMode}
        trip={{
          departure,
          destination,
          startDate,
          endDate,
          passengers_num,
          transport_type: transport_type.toLowerCase(),
        }}
      />
      {hasSearched && (
        <div className={`ai ${darkMode ? "white-letters" : ""}`}>
          <h2>Additional details:</h2>
          <div className="ai-cost">
            <button
              type="button"
              className={`ai-cost-btn btn ${darkMode ? "" : "dark-btn"}`}
              onClick={() => setShowAICost(!showAICost)}
            >
              {showAICost ? "Hide AI cost" : "Add AI cost"}
            </button>

            {showAICost && (
              <div>
                <input
                  type="number"
                  value={AICost}
                  onChange={(e) => setAICost(e.target.value)}
                />{" "}
                €
              </div>
            )}
          </div>
          {showAICost && (
            <div className="ai-cost">
              <textarea
                placeholder="Describe AI calculation..."
                value={AIDescription}
                onChange={(e) => setAIDescription(e.target.value)}
              />
            </div>
          )}
          <div className="ai-cost">
            <button
              type="button"
              className={`ai-cost-btn btn ${darkMode ? "" : "dark-btn"}`}
              onClick={() => setShowNotes(!showNotes)}
            >
              {showNotes ? "Hide notes" : "Add notes"}
            </button>
          </div>
          {showNotes && (
            <div className="ai-cost">
              <textarea
                placeholder="Enter notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {hasSearched && (
        <div className={darkMode ? "white-letters" : ""}>
          <h2 className="trip-preview-title">Trip preview:</h2>
          <TripPreview
            darkMode={darkMode}
            departure={departure}
            destination={destination}
            startDate={startDate}
            endDate={endDate}
            passengersNum={passengers_num}
            transportType={transport_type.toLowerCase()}
            selectedAccommodation={selectedAccommodation}
            selectedFlight={selectedFlight}
            carDetails={carDetails}
            AICost={AICost}
            AIDescription={AIDescription}
            totalPrice={totalPrice}
            notes={notes}
          />
        </div>
      )}

      {hasSearched && (
        <div className="save-trip-wrapper">
          <button
            type="button"
            onClick={() => {
              handleSaveTrip();
              handleGoToMyTrips();
            }}
            className={`btn ${darkMode ? "" : "dark-btn"}`}
          >
            Save trip
          </button>
        </div>
      )}
    </div>
  );
};

export default AddTripForm;
