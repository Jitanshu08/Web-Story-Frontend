import { Link } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>Story Platform</h1>
      <div className="navbar-buttons">
        <Link to="/register">
          <button className="register-button">Register Now</button>
        </Link>
        <Link to="/login">
          <button className="login-button">Sign In</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
