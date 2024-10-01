import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/AddStoryPage.css"; // Reuse the same CSS as AddStoryPage
import CloseIcon from "../assets/Close.png"; // Importing Close icon

const EditStoryPage = ({ closePopup, storyId }) => {
 
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoryDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/stories/stories/${storyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const story = response.data;
        setSlides(story.slides); // Set slides data
      } catch (error) {
        setError("Failed to load story details.");
      }
    };
    if (storyId) {  // Ensure storyId is valid
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/edit/${id}`,
        { slides }, // Save the updated slides with the correct heading field
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage("Story updated successfully!");
      closePopup(); // Close the popup on success
      navigate("/"); // Redirect to homepage after successful update
    } catch (error) {
      setError("Failed to update story. Please try again.");
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
      <img
        className="close-button"
        src={CloseIcon}
        alt="Close"
        onClick={closePopup}
      />
      <h1 className="mobile-heading">Edit Story</h1>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
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

        {/* Conditionally render the "Add +" button */}
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
      <form className="add-story-form" onSubmit={(e) => handleSubmit(e)}>
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
