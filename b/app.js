// B 版：MapLibre + Carto 免費底圖，不用 key
// 底圖來源標示 OSM + CARTO，符合授權
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [121.38, 25.02],
  zoom: 10,
  attributionControl: true
});
map.addControl(new maplibregl.NavigationControl(), 'top-right');

let allParks = [];
let activeTag = '全部';

async function load() {
  const res = await fetch('./parks.json');
  allParks = await res.json();
  buildFilters();
  render();
  document.getElementById('count').textContent = `共 ${allParks.length} 座`;
}

function buildFilters() {
  const tags = ['全部', ...new Set(allParks.flatMap(p => p.tags || []))];
  const box = document.getElementById('filters');
  box.innerHTML = '';
  tags.forEach(t => {
    const b = document.createElement('button');
    b.textContent = t;
    if (t === activeTag) b.classList.add('on');
    b.onclick = () => { activeTag = t; buildFilters(); render(); };
    box.appendChild(b);
  });
}

let markers = [];
function render() {
  markers.forEach(m => m.remove());
  markers = [];
  const list = allParks.filter(p => activeTag === '全部' || (p.tags||[]).includes(activeTag));
  for (const p of list) {
    const el = document.createElement('div');
    el.style.cssText = 'width:14px;height:14px;border-radius:50%;background:#ff5a3c;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)';
    const popup = new maplibregl.Popup({ offset: 12 }).setHTML(
      `<b>${p.name}</b><br>${p.city || ''}${p.district} · ${p.age} · ${p.stay}` +
      `<div class="popup-tags">${(p.tags||[]).join(' · ')}</div>` +
      `<a class="popup-link" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}" target="_blank">導航</a>` +
      (p.source ? ` · <a class="popup-link" href="${p.source}" target="_blank">看原文</a>` : '') +
      (p.approx ? `<div class="popup-tags">座標約略，待確認</div>` : '')
    );
    const m = new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(popup).addTo(map);
    markers.push(m);
  }
}
load();
