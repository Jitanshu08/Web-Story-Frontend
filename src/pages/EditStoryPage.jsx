import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../css/AddStoryPage.css";

const EditStoryPage = () => {
  const { id } = useParams(); // Get story ID from URL
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState([
    { content: "", description: "", category: "Food", type: "" },
  ]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoryDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/stories/stories/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const story = response.data;
        setTitle(story.title);
        setSlides(story.slides);
      } catch (error) {
        setError("Failed to load story details.");
      }
    };
    fetchStoryDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/stories/edit/${id}`,
        { slides },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage("Story updated successfully!");
      navigate("/"); // Redirect to homepage after successful update
    } catch (error) {
      setError("Failed to update story. Please try again.");
    }
  };

  return (
    <div className="edit-story-page">
      <h2>Edit Story</h2>
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
              onChange={(e) => {
                const updatedSlides = [...slides];
                updatedSlides[index].content = e.target.value;
                setSlides(updatedSlides);
              }}
              required
            />
            <p>Type: {slide.type}</p>
            <label>Description</label>
            <input
              type="text"
              value={slide.description}
              onChange={(e) => {
                const updatedSlides = [...slides];
                updatedSlides[index].description = e.target.value;
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
          </div>
        ))}

        <button type="submit">Update Story</button>
      </form>
    </div>
  );
};

export default EditStoryPage;
