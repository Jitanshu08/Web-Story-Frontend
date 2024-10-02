import { Link } from "react-router-dom";
import "../css/Navbar.css";
import { useState, useEffect } from "react";
import axios from "axios";
import BookmarkIcon from "../assets/bookmark.png"; // Import the bookmark icon

const Navbar = ({
  toggleLogin,
  toggleRegister,
  toggleAddStory,
  loggedIn,
  handleLogout,
}) => {
  const [username, setUsername] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Fetch user info only if logged in
  useEffect(() => {
    if (loggedIn) {
      const token = localStorage.getItem("token");
      if (token) {
        axios
          .get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setUsername(response.data.username);
          })
          .catch(() => {
            setUsername(null);
          });
      }
    } else {
      setUsername(null);
    }
  }, [loggedIn]);

  // Handle window resize for mobile view detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);

    // Ensure correct initial check for mobile view
    setIsMobile(window.innerWidth <= 768);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogoutClick = () => {
    handleLogout();
    setDropdownOpen(false);
    setUsername(null);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <h1> </h1>
      <div className="navbar-buttons">
        {loggedIn && username ? (
          <>
            {!isMobile && (
              <>
                <Link to="/bookmarks">
                  <button className="navbar-button bookmark-button">
                    <img
                      src={BookmarkIcon}
                      alt="Bookmark"
                      className="bookmark-icon"
                    />
                    Bookmarks
                  </button>
                </Link>
                <button className="navbar-button" onClick={toggleAddStory}>
                  Add Story
                </button>
                <div className="user-menu">
                  <button className="user-icon">
                    {username[0].toUpperCase()}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {!isMobile && (
              <>
                <button className="navbar-button" onClick={toggleRegister}>
                  Register
                </button>
                <button className="navbar-button" onClick={toggleLogin}>
                  Sign In
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Hamburger Menu */}
      {(loggedIn || isMobile) && ( // Show hamburger menu for mobile or logged in users
        <div className="hamburger-menu">
          <button className="hamburger-icon" onClick={toggleDropdown}>
            &#9776;
          </button>
          {dropdownOpen && (
            <div className="dropdown-content">
              {loggedIn && username ? (
                <>
                  <p>
                    <span className="mobile-user-icon">
                      <button className="user-icon">
                        {username[0].toUpperCase()}
                      </button>
                    </span>
                    {username}
                  </p>
                  {isMobile && (
                    <>
                      <Link to="/your-stories">
                        <button className="dropdown-button">Your Story</button>
                      </Link>
                      <button
                        className="dropdown-button"
                        onClick={toggleAddStory}
                      >
                        Add Story
                      </button>
                      <Link to="/bookmarks">
                        <button className="dropdown-button">
                          <img
                            src={BookmarkIcon}
                            alt="Bookmark"
                            className="dropdown-bookmark-icon"
                          />
                          Bookmarks
                        </button>
                      </Link>
                    </>
                  )}
                  <button
                    className="dropdown-button logout-button"
                    onClick={handleLogoutClick}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="dropdown-button" onClick={toggleLogin}>
                    Sign In
                  </button>
                  <button className="dropdown-button" onClick={toggleRegister}>
                    Register
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
