import { useNavigate } from 'react-router-dom';
import './LineList.css';
import { ROUTE_DISPLAY } from '../../configs/line-list-configs/subwayLinesRouteConfig.js';
import LINE_COLORS from '../../configs/lineColors.js';

function LineList() {
  const navigate = useNavigate();

  const handleClick = (lineName) => {
    const lineId = "line" + lineName.replace("호선", "");
    navigate(`/linesdetail/${lineId}`)
  }
  
  return (
    <>
      <div className='linelist-container'>
        {
          Object.keys(ROUTE_DISPLAY).map((lineName) => {
            return (
              <div key={lineName} className='line-card' onClick={() => handleClick(lineName)}>
                <p>{lineName}</p>
                <div className='lavel' style={{ '--line-color': LINE_COLORS[lineName] }}></div>
              </div>
            )
          })
        }
      </div>
    </>
  )
}

export default LineList;