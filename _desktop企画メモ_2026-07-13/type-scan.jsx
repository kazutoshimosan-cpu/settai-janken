import React, { useState, useMemo } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";

const QUESTIONS = [
  { axis: ["E", "I"], text: "週末の理想の過ごし方は？", options: [
    { v: "E", t: "友達を誘ってワイワイ過ごす" },
    { v: "I", t: "一人か気の合う相手とゆっくり過ごす" },
  ]},
  { axis: ["E", "I"], text: "初対面が多い場に行くと？", options: [
    { v: "E", t: "自然とテンションが上がる" },
    { v: "I", t: "早めに帰りたくなる" },
  ]},
  { axis: ["E", "I"], text: "アイデアが浮かんだ時は？", options: [
    { v: "E", t: "すぐ誰かに話したくなる" },
    { v: "I", t: "まず自分の中で整理したい" },
  ]},
  { axis: ["E", "I"], text: "エネルギーを回復させる方法は？", options: [
    { v: "E", t: "人と話して発散する" },
    { v: "I", t: "一人の時間にこもる" },
  ]},
  { axis: ["E", "I"], text: "チームでの立ち位置は？", options: [
    { v: "E", t: "率先して発言する" },
    { v: "I", t: "聞き役に回ることが多い" },
  ]},
  { axis: ["S", "N"], text: "説明を受ける時に好きなのは？", options: [
    { v: "S", t: "具体的な例や手順" },
    { v: "N", t: "全体像や可能性の話" },
  ]},
  { axis: ["S", "N"], text: "物事を判断する基準は？", options: [
    { v: "S", t: "実際の経験や事実" },
    { v: "N", t: "直感やひらめき" },
  ]},
  { axis: ["S", "N"], text: "好きな会話のテーマは？", options: [
    { v: "S", t: "今起きてる現実的な話" },
    { v: "N", t: "抽象的な理論や未来の話" },
  ]},
  { axis: ["S", "N"], text: "新しいことを始める時は？", options: [
    { v: "S", t: "まず現実的な手順を固める" },
    { v: "N", t: "まずビジョンや可能性を広げる" },
  ]},
  { axis: ["S", "N"], text: "気になるのはどっち？", options: [
    { v: "S", t: "今、目の前にあるもの" },
    { v: "N", t: "その先にある意味" },
  ]},
  { axis: ["T", "F"], text: "誰かに相談された時、まず考えるのは？", options: [
    { v: "T", t: "客観的に見て何が正しいか" },
    { v: "F", t: "相手がどう感じているか" },
  ]},
  { axis: ["T", "F"], text: "決断する時に重視するのは？", options: [
    { v: "T", t: "論理的な整合性" },
    { v: "F", t: "人間関係や気持ち" },
  ]},
  { axis: ["T", "F"], text: "指摘を受けた時、優先するのは？", options: [
    { v: "T", t: "内容が正しいかどうか" },
    { v: "F", t: "言い方や配慮" },
  ]},
  { axis: ["T", "F"], text: "チームでの役割は？", options: [
    { v: "T", t: "分析して最適解を出す" },
    { v: "F", t: "雰囲気を整えて調整する" },
  ]},
  { axis: ["T", "F"], text: "「フェア」だと感じるのは？", options: [
    { v: "T", t: "ルールを一貫して適用すること" },
    { v: "F", t: "状況や気持ちに配慮すること" },
  ]},
  { axis: ["J", "P"], text: "旅行の計画は？", options: [
    { v: "J", t: "事前にしっかり決めておく" },
    { v: "P", t: "現地の気分で決めたい" },
  ]},
  { axis: ["J", "P"], text: "締め切りへの姿勢は？", options: [
    { v: "J", t: "早めに終わらせて安心したい" },
    { v: "P", t: "ギリギリの追い込みで集中する" },
  ]},
  { axis: ["J", "P"], text: "予定が急に変わったら？", options: [
    { v: "J", t: "少しストレスを感じる" },
    { v: "P", t: "むしろ楽しめる" },
  ]},
  { axis: ["J", "P"], text: "作業の進め方は？", options: [
    { v: "J", t: "計画通りにきっちり進めたい" },
    { v: "P", t: "その場の流れに任せたい" },
  ]},
  { axis: ["J", "P"], text: "デスクや部屋の状態は？", options: [
    { v: "J", t: "整理整頓されてないと落ち着かない" },
    { v: "P", t: "多少散らかってても気にならない" },
  ]},
];

