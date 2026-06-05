import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

import Home from '../pages/Home';
import Search from '../pages/Search';
import Library from '../pages/Library';
import Playlist from '../pages/Playlist';
import Login from '../pages/Login';
import ImportPage from '../pages/Import';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Route cho trang Login (không cần AppLayout) */}
        <Route path="/login" element={<Login />} />

        {/* Các route con nằm trong AppLayout */}
        <Route path="/" element={<AppLayout><Home /></AppLayout>} />
        <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
        <Route path="/library" element={<AppLayout><Library /></AppLayout>} />
        <Route path="/playlist" element={<AppLayout><Playlist /></AppLayout>} />
        <Route path="/import" element={<AppLayout><ImportPage /></AppLayout>} />
        
        {/* Bạn có thể thêm các route khác tương tự ở đây */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;