import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react"; // Add useEffect
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AddStoryPage from "./pages/AddStoryPage"; // Import Add Story Page
import BookmarksPage from "./pages/BookmarksPage"; // Import Bookmarks Page

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true); // Set logged in state if token exists
    }
  }, []);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
    setShowRegister(false); // Ensure registration popup is closed when login opens
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
    setShowLogin(false); // Ensure login popup is closed when registration opens
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // Set logged in state after login
    setShowLogin(false); // Close the login popup after successful login
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false); // Set logged out state
  };

  return (
    <Router>
      {/* Wrap everything inside a container for dark overlay */}
      <div className={showLogin || showRegister ? "darkened" : ""}>
        <Navbar
          toggleLogin={toggleLogin}
          toggleRegister={toggleRegister}
          loggedIn={isLoggedIn}
          handleLogout={handleLogout}
        />
        <Routes>
          {/* Pass isLoggedIn to HomePage to trigger re-render */}
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
          <Route path="/add-story" element={isLoggedIn ? <AddStoryPage /> : <HomePage />} /> {/* Route for Add Story */}
          <Route path="/bookmarks" element={isLoggedIn ? <BookmarksPage /> : <HomePage />} /> {/* Route for Bookmarks */}
        </Routes>
      </div>

      {/* Conditionally show the Login Popup */}
      {showLogin && (
        <div className="overlay">
          <LoginPage closePopup={toggleLogin} onLoginSuccess={handleLoginSuccess} />
        </div>
      )}

      {/* Conditionally show the Register Popup */}
      {showRegister && (
        <div className="overlay">
          <RegisterPage closePopup={toggleRegister} openLoginPopup={toggleLogin} />
        </div>
      )}
    </Router>
  );
}

export default App;
