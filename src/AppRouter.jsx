import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainNavigation from './components/navigation/MainNavigation.jsx';
import RealHomePage from './pages/RealHomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import ReaderPage from './pages/ReaderPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

const AppRouter = () => {
  const navigate = useNavigate();
  const handleNavigate = (href) => navigate(href);

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigation onNavigate={handleNavigate} />
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<RealHomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/reader" element={<ReaderPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
};

export default AppRouter;
