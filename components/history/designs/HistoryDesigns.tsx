"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import { useUiPreferences } from "@/components/providers/MuiProvider";
import { demoRoute, speedColor, speedColors, timeLabel } from "./demo-route";
import styles from "./history-designs.module.css";

const PreviewMap = dynamic(() => import("./HistoryPreviewMap"), { ssr: false, loading: () => <div className={styles.loading}>กำลังโหลดแผนที่…</div> });
const concepts = [
  { name: "Map Focus", tag: "พื้นที่ให้เส้นทาง", text: "แผนที่เต็มพื้นที่ แผงข้อมูลลอยและแถบเล่นด้านล่าง ใกล้เคียง realtime มากที่สุด", score: 15 },
  { name: "Trip Sidebar", tag: "เลือกทริปแล้วดูเลย", text: "ข้อมูลการเดินทางอยู่ซ้าย แผนที่อยู่ขวา เหมาะกับการเปิดดูประวัติเป็นเที่ยว", score: 14 },
  { name: "Timeline Studio", tag: "อ่านความเร็วตามเวลา", text: "ขยาย timeline พร้อมกราฟความเร็ว กดช่วงที่สนใจแล้วดูตำแหน่งบนแผนที่ทันที", score: 14 },
  { name: "Split Inspector", tag: "ตรวจทีละพิกัด", text: "แผนที่คู่กับรายการ GPS เลือกแถวเพื่อย้อนดูจุดนั้น เหมาะกับการตรวจสอบรายละเอียด", score: 13 },
];
const duration = demoRoute.at(-1)!.seconds;

