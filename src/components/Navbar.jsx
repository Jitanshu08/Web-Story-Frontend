import { Link } from "react-router-dom";
import "../css/Navbar.css"; // Navbar CSS
import { useState, useEffect } from "react";
import axios from "axios";

const Navbar = ({ toggleLogin, toggleRegister, loggedIn, handleLogout }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(loggedIn || false);
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false); // Add state for dropdown

  useEffect(() => {
    setIsLoggedIn(loggedIn); // Update based on the loggedIn prop from App

    if (loggedIn) {
      const token = localStorage.getItem("token");
      if (token) {
        // Fetch the user info from the backend
        axios
          .get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setUsername(response.data.username); // Set the username from the response
          })
          .catch(() => {
            setIsLoggedIn(false); // In case of error, mark as not logged in
          });
      }
    } else {
      setUsername(""); // Reset the username if the user is logged out
    }
  }, [loggedIn]); // Depend on loggedIn state to reflect changes

  const handleLogoutClick = () => {
    handleLogout(); // Call the logout handler from App.jsx
    setDropdownOpen(false); // Close the dropdown on logout
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen); // Toggle the dropdown state
  };

  return (
    <nav className="navbar">
      <h1>Story Platform</h1>
      <div className="navbar-buttons">
        {isLoggedIn ? (
          <>
            <Link to="/bookmarks">
              <button className="navbar-button">Bookmarks</button>
            </Link>
            <Link to="/add-story">
              <button className="navbar-button">Add Story</button>
            </Link>
            <div className="user-menu">
              <button className="user-icon">
                {username ? username[0].toUpperCase() : "U"} {/* Default to "U" if username is not available */}
              </button>
              <button className="hamburger-icon" onClick={toggleDropdown}>
                &#9776; {/* HTML symbol for three horizontal lines */}
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  <p>{username}</p>
                  <button className="logout-button" onClick={handleLogoutClick}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button className="navbar-button" onClick={toggleRegister}>Register</button>
            <button className="navbar-button" onClick={toggleLogin}>Sign In</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
