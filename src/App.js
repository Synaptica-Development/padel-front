import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageContext';
import Header from './components/Header';
import Landing from './components/Landing';
import About from './components/About';
import Why from './components/Why';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Password from './components/Password';
import User from './components/User';
import Book from './components/Book';
import History from './components/History';
import Entry from './components/Entry';
import Settings from './components/Settings';

function AppContent() {
  const location = useLocation();
  // Hide header and footer on user dashboard and book page
  const hideHeaderFooter = location.pathname === '/book' || 
                           location.pathname.startsWith('/user');

  return (
    <div className="App">
      {!hideHeaderFooter && <Header />}
      <Routes>
        {/* Home Page Route */}
        <Route 
          path="/" 
          element={
            <>
              <Landing />
              <About />
              <Why />
              <Contact />
            </>
          } 
        />
        {/* Login Page Route */}
        <Route path="/login" element={<Login />} />
        {/* Book Page Route - Standalone booking page */}
        <Route path="/book" element={<Book />} />
        {/* Register Page Route */}
        <Route path="/register" element={<Register />} />
        {/* Password Recovery Page Route */}
        <Route path="/password" element={<Password />} />
        {/* User Dashboard Routes */}
        <Route path="/user" element={<User section="order-history" />} />
        <Route path="/user/history" element={<User section="order-history" />} />
        <Route path="/user/entry/:id" element={<User section="entry" />} />
        <Route path="/user/settings" element={<User section="settings" />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;