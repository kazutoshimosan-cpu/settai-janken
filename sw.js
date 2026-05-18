const CACHE = 'settai-janken-v8';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './characters/cat/cat_normal.png',
  './characters/cat/cat_win.png',
  './characters/cat/cat_lose.png',
  './characters/cat/cat_dogeza.png',
  './characters/cat/cat_fired.png',
  './characters/rat/rat_normal_large.png',
  './characters/rat/rat_happy_large.png',
  './characters/rat/rat_angry_large.png',
  './characters/ox/ox_normal.png',
  './characters/ox/ox_happy.png',
  './characters/ox/ox_angry.png',
  './characters/tiger/tiger_normal.png',
  './characters/tiger/tiger_happy.png',
  './characters/tiger/tiger_angry.png',
  './characters/tiger/tiger_expr_katte.png',
  './characters/tiger/tiger_expr_makero.png',
  './characters/tiger/tiger_expr_aiko.png',
  './characters/boar/boar_normal.png',
  './characters/boar/boar_happy.png',
  './characters/boar/boar_angry.png',
  './characters/boar/boar_charge.png',
  './characters/rabbit/rabbit_normal.png',
  './characters/rabbit/rabbit_happy.png',
  './characters/rabbit/rabbit_angry.png',
  './characters/rooster/rooster_normal.png',
  './characters/rooster/rooster_happy.png',
  './characters/rooster/rooster_angry.png',
  './characters/horse/horse_normal.png',
  './characters/horse/horse_happy.png',
  './characters/horse/horse_angry.png',
  './characters/snake/snake_normal.png',
  './characters/snake/snake_happy.png',
  './characters/snake/snake_angry.png',
  './characters/sheep/sheep_normal.png',
  './characters/sheep/sheep_happy.png',
  './characters/sheep/sheep_angry.png',
  './characters/monkey/monkey_normal.png',
  './characters/monkey/monkey_happy.png',
  './characters/monkey/monkey_angry.png',
  './characters/dog/dog_normal.png',
  './characters/dog/dog_happy.png',
  './characters/dog/dog_angry.png',
  './characters/dragon/dragon_normal.png',
  './characters/dragon/dragon_happy.png',
  './characters/dragon/dragon_angry.png',
  './backgrounds/background_construction.png',
  './backgrounds/background_office.png',
  './backgrounds/background_meeting_room.png',
  './backgrounds/background_senior_executive_office重役室.png',
  './backgrounds/background_executive_office_employee_view社長室.png',
  './backgrounds/title_bg.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
