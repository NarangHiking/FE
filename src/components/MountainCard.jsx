import { Link } from 'react-router-dom';
import { useState } from 'react';
import MountainScene from './MountainScene.jsx';

// 산 카드. showRank 로 순위 배지 노출 여부 제어.
export default function MountainCard({ m, sceneVariant, showRank = true }) {
  const [fav, setFav] = useState(m.rank === 1);
  return (
    <Link className="card" to={`/mountains/${m.id}`}>
      <div className="pic">
        <MountainScene variant={sceneVariant ?? m.id + 10} palette={m.pal} w={300} h={150} />
        <div className="ht" />
        {showRank && <div className="rank">{m.rank}</div>}
        <button
          className={'fav' + (fav ? ' on' : '')}
          type="button"
          onClick={(e) => { e.preventDefault(); setFav((v) => !v); }}
        >
          ♥
        </button>
      </div>
      <div className="info">
        <div className="top">
          <h3>{m.name}</h3>
          <span className="reg">{m.region}</span>
        </div>
        <div className="meta">
          <div className="m"><div className="k">거리</div><div className="v">{m.dist}</div></div>
          <div className="m"><div className="k">소요</div><div className="v">{m.time}</div></div>
          <div className="m"><div className="k">난이도</div><div className={`v lv-${m.lvN}`}>{m.lv}</div></div>
        </div>
      </div>
    </Link>
  );
}
