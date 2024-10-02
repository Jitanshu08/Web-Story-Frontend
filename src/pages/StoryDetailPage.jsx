import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Use useParams to get the story ID from the URL
import "../css/StoryDetailsPage.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CrossIcon from "../assets/cross.png";
import SendIcon from "../assets/send.png";
import NextIcon from "../assets/next.png";
import PreviousIcon from "../assets/previous.png";
import BookmarkIcon from "../assets/bookmark.png";
import BookmarkedIcon from "../assets/bookmarked.png";
import LikeIcon from "../assets/like.png";
import LikedIcon from "../assets/liked.png";
import DownloadIcon from "../assets/download.png";
import DownloadDoneIcon from "../assets/download_done.png";

const StoryDetailsPage = ({ story: initialStory, onClose }) => {
  const [story, setStory] = useState(initialStory || null); // Initialize story state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [likesCount, setLikesCount] = useState([]);
  const [isLiked, setIsLiked] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch story if not provided as a prop
  useEffect(() => {
    if (!story) {
      const fetchStory = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/stories/${id}`
          );
          setStory(response.data);
          setLikesCount(
            response.data.slides.map((slide) => slide.likes.length)
          );
          setIsLiked(response.data.slides.map(() => false));
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching story:", error);
          setIsLoading(false);
          // Handle case when story is not found
          if (error.response && error.response.status === 404) {
            toast.error("Story not found", {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: true,
              className: "error-toast",
            });
          }
        }
      };

      fetchStory();
    } else {
      setIsLoading(false);
      setLikesCount(story.slides.map((slide) => slide.likes.length));
      setIsLiked(story.slides.map(() => false));
    }
    return () => {
      setIsLoading(false); // Cleanup to reset loading state when component unmounts
    };
  }, [id, story]);

  // Bookmark check effect
  useEffect(() => {
    if (story) {
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
    }
  }, [story]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev < story.slides.length - 1 ? prev + 1 : prev
    );
  };

  const previousSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleLikeSlide = async (slideId, index) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/like/${
          story._id
        }/${slideId}`,
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
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/bookmark/${
          story._id
        }`,
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

  const handleDownloadSlide = async (slideId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/download/${
          story._id
        }/${slideId}`
      );
      const { slideURL } = response.data;

      const link = document.createElement("a");
      link.href = slideURL;
      link.download = `slide_${currentSlideIndex + 1}`;
      link.click();

      setIsDownloaded(true);
      toast.success("Downloaded Successfully", {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: true,
        className: "download-toast",
      });
    } catch (error) {
      console.error("Error downloading slide", error);
    }
  };

  const handleShareStory = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/${story._id}/share`
      );
      const { link } = response.data;
      navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        className: "share-toast",
      });
    } catch (error) {
      console.error("Error sharing story", error);
      toast.error("Error sharing story", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        className: "error-toast",
      });
    }
  };
  const handleClose = () => {
    setIsLoading(false);
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  // If story is not yet loaded, show a loading message
  if (isLoading || !story) {
    return <div>Loading...</div>;
  }

  const currentSlide = story.slides[currentSlideIndex];

  return (
    <div className="story-popup-overlay">
      <div className="story-popup-content">
        <div className="story-progress-bar-container">
          {story.slides.map((_, index) => (
            <div
              key={index}
              className={`story-progress-bar ${
                index === currentSlideIndex ? "active" : ""
              }`}
            ></div>
          ))}
        </div>

        <div className="story-header-icons">
          <img
            src={CrossIcon}
            alt="Close"
            className="story-close-button"
            onClick={handleClose}
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
            <video controls onLoadedMetadata={() => setIsLoading(false)}>
              <source src={currentSlide.content} type="video/mp4" />
            </video>
          ) : (
            <img
              src={currentSlide.content}
              alt="slide"
              onLoad={() => setIsLoading(false)}
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
          <div className="story-download-container">
            <img
              src={isDownloaded ? DownloadDoneIcon : DownloadIcon}
              alt="Download"
              className="story-download-icon"
              onClick={() => handleDownloadSlide(currentSlide._id)}
            />
          </div>
          <div className="story-like-container">
            <img
              src={isLiked[currentSlideIndex] ? LikedIcon : LikeIcon}
              alt="Like"
              className="story-like-icon"
              onClick={() =>
                handleLikeSlide(currentSlide._id, currentSlideIndex)
              }
            />
            <span className="story-like-count">
              {likesCount[currentSlideIndex]}
            </span>
          </div>
        </div>

        <img
          src={PreviousIcon}
          alt="Previous"
          className="story-previous-button"
          onClick={previousSlide}
          disabled={currentSlideIndex === 0}
        />
        <img
          src={NextIcon}
          alt="Next"
          className="story-next-button"
          onClick={nextSlide}
          disabled={currentSlideIndex === story.slides.length - 1} // Disable if at the last slide
        />

        <ToastContainer />
      </div>
    </div>
  );
};

export default StoryDetailsPage;
