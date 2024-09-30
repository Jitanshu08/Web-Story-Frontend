import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AddStoryPage from "./pages/AddStoryPage"; // Import Add Story Page
import BookmarksPage from "./pages/BookmarksPage"; // Import Bookmarks Page
import EditStoryPage from "./pages/EditStoryPage";
import YourStoriesPage from "./components/YourStoriesPage";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAddStory, setShowAddStory] = useState(false); // State to control Add Story popup
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
    setShowAddStory(false); // Ensure Add Story popup is closed
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
    setShowLogin(false); // Ensure login popup is closed when registration opens
    setShowAddStory(false); // Ensure Add Story popup is closed
  };

  const toggleAddStory = () => {
    setShowAddStory(!showAddStory); // Toggle the Add Story popup
    setShowLogin(false); // Ensure login popup is closed when Add Story opens
    setShowRegister(false); // Ensure registration popup is closed
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

      <Navbar
        toggleLogin={toggleLogin}
        toggleRegister={toggleRegister}
        toggleAddStory={toggleAddStory} // Add toggle for Add Story
        loggedIn={isLoggedIn}
        handleLogout={handleLogout}
      />
      <Routes>
        {/* Pass isLoggedIn to HomePage to trigger re-render */}
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
        <Route
          path="/add-story"
          element={
            isLoggedIn ? <HomePage isLoggedIn={isLoggedIn} /> : <HomePage />
          }
        />{" "}
        {/* Redirect if Add Story */}
        <Route
          path="/bookmarks"
          element={isLoggedIn ? <BookmarksPage /> : <HomePage />}
        />{" "}
        {/* Route for Bookmarks */}
        <Route
          path="/edit-story/:id"
          element={isLoggedIn ? <EditStoryPage /> : <HomePage />}
        />
        <Route path="/your-stories" element={<YourStoriesPage isLoggedIn={isLoggedIn} />} />
      </Routes>

      {/* Conditionally show the Login Popup */}
      {showLogin && (
        <div className="overlay">
          <LoginPage
            closePopup={toggleLogin}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      )}

      {/* Conditionally show the Register Popup */}
      {showRegister && (
        <div className="overlay">
          <RegisterPage
            closePopup={toggleRegister}
            openLoginPopup={toggleLogin}
          />
        </div>
      )}

      {/* Conditionally show the Add Story Popup */}
      {showAddStory && (
        <div className="overlay">
          <AddStoryPage closePopup={toggleAddStory} />{" "}
          {/* Pass closePopup to AddStoryPage */}
        </div>
      )}
    </Router>
  );
}

export default App;
