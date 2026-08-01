import React, { useState, useEffect, useRef } from "react";

// ============================================================
// 接待十二支占い 〜ネコの見立て〜  (最小プロト)
// GDD『限界！接待じゃんけん』準拠
// 3ギミックで接待スタンスを測定 → 生まれ干支とのズレを朱印で対比
// ============================================================

// --- 十二支データ（叩き台の2軸4象限） ---
// quadrant: HK(這いつくばり) / BM(場回し)  ×  DS(打算) / CG(忠義)
const ZODIAC = {
  mi:   { label: "巳", read: "ヘビ",   type: "完全犯罪型",   q: "HK-DS", one: "負けたと気づかせず負ける。接待の完全犯罪。", sym: "🐍" },
  ne:   { label: "子", read: "ネズミ", type: "立ち回り型",   q: "HK-DS", one: "誰に媚びれば得か一瞬で計算。要領の化身。", sym: "🐭" },
  tori: { label: "酉", read: "トリ",   type: "段取り型",     q: "HK-DS", one: "負けの手順書を事前に作る几帳面な忖度。", sym: "🐓" },
  inu:  { label: "戌", read: "イヌ",   type: "ど真ん中忠犬型", q: "HK-CG", one: "打算ゼロ。ただ相手のために負ける聖人。", sym: "🐕" },
  ushi: { label: "丑", read: "ウシ",   type: "我慢型",       q: "HK-CG", one: "何時間でも土下座で耐える鈍行の誠意。", sym: "🐂" },
  hitsuji:{label: "未", read: "ヒツジ", type: "同調型",       q: "HK-CG", one: "周りが負けるなら自分も。群れの空気で尽くす。", sym: "🐑" },
  u:    { label: "卯", read: "ウサギ", type: "愛嬌かわし型", q: "BM-DS", one: "可愛げで全部チャラにする天性の人たらし。", sym: "🐰" },
  saru: { label: "申", read: "サル",   type: "機転型",       q: "BM-DS", one: "笑わせて勝たせる。場を掌握する演出家。", sym: "🐵" },
  tatsu:{ label: "辰", read: "タツ",   type: "大物型",       q: "BM-DS", one: "接待する側のはずが、なぜか一番偉く見える。", sym: "🐉" },
  tora: { label: "寅", read: "トラ",   type: "ガチ勝ち型",   q: "BM-CG", one: "接待のはずが勝ってしまう。負けられない性。", sym: "🐯" },
  uma:  { label: "午", read: "ウマ",   type: "勢い空回り型", q: "BM-CG", one: "テンションで押すが方向がズレてる元気印。", sym: "🐎" },
  i:    { label: "亥", read: "イノシシ", type: "猪突接待型",  q: "BM-CG", one: "一途すぎて過剰接待。負けすぎて逆に失礼。", sym: "🐗" },
};
const ZODIAC_ORDER = ["ne","ushi","tora","u","tatsu","mi","uma","hitsuji","saru","tori","inu","i"];

// 隠しレア枠
const NEKO = { label: "猫", read: "ネコ", type: "規格外型", one: "接待を超越した存在。そもそも干支に入れません。", sym: "🐈" };

// 象限ごとの候補（絞り込みは軸の強弱で決定）
const QUADRANTS = {
  "HK-DS": ["mi","ne","tori"],
  "HK-CG": ["inu","ushi","hitsuji"],
  "BM-DS": ["u","saru","tatsu"],
  "BM-CG": ["tora","uma","i"],
};

// --- 判定ロジック ---
// dasan軸: マイナス=打算 / プラス=忠義
// heikou軸: マイナス=這いつくばり / プラス=場回し
function decideType(dasan, heikou) {
  // ドド真ん中はネコ（隠しレア）— 両軸ともほぼ0の時だけ
  if (Math.abs(dasan) <= 7 && Math.abs(heikou) <= 7) return { key: "neko", ...NEKO, neko: true };
  const q = (heikou < 0 ? "HK" : "BM") + "-" + (dasan < 0 ? "DS" : "CG");
  const pool = QUADRANTS[q];
  // 象限内の絞り込み: 2軸の強弱バランスで3体に割り振り（どの型も出るように）
  const sh = Math.abs(heikou), sd = Math.abs(dasan);
  let idx;
  if (sh >= sd * 1.6) idx = 0;       // 這い/場の軸が優勢＝象限の代表格
  else if (sd >= sh * 1.6) idx = 2;  // 打算/忠義の軸が優勢＝境界寄り
  else idx = 1;                       // 拮抗＝中間
  const key = pool[idx];
  return { key, ...ZODIAC[key], neko: false };
}

