import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/RegisterPage.css";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        username,
        password,
      });
      navigate("/login");
    } catch (error) {
      setError("Registration failed");
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default RegisterPage;
