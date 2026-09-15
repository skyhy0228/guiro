import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Shield, TicketCheck } from 'lucide-react';
import { AdminPage } from './pages/AdminPage';
import { CompletePage } from './pages/CompletePage';
import { LookupPage } from './pages/LookupPage';
import { ReservationPage } from './pages/ReservationPage';

export function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <nav className="top-nav" aria-label="주요 메뉴">
          <NavLink to="/" end>
            <TicketCheck size={18} aria-hidden="true" />
            예약
          </NavLink>
          <NavLink to="/lookup">내 예약 조회 / 변경 / 취소</NavLink>
          <NavLink to="/admin">
            <Shield size={18} aria-hidden="true" />
            관리자
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<ReservationPage />} />
          <Route path="/complete" element={<CompletePage />} />
          <Route path="/lookup" element={<LookupPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