export default function HistoryDesigns() {
  const { mode, toggleMode } = useUiPreferences();
  const [variant, setVariant] = useState(0);
  const [cursor, setCursor] = useState(70);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const pointIndex = Math.min(Math.floor(cursor / 10), demoRoute.length - 1);
  const point = demoRoute[pointIndex];
  const ended = cursor >= duration;

  useEffect(() => {
    if (!playing || ended) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = (now - last) / 1000;
      last = now;
      setCursor(value => Math.min(duration, value + elapsed * rate));
    }, 80);
    return () => window.clearInterval(timer);
  }, [playing, rate, ended]);

  const seek = (value: number) => { setCursor(value); setPlaying(false); };
  const summary = <section className={styles.summary}>
    <div className={styles.eyebrow}>VEHICLE HISTORY <span>ข้อมูลจำลอง</span></div>
    <h2>ย้อนดูทุกการเดินทาง</h2>
    <div className={styles.vehicle}><span className={styles.vehicleIcon}>↗</span><div><strong>รถตัวอย่าง 01</strong><small>DEMO-001 · รถคันเดียวตลอดเส้นทาง</small></div></div>
    <div className={styles.date}>06 กันยายน 2026 <span>09:10 — 09:13:50</span></div>
    <div className={styles.journey}><div><b>A</b><span>จุดเริ่มต้น<small>{timeLabel(0)}</small></span></div><div><b>B</b><span>จุดสิ้นสุด<small>{timeLabel(duration)}</small></span></div></div>
    <div className={styles.stats}><div><strong>24</strong><small>จุด GPS</small></div><div><strong>3:50</strong><small>นาทีเดินทาง</small></div><div><strong>92</strong><small>สูงสุด km/h</small></div></div>
  </section>;
  const legend = <div className={styles.legend}><strong>ความเร็วเส้นทาง · km/h</strong><span><i style={{ background: speedColors.slow }} />0–70</span><span><i style={{ background: speedColors.medium }} />71–80</span><span><i style={{ background: speedColors.fast }} />81+</span><small>เส้นประ = ระยะที่เล่นผ่านแล้ว</small></div>;
  const graph = <div className={styles.graph} aria-label="กราฟความเร็ว กดแท่งเพื่อเลือกเวลา">{demoRoute.map((p, i) => <button key={i} title={`${timeLabel(p.seconds)} · ${p.speed} km/h`} aria-label={`ไปที่ ${timeLabel(p.seconds)} ความเร็ว ${p.speed} km/h`} onClick={() => seek(p.seconds)} style={{ height: `${Math.max(8,p.speed)}%`, background: speedColor(p.speed), opacity: i <= pointIndex ? 1 : 0.38 }} />)}</div>;
  const controls = <section className={styles.player} aria-label="ควบคุม playback">
    <div className={styles.playerHeading}><span className={styles.eyebrow}>PLAYBACK <b>{playing && !ended ? "กำลังเล่น" : ended ? "จบทริป" : "หยุดชั่วคราว"}</b></span><span className={styles.clock}>{timeLabel(cursor)} <small>/ {timeLabel(duration)}</small></span></div>
    {variant === 2 && graph}
    <input className={styles.scrubber} aria-label="เวลา playback" type="range" min={0} max={duration} step={0.1} value={cursor} onChange={event => seek(Number(event.target.value))} />
    <div className={styles.ticks}><span>09:10</span><span>09:11</span><span>09:12</span><span>09:13:50</span></div>
    <div className={styles.transport}><div className={styles.playButtons}><button aria-label="เริ่มใหม่" onClick={() => seek(0)}>↺</button><button className={styles.play} onClick={() => { if (ended) setCursor(0); setPlaying(ended || !playing); }}>{playing && !ended ? "Ⅱ หยุด" : "▶ เล่น"}</button><button aria-label="จุดก่อนหน้า" disabled={pointIndex === 0} onClick={() => seek(Math.max(0,(pointIndex - 1) * 10))}>‹</button><button aria-label="จุดถัดไป" disabled={ended} onClick={() => seek(Math.min(duration,(pointIndex + 1) * 10))}>›</button></div>
    <fieldset className={styles.rates}><legend>ความเร็วการเล่น</legend>{[0.5,1,2,4,8].map(value => <label key={value}><input type="radio" name="playback-rate" value={value} checked={rate === value} onChange={() => setRate(value)} /><span>{value}×</span></label>)}</fieldset></div>
  </section>;
  return <div className={styles.page} style={{ "--speed-green": speedColors.slow, "--speed-yellow": speedColors.medium, "--speed-red": speedColors.fast } as CSSProperties}>
    <AppSidebar />
    <main className={styles.main}>
      <header className={styles.header}><div><div className={styles.eyebrow}>DESIGN EXPLORATION / 2026</div><h1>History <span>ออกแบบการเดินทางย้อนหลัง</span></h1></div><div className={styles.headerActions}><button onClick={toggleMode}>{mode === "light" ? "◐ ธีมมืด" : "◑ ธีมสว่าง"}</button><Link href="/">กลับ realtime ↗</Link></div></header>
      <nav className={styles.concepts} aria-label="เลือกแบบดีไซน์">{concepts.map((concept, index) => <button key={concept.name} aria-pressed={variant === index} onClick={() => setVariant(index)}><span className={styles.number}>0{index + 1}</span><div><strong>{concept.name}</strong><small>{concept.tag}</small></div>{index === 0 && <em>แนะนำ</em>}</button>)}</nav>
      <div className={styles.description}><p>{concepts[variant].text}</p><span>INTERACTIVE PROTOTYPE · ข้อมูลพิกัดจำลอง</span></div>
      <div className={`${styles.workspace} ${styles[`variant${variant}`]}`}>
        <div className={styles.map}><PreviewMap cursor={cursor} /></div>
        <div className={styles.summarySlot}>{summary}</div>
        <div className={styles.speedReadout}><small>ความเร็ว ณ จุดที่เล่น</small><strong style={{ color: speedColor(point.speed) }}>{point.speed}<span>km/h</span></strong><small>จุด {pointIndex + 1} / 24 · {timeLabel(point.seconds)}</small></div>
        <div className={styles.legendSlot}>{legend}</div>
        <div className={styles.playerSlot}>{controls}</div>
        {variant === 3 && <aside className={styles.inspector}><div className={styles.inspectorTitle}><h3>พิกัดการเดินทาง</h3><span>24 จุด</span></div><div className={styles.tableScroll}><table><thead><tr><th>เวลา / พิกัด</th><th>km/h</th></tr></thead><tbody>{demoRoute.map((p,i) => <tr key={i} aria-selected={i === pointIndex} data-selected={i === pointIndex}><td><button onClick={() => seek(p.seconds)}>{timeLabel(p.seconds)}<small>{p.position[0].toFixed(4)}, {p.position[1].toFixed(4)}</small></button></td><td><span style={{ color: speedColor(p.speed) }}>● {p.speed}</span></td></tr>)}</tbody></table></div></aside>}
      </div>
      <footer className={styles.footer}><span>ธีม + ฟอนต์ + ชั้นแผนที่เดียวกับ realtime · เส้น history แยกจากข้อมูลสด</span><span>Industrial / Utilitarian · DFII {concepts[variant].score}/15</span></footer>
    </main>
  </div>;
}
