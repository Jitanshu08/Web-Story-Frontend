import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../css/BookmarksPage.css";
import StoryDetailsPage from "./StoryDetailPage"; // Import the StoryDetailsPage component

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]); // Default to an empty array
  const [error, setError] = useState(""); // Add error state
  const [selectedStory, setSelectedStory] = useState(null); // State for selected story
  const videoRefs = useRef({}); // For video controls

  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated");
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/stories/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Check if response data contains bookmarks
        if (response.data && response.data.length > 0) {
          setBookmarks(response.data); // Assuming the response is an array of bookmarked stories
        } else {
          setBookmarks([]); // Ensure that we have an empty array if no bookmarks
        }
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setError("Failed to fetch bookmarks");
      }
    };

    fetchBookmarks();
  }, []);

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
      e.target.pause(); // Pause the video after 30 seconds
    }
  };

  return (
    <div className="bookmarks-page">
      <h2>Your Bookmarks</h2>
      {error && <p className="error-message">{error}</p>} {/* Display error if it exists */}
      {bookmarks.length > 0 ? (
        <div className="bookmarks-list">
          {bookmarks.map((story) => (
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
                      <source src={story.slides[0].content} type="video/mp4" />
                    </video>
                  )
                ) : (
                  <img src={story.slides[0].content} alt="slide preview" width="200" />
                ))}
            </div>
          ))}
        </div>
      ) : (
        !error && <p>No bookmarks yet.</p> // Only show "No bookmarks" if there's no error
      )}

      {/* StoryDetailsPage Popup */}
      {selectedStory && (
        <StoryDetailsPage story={selectedStory} onClose={() => setSelectedStory(null)} />
      )}
    </div>
  );
};

export default BookmarksPage;
