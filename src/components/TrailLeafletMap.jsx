// 인터랙티브 지도 + GPX 트랙 렌더링 (react-leaflet)
// 실제 경로는 <trkseg> 안의 <trkpt> 만 순서대로 이어 그린다.
// (wpt = 주차장/정상 같은 흩어진 지점이라 선에 넣으면 안 됨)
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pin = (bg, label) =>
  L.divIcon({
    className: 'trail-pin-wrap',
    html: `<div class="trail-pin" style="background:${bg}"><span>${label}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });

const START = pin('#1f7a52', '출');
const END = pin('#e3b441', '종');
const PEAK = pin('#e7642e', '⛰');

const toLatLng = (p) => [parseFloat(p.getAttribute('lat')), parseFloat(p.getAttribute('lon'))];
const valid = ([a, b]) => Number.isFinite(a) && Number.isFinite(b);

// 두 [lat,lng] 사이 거리(m) — 하버사인
function haversine([la1, lo1], [la2, lo2]) {
  const R = 6371000, rad = (d) => (d * Math.PI) / 180;
  const dLa = rad(la2 - la1), dLo = rad(lo2 - lo1);
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
// 세그먼트별로 점 사이 거리를 합산 → km (세그먼트 경계는 잇지 않음)
function totalKm(segments) {
  const m = segments.reduce((sum, seg) => {
    let d = 0;
    for (let i = 1; i < seg.length; i++) d += haversine(seg[i - 1], seg[i]);
    return sum + d;
  }, 0);
  return m / 1000;
}

// GPX → 세그먼트 배열 (각 세그먼트는 [lat,lng][])
function parseGpx(text) {
  const xml = new DOMParser().parseFromString(text, 'application/xml');
  // 1순위: trkseg 별 trkpt
  let segs = Array.from(xml.querySelectorAll('trkseg'))
    .map((seg) => Array.from(seg.querySelectorAll('trkpt')).map(toLatLng).filter(valid))
    .filter((s) => s.length > 1);
  // 2순위: trkseg 없이 trkpt 만 있는 경우
  if (segs.length === 0) {
    const tp = Array.from(xml.querySelectorAll('trkpt')).map(toLatLng).filter(valid);
    if (tp.length > 1) segs = [tp];
  }
  // 3순위: 경로(rtept)
  if (segs.length === 0) {
    const rt = Array.from(xml.querySelectorAll('rtept')).map(toLatLng).filter(valid);
    if (rt.length > 1) segs = [rt];
  }
  return segs;
}

function FitBounds({ points, center }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [36, 36] });
    else map.setView(center, 13);
  }, [points, center, map]);
  return null;
}

export default function TrailLeafletMap({ center, gpxUrl, onStats }) {
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    setSegments([]);
    if (!gpxUrl) return;
    let off = false;
    fetch(gpxUrl)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((text) => { if (!off) setSegments(parseGpx(text)); })
      .catch(() => {}); // CORS/404 → 트랙 없이 마커만
    return () => { off = true; };
  }, [gpxUrl]);

  // 세그먼트가 준비되면 트랙 거리(km)를 부모에 전달 (없으면 null)
  useEffect(() => {
    if (!onStats) return;
    const km = segments.length ? totalKm(segments) : 0;
    onStats(km > 0 ? km : null);
    // onStats(콜백)은 매 렌더 새로 만들어질 수 있어 의존성에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  const all = segments.flat();
  const hasTrack = all.length > 1;
  const start = hasTrack ? segments[0][0] : null;
  const end = hasTrack ? segments[segments.length - 1].at(-1) : null;

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="md-leaflet">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {segments.map((seg, i) => (
        <Polyline key={'b' + i} positions={seg} pathOptions={{ color: '#fff', weight: 7, opacity: 0.9 }} />
      ))}
      {segments.map((seg, i) => (
        <Polyline key={'o' + i} positions={seg} pathOptions={{ color: '#e7642e', weight: 4 }} />
      ))}
      {hasTrack ? (
        <>
          <Marker position={start} icon={START} />
          <Marker position={end} icon={END} />
        </>
      ) : (
        <Marker position={center} icon={PEAK} />
      )}
      <FitBounds points={all} center={center} />
    </MapContainer>
  );
}
