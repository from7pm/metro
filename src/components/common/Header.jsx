import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    navigate("/");
  };
  
  // nav를 숨기고 싶은 경로들 모음 배열
  const hiddenPatterns = [
    /^\/linesdetail\/([^/]+)$/,
    /^\/linesdetail\/([^/]+)\/details\/([^/]+)$/,
  ]

  // 현재 경로가 hiddenPatterns에 포함되는지 체크
  const hideNav = hiddenPatterns.some(pattern => pattern.test(location.pathname));

  function redirectBack() {
    navigate(-1);
  }

  return(
    <>
      <div className="header-container">
        {
          hideNav && (
            <img className='back-btn' onClick={redirectBack} src="/btn/back-btn.svg" alt="뒤로 돌아가는 버튼 아이콘" />
          )
        }
        <img className='header-img' onClick={handleClick} src="/base/header.svg" alt="Metro인서울 헤더" />
      </div>
      {
        !hideNav && (
        <nav>
          <Link className={`nav-Link ${location.pathname === '/' ? 'nav-Link-selected' : ''}`} to='/'>호선 정보</Link>
          <Link className={`nav-Link ${location.pathname === '/stations' ? 'nav-Link-selected' : ''}`} to='/stations'>경로 검색</Link>
          <Link className={`nav-Link ${location.pathname === '/evacuation' ? 'nav-Link-selected' : ''}`} to='/evacuation'>대피도 조회</Link>
        </nav>
       ) 
      }
    </>
  )
}

export default Header;