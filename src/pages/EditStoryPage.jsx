import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/AddStoryPage.css";
import CloseIcon from "../assets/Close.png";

const EditStoryPage = ({ closePopup, storyId }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const navigate = useNavigate();
  const videoRefs = useRef([]); // To store video refs for duration checking

  useEffect(() => {
    const fetchStoryDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/stories/${storyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const story = response.data;
        setSlides(story.slides); // Set slides data
      } catch (error) {
        toast.error("Failed to load story details.");
      }
    };
    if (storyId) {
      fetchStoryDetails();
    }
  }, [storyId]);

  const handleAddSlide = () => {
    if (slides.length < 6) {
      setSlides([
        ...slides,
        {
          heading: "",
          content: "",
          description: "",
          category: "Food",
          type: "",
        },
      ]);
      setCurrentSlideIndex(slides.length);
    }
  };

  const handleRemoveSlide = (index) => {
    if (slides.length > 3) {
      const updatedSlides = slides.filter((_, i) => i !== index);
      setSlides(updatedSlides);
      if (currentSlideIndex >= updatedSlides.length) {
        setCurrentSlideIndex(updatedSlides.length - 1);
      }
    }
  };

  // Function to get video duration for non-YouTube videos
  const getVideoDuration = async (url) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = url;
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(null);
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Check video duration
    for (let slide of slides) {
      if (slide.type === "video") {
        const duration = await getVideoDuration(slide.content);
        if (duration === null) {
          toast.error("Failed to validate the video duration. Cannot proceed.");
          return;
        }
        if (duration > 30) {
          toast.error(
            `Slide ${
              slides.indexOf(slide) + 1
            } has a video longer than 30 seconds.`
          );
          return;
        }
      }
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/edit/${storyId}`,
        { slides },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Story updated successfully!");
      closePopup();
      navigate("/");
    } catch (error) {
      toast.error("Failed to update story. Please try again.");
    }
  };

  const handleHeadingChange = (e, index) => {
    const updatedSlides = [...slides];
    updatedSlides[index].heading = e.target.value;
    setSlides(updatedSlides);
  };

  const handleContentChange = (e, index) => {
    const updatedSlides = [...slides];
    updatedSlides[index].content = e.target.value;
    setSlides(updatedSlides);
  };

  const handleDescriptionChange = (e, index) => {
    const updatedSlides = [...slides];
    updatedSlides[index].description = e.target.value;
    setSlides(updatedSlides);
  };

  const handleCategoryChange = (e, index) => {
    const updatedSlides = [...slides];
    updatedSlides[index].category = e.target.value;
    setSlides(updatedSlides);
  };

  return (
    <div className="add-story-popup">
      <ToastContainer />
      <img
        className="close-button"
        src={CloseIcon}
        alt="Close"
        onClick={closePopup}
      />
      <h1 className="mobile-heading">Edit Story</h1>
      {/* Slide navigation */}
      <div className="slides-navigation">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`slide-nav-item ${
              currentSlideIndex === index ? "active" : ""
            }`}
          >
            <button onClick={() => setCurrentSlideIndex(index)}>
              Slide {index + 1}
            </button>
            {slides.length > 3 && (
              <img
                src={CloseIcon}
                alt="Remove slide"
                className="remove-slide-icon"
                onClick={() => handleRemoveSlide(index)}
              />
            )}
          </div>
        ))}

        {slides.length < 6 && (
          <button
            className="add-slide-button"
            type="button"
            onClick={handleAddSlide}
          >
            Add +
          </button>
        )}
      </div>
      {/* Form for editing story content */}
      <form className="add-story-form" onSubmit={handleSubmit}>
        <div className="slide-container">
          <div className="Labels">
            <label>Heading:</label>
            <input
              placeholder="Your heading"
              type="text"
              value={slides[currentSlideIndex]?.heading || ""}
              onChange={(e) => handleHeadingChange(e, currentSlideIndex)}
              required
            />
          </div>

          <div className="Labels">
            <label>Slide Content (URL):</label>
            <input
              type="text"
              value={slides[currentSlideIndex]?.content || ""}
              onChange={(e) => handleContentChange(e, currentSlideIndex)}
              required
            />
          </div>

          <div className="Labels">
            <label>Description:</label>
            <textarea
              className="description"
              rows="8"
              value={slides[currentSlideIndex]?.description || ""}
              onChange={(e) => handleDescriptionChange(e, currentSlideIndex)}
              required
            />
          </div>

          <div className="Labels">
            <label>Category:</label>
            <select
              value={slides[currentSlideIndex]?.category || "Food"}
              onChange={(e) => handleCategoryChange(e, currentSlideIndex)}
            >
              <option value="Food">Food</option>
              <option value="Health and Fitness">Health and Fitness</option>
              <option value="Travel">Travel</option>
              <option value="Movie">Movie</option>
              <option value="Education">Education</option>
            </select>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="form-actions">
          <div className="Navigator">
            <button
              className="previous-button"
              type="button"
              onClick={() => setCurrentSlideIndex((prevIndex) => prevIndex - 1)}
              disabled={currentSlideIndex === 0}
            >
              Previous
            </button>
            <button
              className="next-button"
              type="button"
              onClick={() => setCurrentSlideIndex((prevIndex) => prevIndex + 1)}
              disabled={currentSlideIndex >= slides.length - 1}
            >
              Next
            </button>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-button">
              Update Story
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditStoryPage;
