import React, { useState } from "react";
import "./EditTripForm.css";

const transformTime = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.round((time % 3600) / 60);
  return `${hours}h ${minutes}min`;
};

const EditTripForm = ({ darkMode, trip, setTrip }) => {
  return (
    <div className="edit-trip-form container">
      <div className="title">
        <div
          className={`edit-trip-text ${darkMode ? "tint white-letters" : ""}`}
        >
          <h1>Edit trip details</h1>
        </div>
      </div>
      <div className={`edit-trip-card ${darkMode ? "tint white-letters" : ""}`}>
        <div className="detail-value">
          <span>Destination: {trip.destination}</span>
        </div>
        <div className="detail-value">
          <span>
            Start date: {new Date(trip.start_date).toLocaleDateString("hr-HR")}
          </span>
        </div>
        <div className="detail-value">
          <span>
            End date: {new Date(trip.end_date).toLocaleDateString("hr-HR")}
          </span>
        </div>
        <div className="detail-value">
          <span>Number of passengers: {trip.passengers_num}</span>
        </div>
        <div className="detail-value">
          <span>Transport type: {trip.transport_type}</span>
        </div>
        {trip.hotels ? (
          <>
            <div className="detail-value">
              <span>Hotel: {trip.hotels.name}</span>
            </div>
            <div className="detail-value">
              <span>Adresa: {trip.hotels.address || "Not avaliable"}</span>
            </div>
            <div className="detail-value">
              <span>
                Kategorija:{" "}
                {trip.hotels.stars
                  ? "⭐".repeat(Number(trip.hotels.stars))
                  : "Not avaliable"}
              </span>
            </div>
            <div className="detail-value">
              <span>
                Board type: {trip.hotel_board_name || "Not avaliable"}
              </span>
            </div>
            <div className="detail-value">
              <span>
                Price:{" "}
                {trip.hotel_price
                  ? `${Number(trip.hotel_price)} €`
                  : "Not avaliable"}
              </span>
            </div>
          </>
        ) : (
          <div className="detail-value">
            <span>Hotel nije odabran</span>
          </div>
        )}
        {(trip.transport_type === "plane" ||
          trip.transport_type === "aeroplane") && (
          <div className="flight-details">
            <h2>Flight details</h2>
            {trip.trip_flights ? (
              <>
                <div className="detail-value">
                  <span>
                    Airline: {trip.trip_flights.airline_name || "Not avaliable"}
                  </span>
                </div>
                <h3>Outbound flight</h3>
                <div className="detail-value">
                  <span>
                    Departure:{" "}
                    {trip.trip_flights.outbound_departure_time
                      ? new Date(
                          trip.trip_flights.outbound_departure_time,
                        ).toLocaleString("hr-HR")
                      : "Not avaliable"}
                  </span>
                </div>
                <div className="detail-value">
                  <span>
                    Arrival:{" "}
                    {trip.trip_flights.outbound_arrival_time
                      ? new Date(
                          trip.trip_flights.outbound_arrival_time,
                        ).toLocaleString("hr-HR")
                      : "Not avaliable"}
                  </span>
                </div>
                <h3>Return flight</h3>
                <div className="detail-value">
                  <span>
                    Departure:{" "}
                    {trip.trip_flights.return_departure_time
                      ? new Date(
                          trip.trip_flights.return_departure_time,
                        ).toLocaleString("hr-HR")
                      : "Not avaliable"}
                  </span>
                </div>
                <div className="detail-value">
                  <span>
                    Arrival:{" "}
                    {trip.trip_flights.return_arrival_time
                      ? new Date(
                          trip.trip_flights.return_arrival_time,
                        ).toLocaleString("hr-HR")
                      : "Not avaliable"}
                  </span>
                </div>
                <div className="detail-value">
                  <span>Stops in total: {trip.trip_flights.stops ?? 0}</span>
                </div>
                <div className="detail-value">
                  <span>
                    Flight price: {Number(trip.trip_flights.price).toFixed(2)} €
                  </span>
                </div>
              </>
            ) : (
              <div className="detail-value">
                <span>No selected flight.</span>
              </div>
            )}
          </div>
        )}
        {(trip.transport_type === "car" || transport_type === "auto") && (
          <div className="car-details">
            <h2>Car route details</h2>
            {trip.trip_car_details ? (
              <>
                <div className="detail-value">
                  <span>
                    One-way distance:{" "}
                    {trip.trip_car_details.distance_km
                      ? `${(Number(trip.trip_car_details.distance_km).toFixed(2) / 2).toFixed(2)} km`
                      : "Not avaliable"}
                  </span>
                </div>
                <div className="detail-value">
                  <span>
                    Total distance:{" "}
                    {trip.trip_car_details.distance_km
                      ? `${Number(trip.trip_car_details.distance_km).toFixed(2)} km`
                      : "Not avaliable"}
                  </span>
                </div>
                <div className="detail-value">
                  <span>
                    One-way estimated duration:{" "}
                    {trip.trip_car_details.duration_seconds
                      ? `${transformTime((Number(trip.trip_car_details.duration_seconds).toFixed(2) / 2).toFixed(2))}`
                      : "Not avaliable"}
                  </span>
                </div>
                <div className="detail-value">
                  <span>
                    Total estimated duration:{" "}
                    {trip.trip_car_details.duration_seconds
                      ? `${transformTime(Number(trip.trip_car_details.duration_seconds).toFixed(2))}`
                      : "Not avaliable"}
                  </span>
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
                    One-way fuel cost:{" "}
                    {trip.trip_car_details.fuel_cost
                      ? `${(
                          Number(trip.trip_car_details.fuel_cost).toFixed(2) / 2
                        ).toFixed(2)} €`
                      : "Not available"}
                  </span>
                </div>
                <div className="detail-value">
                  <span>
                    Total fuel cost:{" "}
                    {trip.trip_car_details.fuel_cost
                      ? `${Number(trip.trip_car_details.fuel_cost).toFixed(
                          2,
                        )} €`
                      : "Not available"}
                  </span>
                </div>
                <div className="detail-value">
                  <span>
                    One-way toll cost:{" "}
                    {trip.trip_car_details.toll_cost !== null &&
                    trip.trip_car_details.toll_cost !== undefined
                      ? `${(
                          Number(trip.trip_car_details.toll_cost).toFixed(2) / 2
                        ).toFixed(2)} €`
                      : "Not available"}
                  </span>
                </div>
                <div className="detail-value">
                  <span>
                    Total toll cost:{" "}
                    {trip.trip_car_details.toll_cost !== null &&
                    trip.trip_car_details.toll_cost !== undefined
                      ? `${Number(trip.trip_car_details.toll_cost).toFixed(
                          2,
                        )} €`
                      : "Not available"}
                  </span>
                </div>

                <div className="detail-value">
                  <span>
                    Total car cost:{" "}
                    {`${(
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
          <div className="detail-value">
            <span>AI cost: {trip.ai_cost}</span>
          </div>
        ) : (
          <div className="detail-value">
            <span>AI cost nije izračunat</span>
          </div>
        )}
        <div className="detail-value">
          <span>Total cost: {trip.total_cost}</span>
        </div>
      </div>
    </div>
  );
};

export default EditTripForm;
