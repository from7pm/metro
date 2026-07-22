import { useEffect, useState } from 'react';
import './Main.css';

function Main() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true); // 1.3초 후 페이드아웃 시작
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  return(
    <>
      <div className={`intro ${fadeOut ? "fade-out" : ""}`}>
        <img className='main-header' src="/base/main-header.svg" alt="메인페이지 헤더" />
        <img className='main-train-icon' src="/base/main-train-icon.svg" alt="메인페이지 지하철 아이콘" />
      </div>
    </>
  )
}

export default Main;