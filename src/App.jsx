import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AddStoryPage from "./pages/AddStoryPage";
import BookmarksPage from "./pages/BookmarksPage";
import EditStoryPage from "./pages/EditStoryPage";
import StoryDetailsPage from "./pages/StoryDetailPage";
import YourStoriesPage from "./components/YourStoriesPage";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAddStory, setShowAddStory] = useState(false);
  const [showEditStory, setShowEditStory] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Get the current location to track when to show StoryDetailsPage as a popup
  const location = useLocation();
  const background = location.state && location.state.background;  // Tracks if we're rendering the story details as a modal

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
    setShowRegister(false);
    setShowAddStory(false);
    setShowEditStory(null);
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
    setShowLogin(false);
    setShowAddStory(false);
    setShowEditStory(null);
  };

  const toggleAddStory = () => {
    setShowAddStory(!showAddStory);
    setShowLogin(false);
    setShowRegister(false);
    setShowEditStory(null);
  };

  const openEditStory = (storyId) => {
    setShowEditStory(storyId);
    setShowAddStory(false);
    setShowLogin(false);
    setShowRegister(false);
  };

  const closeEditStory = () => {
    setShowEditStory(null);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar
        toggleLogin={toggleLogin}
        toggleRegister={toggleRegister}
        toggleAddStory={toggleAddStory}
        loggedIn={isLoggedIn}
        handleLogout={handleLogout}
      />
      
      {/* Main Routes */}
      <Routes location={background || location}> 
        {/* Homepage */}
        <Route
          path="/"
          element={<HomePage isLoggedIn={isLoggedIn} openEditStory={openEditStory} />}
        />

        {/* Add Story */}
        <Route
          path="/add-story"
          element={<HomePage isLoggedIn={isLoggedIn} openEditStory={openEditStory} />}
        />

        {/* Bookmarks */}
        <Route
          path="/bookmarks"
          element={isLoggedIn ? <BookmarksPage /> : <HomePage isLoggedIn={isLoggedIn} openEditStory={openEditStory} />}
        />

        {/* Edit Story */}
        <Route
          path="/edit-story/:id"
          element={isLoggedIn ? <EditStoryPage /> : <HomePage />}
        />

        {/* Your Stories */}
        <Route
          path="/your-stories"
          element={<YourStoriesPage isLoggedIn={isLoggedIn} openEditStory={openEditStory} />}
        />

        {/* Story Details (full page if no background) */}
        {!background && (
          <Route
            path="/stories/:id"
            element={<StoryDetailsPage />}
          />
        )}
      </Routes>

      {/* Popup route for Story Details */}
      {background && (
        <Routes>
          <Route
            path="/stories/:id"
            element={<StoryDetailsPage />}
          />
        </Routes>
      )}

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

      {/* Conditionally show the Add Story Popup */}
      {showAddStory && (
        <div className="overlay">
          <AddStoryPage closePopup={toggleAddStory} />
        </div>
      )}

      {/* Conditionally show the Edit Story Popup */}
      {showEditStory && (
        <div className="overlay">
          <EditStoryPage closePopup={closeEditStory} storyId={showEditStory} />
        </div>
      )}
    </div>
  );
}

export default App;
