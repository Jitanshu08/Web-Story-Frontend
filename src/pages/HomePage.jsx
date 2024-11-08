import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/HomePage.css";

// Import images for categories
import allImage from "../assets/all.png";
import foodImage from "../assets/Food.png";
import healthImage from "../assets/medical.png";
import travelImage from "../assets/travel.png";
import movieImage from "../assets/world.png";
import educationImage from "../assets/education.jpg";
import EditIcon from "../assets/Edit.png";

const HomePage = ({ isLoggedIn, openEditStory }) => {
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [stories, setStories] = useState({});
  const [yourStories, setYourStories] = useState([]);
  const [visibleStories, setVisibleStories] = useState({});
  const [visibleYourStories, setVisibleYourStories] = useState(4);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const videoRefs = useRef({});
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resize to detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);

    // Initial check on page load
    setIsMobile(window.innerWidth <= 768);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

    fetchStories();
  }, []);

  useEffect(() => {
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
            console.error("Error fetching user stories:", error);
            if (error.response && error.response.status === 404) {
              // If the user has no stories (404), clear the stories
              setYourStories([]);
            } else if (error.response && error.response.status === 401) {
              // Clear stories if unauthorized
              setYourStories([]);
            }
          }
        }
      } else {
        setYourStories([]); // Clear stories if not logged in
      }
    };

    if (isLoggedIn) {
      fetchUserStories(); // Fetch stories only if the user is logged in
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

  const truncateText = (text, maxWords) => {
    if (!text) return "";
    return text.split(" ").slice(0, maxWords).join(" ") + "...";
  };

  const handleEditStory = (storyId) => {
    openEditStory(storyId); // open the edit story popup
  };

  const handleStoryClick = (story) => {
    // Redirect to story details page and preserve background for modal rendering
    navigate(`/stories/${story._id}`, { state: { background: location } });
  };

  return (
    <div className="home-page">
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

      {isLoggedIn && !isMobile && (
        <div className="user-stories-section">
          <h2>Your Stories</h2>
          {yourStories.length > 0 ? (
            <div className="stories-list">
              {yourStories.slice(0, visibleYourStories).map((story) => (
                <div
                  key={story._id}
                  className="story-card"
                  onClick={() => handleStoryClick(story)}
                >
                  {story.slides[0] &&
                    (story.slides[0].type === "video" ? (
                      isYouTubeVideo(story.slides[0].content) ? (
                        <iframe
                          width="100%"
                          height="200px"
                          src={getYouTubeEmbedUrl(story.slides[0].content)}
                          title="YouTube video preview"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <video
                          width="100%"
                          height="200px"
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
                        width="100%"
                        height="200px"
                      />
                    ))}

                  <div className="home-story-text-overlay">
                    {story.slides[0].heading && (
                      <h3>{story.slides[0].heading}</h3>
                    )}
                    {story.slides[0].description && (
                      <p>{truncateText(story.slides[0].description, 8)}</p>
                    )}
                  </div>

                  <button
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStory(story._id);
                    }}
                  >
                    <img
                      className="edit-button-icon"
                      src={EditIcon}
                      alt="Edit"
                    />
                    Edit
                  </button>
                </div>
              ))}
              {yourStories.length > 4 &&
                visibleYourStories < yourStories.length && (
                  <div className="see-more-container">
                    <button
                      className="see-more-button"
                      onClick={handleSeeMoreYourStories}
                    >
                      See More
                    </button>
                  </div>
                )}
            </div>
          ) : (
            <p>No stories available</p>
          )}
        </div>
      )}

      <div className="stories-sections">
        {selectedCategories.includes("All")
          ? categories
              .filter((cat) => cat.name !== "All")
              .map((category) => (
                <div key={category.name} className="story-section">
                  <h2>Top Stories About {category.name}</h2>
                  {stories[category.name]?.length > 0 ? (
                    <div className="stories-list">
                      {stories[category.name]
                        ?.slice(0, visibleStories[category.name] || 4)
                        .map((story) => (
                          <div
                            key={story._id}
                            className="story-card"
                            onClick={() => handleStoryClick(story)}
                          >
                            {story.slides[0] &&
                              (story.slides[0].type === "video" ? (
                                isYouTubeVideo(story.slides[0].content) ? (
                                  <iframe
                                    width="100%"
                                    height="200px"
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
                                    width="100%"
                                    height="200px"
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
                                  width="100%"
                                  height="200px"
                                />
                              ))}

                            <div className="home-story-text-overlay">
                              {story.slides[0].heading && (
                                <h3>{story.slides[0].heading}</h3>
                              )}
                              {story.slides[0].description && (
                                <p>
                                  {truncateText(story.slides[0].description, 8)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      {stories[category.name]?.length > 4 &&
                        visibleStories[category.name] <
                          stories[category.name].length && (
                          <div className="see-more-container">
                            <button
                              className="see-more-button"
                              onClick={() => handleSeeMore(category.name)}
                            >
                              See More
                            </button>
                          </div>
                        )}
                    </div>
                  ) : (
                    <p>No stories available</p>
                  )}
                </div>
              ))
          : selectedCategories.map((category) => (
              <div key={category} className="story-section">
                <h2>Top Stories About {category}</h2>
                {stories[category]?.length > 0 ? (
                  <div className="stories-list">
                    {stories[category]
                      ?.slice(0, visibleStories[category] || 4)
                      .map((story) => (
                        <div
                          key={story._id}
                          className="story-card"
                          onClick={() => handleStoryClick(story)}
                        >
                          {story.slides[0] &&
                            (story.slides[0].type === "video" ? (
                              isYouTubeVideo(story.slides[0].content) ? (
                                <iframe
                                  width="100%"
                                  height="200px"
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
                                  width="100%"
                                  height="200px"
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
                                width="100%"
                                height="200px"
                              />
                            ))}

                          <div className="home-story-text-overlay">
                            {story.slides[0].heading && (
                              <h3>{story.slides[0].heading}</h3>
                            )}
                            {story.slides[0].description && (
                              <p>
                                {truncateText(story.slides[0].description, 8)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    {stories[category]?.length > 4 &&
                      visibleStories[category] < stories[category].length && (
                        <div className="see-more-container">
                          <button
                            className="see-more-button"
                            onClick={() => handleSeeMore(category.name)}
                          >
                            See More
                          </button>
                        </div>
                      )}
                  </div>
                ) : (
                  <p>No stories available</p>
                )}
              </div>
            ))}
      </div>
    </div>
  );
};

export default HomePage;