const BODY = "'Zen Kaku Gothic New', sans-serif";
const DISP = "'Dela Gothic One', sans-serif";

const COL = {
  washi: "#F2E9D3",
  washi2: "#EADFC2",
  sumi: "#1C1A17",
  shu: "#C8202E",     // 朱肉
  shuDark: "#9E1622",
  kin: "#B58A2E",
  faint: "#8A7E63",
};

export default function App() {
  const [phase, setPhase] = useState("intro"); // intro born g1 g2 g3 result
  const [born, setBorn] = useState(null);
  const [dasan, setDasan] = useState(0);
  const [heikou, setHeikou] = useState(0);
  const [carry, setCarry] = useState(null); // 育成: 前回結果の持ち越し
  const [result, setResult] = useState(null);
  const [playCount, setPlayCount] = useState(0);

  function addScore(dDasan, dHeikou) {
    setDasan((v) => clamp(v + dDasan));
    setHeikou((v) => clamp(v + dHeikou));
  }

  function startDiagnosis() {
    // 育成: 前回の型があれば30%だけ持ち越す（じわじわ変わる）
    if (carry) {
      setDasan(Math.round(carry.dasan * 0.3));
      setHeikou(Math.round(carry.heikou * 0.3));
    } else {
      setDasan(0); setHeikou(0);
    }
    setPhase("g1");
  }

  function finish() {
    const r = decideType(dasan, heikou);
    setResult(r);
    setCarry({ dasan, heikou });
    setPlayCount((c) => c + 1);
    setPhase("result");
  }

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        @keyframes rise { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hanko { 0%{opacity:0;transform:scale(1.6) rotate(-12deg)} 60%{opacity:1;transform:scale(.92) rotate(-6deg)} 100%{transform:scale(1) rotate(-7deg)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes flash { 0%,100%{opacity:1} 50%{opacity:.35} }
        @media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }
        .rise{ animation: rise .4s ease both; }
        .press{ transition: transform .08s ease, filter .12s ease; }
        .press:active{ transform: scale(.96); }
        .zbtn:hover{ border-color:${COL.shu}!important; }
        .rps:hover{ background:${COL.shu}!important; color:${COL.washi}!important; }
      `}</style>

      <div style={S.frame}>
        <Header phase={phase} playCount={playCount} />
        {phase === "intro" && <Intro onNext={() => setPhase("born")} playCount={playCount} />}
        {phase === "born" && <Born onPick={(z) => { setBorn(z); startDiagnosis(); }} />}
        {phase === "g1" && <GimmickNezumi onDone={(dd, dh) => { addScore(dd, dh); setPhase("g2"); }} />}
        {phase === "g2" && <GimmickTora onDone={(dd, dh) => { addScore(dd, dh); setPhase("g3"); }} />}
        {phase === "g3" && <GimmickSaru onDone={(dd, dh) => { addScore(dd, dh); finish(); }} />}
        {phase === "result" && result && (
          <Result born={born} result={result} dasan={dasan} heikou={heikou}
                  again={() => setPhase("born")} playCount={playCount} />
        )}
      </div>
    </div>
  );
}

function clamp(v){ return Math.max(-100, Math.min(100, v)); }

// ---------- Header ----------
function Header({ phase, playCount }) {
  const step = { g1:1, g2:2, g3:3 }[phase];
  return (
    <div style={S.header}>
      <span style={S.brand}>十二支建設 人事査定</span>
      {step ? <span style={S.stepTag}>接待 {step} / 3</span>
            : <span style={S.stepTag}>{playCount>0 ? `${playCount}回目` : "見立て所"}</span>}
    </div>
  );
}

// ---------- Intro ----------
function Intro({ onNext, playCount }) {
  return (
    <div className="rise" style={S.pad}>
      <div style={S.nekoBadge}>🐈</div>
      <div style={S.eyebrow}>猫式・接待見立て</div>
      <h1 style={S.h1}>接待<br/>十二支占い</h1>
      <p style={S.lead}>
        干支に入れなかったオレが、あんたの“接待スタンス”を見立てたる。
        三つの場面をくぐれば、あんたが十二支の<b>どの型</b>か分かる。
        ——生まれの干支と、どれだけズレてるかもな。
      </p>
      <button className="press" style={S.primary} onClick={onNext}>
        {playCount > 0 ? "もう一度 見立てる" : "見立てを始める"}
      </button>
      <div style={S.smallNote}>※ 正解・不正解はない。振る舞いで型が決まる。出る型は毎回すこし揺れる。</div>
    </div>
  );
}

// ---------- 生まれ干支選択 ----------
function Born({ onPick }) {
  return (
    <div className="rise" style={S.pad}>
      <div style={S.eyebrow}>其の一</div>
      <h2 style={S.h2}>生まれ干支は？</h2>
      <p style={S.sub}>本性のほうや。接待は関係ない。素直に選んでや。</p>
      <div style={S.grid}>
        {ZODIAC_ORDER.map((k) => (
          <button key={k} className="zbtn press" style={S.zcell} onClick={() => onPick(k)}>
            <span style={S.zsym}>{ZODIAC[k].sym}</span>
            <span style={S.zlabel}>{ZODIAC[k].label}</span>
            <span style={S.zread}>{ZODIAC[k].read}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- ギミック1：ネズミの陽動ラッシュ ----------
// 指示がコロコロ変わる先輩に「どう構えるか」＝振る舞いで測る（正誤なし）
function GimmickNezumi({ onDone }) {
  const ORDERS = ["勝て", "負けろ", "あいこ"];
  const [idx, setIdx] = useState(0);
  const [msg, setMsg] = useState(null);
  const flipRef = useRef(null);

  useEffect(() => {
    flipRef.current = setInterval(() => setIdx((i) => (i + 1) % 3), 240);
    return () => clearInterval(flipRef.current);
  }, []);

  function decide(kind) {
    clearInterval(flipRef.current);
    // wait=止まるまで待つ(打算) / smile=愛想で合わせる(這いつくばり) / own=自分のペース(場回し)
    const map = {
      wait:  { d: -15, h: -4,  t: "動かず、止まるまで待った。落ち着いてるな" },
      smile: { d: -3,  h: -15, t: "とりあえず愛想笑いで合わせた。そつがないな" },
      own:   { d: +6,  h: +16, t: "構わず自分の間合いで出た。マイペースやな" },
    }[kind];
    setMsg({ t: map.t });
    setTimeout(() => onDone(map.d, map.h), 950);
  }

  return (
    <div className="rise" style={S.pad}>
      <div style={S.bossRow}>
        <span style={S.bossSym}>🐭</span>
        <div>
          <div style={S.bossName}>子（ネズミ）の先輩</div>
          <div style={S.bossFeint}>陽動ラッシュ</div>
        </div>
      </div>
      <p style={S.sub}>指示がめまぐるしく変わって、先輩がせっついてくる。こんな時、あんたは——</p>

      <div style={S.orderBox}>
        <span style={{ ...S.orderText, animation: "flash .48s infinite" }}>{ORDERS[idx]}！</span>
        <span style={S.orderState}>…先輩、指示コロコロ変わる…</span>
      </div>

      <div style={S.choiceCol}>
        <button className="zbtn press" style={S.choiceBtn} onClick={() => decide("wait")}>
          <b>止まるまでジッと待つ</b><span style={S.choiceSub}>振り回されず、確定してから動く</span>
        </button>
        <button className="zbtn press" style={S.choiceBtn} onClick={() => decide("smile")}>
          <b>愛想笑いで合わせにいく</b><span style={S.choiceSub}>とにかく機嫌を損ねないように</span>
        </button>
        <button className="zbtn press" style={S.choiceBtn} onClick={() => decide("own")}>
          <b>自分のペースで出す</b><span style={S.choiceSub}>振り回されるのは性に合わない</span>
        </button>
      </div>
      {msg && <div style={{ ...S.judge, color: COL.shuDark, marginTop: 16 }}>{msg.t}</div>}
    </div>
  );
}

// ---------- ギミック2：トラの威圧の沈黙 ----------
// 何も言わない無言の圧に「どう出るか」＝振る舞いで測る（正誤なし）
function GimmickTora({ onDone }) {
  const [msg, setMsg] = useState(null);

  function decide(kind) {
    // read=顔色を読む(這いつくばり) / low=下手に出て負けとく(忠義) / lighten=場を和ませる(場回し)
    const map = {
      read:    { d: -4,  h: -15, t: "じっと顔色をうかがった。よう見てるな" },
      low:     { d: +15, h: -6,  t: "先に頭を下げて場を収めた。義理堅いな" },
      lighten: { d: -2,  h: +16, t: "無言に耐えかねて話しかけた。ムードメーカーやな" },
    }[kind];
    setMsg({ t: map.t });
    setTimeout(() => onDone(map.d, map.h), 950);
  }

  return (
    <div className="rise" style={S.pad}>
      <div style={S.bossRow}>
        <span style={S.bossSym}>🐯</span>
        <div>
          <div style={S.bossName}>寅（トラ）の職長</div>
          <div style={S.bossFeint}>威圧の沈黙</div>
        </div>
      </div>
      <p style={S.sub}>トラの職長は<b>何も言わない</b>。無言のままジッと見てくる。この圧に、あんたは——</p>

      <div style={S.toraStage}>
        <div style={S.toraFace}>🐯</div>
        <div style={S.toraDesc}>「………」</div>
      </div>

      <div style={S.choiceCol}>
        <button className="zbtn press" style={S.choiceBtn} onClick={() => decide("read")}>
          <b>必死に顔色を読む</b><span style={S.choiceSub}>何を望んでるか探ろうとする</span>
        </button>
        <button className="zbtn press" style={S.choiceBtn} onClick={() => decide("low")}>
          <b>先に下手に出て負けとく</b><span style={S.choiceSub}>とにかく機嫌を損ねたくない</span>
        </button>
        <button className="zbtn press" style={S.choiceBtn} onClick={() => decide("lighten")}>
          <b>話しかけて場を和ませる</b><span style={S.choiceSub}>この空気、どうにかしたい</span>
        </button>
      </div>
      {msg && <div style={{ ...S.judge, color: COL.shuDark, marginTop: 16 }}>{msg.t}</div>}
    </div>
  );
}

// ---------- ギミック3：サルの手真似 ----------
// まず1手出す→真似される→どう出るか（自己との対峙）
function GimmickSaru({ onDone }) {
  const [stage, setStage] = useState("first"); // first mirror choose
  const [firstHand, setFirstHand] = useState(null);
  const [msg, setMsg] = useState(null);

  function chooseFirst(h) { setFirstHand(h); setStage("mirror"); }

  function decide(kind) {
    // kind: keep(貫く=忠義) / trick(裏をかく=打算) / match(合わせる=這いつくばり)
    const map = {
      keep:  { d: +16, h: +6,  t: "同じ手を貫いた。ブレないな" },
      trick: { d: -16, h: +2,  t: "裏をかいた。抜け目ないな" },
      match: { d: -2,  h: -16, t: "相手に合わせた。よく尽くすな" },
    }[kind];
    setMsg({ t: map.t });
    setTimeout(() => onDone(map.d, map.h), 1000);
  }

  return (
    <div className="rise" style={S.pad}>
      <div style={S.bossRow}>
        <span style={S.bossSym}>🐵</span>
        <div>
          <div style={S.bossName}>申（サル）の常務</div>
          <div style={S.bossFeint}>猿真似コピー</div>
        </div>
      </div>

      {stage === "first" && (
        <>
          <p style={S.sub}>「まず一発出してみろ。<b>参考にしてやる</b>」</p>
          <div style={S.rpsRow}>
            {["グー", "チョキ", "パー"].map((h) => (
              <button key={h} className="rps press" style={S.rpsBtn} onClick={() => chooseFirst(h)}>{h}</button>
            ))}
          </div>
        </>
      )}

      {stage === "mirror" && (
        <>
          <div style={S.mirrorBox}>
            <div style={S.mirrorLine}>あんたが出した手：<b>{firstHand}</b></div>
            <div style={S.mirrorArrow}>▼</div>
            <div style={S.mirrorLine}>サル「今、<b>参考にした</b>」→ 同じ<b>{firstHand}</b>を出してくる</div>
          </div>
          <p style={S.sub}>次の一手、どう出る？ 真似してくる相手に——</p>
          <div style={S.choiceCol}>
            <button className="zbtn press" style={S.choiceBtn} onClick={() => decide("keep")}>
              <b>同じ手を貫く</b><span style={S.choiceSub}>ブレずに自分を通す</span>
            </button>
            <button className="zbtn press" style={S.choiceBtn} onClick={() => decide("trick")}>
              <b>裏をかいて変える</b><span style={S.choiceSub}>相手の真似を逆手に取る</span>
            </button>
            <button className="zbtn press" style={S.choiceBtn} onClick={() => decide("match")}>
              <b>相手に合わせる</b><span style={S.choiceSub}>波風立てず立てておく</span>
            </button>
          </div>
        </>
      )}
      {msg && <div style={{ ...S.judge, color: COL.shuDark, marginTop: 18 }}>{msg.t}</div>}
    </div>
  );
}

// ---------- 結果 ----------
function Result({ born, result, dasan, heikou, again, playCount }) {
  const bornZ = ZODIAC[born];
  const gap = result.neko ? null : gapLevel(born, result.key);

  return (
    <div className="rise" style={S.pad}>
      <div style={S.eyebrow}>{result.neko ? "……規格外" : "見立て、出た"}</div>

      {/* 二枚看板 */}
      <div style={S.hankoRow}>
        <div style={S.hankoWrap}>
          <div style={S.hankoLabelTop}>生まれ</div>
          <div style={{ ...S.hanko, ...S.hankoSumi }}>
            <span style={S.hankoSym}>{bornZ.sym}</span>
            <span style={S.hankoJp}>{bornZ.label}</span>
          </div>
          <div style={S.hankoName}>{bornZ.read}年</div>
        </div>

        <div style={S.vs}>×</div>

        <div style={S.hankoWrap}>
          <div style={S.hankoLabelTop}>接待</div>
          <div className="hanko" style={{ ...S.hanko, ...S.hankoShu, animation: "hanko .6s ease both" }}>
            <span style={S.hankoSym}>{result.sym}</span>
            <span style={S.hankoJp}>{result.label}</span>
          </div>
          <div style={{ ...S.hankoName, color: COL.shuDark }}>{result.type}</div>
        </div>
      </div>

      <div style={S.resultDesc}>{result.one}</div>

      {/* ズレ演出 */}
      {!result.neko && (
        <div style={S.gapBox}>
          <div style={S.gapTitle}>{gap.title}</div>
          <div style={S.gapText}>{gap.body(bornZ, result)}</div>
        </div>
      )}
      {result.neko && (
        <div style={S.gapBox}>
          <div style={S.gapTitle}>猫、出ました。</div>
          <div style={S.gapText}>
            お前の接待は、どの型にも収まらん。這いつくばりも場回しも、打算も忠義も、
            全部ちょうど真ん中。……つまり干支に入れてもらえん側だ。オレと同じだな。
          </div>
        </div>
      )}

      {/* 軸メーター */}
      <div style={S.meterWrap}>
        <Meter label="接待の型" left="這いつくばり" right="場回し" value={heikou} />
        <Meter label="接待の心" left="打算" right="忠義" value={dasan} />
      </div>

      {playCount >= 2 && (
        <div style={S.growNote}>
          見立ては{playCount}回目。前回の傾きを引きずって、型は少しずつ動いている。
        </div>
      )}

      <button className="press" style={S.primary} onClick={again}>もう一度 見立てる</button>
      <div style={S.smallNote}>※ プロト版：生まれ干支の再選択から。診断値は一部持ち越される。</div>
    </div>
  );
}

function Meter({ label, left, right, value }) {
  const pct = (value + 100) / 2; // 0..100（左=0）
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={S.meterLabel}>{label}</div>
      <div style={S.meterEnds}><span>{left}</span><span>{right}</span></div>
      <div style={S.meterTrack}>
        <div style={S.meterMid} />
        <div style={{ ...S.meterDot, left: `calc(${pct}% - 7px)` }} />
      </div>
    </div>
  );
}

// ズレの度合い（生まれ象限 vs 接待象限）
function gapLevel(bornKey, resKey) {
  const bq = ZODIAC[bornKey].q;
  const rq = ZODIAC[resKey].q;
  if (bornKey === resKey) {
    return { title: "ズレ、なし。", body: (b, r) => `生まれも接待も${r.read}型。本性のまま接待してる、裏表のない人だ。良くも悪くも隠せないな。` };
  }
  const [bh, bd] = bq.split("-");
  const [rh, rd] = rq.split("-");
  const diff = (bh !== rh ? 1 : 0) + (bd !== rd ? 1 : 0);
  if (diff === 2) {
    return { title: "ズレ、最大。", body: (b, r) => `生まれは${b.read}なのに、接待現場じゃ真逆の${r.read}型。本性と処世術が正反対だ。……お前、外じゃ相当ちがう顔してるだろ。` };
  }
  return { title: "ズレ、あり。", body: (b, r) => `生まれ${b.read}、接待は${r.read}型。根っこは残しつつ、現場用に半分だけ自分を作り替えてる。器用な生き方だな。` };
}

// ============================================================
// styles
// ============================================================
const S = {
  root: {
    minHeight: "100vh", display: "flex", justifyContent: "center",
    background: COL.washi,
    backgroundImage:
      "radial-gradient(circle at 20% 10%, rgba(255,255,255,.5), transparent 40%)," +
      "radial-gradient(circle at 80% 90%, rgba(181,138,46,.10), transparent 45%)," +
      "repeating-linear-gradient(45deg, rgba(28,26,23,.020) 0 2px, transparent 2px 7px)",
    padding: "20px 14px", fontFamily: BODY, color: COL.sumi,
  },
  frame: {
    width: "100%", maxWidth: 440, background: COL.washi,
    border: `2px solid ${COL.sumi}`,
    boxShadow: "6px 6px 0 rgba(28,26,23,.85)",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 16px", borderBottom: `1.5px solid ${COL.sumi}`,
    background: COL.washi2,
  },
  brand: { fontSize: 12, fontWeight: 700, letterSpacing: ".08em", color: COL.sumi },
  stepTag: {
    fontSize: 11, fontWeight: 700, color: COL.washi, background: COL.shu,
    padding: "3px 10px", letterSpacing: ".05em",
  },
  pad: { padding: "26px 22px 30px" },

  eyebrow: { fontSize: 12, fontWeight: 700, color: COL.shu, letterSpacing: ".18em", marginBottom: 10 },
  nekoBadge: {
    width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 30, border: `2px solid ${COL.sumi}`, borderRadius: "50%",
    marginBottom: 14, background: COL.washi2,
  },
  h1: { fontFamily: DISP, fontSize: "clamp(38px,12vw,52px)", lineHeight: 1.05, margin: "0 0 18px", color: COL.sumi, letterSpacing: ".02em" },
  h2: { fontFamily: DISP, fontSize: "clamp(22px,6vw,28px)", margin: "4px 0 8px", color: COL.sumi },
  lead: { fontSize: 14.5, lineHeight: 1.95, color: COL.sumi, margin: "0 0 24px" },
  sub: { fontSize: 14, lineHeight: 1.8, color: COL.sumi, margin: "0 0 18px" },

  primary: {
    width: "100%", background: COL.shu, color: COL.washi, border: `2px solid ${COL.sumi}`,
    fontFamily: DISP, fontSize: 17, padding: "15px", cursor: "pointer",
    boxShadow: `3px 3px 0 ${COL.sumi}`, letterSpacing: ".04em",
  },
  smallNote: { fontSize: 11, color: COL.faint, marginTop: 12, lineHeight: 1.6 },

  // 生まれ干支グリッド
  grid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginTop: 6 },
  zcell: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
    padding: "12px 4px", background: COL.washi, border: `1.5px solid ${COL.sumi}`,
    cursor: "pointer",
  },
  zsym: { fontSize: 24, lineHeight: 1 },
  zlabel: { fontFamily: DISP, fontSize: 18, color: COL.sumi },
  zread: { fontSize: 10, color: COL.faint, letterSpacing: ".05em" },

  // ボス見出し
  bossRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  bossSym: {
    fontSize: 30, width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center",
    border: `2px solid ${COL.sumi}`, background: COL.washi2, flexShrink: 0,
  },
  bossName: { fontFamily: DISP, fontSize: 17, color: COL.sumi },
  bossFeint: { fontSize: 12, color: COL.shu, fontWeight: 700, letterSpacing: ".05em", marginTop: 2 },

  // ネズミ指示ボックス
  orderBox: {
    border: `2px solid ${COL.sumi}`, background: COL.sumi, color: COL.washi,
    padding: "22px 16px", textAlign: "center", marginBottom: 18, position: "relative",
  },
  orderLocked: { background: COL.shu, borderColor: COL.sumi },
  orderText: { fontFamily: DISP, fontSize: 34, display: "block" },
  orderState: { fontSize: 12, letterSpacing: ".1em", opacity: .85, display: "block", marginTop: 6 },

  rpsRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 },
  rpsBtn: {
    padding: "16px 4px", fontFamily: DISP, fontSize: 16, background: COL.washi,
    color: COL.sumi, border: `2px solid ${COL.sumi}`, cursor: "pointer",
  },
  judge: { textAlign: "center", fontWeight: 700, fontSize: 15, marginTop: 16, fontFamily: BODY },

  // トラ
  toraStage: {
    border: `2px solid ${COL.sumi}`, background: COL.washi2, padding: "22px 16px",
    textAlign: "center", marginBottom: 18,
  },
  toraFace: { fontSize: 52, marginBottom: 10, animation: "pulse 2.2s infinite" },
  toraDesc: { fontSize: 15, fontWeight: 700, color: COL.sumi, lineHeight: 1.6 },

  // サル
  mirrorBox: {
    border: `2px dashed ${COL.sumi}`, padding: "16px", marginBottom: 16, background: COL.washi2,
    textAlign: "center",
  },
  mirrorLine: { fontSize: 13.5, lineHeight: 1.7, color: COL.sumi },
  mirrorArrow: { color: COL.shu, fontWeight: 700, margin: "4px 0" },
  choiceCol: { display: "flex", flexDirection: "column", gap: 10 },
  choiceBtn: {
    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3,
    textAlign: "left", padding: "14px 16px", background: COL.washi,
    border: `1.5px solid ${COL.sumi}`, cursor: "pointer", fontSize: 15, color: COL.sumi,
  },
  choiceSub: { fontSize: 12, color: COL.faint, fontWeight: 400 },

  // 結果 二枚看板
  hankoRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 14, margin: "8px 0 20px" },
  hankoWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  hankoLabelTop: { fontSize: 11, letterSpacing: ".1em", color: COL.faint },
  hanko: {
    width: 104, height: 104, borderRadius: "50%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 2,
  },
  hankoSumi: { border: `3px solid ${COL.sumi}`, color: COL.sumi, background: "transparent" },
  hankoShu: { border: `3px solid ${COL.shu}`, color: COL.shu, background: "rgba(200,32,46,.06)", transform: "rotate(-7deg)" },
  hankoSym: { fontSize: 30, lineHeight: 1 },
  hankoJp: { fontFamily: DISP, fontSize: 26, lineHeight: 1 },
  hankoName: { fontSize: 13, fontWeight: 700, color: COL.sumi },
  vs: { fontFamily: DISP, fontSize: 22, color: COL.faint },

  resultDesc: {
    textAlign: "center", fontSize: 15, lineHeight: 1.8, color: COL.sumi,
    padding: "0 4px", marginBottom: 20, fontWeight: 500,
  },

  gapBox: { border: `2px solid ${COL.sumi}`, background: COL.washi2, padding: "16px 16px", marginBottom: 20 },
  gapTitle: { fontFamily: DISP, fontSize: 17, color: COL.shu, marginBottom: 8 },
  gapText: { fontSize: 14, lineHeight: 1.85, color: COL.sumi },

  meterWrap: { marginBottom: 18 },
  meterLabel: { fontSize: 12, fontWeight: 700, color: COL.faint, marginBottom: 6, letterSpacing: ".05em" },
  meterEnds: { display: "flex", justifyContent: "space-between", fontSize: 12, color: COL.sumi, marginBottom: 6, fontWeight: 700 },
  meterTrack: { position: "relative", height: 8, background: COL.washi2, border: `1.5px solid ${COL.sumi}` },
  meterMid: { position: "absolute", left: "50%", top: -3, bottom: -3, width: 1, background: COL.faint },
  meterDot: { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: "50%", background: COL.shu, border: `2px solid ${COL.sumi}` },

  growNote: { fontSize: 12.5, color: COL.shuDark, fontWeight: 700, textAlign: "center", marginBottom: 16, lineHeight: 1.6 },
};
