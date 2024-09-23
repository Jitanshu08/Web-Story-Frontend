import { useState } from "react";
import axios from "axios";
import "../css/LoginPage.css"; // Updated to unique classes
import CloseIcon from "../assets/Close.png";
import EyeIcon from "../assets/eye.png";

const LoginPage = ({ closePopup, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      onLoginSuccess(); // Set the login state
      closePopup(); // Close the login popup after successful login
    } catch (error) {
      console.error(error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-popup-container">
      <div className="login-popup-content">
        <img
          src={CloseIcon}
          alt="Close"
          className="login-close-icon"
          onClick={closePopup}
        />
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="login-label-field-container">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="login-gap"></div>
          <div className="login-label-field-container">
            <label>Password</label>
            <div className="login-password-container">
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
                className="login-eye-icon"
                onClick={togglePasswordVisibility}
              />
            </div>
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
