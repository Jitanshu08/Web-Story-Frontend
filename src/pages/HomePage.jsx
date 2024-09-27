import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/HomePage.css";
import StoryDetailsPage from "./StoryDetailPage"; // Import the StoryDetailsPage component

// Import images for categories
import allImage from "../assets/all.png";
import foodImage from "../assets/Food.png";
import healthImage from "../assets/medical.png";
import travelImage from "../assets/travel.png";
import movieImage from "../assets/world.png";
import educationImage from "../assets/education.jpg";

const HomePage = ({ isLoggedIn }) => {
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [stories, setStories] = useState({});
  const [yourStories, setYourStories] = useState([]);
  const [visibleStories, setVisibleStories] = useState({});
  const [visibleYourStories, setVisibleYourStories] = useState(4);
  const [selectedStory, setSelectedStory] = useState(null); // State for selected story (for modal)
  const videoRefs = useRef({});
  const navigate = useNavigate(); // Initialize useNavigate

  const categories = [
    { name: "All", image: allImage },
    { name: "Food", image: foodImage },
    { name: "Health and Fitness", image: healthImage },
    { name: "Travel", image: travelImage },
    { name: "Movie", image: movieImage },
    { name: "Education", image: educationImage },
  ];

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const fetchedStories = {};
        const initialVisibleStories = {};

        for (const category of categories.filter((cat) => cat.name !== "All")) {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/stories/category/${
              category.name
            }`
          );
          fetchedStories[category.name] = response.data;
          initialVisibleStories[category.name] = 4;
        }

        setStories(fetchedStories);
        setVisibleStories(initialVisibleStories);
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
            setYourStories(userStoriesResponse.data);
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
      fetchUserStories();
    } else {
      setYourStories([]);
    }
  }, [isLoggedIn]);

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
      [category]: stories[category]?.length || 4,
    }));
  };

  const handleSeeMoreYourStories = () => {
    setVisibleYourStories(yourStories.length);
  };

  const isYouTubeVideo = (url) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url) => {
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    } else if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "www.youtube.com/embed/");
    }
    return url;
  };

  const handleVideoTimeUpdate = (e) => {
    if (e.target.currentTime >= 30) {
      e.target.pause();
    }
  };

  const handleEditStory = (storyId) => {
    navigate(`/edit-story/${storyId}`); // Navigate to the Edit Story page
  };

  return (
    <div className="home-page">
      {/* Category filter buttons */}
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`category-button ${
              selectedCategories.includes(category.name) ? "selected" : ""
            }`}
            onClick={() => toggleCategory(category.name)}
          >
            <span>{category.name}</span>
            <img
              src={category.image}
              alt={category.name}
              className="category-image"
            />
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
                  {/* Display the first slide preview */}
                  {story.slides[0] &&
                    (story.slides[0].type === "video" ? (
                      isYouTubeVideo(story.slides[0].content) ? (
                        <iframe
                          width="200"
                          height="150"
                          src={getYouTubeEmbedUrl(story.slides[0].content)}
                          title="YouTube video preview"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <video
                          width="200"
                          controls
                          ref={(el) => (videoRefs.current[story._id] = el)}
                          onTimeUpdate={handleVideoTimeUpdate}
                        >
                          <source
                            src={story.slides[0].content}
                            type="video/mp4"
                          />
                        </video>
                      )
                    ) : (
                      <img
                        src={story.slides[0].content}
                        alt="slide preview"
                        width="200"
                      />
                    ))}

                  {/* Edit button for user stories */}
                  <button
                    className="edit-button"
                    onClick={() => handleEditStory(story._id)}
                  >
                    Edit
                  </button>
                </div>
              ))}
              {yourStories.length > 4 &&
                visibleYourStories < yourStories.length && (
                  <button
                    className="see-more-button"
                    onClick={handleSeeMoreYourStories}
                  >
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
              .filter((cat) => cat.name !== "All")
              .map((category) => (
                <div key={category.name} className="story-section">
                  <h2>{category.name}</h2>
                  {stories[category.name]?.length > 0 ? (
                    <div className="stories-list">
                      {stories[category.name]
                        ?.slice(0, visibleStories[category.name] || 4)
                        .map((story) => (
                          <div
                            key={story._id}
                            className="story-card"
                            onClick={() => setSelectedStory(story)} // Open the StoryDetailsPage when clicked
                          >
                            <h3>{story.title}</h3>
                            <p>Category: {story.category}</p>
                            {story.slides[0] &&
                              (story.slides[0].type === "video" ? (
                                isYouTubeVideo(story.slides[0].content) ? (
                                  <iframe
                                    width="200"
                                    height="150"
                                    src={getYouTubeEmbedUrl(
                                      story.slides[0].content
                                    )}
                                    title="YouTube video preview"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                ) : (
                                  <video
                                    width="200"
                                    controls
                                    ref={(el) =>
                                      (videoRefs.current[story._id] = el)
                                    }
                                    onTimeUpdate={handleVideoTimeUpdate}
                                  >
                                    <source
                                      src={story.slides[0].content}
                                      type="video/mp4"
                                    />
                                  </video>
                                )
                              ) : (
                                <img
                                  src={story.slides[0].content}
                                  alt="slide preview"
                                  width="200"
                                />
                              ))}
                          </div>
                        ))}
                      {stories[category.name]?.length > 4 &&
                        visibleStories[category.name] <
                          stories[category.name].length && (
                          <button
                            className="see-more-button"
                            onClick={() => handleSeeMore(category.name)}
                          >
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
                          {story.slides[0] &&
                            (story.slides[0].type === "video" ? (
                              isYouTubeVideo(story.slides[0].content) ? (
                                <iframe
                                  width="200"
                                  height="150"
                                  src={getYouTubeEmbedUrl(
                                    story.slides[0].content
                                  )}
                                  title="YouTube video preview"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              ) : (
                                <video
                                  width="200"
                                  controls
                                  ref={(el) =>
                                    (videoRefs.current[story._id] = el)
                                  }
                                  onTimeUpdate={handleVideoTimeUpdate}
                                >
                                  <source
                                    src={story.slides[0].content}
                                    type="video/mp4"
                                  />
                                </video>
                              )
                            ) : (
                              <img
                                src={story.slides[0].content}
                                alt="slide preview"
                                width="200"
                              />
                            ))}
                        </div>
                      ))}
                    {stories[category]?.length > 4 &&
                      visibleStories[category] < stories[category].length && (
                        <button
                          className="see-more-button"
                          onClick={() => handleSeeMore(category)}
                        >
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
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
