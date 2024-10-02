import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../css/AddStorypage.css";
import CloseIcon from "../assets/Close.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddStoryPage = ({ closePopup }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState([
    { heading: "", content: "", description: "", category: "Food", type: "" },
    { heading: "", content: "", description: "", category: "Food", type: "" },
    { heading: "", content: "", description: "", category: "Food", type: "" },
  ]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const videoRefs = useRef([]);

  // Function to get file type from URL (image, video, unknown)
  const getFileTypeFromUrl = (url) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const videoExtensions = [".mp4", ".avi", ".mov"];

    if (!url || (!url.startsWith("http") && !url.startsWith("www.")))
      return "unknown";

    try {
      const urlObj = new URL(url);
      if (videoExtensions.some((ext) => url.endsWith(ext))) return "video";
      if (imageExtensions.some((ext) => url.endsWith(ext))) return "image";
      return "unknown";
    } catch {
      return "unknown";
    }
  };

  // Function to get video duration from non-YouTube URLs
  const getVideoDuration = async (url) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = url;
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(null); // Return null if there is an error
      };
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Validate all slides for video duration
    for (let slide of slides) {
      if (slide.type === "video") {
        const duration = await getVideoDuration(slide.content);
        if (duration === null) {
          setError("Failed to validate the video duration. Cannot proceed.");
          toast.error("Failed to validate the video duration. Cannot proceed.");
          return;
        }
        if (duration > 30) {
          setError(
            `Slide ${
              slides.indexOf(slide) + 1
            } has a video longer than 30 seconds.`
          );
          toast.error(
            `Slide ${
              slides.indexOf(slide) + 1
            } has a video longer than 30 seconds.`
          );
          return;
        }
      }
    }

    if (slides.length < 3 || slides.length > 6) {
      setError("A story must have between 3 and 6 slides.");
      toast.error("A story must have between 3 and 6 slides.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/add`,
        { slides },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSlides([
        {
          heading: "",
          content: "",
          description: "",
          category: "Food",
          type: "",
        },
      ]);
      setError("");
      setSuccessMessage("Story added successfully!");
      toast.success("Story added successfully!");
    } catch (error) {
      setError("Failed to add story. Please try again.");
      toast.error("Failed to add story. Please try again.");
    }
  };

  const handleContentChange = (e, index) => {
    const updatedSlides = [...slides];
    updatedSlides[index].content = e.target.value;
    updatedSlides[index].type = getFileTypeFromUrl(e.target.value);
    setSlides(updatedSlides);
  };

  const handleHeadingChange = (e, index) => {
    const updatedSlides = [...slides];
    updatedSlides[index].heading = e.target.value;
    setSlides(updatedSlides);
  };

  const handleDescriptionChange = (e, index) => {
    const updatedSlides = [...slides];
    updatedSlides[index].description = e.target.value;
    setSlides(updatedSlides);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prevIndex) => prevIndex - 1);
    }
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
      <h1 className="mobile-heading">Add story to feed</h1>

      {error && <p className="error-message"></p>}
      {successMessage && <p className="success-message"></p>}

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
            <label>Description:</label>
            <textarea
              className="description"
              rows="8"
              placeholder="Story Description"
              value={slides[currentSlideIndex]?.description || ""}
              onChange={(e) => handleDescriptionChange(e, currentSlideIndex)}
              required
            />
          </div>

          <div className="Labels">
            <label>Image/Video(URL):</label>
            <input
              type="text"
              placeholder="Add Image/Video url"
              value={slides[currentSlideIndex]?.content || ""}
              onChange={(e) => handleContentChange(e, currentSlideIndex)}
              required
            />
          </div>
          <p>Type: {slides[currentSlideIndex]?.type || "unknown"}</p>

          <div className="Labels">
            <label>Category:</label>
            <select
              value={slides[currentSlideIndex]?.category || "Food"}
              onChange={(e) => {
                const updatedSlides = [...slides];
                updatedSlides[currentSlideIndex].category = e.target.value;
                setSlides(updatedSlides);
              }}
            >
              <option value="Food">Food</option>
              <option value="Health and Fitness">Health and Fitness</option>
              <option value="Travel">Travel</option>
              <option value="Movie">Movie</option>
              <option value="Education">Education</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <div className="Navigator">
            <button
              className="previous-button"
              type="button"
              onClick={handlePreviousSlide}
            >
              Previous
            </button>
            <button
              className="next-button"
              type="button"
              onClick={handleNextSlide}
            >
              Next
            </button>
          </div>
          <button type="submit" className="submit-button">
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStoryPage;
