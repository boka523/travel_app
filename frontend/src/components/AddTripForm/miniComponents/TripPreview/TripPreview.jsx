import React from "react";
import "./TripPreview.css";

const TripPreview = ({
  darkMode,
  departure,
  destination,
  startDate,
  endDate,
  passengersNum,
  transportType,
  selectedAccommodation,
  selectedFlight,
  carDetails,
  AICost,
  AIDescription,
  totalPrice,
  notes,
}) => {
  const formatDate = (date) => {
    if (!date) {
      return "Not selected.";
    }

    return new Date(date).toLocaleDateString("hr-HR");
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return "Not avaliable.";
    }

    return `${Number(price).toFixed(2)} €`;
  };

  console.log("CAR DETAILS:", carDetails);
  return (
    <div className={`trip-preview ${darkMode ? "tint" : ""}`}>
      <div className="trip-preview-grid">
        <div
          className={`trip-preview-section ${darkMode ? "tint  white-letters" : ""}`}
        >
          <h3>Trip details</h3>
          <div className="trip-preview-detail">
            <span>Departure</span>
            <strong>{departure || "Not avaliable"}</strong>
          </div>
          <div className="trip-preview-detail">
            <span>Destination</span>
            <strong>{destination || "Not avaliable"}</strong>
          </div>
          <div className="trip-preview-detail">
            <span>Departure date</span>
            <strong>{formatDate(startDate)}</strong>
          </div>
          <div className="trip-preview-detail">
            <span>Return date</span>
            <strong>{formatDate(endDate)}</strong>
          </div>
          <div className="trip-preview-detail">
            <span>Passengers</span>
            <strong>{passengersNum || "Not avaliable"}</strong>
          </div>
          <div className="trip-preview-detail">
            <span>Transport</span>
            <strong>{transportType || "Not avaliable"}</strong>
          </div>
        </div>
        <div
          className={`trip-preview-section ${darkMode ? "tint  white-letters" : ""}`}
        >
          <h3>Accommodation</h3>
          {selectedAccommodation ? (
            <>
              <div className="trip-preview-detail">
                <span>Accommodation</span>
                <strong>{selectedAccommodation.name || "Not avaliable"}</strong>
              </div>
              <div className="trip-preview-detail">
                <span>Address</span>
                <strong>
                  {selectedAccommodation.address || "Not avaliable"}
                </strong>
              </div>
              <div className="trip-preview-detail">
                <span>Type</span>
                <strong>
                  {selectedAccommodation.boardName || "Not avaliable"}
                </strong>
              </div>
              <div className="trip-preview-detail">
                <span>Price</span>
                <strong>{formatPrice(selectedAccommodation.totalPrice)}</strong>
              </div>
            </>
          ) : (
            <p className="trip-preview-empy">Accommodation not selected.</p>
          )}
        </div>
        {(transportType === "plane" || transportType === "aeroplane") && (
          <div
            className={`trip-preview-section ${darkMode ? "tint  white-letters" : ""}`}
          >
            <h3>Flight</h3>

            {selectedFlight ? (
              <>
                <div className="trip-preview-detail">
                  <span>Airline</span>
                  <strong>
                    {selectedFlight.airlineName || "Not available"}
                  </strong>
                </div>

                <div className="trip-preview-detail">
                  <span>Price</span>
                  <strong>
                    {formatPrice(selectedFlight.price * passengersNum)}
                  </strong>
                </div>
              </>
            ) : (
              <p className="trip-preview-empty">Flight not selected.</p>
            )}
          </div>
        )}

        {(transportType === "car" || transportType === "auto") && (
          <div
            className={`trip-preview-section ${darkMode ? "tint  white-letters" : ""}`}
          >
            <h3>Car route</h3>

            {carDetails ? (
              <>
                <div className="trip-preview-detail">
                  <span>Departure address</span>
                  <strong>{carDetails.startAddress}</strong>
                </div>
                <div className="trip-preview-detail">
                  <span>Destination address</span>
                  <strong>{carDetails.destinationAddress}</strong>
                </div>
                <div className="trip-preview-detail">
                  <span>Total distance</span>
                  <strong>
                    {carDetails.distanceKm
                      ? `${Number(carDetails.distanceKm).toFixed(2)} km`
                      : "Not available"}
                  </strong>
                </div>

                <div className="trip-preview-detail">
                  <span>Fuel cost</span>
                  <strong>{formatPrice(carDetails.fuelCost)}</strong>
                </div>

                <div className="trip-preview-detail">
                  <span>Toll cost</span>
                  <strong>{formatPrice(carDetails.tollCost)}</strong>
                </div>
              </>
            ) : (
              <p className="trip-preview-empty">Car route not calculated.</p>
            )}
          </div>
        )}

        <div
          className={`trip-preview-section ${darkMode ? "tint  white-letters" : ""}`}
        >
          <h3>Additional details</h3>

          <div className="trip-preview-detail">
            <span>AI calculated cost</span>
            <strong>{formatPrice(AICost)}</strong>
          </div>

          <div className="trip-preview-description">
            <span>Description</span>
            <p>{AIDescription || "Description not entered."}</p>
          </div>
          <div className="trip-preview-description">
            <span>Notes</span>
            <p>{notes || "Notes not entered."}</p>
          </div>
        </div>
      </div>
      <div className={`total-price ${darkMode ? "white-letters" : ""}`}>
        <strong>Total price: {totalPrice} €</strong>
      </div>
    </div>
  );
};

export default TripPreview;
