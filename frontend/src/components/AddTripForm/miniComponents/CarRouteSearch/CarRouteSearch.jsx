import { useState, React } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";
import FitRouteBounds from "../../utilities/FitRouteBounds";
import "leaflet/dist/leaflet.css";
import "./CarRouteSearch.css";
import dark_left_arrow from "../../../../assets/dark_left_arrow.png";
import white_left_arrow from "../../../../assets/white_left_arrow.png";
import dark_right_arrow from "../../../../assets/dark_right_arrow.png";
import white_right_arrow from "../../../../assets/white_right_arrow.png";
import red_destination from "../../../../assets/red_destination.png";
import green_start from "../../../../assets/green_start.png";

const CarRouteSearch = ({
  darkMode,
  departureCity,
  destinationCity,
  passengersNum,
}) => {
  const [startAddress, setStartAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const [route, setRoute] = useState(null);

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const defaultFuelPrices = {
    diesel: 1.72,
    petrol: 1.6,
    lpg: 0.84,
  };

  const [fuelType, setFuelType] = useState("diesel");
  const [fuelConsumption, setFuelConsumption] = useState("");
  const [fuelPrice, setFuelPrice] = useState(defaultFuelPrices.diesel);
  const [fuelCalculation, setFuelCalculation] = useState(null);

  const handleStartAddressChange = async (e) => {
    const value = e.target.value;

    setStartAddress(value);
    setSelectedStart(null);
    setRoute(null);

    if (value.trim().length < 3) {
      setStartSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/addresses/autocomplete?text=${encodeURIComponent(value)}&city=${encodeURIComponent(departureCity)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Autocomplete request failed.");
        return;
      }

      setStartSuggestions(data);
    } catch (error) {
      console.error("Failed to load start address suggestions:", error);
      setStartSuggestions([]);
    }
  };

  const handleDestinationAddressChange = async (e) => {
    const value = e.target.value;

    setDestinationAddress(value);
    setSelectedDestination(null);
    setRoute(null);

    if (value.trim().length < 3) {
      setDestinationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/addresses/autocomplete?text=${encodeURIComponent(value)}&city=${encodeURIComponent(destinationCity)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Autocomplete request failed.");
        return;
      }

      setDestinationSuggestions(data);
    } catch (error) {
      console.error("Failed to load destinaion address suggestions:", error);
      setDestinationSuggestions([]);
    }
  };

  const handleShowRoute = async () => {
    if (!selectedStart || !selectedDestination) {
      return;
    }

    setIsLoadingRoute(true);
    setRoute(null);
    setFuelCalculation(null);

    try {
      const response = await fetch("http://localhost:5000/api/car-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: {
            latitude: selectedStart.latitude,
            longitude: selectedStart.longitude,
          },
          destination: {
            latitude: selectedDestination.latitude,
            longitude: selectedDestination.longitude,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to calculate route.");
      }

      setRoute(data);

      console.log("Route:", data);
    } catch (error) {
      console.error("Failed to load route:", error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const routePositions =
    route?.geometry?.coordinates?.flatMap((line) =>
      line.map(([longitude, latitude]) => [latitude, longitude]),
    ) || [];

  const startIcon = L.icon({
    iconUrl: green_start,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const destinationIcon = L.icon({
    iconUrl: red_destination,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const handleCalculateFuelCost = () => {
    if (!fuelConsumption || !fuelPrice || !route) {
      return;
    }

    const distance = route.distanceKm * 2;
    const litersNeeded = (distance / 100) * Number(fuelConsumption);
    const totalCost = litersNeeded * Number(fuelPrice);
    const costPerPassenger = totalCost / Number(passengersNum || 1);

    setFuelCalculation({
      litersNeeded: Number(litersNeeded.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      costPerPassenger: Number(costPerPassenger.toFixed(2)),
    });
  };

  const handleFuelTypeChange = (e) => {
    const selectedFuelType = e.target.value;

    setFuelType(selectedFuelType);
    setFuelPrice(defaultFuelPrices[selectedFuelType]);
    setFuelCalculation(null);
  };

  const transformTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.round((time % 3600) / 60);
    return `${hours}h ${minutes}min`;
  };

  return (
    <div className={`car-route-search ${darkMode ? "white-letters" : ""}`}>
      <h2>Car route:</h2>
      <div className="fields-and-button">
        <div className="fields">
          <div className="car-route-field">
            <label htmlFor="start-address">Starting address</label>
            <input
              id="start-address"
              type="text"
              value={startAddress}
              onChange={handleStartAddressChange}
              placeholder={
                departureCity
                  ? `Enter an address in ${departureCity}`
                  : "Enter starting address"
              }
            />
            {startSuggestions.length > 0 && (
              <div className="address-suggestions">
                {startSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.placeId}
                    type="button"
                    className="address-suggestion"
                    onClick={() => {
                      setStartAddress(suggestion.name);
                      setSelectedStart(suggestion);
                      setStartSuggestions([]);
                    }}
                  >
                    {suggestion.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="car-route-field">
            <label htmlFor="destination-address">Destination address</label>
            <input
              id="destination-address"
              type="text"
              value={destinationAddress}
              onChange={handleDestinationAddressChange}
              placeholder={
                destinationCity
                  ? `Enter an address in ${destinationCity}`
                  : "Enter destination address"
              }
            />
            {destinationSuggestions.length > 0 && (
              <div className="address-suggestions">
                {destinationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.placeId}
                    type="button"
                    className="address-suggestion"
                    onClick={() => {
                      setDestinationAddress(suggestion.name);
                      setSelectedDestination(suggestion);
                      setDestinationSuggestions([]);
                    }}
                  >
                    {suggestion.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {selectedStart && selectedDestination && (
          <button
            type="button"
            className={`show-route-btn ${darkMode ? "btn" : "btn dark-btn"}`}
            onClick={handleShowRoute}
            disabled={isLoadingRoute}
          >
            {isLoadingRoute ? "Loading route..." : "Show route"}
          </button>
        )}
      </div>
      {route && (
        <div className="car-route-result">
          <div className="route-map">
            <MapContainer
              center={[43.5116, 16.44]}
              zoom={7}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitRouteBounds positions={routePositions} />
              <Marker
                position={[route.start.latitude, route.start.longitude]}
                icon={startIcon}
              >
                <Popup>
                  <strong>Starting address</strong>
                  <br />
                  {selectedStart.name}
                </Popup>
              </Marker>
              <Marker
                position={[
                  route.destination.latitude,
                  route.destination.longitude,
                ]}
                icon={destinationIcon}
              >
                <Popup>
                  <strong>Destination address</strong>
                  <br />
                  {selectedDestination.name}
                </Popup>
              </Marker>
              {routePositions.length > 0 && (
                <Polyline
                  positions={routePositions}
                  pathOptions={{
                    color: "#492900",
                    weight: 4,
                    opacity: 0.9,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              )}
            </MapContainer>
          </div>
          <div className="car-route-text">
            <div className="car-route-info">
              <h3>Info</h3>
              <div>
                <p>
                  <strong>Distance:</strong> {route.distanceKm} km
                </p>
                <p>
                  <strong>Duration:</strong>{" "}
                  {transformTime(route.durationSeconds)}
                </p>
                <p>
                  <strong>Toll road:</strong> {route.toll ? "Yes" : "No"}
                </p>
              </div>
            </div>
            <div className="fuel-calculator">
              <h3>Fuel cost calculator</h3>
              <div>
                <div className="fuel-field">
                  <label htmlFor="fuel-type">
                    <strong>Fuel type:</strong>
                  </label>
                  <div className="fuel-type-options">
                    <label>
                      <input
                        type="radio"
                        name="fuelType"
                        value="diesel"
                        checked={fuelType === "diesel"}
                        onChange={handleFuelTypeChange}
                      />
                      Diesel
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="fuelType"
                        value="petrol"
                        checked={fuelType === "petrol"}
                        onChange={handleFuelTypeChange}
                      />
                      Petrol
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="fuelType"
                        value="lpg"
                        checked={fuelType === "lpg"}
                        onChange={handleFuelTypeChange}
                      />
                      LPG
                    </label>
                  </div>
                </div>
                <div className="fuel-field">
                  <label htmlFor="fuel-consumption">
                    <strong>Fuel consumption:</strong>
                  </label>
                  <input
                    type="number"
                    value={fuelConsumption}
                    onChange={(e) => {
                      setFuelConsumption(e.target.value);
                      setFuelCalculation(null);
                    }}
                  />
                  L/100km
                </div>
                <div className="fuel-field">
                  <label htmlFor="fuel-price">
                    <strong>Fuel price:</strong>
                  </label>
                  <input
                    id="fuel-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={fuelPrice}
                    onChange={(e) => {
                      setFuelPrice(e.target.value);
                      setFuelCalculation(null);
                    }}
                  />
                  €
                </div>
              </div>
              <button
                type="button"
                className={`calculate-fuel-btn ${darkMode ? "btn" : "btn dark-btn"}`}
                onClick={handleCalculateFuelCost}
              >
                Calculate fuel cost
              </button>
            </div>
            {fuelCalculation && (
              <div className="fuel-results">
                <h3>Calculation</h3>
                <div>
                  <p>
                    <strong>Fuel needed: </strong>
                    {`${fuelCalculation.litersNeeded} L`}
                  </p>
                  <p>
                    <strong>Total fuel cost: </strong>
                    {`${fuelCalculation.totalCost} €`}
                  </p>
                  <p>
                    <strong>Cost per passenger: </strong>
                    {`${fuelCalculation.costPerPassenger} €`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarRouteSearch;
