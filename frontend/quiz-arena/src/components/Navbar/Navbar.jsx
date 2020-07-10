import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, clearUser } from "../../user.js";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearUser();
    navigate("/login");
  }

  const logoTarget = !user ? "/login" : user.is_admin ? "/admin" : "/dashboard";

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={logoTarget} className="navbar-logo">
          QUIZ<span>ARENA</span>
        </Link>

        <div className="navbar-links">
          {!user && (
            <>
              <Link to="/login" className="navbar-link">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}

          {user && !user.is_admin && (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/leaderboard" className="navbar-link">
                Leaderboard
              </Link>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}

          {user && user.is_admin && (
            <>
              <Link to="/admin" className="navbar-link">
                Admin
              </Link>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