const TYPES = {
  INTJ: { name: "建築家", tags: ["戦略", "独立", "理想主義"], desc: "一人で戦略を練るのが得意な設計主義者。壮大なビジョンを描き、それを実現する緻密なプランを組み立てることに喜びを感じる。" },
  INTP: { name: "論理学者", tags: ["探究", "論理", "独創性"], desc: "知的好奇心の探求者。物事の仕組みを解き明かすことに夢中になり、筋が通っているかどうかを何より重視する。" },
  ENTJ: { name: "指揮官", tags: ["統率", "効率", "野心"], desc: "生まれながらの統率者。目標に向かって周りを動かすのが得意で、非効率なものを見過ごせないタイプ。" },
  ENTP: { name: "討論者", tags: ["発想", "議論好き", "好奇心"], desc: "アイデアの発明家。既存の枠組みに疑問を投げかけ、議論そのものを楽しむ挑戦者。" },
  INFJ: { name: "提唱者", tags: ["洞察", "理想", "静かな情熱"], desc: "静かな理想主義者。人の内面を深く理解し、意味のあることに情熱を注ぐ。" },
  INFP: { name: "仲介者", tags: ["誠実", "内省", "物語性"], desc: "価値観に忠実な夢想家。自分の内側にある信念や物語を大切にし、それを表現する方法を探し続ける。" },
  ENFJ: { name: "主人公", tags: ["共感", "牽引力", "情熱"], desc: "人を導くカリスマ。周りの可能性を引き出し、みんなが前を向けるように背中を押す。" },
  ENFP: { name: "広報運動家", tags: ["自由", "好奇心", "人懐っこさ"], desc: "自由な発想の火付け役。人とのつながりと新しい可能性に、いつもワクワクしている。" },
  ISTJ: { name: "管理者", tags: ["責任感", "堅実", "几帳面"], desc: "責任感の塊。決めたことを最後までやり遂げる、信頼される実務家。" },
  ISFJ: { name: "擁護者", tags: ["献身", "気配り", "安定志向"], desc: "縁の下の力持ち。周りの人をそっと支え、安心できる環境を作るのが得意。" },
  ESTJ: { name: "幹部", tags: ["秩序", "実行力", "リーダーシップ"], desc: "秩序を作る実行者。物事を効率よく回す仕組みづくりが得意なリーダータイプ。" },
  ESFJ: { name: "領事官", tags: ["協調", "世話好き", "社交性"], desc: "場の空気を大事にする世話役。みんなが心地よくいられるよう、いつも気を配る。" },
  ISTP: { name: "巨匠", tags: ["実践", "冷静", "職人気質"], desc: "手を動かして理解するタイプ。冷静に状況を分析し、実践的に問題を解決する。" },
  ISFP: { name: "冒険家", tags: ["感性", "マイペース", "美意識"], desc: "感性で生きるアーティスト。自分のペースを大事にしながら、美しいものや面白いことに惹かれる。" },
  ESTP: { name: "起業家", tags: ["行動力", "大胆", "現実対応"], desc: "今この瞬間を生きる行動派。リスクを恐れず、その場で最適な一手を打つ。" },
  ESFP: { name: "エンターテイナー", tags: ["陽気", "即興力", "盛り上げ役"], desc: "場を盛り上げるムードメーカー。今を全力で楽しみ、その熱を周りにも伝染させる。" },
};

