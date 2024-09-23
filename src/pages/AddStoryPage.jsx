import { useState } from "react";
import axios from "axios";
import "../css/AddStoryPage.css"; // Import a CSS file for this page

const AddStoryPage = () => {
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState([{ url: "", category: "Food" }]); // At least one slide by default
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // To display a success message

  // Add a slide, ensuring a maximum of 6 slides
  const handleAddSlide = () => {
    if (slides.length < 6) {
      setSlides([...slides, { url: "", category: "Food" }]);
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
      setSlides([{ url: "", category: "Food" }]);
      setError(""); // Clear any existing errors
      setSuccessMessage("Story added successfully!"); // Display success message
      console.log("Story added:", response.data);
    } catch (error) {
      setError("Failed to add story. Please try again.");
      console.error("Error:", error);
    }
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
            <label>Slide URL</label>
            <input
              type="text"
              value={slide.url}
              onChange={(e) => {
                const updatedSlides = [...slides];
                updatedSlides[index].url = e.target.value;
                setSlides(updatedSlides);
              }}
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
