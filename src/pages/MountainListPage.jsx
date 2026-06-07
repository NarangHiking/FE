import { useState } from 'react';
import { Link } from 'react-router-dom';
import MountainCard from '../components/MountainCard.jsx';
import { MOUNTAINS, REGIONS } from '../data/mountains.js';

const DIFFS = ['전체', '초급', '중급', '상급'];
const DISTS = ['전체', '5km 이하', '5~10km', '10km 이상'];
const SORTS = ['인기순', '최신순', '거리순', '난이도순'];

export default function MountainListPage() {
  const [region, setRegion] = useState('전체');
  const [diff, setDiff] = useState('전체');
  const [dist, setDist] = useState('전체');
  const [sort, setSort] = useState('인기순');
  // TODO(BE): 산 목록 — GET /api/mtn/list 로 받아 MOUNTAINS 더미 교체.
  //   지역/난이도/거리 필터·정렬은 (a) 받아온 목록을 클라이언트에서 거르거나
  //   (b) 경로 기준이면 GET /api/track?mtnName=&location=&height= (TrackCondition) 사용.
  //   region/diff/dist/sort state 가 바뀔 때마다 재조회 또는 재필터.

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span><span className="here">산 목록</span>
      </div>

      <div className="page-head">
        <div className="eyebrow">ALL MOUNTAINS · 369 COURSES</div>
        <h1>산 목록</h1>
        <p className="desc">지역·난이도·거리로 좁혀가며 나에게 맞는 등산 코스를 찾아보세요.</p>
      </div>

      {/* 필터 바 */}
      <div className="filter-bar">
        <div className="frow">
          <span className="flab">검색</span>
          <div className="search-mini">
            <span>🔍</span>
            <input placeholder="산 이름으로 검색 (예: 북한산)" />
          </div>
        </div>
        <div className="frow">
          <span className="flab">지역</span>
          <span className={'chip' + (region === '전체' ? ' on' : '')} onClick={() => setRegion('전체')}>전체</span>
          {REGIONS.map((r) => (
            <span key={r.name} className={'chip' + (region === r.name ? ' on' : '')} onClick={() => setRegion(r.name)}>{r.name}</span>
          ))}
        </div>
        <div className="frow">
          <span className="flab">난이도</span>
          {DIFFS.map((d) => (
            <span key={d} className={'chip' + (diff === d ? ' on' : '')} onClick={() => setDiff(d)}>{d}</span>
          ))}
          <span className="flab" style={{ marginLeft: 12 }}>거리</span>
          {DISTS.map((d) => (
            <span key={d} className={'chip' + (dist === d ? ' on' : '')} onClick={() => setDist(d)}>{d}</span>
          ))}
        </div>
      </div>

      {/* 정렬 / 개수 */}
      <div className="list-toolbar">
        <div className="count"><b>{MOUNTAINS.length}</b> 개의 산</div>
        <div className="sort-pills">
          {SORTS.map((s) => (
            <span key={s} className={'chip' + (sort === s ? ' on' : '')} onClick={() => setSort(s)}>{s}</span>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid" style={{ marginBottom: 10 }}>
        {MOUNTAINS.map((m, i) => (
          <MountainCard key={m.id} m={m} sceneVariant={i + 21} showRank={false} />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="pagination">
        <span className="pg ghost">←</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={'pg' + (n === 1 ? ' on' : '')}>{n}</span>
        ))}
        <span className="pg ghost">→</span>
      </div>
    </div>
  );
}
