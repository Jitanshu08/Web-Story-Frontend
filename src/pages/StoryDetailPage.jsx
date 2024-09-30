import { useState, useEffect } from "react";
import axios from "axios";
import "../css/StoryDetailsPage.css"; // Add necessary styling for the popup
import CrossIcon from "../assets/cross.png"; // Import the cross icon
import SendIcon from "../assets/send.png"; // Import the send/share icon
import NextIcon from "../assets/next.png"; // Import the next icon
import PreviousIcon from "../assets/previous.png"; // Import the previous icon
import BookmarkIcon from "../assets/bookmark.png"; // Import bookmark icon
import BookmarkedIcon from "../assets/bookmarked.png"; // Import bookmarked icon
import LikeIcon from "../assets/like.png"; // Import like icon
import LikedIcon from "../assets/liked.png"; // Import liked icon

const StoryDetailsPage = ({ story, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [timer, setTimer] = useState(null);
  const [likesCount, setLikesCount] = useState(
    story.slides.map((slide) => slide.likes.length)
  );
  const [isLiked, setIsLiked] = useState(story.slides.map((slide) => false)); // To track likes for each slide
  const [isBookmarked, setIsBookmarked] = useState(false); // Track bookmark status
  const [isLoading, setIsLoading] = useState(true); // Loading state for media

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/stories/bookmarks`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const bookmarkedStories = response.data;
        setIsBookmarked(
          bookmarkedStories.some(
            (bookmarkedStory) => bookmarkedStory._id === story._id
          )
        );
      } catch (error) {
        console.error("Error fetching bookmark status", error);
      }
    };

    checkBookmarkStatus();
  }, [story._id]);

  useEffect(() => {
    clearTimeout(timer);

    const newTimer = setTimeout(() => {
      if (currentSlideIndex < story.slides.length - 1) {
        setCurrentSlideIndex((prev) => prev + 1);
      }
    }, 45000); // Adjust the timer as per the required duration

    setTimer(newTimer);

    return () => clearTimeout(newTimer);
  }, [currentSlideIndex, story.slides.length]);

  const nextSlide = () => {
    setIsLoading(true);
    setCurrentSlideIndex((prev) =>
      prev < story.slides.length - 1 ? prev + 1 : prev
    );
  };

  const previousSlide = () => {
    setIsLoading(true);
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

  const handleLikeSlide = async (slideId, index) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/like/${story._id}/${slideId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/bookmark/${story._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error bookmarking story", error);
    }
  };

  const handleShareStory = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/share/${story._id}`
      );
      const { link } = response.data;
      navigator.clipboard.writeText(link);
      alert("Story link copied to clipboard!");
    } catch (error) {
      console.error("Error sharing story", error);
    }
  };

  const handleMediaLoad = () => {
    setIsLoading(false); // Set loading to false once media is loaded
  };

  return (
    <div className="story-popup-overlay">
      <div className="story-popup-content">
        {/* Progress bars */}
        <div className="story-progress-bar-container">
          {story.slides.map((_, index) => (
            <div
              key={index}
              className={`story-progress-bar ${index === currentSlideIndex ? "active" : ""}`}
            ></div>
          ))}
        </div>

        <div className="story-header-icons">
          <img
            src={CrossIcon}
            alt="Close"
            className="story-close-button"
            onClick={onClose}
          />
          <img
            src={SendIcon}
            alt="Send"
            className="story-send-button"
            onClick={handleShareStory}
          />
        </div>

        <div className="story-media-container">
          {isLoading && <div className="story-loading-spinner">Loading...</div>}
          {currentSlide.type === "video" ? (
            isYouTubeVideo(currentSlide.content) ? (
              <iframe
                src={getYouTubeEmbedUrl(currentSlide.content)}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleMediaLoad}
              ></iframe>
            ) : (
              <video
                controls
                onLoadedMetadata={handleMediaLoad}
              >
                <source src={currentSlide.content} type="video/mp4" />
              </video>
            )
          ) : (
            <img
              src={currentSlide.content}
              alt="slide"
              onLoad={handleMediaLoad}
            />
          )}
        </div>

        <div className="story-text-overlay">
          <h3 className="story-heading">{currentSlide.heading}</h3>
          <p className="story-description">{currentSlide.description}</p>
        </div>

        <div className="story-footer-icons">
          <div className="story-bookmark-container">
            <img
              src={isBookmarked ? BookmarkedIcon : BookmarkIcon}
              alt="Bookmark"
              className="story-bookmark-icon"
              onClick={handleBookmarkStory}
            />
          </div>
          <div className="story-like-container">
            <img
              src={isLiked[currentSlideIndex] ? LikedIcon : LikeIcon}
              alt="Like"
              className="story-like-icon"
              onClick={() => handleLikeSlide(currentSlide._id, currentSlideIndex)}
            />
            <span className="story-like-count">{likesCount[currentSlideIndex]}</span>
          </div>
        </div>

        <img
          src={PreviousIcon}
          alt="Previous"
          className="story-previous-button"
          onClick={previousSlide}
        />
        <img
          src={NextIcon}
          alt="Next"
          className="story-next-button"
          onClick={nextSlide}
        />
      </div>
    </div>
  );
};

export default StoryDetailsPage;
