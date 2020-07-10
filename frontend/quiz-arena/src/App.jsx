import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar.jsx";
import AdminLayout from "./components/AdminLayout/AdminLayout.jsx";

import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import QuizSetup from "./pages/QuizSetup/QuizSetup.jsx";
import QuizPlay from "./pages/QuizPlay/QuizPlay.jsx";
import QuizResult from "./pages/QuizResult/QuizResult.jsx";
import Leaderboard from "./pages/Leaderboard/Leaderboard.jsx";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard.jsx";
import AdminCategories from "./pages/AdminCategories/AdminCategories.jsx";
import AdminQuestions from "./pages/AdminQuestions/AdminQuestions.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz/setup" element={<QuizSetup />} />
        <Route path="/quiz/play" element={<QuizPlay />} />
        <Route path="/quiz/result" element={<QuizResult />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="questions" element={<AdminQuestions />} />
        </Route>
      </Routes>
    </>
  );
}
