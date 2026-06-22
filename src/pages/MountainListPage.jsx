import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MountainCard from '../components/MountainCard.jsx';
import { REGIONS, matchesRegion } from '../data/mountains.js';
import { apiFetch } from '../context/AuthContext.jsx';

const PALETTES = ['forest', 'moss', 'alpine', 'dusk', 'mist', 'dawn'];
const PAGE_SIZE = 12; // 한 페이지에 표시할 산 카드 수
const SORTS = ['인기순', '최신순'];

// BE Mtn → FE 카드 포맷 변환 (거리/시간/난이도는 사용하지 않음 → 카드는 고도/위치 표시)
function toCard(mtn, index) {
  return {
    id:     mtn.id,
    rank:   index + 1,
    name:   mtn.name,
    region: mtn.location ?? '-',
    ele:    mtn.height  ?? 0,
    img:    mtn.imageUrl ?? mtn.storedFilename ?? null, // R2 대표 사진 (없으면 카드가 생성아트로 폴백)
    pal:    PALETTES[index % PALETTES.length],
  };
}

export default function MountainListPage() {
  const [mountains, setMountains] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState('');
  // 메인 지역 칩에서 넘어온 ?region= 값을 초기값으로 사용
  const [region, setRegion]   = useState(searchParams.get('region') ?? '전체');
  const [sort, setSort]       = useState('인기순');
  const [page, setPage]       = useState(1); // 현재 페이지 (1-based)

  // ── API 호출 ──────────────────────────────────────────────
  // useEffect: 컴포넌트가 처음 마운트될 때 한 번 실행
  useEffect(() => {
    apiFetch('/api/mtn/list')
      .then((res) => {
        if (!res.ok) throw new Error('산 목록을 불러오지 못했습니다.');
        return res.json();
      })
      .then((json) => {
        // ApiResult 래퍼: { success, data: [...] } 또는 그냥 배열
        const list = json.data ?? json;
        setMountains(list.map(toCard));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []); // [] = 의존성 없음 → 마운트 1회만 실행

  // ── 클라이언트 필터링 ─────────────────────────────────────
  // useMemo: mountains·필터 state가 바뀔 때만 재계산 (불필요한 연산 방지)
  const filtered = useMemo(() => {
    return mountains.filter((m) => {
      if (keyword && !m.name.includes(keyword)) return false;
      if (region !== '전체' && !matchesRegion(m.region, region)) return false;
      return true;
    });
  }, [mountains, keyword, region]);

  // ── 페이지네이션 계산 ─────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // 필터/검색이 바뀌어 현재 페이지가 범위를 벗어나면 1페이지로 보정
  useEffect(() => { setPage(1); }, [keyword, region]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 현재 페이지 기준 앞뒤 2개씩, 최대 5개의 페이지 번호
  function getPageNums() {
    const nums = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span><span className="here">산 목록</span>
      </div>

      <div className="page-head">
        <div className="eyebrow">ALL MOUNTAINS</div>
        <h1>산 목록</h1>
        <p className="desc">지역으로 좁혀가며 나에게 맞는 산을 찾아보세요.</p>
      </div>

      {/* 필터 바 */}
      <div className="filter-bar">
        <div className="frow">
          <span className="flab">검색</span>
          <div className="search-mini">
            <span>🔍</span>
            <input
              placeholder="산 이름으로 검색 (예: 북한산)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
        <div className="frow">
          <span className="flab">지역</span>
          <span className={'chip' + (region === '전체' ? ' on' : '')} onClick={() => setRegion('전체')}>전체</span>
          {REGIONS.map((r) => (
            <span key={r.name} className={'chip' + (region === r.name ? ' on' : '')} onClick={() => setRegion(r.name)}>{r.name}</span>
          ))}
        </div>
      </div>

      {/* 정렬 / 개수 */}
      <div className="list-toolbar">
        <div className="count"><b>{filtered.length}</b> 개의 산</div>
        <div className="sort-pills">
          {SORTS.map((s) => (
            <span key={s} className={'chip' + (sort === s ? ' on' : '')} onClick={() => setSort(s)}>{s}</span>
          ))}
        </div>
      </div>

      {/* 상태 표시 */}
      {loading && <p style={{ textAlign: 'center', padding: 40 }}>불러오는 중…</p>}
      {error   && <p style={{ textAlign: 'center', padding: 40, color: 'var(--pop)' }}>{error}</p>}

      {/* 카드 그리드 */}
      {!loading && !error && (
        <div className="grid" style={{ marginBottom: 10 }}>
          {pageItems.length === 0
            ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--ink-soft)', gridColumn: '1 / -1' }}>조건에 맞는 산이 없습니다.</p>
            : pageItems.map((m, i) => (
              <MountainCard key={m.id} m={m} sceneVariant={i + 21} showRank={false} />
            ))
          }
        </div>
      )}

      {/* 페이지네이션 — 페이지가 2개 이상일 때만 표시 */}
      {!loading && !error && totalPages > 1 && (
        <div className="pagination">
          <span
            className={'pg ghost' + (page === 1 ? ' disabled' : '')}
            onClick={() => page > 1 && setPage(page - 1)}
          >←</span>
          {getPageNums().map((n) => (
            <span
              key={n}
              className={'pg' + (n === page ? ' on' : '')}
              onClick={() => setPage(n)}
            >{n}</span>
          ))}
          <span
            className={'pg ghost' + (page === totalPages ? ' disabled' : '')}
            onClick={() => page < totalPages && setPage(page + 1)}
          >→</span>
        </div>
      )}
    </div>
  );
}
