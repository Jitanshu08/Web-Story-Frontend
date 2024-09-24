import { useState, useEffect } from "react";
import axios from "axios";
import "../css/HomePage.css";
import StoryDetailsPage from "./StoryDetailPage"; // Import the StoryDetailsPage component

const HomePage = ({ isLoggedIn }) => {
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [stories, setStories] = useState({});
  const [yourStories, setYourStories] = useState([]); // User's stories state
  const [visibleStories, setVisibleStories] = useState({});
  const [visibleYourStories, setVisibleYourStories] = useState(4); // Limit for Your Stories display
  const [selectedStory, setSelectedStory] = useState(null); // State for selected story

  const categories = ["All", "Food", "Health and Fitness", "Travel", "Movie", "Education"];

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const fetchedStories = {};
        const initialVisibleStories = {};

        // Fetch stories for each category
        for (const category of categories.filter((cat) => cat !== "All")) {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/stories/category/${category}`
          );
          fetchedStories[category] = response.data; // Ensure the backend returns stories in the data field
          initialVisibleStories[category] = 4; // Initialize with 4 visible stories
        }

        setStories(fetchedStories);
        setVisibleStories(initialVisibleStories); // Set the visibleStories state with 4 stories per category
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    const fetchUserStories = async () => {
      if (isLoggedIn) {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const userStoriesResponse = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/stories/mystories`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setYourStories(userStoriesResponse.data); // Ensure the backend returns the stories array in data
          } catch (error) {
            if (error.response && error.response.status === 404) {
              setYourStories([]);
            } else {
              console.error("Error fetching user stories:", error);
            }
          }
        }
      }
    };

    fetchStories();

    if (isLoggedIn) {
      fetchUserStories(); // Re-fetch user stories when login state changes
    } else {
      setYourStories([]); // Reset user stories when logged out
    }
  }, [isLoggedIn]); // Dependency on isLoggedIn

  const toggleCategory = (category) => {
    if (category === "All") {
      setSelectedCategories(["All"]);
    } else {
      setSelectedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev.filter((c) => c !== "All"), category]
      );
    }
  };

  const handleSeeMore = (category) => {
    setVisibleStories((prev) => ({
      ...prev,
      [category]: stories[category]?.length || 4, // Update to show all stories for the category
    }));
  };

  const handleSeeMoreYourStories = () => {
    setVisibleYourStories(yourStories.length); // Show all user stories
  };

  return (
    <div className="home-page">
      {/* Category filter buttons */}
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${selectedCategories.includes(category) ? "selected" : ""}`}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Show Your Stories section if logged in */}
      {isLoggedIn && (
        <div className="user-stories-section">
          <h2>Your Stories</h2>
          {yourStories.length > 0 ? (
            <div className="stories-list">
              {yourStories.slice(0, visibleYourStories).map((story) => (
                <div 
                  key={story._id} 
                  className="story-card" 
                  onClick={() => setSelectedStory(story)} // Open the StoryDetailsPage when clicked
                >
                  <h3>{story.title}</h3>
                  <p>Category: {story.category}</p>
                </div>
              ))}
              {yourStories.length > 4 && visibleYourStories < yourStories.length && (
                <button className="see-more-button" onClick={handleSeeMoreYourStories}>
                  See More
                </button>
              )}
            </div>
          ) : (
            <p>No stories available</p> 
          )}
        </div>
      )}

      {/* Story sections */}
      <div className="stories-sections">
        {selectedCategories.includes("All")
          ? categories
              .filter((cat) => cat !== "All")
              .map((category) => (
                <div key={category} className="story-section">
                  <h2>{category}</h2>
                  {stories[category]?.length > 0 ? (
                    <div className="stories-list">
                      {stories[category]
                        ?.slice(0, visibleStories[category] || 4)
                        .map((story) => (
                          <div 
                            key={story._id} 
                            className="story-card" 
                            onClick={() => setSelectedStory(story)} // Open the StoryDetailsPage when clicked
                          >
                            <h3>{story.title}</h3>
                            <p>Category: {story.category}</p>
                          </div>
                        ))}
                      {stories[category]?.length > 4 && visibleStories[category] < stories[category].length && (
                        <button className="see-more-button" onClick={() => handleSeeMore(category)}>
                          See More
                        </button>
                      )}
                    </div>
                  ) : (
                    <p>No stories available</p>
                  )}
                </div>
              ))
          : selectedCategories.map((category) => (
              <div key={category} className="story-section">
                <h2>Top stories from {category}</h2>
                {stories[category]?.length > 0 ? (
                  <div className="stories-list">
                    {stories[category]
                      ?.slice(0, visibleStories[category] || 4)
                      .map((story) => (
                        <div 
                          key={story._id} 
                          className="story-card" 
                          onClick={() => setSelectedStory(story)} // Open the StoryDetailsPage when clicked
                        >
                          <h3>{story.title}</h3>
                          <p>Category: {story.category}</p>
                        </div>
                      ))}
                    {stories[category]?.length > 4 && visibleStories[category] < stories[category].length && (
                      <button className="see-more-button" onClick={() => handleSeeMore(category)}>
                        See More
                      </button>
                    )}
                  </div>
                ) : (
                  <p>No stories available</p>
                )}
              </div>
            ))}
      </div>

      {/* StoryDetailsPage Popup */}
      {selectedStory && (
        <StoryDetailsPage 
          story={selectedStory} 
          onClose={() => setSelectedStory(null)} // Close the popup
        />
      )}
    </div>
  );
};

export default HomePage;
