// AUTO-PORTED FROM CLAUDE ARTIFACT — Supabase version
import { useState, useEffect, useCallback } from "react";
import {
  loadAll, upsertStudent, deleteStudent as dbDeleteStudent,
  insertPayment, deletePayment as dbDeletePayment,
  insertLesson, deleteLesson as dbDeleteLesson,
  upsertSlot, deleteSlot as dbDeleteSlot,
  getStudentByPin, updateStudentSongs,
} from "./db.js";

const C = {
  bg:"#0f0e0c", surface:"#181714", surfaceAlt:"#1f1d19",
  border:"#2e2b24", borderLight:"#3d3a32",
  amber:"#d4a843", amberDim:"#8a6e2b", amberGlow:"rgba(212,168,67,0.12)",
  milk:"#f0ebe0", milkDim:"#a09890",
  red:"#c0503a", redGlow:"rgba(192,80,58,0.12)",
  green:"#5a8f6a", greenGlow:"rgba(90,143,106,0.12)",
  blue:"#4a7fa0", blueGlow:"rgba(74,127,160,0.12)",
};

const DAYS_RU   = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const DAYS_FULL = ["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.bg};color:${C.milk};font-family:'Montserrat',sans-serif;font-size:13px;min-height:100vh}
  .app{min-height:100vh;background:${C.bg}}

  /* LOGIN */
  .login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(ellipse 60% 50% at 50% 0%,rgba(212,168,67,.07) 0%,transparent 70%)}
  .login-card{width:100%;max-width:380px;background:${C.surface};border:1px solid ${C.border};padding:48px 40px}
  .login-logo{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:${C.amber};letter-spacing:.08em;margin-bottom:6px}
  .login-sub{font-size:11px;font-weight:300;color:${C.milkDim};letter-spacing:.15em;text-transform:uppercase;margin-bottom:40px}
  .field-label{font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:${C.milkDim};margin-bottom:8px;display:block}
  .field-input{width:100%;background:${C.surfaceAlt};border:1px solid ${C.border};color:${C.milk};font-family:'Montserrat',sans-serif;font-size:13px;padding:12px 16px;outline:none;transition:border-color .2s;letter-spacing:.1em}
  .field-input:focus{border-color:${C.amber}}
  .field-input::placeholder{color:${C.milkDim};opacity:.5}
  .field-group{margin-bottom:20px}
  .btn-primary{width:100%;background:${C.amber};color:${C.bg};border:none;padding:13px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;transition:opacity .2s;margin-top:8px}
  .btn-primary:hover{opacity:.85}
  .btn-primary:disabled{opacity:.4;cursor:not-allowed}
  .error-msg{background:${C.redGlow};border:1px solid rgba(192,80,58,.3);color:#e07060;padding:10px 14px;font-size:12px;margin-top:16px}

  /* LAYOUT */
  .header{border-bottom:1px solid ${C.border};padding:16px 28px;display:flex;align-items:center;justify-content:space-between;background:${C.surface};position:sticky;top:0;z-index:10}
  .header-logo{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:300;color:${C.amber};letter-spacing:.06em}
  .header-role{font-size:10px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:${C.milkDim}}
  .header-right{display:flex;align-items:center;gap:20px}
  .btn-logout{background:none;border:1px solid ${C.border};color:${C.milkDim};padding:6px 14px;font-family:'Montserrat',sans-serif;font-size:10px;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;transition:all .2s}
  .btn-logout:hover{border-color:${C.amber};color:${C.amber}}
  .main{padding:28px;max-width:1200px;margin:0 auto}

  /* TABS */
  .tabs{display:flex;border-bottom:1px solid ${C.border};margin-bottom:28px;overflow-x:auto}
  .tab-btn{background:none;border:none;border-bottom:2px solid transparent;color:${C.milkDim};padding:12px 16px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:all .2s;margin-bottom:-1px;white-space:nowrap}
  .tab-btn.active{color:${C.amber};border-bottom-color:${C.amber}}
  .tab-btn:hover:not(.active){color:${C.milk}}

  /* STATS */
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:28px}
  .stat-card{background:${C.surface};border:1px solid ${C.border};padding:20px 24px;position:relative;overflow:hidden}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${C.amber},transparent);opacity:.4}
  .stat-label{font-size:10px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:${C.milkDim};margin-bottom:8px}
  .stat-value{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:300;color:${C.amber};line-height:1}
  .stat-value.red{color:${C.red}}
  .stat-value.green{color:${C.green}}

  /* TABLE */
  .table-wrap{background:${C.surface};border:1px solid ${C.border};overflow-x:auto;margin-bottom:24px}
  .section-header{padding:16px 22px;border-bottom:1px solid ${C.border};display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
  .section-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;letter-spacing:.04em;color:${C.milk}}
  table{width:100%;border-collapse:collapse}
  th{font-size:10px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:${C.milkDim};padding:11px 16px;text-align:left;border-bottom:1px solid ${C.border};white-space:nowrap}
  td{padding:10px 16px;border-bottom:1px solid ${C.border};font-size:13px;color:${C.milk};vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:${C.surfaceAlt}}

  /* BADGES */
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase}
  .badge-ok{background:${C.greenGlow};color:#7abf8a;border:1px solid rgba(90,143,106,.3)}
  .badge-warn{background:rgba(212,168,67,.1);color:${C.amber};border:1px solid rgba(212,168,67,.3)}
  .badge-danger{background:${C.redGlow};color:#e07060;border:1px solid rgba(192,80,58,.3)}
  .badge-blue{background:${C.blueGlow};color:#7ab8d8;border:1px solid rgba(74,127,160,.3)}
  .badge-neutral{background:rgba(160,152,144,.1);color:${C.milkDim};border:1px solid rgba(160,152,144,.25)}

  /* BUTTONS */
  .btn-sm{background:none;border:1px solid ${C.border};color:${C.milkDim};padding:5px 12px;font-family:'Montserrat',sans-serif;font-size:10px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:all .2s}
  .btn-sm:hover{border-color:${C.amber};color:${C.amber}}
  .btn-sm.amber{border-color:${C.amberDim};color:${C.amber}}
  .btn-sm.amber:hover{background:${C.amberGlow}}
  .btn-sm.danger{border-color:rgba(192,80,58,.4);color:${C.red}}
  .btn-sm.danger:hover{background:${C.redGlow}}
  .btn-group{display:flex;gap:6px;flex-wrap:wrap}

  /* PROGRESS */
  .progress-wrap{width:88px}
  .progress-track{height:3px;background:${C.border};border-radius:2px;overflow:hidden;margin-top:4px}
  .progress-fill{height:100%;border-radius:2px;transition:width .4s}

  /* FILTER BAR */
  .filter-bar{display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid ${C.border};flex-wrap:wrap;background:${C.surfaceAlt}}
  .filter-bar label{font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:${C.milkDim};white-space:nowrap}
  .filter-bar input,.filter-bar select{background:${C.surface};border:1px solid ${C.border};color:${C.milk};font-family:'Montserrat',sans-serif;font-size:12px;padding:6px 10px;outline:none}
  .filter-bar input:focus,.filter-bar select:focus{border-color:${C.amber}}
  .filter-bar select option{background:${C.surfaceAlt}}
  .filter-total{margin-left:auto;font-family:'Cormorant Garamond',serif;font-size:22px;color:${C.amber};font-weight:300;white-space:nowrap}

  /* MODAL */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px;backdrop-filter:blur(2px)}
  .modal{background:${C.surface};border:1px solid ${C.border};width:100%;max-width:640px;max-height:92vh;overflow-y:auto;position:relative}
  .modal-header{padding:22px 28px 18px;border-bottom:1px solid ${C.border};display:flex;align-items:center;justify-content:space-between}
  .modal-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:400}
  .modal-close{background:none;border:none;color:${C.milkDim};cursor:pointer;font-size:20px;line-height:1;padding:4px}
  .modal-body{padding:22px 28px}
  .modal-footer{padding:14px 28px 22px;display:flex;gap:10px;justify-content:flex-end}

  /* FORMS */
  .form-row{margin-bottom:15px}
  .form-row label{display:block;font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:${C.milkDim};margin-bottom:6px}
  .form-row input,.form-row select,.form-row textarea{width:100%;background:${C.surfaceAlt};border:1px solid ${C.border};color:${C.milk};font-family:'Montserrat',sans-serif;font-size:13px;padding:10px 14px;outline:none;transition:border-color .2s;resize:vertical}
  .form-row input:focus,.form-row select:focus,.form-row textarea:focus{border-color:${C.amber}}
  .form-row select option{background:${C.surfaceAlt}}
  .form-row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:15px}

  /* RADIO BUTTONS */
  .radio-group{display:flex;gap:0;margin-bottom:15px}
  .radio-opt{flex:1}
  .radio-opt input{display:none}
  .radio-opt label{display:block;text-align:center;padding:9px 6px;font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;border:1px solid ${C.border};color:${C.milkDim};cursor:pointer;transition:all .2s;border-right:none}
  .radio-opt:last-child label{border-right:1px solid ${C.border}}
  .radio-opt input:checked + label{background:${C.amberGlow};border-color:${C.amberDim};color:${C.amber}}
  .radio-opt.red input:checked + label{background:${C.redGlow};border-color:rgba(192,80,58,.4);color:#e07060}
  .radio-opt.blue input:checked + label{background:${C.blueGlow};border-color:rgba(74,127,160,.4);color:#7ab8d8}

  /* SCHEDULE */
  .schedule-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:24px}
  .day-col{background:${C.surfaceAlt};border:1px solid ${C.border};padding:10px 8px;min-height:110px}
  .day-col-head{font-size:10px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:${C.milkDim};margin-bottom:8px;text-align:center}
  .slot-item{background:${C.surface};border-left:2px solid ${C.amber};padding:5px 7px;margin-bottom:5px;font-size:11px;cursor:pointer;transition:opacity .2s}
  .slot-item:hover{opacity:.72}
  .slot-time{color:${C.amber};font-weight:600;font-size:10px}
  .slot-name{color:${C.milk};margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px}
  .slot-free{border-left-color:${C.green}}
  .slot-free .slot-time{color:${C.green}}
  .slot-add-btn{width:100%;background:none;border:1px dashed ${C.border};color:${C.milkDim};padding:4px;font-size:16px;cursor:pointer;transition:all .2s;margin-top:4px}
  .slot-add-btn:hover{border-color:${C.amber};color:${C.amber}}

  /* STUDENT CARD */
  .student-hero{background:${C.surface};border:1px solid ${C.border};padding:28px 32px;margin-bottom:22px;position:relative;overflow:hidden}
  .student-hero::after{content:'';position:absolute;bottom:-30px;right:-30px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(212,168,67,.06) 0%,transparent 70%)}
  .student-name{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:300;color:${C.milk};margin-bottom:4px}
  .student-tariff{font-size:11px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:${C.amber}}

  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
  .info-block{background:${C.surface};border:1px solid ${C.border};padding:18px 20px}
  .info-block-label{font-size:10px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:${C.milkDim};margin-bottom:8px}
  .info-block-value{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:${C.amber}}
  .info-block-sub{font-size:11px;color:${C.milkDim};margin-top:2px}

  .big-progress{background:${C.surface};border:1px solid ${C.border};padding:18px 22px;margin-bottom:20px}
  .big-progress-label{font-size:10px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:${C.milkDim};margin-bottom:12px}
  .big-track{height:5px;background:${C.border};border-radius:3px;overflow:hidden;margin-bottom:6px}
  .big-fill{height:100%;border-radius:3px;transition:width .5s;background:${C.amber}}
  .progress-labels{display:flex;justify-content:space-between;font-size:11px;color:${C.milkDim}}

  .schedule-mini{background:${C.surface};border:1px solid ${C.border};padding:18px 22px;margin-bottom:20px}
  .schedule-mini-title{font-family:'Cormorant Garamond',serif;font-size:17px;color:${C.milk};margin-bottom:14px}
  .schedule-row{display:flex;align-items:center;gap:12px;padding:7px 0;border-bottom:1px solid ${C.border}}
  .schedule-row:last-child{border-bottom:none}
  .schedule-day-tag{font-size:10px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:${C.amber};min-width:26px}
  .schedule-time-tag{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:300;color:${C.milk}}

  /* INCOME CHART */
  .bar-chart{display:flex;align-items:flex-end;gap:6px;height:120px;padding:0 4px}
  .bar-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:0}
  .bar{width:100%;border-radius:2px 2px 0 0;background:${C.amber};opacity:.8;transition:opacity .2s;cursor:default;min-height:2px}
  .bar:hover{opacity:1}
  .bar-label{font-size:9px;color:${C.milkDim};text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
  .bar-val{font-size:9px;color:${C.amber};text-align:center;white-space:nowrap}

  /* MISC */
  .pin-display{font-family:'Cormorant Garamond',serif;font-size:19px;letter-spacing:.3em;color:${C.amber};background:${C.surfaceAlt};border:1px solid ${C.border};padding:5px 12px;display:inline-block}
  .hint{font-size:11px;color:${C.milkDim};margin-top:4px}
  .info-box{background:${C.surfaceAlt};border:1px solid ${C.border};padding:11px 15px;font-size:13px;color:${C.milkDim};margin-top:12px}
  .warn-box{background:${C.redGlow};border:1px solid rgba(192,80,58,.3);padding:12px 18px;margin-bottom:18px;font-size:13px}
  .divider{height:1px;background:${C.border};margin:18px 0}
  .empty-state{text-align:center;padding:36px;color:${C.milkDim};font-size:13px}

  /* QUICK SCHED EDITOR inside modal */
  .sched-slot-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid ${C.border}}
  .sched-slot-row:last-child{border-bottom:none}

  /* SONGS / REPERTOIRE */
  .songs-wrap{background:${C.surface};border:1px solid ${C.border};padding:0;margin-bottom:24px}
  .song-item{padding:14px 20px;border-bottom:1px solid ${C.border};transition:background .15s}
  .song-item:last-child{border-bottom:none}
  .song-item:hover{background:${C.surfaceAlt}}
  .song-title-row{display:flex;align-items:center;gap:10px}
  .song-title{font-size:14px;font-weight:500;color:${C.milk};flex:1}
  .song-rating{display:flex;gap:4px}
  .rating-btn{background:none;border:1px solid ${C.border};padding:3px 8px;font-size:12px;cursor:pointer;transition:all .15s;color:${C.milkDim}}
  .rating-btn.plus.active{background:${C.greenGlow};border-color:rgba(90,143,106,.5);color:#7abf8a}
  .rating-btn.minus.active{background:${C.redGlow};border-color:rgba(192,80,58,.5);color:#e07060}
  .rating-btn:hover{border-color:${C.amber};color:${C.amber}}
  .song-meta{display:flex;align-items:center;gap:12px;margin-top:6px;flex-wrap:wrap}
  .song-composer{font-size:11px;color:${C.milkDim}}
  .song-status-tag{font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;padding:2px 8px}
  .song-notes-text{font-size:12px;color:${C.milkDim};margin-top:6px;line-height:1.5;white-space:pre-wrap}
  .song-lyrics-toggle{background:none;border:none;font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:${C.amberDim};cursor:pointer;padding:0;margin-top:4px;display:block}
  .song-lyrics-toggle:hover{color:${C.amber}}
  .song-lyrics{margin-top:8px;padding:12px 14px;background:${C.surfaceAlt};border-left:2px solid ${C.amberDim};font-size:12px;color:${C.milkDim};white-space:pre-wrap;line-height:1.7;max-height:220px;overflow-y:auto}
  .song-files{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
  .song-file-chip{display:inline-flex;align-items:center;gap:5px;background:${C.surfaceAlt};border:1px solid ${C.border};padding:3px 10px;font-size:11px;color:${C.milkDim};cursor:pointer;transition:all .15s;text-decoration:none}
  .song-file-chip:hover{border-color:${C.amber};color:${C.amber}}
  .song-file-chip .del{color:${C.red};cursor:pointer;margin-left:4px;font-size:13px}
  .song-add-form{padding:16px 20px;border-top:1px solid ${C.border};background:${C.surfaceAlt}}

  @media(max-width:768px){
    .schedule-grid{grid-template-columns:repeat(4,1fr)}
    .main{padding:16px}
    .stat-grid{grid-template-columns:1fr 1fr}
    .info-grid{grid-template-columns:1fr}
    .header{padding:12px 16px}
    .form-row-2{grid-template-columns:1fr}
  }
  @media(max-width:480px){
    .schedule-grid{grid-template-columns:1fr 1fr}
    .modal{max-width:100%;margin:0}
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// ⚠️ Смените этот пароль на свой перед использованием!
const TEACHER_PIN = "Studio2025!";
const TODAY = () => new Date().toISOString().split("T")[0];
function daysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date(TODAY())) / 86400000);
}
function fmtDate(d) {
  if (!d) return "—";
  const [y,m,day] = d.split("-");
  return `${day}.${m}.${y}`;
}
function fmtMonth(ym) {
  const [y,m] = ym.split("-");
  return `${MONTHS_RU[Number(m)-1]} ${y}`;
}
// Generates a random 6-char alphanumeric PIN (uppercase letters + digits)
function genPin() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// ── Earned income = lessons actually conducted × per-lesson price
function earnedThisMonth(data) {
  const month = TODAY().slice(0,7);
  return data.lessons
    .filter((l) => l.date.startsWith(month) && l.type !== "absent_free")
    .reduce((sum, l) => {
      const s = data.students.find((x) => x.id === l.studentId);
      return sum + (s?.lessonPrice ? Number(s.lessonPrice) : 0);
    }, 0);
}

function earnedTotal(data) {
  return data.lessons
    .filter((l) => l.type !== "absent_free")
    .reduce((sum, l) => {
      const s = data.students.find((x) => x.id === l.studentId);
      return sum + (s?.lessonPrice ? Number(s.lessonPrice) : 0);
    }, 0);
}

function earnedOnDate(data, dateStr) {
  return data.lessons
    .filter((l) => l.date === dateStr && l.type !== "absent_free")
    .reduce((sum, l) => {
      const s = data.students.find((x) => x.id === l.studentId);
      return sum + (s?.lessonPrice ? Number(s.lessonPrice) : 0);
    }, 0);
}

// Expected income for a future day based on schedule
function expectedOnDay(data, offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const dow = (d.getDay() + 6) % 7;
  return (data.schedule||[])
    .filter((sl) => sl.dayIndex === dow && sl.studentId)
    .reduce((sum, sl) => {
      const s = data.students.find((x) => x.id === sl.studentId);
      return sum + (s?.lessonPrice ? Number(s.lessonPrice) : 0);
    }, 0);
}

function dateOffsetStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

function statusBadge(lessons, expiry) {
  const dl = daysLeft(expiry);
  if (lessons === 0) return <span className="badge badge-danger">Занятий нет</span>;
  if (dl !== null && dl <= 0) return <span className="badge badge-danger">Срок истёк</span>;
  if (lessons <= 2 || (dl !== null && dl <= 7)) return <span className="badge badge-warn">Заканчивается</span>;
  return <span className="badge badge-ok">Активен</span>;
}

function lessonTypeBadge(type) {
  if (type === "absent_charged") return <span className="badge badge-danger">Прогул (−1)</span>;
  if (type === "absent_free")    return <span className="badge badge-blue">Отмена (0)</span>;
  return <span className="badge badge-ok">Урок</span>;
}

function LessonsBar({ remain, total }) {
  if (!total) return null;
  const used = total - remain;
  const pct  = Math.max(0, Math.min(100, (used / total) * 100));
  const color = pct >= 80 ? C.red : pct >= 60 ? C.amber : C.green;
  return (
    <div className="progress-wrap">
      <div style={{ fontSize:11, color:C.milkDim }}>{remain} / {total}</div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width:pct+"%", background:color }} />
      </div>
    </div>
  );
}

