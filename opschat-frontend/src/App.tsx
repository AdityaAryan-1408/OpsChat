
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Import Pages
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { LogoMarquee } from './components/sections/LogoMarquee';
import { Features } from './components/sections/Features';
import { Benefits } from './components/sections/Benefits';
import { OrbitFeatures } from './components/sections/OrbitFeatures';
import { Footer } from './components/layout/Footer';

// Auth & Dashboard Imports
import { AuthPage } from './components/auth/AuthPage';
import { ProfileSetup } from './components/auth/ProfileSetup';
import { Dashboard } from './components/dashboard/Dashboard';
import { pageTransition } from './utils/animations';
import { ThemeProvider } from './hooks/useTheme.tsx';

// Landing Page Assembly
const LandingPage = () => (
  <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
    <Navbar />
    <Hero />
    <LogoMarquee />
    <Benefits />
    <Features />
    <OrbitFeatures />
    <Footer />
  </motion.div>
);

// Wrapper for Animation Presence
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit"><AuthPage /></motion.div>} />
        <Route path="/setup" element={<motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit"><ProfileSetup /></motion.div>} />
        <Route path="/dashboard" element={<motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit"><Dashboard /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-[#f8f9fb] dark:bg-slate-900 font-sans selection:bg-[#b5f2a1] selection:text-black overflow-x-hidden transition-colors duration-300">
          <AnimatedRoutes />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;