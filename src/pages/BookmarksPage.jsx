import { useEffect, useState } from "react";
import axios from "axios";
import "../css/BookmarksPage.css";

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarks(response.data.bookmarks);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };

    fetchBookmarks();
  }, []);

  return (
    <div className="bookmarks-page">
      <h2>Your Bookmarks</h2>
      {bookmarks.length > 0 ? (
        <div className="bookmarks-list">
          {bookmarks.map((story) => (
            <div key={story._id} className="bookmark-card">
              <h3>{story.title}</h3>
              <p>Category: {story.category}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No bookmarks yet.</p>
      )}
    </div>
  );
};

export default BookmarksPage;