const SEED = { students:[], payments:[], lessons:[], schedule:[] };

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [data,      setData]       = useState(SEED);
  const [view,      setView]       = useState("login");
  const [studentId, setStudentId]  = useState(null);
  const [loading,   setLoading]    = useState(true);
  const [pin,       setPin]        = useState("");
  const [loginErr,  setLoginErr]   = useState("");

  // Load everything from Supabase on mount
  useEffect(() => {
    loadAll()
      .then(setData)
      .catch(() => setData(SEED))
      .finally(() => setLoading(false));
  }, []);

  // Save: apply optimistic update to local state, then sync changed entity to Supabase
  const save = useCallback(async (newData, ops = []) => {
    setData(newData);
    for (const op of ops) {
      try {
        if (op.type === "upsertStudent")   await upsertStudent(op.data);
        if (op.type === "deleteStudent")   await dbDeleteStudent(op.id);
        if (op.type === "insertPayment")   await insertPayment(op.data);
        if (op.type === "deletePayment")   await dbDeletePayment(op.id);
        if (op.type === "insertLesson")    await insertLesson(op.data);
        if (op.type === "deleteLesson")    await dbDeleteLesson(op.id);
        if (op.type === "upsertSlot")      await upsertSlot(op.data);
        if (op.type === "deleteSlot")      await dbDeleteSlot(op.id);
        if (op.type === "updateSongs")     await updateStudentSongs(op.studentId, op.songs);
      } catch (e) {
        console.error("Supabase sync error:", op.type, e);
      }
    }
  }, []);

  const handleLogin = async () => {
    setLoginErr("");
    if (pin === TEACHER_PIN) { setView("teacher"); setPin(""); return; }
    const student = await getStudentByPin(pin);
    if (student) {
      // Reload fresh data so student sees latest
      const fresh = await loadAll();
      setData(fresh);
      setStudentId(student.id);
      setView("student");
      setPin("");
      return;
    }
    setLoginErr("Неверный код доступа.");
  };

  const logout = () => { setView("login"); setStudentId(null); setPin(""); };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      height:"100vh", color:C.milkDim, fontFamily:"Montserrat", fontSize:14 }}>
      Загрузка…
    </div>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        {view === "login"   && <LoginScreen pin={pin} setPin={setPin} onLogin={handleLogin} error={loginErr} />}
        {view === "teacher" && <TeacherView data={data} save={save} logout={logout} />}
        {view === "student" && <StudentView data={data} save={save} studentId={studentId} logout={logout} />}
      </div>
    </>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ pin, setPin, onLogin, error }) {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">Inspiration</div>
        <div className="login-sub">Студия вокала · Елена</div>
        <div className="field-group">
          <label className="field-label">Код доступа</label>
          <input className="field-input" type="password" inputMode="text" maxLength={20}
            placeholder="••••••" value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key==="Enter" && pin.length >= 4 && onLogin()} autoFocus />
        </div>
        <button className="btn-primary" onClick={onLogin} disabled={pin.length < 4}>Войти</button>
        {error && <div className="error-msg">{error}</div>}
      </div>
    </div>
  );
}

