import { Outlet } from 'react-router-dom'
import './App.css'
import Header from './components/common/Header.jsx';
import Main from './components/Main.jsx';
import { useEffect, useState } from 'react';

function App() {
  const [showIntro, setShowIntro] = useState(() => sessionStorage.getItem("introSeen") === 'true');

  useEffect(() => {
    if (!showIntro) {
      const timer = setTimeout(() => {
        sessionStorage.setItem("introSeen", "true");
      }, 2500); // 2.5초 후 인트로 제거
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      { !showIntro && <Main /> } {/* 호선 목록 페이지 위에 겹쳐서 표시 */}
    </>
  )
}

export default App
