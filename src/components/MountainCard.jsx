import { Link } from 'react-router-dom';
import { useState } from 'react';
import MountainScene from './MountainScene.jsx';
import { imageUrl } from '../utils/image.js';

// 산 카드. showRank 로 순위 배지 노출 여부 제어.
export default function MountainCard({ m, sceneVariant, showRank = true }) {
  const [imgOk, setImgOk] = useState(true);
  const img = imageUrl(m.img);
  return (
    <Link className="card" to={`/mountains/${m.id}`}>
      <div className="pic">
        {img && imgOk ? (
          <img className="card-img" src={img} alt={m.name} loading="lazy" onError={() => setImgOk(false)} />
        ) : (
          <MountainScene variant={sceneVariant ?? m.id + 10} palette={m.pal} w={300} h={150} />
        )}
        <div className="ht" />
        {showRank && <div className="rank">{m.rank}</div>}
      </div>
      <div className="info">
        <div className="top">
          <h3>{m.name}</h3>
          <span className="reg">{m.region}</span>
        </div>
        <div className="meta">
          {m.dist ? (
            <>
              <div className="m"><div className="k">거리</div><div className="v">{m.dist}</div></div>
              <div className="m"><div className="k">소요</div><div className="v">{m.time}</div></div>
              <div className="m"><div className="k">난이도</div><div className={`v lv-${m.lvN}`}>{m.lv}</div></div>
            </>
          ) : (
            <>
              <div className="m"><div className="k">고도</div><div className="v">{m.ele}m</div></div>
              <div className="m"><div className="k">위치</div><div className="v" style={{ fontSize: 13 }}>{m.region}</div></div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
