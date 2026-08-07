import React, { useState } from "react";
import "./EditTripForm.css";

const transformTime = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.round((time % 3600) / 60);
  return `${hours}h ${minutes}min`;
};

const EditTripForm = ({ darkMode, trip, setTrip }) => {
  const [routeDirection, setRouteDirection] = useState("two-way");

  return (
    <div className="edit-trip-form container">
      <div className="title">
        <div
          className={`edit-trip-text ${darkMode ? "tint white-letters" : ""}`}
        >
          <h1>Your trip to {trip.destination}</h1>
        </div>
      </div>
      <div className={`edit-trip-card ${darkMode ? "tint white-letters" : ""}`}>
        <div className="partial-info">
          <div className={`partial-info-sub ${darkMode ? "tint" : ""}`}>
            <h2>Trip details</h2>
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Departure</span>
                <strong className="info-value">
                  {trip.departure
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </strong>
              </div>
              <div className="info-row">
                <span className="info-label">Destination</span>
                <strong className="info-value">
                  {trip.destination
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </strong>
              </div>
              <div className="info-row">
                <span className="info-label">Departure date</span>
                <strong className="info-value">
                  {new Date(trip.start_date).toLocaleDateString("hr-HR")}
                </strong>
              </div>
              <div className="info-row">
                <span className="info-label">Return date</span>
                <strong className="info-value">
                  {new Date(trip.end_date).toLocaleDateString("hr-HR")}
                </strong>
              </div>
              <div className="info-row">
                <span className="info-label">Passengers</span>
                <strong className="info-value">{trip.passengers_num}</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Transport</span>
                <strong className="info-value">{trip.transport_type}</strong>
              </div>
            </div>
          </div>
          {trip.hotels ? (
            <div className={`partial-info-sub ${darkMode ? "tint" : ""}`}>
              <h2>Accommodation details</h2>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Accommodation</span>
                  <strong className="info-value">{trip.hotels.name}</strong>
                </div>
                <div className="info-row">
                  <span className="info-label">Address</span>
                  <strong className="info-value">
                    {trip.hotels.address || "Not avaliable"}
                  </strong>
                </div>
                <div className="info-row">
                  <span className="info-label">Category:</span>
                  <strong className="info-value hotel-stars">
                    {trip.hotels.stars
                      ? "⭐".repeat(Number(trip.hotels.stars))
                      : "Not avaliable"}
                  </strong>
                </div>
                <div className="info-row">
                  <span className="info-label">Type</span>
                  <strong className="info-value">
                    {trip.hotel_board_name || "Not avaliable"}
                  </strong>
                </div>
                <div className="info-row">
                  <span className="info-label">Price:</span>
                  <strong className="info-value hotel-price">
                    {trip.hotel_price
                      ? `${Number(trip.hotel_price)} €`
                      : "Not avaliable"}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="detail-value">
              <span>No selected accommodation.</span>
            </div>
          )}
        </div>
        <div className="partial-info">
          {(trip.transport_type === "plane" ||
            trip.transport_type === "aeroplane") && (
            <div className={`partial-info-sub ${darkMode ? "tint" : ""}`}>
              <h2>Flight details</h2>
              {trip.trip_flights ? (
                <>
                  <div className="flight-airline">
                    <span>Airline:</span>
                    <strong>
                      {trip.trip_flights.airline_name || "Not avaliable"}
                    </strong>
                  </div>
                  <div className="flight-routes">
                    <div className="flight-route-card">
                      <div className="flight-route-title">
                        <span>OUTBOUND</span>
                        <h3>Outbound flight</h3>
                      </div>
                      <div className="flight-time-row">
                        <div className="flight-time">
                          <span>Departure:</span>
                          <strong>
                            {trip.trip_flights.outbound_departure_time
                              ? new Date(
                                  trip.trip_flights.outbound_departure_time,
                                ).toLocaleString("hr-HR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Not avaliable"}
                          </strong>
                        </div>
                        <div className="flight-route-arrow">→</div>
                        <div className="flight-time">
                          <span>Arrival:</span>
                          <strong>
                            {trip.trip_flights.outbound_arrival_time
                              ? new Date(
                                  trip.trip_flights.outbound_arrival_time,
                                ).toLocaleString("hr-HR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Not avaliable"}
                          </strong>
                        </div>
                      </div>
                    </div>
                    <div className="flight-route-card">
                      <div className="flight-route-title">
                        <span>RETURN</span>
                        <h3>Return flight</h3>
                      </div>
                      <div className="flight-time-row">
                        <div className="flight-time">
                          <span>Departure:</span>
                          <strong>
                            {trip.trip_flights.return_departure_time
                              ? new Date(
                                  trip.trip_flights.return_departure_time,
                                ).toLocaleString("hr-HR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Not avaliable"}
                          </strong>
                        </div>
                        <div className="flight-route-arrow">→</div>
                        <div className="flight-time">
                          <span>Arrival:</span>
                          <strong>
                            {trip.trip_flights.return_arrival_time
                              ? new Date(
                                  trip.trip_flights.return_arrival_time,
                                ).toLocaleString("hr-HR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Not avaliable"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flight-summary">
                    <div className="detail-value">
                      <span>Stops:</span>
                      <strong>{trip.trip_flights.stops ?? 0}</strong>
                    </div>
                    <div className="detail-value">
                      <span>Flight price:</span>
                      <strong>
                        {Number(trip.trip_flights.price).toFixed(2)} €
                      </strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="detail-value">
                  <span>No selected flight.</span>
                </div>
              )}
            </div>
          )}
          {(trip.transport_type === "car" ||
            trip.transport_type === "auto") && (
            <div className={`partial-info-sub ${darkMode ? "tint" : ""}`}>
              <h2>Car route details</h2>
              {trip.trip_car_details ? (
                <>
                  <div className="route-addresses">
                    <div className="route-address">
                      <span className="route-address-label">
                        Departure address
                      </span>
                      <strong>
                        {trip.trip_car_details.departure_address ||
                          "Not avaliable"}
                      </strong>
                    </div>
                    <div className="route-address-arrow">→</div>
                    <div className="route-address">
                      <span className="route-address-label">
                        Destination address
                      </span>
                      <strong>
                        {trip.trip_car_details.destination_address ||
                          "Not avaliable"}
                      </strong>
                    </div>
                  </div>
                  <div className="route-section-header">
                    <h3>Route details</h3>
                    <div className="route-direction-buttons">
                      <button
                        type="button"
                        className={`route-direction-btn ${
                          routeDirection === "one-way"
                            ? "route-direction-btn-active"
                            : ""
                        }`}
                        onClick={() => setRouteDirection("one-way")}
                      >
                        ONE WAY
                      </button>
                      <button
                        type="button"
                        className={`route-direction-btn ${
                          routeDirection === "two-way"
                            ? "route-direction-btn-active"
                            : ""
                        }`}
                        onClick={() => setRouteDirection("two-way")}
                      >
                        TWO WAY
                      </button>
                    </div>
                  </div>
                  <div className="route-details">
                    <div className="detail-value">
                      <span>
                        Distance:{" "}
                        {trip.trip_car_details.distance_km
                          ? routeDirection === "one-way"
                            ? `${(Number(trip.trip_car_details.distance_km) / 2).toFixed(2)} km`
                            : `${Number(trip.trip_car_details.distance_km).toFixed(2)} km`
                          : "Not avaliable"}
                      </span>
                    </div>

                    <div className="detail-value">
                      <span>
                        Estimated duration:{" "}
                        {trip.trip_car_details.duration_seconds
                          ? routeDirection === "one-way"
                            ? `${transformTime((Number(trip.trip_car_details.duration_seconds) / 2).toFixed(2))}`
                            : `${transformTime(Number(trip.trip_car_details.duration_seconds).toFixed(2))}`
                          : "Not avaliable"}
                      </span>
                    </div>
                    <div className="route-section-header">
                      <h3>Fuel and tolls</h3>
                    </div>
                    <div className="detail-value">
                      <span>
                        Fuel type:{" "}
                        {trip.trip_car_details.fuel_type || "Not available"}
                      </span>
                    </div>

                    <div className="detail-value">
                      <span>
                        Fuel consumption:{" "}
                        {trip.trip_car_details.fuel_consumption
                          ? `${Number(
                              trip.trip_car_details.fuel_consumption,
                            ).toFixed(2)} L/100 km`
                          : "Not available"}
                      </span>
                    </div>

                    <div className="detail-value">
                      <span>
                        Fuel price:{" "}
                        {trip.trip_car_details.fuel_price
                          ? `${Number(trip.trip_car_details.fuel_price).toFixed(
                              2,
                            )} € / L`
                          : "Not available"}
                      </span>
                    </div>

                    <div className="detail-value">
                      <span>
                        Fuel cost:{" "}
                        {trip.trip_car_details.fuel_cost
                          ? routeDirection === "one-way"
                            ? `${(
                                Number(trip.trip_car_details.fuel_cost) / 2
                              ).toFixed(2)} €`
                            : `${Number(
                                trip.trip_car_details.fuel_cost,
                              ).toFixed(2)} €`
                          : "Not available"}
                      </span>
                    </div>

                    <div className="detail-value">
                      <span>
                        Toll cost:{" "}
                        {trip.trip_car_details.toll_cost !== null &&
                        trip.trip_car_details.toll_cost !== undefined
                          ? routeDirection === "one-way"
                            ? `${(
                                Number(trip.trip_car_details.toll_cost) / 2
                              ).toFixed(2)} €`
                            : `${Number(
                                trip.trip_car_details.toll_cost,
                              ).toFixed(2)} €`
                          : "Not available"}
                      </span>
                    </div>
                  </div>
                  <div className="detail-value total-car-price">
                    <span>
                      Total car cost:{" "}
                      {routeDirection === "one-way"
                        ? `${(
                            (Number(trip.trip_car_details.fuel_cost || 0) +
                              Number(trip.trip_car_details.toll_cost || 0)) /
                            2
                          ).toFixed(2)} €`
                        : `${(
                            Number(trip.trip_car_details.fuel_cost || 0) +
                            Number(trip.trip_car_details.toll_cost || 0)
                          ).toFixed(2)} €`}
                    </span>
                  </div>
                </>
              ) : (
                <div className="detail-value">
                  <span>No car route details available.</span>
                </div>
              )}
            </div>
          )}
          {trip.ai_cost ? (
            <div className={`partial-info-sub ${darkMode ? "tint" : ""}`}>
              <h2>Additional details</h2>
              <span className="additional-ai-cost">
                AI calculated cost: {trip.ai_cost} €
              </span>
              {trip.ai_description && (
                <span className="ai-description">
                  Description: {trip.ai_description}
                </span>
              )}
              {trip.notes && (
                <span className="ai-description">Notes: {trip.notes}</span>
              )}
            </div>
          ) : (
            <div className="detail-value">
              <span>No additional details.</span>
            </div>
          )}
        </div>
        <div className="detail-value total">
          <span>
            <strong>Total cost: {trip.total_cost} €</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default EditTripForm;