const AXES = [
  { key: "EI", left: "E", right: "I", label: "エネルギーの方向", leftLabel: "外向", rightLabel: "内向" },
  { key: "SN", left: "S", right: "N", label: "情報の捉え方", leftLabel: "現実", rightLabel: "直感" },
  { key: "TF", left: "T", right: "F", label: "判断の仕方", leftLabel: "思考", rightLabel: "感情" },
  { key: "JP", left: "J", right: "P", label: "外界への接し方", leftLabel: "計画", rightLabel: "柔軟" },
];

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [qIndex, setQIndex] = useState(0);
  const [scores, setScores] = useState({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [fileNo] = useState(() => Math.floor(1000 + Math.random() * 9000));

  const total = QUESTIONS.length;

  const typeCode = useMemo(() => {
    return AXES.map(a => (scores[a.left] >= scores[a.right] ? a.left : a.right)).join("");
  }, [scores]);

  const typeInfo = TYPES[typeCode];

  function answer(v) {
    setScores(prev => ({ ...prev, [v]: prev[v] + 1 }));
    if (qIndex + 1 < total) {
      setQIndex(qIndex + 1);
    } else {
      setScreen("result");
    }
  }

  function restart() {
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setQIndex(0);
    setScreen("intro");
  }

  const q = QUESTIONS[qIndex];
  const progressPct = screen === "quiz" ? ((qIndex) / total) * 100 : 0;

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes stampIn {
          from { opacity: 0; transform: scale(1.15) rotate(-8deg); }
          to { opacity: 1; transform: scale(1) rotate(-4deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        .ts-fade { animation: fadeSlide 0.35s ease both; }
        .ts-stamp { animation: stampIn 0.5s cubic-bezier(.2,.9,.3,1.2) both; }
        .ts-opt {
          transition: border-color 0.15s ease, background 0.15s ease, transform 0.1s ease;
        }
        .ts-opt:hover { border-color: #F2A340 !important; transform: translateY(-1px); }
        .ts-opt:active { transform: translateY(0); }
        .ts-btn:hover { filter: brightness(1.08); }
      `}</style>

      <div style={styles.frame}>
        <div style={styles.header}>
          <span style={styles.headerLabel}>CASE FILE No. {fileNo}</span>
          <span style={styles.headerLabel}>TYPE // SCAN</span>
        </div>

        {screen === "intro" && (
          <div className="ts-fade" style={styles.section}>
            <div style={styles.eyebrow}>PERSONALITY ANALYSIS SYSTEM</div>
            <h1 style={styles.h1}>性格診断ターミナル</h1>
            <p style={styles.body}>
              全{total}問の質問に、直感で答えるだけ。正解・不正解はありません。
              回答をもとに4つの軸を測定し、あなたのタイプを1枚のレポートにまとめます。
            </p>
            <button className="ts-btn" style={styles.primaryBtn} onClick={() => setScreen("quiz")}>
              分析を開始する <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {screen === "quiz" && (
          <div key={qIndex} className="ts-fade" style={styles.section}>
            <div style={styles.progressRow}>
              <span style={styles.mono}>Q.{String(qIndex + 1).padStart(2, "0")} / {total}</span>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
              </div>
            </div>
            <h2 style={styles.h2}>{q.text}</h2>
            <div style={styles.optionCol}>
              {q.options.map(opt => (
                <button
                  key={opt.v}
                  className="ts-opt"
                  style={styles.optionCard}
                  onClick={() => answer(opt.v)}
                >
                  <span style={styles.optionTag}>{opt.v}</span>
                  <span style={styles.optionText}>{opt.t}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === "result" && typeInfo && (
          <div className="ts-fade" style={styles.section}>
            <div style={styles.eyebrow}>ANALYSIS COMPLETE</div>
            <div style={styles.stampWrap}>
              <div className="ts-stamp" style={styles.stamp}>
                <div style={styles.stampCode}>{typeCode}</div>
                <div style={styles.stampName}>— {typeInfo.name} —</div>
              </div>
            </div>
            <div style={styles.tagRow}>
              {typeInfo.tags.map(t => (
                <span key={t} style={styles.tag}>{t}</span>
              ))}
            </div>
            <p style={styles.body}>{typeInfo.desc}</p>

            <div style={styles.gaugeBlock}>
              <div style={styles.eyebrowSmall}>AXIS READOUT</div>
              {AXES.map(a => {
                const l = scores[a.left], r = scores[a.right];
                const pct = (l / (l + r)) * 100;
                return (
                  <div key={a.key} style={styles.gaugeRow}>
                    <div style={styles.gaugeLabels}>
                      <span style={styles.mono}>{a.leftLabel} ({a.left})</span>
                      <span style={styles.mono}>{a.rightLabel} ({a.right})</span>
                    </div>
                    <div style={styles.gaugeTrack}>
                      <div style={{ ...styles.gaugeFill, width: `${pct}%` }} />
                      <div style={styles.gaugeTick} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="ts-btn" style={styles.secondaryBtn} onClick={restart}>
              <RotateCcw size={16} strokeWidth={2.5} /> もう一度診断する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0F2942",
    backgroundImage:
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 40px)",
    display: "flex",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Space Mono', monospace",
  },
  frame: {
    width: "100%",
    maxWidth: 480,
    border: "1px solid rgba(234,242,250,0.15)",
    borderRadius: 4,
    background: "rgba(15,41,66,0.4)",
    backdropFilter: "blur(2px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 18px",
    borderBottom: "1px solid rgba(234,242,250,0.15)",
  },
  headerLabel: {
    fontSize: 11,
    letterSpacing: "0.08em",
    color: "#7C9CB8",
  },
  section: {
    padding: "28px 22px 32px",
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.2em",
    color: "#F2A340",
    marginBottom: 10,
    fontWeight: 700,
  },
  eyebrowSmall: {
    fontSize: 10,
    letterSpacing: "0.18em",
    color: "#7C9CB8",
    marginBottom: 12,
  },
  h1: {
    fontFamily: "'Oswald', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    fontSize: "clamp(26px, 7vw, 34px)",
    color: "#EAF2FA",
    margin: "0 0 14px",
    fontWeight: 700,
  },
  h2: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: "clamp(18px, 5vw, 21px)",
    color: "#EAF2FA",
    fontWeight: 600,
    margin: "14px 0 20px",
    lineHeight: 1.4,
  },
  body: {
    fontSize: 14,
    lineHeight: 1.9,
    color: "#C3D4E3",
    margin: "0 0 20px",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#F2A340",
    color: "#0F2942",
    border: "none",
    borderRadius: 2,
    padding: "13px 20px",
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: "0.03em",
    cursor: "pointer",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    color: "#F2A340",
    border: "1px solid #F2A340",
    borderRadius: 2,
    padding: "11px 18px",
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "0.03em",
    cursor: "pointer",
    marginTop: 8,
  },
  mono: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    color: "#7C9CB8",
    letterSpacing: "0.05em",
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    background: "rgba(234,242,250,0.12)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#F2A340",
    transition: "width 0.3s ease",
  },
  optionCol: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  optionCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    textAlign: "left",
    background: "#163A5C",
    border: "1px solid rgba(234,242,250,0.18)",
    borderRadius: 3,
    padding: "16px 16px",
    cursor: "pointer",
  },
  optionTag: {
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700,
    fontSize: 13,
    color: "#F2A340",
    border: "1px solid #F2A340",
    borderRadius: 2,
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionText: {
    fontSize: 14,
    color: "#EAF2FA",
    lineHeight: 1.5,
  },
  stampWrap: {
    display: "flex",
    justifyContent: "center",
    margin: "18px 0 20px",
  },
  stamp: {
    border: "3px double #F2A340",
    borderRadius: 6,
    padding: "18px 30px",
    textAlign: "center",
    transform: "rotate(-4deg)",
  },
  stampCode: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: 40,
    fontWeight: 700,
    color: "#F2A340",
    letterSpacing: "0.05em",
  },
  stampName: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    color: "#EAF2FA",
    marginTop: 4,
  },
  tagRow: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 18,
  },
  tag: {
    fontSize: 11,
    color: "#7C9CB8",
    border: "1px solid rgba(124,156,184,0.4)",
    borderRadius: 20,
    padding: "4px 12px",
  },
  gaugeBlock: {
    marginTop: 6,
    marginBottom: 22,
    background: "#163A5C",
    border: "1px solid rgba(234,242,250,0.12)",
    borderRadius: 4,
    padding: "16px 16px 6px",
  },
  gaugeRow: {
    marginBottom: 16,
  },
  gaugeLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  gaugeTrack: {
    position: "relative",
    height: 6,
    background: "rgba(234,242,250,0.12)",
    borderRadius: 3,
    overflow: "hidden",
  },
  gaugeFill: {
    height: "100%",
    background: "#5FD4C4",
  },
  gaugeTick: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 1,
    background: "rgba(15,41,66,0.5)",
  },
};
