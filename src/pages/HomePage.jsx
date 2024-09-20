import { useState, useEffect } from "react";
import "../css/HomePage.css";
import axios from "axios";

const HomePage = () => {
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [stories, setStories] = useState({}); // Store stories by category
  const [visibleStories, setVisibleStories] = useState({}); // Tracks how many stories are visible for each category

  const categories = ["All", "Food", "Health and Fitness", "Travel", "Movie", "Education"];

  // Fetch stories based on selected categories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const fetchedStories = {};
        const initialVisibleStories = {};
        if (selectedCategories.includes("All")) {
          for (const category of categories.filter(cat => cat !== "All")) {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/stories?category=${category}`);
            fetchedStories[category] = response.data.stories;
            initialVisibleStories[category] = 4; // Initially show 4 stories
          }
        } else {
          for (const category of selectedCategories) {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/stories?category=${category}`);
            fetchedStories[category] = response.data.stories;
            initialVisibleStories[category] = 4; // Initially show 4 stories
          }
        }
        setStories(fetchedStories);
        setVisibleStories(initialVisibleStories);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, [selectedCategories]);

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
      [category]: stories[category].length // Show all remaining stories
    }));
  };

  return (
    <div className="home-page">
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${
              selectedCategories.includes(category) ? "selected" : ""
            }`}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="stories-sections">
        {selectedCategories.includes("All")
          ? categories.filter((cat) => cat !== "All").map((category) => (
              <div key={category} className="story-section">
                <h2>{category}</h2>
                <div className="stories-list">
                  {stories[category]?.slice(0, visibleStories[category] || 4).map((story) => (
                    <div key={story._id} className="story-card">
                      <h3>{story.title}</h3>
                      <p>Category: {story.category}</p>
                    </div>
                  ))}
                </div>
                {stories[category]?.length > 4 && visibleStories[category] < stories[category].length && (
                  <button className="see-more-button" onClick={() => handleSeeMore(category)}>
                    See More
                  </button>
                )}
              </div>
            ))
          : selectedCategories.map((category) => (
              <div key={category} className="story-section">
                <h2>Top stories from {category}</h2>
                <div className="stories-list">
                  {stories[category]?.slice(0, visibleStories[category] || 4).map((story) => (
                    <div key={story._id} className="story-card">
                      <h3>{story.title}</h3>
                      <p>Category: {story.category}</p>
                    </div>
                  ))}
                </div>
                {stories[category]?.length > 4 && visibleStories[category] < stories[category].length && (
                  <button className="see-more-button" onClick={() => handleSeeMore(category)}>
                    See More
                  </button>
                )}
              </div>
            ))}
      </div>
    </div>
  );
};

export default HomePage;
