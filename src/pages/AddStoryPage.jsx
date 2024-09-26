import { useState, useRef } from "react";
import axios from "axios";
import "../css/AddStoryPage.css"; // Import a CSS file for this page

const AddStoryPage = () => {
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState([{ content: "", description: "", category: "Food", type: "" }]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const videoRefs = useRef([]);

  const getFileTypeFromUrl = (url) => {
    if (!url || (!url.startsWith('http') && !url.startsWith('www.'))) {
      return 'unknown';
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
      return "unknown";
    }
  };

  const handleAddSlide = () => {
    if (slides.length < 6) {
      setSlides([...slides, { content: "", description: "", category: "Food", type: "" }]);
    } else {
      setError("You can only add up to 6 slides.");
    }
  };

  const handleRemoveSlide = (index) => {
    if (slides.length > 3) {
      const updatedSlides = slides.filter((_, i) => i !== index);
      setSlides(updatedSlides);
    } else {
      setError("A story must have at least 3 slides.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Check if any video duration exceeds 30 seconds
    for (const ref of videoRefs.current) {
      if (ref && ref.duration > 30) {
        setError(`Slide ${videoRefs.current.indexOf(ref) + 1} has a video longer than 30 seconds.`);
        return;
      }
    }

    if (slides.length < 3 || slides.length > 6) {
      setError("A story must have between 3 and 6 slides.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/add`,
        { title, slides },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle("");
      setSlides([{ content: "", description: "", category: "Food", type: "" }]);
      setError("");
      setSuccessMessage("Story added successfully!");
    } catch (error) {
      setError("Failed to add story. Please try again.");
    }
  };

  const handleContentChange = (e, index) => {
    const updatedSlides = [...slides];
    const content = e.target.value;
    updatedSlides[index].content = content;

    if (content.startsWith('http') || content.startsWith('www.')) {
      updatedSlides[index].type = getFileTypeFromUrl(content);
    } else {
      updatedSlides[index].type = 'unknown';
    }

    setSlides(updatedSlides);
  };

  const handleDescriptionChange = (e, index) => {
    const updatedSlides = [...slides];
    updatedSlides[index].description = e.target.value;
    setSlides(updatedSlides);
  };

  const handleMetadataLoad = (index, event) => {
    if (event.target.duration > 30) {
      setError(`Slide ${index + 1} has a video longer than 30 seconds.`);
    }
  };

  return (
    <div className="add-story-page">
      <h2>Add New Story</h2>

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
            <p>Type: {slide.type}</p>

            <label>Description</label>
            <input
              type="text"
              value={slide.description}
              onChange={(e) => handleDescriptionChange(e, index)}
              placeholder="Enter slide description"
              required
            />

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

            {slide.type === 'video' && (
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={slide.content}
                onLoadedMetadata={(e) => handleMetadataLoad(index, e)}
                style={{ display: 'none' }}
              />
            )}

            <button type="button" onClick={() => handleRemoveSlide(index)}>Remove Slide</button>
          </div>
        ))}

        <button type="button" onClick={handleAddSlide} disabled={slides.length >= 6}>
          Add Slide
        </button>

        <button type="submit">Submit Story</button>
      </form>
    </div>
  );
};

export default AddStoryPage;
