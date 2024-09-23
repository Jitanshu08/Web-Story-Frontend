import { useState } from "react";
import axios from "axios";
import "../css/RegisterPage.css"; // Updated to unique classes
import CloseIcon from "../assets/Close.png";
import EyeIcon from "../assets/eye.png";

const RegisterPage = ({ closePopup, openLoginPopup }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [success, setSuccess] = useState(false); // Success message state

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading when registration begins
    setError(""); // Clear any previous errors
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        username,
        password,
      });
      setLoading(false); // Stop loading when registration is complete
      setSuccess(true); // Show success message
      setTimeout(() => {
        closePopup(); // Close registration popup
        openLoginPopup(); // Open login popup
      }, 1000); // Redirect to login popup after a second
    } catch (error) {
      setLoading(false); // Stop loading if an error occurs
      if (error.response) {
        setError(error.response.data.message || "Registration failed");
      } else {
        setError("Registration failed");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="registration-popup-container">
      <div className="registration-popup-content">
        <img
          src={CloseIcon}
          alt="Close"
          className="registration-close-icon"
          onClick={closePopup}
        />
        <h2>Register</h2>
        {error && <p className="registration-error-message">{error}</p>}
        {success && <p className="registration-success-message">Registration successful! Redirecting...</p>}
        {loading ? (
          <p className="registration-loading">Registering...</p> // Show loading message
        ) : (
          <form onSubmit={handleRegister}>
            <div className="registration-label-field-container">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="registration-gap"></div>
            <div className="registration-label-field-container">
              <label>Password</label>
              <div className="registration-password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <img
                  src={EyeIcon}
                  alt="Toggle visibility"
                  className="registration-eye-icon"
                  onClick={togglePasswordVisibility}
                />
              </div>
            </div>
            <button type="submit" className="registration-button">
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
