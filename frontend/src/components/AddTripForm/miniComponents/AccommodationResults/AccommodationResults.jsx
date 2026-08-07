import { useState, React, useRef, useEffect } from "react";
import "./AccommodationResults.css";
import dark_left_arrow from "../../../../assets/dark_left_arrow.png";
import white_left_arrow from "../../../../assets/white_left_arrow.png";
import dark_right_arrow from "../../../../assets/dark_right_arrow.png";
import white_right_arrow from "../../../../assets/white_right_arrow.png";

const AccommodationResults = ({
  darkMode,
  accommodations,
  loading,
  resultsRef,
  selectedAccommodation,
  setSelectedAccommodation,
  screenWidth,
}) => {
  const [currentAccommodationSlide, setCurrentAccommodationSlide] = useState(0);
  const accommodationsPerSlide =
    screenWidth < 1000
      ? screenWidth < 750
        ? screenWidth < 550
          ? 1
          : 2
        : 3
      : 4;
  const accommodationSlides = Array.from(
    {
      length: Math.ceil(accommodations.length / accommodationsPerSlide),
    },
    (_, index) =>
      accommodations.slice(
        index * accommodationsPerSlide,
        index * accommodationsPerSlide + accommodationsPerSlide,
      ),
  );

  const totalAccommodationSlides = accommodationSlides.length;

  const handlePreviousAccommodationSlide = () => {
    setCurrentAccommodationSlide((previousSlide) =>
      Math.max(previousSlide - 1, 0),
    );
  };

  const handleNextAccommodationSlide = () => {
    setCurrentAccommodationSlide((previousSlide) =>
      Math.min(previousSlide + 1, totalAccommodationSlides - 1),
    );
  };

  return (
    <div
      className={`accommodation-results ${darkMode ? "white-letters" : ""}`}
      ref={resultsRef}
    >
      {!loading &&
        accommodations.length > 0 && ( //ako se vec loadalo i ako postoji bar jedan smjestaj, prikazi sljedece
          <>
            <h2>Accommodation options:</h2>
            <div className="accommodation-slider">
              <button
                type="button"
                className={`btn ${darkMode ? "" : "dark-btn"}`}
                onClick={handlePreviousAccommodationSlide}
                disabled={currentAccommodationSlide === 0}
                aria-label="Previous accommodations"
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
              <div className="slider-viewport">
                <div
                  className="slider-track"
                  style={{
                    transform: `translateX(-${currentAccommodationSlide * 100}%)`,
                  }}
                >
                  {accommodationSlides.map((slide, slideIndex) => (
                    <div className="accommodation-slide" key={slideIndex}>
                      {slide.map((accommodation) => (
                        <article
                          className={`accommodation-card ${darkMode ? "tint" : ""} ${selectedAccommodation?.id === accommodation.id ? "selected" : ""}`}
                          key={accommodation.id}
                          onClick={() => {
                            setSelectedAccommodation(accommodation);
                          }}
                        >
                          {accommodation.photo && (
                            <img
                              src={accommodation.photo}
                              alt={accommodation.name}
                              className="accommodation-image"
                            />
                          )}
                          <div className="accommodation-info">
                            <h3>{accommodation.name}</h3>
                            {accommodation.stars && (
                              <p className="accommodation-stars">
                                {"Category:" + "⭐".repeat(accommodation.stars)}
                              </p>
                            )}
                            {accommodation.address && (
                              <p>Address: {accommodation.address}</p>
                            )}
                            <p className="accommodation-boardName">
                              {accommodation.boardName
                                ? `Type: ${accommodation.boardName}`
                                : "BoardName unavaliable"}
                            </p>
                            <p className="accommodation-price">
                              {accommodation.totalPrice
                                ? `${accommodation.totalPrice} ${accommodation.currency}`
                                : "Price unavaliable"}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className={`slider-arrow btn ${darkMode ? "" : "dark-btn"}`}
                onClick={handleNextAccommodationSlide}
                disabled={
                  currentAccommodationSlide === totalAccommodationSlides - 1 ||
                  totalAccommodationSlides === 0
                }
                aria-label="Next accommodations"
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
          </>
        )}
      {!loading && accommodations.length === 0 && (
        <p className="accommodation-message">
          Enter trip details to plan your trip.
        </p>
      )}
    </div>
  );
};

export default AccommodationResults;
