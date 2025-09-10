// Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <>
      <nav className="navbar">
        <h1 className="logo" onClick={() => navigate("/")}>
          Oral<span className="orange">Vis</span>
        </h1>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate("/signup")}>
            Patient Register
          </button>
           <button className="nav-btn" onClick={() => navigate("/signin")}>
            Patient Login
          </button>
          <button className="nav-btn" onClick={() => navigate("/doctorsignin")}>
            Doctor Login
          </button>
        </div>
      </nav>

      <style>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: #f5f7fa; /* lighter navbar */
          box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* subtle shadow */
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo {
          font-size: 1.8rem;
          font-weight: bold;
          color: #002F6C;
          cursor: pointer;
        }

        .logo .orange {
          color: #F58220;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
        }

        .nav-btn {
          background: #F58220;
          border: none;
          color: #fff;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-btn:hover {
          background: #e46f14;
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
}
