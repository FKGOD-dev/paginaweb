import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AnimeDetailPage from './pages/AnimeDetailPage.jsx';
import CharacterDetailPage from './pages/CharacterDetailPage.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import ReaderPage from './pages/ReaderPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ForumPage from './pages/ForumPage.jsx';

export default function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/reader" element={<ReaderPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/character/:id" element={<CharacterDetailPage />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}
