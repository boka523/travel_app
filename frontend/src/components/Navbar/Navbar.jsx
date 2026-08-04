import { useState, React } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Navbar.css";
import dark_logo from "../../assets/dark_logo.png";
import white_logo from "../../assets/white_logo.png";
import dark_moon from "../../assets/dark_moon.png";
import white_sun from "../../assets/white_sun.png";
import white_profile from "../../assets/white_profile.png";
import dark_profile from "../../assets/dark_profile.png";
import white_logout from "../../assets/white_logout.png";
import dark_logout from "../../assets/dark_logout.png";
import white_back_button from "../../assets/white_back_button.png";
import dark_back_button from "../../assets/dark_back_button.png";

const Navbar = ({ darkMode, toggleMode, variant }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logging out...");

    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const goBack = () => {
    navigate("/mytrips");
  };

  const closeMenuAndRun = (callback) => {
    callback();
    setMenuOpen(false);
  };

  const renderNavbarButtons = () => (
    <>
      {variant === "my-trips" && (
        <>
          <button
            className={darkMode ? "btn" : "btn dark-btn"}
            onClick={() => closeMenuAndRun(handleLogout)}
          >
            <div className="email-icon">
              <img
                src={dark_logout}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={white_logout}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
          </button>
          <button
            className={darkMode ? "btn" : "btn dark-btn"}
            onClick={() => closeMenuAndRun(handleProfile)}
          >
            <div className="email-icon">
              <img
                src={dark_profile}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={white_profile}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
          </button>
        </>
      )}
      {variant === "add-trips" && (
        <>
          <button
            className={darkMode ? "btn" : "btn dark-btn"}
            onClick={() => closeMenuAndRun(goBack)}
          >
            <div className="email-icon">
              <img
                src={dark_back_button}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={white_back_button}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
          </button>
          <button
            className={darkMode ? "btn" : "btn dark-btn"}
            onClick={() => closeMenuAndRun(handleLogout)}
          >
            <div className="email-icon">
              <img
                src={dark_logout}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={white_logout}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
          </button>
          <button
            className={darkMode ? "btn" : "btn dark-btn"}
            onClick={() => closeMenuAndRun(handleProfile)}
          >
            <div className="email-icon">
              <img
                src={dark_profile}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={white_profile}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
          </button>
        </>
      )}
      {variant === "profile" && (
        <>
          <button
            className={darkMode ? "btn" : "btn dark-btn"}
            onClick={() => closeMenuAndRun(handleLogout)}
          >
            <div className="email-icon">
              <img
                src={dark_logout}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={white_logout}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
          </button>
          <button
            className={darkMode ? "btn" : "btn dark-btn"}
            onClick={() => closeMenuAndRun(goBack)}
          >
            <div className="email-icon">
              <img
                src={dark_back_button}
                alt=""
                className={`icon ${darkMode ? "show" : "hide"}`}
              />
              <img
                src={white_back_button}
                alt=""
                className={`icon ${darkMode ? "hide" : "show"}`}
              />
            </div>
          </button>
        </>
      )}
      <button
        className={darkMode ? "btn" : "btn dark-btn"}
        onClick={toggleMode}
      >
        <img src={white_sun} alt="" className="mode" />
        <img src={dark_moon} alt="" className="mode" />
      </button>
    </>
  );

  return (
    <nav className={`container ${darkMode ? "tint" : ""}`}>
      <div className="logo-wrapper">
        <Link to="/">
          <img
            src={white_logo}
            className={`logo ${darkMode ? "show" : "hide"}`}
          />
        </Link>
        <Link to="/">
          <img
            src={dark_logo}
            className={`logo ${darkMode ? "hide" : "show"}`}
          />
        </Link>
      </div>
      <div className="buttons-wrapper">
        <div className="desktop-navbar-buttons">{renderNavbarButtons()}</div>
        <button
          type="button"
          className={`mobile-menu-button ${darkMode ? "white-mobile-menu" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
        >
          ☰
        </button>
        <div className={`mobile-navbar-menu ${menuOpen ? "open" : ""}`}>
          {renderNavbarButtons()}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
