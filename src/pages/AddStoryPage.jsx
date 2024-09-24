import { useState } from "react";
import axios from "axios";
import "../css/AddStoryPage.css"; // Import a CSS file for this page

const AddStoryPage = () => {
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState([{ content: "", category: "Food", type: "" }]); // Use "content" instead of "url"
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // To display a success message

  // Known extensions and domains
  const getFileTypeFromUrl = (url) => {
    if (!url || (!url.startsWith('http') && !url.startsWith('www.'))) {
      return 'unknown'; // Return 'unknown' for incomplete or invalid URLs
    }

    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif", ".svg", ".webp"];
    const videoExtensions = [".mp4", ".avi", ".mov", ".mkv", ".flv", ".webm"];
    const videoDomains = ["youtube.com", "youtu.be", "vimeo.com"];

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      if (videoDomains.includes(hostname)) {
        return "video";
      }

      if (imageExtensions.some(ext => url.endsWith(ext))) {
        return "image";
      } else if (videoExtensions.some(ext => url.endsWith(ext))) {
        return "video";
      } else {
        return "unknown";
      }
    } catch (error) {
      return "unknown"; // If URL is invalid, return 'unknown'
    }
  };

  // Add a slide, ensuring a maximum of 6 slides
  const handleAddSlide = () => {
    if (slides.length < 6) {
      setSlides([...slides, { content: "", category: "Food", type: "" }]);
    } else {
      setError("You can only add up to 6 slides.");
    }
  };

  // Remove a slide, ensuring at least 3 slides remain
  const handleRemoveSlide = (index) => {
    if (slides.length > 3) {
      const updatedSlides = slides.filter((_, i) => i !== index);
      setSlides(updatedSlides);
    } else {
      setError("A story must have at least 3 slides.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Ensure the user provides a valid number of slides
    if (slides.length < 3 || slides.length > 6) {
      setError("A story must have between 3 and 6 slides.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/add`, // Adjust the endpoint
        {
          title,
          slides,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear form and display success message on successful story submission
      setTitle("");
      setSlides([{ content: "", category: "Food", type: "" }]);
      setError(""); // Clear any existing errors
      setSuccessMessage("Story added successfully!"); // Display success message
    } catch (error) {
      setError("Failed to add story. Please try again.");
    }
  };

  const handleContentChange = (e, index) => {
    const updatedSlides = [...slides];
    const content = e.target.value;
    updatedSlides[index].content = content;

    // Only detect the file type if the URL is valid
    if (content.startsWith('http') || content.startsWith('www.')) {
      updatedSlides[index].type = getFileTypeFromUrl(content);
    } else {
      updatedSlides[index].type = 'unknown'; // Set type to unknown if URL is incomplete
    }

    setSlides(updatedSlides);
  };

  return (
    <div className="add-story-page">
      <h2>Add New Story</h2>

      {/* Display error or success message */}
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {slides.map((slide, index) => (
          <div key={index} className="slide-container">
            <label>Slide Content (URL)</label>
            <input
              type="text"
              value={slide.content}
              onChange={(e) => handleContentChange(e, index)}
              required
            />
            <p>Type: {slide.type}</p> {/* Display detected type */}
            <label>Category</label>
            <select
              value={slide.category}
              onChange={(e) => {
                const updatedSlides = [...slides];
                updatedSlides[index].category = e.target.value;
                setSlides(updatedSlides);
              }}
            >
              <option value="Food">Food</option>
              <option value="Health and Fitness">Health and Fitness</option>
              <option value="Travel">Travel</option>
              <option value="Movie">Movie</option>
              <option value="Education">Education</option>
            </select>
            <button type="button" onClick={() => handleRemoveSlide(index)}>
              Remove Slide
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddSlide}
          disabled={slides.length >= 6} // Disable when max slides reached
        >
          Add Slide
        </button>

        <button type="submit">Submit Story</button>
      </form>
    </div>
  );
};

export default AddStoryPage;