// ─── TEACHER VIEW ─────────────────────────────────────────────────────────────
function TeacherView({ data, save, logout }) {
  const [tab,   setTab]   = useState("students");
  const [modal, setModal] = useState(null);

  const today     = TODAY();
  const thisMonth = today.slice(0,7);

  // RECEIVED = money actually transferred by students
  const receivedThisMonth = data.payments.filter((p) => p.date.startsWith(thisMonth)).reduce((s,p) => s+Number(p.amount), 0);
  const receivedTotal     = data.payments.reduce((s,p) => s+Number(p.amount), 0);

  // EARNED = lessons actually conducted × price per lesson (real work done)
  const earnedMonth = earnedThisMonth(data);
  const earnedAll   = earnedTotal(data);

  // Lessons without price set (for warning)
  const lessonsMissingPrice = data.lessons.filter((l) => {
    const s = data.students.find((x) => x.id === l.studentId);
    return !s?.lessonPrice && l.type !== "absent_free";
  }).length;

  const expWarn = data.students.filter((s) => {
    const dl = daysLeft(s.expiry);
    return s.lessons <= 2 || (dl !== null && dl !== undefined && dl <= 7 && dl > 0);
  }).length;

  // Today's actual earned (lessons on today's date)
  const earnedToday = earnedOnDate(data, today);
  const todayDow    = (new Date(today).getDay() + 6) % 7;
  const todayLessonsCount = data.lessons.filter((l) => l.date === today && l.type !== "absent_free").length;

  // Tomorrow / day after — expected from schedule
  const expTomorrow = expectedOnDay(data, 1);
  const expAfter    = expectedOnDay(data, 2);
  const d1str = dateOffsetStr(1);
  const d2str = dateOffsetStr(2);
  const cnt1 = (data.schedule||[]).filter((sl)=>(sl.dayIndex===((new Date(d1str).getDay()+6)%7))&&sl.studentId).length;
  const cnt2 = (data.schedule||[]).filter((sl)=>(sl.dayIndex===((new Date(d2str).getDay()+6)%7))&&sl.studentId).length;

  return (
    <div>
      <header className="header">
        <div className="header-logo">Inspiration</div>
        <div className="header-right">
          <span className="header-role">Педагог</span>
          <button className="btn-logout" onClick={logout}>Выйти</button>
        </div>
      </header>
      <div className="main">

        {/* ── INCOME PANEL ── */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, marginBottom:20, overflow:"hidden" }}>
          <div style={{ padding:"14px 22px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontFamily:"Cormorant Garamond", fontSize:17, color:C.milk }}>Финансы</span>
            {lessonsMissingPrice > 0 && (
              <span style={{ fontSize:10, color:C.amber, border:`1px solid ${C.amberDim}`, padding:"2px 8px", letterSpacing:".1em" }}>
                ⚠ {lessonsMissingPrice} уроков без цены
              </span>
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:0 }}>
            {[
              { label:"Заработано сегодня", val:earnedToday, sub:`${todayLessonsCount} урок(а) проведено`, color:earnedToday>0?C.amber:C.milkDim },
              { label:"Заработано за месяц", val:earnedMonth, sub:"факт: отработанные уроки", color:earnedMonth>0?C.amber:C.milkDim },
              { label:"Заработано всего", val:earnedAll, sub:"за всё время (по урокам)", color:C.amber },
              { label:"Получено за месяц", val:receivedThisMonth, sub:"оплаты от учеников", color:C.green },
              { label:"Получено всего", val:receivedTotal, sub:"все поступления", color:C.green },
              { label:"Аванс / авансом", val:receivedTotal - earnedAll, sub:receivedTotal-earnedAll>=0?"ещё не отработано":"долг педагога", color:receivedTotal-earnedAll>=0?C.blue:C.red },
            ].map(({ label, val, sub, color }) => (
              <div key={label} style={{ padding:"16px 20px", borderRight:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }}>
                <div style={{ fontSize:9, fontWeight:600, letterSpacing:".18em", textTransform:"uppercase", color:C.milkDim, marginBottom:6 }}>{label}</div>
                <div style={{ fontFamily:"Cormorant Garamond", fontSize:26, fontWeight:300, color, lineHeight:1 }}>
                  {val !== 0 ? val.toLocaleString("ru-RU") : "—"}
                  {val !== 0 && <span style={{ fontSize:12, marginLeft:4, opacity:.7 }}>сум</span>}
                </div>
                <div style={{ fontSize:10, color:C.milkDim, marginTop:4 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* ── Day forecast row ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", borderTop:`1px solid ${C.border}` }}>
            {[
              { label:"Сегодня (факт)", amt:earnedToday, sub:`${todayLessonsCount} проведено`, dateStr:today },
              { label:"Завтра (план)", amt:expTomorrow, sub:cnt1>0?`${cnt1} по расписанию`:"нет уроков", dateStr:d1str },
              { label:"Послезавтра (план)", amt:expAfter, sub:cnt2>0?`${cnt2} по расписанию`:"нет уроков", dateStr:d2str },
            ].map(({ label, amt, sub, dateStr }) => (
              <div key={label} style={{ padding:"12px 20px", borderRight:`1px solid ${C.border}` }}>
                <div style={{ fontSize:9, fontWeight:600, letterSpacing:".16em", textTransform:"uppercase", color:C.milkDim, marginBottom:4 }}>
                  {label} · {fmtDate(dateStr)}
                </div>
                <div style={{ fontFamily:"Cormorant Garamond", fontSize:22, fontWeight:300, color:amt>0?C.amber:C.milkDim }}>
                  {amt>0?amt.toLocaleString("ru-RU")+" сум":"—"}
                </div>
                <div style={{ fontSize:10, color:C.milkDim, marginTop:2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SMALL STAT CARDS ── */}
        <div className="stat-grid" style={{ marginBottom:24 }}>
          <StatCard label="Учеников" value={data.students.length} />
          <StatCard label="Требуют внимания" value={expWarn} cls={expWarn>0?"red":""} />
          <StatCard label="Уроков всего" value={data.lessons.filter((l)=>l.type!=="absent_free").length} />
          <StatCard label="Прогулов" value={data.lessons.filter((l)=>l.type==="absent_charged").length} cls={data.lessons.filter((l)=>l.type==="absent_charged").length>0?"red":""} />
        </div>

        <div className="tabs">
          {[
            ["students","Ученики"],
            ["schedule","Расписание"],
            ["lessons","Занятия"],
            ["payments","Оплаты"],
            ["income","Доходы"],
          ].map(([k,l]) => (
            <button key={k} className={`tab-btn${tab===k?" active":""}`} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "students" && <StudentsTab  data={data} save={save} setModal={setModal} />}
        {tab === "schedule" && <ScheduleTab  data={data} save={save} />}
        {tab === "lessons"  && <LessonsTab   data={data} save={save} setModal={setModal} />}
        {tab === "payments" && <PaymentsTab  data={data} save={save} setModal={setModal} />}
        {tab === "income"   && <IncomeTab    data={data} />}
      </div>

      {modal === "add-student" && <AddStudentModal data={data} save={save} close={()=>setModal(null)} />}
      {modal === "add-lesson"  && <AddLessonModal  data={data} save={save} close={()=>setModal(null)} />}
      {modal === "add-payment" && <AddPaymentModal data={data} save={save} close={()=>setModal(null)} />}
    </div>
  );
}

function StatCard({ label, value, suffix="", cls="" }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${cls}`}>
        {value}{suffix && <span style={{ fontSize:14, marginLeft:4 }}>{suffix}</span>}
      </div>
    </div>
  );
}

// ── STUDENTS TAB ──────────────────────────────────────────────────────────────
function StudentsTab({ data, save, setModal }) {
  const [editId, setEditId] = useState(null);

  const deleteStudent = (id) => {
    if (!confirm("Удалить ученика и все его данные?")) return;
    save({
      ...data,
      students: data.students.filter((s)=>s.id!==id),
      payments: data.payments.filter((p)=>p.studentId!==id),
      lessons:  data.lessons.filter((l)=>l.studentId!==id),
      schedule: (data.schedule||[]).filter((sl)=>sl.studentId!==id),
    }, [{ type:"deleteStudent", id }]);
  };

  return (
    <div className="table-wrap">
      <div className="section-header">
        <span className="section-title">Ученики</span>
        <button className="btn-sm amber" onClick={()=>setModal("add-student")}>+ Добавить</button>
      </div>
      {data.students.length === 0
        ? <div className="empty-state">Нет учеников. Добавьте первого.</div>
        : (
        <table>
          <thead>
            <tr>
              <th>Имя</th><th>PIN</th><th>Тариф</th><th>Остаток</th>
              <th>Срок до</th><th>Статус</th><th>Расписание</th><th>Последний урок</th><th></th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s) => {
              const lastL  = [...data.lessons].filter((l)=>l.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
              const mySlots = (data.schedule||[]).filter((x)=>x.studentId===s.id).sort((a,b)=>a.dayIndex-b.dayIndex||a.time.localeCompare(b.time));
              const dl = daysLeft(s.expiry);
              return (
                <tr key={s.id}>
                  <td style={{ fontWeight:500 }}>{s.name}</td>
                  <td><span className="pin-display" style={{ fontSize:13, padding:"3px 10px" }}>{s.pin}</span></td>
                  <td style={{ color:C.milkDim }}>{s.tariff||"—"}</td>
                  <td><LessonsBar remain={s.lessons} total={s.totalLessons} /></td>
                  <td>
                    <div>{fmtDate(s.expiry)}</div>
                    {dl!==null && <div style={{ fontSize:11, color:dl<=7?C.red:C.milkDim }}>{dl>0?`${dl} дн.`:"истёк"}</div>}
                  </td>
                  <td>{statusBadge(s.lessons,s.expiry)}</td>
                  <td style={{ fontSize:11, color:C.milkDim }}>
                    {mySlots.length===0?"—":mySlots.map((sl,i)=><div key={i}>{DAYS_RU[sl.dayIndex]} {sl.time}</div>)}
                  </td>
                  <td style={{ color:C.milkDim }}>{lastL ? fmtDate(lastL.date) : "—"}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn-sm" onClick={()=>setEditId(s.id)}>Изм.</button>
                      <button className="btn-sm danger" onClick={()=>deleteStudent(s.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {editId && <EditStudentModal data={data} save={save} studentId={editId} close={()=>setEditId(null)} />}
    </div>
  );
}

// ── LESSONS TAB ───────────────────────────────────────────────────────────────
function LessonsTab({ data, save, setModal }) {
  const [filterStudent, setFilterStudent] = useState("");
  const [filterType,    setFilterType]    = useState("");

  const deleteLesson = (id) => {
    const l = data.lessons.find((x)=>x.id===id);
    if (!l || !confirm("Удалить запись? Занятие будет возвращено ученику (если было списано).")) return;
    const deduct = l.type === "absent_free" ? 0 : 1;
    const updatedStudent = deduct>0 ? data.students.find((s)=>s.id===l.studentId) : null;
    const ops = [{ type:"deleteLesson", id }];
    if (updatedStudent) ops.push({ type:"upsertStudent", data:{ ...updatedStudent, lessons:updatedStudent.lessons+1 } });
    save({
      ...data,
      lessons:  data.lessons.filter((x)=>x.id!==id),
      students: deduct>0
        ? data.students.map((s)=>s.id===l.studentId?{...s,lessons:s.lessons+1}:s)
        : data.students,
    }, ops);
  };

  const sorted = [...data.lessons]
    .filter((l) => (!filterStudent || l.studentId===filterStudent) && (!filterType || l.type===filterType))
    .sort((a,b)=>b.date.localeCompare(a.date));

  return (
    <div className="table-wrap">
      <div className="section-header">
        <span className="section-title">История занятий</span>
        <button className="btn-sm amber" onClick={()=>setModal("add-lesson")}>+ Записать урок / пропуск</button>
      </div>
      <div className="filter-bar">
        <label>Ученик:</label>
        <select value={filterStudent} onChange={(e)=>setFilterStudent(e.target.value)}>
          <option value="">Все</option>
          {data.students.map((s)=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <label>Тип:</label>
        <select value={filterType} onChange={(e)=>setFilterType(e.target.value)}>
          <option value="">Все</option>
          <option value="lesson">Урок</option>
          <option value="absent_charged">Прогул (−1)</option>
          <option value="absent_free">Отмена (0)</option>
        </select>
      </div>
      {sorted.length===0
        ? <div className="empty-state">Нет записей.</div>
        : (
        <table>
          <thead><tr><th>Дата</th><th>Ученик</th><th>Тип</th><th>Тема / причина</th><th>Остаток после</th><th></th></tr></thead>
          <tbody>
            {sorted.map((l) => {
              const s = data.students.find((x)=>x.id===l.studentId);
              return (
                <tr key={l.id}>
                  <td>{fmtDate(l.date)}</td>
                  <td style={{ fontWeight:500 }}>{s?.name||"—"}</td>
                  <td>{lessonTypeBadge(l.type)}</td>
                  <td style={{ color:C.milkDim }}>{l.note||"—"}</td>
                  <td>
                    {l.type==="absent_free"
                      ? <span style={{ color:C.milkDim, fontSize:11 }}>без изм.</span>
                      : (l.remainAfter??'—')}
                  </td>
                  <td><button className="btn-sm danger" onClick={()=>deleteLesson(l.id)}>✕</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── PAYMENTS TAB ──────────────────────────────────────────────────────────────
function PaymentsTab({ data, save, setModal }) {
  const deletePayment = (id) => {
    if (!confirm("Удалить оплату? Балланс ученика не изменится автоматически.")) return;
    save({ ...data, payments: data.payments.filter((p)=>p.id!==id) }, [{ type:"deletePayment", id }]);
  };

  const sorted = [...data.payments].sort((a,b)=>b.date.localeCompare(a.date));
  const total  = sorted.reduce((s,p)=>s+Number(p.amount),0);

  return (
    <div className="table-wrap">
      <div className="section-header">
        <span className="section-title">Оплаты</span>
        <button className="btn-sm amber" onClick={()=>setModal("add-payment")}>+ Внести</button>
      </div>
      {sorted.length===0
        ? <div className="empty-state">Оплат нет.</div>
        : (
        <table>
          <thead><tr><th>Дата</th><th>Ученик</th><th>Сумма</th><th>Занятий +</th><th>Абонемент до</th><th>Комментарий</th><th></th></tr></thead>
          <tbody>
            {sorted.map((p) => {
              const s = data.students.find((x)=>x.id===p.studentId);
              return (
                <tr key={p.id}>
                  <td>{fmtDate(p.date)}</td>
                  <td style={{ fontWeight:500 }}>{s?.name||"—"}</td>
                  <td style={{ color:C.amber, fontFamily:"Cormorant Garamond", fontSize:17 }}>{Number(p.amount).toLocaleString("ru-RU")} сум</td>
                  <td>{p.lessonsAdded||"—"}</td>
                  <td>{fmtDate(p.expiry)||"—"}</td>
                  <td style={{ color:C.milkDim }}>{p.note||"—"}</td>
                  <td><button className="btn-sm danger" onClick={()=>deletePayment(p.id)}>✕</button></td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={2} style={{ fontWeight:600 }}>Итого</td>
              <td style={{ color:C.amber, fontFamily:"Cormorant Garamond", fontSize:20 }}>{total.toLocaleString("ru-RU")} сум</td>
              <td colSpan={4}/>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── INCOME TAB ────────────────────────────────────────────────────────────────
function IncomeTab({ data }) {
  const firstPayDate   = data.payments.length > 0 ? [...data.payments].sort((a,b)=>a.date.localeCompare(b.date))[0].date : TODAY();
  const firstLessDate  = data.lessons.length > 0  ? [...data.lessons].sort((a,b)=>a.date.localeCompare(b.date))[0].date  : TODAY();
  const firstDate      = firstPayDate < firstLessDate ? firstPayDate : firstLessDate;

  const [from,    setFrom]    = useState(firstDate.slice(0,7)+"-01");
  const [to,      setTo]      = useState(TODAY());
  const [groupBy, setGroupBy] = useState("month");
  const [mode,    setMode]    = useState("earned"); // earned | received

  // RECEIVED in period
  const filteredPay = data.payments.filter((p)=>p.date>=from && p.date<=to);
  const totalReceived = filteredPay.reduce((s,p)=>s+Number(p.amount),0);

  // EARNED in period (conducted lessons × price)
  const filteredLess = data.lessons.filter((l)=>l.date>=from && l.date<=to && l.type!=="absent_free");
  const totalEarned  = filteredLess.reduce((sum,l)=>{
    const s = data.students.find((x)=>x.id===l.studentId);
    return sum + (s?.lessonPrice ? Number(s.lessonPrice) : 0);
  }, 0);

  // Group by month — both earned and received
  const byMonth = {};
  filteredPay.forEach((p)=>{
    const m = p.date.slice(0,7);
    if (!byMonth[m]) byMonth[m]={received:0,earned:0};
    byMonth[m].received += Number(p.amount);
  });
  filteredLess.forEach((l)=>{
    const m = l.date.slice(0,7);
    if (!byMonth[m]) byMonth[m]={received:0,earned:0};
    const s = data.students.find((x)=>x.id===l.studentId);
    byMonth[m].earned += (s?.lessonPrice ? Number(s.lessonPrice) : 0);
  });
  const months = Object.entries(byMonth).sort((a,b)=>a[0].localeCompare(b[0]));
  const maxBarVal = months.length > 0 ? Math.max(...months.map((x)=>Math.max(x[1].earned,x[1].received)),1) : 1;

  // Group by student
  const byStudentE = {}, byStudentR = {};
  filteredLess.forEach((l)=>{
    const sn = data.students.find((x)=>x.id===l.studentId);
    const name = sn?.name||"Без имени";
    byStudentE[name]=(byStudentE[name]||0)+(sn?.lessonPrice?Number(sn.lessonPrice):0);
  });
  filteredPay.forEach((p)=>{
    const name = data.students.find((x)=>x.id===p.studentId)?.name||"Без имени";
    byStudentR[name]=(byStudentR[name]||0)+Number(p.amount);
  });

  const setPreset = (n) => {
    const d = new Date();
    const to_ = d.toISOString().split("T")[0];
    d.setMonth(d.getMonth()-n+1); d.setDate(1);
    setFrom(d.toISOString().split("T")[0]); setTo(to_);
  };

  const showEarned   = mode === "earned"   || groupBy === "month";
  const showReceived = mode === "received" || groupBy === "month";

  return (
    <div>
      {/* Top summary */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, padding:"16px 20px" }}>
          <div style={{ fontSize:9,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.amber,marginBottom:6 }}>Заработано за период</div>
          <div style={{ fontFamily:"Cormorant Garamond",fontSize:28,fontWeight:300,color:C.amber }}>{totalEarned.toLocaleString("ru-RU")}<span style={{fontSize:13,marginLeft:4}}>сум</span></div>
          <div style={{ fontSize:10,color:C.milkDim,marginTop:2 }}>отработанные уроки × цена</div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, padding:"16px 20px" }}>
          <div style={{ fontSize:9,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.green,marginBottom:6 }}>Получено за период</div>
          <div style={{ fontFamily:"Cormorant Garamond",fontSize:28,fontWeight:300,color:C.green }}>{totalReceived.toLocaleString("ru-RU")}<span style={{fontSize:13,marginLeft:4}}>сум</span></div>
          <div style={{ fontSize:10,color:C.milkDim,marginTop:2 }}>реальные поступления</div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, padding:"16px 20px" }}>
          <div style={{ fontSize:9,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.milkDim,marginBottom:6 }}>Разница</div>
          <div style={{ fontFamily:"Cormorant Garamond",fontSize:28,fontWeight:300,color:totalReceived-totalEarned>=0?C.blue:C.red }}>
            {totalReceived-totalEarned>=0?"+":""}{(totalReceived-totalEarned).toLocaleString("ru-RU")}<span style={{fontSize:13,marginLeft:4}}>сум</span>
          </div>
          <div style={{ fontSize:10,color:C.milkDim,marginTop:2 }}>{totalReceived-totalEarned>=0?"аванс (ещё не отработано)":"долг (отработано больше)"}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="table-wrap" style={{ marginBottom:20 }}>
        <div className="filter-bar">
          <label>С:</label>
          <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
          <label>По:</label>
          <input type="date" value={to}   onChange={(e)=>setTo(e.target.value)} />
          <label>Группировка:</label>
          <select value={groupBy} onChange={(e)=>setGroupBy(e.target.value)}>
            <option value="month">По месяцам</option>
            <option value="student">По ученикам</option>
          </select>
        </div>
        <div style={{ padding:"10px 20px", display:"flex", gap:8, flexWrap:"wrap", borderBottom:`1px solid ${C.border}`, background:C.bg }}>
          {[["1 мес",1],["3 мес",3],["6 мес",6],["Год",12]].map(([l,n])=>(
            <button key={n} className="btn-sm" onClick={()=>setPreset(n)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      {groupBy==="month" && months.length > 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, padding:"20px 22px", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ fontFamily:"Cormorant Garamond", fontSize:17, color:C.milk }}>Динамика по месяцам</span>
            <div style={{ display:"flex", gap:16, fontSize:11 }}>
              <span><span style={{ display:"inline-block",width:10,height:10,background:C.amber,marginRight:5 }}/>Заработано</span>
              <span><span style={{ display:"inline-block",width:10,height:10,background:C.green,marginRight:5 }}/>Получено</span>
            </div>
          </div>
          <div className="bar-chart" style={{ height:140 }}>
            {months.map(([m,{earned,received}])=>(
              <div key={m} className="bar-wrap">
                <div style={{ display:"flex", gap:2, alignItems:"flex-end", height:110 }}>
                  <div className="bar" style={{ height:`${Math.max(2,(earned/maxBarVal)*110)}px`, background:C.amber, width:"44%" }} title={`Заработано: ${earned.toLocaleString("ru-RU")}`} />
                  <div className="bar" style={{ height:`${Math.max(2,(received/maxBarVal)*110)}px`, background:C.green, opacity:.75, width:"44%" }} title={`Получено: ${received.toLocaleString("ru-RU")}`} />
                </div>
                <div className="bar-label">{m.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      {groupBy==="month" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12, marginBottom:20 }}>
          {months.map(([m,{earned,received}])=>(
            <div key={m} style={{ background:C.surface, border:`1px solid ${C.border}`, padding:"14px 18px" }}>
              <div style={{ fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.milkDim,marginBottom:8 }}>{fmtMonth(m)}</div>
              <div style={{ display:"flex", gap:12 }}>
                <div>
                  <div style={{ fontSize:9,color:C.milkDim,marginBottom:2 }}>Заработано</div>
                  <div style={{ fontFamily:"Cormorant Garamond",fontSize:18,color:C.amber }}>{earned.toLocaleString("ru-RU")}</div>
                </div>
                <div>
                  <div style={{ fontSize:9,color:C.milkDim,marginBottom:2 }}>Получено</div>
                  <div style={{ fontFamily:"Cormorant Garamond",fontSize:18,color:C.green }}>{received.toLocaleString("ru-RU")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {groupBy==="student" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:12, marginBottom:20 }}>
          {[...new Set([...Object.keys(byStudentE),...Object.keys(byStudentR)])].map((name)=>(
            <div key={name} style={{ background:C.surface, border:`1px solid ${C.border}`, padding:"14px 18px" }}>
              <div style={{ fontSize:11,fontWeight:500,color:C.milk,marginBottom:8 }}>{name}</div>
              <div style={{ display:"flex", gap:12 }}>
                <div>
                  <div style={{ fontSize:9,color:C.milkDim,marginBottom:2 }}>Заработано</div>
                  <div style={{ fontFamily:"Cormorant Garamond",fontSize:18,color:C.amber }}>{(byStudentE[name]||0).toLocaleString("ru-RU")}</div>
                </div>
                <div>
                  <div style={{ fontSize:9,color:C.milkDim,marginBottom:2 }}>Получено</div>
                  <div style={{ fontFamily:"Cormorant Garamond",fontSize:18,color:C.green }}>{(byStudentR[name]||0).toLocaleString("ru-RU")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SCHEDULE TAB ──────────────────────────────────────────────────────────────
function ScheduleTab({ data, save }) {
  const [slotModal, setSlotModal] = useState(null);
  const [editSlot,  setEditSlot]  = useState(null);
  const slots = data.schedule || [];

  const deleteSlot = (id) => save({ ...data, schedule: slots.filter((s)=>s.id!==id) }, [{ type:"deleteSlot", id }]);

  const today = TODAY();
  const todayDow = (new Date(today).getDay() + 6) % 7;

  return (
    <div>
      <div style={{ marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"Cormorant Garamond", fontSize:18, color:C.milk }}>Недельное расписание</span>
        <button className="btn-sm amber" onClick={()=>setSlotModal({ dayIndex:0 })}>+ Добавить слот</button>
      </div>

      <div className="schedule-grid">
        {DAYS_RU.map((day,dayIdx) => {
          const daySlots = slots.filter((s)=>s.dayIndex===dayIdx).sort((a,b)=>a.time.localeCompare(b.time));
          const isToday  = dayIdx === todayDow;
          return (
            <div key={dayIdx} className="day-col" style={{ borderColor: isToday ? C.amberDim : C.border }}>
              <div className="day-col-head" style={{ color: isToday ? C.amber : C.milkDim }}>
                {day}{isToday && " ●"}
              </div>
              {daySlots.map((sl)=>{
                const student = data.students.find((x)=>x.id===sl.studentId);
                return (
                  <div key={sl.id} className={`slot-item${sl.studentId?"":"  slot-free"}`}
                    onClick={()=>setEditSlot(sl)}>
                    <div className="slot-time">{sl.time}</div>
                    <div className="slot-name">{student?.name||(sl.label||"Свободно")}</div>
                  </div>
                );
              })}
              <button className="slot-add-btn" onClick={()=>setSlotModal({ dayIndex:dayIdx })}>+</button>
            </div>
          );
        })}
      </div>

      {/* List */}
      <div className="table-wrap">
        <div className="section-header"><span className="section-title">Все слоты</span></div>
        {slots.length===0
          ? <div className="empty-state">Расписание пустое.</div>
          : (
          <table>
            <thead><tr><th>День</th><th>Время</th><th>Ученик / метка</th><th>Примечание</th><th></th></tr></thead>
            <tbody>
              {[...slots].sort((a,b)=>a.dayIndex-b.dayIndex||a.time.localeCompare(b.time)).map((sl)=>{
                const s = data.students.find((x)=>x.id===sl.studentId);
                return (
                  <tr key={sl.id}>
                    <td style={{ color:C.amber }}>{DAYS_FULL[sl.dayIndex]}</td>
                    <td style={{ fontFamily:"Cormorant Garamond", fontSize:18 }}>{sl.time}</td>
                    <td style={{ fontWeight:500 }}>{s?.name||sl.label||"—"}</td>
                    <td style={{ color:C.milkDim }}>{sl.note||"—"}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn-sm" onClick={()=>setEditSlot(sl)}>Изм.</button>
                        <button className="btn-sm danger" onClick={()=>deleteSlot(sl.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {slotModal && <SlotModal data={data} save={save} defaultDay={slotModal.dayIndex} close={()=>setSlotModal(null)} />}
      {editSlot  && <SlotModal data={data} save={save} existing={editSlot} close={()=>setEditSlot(null)} />}
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function Modal({ title, children, footer, close }) {
  return (
    <div className="modal-overlay" onClick={(e)=>e.target===e.currentTarget&&close()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={close}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── ADD STUDENT ───────────────────────────────────────────────────────────────
function AddStudentModal({ data, save, close }) {
  const [form, setForm] = useState({ name:"", tariff:"", lessons:"", expiry:"", pin:genPin(), lessonPrice:"" });
  const f = (k)=>(e)=>setForm((p)=>({...p,[k]:e.target.value}));

  const submit = () => {
    if (!form.name || !form.lessons) return alert("Заполните имя и кол-во занятий");
    const id = Date.now().toString();
    const newStudent = { id, name:form.name, tariff:form.tariff, lessons:Number(form.lessons), totalLessons:Number(form.lessons), expiry:form.expiry||null, pin:form.pin, lessonPrice:form.lessonPrice?Number(form.lessonPrice):null, songs:[] };
    save({ ...data, students:[...data.students, newStudent] }, [{ type:"upsertStudent", data:newStudent }]);
    close();
  };

  return (
    <Modal title="Новый ученик" close={close}
      footer={<><button className="btn-sm" onClick={close}>Отмена</button><button className="btn-primary" style={{ width:"auto", padding:"8px 24px" }} onClick={submit}>Добавить</button></>}>
      <div className="form-row"><label>Имя</label><input value={form.name} onChange={f("name")} placeholder="Фамилия Имя" /></div>
      <div className="form-row"><label>Тариф / формат</label><input value={form.tariff} onChange={f("tariff")} placeholder="4 урока / месяц" /></div>
      <div className="form-row-2">
        <div className="form-row" style={{marginBottom:0}}><label>Занятий в абонементе</label><input type="number" value={form.lessons} onChange={f("lessons")} placeholder="8" /></div>
        <div className="form-row" style={{marginBottom:0}}><label>Срок до</label><input type="date" value={form.expiry} onChange={f("expiry")} /></div>
      </div>
      <div className="form-row"><label>Стоимость одного урока (сум)</label><input type="number" value={form.lessonPrice} onChange={f("lessonPrice")} placeholder="125000" /></div>
      <div className="form-row">
        <label>Код доступа ученика</label>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input value={form.pin} onChange={f("pin")} maxLength={12} style={{ width:140, letterSpacing:".15em" }} placeholder="ABC123" />
          <button className="btn-sm" onClick={()=>setForm((p)=>({...p,pin:genPin()}))}>Новый</button>
        </div>
        <div className="hint">Буквы и цифры. Ученик вводит этот код для входа.</div>
      </div>
    </Modal>
  );
}

// ── EDIT STUDENT (with quick schedule editor) ─────────────────────────────────
function EditStudentModal({ data, save, studentId, close }) {
  const s = data.students.find((x)=>x.id===studentId);
  const [form, setForm] = useState({
    name: s?.name||"", tariff:s?.tariff||"",
    lessons:s?.lessons||0, totalLessons:s?.totalLessons||0,
    expiry:s?.expiry||"", pin:s?.pin||"",
    lessonPrice: s?.lessonPrice||"",
  });
  const f = (k)=>(e)=>setForm((p)=>({...p,[k]:e.target.value}));

  const mySlots  = (data.schedule||[]).filter((sl)=>sl.studentId===studentId).sort((a,b)=>a.dayIndex-b.dayIndex||a.time.localeCompare(b.time));
  const [slotAdd,  setSlotAdd]  = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const deleteSlot = (id) => save({ ...data, schedule:(data.schedule||[]).filter((sl)=>sl.id!==id) }, [{ type:"deleteSlot", id }]);

  // Financial
  const usedLessons   = (s?.totalLessons||0) - (s?.lessons||0);
  const pricePerLesson = s?.lessonPrice ? Number(s.lessonPrice) : null;
  const spentAmt       = pricePerLesson !== null ? usedLessons * pricePerLesson : null;
  const totalPaid      = totalPaidForStudent(data, studentId);
  const subscriptionAmt = pricePerLesson !== null ? (s?.totalLessons||0) * pricePerLesson : null;

  const submit = () => {
    const updated = { ...s, ...form, lessons:Number(form.lessons), totalLessons:Number(form.totalLessons), lessonPrice:form.lessonPrice?Number(form.lessonPrice):null };
    save({ ...data, students:data.students.map((x)=>x.id===studentId?updated:x) }, [{ type:"upsertStudent", data:updated }]);
    close();
  };

  return (
    <Modal title={`Ученик: ${s?.name}`} close={close}
      footer={<><button className="btn-sm" onClick={close}>Отмена</button><button className="btn-primary" style={{ width:"auto", padding:"8px 24px" }} onClick={submit}>Сохранить</button></>}>

      <div className="form-row"><label>Имя</label><input value={form.name} onChange={f("name")} /></div>
      <div className="form-row"><label>Тариф</label><input value={form.tariff} onChange={f("tariff")} /></div>
      <div className="form-row-2">
        <div className="form-row" style={{marginBottom:0}}><label>Осталось занятий</label><input type="number" value={form.lessons} onChange={f("lessons")} /></div>
        <div className="form-row" style={{marginBottom:0}}><label>Всего в абонементе</label><input type="number" value={form.totalLessons} onChange={f("totalLessons")} /></div>
      </div>
      <div className="form-row-2">
        <div className="form-row" style={{marginBottom:0}}><label>Срок до</label><input type="date" value={form.expiry||""} onChange={f("expiry")} /></div>
        <div className="form-row" style={{marginBottom:0}}><label>Код доступа</label><input value={form.pin} onChange={f("pin")} maxLength={12} style={{ letterSpacing:".12em" }} /></div>
      </div>
      <div className="form-row"><label>Стоимость одного урока (сум)</label><input type="number" value={form.lessonPrice} onChange={f("lessonPrice")} placeholder="125000" /></div>

      {/* Financial summary */}
      {(pricePerLesson !== null || totalPaid > 0) && (
        <div style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.milkDim,marginBottom:12 }}>Финансовая сводка</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {subscriptionAmt!==null && (
              <div>
                <div style={{ fontSize:10,color:C.milkDim,marginBottom:2 }}>Стоимость абонемента</div>
                <div style={{ fontFamily:"Cormorant Garamond",fontSize:18,color:C.milk }}>{subscriptionAmt.toLocaleString("ru-RU")} сум</div>
                <div style={{ fontSize:10,color:C.milkDim,marginTop:1 }}>{s?.totalLessons||0} × {pricePerLesson?.toLocaleString("ru-RU")}</div>
              </div>
            )}
            {spentAmt!==null && (
              <div>
                <div style={{ fontSize:10,color:C.milkDim,marginBottom:2 }}>Списано за проведённые уроки</div>
                <div style={{ fontFamily:"Cormorant Garamond",fontSize:18,color:C.amber }}>{spentAmt.toLocaleString("ru-RU")} сум</div>
                <div style={{ fontSize:10,color:C.milkDim,marginTop:1 }}>{usedLessons} урок(а) × {pricePerLesson?.toLocaleString("ru-RU")}</div>
              </div>
            )}
            {spentAmt!==null && subscriptionAmt!==null && (
              <div>
                <div style={{ fontSize:10,color:C.milkDim,marginBottom:2 }}>Остаток абонемента (ещё не отработано)</div>
                <div style={{ fontFamily:"Cormorant Garamond",fontSize:18,color:C.blue }}>
                  {((s?.lessons||0)*pricePerLesson).toLocaleString("ru-RU")} сум
                </div>
                <div style={{ fontSize:10,color:C.milkDim,marginTop:1 }}>{s?.lessons||0} оставшихся уроков</div>
              </div>
            )}
            <div>
              <div style={{ fontSize:10,color:C.milkDim,marginBottom:2 }}>Всего оплачено (факт)</div>
              <div style={{ fontFamily:"Cormorant Garamond",fontSize:18,color:C.green }}>{totalPaid.toLocaleString("ru-RU")} сум</div>
            </div>
            {spentAmt!==null && totalPaid>0 && (
              <div>
                <div style={{ fontSize:10,color:C.milkDim,marginBottom:2 }}>Баланс (оплачено − отработано)</div>
                <div style={{ fontFamily:"Cormorant Garamond",fontSize:18,color:totalPaid-spentAmt>=0?C.green:C.red }}>
                  {(totalPaid-spentAmt)>=0?"+":""}{(totalPaid-spentAmt).toLocaleString("ru-RU")} сум
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick schedule editor */}
      <div style={{ marginTop:20, borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:".15em", textTransform:"uppercase", color:C.milkDim }}>Расписание ученика</span>
          <button className="btn-sm amber" onClick={()=>setSlotAdd(true)}>+ Добавить</button>
        </div>
        {mySlots.length===0
          ? <div style={{ color:C.milkDim, fontSize:12, paddingBottom:6 }}>Не задано</div>
          : mySlots.map((sl)=>(
            <div key={sl.id} className="sched-slot-row">
              <span style={{ color:C.amber, fontSize:11, fontWeight:600, minWidth:26 }}>{DAYS_RU[sl.dayIndex]}</span>
              <span style={{ fontFamily:"Cormorant Garamond", fontSize:17 }}>{sl.time}</span>
              {sl.note && <span style={{ color:C.milkDim, fontSize:11 }}>{sl.note}</span>}
              <div className="btn-group" style={{ marginLeft:"auto" }}>
                <button className="btn-sm" onClick={()=>setEditSlot(sl)}>Изм.</button>
                <button className="btn-sm danger" onClick={()=>deleteSlot(sl.id)}>✕</button>
              </div>
            </div>
          ))
        }
      </div>

      {slotAdd  && <SlotModal data={data} save={save} defaultStudentId={studentId} close={()=>setSlotAdd(false)} />}
      {editSlot && <SlotModal data={data} save={save} existing={editSlot} close={()=>setEditSlot(null)} />}

      {/* Repertoire inline */}
      <div style={{ marginTop:20, borderTop:`1px solid ${C.border}`, paddingTop:4 }}>
        <SongsSection data={data} save={save} studentId={studentId} mode="teacher" />
      </div>
    </Modal>
  );
}

// ── SLOT MODAL ────────────────────────────────────────────────────────────────
function SlotModal({ data, save, defaultDay=0, defaultStudentId="", existing=null, close }) {
  const [form, setForm] = useState({
    dayIndex: existing?.dayIndex ?? defaultDay,
    time:     existing?.time     ?? "10:00",
    studentId:existing?.studentId?? defaultStudentId,
    label:    existing?.label    ?? "",
    note:     existing?.note     ?? "",
  });
  const f = (k)=>(e)=>setForm((p)=>({...p,[k]:e.target.value}));

  const submit = () => {
    const slots = data.schedule||[];
    if (existing) {
      const updated = {...existing,...form,dayIndex:Number(form.dayIndex)};
      save({ ...data, schedule:slots.map((s)=>s.id===existing.id?updated:s) }, [{ type:"upsertSlot", data:updated }]);
    } else {
      const newSlot = { id:Date.now().toString(), ...form, dayIndex:Number(form.dayIndex) };
      save({ ...data, schedule:[...slots, newSlot] }, [{ type:"upsertSlot", data:newSlot }]);
    }
    close();
  };

  return (
    <Modal title={existing?"Изменить слот":"Добавить слот"} close={close}
      footer={<><button className="btn-sm" onClick={close}>Отмена</button><button className="btn-primary" style={{ width:"auto", padding:"8px 24px" }} onClick={submit}>{existing?"Сохранить":"Добавить"}</button></>}>
      <div className="form-row-2">
        <div className="form-row" style={{marginBottom:0}}>
          <label>День</label>
          <select value={form.dayIndex} onChange={f("dayIndex")}>
            {DAYS_FULL.map((d,i)=><option key={i} value={i}>{d}</option>)}
          </select>
        </div>
        <div className="form-row" style={{marginBottom:0}}><label>Время</label><input type="time" value={form.time} onChange={f("time")} /></div>
      </div>
      <div className="form-row" style={{marginTop:14}}>
        <label>Ученик (или оставьте пустым)</label>
        <select value={form.studentId} onChange={f("studentId")}>
          <option value="">— не назначен —</option>
          {data.students.map((s)=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {!form.studentId && (
        <div className="form-row"><label>Метка</label><input value={form.label} onChange={f("label")} placeholder="Свободное время / Репетиция" /></div>
      )}
      <div className="form-row"><label>Примечание</label><input value={form.note} onChange={f("note")} placeholder="Онлайн / офлайн / адрес" /></div>
    </Modal>
  );
}

// ── ADD LESSON (with 3 types) ─────────────────────────────────────────────────
function AddLessonModal({ data, save, close }) {
  const [form, setForm] = useState({ studentId:"", date:TODAY(), type:"lesson", note:"" });
  const f = (k)=>(e)=>setForm((p)=>({...p,[k]:e.target.value}));
  const student = data.students.find((s)=>s.id===form.studentId);

  const submit = () => {
    if (!form.studentId) return alert("Выберите ученика");
    const charged = form.type !== "absent_free";
    if (charged && (!student || student.lessons <= 0)) return alert("У ученика нет доступных занятий");
    const remain = charged ? student.lessons - 1 : student.lessons;
    const newLesson = { id:Date.now().toString(), studentId:form.studentId, date:form.date, type:form.type, note:form.note, remainAfter: charged ? remain : null };
    const updatedStudent = charged ? { ...student, lessons:remain } : null;
    const ops = [{ type:"insertLesson", data:newLesson }];
    if (updatedStudent) ops.push({ type:"upsertStudent", data:updatedStudent });
    save({
      ...data,
      students: data.students.map((s)=>s.id===form.studentId?{...s,lessons:remain}:s),
      lessons:  [...data.lessons, newLesson],
    }, ops);
    close();
  };

  return (
    <Modal title="Записать событие" close={close}
      footer={<><button className="btn-sm" onClick={close}>Отмена</button><button className="btn-primary" style={{ width:"auto", padding:"8px 24px" }} onClick={submit}>Сохранить</button></>}>

      <div className="form-row">
        <label>Ученик</label>
        <select value={form.studentId} onChange={f("studentId")}>
          <option value="">Выбрать…</option>
          {data.students.map((s)=><option key={s.id} value={s.id}>{s.name} — остаток: {s.lessons}</option>)}
        </select>
      </div>
      <div className="form-row"><label>Дата</label><input type="date" value={form.date} onChange={f("date")} /></div>

      <div className="form-row">
        <label>Тип события</label>
        <div className="radio-group">
          <div className="radio-opt">
            <input type="radio" id="t-lesson" name="etype" value="lesson" checked={form.type==="lesson"} onChange={f("type")} />
            <label htmlFor="t-lesson">Урок</label>
          </div>
          <div className="radio-opt red">
            <input type="radio" id="t-charged" name="etype" value="absent_charged" checked={form.type==="absent_charged"} onChange={f("type")} />
            <label htmlFor="t-charged">Прогул (−1)</label>
          </div>
          <div className="radio-opt blue">
            <input type="radio" id="t-free" name="etype" value="absent_free" checked={form.type==="absent_free"} onChange={f("type")} />
            <label htmlFor="t-free">Отмена (0)</label>
          </div>
        </div>
      </div>

      <div style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, padding:"10px 14px", fontSize:12, color:C.milkDim, marginBottom:14 }}>
        {form.type==="lesson"         && "✓ Урок проведён — занятие списывается с баланса."}
        {form.type==="absent_charged" && "✗ Ученик не пришёл без предупреждения — занятие списывается."}
        {form.type==="absent_free"    && "○ Отмена по согласованию — баланс не меняется."}
      </div>

      <div className="form-row">
        <label>
          {form.type==="lesson" ? "Тема занятия" : "Причина отсутствия"}
        </label>
        <input value={form.note} onChange={f("note")}
          placeholder={
            form.type==="lesson"         ? "Работа над опорой дыхания…" :
            form.type==="absent_charged" ? "Не предупредил, не явился" :
            "Болезнь, согласовано заранее"
          } />
      </div>

      {student && (
        <div className="info-box">
          {form.type==="absent_free"
            ? <>Остаток <strong style={{ color:C.amber }}>{student.lessons}</strong> — без изменений.</>
            : <>После записи останется: <strong style={{ color:C.amber }}>{Math.max(0,student.lessons-1)}</strong> шт.</>
          }
        </div>
      )}
    </Modal>
  );
}

// ── ADD PAYMENT ───────────────────────────────────────────────────────────────
function AddPaymentModal({ data, save, close }) {
  const [form, setForm] = useState({ studentId:"", date:TODAY(), amount:"", lessonsAdded:"", expiry:"", note:"" });
  const f = (k)=>(e)=>setForm((p)=>({...p,[k]:e.target.value}));

  const submit = () => {
    if (!form.studentId || !form.amount) return alert("Выберите ученика и введите сумму");
    const added = Number(form.lessonsAdded)||0;
    const newPayment = { id:Date.now().toString(), studentId:form.studentId, date:form.date, amount:Number(form.amount), lessonsAdded:added||null, expiry:form.expiry||null, note:form.note };
    const updatedStudent = data.students.find((s)=>s.id===form.studentId);
    const patchedStudent = updatedStudent ? { ...updatedStudent, lessons:updatedStudent.lessons+added, totalLessons:updatedStudent.totalLessons+added, expiry:form.expiry||updatedStudent.expiry } : null;
    const ops = [{ type:"insertPayment", data:newPayment }];
    if (patchedStudent) ops.push({ type:"upsertStudent", data:patchedStudent });
    save({
      ...data,
      students: data.students.map((s) => {
        if (s.id!==form.studentId) return s;
        return { ...s, lessons:s.lessons+added, totalLessons:s.totalLessons+added, expiry:form.expiry||s.expiry };
      }),
      payments: [...data.payments, newPayment],
    }, ops);
    close();
  };

  return (
    <Modal title="Внести оплату" close={close}
      footer={<><button className="btn-sm" onClick={close}>Отмена</button><button className="btn-primary" style={{ width:"auto", padding:"8px 24px" }} onClick={submit}>Сохранить</button></>}>
      <div className="form-row">
        <label>Ученик</label>
        <select value={form.studentId} onChange={f("studentId")}>
          <option value="">Выбрать…</option>
          {data.students.map((s)=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="form-row-2">
        <div className="form-row" style={{marginBottom:0}}><label>Дата оплаты</label><input type="date" value={form.date} onChange={f("date")} /></div>
        <div className="form-row" style={{marginBottom:0}}><label>Сумма (сум)</label><input type="number" value={form.amount} onChange={f("amount")} placeholder="500000" /></div>
      </div>
      <div className="form-row-2">
        <div className="form-row" style={{marginBottom:0}}><label>Занятий добавить</label><input type="number" value={form.lessonsAdded} onChange={f("lessonsAdded")} placeholder="8" /></div>
        <div className="form-row" style={{marginBottom:0}}><label>Абонемент до</label><input type="date" value={form.expiry} onChange={f("expiry")} /></div>
      </div>
      <div className="form-row"><label>Комментарий / тариф</label><input value={form.note} onChange={f("note")} placeholder="Абонемент 8 уроков" /></div>
    </Modal>
  );
}

// ─── SONGS / REPERTOIRE ──────────────────────────────────────────────────────
// mode: "teacher" = full control | "student" = can add own + upload to any | no edit/delete on teacher entries
function SongsSection({ data, save, studentId, mode="teacher" }) {
  const s     = data.students.find((x)=>x.id===studentId);
  const songs = s?.songs || [];

  const [showAdd,    setShowAdd]    = useState(false);
  const [editSong,   setEditSong]   = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const emptyForm = { title:"", composer:"", status:"learning", notes:"", lyrics:"" };
  const [newForm, setNewForm] = useState(emptyForm);
  const nf = (k)=>(e)=>setNewForm((p)=>({...p,[k]:e.target.value}));

  const updateSongs = (newSongs) =>
    save(
      { ...data, students: data.students.map((x)=>x.id===studentId?{...x,songs:newSongs}:x) },
      [{ type:"updateSongs", studentId, songs:newSongs }]
    );

  const addSong = () => {
    if (!newForm.title.trim()) return alert("Введите название");
    updateSongs([...songs, {
      id: Date.now().toString(),
      addedBy: mode,   // "teacher" | "student"
      ...newForm, rating:null, files:[]
    }]);
    setNewForm(emptyForm);
    setShowAdd(false);
  };

  const deleteSong = (id) => {
    if (!confirm("Удалить песню из репертуара?")) return;
    updateSongs(songs.filter((x)=>x.id!==id));
  };

  const setRating = (id, r) =>
    updateSongs(songs.map((x)=>x.id===id?{...x,rating:x.rating===r?null:r}:x));

  const saveEdit = (id, patch) => {
    updateSongs(songs.map((x)=>x.id===id?{...x,...patch}:x));
    setEditSong(null);
  };

  const handleFileUpload = (songId, e, audioOnly=false) => {
    const file = e.target.files[0];
    if (!file) return;
    if (audioOnly && !file.type.startsWith("audio/")) return alert("Выберите аудио файл (mp3, m4a, wav…)");
    if (file.size > 15*1024*1024) return alert("Файл слишком большой (макс. 15 МБ)");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const f = { id:Date.now().toString(), name:file.name, type:file.type, isAudio:file.type.startsWith("audio/"), data:ev.target.result, addedBy:mode };
      updateSongs(songs.map((x)=>x.id===songId?{...x,files:[...(x.files||[]),f]}:x));
    };
    reader.readAsDataURL(file);
    e.target.value="";
  };

  const deleteFile = (songId, fileId) =>
    updateSongs(songs.map((x)=>x.id===songId?{...x,files:(x.files||[]).filter((f)=>f.id!==fileId)}:x));

  const STATUS_LABELS = { learning:"Изучаем", polishing:"Полируем", ready:"Готова", paused:"Пауза" };
  const STATUS_COLORS = { learning:C.amber, polishing:C.blue, ready:C.green, paused:C.milkDim };

  // What the current role can do to a given song
  const canEdit   = (song) => mode==="teacher" || song.addedBy==="student";
  const canDelete = (song) => mode==="teacher" || song.addedBy==="student";
  // Student can upload files to ANY song (their recording, practice take, etc.)
  const canUpload = () => true;
  // Student can delete only files they added
  const canDeleteFile = (f) => mode==="teacher" || f.addedBy==="student" || !f.addedBy;

  const isTeacher = mode === "teacher";
  const isStudent = mode === "student";

  return (
    <div className="songs-wrap">
      <div className="section-header">
        <span className="section-title">🎶 Репертуар</span>
        <button className="btn-sm amber" onClick={()=>setShowAdd(v=>!v)}>
          {showAdd ? "Отмена" : isStudent ? "+ Предложить песню" : "+ Добавить песню"}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="song-add-form">
          {isStudent && (
            <div style={{ fontSize:11, color:C.milkDim, marginBottom:12, padding:"6px 10px", background:C.blueGlow, border:`1px solid rgba(74,127,160,.25)` }}>
              Педагог увидит вашу запись и сможет добавить статус, заметки и текст
            </div>
          )}
          <div className="form-row-2">
            <div className="form-row" style={{marginBottom:0}}><label>Название</label><input value={newForm.title} onChange={nf("title")} placeholder="Название песни" autoFocus /></div>
            <div className="form-row" style={{marginBottom:0}}><label>Исполнитель / автор</label><input value={newForm.composer} onChange={nf("composer")} placeholder="Автор" /></div>
          </div>
          {isTeacher && (
            <>
              <div className="form-row" style={{marginTop:12}}>
                <label>Статус</label>
                <select value={newForm.status} onChange={nf("status")}>
                  {Object.entries(STATUS_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-row"><label>Заметки педагога для ученика</label><textarea value={newForm.notes} onChange={nf("notes")} rows={2} placeholder="На что обратить внимание, задание…" /></div>
              <div className="form-row"><label>Текст песни</label><textarea value={newForm.lyrics} onChange={nf("lyrics")} rows={6} placeholder="Вставьте полный текст…" /></div>
            </>
          )}
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
            <button className="btn-sm" onClick={()=>setShowAdd(false)}>Отмена</button>
            <button className="btn-sm amber" onClick={addSong}>Сохранить</button>
          </div>
        </div>
      )}

      {songs.length===0 && !showAdd && (
        <div className="empty-state" style={{ padding:"28px 20px" }}>
          {isStudent ? "Педагог пока не добавил песни. Вы можете предложить свою." : "Добавьте первую песню в репертуар."}
        </div>
      )}

      {songs.map((song)=>{
        const isExpanded = expandedId === song.id;
        const isEditing  = editSong  === song.id;
        const audioFiles = (song.files||[]).filter((f)=>f.isAudio);
        const otherFiles = (song.files||[]).filter((f)=>!f.isAudio);
        const byStudent  = song.addedBy === "student";

        return (
          <div key={song.id} className="song-item">
            {isEditing && canEdit(song) ? (
              <EditSongInline
                song={song}
                isTeacher={isTeacher}
                onSave={(p)=>saveEdit(song.id,p)}
                onCancel={()=>setEditSong(null)}
                STATUS_LABELS={STATUS_LABELS}
              />
            ) : (
              <>
                {/* ── Title row ── */}
                <div className="song-title-row">
                  {/* Rating buttons: teacher sets them; student sees them */}
                  <div className="song-rating">
                    <button
                      className={`rating-btn plus${song.rating==="plus"?" active":""}`}
                      onClick={()=>isTeacher && setRating(song.id,"plus")}
                      style={{ cursor:isTeacher?"pointer":"default" }}
                      title={isTeacher?"Хорошо получается":"Оценка педагога"}>＋</button>
                    <button
                      className={`rating-btn minus${song.rating==="minus"?" active":""}`}
                      onClick={()=>isTeacher && setRating(song.id,"minus")}
                      style={{ cursor:isTeacher?"pointer":"default" }}
                      title={isTeacher?"Нужно поработать":"Оценка педагога"}>−</button>
                  </div>

                  <span className="song-title">{song.title}</span>

                  {/* Status badge */}
                  <span className="song-status-tag" style={{
                    color: STATUS_COLORS[song.status]||C.milkDim,
                    border:`1px solid ${STATUS_COLORS[song.status]||C.border}40`,
                    background:`${STATUS_COLORS[song.status]||C.border}14`,
                  }}>
                    {STATUS_LABELS[song.status]||"—"}
                  </span>

                  {/* Added-by chip */}
                  {byStudent && (
                    <span style={{ fontSize:9, padding:"2px 7px", background:C.blueGlow, border:`1px solid rgba(74,127,160,.3)`, color:"#7ab8d8", letterSpacing:".08em" }}>
                      от ученика
                    </span>
                  )}

                  {/* Action buttons */}
                  {canEdit(song) && (
                    <div className="btn-group">
                      <button className="btn-sm" onClick={()=>setEditSong(song.id)}>Изм.</button>
                      {canDelete(song) && (
                        <button className="btn-sm danger" onClick={()=>deleteSong(song.id)}>✕</button>
                      )}
                    </div>
                  )}
                </div>

                {/* Composer */}
                {song.composer && (
                  <div className="song-meta" style={{ marginTop:5 }}>
                    <span className="song-composer">🎵 {song.composer}</span>
                  </div>
                )}

                {/* Teacher notes — always visible */}
                {song.notes && (
                  <div className="song-notes-text" style={{ marginTop:6 }}>
                    {isStudent && <span style={{ fontSize:9, color:C.amber, fontWeight:600, letterSpacing:".1em", marginRight:6 }}>ПЕДАГОГ:</span>}
                    {song.notes}
                  </div>
                )}

                {/* Lyrics toggle */}
                {song.lyrics && (
                  <>
                    <button className="song-lyrics-toggle" onClick={()=>setExpandedId(isExpanded?null:song.id)}>
                      {isExpanded ? "▲ Скрыть текст" : "▼ Показать текст песни"}
                    </button>
                    {isExpanded && <div className="song-lyrics">{song.lyrics}</div>}
                  </>
                )}

                {/* ── Audio players ── */}
                {audioFiles.length > 0 && (
                  <div style={{ marginTop:10 }}>
                    {audioFiles.map((f)=>(
                      <div key={f.id} style={{ marginBottom:8, background:C.surfaceAlt, padding:"8px 12px", border:`1px solid ${C.border}` }}>
                        <div style={{ fontSize:10, color:f.addedBy==="student"?"#7ab8d8":C.milkDim, marginBottom:5, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span>🎧 {f.name.length>44?f.name.slice(0,42)+"…":f.name}
                            {f.addedBy==="student" && <span style={{ marginLeft:6, fontSize:9, opacity:.7 }}>(от ученика)</span>}
                          </span>
                          {canDeleteFile(f) && (
                            <button className="btn-sm danger" style={{ padding:"1px 7px" }} onClick={()=>deleteFile(song.id,f.id)}>✕</button>
                          )}
                        </div>
                        <audio controls src={f.data} style={{ width:"100%", height:34, accentColor:C.amber }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Other files ── */}
                {otherFiles.length > 0 && (
                  <div className="song-files" style={{ marginTop:8 }}>
                    {otherFiles.map((f)=>(
                      <a key={f.id} href={f.data} download={f.name} className="song-file-chip" title={f.name}>
                        📎 {f.name.length>22?f.name.slice(0,20)+"…":f.name}
                        {canDeleteFile(f) && (
                          <span className="del" onClick={(e)=>{e.preventDefault();deleteFile(song.id,f.id);}}>×</span>
                        )}
                      </a>
                    ))}
                  </div>
                )}

                {/* ── Upload buttons (both roles can upload) ── */}
                {canUpload() && (
                  <div style={{ marginTop:10, display:"flex", gap:8, flexWrap:"wrap" }}>
                    <label style={{ cursor:"pointer" }}>
                      <input type="file" accept="audio/*" style={{ display:"none" }}
                        onChange={(e)=>handleFileUpload(song.id,e,true)} />
                      <span className="btn-sm amber" style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                        🎧 {isStudent ? "Загрузить мою запись" : "Добавить аудио"}
                      </span>
                    </label>
                    <label style={{ cursor:"pointer" }}>
                      <input type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.png" style={{ display:"none" }}
                        onChange={(e)=>handleFileUpload(song.id,e,false)} />
                      <span className="btn-sm" style={{ display:"inline-flex", alignItems:"center", gap:5 }}>
                        📎 {isStudent ? "Прикрепить файл" : "Прикрепить файл"}
                      </span>
                    </label>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EditSongInline({ song, isTeacher, onSave, onCancel, STATUS_LABELS }) {
  const [form, setForm] = useState({
    title:    song.title    || "",
    composer: song.composer || "",
    status:   song.status   || "learning",
    notes:    song.notes    || "",
    lyrics:   song.lyrics   || "",
  });
  const f = (k)=>(e)=>setForm((p)=>({...p,[k]:e.target.value}));
  return (
    <div>
      <div className="form-row-2">
        <div className="form-row" style={{marginBottom:0}}><label>Название</label><input value={form.title} onChange={f("title")} /></div>
        <div className="form-row" style={{marginBottom:0}}><label>Автор</label><input value={form.composer} onChange={f("composer")} /></div>
      </div>
      {isTeacher && (
        <>
          <div className="form-row" style={{marginTop:12}}>
            <label>Статус</label>
            <select value={form.status} onChange={f("status")}>
              {Object.entries(STATUS_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-row"><label>Заметки педагога</label><textarea value={form.notes} onChange={f("notes")} rows={2} /></div>
          <div className="form-row"><label>Текст песни</label><textarea value={form.lyrics} onChange={f("lyrics")} rows={5} /></div>
        </>
      )}
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
        <button className="btn-sm" onClick={onCancel}>Отмена</button>
        <button className="btn-sm amber" onClick={()=>onSave(form)}>Сохранить</button>
      </div>
    </div>
  );
}

// ─── STUDENT VIEW ─────────────────────────────────────────────────────────────
function StudentView({ data, save, studentId, logout }) {
  const s = data.students.find((x)=>x.id===studentId);
  if (!s) return null;

  const myLessons  = data.lessons.filter((l)=>l.studentId===studentId).sort((a,b)=>b.date.localeCompare(a.date));
  const myPayments = data.payments.filter((p)=>p.studentId===studentId).sort((a,b)=>b.date.localeCompare(a.date));
  const mySlots    = (data.schedule||[]).filter((sl)=>sl.studentId===studentId).sort((a,b)=>a.dayIndex-b.dayIndex||a.time.localeCompare(b.time));

  const dl = daysLeft(s.expiry);
  const usedLessons = s.totalLessons - s.lessons;
  const progressPct = s.totalLessons > 0 ? Math.round((usedLessons/s.totalLessons)*100) : 0;
  const isExpiring  = s.lessons <= 2 || (dl !== null && dl !== undefined && dl <= 7 && dl > 0);
  const isExpired   = s.lessons === 0 || (dl !== null && dl !== undefined && dl <= 0);

  return (
    <div>
      <header className="header">
        <div className="header-logo">Inspiration</div>
        <div className="header-right">
          <span className="header-role">Ученик</span>
          <button className="btn-logout" onClick={logout}>Выйти</button>
        </div>
      </header>
      <div className="main">
        <div className="student-hero">
          <div className="student-name">{s.name}</div>
          {s.tariff && <div className="student-tariff">{s.tariff}</div>}
        </div>

        <div className="info-grid">
          <div className="info-block">
            <div className="info-block-label">Осталось занятий</div>
            <div className="info-block-value" style={{ color:isExpired?C.red:isExpiring?C.amber:C.amber }}>{s.lessons}</div>
            <div className="info-block-sub">из {s.totalLessons} в абонементе</div>
          </div>
          <div className="info-block">
            <div className="info-block-label">Абонемент действует до</div>
            <div className="info-block-value" style={{ fontSize:22, paddingTop:4, color:isExpired?C.red:C.amber }}>{fmtDate(s.expiry)}</div>
            {dl!==null && (
              <div className="info-block-sub" style={{ color:dl<=7?C.red:C.milkDim }}>
                {dl>0?`осталось ${dl} дн.`:dl===0?"сегодня последний день":"срок истёк"}
              </div>
            )}
          </div>
        </div>

        <div className="big-progress">
          <div className="big-progress-label">Использовано занятий</div>
          <div className="big-track">
            <div className="big-fill" style={{ width:progressPct+"%", background:progressPct>=80?C.red:C.amber }} />
          </div>
          <div className="progress-labels"><span>{usedLessons} проведено</span><span>{s.lessons} осталось</span></div>
        </div>

        {(isExpiring||isExpired) && (
          <div className="warn-box">
            {isExpired?"⚠ Абонемент исчерпан — обратитесь к педагогу для продления.":"⚡ Скоро закончится абонемент — не забудьте продлить."}
          </div>
        )}

        {/* Repertoire — right after balance cards */}
        <SongsSection data={data} save={save} studentId={studentId} mode="student" />

        {/* My schedule */}
        {mySlots.length > 0 && (
          <div className="schedule-mini">
            <div className="schedule-mini-title">Моё расписание</div>
            {mySlots.map((sl)=>(
              <div key={sl.id} className="schedule-row">
                <span className="schedule-day-tag">{DAYS_RU[sl.dayIndex]}</span>
                <span className="schedule-time-tag">{sl.time}</span>
                {sl.note && <span style={{ fontSize:12, color:C.milkDim }}>{sl.note}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Lesson history */}
        {myLessons.length > 0 && (
          <div className="table-wrap">
            <div className="section-header"><span className="section-title">История занятий</span></div>
            <table>
              <thead><tr><th>Дата</th><th>Тип</th><th>Тема / причина</th><th>Остаток после</th></tr></thead>
              <tbody>
                {myLessons.map((l)=>(
                  <tr key={l.id}>
                    <td>{fmtDate(l.date)}</td>
                    <td>{lessonTypeBadge(l.type)}</td>
                    <td style={{ color:C.milkDim }}>{l.note||"—"}</td>
                    <td>{l.type==="absent_free"?<span style={{ color:C.milkDim, fontSize:11 }}>без изм.</span>:(l.remainAfter??'—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment history */}
        {myPayments.length > 0 && (
          <div className="table-wrap">
            <div className="section-header"><span className="section-title">Мои оплаты</span></div>
            <table>
              <thead><tr><th>Дата</th><th>Сумма</th><th>Занятий +</th><th>Абонемент до</th></tr></thead>
              <tbody>
                {myPayments.map((p)=>(
                  <tr key={p.id}>
                    <td>{fmtDate(p.date)}</td>
                    <td style={{ color:C.amber, fontFamily:"Cormorant Garamond", fontSize:16 }}>{Number(p.amount).toLocaleString("ru-RU")} сум</td>
                    <td>{p.lessonsAdded||"—"}</td>
                    <td>{fmtDate(p.expiry)||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
