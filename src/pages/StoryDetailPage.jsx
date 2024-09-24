import { useState } from "react";
import "../css/StoryDetailsPage.css"; // Add necessary styling for the popup

const StoryDetailsPage = ({ story, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Ensure that the story and slides exist
  if (!story || !story.slides || story.slides.length === 0) {
    console.error("Story or slides not found");
    return null;
  }

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev < story.slides.length - 1 ? prev + 1 : prev));
  };

  const previousSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const currentSlide = story.slides[currentSlideIndex];

  // Log the current slide content and type for debugging
  console.log("Current Slide Content:", currentSlide?.content);
  console.log("Current Slide Type:", currentSlide?.type);

  // Check if currentSlide exists and has content before rendering
  if (!currentSlide || !currentSlide.content) {
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <button className="close-button" onClick={onClose}>
            X
          </button>
          <p>No content available for this slide.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <div className="slide-content">
          <h3>{story.title}</h3>
          <p>Category: {story.category}</p>

          {/* Use the 'type' field directly */}
          {currentSlide.type === "video" ? (
            <video controls>
              <source src={currentSlide.content} type="video/mp4" />
            </video>
          ) : (
            <img src={currentSlide.content} alt="slide" />
          )}
        </div>

        <div className="navigation-buttons">
          <button onClick={previousSlide} disabled={currentSlideIndex === 0}>
            Previous
          </button>
          <button onClick={nextSlide} disabled={currentSlideIndex === story.slides.length - 1}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailsPage;
