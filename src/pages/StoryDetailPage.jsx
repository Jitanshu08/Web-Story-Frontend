import { useState, useEffect } from "react";
import axios from "axios";
import "../css/StoryDetailsPage.css"; // Add necessary styling for the popup

const StoryDetailsPage = ({ story, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [timer, setTimer] = useState(null);
  const [likesCount, setLikesCount] = useState(story.slides.map(slide => slide.likes.length));
  const [isLiked, setIsLiked] = useState(story.slides.map(slide => false)); // To track likes for each slide
  const [isBookmarked, setIsBookmarked] = useState(false); // Track bookmark status

  useEffect(() => {
    // Check if the user has bookmarked this story on mount
    const checkBookmarkStatus = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/stories/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookmarkedStories = response.data;
        setIsBookmarked(bookmarkedStories.some(bookmarkedStory => bookmarkedStory._id === story._id));
      } catch (error) {
        console.error("Error fetching bookmark status", error);
      }
    };

    checkBookmarkStatus();
  }, [story._id]);

  useEffect(() => {
    // Clear the previous timer
    clearTimeout(timer);

    // Set a new timer to auto-skip after 45 seconds
    const newTimer = setTimeout(() => {
      if (currentSlideIndex < story.slides.length - 1) {
        setCurrentSlideIndex((prev) => prev + 1);
      }
    }, 45000);

    setTimer(newTimer);

    return () => clearTimeout(newTimer); // Clear the timer on cleanup
  }, [currentSlideIndex, story.slides.length]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev < story.slides.length - 1 ? prev + 1 : prev
    );
  };

  const previousSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const currentSlide = story.slides[currentSlideIndex];

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

  const handleLikeSlide = async (slideId, index) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/stories/like/${story._id}/${slideId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLikesCount((prev) => {
        const newLikesCount = [...prev];
        newLikesCount[index] = response.data.likes;
        return newLikesCount;
      });

      setIsLiked((prev) => {
        const newIsLiked = [...prev];
        newIsLiked[index] = !newIsLiked[index];
        return newIsLiked;
      });
    } catch (error) {
      console.error("Error liking slide", error);
    }
  };

  const handleBookmarkStory = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/stories/bookmark/${story._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error bookmarking story", error);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <div className="slide-content">
          <h3>{story.title}</h3>
          <p>Category: {story.category}</p>
          <p>Description: {currentSlide.description}</p>

          <div className="media-container">
            {currentSlide.type === "video" ? (
              isYouTubeVideo(currentSlide.content) ? (
                <iframe
                  width="257"
                  height="257"
                  src={getYouTubeEmbedUrl(currentSlide.content)}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  controls
                  onTimeUpdate={handleVideoTimeUpdate}
                  width="257"
                  height="257"
                >
                  <source src={currentSlide.content} type="video/mp4" />
                </video>
              )
            ) : (
              <img
                src={currentSlide.content}
                alt="slide"
                width="257"
                height="257"
              />
            )}
          </div>

          <div className="actions-container">
            <button
              className={`like-button ${isLiked[currentSlideIndex] ? 'liked' : ''}`}
              onClick={() => handleLikeSlide(currentSlide._id, currentSlideIndex)}
            >
              {isLiked[currentSlideIndex] ? 'Unlike' : 'Like'} ({likesCount[currentSlideIndex]})
            </button>

            <button
              className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmarkStory}
            >
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>
        </div>

        <div className="navigation-buttons">
          <button onClick={previousSlide} disabled={currentSlideIndex === 0}>
            Previous
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === story.slides.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailsPage;
