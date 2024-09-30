import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/YourStoriesPage.css"; // Custom CSS for the Your Stories Page
import EditIcon from "../assets/edit.png";

const YourStoriesPage = ({ isLoggedIn }) => {
  const [yourStories, setYourStories] = useState([]);
  const [visibleYourStories, setVisibleYourStories] = useState(4);
  const navigate = useNavigate();
  const videoRefs = useRef({});

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
            if (error.response && error.response.status === 404) {
              setYourStories([]);
            } else {
              console.error("Error fetching user stories:", error);
            }
          }
        }
      }
    };

    fetchUserStories();
  }, [isLoggedIn]);

  const handleEditStory = (storyId) => {
    navigate(`/edit-story/${storyId}`);
  };

  const handleSeeMoreYourStories = () => {
    setVisibleYourStories(yourStories.length);
  };

  const truncateText = (text, maxWords) => {
    if (!text) return "";
    return text.split(" ").slice(0, maxWords).join(" ") + "...";
  };

  return (
    <div className="your-stories-page">
      <h2>Your Stories</h2>
      {yourStories.length > 0 ? (
        <div className="your-stories-list">
          {yourStories.slice(0, visibleYourStories).map((story) => (
            <div
              key={story._id}
              className="your-story-card"
              onClick={() => handleEditStory(story._id)}
            >
              {story.slides[0] &&
                (story.slides[0].type === "video" ? (
                  <video
                    width="100%"
                    height="200px"
                    controls
                    ref={(el) => (videoRefs.current[story._id] = el)}
                  >
                    <source src={story.slides[0].content} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={story.slides[0].content}
                    alt="story preview"
                    width="100%"
                    height="200px"
                  />
                ))}
              <div className="your-story-text">
                <h3>{story.slides[0].heading}</h3>
                <p>{truncateText(story.slides[0].description, 10)}</p>
              </div>
              <button
                className="your-story-edit-button"
                onClick={() => handleEditStory(story._id)}
              >
                <img
                  className="your-story-edit-icon"
                  src={EditIcon}
                  alt="Edit"
                />
                Edit
              </button>
            </div>
          ))}
          {yourStories.length > visibleYourStories && (
            <div className="your-see-more-container">
              <button
                className="your-see-more-button"
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
  );
};

export default YourStoriesPage;
