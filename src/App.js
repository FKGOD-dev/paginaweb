import React from 'https://unpkg.com/react@18/umd/react.development.js';
import { BrowserRouter as Router, Routes, Route } from 'https://unpkg.com/react-router-dom@6/umd/react-router-dom.development.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import HomePage from './pages/HomePage.js';
import ExplorePage from './pages/ExplorePage.js';
import ReaderPage from './pages/ReaderPage.js';
import ProfilePage from './pages/ProfilePage.js';
import ForumPage from './pages/ForumPage.js';

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
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}
