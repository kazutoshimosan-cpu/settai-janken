const CACHE = 'settai-janken-v12';
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
  './opening/backgrounds/opening_bg_construction_morning.png',
  './opening/panels/opening_01_cat_arrives.png',
  './opening/panels/opening_02_rat_appears_v3.png',
  './opening/panels/opening_03_rat_explains.png',
  './opening/panels/opening_04_settai_janken_reveal.png',
  './opening/panels/opening_05_rule_is_not_simple.png',
  './opening/panels/opening_06_read_the_room.png',
  './opening/panels/opening_07_long_day_begins.png',
  './ending/backgrounds/ending_bg_construction_morning.png',
  './ending/backgrounds/ending_bg_executive_office.png',
  './ending/panels/ending_01_dragon_grants.png',
  './ending/panels/ending_02_cat_reacts.png',
  './ending/panels/ending_03_all_bosses.png',
  './ending/panels/ending_04_rat_wrapup.png',
  './ending/panels/ending_05_tomorrow.png',
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
