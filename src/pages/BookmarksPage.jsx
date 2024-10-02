import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../css/BookmarksPage.css";
import StoryDetailsPage from "./StoryDetailPage"; 

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]); // Default to an empty array
  const [selectedStory, setSelectedStory] = useState(null); 
  const videoRefs = useRef({});

  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return; // An error message can be set here
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/stories/bookmarks`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.length > 0) {
          setBookmarks(response.data);
        } else {
          setBookmarks([]); // Empty state when no bookmarks
        }
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
      }
    };

    fetchBookmarks();
  }, []);

  const truncateText = (text, maxWords) => {
    if (!text) return "";
    return text.split(" ").slice(0, maxWords).join(" ") + "...";
  };

  return (
    <div className="bookmarks-page">
      <h2>Your Bookmarks</h2>
      {bookmarks.length > 0 ? (
        <div className="bookmarks-list">
          {bookmarks.map((story) => (
            <div
              key={story._id}
              className="bookmark-card"
              onClick={() => setSelectedStory(story)} // Open the StoryDetailsPage when clicked
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
              <div className="bookmark-card-text">
                <h3>{story.slides[0].heading}</h3>
                <p>{truncateText(story.slides[0].description, 10)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No bookmarks available</p> 
      )}

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

export default BookmarksPage;
