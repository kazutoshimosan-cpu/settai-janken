const CACHE = 'settai-janken-v22';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './audio/opening-ending.mp3',
  './audio/gameplay.mp3',
  './characters/cat/cat_normal.webp',
  './characters/cat/cat_win.webp',
  './characters/cat/cat_lose.webp',
  './characters/cat/cat_dogeza.webp',
  './characters/cat/cat_fired.webp',
  './characters/rat/rat_normal_large.webp',
  './characters/rat/rat_happy_large.webp',
  './characters/rat/rat_angry_large.webp',
  './characters/ox/ox_normal.webp',
  './characters/ox/ox_happy.webp',
  './characters/ox/ox_angry.webp',
  './characters/tiger/tiger_normal.webp',
  './characters/tiger/tiger_happy.webp',
  './characters/tiger/tiger_angry.webp',
  './characters/tiger/tiger_expr_katte.webp',
  './characters/tiger/tiger_expr_makero.webp',
  './characters/tiger/tiger_expr_aiko.webp',
  './characters/boar/boar_normal.webp',
  './characters/boar/boar_happy.webp',
  './characters/boar/boar_angry.webp',
  './characters/boar/boar_charge.webp',
  './characters/rabbit/rabbit_normal.webp',
  './characters/rabbit/rabbit_happy.webp',
  './characters/rabbit/rabbit_angry.webp',
  './characters/rooster/rooster_normal.webp',
  './characters/rooster/rooster_happy.webp',
  './characters/rooster/rooster_angry.webp',
  './characters/horse/horse_normal.webp',
  './characters/horse/horse_happy.webp',
  './characters/horse/horse_angry.webp',
  './characters/snake/snake_normal.webp',
  './characters/snake/snake_happy.webp',
  './characters/snake/snake_angry.webp',
  './characters/sheep/sheep_normal.webp',
  './characters/sheep/sheep_happy.webp',
  './characters/sheep/sheep_angry.webp',
  './characters/monkey/monkey_normal.webp',
  './characters/monkey/monkey_happy.webp',
  './characters/monkey/monkey_angry.webp',
  './characters/dog/dog_normal.webp',
  './characters/dog/dog_happy.webp',
  './characters/dog/dog_angry.webp',
  './characters/dragon/dragon_normal.webp',
  './characters/dragon/dragon_happy.webp',
  './characters/dragon/dragon_angry.webp',
  './backgrounds/background_construction.webp',
  './backgrounds/background_office.webp',
  './backgrounds/background_meeting_room.webp',
  './backgrounds/background_senior_executive_office重役室.webp',
  './backgrounds/background_executive_office_employee_view社長室.webp',
  './backgrounds/title_bg.webp',
  './opening/backgrounds/opening_bg_construction_morning.webp',
  './opening/panels/opening_01_cat_arrives.webp',
  './opening/panels/opening_02_rat_appears_v3.webp',
  './opening/panels/opening_03_rat_explains.webp',
  './opening/panels/opening_04_settai_janken_reveal.webp',
  './opening/panels/opening_05_rule_is_not_simple.webp',
  './opening/panels/opening_06_read_the_room.webp',
  './opening/panels/opening_07_long_day_begins.webp',
  './ending/backgrounds/ending_bg_construction_morning.webp',
  './ending/backgrounds/ending_bg_executive_office.webp',
  './ending/panels/ending_01_dragon_grants.webp',
  './ending/panels/ending_02_cat_reacts.webp',
  './ending/panels/ending_03_all_bosses.webp',
  './ending/panels/ending_04_rat_wrapup.webp',
  './ending/panels/ending_05_tomorrow.webp',
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
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
