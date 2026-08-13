import { useState, React, useRef, useEffect } from "react";
import "./AccommodationResults.css";
import dark_left_arrow from "../../../../assets/dark_left_arrow.png";
import white_left_arrow from "../../../../assets/white_left_arrow.png";
import dark_right_arrow from "../../../../assets/dark_right_arrow.png";
import white_right_arrow from "../../../../assets/white_right_arrow.png";
import Select from "react-select";

const AccommodationResults = ({
  darkMode,
  accommodations,
  loading,
  resultsRef,
  selectedAccommodation,
  setSelectedAccommodation,
  screenWidth,
}) => {
  const [sortOption, setSortOption] = useState(null);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? "white" : "black",
      border: "none",
      borderRadius: "30px",
      height:
        screenWidth < 800 ? (screenWidth < 400 ? "30px" : "40px") : "40px",
      width:
        screenWidth < 1250
          ? screenWidth < 600
            ? screenWidth < 400
              ? "180px"
              : "210px"
            : "250px"
          : "250px",
      boxShadow: "none",
      transition: "0.3s",
      cursor: "pointer",
    }),

    placeholder: (provided) => ({
      ...provided,
      color: darkMode ? "black" : "white",
      fontSize:
        screenWidth < 600 ? (screenWidth < 400 ? "16px" : "18px") : "20px",
      transition: "0.3s",
      textAlign: "center",
    }),

    singleValue: (provided) => ({
      ...provided,
      color: darkMode ? "black" : "white",
      fontSize:
        screenWidth < 600 ? (screenWidth < 400 ? "14px" : "18px") : "20px",
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
      width:
        screenWidth < 1250
          ? screenWidth < 600
            ? screenWidth < 400
              ? "180px"
              : "210px"
            : "250px"
          : "250px",
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
      fontSize:
        screenWidth < 600 ? (screenWidth < 400 ? "14px" : "16px") : "18px",
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

  const sortOptions = [
    { value: "priceAsc", label: "Price - ascending" },
    { value: "priceDesc", label: "Price - descending" },
  ];

  const sortedAccommodations = [...accommodations].sort((a, b) => {
    switch (sortOption?.value) {
      case "priceAsc":
        return Number(a.totalPrice) - Number(b.totalPrice);
      case "priceDesc":
        return Number(b.totalPrice) - Number(a.totalPrice);
      default:
        return 0;
    }
  });

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
      length: Math.ceil(sortedAccommodations.length / accommodationsPerSlide),
    },
    (_, index) =>
      sortedAccommodations.slice(
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
            <Select
              options={sortOptions}
              value={sortOption}
              onChange={setSortOption}
              className="sort-accommodation"
              placeholder="Sort by"
              isSearchable={false}
              styles={customStyles}
            />
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
