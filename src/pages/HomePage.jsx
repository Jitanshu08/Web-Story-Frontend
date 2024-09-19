import { useState } from "react";
import "../css/HomePage.css"; 

const HomePage = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = ["All", "Food", "Health and Fitness", "Travel", "Movie", "Education"];

  const toggleCategory = (category) => {
    if (category === "All") {
      setSelectedCategories(["All"]);
    } else {
      setSelectedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev.filter((c) => c !== "All"), category]
      );
    }
  };

  return (
    <div className="home-page">
      <h2>Welcome to the Story Platform</h2>
      <p>Explore, create, and share amazing stories.</p>
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${
              selectedCategories.includes(category) ? "selected" : ""
            }`}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
