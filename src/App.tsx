import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import Profile from './pages/Profile';
import Porto from './pages/Porto';
import Admin from './pages/Admin';
import IzAddon from './pages/IzAddon';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="bg-black min-h-screen w-full">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Profile />} />
              <Route path="/porto" element={<Porto />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/iz-addon" element={<IzAddon />} />
            </Routes>
          </main>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </LanguageProvider>
  )
}

export default App
