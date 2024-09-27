import { Link } from "react-router-dom";
import "../css/Navbar.css";
import { useState, useEffect } from "react";
import axios from "axios";

const Navbar = ({
  toggleLogin,
  toggleRegister,
  toggleAddStory,
  loggedIn,
  handleLogout,
}) => {
  const [username, setUsername] = useState(null); // Default to null instead of empty string
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
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
            setUsername(null); // Reset username on error
          });
      }
    } else {
      setUsername(null); // Reset the username if the user is logged out
    }
  }, [loggedIn]);

  const handleLogoutClick = () => {
    handleLogout();
    setDropdownOpen(false); // Close the dropdown on logout
    setUsername(null); // Clear the username on logout
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen); // Toggle the dropdown state
  };

  return (
    <nav className="navbar">
      <h1>Story Platform</h1>
      <div className="navbar-buttons">
        {loggedIn && username ? (
          <>
            <Link to="/bookmarks">
              <button className="navbar-button">Bookmarks</button>
            </Link>
            <button className="navbar-button" onClick={toggleAddStory}>
              Add Story
            </button>
            <div className="user-menu">
              <button className="user-icon">
                {username[0].toUpperCase()}{" "}
                {/* Show the first letter of the username */}
              </button>
              <button className="hamburger-icon" onClick={toggleDropdown}>
                &#9776;
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
            <button className="navbar-button" onClick={toggleRegister}>
              Register
            </button>
            <button className="navbar-button" onClick={toggleLogin}>
              Sign In
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
