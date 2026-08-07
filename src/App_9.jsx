import React, { useState, useEffect, useRef } from "react";
import {
  Car, CalendarDays, AlertTriangle, FileText, Settings, Plus, Printer,
  Camera, X, Check, ChevronLeft, LayoutDashboard, Loader2, Trash2, Pencil
} from "lucide-react";

/* ============================================================
   ぐっどレンタカー 業務管理アプリ(プロトタイプ v1.0)
   Good Innovation株式会社
   開発指示書 v1.0 の MVP 範囲を試作したものです。
   ============================================================ */

// ---------- 料金マスタ(初期・税別) ----------
const CLASSES = ["軽自動車（ガソリン）", "1200CC", "HV普通車", "ワゴン車", "SUV車（HV）", "普通車3500cc"];
const RATES = {
  "軽自動車（ガソリン）": { h3: 2200, h6: 3850, h12: 3850, h24: 5000, over: 1000, addDay: 5000 },
  "1200CC":              { h3: 2750, h6: 4400, h12: 4400, h24: 7000, over: 1000, addDay: 7000 },
  "HV普通車":            { h3: 3850, h6: 6600, h12: 6600, h24: 10000, over: 1000, addDay: 10000 },
  "ワゴン車":            { h3: 4400, h6: 7700, h12: 7700, h24: 12000, over: 1100, addDay: 12000 },
  "SUV車（HV）":         { h3: 6600, h6: 11000, h12: 11000, h24: 22000, over: 2000, addDay: 22000 },
  "普通車3500cc":        { h3: 7700, h6: 13200, h12: 13200, h24: 25000, over: 2500, addDay: 25000 },
};
const OPTIONS = [
  { key: "menseki", label: "免責補償", price: 1650, unit: "1日" },
  { key: "child",   label: "チャイルドシート", price: 550, unit: "1日" },
  { key: "junior",  label: "ジュニアシート", price: 550, unit: "1日" },
  { key: "navi",    label: "カーナビ", price: 550, unit: "1日" },
  { key: "etc",     label: "ETC車載器", price: 330, unit: "1日" },
];
const NOC = { none: { label: "なし", price: 0 }, drivable: { label: "NOC・自走可能", price: 20000 }, towed: { label: "NOC・自走不可／レッカー", price: 50000 } };

const STATUSES = ["下書き", "予約", "配車準備", "貸渡中", "返却処理", "請求待ち", "請求済", "完了", "キャンセル"];
const STATUS_COLOR = {
  "下書き": "bg-gray-100 text-gray-600 border-gray-300",
  "予約": "bg-sky-50 text-sky-700 border-sky-300",
  "配車準備": "bg-indigo-50 text-indigo-700 border-indigo-300",
  "貸渡中": "bg-emerald-50 text-emerald-700 border-emerald-400",
  "返却処理": "bg-amber-50 text-amber-700 border-amber-300",
  "請求待ち": "bg-orange-50 text-orange-700 border-orange-300",
  "請求済": "bg-violet-50 text-violet-700 border-violet-300",
  "完了": "bg-gray-100 text-gray-500 border-gray-300",
  "キャンセル": "bg-red-50 text-red-500 border-red-200",
};

// ---------- 初期データ(車検証記録事項より) ----------
const INITIAL_VEHICLES = [
  { id: "V1", regNo: "佐賀400わ4136", name: "ニッサン AD（バン）", chassis: "VM20-025457", cls: "1200CC", shaken: "2027-03-29", firstReg: "平成24年3月", category: "貨物", state: "稼働" },
  { id: "V2", regNo: "佐賀300わ2561", name: "三菱 アウトランダーPHEV", chassis: "GG2W-0400914", cls: "SUV車（HV）", shaken: "2027-01-25", firstReg: "平成29年3月", category: "乗用", state: "稼働" },
  { id: "V3", regNo: "佐賀300わ2724", name: "三菱 エクリプスクロスPHEV", chassis: "GL3W-0302809", cls: "SUV車（HV）", shaken: "2026-05-24", firstReg: "令和3年5月", category: "乗用", state: "整備中" },
  { id: "V4", regNo: "佐賀300わ1509", name: "トヨタ プリウス", chassis: "ZVW50-8065727", cls: "HV普通車", shaken: "2026-07-04", firstReg: "平成29年6月", category: "乗用", state: "整備中" },
  { id: "V5", regNo: "佐賀500わ6493", name: "トヨタ ルーミー（銀）", chassis: "M900A-0562004", cls: "1200CC", shaken: "2026-06-29", firstReg: "令和3年6月", category: "乗用", state: "整備中" },
  { id: "V6", regNo: "佐賀500わ6494", name: "トヨタ ルーミー（黒）", chassis: "M900A-0557765", cls: "1200CC", shaken: "2026-06-28", firstReg: "令和3年6月", category: "乗用", state: "整備中" },
];

const DEFAULT_SETTINGS = {
  company: "Good Innovation株式会社",
  brand: "ぐっどレンタカー",
  address: "佐賀県武雄市山内町宮野1113-3",
  tel: "090-8351-3796",
  fax: "050-3737-9111",
  rep: "久保 良真",
  permitNo: "",          // 自家用自動車有償貸渡許可番号(未確定・ブロッカー)
  invoiceRegNo: "",      // 適格請求書発行事業者登録番号(未確定・ブロッカー)
  bank: "PayPay銀行 ビジネス営業部 普通 8796241",
  bankHolder: "Good Innovation株式会社",
  taxRate: 10,
  rounding: "round",     // round | floor | ceil
  nocTaxable: false,     // F-02: NOCの課税区分。既定は対象外(不課税)。税理士確認のうえ変更
  invoiceYear: 2026,
  invoiceSeq: 1,
  caseSeq: 1,
  priceVersion: "2026-04-01 適用 第1版",
};

// ---------- ユーティリティ ----------
const yen = (n) => (n === null || n === undefined || isNaN(n) ? "―" : "¥" + Number(n).toLocaleString("ja-JP"));
const num = (n) => (n === null || n === undefined || isNaN(n) ? "―" : Number(n).toLocaleString("ja-JP"));
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function wareki(dateStr) {
  if (!dateStr) return "―";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  const y = d.getFullYear();
  let era = "", ey = 0;
  if (y >= 2019) { era = "令和"; ey = y - 2018; }
  else if (y >= 1989) { era = "平成"; ey = y - 1988; }
  else { era = "昭和"; ey = y - 1925; }
  return `${era}${ey === 1 ? "元" : ey}年${d.getMonth() + 1}月${d.getDate()}日`;
}
function jpDate(dateStr) {
  if (!dateStr) return "―";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
// 両端含み日数(同日=1日)
function incDays(a, b) {
  if (!a || !b) return 0;
  const d1 = new Date(a + "T00:00:00"), d2 = new Date(b + "T00:00:00");
  if (isNaN(d1) || isNaN(d2)) return 0;
  return Math.max(0, Math.round((d2 - d1) / 864e5) + 1);
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(todayStr() + "T00:00:00");
  return Math.round((d - t) / 864e5);
}
function roundBy(v, mode) {
  if (mode === "floor") return Math.floor(v);
  if (mode === "ceil") return Math.ceil(v);
  return Math.round(v);
}
function overlap(a1, a2, b1, b2) {
  return a1 <= b2 && b1 <= a2;
}

// ---------- 料金計算(監査F-01/F-02/F-03対応) ----------
// 日時ヘルパー
const dtOf = (dateStr, timeStr) =>
  new Date(`${dateStr}T${timeStr && /^\d{2}:\d{2}$/.test(timeStr) ? timeStr : "00:00"}:00`);
function hoursBetween(s) {
  if (!s.start || !s.end) return 0;
  const a = dtOf(s.start, s.startTime || "00:00"), b = dtOf(s.end, s.endTime || "00:00");
  if (isNaN(a) || isNaN(b)) return 0;
  return (b - a) / 36e5;
}

// 時間料金(料金表準拠): 24時間超は 24時間料金 + 追加日料金 + 超過料金(追加日料金を上限)
function timeFare(rates, hours) {
  if (hours <= 0) return { amount: 0, label: "0時間" };
  if (hours <= 3) return { amount: rates.h3, label: "3時間料金" };
  if (hours <= 6) return { amount: rates.h6, label: "6時間料金" };
  if (hours <= 12) return { amount: rates.h12, label: "12時間料金" };
  if (hours <= 24) return { amount: rates.h24, label: "24時間料金" };
  const extra = hours - 24;
  const fullDays = Math.floor(extra / 24);
  const rem = extra - fullDays * 24;
  const remCharge = rem > 0 ? Math.min(Math.ceil(rem) * rates.over, rates.addDay) : 0;
  return {
    amount: rates.h24 + fullDays * rates.addDay + remCharge,
    label: `24時間＋追加${fullDays}日${rem > 0 ? `＋超過${Math.ceil(rem)}時間` : ""}`,
  };
}

function calcSegment(seg, vehicles) {
  const v = vehicles.find((x) => x.id === seg.vehicleId);
  const rates = v ? RATES[v.cls] : null;
  const days = incDays(seg.start, seg.end);
  const hours = hoursBetween(seg);
  if (!rates) return { days, hours, base: 0, over: 0, total: 0, unit: 0, label: "車両未選択", vehicle: null };
  const isTime = seg.slot !== "days"; // 旧データ(h3等)も時間計算として扱う
  if (isTime) {
    const t = timeFare(rates, hours);
    return { days, hours, base: t.amount, over: 0, total: t.amount, unit: rates.h24, label: `時間計算（${t.label}）`, vehicle: v };
  }
  const unit = seg.unitPrice != null && seg.unitPrice !== "" ? Number(seg.unitPrice) : rates.h24;
  const base = days * unit;
  const over = (Number(seg.overHours) || 0) * rates.over;
  return { days, hours, base, over, total: base + over, unit, label: `日貸し ${days}日`, vehicle: v };
}

// F-03: 案件全体のユニーク利用日数(車両交換で重複する日は1日として数える)
function uniqueDays(segments) {
  const set = new Set();
  for (const s of segments || []) {
    if (!s.start || !s.end) continue;
    const d1 = new Date(s.start + "T00:00:00"), d2 = new Date(s.end + "T00:00:00");
    if (isNaN(d1) || isNaN(d2) || d2 < d1) continue;
    for (let t = d1.getTime(), i = 0; t <= d2.getTime() && i < 1500; t += 864e5, i++) set.add(t);
  }
  return set.size;
}

function calcCase(c, vehicles, settings) {
  const segs = (c.segments || []).map((s) => calcSegment(s, vehicles));
  const segTotal = segs.reduce((a, s) => a + s.total, 0);
  const totalDays = uniqueDays(c.segments);
  const optLines = OPTIONS.filter((o) => c.options?.[o.key]?.on).map((o) => {
    const d = Number(c.options[o.key].days ?? totalDays) || 0;
    return { label: o.label, days: d, price: o.price, amount: d * o.price };
  });
  const optTotal = optLines.reduce((a, o) => a + o.amount, 0);
  const nocAmt = NOC[c.noc || "none"].price;
  const nocTaxable = settings.nocTaxable === true; // F-02: 既定は対象外(不課税)
  const other = Number(c.other) || 0;
  const discount = Number(c.discount) || 0;
  const taxable = segTotal + optTotal + other - discount + (nocTaxable ? nocAmt : 0); // 10%対象
  const nonTaxable = nocTaxable ? 0 : nocAmt;                                        // 対象外
  const taxNone = c.taxMode === "none";                                              // 案件ごとの消費税あり/なし
  const rate = taxNone ? 0 : settings.taxRate;
  const tax = roundBy(taxable * (rate / 100), settings.rounding);                    // 税率ごとに1回の端数処理
  return { segs, segTotal, totalDays, optLines, optTotal, nocAmt, nocTaxable, other, discount, taxable, nonTaxable, taxNone, rate, subtotal: taxable, tax, total: taxable + tax + nonTaxable };
}

// ---------- 車検チェック ----------
function shakenStatus(v) {
  const d = daysUntil(v.shaken);
  if (d === null) return { level: "unknown", label: "未登録", cls: "bg-gray-100 text-gray-500" };
  if (d < 0) return { level: "expired", label: `期限切れ(${wareki(v.shaken)})`, cls: "bg-red-600 text-white" };
  if (d <= 30) return { level: "d30", label: `残${d}日`, cls: "bg-red-100 text-red-700" };
  if (d <= 60) return { level: "d60", label: `残${d}日`, cls: "bg-orange-100 text-orange-700" };
  if (d <= 90) return { level: "d90", label: `残${d}日`, cls: "bg-amber-100 text-amber-700" };
  return { level: "ok", label: wareki(v.shaken), cls: "bg-emerald-50 text-emerald-700" };
}

// ---------- OCR(Claude API / Netlify Functions経由) ----------
// APIキーはブラウザに置かず、サーバー側(netlify/functions/anthropic.js)で付与します。
const API_ENDPOINT = "/.netlify/functions/anthropic";
const readB64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result.split(",")[1]);
  r.onerror = () => rej(new Error("ファイルの読み込みに失敗しました"));
  r.readAsDataURL(file);
});

// 画像前処理: 向き補正・解像度調整・コントラスト強調(FAXのかすれ・低解像度対策)
async function fileToBlock(file, docType) {
  if (file.type === "application/pdf") {
    return { type: "document", source: { type: "base64", media_type: "application/pdf", data: await readB64(file) } };
  }
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const long = Math.max(bmp.width, bmp.height);
    let scale = 1;
    if (long < 1400) scale = Math.min(2.5, 1400 / long);      // 小さい画像は拡大
    else if (long > 2000) scale = 2000 / long;                 // 大きすぎる画像は縮小(送信容量対策)
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // FAX・車検証はグレースケール+コントラスト強調、免許証はカラー維持
    ctx.filter = docType === "license" ? "contrast(1.1)" : "grayscale(1) contrast(1.35) brightness(1.05)";
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return { type: "image", source: { type: "base64", media_type: "image/jpeg", data: dataUrl.split(",")[1] } };
  } catch (e) {
    // 前処理に失敗した場合は原画像をそのまま送信
    const mt = file.type === "image/png" ? "image/png" : "image/jpeg";
    return { type: "image", source: { type: "base64", media_type: mt, data: await readB64(file) } };
  }
}

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, "");
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("JSONが見つかりません");
  return JSON.parse(m[0].replace(/,\s*\}/g, "}").replace(/,\s*\]/g, "]"));
}

const OCR_PROMPTS = {
  license: `あなたは日本の書類OCRの専門家です。添付は運転免許証の画像です（表面のみ、または表面と裏面の複数枚）。
画像の隅々まで注意深く読み取り、以下のJSONを出力してください。

注意点:
- 裏面の画像がある場合、裏面に住所変更の追記があれば、その最新住所を address に入れる（表面の旧住所は使わない）。
- 免許証番号は必ず12桁の数字。桁数が合わない場合は再度注意深く読み直す。
- 和暦は西暦に変換する（令和N年=2018+N年、平成N年=1988+N年、昭和N年=1925+N年）。
- 有効期限は「〇年〇月〇日まで有効」の日付。帯の色（金・青・緑）は無視。
- 記載が確認できない項目は null。推測で創作しない。
- 読み取りに自信が持てない項目のキー名を "unclear" 配列に入れる。

出力はこのJSONのみ（説明文・Markdown記法は不要）:
{"name":"氏名","kana":"フリガナ(推定可)","birth":"生年月日YYYY-MM-DD","address":"最新の住所","licenseNo":"免許証番号12桁","expiry":"有効期限YYYY-MM-DD","types":"免許の種類(例: 普通)","conditions":"条件等(例: 眼鏡等。無ければnull)","unclear":["自信がない項目キー"]}`,

  fax: `あなたは日本のレンタカー会社（ぐっどレンタカー／Good Innovation株式会社）の事務を支援するOCRの専門家です。添付は保険会社から届いた代車手配依頼のFAX・書類です（複数ページの場合あり）。FAXは低解像度・かすれ・傾き・手書きを含むことがあります。数字の 0/6/8、1/7、ハイフンの見落としに特に注意し、ヘッダー・欄外・手書きメモまで隅々まで読み取ってください。

注意点:
- 差出人（保険会社側）と宛先（ぐっどレンタカー／Good Innovation）を混同しない。company には保険会社側の名称を入れる。
- 「受付番号」「事故受付No」「事案番号」「案件番号」「リファレンスNo」等の表記ゆれはすべて accidentNo に該当する。
- 「入庫日」「貸出開始日」「代車開始日」は start、「返却予定日」「終了予定日」「修理完了予定日」は end に該当する。
- 和暦は西暦に変換する（令和N年=2018+N年、平成N年=1988+N年）。「R7.7.30」のような略記も令和として変換。
- dailyLimit は日額上限の数値のみ（円マーク・カンマ除去。「〜まで」「上限」等の語の近くにある金額）。
- 被保険者（契約者）と実際の利用者・運転者が別に書かれていればそれぞれ insured / userName に分ける。同一なら userName は null でよい。
- 記載が確認できない項目は null。推測で創作しない。
- 読み取りに自信が持てない項目のキー名を "unclear" 配列に入れる。

出力はこのJSONのみ（説明文・Markdown記法は不要）:
{"company":"保険会社名","branch":"支店・部署名","contact":"保険会社の担当者名","tel":"保険会社の電話番号","accidentNo":"事故受付番号","approvalNo":"承認番号","insured":"被保険者・契約者名","userName":"利用者・運転者名","userPhone":"利用者の電話番号","repairShop":"修理工場名","start":"貸渡開始日YYYY-MM-DD","end":"返却予定日YYYY-MM-DD","vehicleClass":"指定車種・クラス","dailyLimit":"日額上限の数値のみ","notes":"承認条件・支払条件・特記事項の要約(50字程度)","unclear":["自信がない項目キー"]}`,

  shaken: `あなたは日本の書類OCRの専門家です。添付は自動車検査証記録事項の画像またはPDFです。画像の隅々まで注意深く読み取り、以下のJSONを出力してください。

注意点:
- 登録番号は「自動車登録番号又は車両番号」欄。全角・スペースを除去して詰める（例: 佐賀400わ4136）。
- 満了日は「有効期間の満了する日」欄。右上の「記録年月日」や「登録年月日」と混同しない。
- 和暦は西暦に変換する（令和N年=2018+N年、平成N年=1988+N年）。
- 車台番号のハイフン・英数字を正確に。全角は半角に正規化する。
- 記載が確認できない項目は null。推測で創作しない。
- 読み取りに自信が持てない項目のキー名を "unclear" 配列に入れる。

出力はこのJSONのみ（説明文・Markdown記法は不要）:
{"regNo":"登録番号(スペース無し)","chassis":"車台番号","name":"車名(メーカー名)","expiry":"車検満了日YYYY-MM-DD","firstReg":"初度登録年月(和暦のまま)","category":"用途(乗用/貨物など)","unclear":["自信がない項目キー"]}`,
};

async function runOcr(files, docType) {
  const blocks = [];
  for (const f of files) blocks.push(await fileToBlock(f, docType));
  const call = async () => {
    let response;
    try {
      response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: [...blocks, { type: "text", text: OCR_PROMPTS[docType] }] }],
        }),
      });
    } catch (e) {
      const err = new Error("network"); err.kind = "network"; err.detail = `ネットワークエラー（${e.name}: ${e.message}）`; throw err;
    }
    if (response.status === 401 || response.status === 403) {
      const err = new Error("auth"); err.kind = "auth"; err.detail = `HTTP ${response.status}（APIキーが不正か失効しています）`; throw err;
    }
    if (response.status === 413) {
      const err = new Error("too_large"); err.kind = "too_large"; err.detail = "HTTP 413（送信データが大きすぎます）"; throw err;
    }
    if (!response.ok) {
      let body = "";
      try { body = (await response.text()).slice(0, 300); } catch (e2) {}
      const err = new Error("api " + response.status);
      err.kind = body.includes("ANTHROPIC_API_KEY") ? "config" : "api";
      err.detail = `HTTP ${response.status} ${body}`;
      throw err;
    }
    const data = await response.json();
    const text = (data.content || []).map((i) => i.text || "").join("\n");
    return extractJson(text);
  };
  try { return await call(); }
  catch (e) {
    if (e.kind === "auth" || e.kind === "network" || e.kind === "too_large" || e.kind === "config") throw e; // 環境・容量起因はリトライしない
    return await call(); // 読取失敗・一時エラーは1回だけ自動リトライ
  }
}

/* ============================================================ */

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [tab, setTab] = useState("dash");
  const [vehicles, setVehicles] = useState([]);
  const [cases, setCases] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [editCase, setEditCase] = useState(null);   // 編集中案件
  const [printDoc, setPrintDoc] = useState(null);   // {type:'dispatch'|'invoice'|'price', caseId}
  const [toast, setToast] = useState(null);

  // ----- 保存・読込(このブラウザのlocalStorageに保存) -----
  useEffect(() => {
    try {
      const raw = localStorage.getItem("gr:data");
      if (raw) {
        const d = JSON.parse(raw);
        setVehicles(d.vehicles || INITIAL_VEHICLES);
        setCases(d.cases || []);
        setSettings({ ...DEFAULT_SETTINGS, ...(d.settings || {}) });
      } else {
        setVehicles(INITIAL_VEHICLES);
      }
    } catch (e) {
      setStorageOk(false);
      setVehicles(INITIAL_VEHICLES);
    }
    setLoaded(true);
  }, []);

  const persist = async (v, cs, st) => {
    try {
      localStorage.setItem("gr:data", JSON.stringify({ vehicles: v, cases: cs, settings: st }));
      return true;
    } catch (e) { console.error("保存エラー", e); setStorageOk(false); return false; }
  };
  const save = (v = vehicles, cs = cases, st = settings) => {
    setVehicles(v); setCases(cs); setSettings(st);
    return persist(v, cs, st);
  };
  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500">
      <Loader2 className="animate-spin mr-2" size={20} />読み込み中…
    </div>
  );

  // ----- 印刷ビュー(印刷時はアプリ本体を描画しない) -----
  if (printDoc) {
    const c = cases.find((x) => x.id === printDoc.caseId);
    return <PrintView doc={printDoc} c={c} cases={cases} vehicles={vehicles} settings={settings}
      onClose={() => setPrintDoc(null)}
      onAssignInvoiceNo={() => {
        // F-14: 適格請求書発行事業者番号が未設定の場合は採番不可
        if (!settings.invoiceRegNo) {
          showToast("適格請求書発行事業者番号が未設定のため採番できません。設定タブで登録してください。", "err");
          return;
        }
        const no = `INV-${settings.invoiceYear}-${String(settings.invoiceSeq).padStart(4, "0")}`;
        const calc = calcCase(c, vehicles, settings);
        // F-13: 発行時点の内容をスナップショット保存(以後の案件・設定変更は確定請求書に影響しない)
        const snapshot = {
          no, date: todayStr(),
          calc: JSON.parse(JSON.stringify(calc)),
          segments: JSON.parse(JSON.stringify(c.segments || [])),
          customer: { name: c.customer?.name || "" },
          insurance: JSON.parse(JSON.stringify(c.insurance || {})),
          type: c.type,
          noc: c.noc,
          settings: {
            company: settings.company, brand: settings.brand, address: settings.address,
            tel: settings.tel, fax: settings.fax, permitNo: settings.permitNo,
            invoiceRegNo: settings.invoiceRegNo, bank: settings.bank, bankHolder: settings.bankHolder,
            taxRate: settings.taxRate,
          },
        };
        const cs = cases.map((x) => x.id === c.id
          ? { ...x, invoiceNo: no, invoiceDate: todayStr(), invoiceSnapshot: snapshot, history: [...(x.history || []), { at: new Date().toISOString(), action: `請求書発行 ${no}` }] }
          : x);
        const st = { ...settings, invoiceSeq: settings.invoiceSeq + 1 };
        save(vehicles, cs, st).then((ok) =>
          showToast(ok ? `請求書番号 ${no} を採番し、内容を確定しました` : "採番の保存に失敗しました", ok ? "ok" : "err"));
      }} />;
  }

  // ----- 案件編集ビュー -----
  if (editCase) {
    return <CaseForm
      draft={editCase} vehicles={vehicles} cases={cases} settings={settings}
      onCancel={() => setEditCase(null)}
      onSave={(c) => {
        const exists = cases.some((x) => x.id === c.id);
        const cs = exists ? cases.map((x) => (x.id === c.id ? c : x)) : [...cases, c];
        setEditCase(null);
        save(vehicles, cs, settings).then((ok) =>
          showToast(ok ? "案件を保存しました" : "保存に失敗しました。この環境ではデータが保持されません", ok ? "ok" : "err"));
      }}
      onDelete={(id) => {
        // F-08: 法定記録保護のため物理削除せず論理削除とする
        const cs = cases.map((x) => x.id === id
          ? { ...x, deleted: true, history: [...(x.history || []), { at: new Date().toISOString(), action: "論理削除" }] }
          : x);
        setEditCase(null);
        save(vehicles, cs, settings).then((ok) =>
          showToast(ok ? "案件を削除しました（記録は論理削除として保持されます）" : "削除の保存に失敗しました", ok ? "ok" : "err"));
      }}
    />;
  }

  const newCase = () => {
    const caseNo = `C-${settings.invoiceYear}-${String(settings.caseSeq).padStart(3, "0")}`;
    setSettings({ ...settings, caseSeq: settings.caseSeq + 1 });
    setEditCase({
      id: "K" + Date.now(), caseNo, type: "事故代車", status: "下書き",
      customer: { name: "", kana: "", phone: "", birth: "", address: "", licenseNo: "", licenseExpiry: "", licenseType: "", licenseCond: "", confirmed: false, confirmedBy: "", confirmedAt: "" },
      insurance: { company: "", branch: "", accidentNo: "", approvalNo: "", insured: "", repairShop: "" },
      segments: [], options: {}, noc: "none", other: "", discount: "", memo: "",
      meterOut: "", meterIn: "", fuelOut: "", fuelIn: "",
      history: [], deleted: false,
      createdAt: todayStr(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800" style={{ fontFamily: "'Hiragino Sans','Noto Sans JP','Yu Gothic',sans-serif" }}>
      <style>{`.inp{width:100%;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.5rem 0.7rem;font-size:0.875rem;background:#fff}
.inp:disabled{background:#f1f5f9;color:#94a3b8}.inp:focus{outline:2px solid #10b981;outline-offset:-1px}`}</style>
      {/* ヘッダー */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-emerald-500 rounded-lg p-1.5"><Car size={20} /></div>
          <div>
            <div className="font-bold leading-tight">ぐっどレンタカー 業務管理</div>
            <div className="text-xs text-slate-400">Good Innovation株式会社｜プロトタイプ v1.0</div>
          </div>
          <button onClick={newCase} className="ml-auto flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-3 py-2 rounded-lg">
            <Plus size={16} />新規案件
          </button>
        </div>
        <nav className="max-w-6xl mx-auto px-2 flex text-sm overflow-x-auto">
          {[
            ["dash", "ダッシュボード", LayoutDashboard],
            ["cases", "案件", CalendarDays],
            ["vehicles", "車両", Car],
            ["docs", "帳票", FileText],
            ["settings", "設定", Settings],
          ].map(([k, label, Icon]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 whitespace-nowrap ${tab === k ? "border-emerald-400 text-white font-semibold" : "border-transparent text-slate-400 hover:text-white"}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 pb-24">
        {!storageOk && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm flex gap-2">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div><b>ブラウザの保存領域（localStorage）が利用できません。</b>プライベートブラウズ中などは入力データが保持されません。通常モードのブラウザでご利用ください。</div>
          </div>
        )}
        {tab === "dash" && <Dashboard vehicles={vehicles} cases={cases} settings={settings} onOpenCase={setEditCase} />}
        {tab === "cases" && <CaseList cases={cases} vehicles={vehicles} settings={settings} onOpen={setEditCase} onNew={newCase} onPrint={setPrintDoc} />}
        {tab === "vehicles" && <VehicleTab vehicles={vehicles} cases={cases} onChange={(v) => save(v, cases, settings)} showToast={showToast} />}
        {tab === "docs" && <DocsTab cases={cases} vehicles={vehicles} settings={settings} onPrint={setPrintDoc} />}
        {tab === "settings" && <SettingsTab settings={settings} onChange={(st) => save(vehicles, cases, st)} showToast={showToast} />}
      </main>

      {toast && (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm text-white ${toast.type === "err" ? "bg-red-600" : "bg-slate-800"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ---------------- ダッシュボード ---------------- */
function Dashboard({ vehicles, cases, settings, onOpenCase }) {
  const today = todayStr();
  const live = cases.filter((c) => !c.deleted);
  const active = live.filter((c) => !["キャンセル", "完了"].includes(c.status));
  const todayOut = [], todayIn = [], overdue = [];
  active.forEach((c) => (c.segments || []).forEach((s) => {
    if (s.start === today) todayOut.push({ c, s });
    if (s.end === today) todayIn.push({ c, s });
    if (s.end && s.end < today && ["貸渡中"].includes(c.status)) overdue.push({ c, s });
  }));
  const counts = {
    貸渡中: live.filter((c) => c.status === "貸渡中").length,
    予約: live.filter((c) => ["予約", "配車準備"].includes(c.status)).length,
    請求待ち: live.filter((c) => ["返却処理", "請求待ち"].includes(c.status)).length,
    入金待ち: live.filter((c) => c.status === "請求済").length,
  };
  const shakenAlerts = vehicles.map((v) => ({ v, st: shakenStatus(v) })).filter((x) => x.st.level !== "ok");
  const setupWarn = !settings.permitNo || !settings.invoiceRegNo;

  return (
    <div className="space-y-5">
      {setupWarn && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-xl px-4 py-3 text-sm flex gap-2">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div><b>設定未完了：</b>貸渡許可番号・適格請求書発行事業者番号が未入力です。請求書の本番運用前に「設定」タブで登録してください。</div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500">{k}</div>
            <div className="text-3xl font-bold mt-1">{v}<span className="text-sm font-normal text-slate-400 ml-1">件</span></div>
          </div>
        ))}
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
          <div className="font-bold text-red-700 flex items-center gap-1.5 mb-2"><AlertTriangle size={16} />返却遅延 {overdue.length}件</div>
          {overdue.map(({ c, s }, i) => {
            const v = vehicles.find((x) => x.id === s.vehicleId);
            return (
              <button key={i} onClick={() => onOpenCase(c)} className="block w-full text-left text-sm text-red-800 hover:underline">
                {c.caseNo} {c.customer?.name || "―"}様｜{v?.regNo}｜返却予定 {jpDate(s.end)}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Panel title={`本日の配車・貸渡（${todayOut.length}件）`}>
          {todayOut.length === 0 ? <Empty text="本日の配車予定はありません" /> :
            todayOut.map(({ c, s }, i) => {
              const v = vehicles.find((x) => x.id === s.vehicleId);
              return <Row key={i} onClick={() => onOpenCase(c)} main={`${c.customer?.name || "―"} 様`} sub={`${c.caseNo}｜${v?.regNo || "車両未定"}｜${s.place || "場所未定"}`} badge={c.status} />;
            })}
        </Panel>
        <Panel title={`本日の返却・引取（${todayIn.length}件）`}>
          {todayIn.length === 0 ? <Empty text="本日の返却予定はありません" /> :
            todayIn.map(({ c, s }, i) => {
              const v = vehicles.find((x) => x.id === s.vehicleId);
              return <Row key={i} onClick={() => onOpenCase(c)} main={`${c.customer?.name || "―"} 様`} sub={`${c.caseNo}｜${v?.regNo || ""}｜${s.returnMethod || "返却方法未定"}`} badge={c.status} />;
            })}
        </Panel>
      </div>

      <Panel title="車検期限アラート（90日前から段階表示）">
        {shakenAlerts.length === 0 ? <Empty text="90日以内に満了する車両はありません" /> : (
          <div className="space-y-1.5">
            {shakenAlerts.map(({ v, st }) => (
              <div key={v.id} className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${st.cls}`}>{st.level === "expired" ? "車検切れ" : st.label}</span>
                <span className="font-medium">{v.regNo}</span>
                <span className="text-slate-500">{v.name}</span>
                <span className="ml-auto text-slate-500">{wareki(v.shaken)} 満了</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
const Panel = ({ title, children }) => (
  <section className="bg-white rounded-xl border border-slate-200 p-4">
    <h2 className="font-bold text-sm mb-3 text-slate-700">{title}</h2>{children}
  </section>
);
const Empty = ({ text }) => <div className="text-sm text-slate-400 py-3 text-center">{text}</div>;
const Row = ({ main, sub, badge, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-2 py-2 border-b border-slate-100 last:border-0 text-left hover:bg-slate-50 rounded px-1">
    <div className="min-w-0">
      <div className="text-sm font-medium truncate">{main}</div>
      <div className="text-xs text-slate-500 truncate">{sub}</div>
    </div>
    {badge && <span className={`ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[badge]}`}>{badge}</span>}
  </button>
);

/* ---------------- 案件一覧 ---------------- */
function CaseList({ cases, vehicles, settings, onOpen, onNew, onPrint }) {
  const [q, setQ] = useState("");
  const [stFilter, setStFilter] = useState("すべて");
  const filtered = cases.filter((c) => {
    if (c.deleted) return false;
    if (stFilter !== "すべて" && c.status !== stFilter) return false;
    if (!q) return true;
    const t = [c.caseNo, c.customer?.name, c.customer?.phone, c.insurance?.company, c.insurance?.accidentNo, c.invoiceNo,
      ...(c.segments || []).map((s) => vehicles.find((v) => v.id === s.vehicleId)?.regNo)].join(" ");
    return t.includes(q);
  }).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="案件番号・氏名・電話・事故番号・登録番号で検索"
          className="flex-1 min-w-48 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white" />
        <select value={stFilter} onChange={(e) => setStFilter(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-2 text-sm bg-white">
          <option>すべて</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-400 text-sm">
          案件がありません。「新規案件」から予約または事故代車案件を登録してください。
          <div className="mt-3"><button onClick={onNew} className="text-emerald-600 font-semibold hover:underline">＋ 新規案件を登録</button></div>
        </div>
      )}
      {filtered.map((c) => {
        const calc = calcCase(c, vehicles, settings);
        const seg0 = (c.segments || [])[0];
        const v0 = seg0 && vehicles.find((v) => v.id === seg0.vehicleId);
        return (
          <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 transition-colors">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[c.status]}`}>{c.status}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{c.type}</span>
              <span className="font-mono text-xs text-slate-500">{c.caseNo}</span>
              {c.invoiceNo && <span className="font-mono text-xs text-violet-600">{c.invoiceNo}</span>}
              <div className="ml-auto flex gap-1.5">
                <button onClick={() => onPrint({ type: "dispatch", caseId: c.id })} title="配車表" className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><FileText size={16} /></button>
                <button onClick={() => onOpen(c)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil size={16} /></button>
              </div>
            </div>
            <button onClick={() => onOpen(c)} className="mt-2 w-full text-left">
              <div className="font-bold">{c.customer?.name || "(氏名未入力)"} 様
                {c.type === "事故代車" && c.insurance?.company && <span className="ml-2 text-xs font-normal text-slate-500">{c.insurance.company}</span>}
              </div>
              <div className="text-sm text-slate-500 mt-0.5">
                {seg0 ? `${jpDate(seg0.start)} 〜 ${jpDate(seg0.end)}（${calc.totalDays}日）` : "配車区間未登録"}
                {v0 && `｜${v0.regNo} ${v0.name}`}
                {(c.segments || []).length > 1 && `｜他${c.segments.length - 1}区間`}
              </div>
              <div className="text-sm mt-1"><span className="text-slate-400">税込</span> <b>{yen(calc.total)}</b></div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- 案件フォーム ---------------- */
function CaseForm({ draft, vehicles, cases, settings, onSave, onCancel, onDelete }) {
  const [c, setC] = useState(draft);
  const [ocr, setOcr] = useState(null);
  const [dialog, setDialog] = useState(null); // {title, msgs, mode: 'block'|'confirm'|'delete'}
  const calc = calcCase(c, vehicles, settings);
  const set = (patch) => setC({ ...c, ...patch });
  const setCust = (patch) => setC({ ...c, customer: { ...c.customer, ...patch } });
  const setIns = (patch) => setC({ ...c, insurance: { ...c.insurance, ...patch } });

  const addSegment = () => set({ segments: [...(c.segments || []), { id: "S" + Date.now(), vehicleId: "", start: todayStr(), end: todayStr(), startTime: "10:00", endTime: "10:00", slot: "days", unitPrice: "", overHours: "", place: "", returnMethod: "来店", staff: "" }] });
  const updSeg = (i, patch) => set({ segments: c.segments.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const delSeg = (i) => set({ segments: c.segments.filter((_, j) => j !== i) });

  // 保存前検証: 必須は氏名・住所・保険会社のみ。その他は警告(確認のうえ保存可)
  const validate = () => {
    const blockers = [];
    const warns = [];
    // ---- 必須項目(保存不可) ----
    if (!c.customer.name?.trim()) blockers.push("【必須】借受人の氏名を入力してください。");
    if (!c.customer.address?.trim()) blockers.push("【必須】借受人の住所を入力してください。");
    if (c.type === "事故代車" && !c.insurance.company?.trim()) blockers.push("【必須】保険会社名を入力してください。");
    // ---- 以下は警告(承認して保存できます) ----
    (c.segments || []).forEach((s2, i) => {
      const v = vehicles.find((x) => x.id === s2.vehicleId);
      if (!s2.vehicleId || !s2.start || !s2.end) {
        warns.push(`区間${i + 1}：車両・配車日・返却日に未入力があります（料金計算・帳票に反映されません）。`);
        return;
      }
      const a = dtOf(s2.start, s2.startTime || "00:00"), b = dtOf(s2.end, s2.endTime || "00:00");
      if (!(b > a)) {
        warns.push(`区間${i + 1}（${v?.regNo || ""}）：返却日時が配車日時以前になっています（日数・料金が正しく計算されません）。`);
        return;
      }
      if (v.state !== "稼働") warns.push(`${v.regNo} は「${v.state}」の状態です。`);
      if (!v.shaken) warns.push(`${v.regNo} の車検満了日が未登録です。`);
      else if (v.shaken < s2.end) warns.push(`${v.regNo} の車検満了日（${wareki(v.shaken)}）が返却予定日より前です。車検切れ期間の貸渡は法令違反となるため十分ご注意ください。`);
      (c.segments || []).forEach((s3, j) => {
        if (j <= i || s3.vehicleId !== s2.vehicleId || !s3.start || !s3.end) return;
        if (overlap(s2.start, s2.end, s3.start, s3.end)) warns.push(`区間${i + 1}と区間${j + 1}で同一車両（${v.regNo}）の期間が重複しています。`);
      });
      for (const other of cases) {
        if (other.id === c.id || other.deleted || ["キャンセル", "完了"].includes(other.status)) continue;
        for (const os of other.segments || []) {
          if (os.vehicleId === s2.vehicleId && os.start && os.end && overlap(s2.start, s2.end, os.start, os.end)) {
            warns.push(`【二重予約】${v.regNo} は案件 ${other.caseNo}（${jpDate(os.start)}〜${jpDate(os.end)}）と期間が重複しています。`);
          }
        }
      }
    });
    return { blockers, warns };
  };

  const doSave = () => {
    onSave({ ...c, history: [...(c.history || []), { at: new Date().toISOString(), action: `保存（状態: ${c.status}）` }] });
  };

  const trySave = () => {
    const { blockers, warns } = validate();
    if (blockers.length) { setDialog({ title: "保存できません（必須項目）", msgs: blockers, mode: "block" }); return; }
    if (warns.length) { setDialog({ title: "確認事項があります（承認して保存できます）", msgs: warns, mode: "confirm" }); return; }
    doSave();
  };

  // 状態遷移(許可された遷移のみ)
  const ALLOWED_NEXT = {
    "下書き": ["予約", "キャンセル"],
    "予約": ["配車準備", "貸渡中", "キャンセル"],
    "配車準備": ["貸渡中", "予約", "キャンセル"],
    "貸渡中": ["返却処理"],
    "返却処理": ["請求待ち", "貸渡中"],
    "請求待ち": ["請求済", "返却処理"],
    "請求済": ["完了", "請求待ち"],
    "完了": [],
    "キャンセル": [],
  };

  const applyStatus = (st) => {
    setC({ ...c, status: st, history: [...(c.history || []), { at: new Date().toISOString(), action: `状態変更: ${c.status} → ${st}` }] });
  };

  const changeStatus = (st) => {
    if (st === c.status) return;
    if (!ALLOWED_NEXT[c.status]?.includes(st)) {
      setDialog({ title: "状態遷移エラー", msgs: [`「${c.status}」から「${st}」へは直接変更できません。許可された遷移: ${(ALLOWED_NEXT[c.status] || []).join("・") || "なし"}`], mode: "block" });
      return;
    }
    const { blockers, warns } = validate();
    if (blockers.length) { setDialog({ title: "必須項目が未入力です", msgs: blockers, mode: "block" }); return; }
    if (warns.length) { setDialog({ title: "確認事項があります", msgs: warns, mode: "confirm-status", payload: st }); return; }
    applyStatus(st);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-32" style={{ fontFamily: "'Hiragino Sans','Noto Sans JP',sans-serif" }}>
      <header className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onCancel} className="p-1 hover:bg-slate-700 rounded"><ChevronLeft size={20} /></button>
          <div className="font-bold">{c.caseNo}｜案件編集</div>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[c.status]}`}>{c.status}</span>
          <button onClick={() => setDialog({ title: "案件の削除", msgs: ["この案件を削除しますか？（プロトタイプのため物理削除します）"], mode: "delete" })} className="ml-auto p-1.5 text-slate-400 hover:text-red-400"><Trash2 size={17} /></button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* 基本情報 */}
        <Card title="案件情報">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="区分">
              <div className="flex gap-1">
                {["事故代車", "一般予約"].map((t) => (
                  <button key={t} onClick={() => set({ type: t })}
                    className={`flex-1 py-2 rounded-lg text-sm border ${c.type === t ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-300"}`}>{t}</button>
                ))}
              </div>
            </Field>
            <Field label="状態（許可された遷移のみ選択可）">
              <select value={c.status} onChange={(e) => changeStatus(e.target.value)} className="inp">
                {STATUSES.map((s) => (
                  <option key={s} disabled={s !== c.status && !ALLOWED_NEXT[c.status]?.includes(s)}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="登録日"><input type="date" value={c.createdAt || ""} onChange={(e) => set({ createdAt: e.target.value })} className="inp" /></Field>
          </div>
        </Card>

        {/* 本人確認 */}
        <Card title="借受人・本人確認" action={
          <button onClick={() => setOcr("license")} className="flex items-center gap-1 text-sm bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg">
            <Camera size={15} />免許証を読取（AI）
          </button>}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="氏名 *"><input value={c.customer.name} onChange={(e) => setCust({ name: e.target.value })} className="inp" placeholder="例）佐賀 太郎" /></Field>
            <Field label="フリガナ"><input value={c.customer.kana} onChange={(e) => setCust({ kana: e.target.value })} className="inp" /></Field>
            <Field label="電話番号"><input value={c.customer.phone} onChange={(e) => setCust({ phone: e.target.value })} className="inp" /></Field>
            <Field label="生年月日"><input type="date" value={c.customer.birth} onChange={(e) => setCust({ birth: e.target.value })} className="inp" /></Field>
            <Field label="住所 *" full><input value={c.customer.address} onChange={(e) => setCust({ address: e.target.value })} className="inp" /></Field>
            <Field label="免許証番号（12桁）"><input value={c.customer.licenseNo} onChange={(e) => setCust({ licenseNo: e.target.value })} className="inp font-mono" maxLength={12} /></Field>
            <Field label="免許有効期限"><input type="date" value={c.customer.licenseExpiry} onChange={(e) => setCust({ licenseExpiry: e.target.value })} className="inp" /></Field>
            <Field label="免許の種類"><input value={c.customer.licenseType} onChange={(e) => setCust({ licenseType: e.target.value })} className="inp" placeholder="普通" /></Field>
            <Field label="条件等"><input value={c.customer.licenseCond} onChange={(e) => setCust({ licenseCond: e.target.value })} className="inp" placeholder="眼鏡等" /></Field>
          </div>
          {c.customer.licenseExpiry && c.customer.licenseExpiry < todayStr() && (
            <div className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertTriangle size={15} />免許証の有効期限が切れています。貸渡できません。</div>
          )}
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <Field label="本人確認 確認者（担当者名・任意）">
              <input value={c.customer.confirmedBy || ""} onChange={(e) => setCust({ confirmedBy: e.target.value })} className="inp" placeholder="例）久保" />
            </Field>
            <Field label="確認日時（自動記録）">
              <input value={c.customer.confirmedAt ? new Date(c.customer.confirmedAt).toLocaleString("ja-JP") : "未確認"} readOnly className="inp" disabled />
            </Field>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 cursor-pointer">
            <input type="checkbox" checked={c.customer.confirmed} onChange={(e) => setCust({ confirmed: e.target.checked, confirmedAt: e.target.checked ? new Date().toISOString() : "" })} className="w-4 h-4 accent-emerald-600" />
            原本（免許証）と照合し、担当者が内容を確認しました（任意・記録用）
          </label>
        </Card>

        {/* 保険会社(事故代車のみ) */}
        {c.type === "事故代車" && (
          <Card title="事故・保険情報" action={
            <button onClick={() => setOcr("fax")} className="flex items-center gap-1 text-sm bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg">
              <Camera size={15} />FAX・書類を読取（AI）
            </button>}>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="保険会社名 *"><input value={c.insurance.company} onChange={(e) => setIns({ company: e.target.value })} className="inp" placeholder="例）○○損害保険株式会社" /></Field>
              <Field label="支店・部署"><input value={c.insurance.branch} onChange={(e) => setIns({ branch: e.target.value })} className="inp" /></Field>
              <Field label="保険会社 担当者"><input value={c.insurance.contact || ""} onChange={(e) => setIns({ contact: e.target.value })} className="inp" /></Field>
              <Field label="保険会社 TEL"><input value={c.insurance.tel || ""} onChange={(e) => setIns({ tel: e.target.value })} className="inp" /></Field>
              <Field label="事故受付番号"><input value={c.insurance.accidentNo} onChange={(e) => setIns({ accidentNo: e.target.value })} className="inp font-mono" /></Field>
              <Field label="承認番号"><input value={c.insurance.approvalNo} onChange={(e) => setIns({ approvalNo: e.target.value })} className="inp font-mono" /></Field>
              <Field label="被保険者"><input value={c.insurance.insured} onChange={(e) => setIns({ insured: e.target.value })} className="inp" /></Field>
              <Field label="修理工場"><input value={c.insurance.repairShop} onChange={(e) => setIns({ repairShop: e.target.value })} className="inp" /></Field>
            </div>
          </Card>
        )}

        {/* 配車区間 */}
        <Card title="配車区間（車両交換時は区間を追加）" action={
          <button onClick={addSegment} className="flex items-center gap-1 text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg"><Plus size={15} />区間追加</button>}>
          {(c.segments || []).length === 0 && <Empty text="配車区間がありません。「区間追加」から車両と期間を登録してください。" />}
          <div className="space-y-4">
            {(c.segments || []).map((s, i) => {
              const sc = calcSegment(s, vehicles);
              const v = sc.vehicle;
              const sst = v && shakenStatus(v);
              return (
                <div key={s.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold bg-slate-800 text-white rounded px-2 py-0.5">区間 {i + 1}</span>
                    {v && sst && sst.level !== "ok" && (
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${sst.cls}`}>車検 {sst.level === "expired" ? "期限切れ" : sst.label}</span>
                    )}
                    <button onClick={() => delSeg(i)} className="ml-auto text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="車両">
                      <select value={s.vehicleId} onChange={(e) => updSeg(i, { vehicleId: e.target.value })} className="inp">
                        <option value="">選択してください</option>
                        {vehicles.filter((v) => v.state !== "売却・廃車").map((v) => (
                          <option key={v.id} value={v.id}>{v.regNo}｜{v.name}（{v.cls}）{v.state !== "稼働" ? `【${v.state}・割当不可】` : ""}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="配車日"><input type="date" value={s.start} onChange={(e) => updSeg(i, { start: e.target.value })} className="inp" /></Field>
                      <Field label="配車時刻"><input type="time" value={s.startTime || "10:00"} onChange={(e) => updSeg(i, { startTime: e.target.value })} className="inp" /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="返却日"><input type="date" value={s.end} onChange={(e) => updSeg(i, { end: e.target.value })} className="inp" /></Field>
                      <Field label="返却時刻"><input type="time" value={s.endTime || "10:00"} onChange={(e) => updSeg(i, { endTime: e.target.value })} className="inp" /></Field>
                    </div>
                    <Field label="料金区分">
                      <select value={s.slot === "days" ? "days" : "time"} onChange={(e) => updSeg(i, { slot: e.target.value })} className="inp">
                        <option value="days">日貸し（両端含み日数 × 日額・保険精算向け）</option>
                        <option value="time">時間計算（料金表準拠・24時間超は追加日＋超過を自動加算）</option>
                      </select>
                    </Field>
                    {s.slot === "days" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Field label={`日額（税別）${v ? `標準 ${yen(RATES[v.cls].h24)}` : ""}`}>
                          <input type="number" value={s.unitPrice} placeholder={v ? String(RATES[v.cls].h24) : ""} onChange={(e) => updSeg(i, { unitPrice: e.target.value })} className="inp" />
                        </Field>
                        <Field label={`超過時間 ${v ? `(${yen(RATES[v.cls].over)}/h)` : ""}`}>
                          <input type="number" value={s.overHours} onChange={(e) => updSeg(i, { overHours: e.target.value })} className="inp" placeholder="0" />
                        </Field>
                      </div>
                    ) : (
                      <Field label="利用時間（日時から自動計算）">
                        <input value={sc.hours > 0 ? `${Math.round(sc.hours * 10) / 10} 時間` : "―"} readOnly disabled className="inp" />
                      </Field>
                    )}
                    <Field label="配車先・場所"><input value={s.place || ""} onChange={(e) => updSeg(i, { place: e.target.value })} className="inp" placeholder="例）○○自動車整備工場" /></Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="返却方法">
                        <select value={s.returnMethod || "来店"} onChange={(e) => updSeg(i, { returnMethod: e.target.value })} className="inp">
                          <option>来店</option><option>当社引取</option>
                        </select>
                      </Field>
                      <Field label="担当者"><input value={s.staff || ""} onChange={(e) => updSeg(i, { staff: e.target.value })} className="inp" /></Field>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-right text-slate-600">
                    {sc.label}{sc.over > 0 && ` ＋ 超過 ${yen(sc.over)}`} ＝ <b>{yen(sc.total)}</b><span className="text-xs text-slate-400">（税別）</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* オプション・料金 */}
        <Card title="オプション・追加費用">
          <div className="grid sm:grid-cols-2 gap-2">
            {OPTIONS.map((o) => {
              const st = c.options?.[o.key] || {};
              return (
                <div key={o.key} className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${st.on ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                  <input type="checkbox" checked={!!st.on} onChange={(e) => set({ options: { ...c.options, [o.key]: { ...st, on: e.target.checked, days: st.days ?? calc.totalDays } } })} className="w-4 h-4 accent-emerald-600" />
                  <span className="text-sm flex-1">{o.label}<span className="text-xs text-slate-400 ml-1">{yen(o.price)}/{o.unit}</span></span>
                  {st.on && <><input type="number" min="0" value={st.days ?? calc.totalDays} onChange={(e) => set({ options: { ...c.options, [o.key]: { ...st, days: e.target.value } } })} className="w-14 border border-slate-300 rounded px-1.5 py-1 text-sm text-right" /><span className="text-xs text-slate-500">日</span></>}
                </div>
              );
            })}
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <Field label="NOC（事故時）">
              <select value={c.noc} onChange={(e) => set({ noc: e.target.value })} className="inp">
                {Object.entries(NOC).map(([k, v]) => <option key={k} value={k}>{v.label}{v.price ? `（${yen(v.price)}）` : ""}</option>)}
              </select>
            </Field>
            <Field label="その他費用（税別）"><input type="number" value={c.other} onChange={(e) => set({ other: e.target.value })} className="inp" placeholder="0" /></Field>
            <Field label="値引き（税別）"><input type="number" value={c.discount} onChange={(e) => set({ discount: e.target.value })} className="inp" placeholder="0" /></Field>
            <Field label="消費税の扱い">
              <select value={c.taxMode || "standard"} onChange={(e) => set({ taxMode: e.target.value })} className="inp">
                <option value="standard">課税（{settings.taxRate}%を加算）</option>
                <option value="none">非課税（消費税を計上しない）</option>
              </select>
            </Field>
          </div>
          <div className="text-xs text-slate-400 mt-2">※ 値引きは税別金額から差し引かれます。通常のレンタカー料金は課税取引のため、「非課税」は保険会社との税抜精算など特別な場合のみお使いください。</div>
        </Card>

        {/* 貸渡・返却実績 */}
        <Card title="貸渡・返却実績">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="貸渡時 走行距離(km)"><input type="number" value={c.meterOut} onChange={(e) => set({ meterOut: e.target.value })} className="inp" /></Field>
            <Field label="返却時 走行距離(km)"><input type="number" value={c.meterIn} onChange={(e) => set({ meterIn: e.target.value })} className="inp" /></Field>
            <Field label="貸渡時 燃料"><input value={c.fuelOut} onChange={(e) => set({ fuelOut: e.target.value })} className="inp" placeholder="満タン" /></Field>
            <Field label="返却時 燃料"><input value={c.fuelIn} onChange={(e) => set({ fuelIn: e.target.value })} className="inp" placeholder="満タン" /></Field>
          </div>
          {c.meterOut && c.meterIn && Number(c.meterIn) >= Number(c.meterOut) && (
            <div className="text-sm text-slate-500 mt-2">走行距離：<b>{num(c.meterIn - c.meterOut)} km</b>（年次報告の延走行キロに集計）</div>
          )}
          <Field label="特記事項・メモ" full>
            <textarea value={c.memo} onChange={(e) => set({ memo: e.target.value })} rows={2} className="inp" placeholder="保険会社承認条件、車両交換理由、損傷状況など" />
          </Field>
        </Card>

        {/* 料金サマリ */}
        <Card title="料金計算（自動）">
          <table className="w-full text-sm">
            <tbody>
              {calc.segs.map((s, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1.5">区間{i + 1} {s.vehicle?.regNo || ""}（{s.vehicle?.cls || "―"}）{s.label}{s.over > 0 ? ` ＋超過` : ""}</td>
                  <td className="py-1.5 text-right">{yen(s.total)}</td>
                </tr>
              ))}
              {calc.optLines.map((o, i) => (
                <tr key={"o" + i} className="border-b border-slate-100"><td className="py-1.5">{o.label} {o.days}日 × {yen(o.price)}</td><td className="py-1.5 text-right">{yen(o.amount)}</td></tr>
              ))}
              {calc.nocAmt > 0 && <tr className="border-b border-slate-100"><td className="py-1.5">{NOC[c.noc].label}<span className="text-xs text-slate-400 ml-1">（{calc.nocTaxable ? "課税10%" : "消費税対象外"}）</span></td><td className="py-1.5 text-right">{yen(calc.nocAmt)}</td></tr>}
              {calc.other > 0 && <tr className="border-b border-slate-100"><td className="py-1.5">その他費用</td><td className="py-1.5 text-right">{yen(calc.other)}</td></tr>}
              {calc.discount > 0 && <tr className="border-b border-slate-100 text-red-600"><td className="py-1.5">値引き</td><td className="py-1.5 text-right">−{yen(calc.discount).slice(1)}</td></tr>}
              <tr><td className="py-1.5 font-medium">10%対象 小計（税別）</td><td className="py-1.5 text-right font-medium">{yen(calc.taxable)}</td></tr>
              <tr><td className="py-1.5">{calc.taxNone ? "消費税（非課税・計上なし）" : `消費税（${settings.taxRate}%・${settings.rounding === "round" ? "四捨五入" : settings.rounding === "floor" ? "切捨て" : "切上げ"}）`}</td><td className="py-1.5 text-right">{yen(calc.tax)}</td></tr>
              {calc.nonTaxable > 0 && <tr><td className="py-1.5">消費税対象外（NOC等）</td><td className="py-1.5 text-right">{yen(calc.nonTaxable)}</td></tr>}
              <tr className="text-base"><td className="py-2 font-bold">合計</td><td className="py-2 text-right font-bold text-emerald-700">{yen(calc.total)}</td></tr>
            </tbody>
          </table>
        </Card>
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2">
          <button onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm">閉じる</button>
          <button onClick={trySave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5">
            <Check size={17} />保存（必須：氏名・住所・保険会社）
          </button>
        </div>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5">
            <div className={`font-bold flex items-center gap-2 ${dialog.mode === "block" ? "text-red-600" : "text-amber-600"}`}>
              <AlertTriangle size={18} />{dialog.title}
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {dialog.msgs.map((m, i) => <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">{m}</div>)}
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => setDialog(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm">
                {dialog.mode === "block" ? "閉じる" : "キャンセル"}
              </button>
              {dialog.mode === "confirm" && (
                <button onClick={() => { setDialog(null); doSave(); }} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold">承認して保存</button>
              )}
              {dialog.mode === "confirm-status" && (
                <button onClick={() => { const st = dialog.payload; setDialog(null); applyStatus(st); }} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold">確認のうえ変更する</button>
              )}
              {dialog.mode === "delete" && (
                <button onClick={() => { setDialog(null); onDelete(c.id); }} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold">削除する</button>
              )}
            </div>
          </div>
        </div>
      )}

      {ocr === "fax" && (
        <OcrModal docType="fax" title="保険会社FAX・書類のAI読取"
          onClose={() => setOcr(null)}
          onApply={(r) => {
            const ins = {
              ...c.insurance,
              company: r.company || c.insurance.company,
              branch: r.branch || c.insurance.branch,
              contact: r.contact || c.insurance.contact,
              tel: r.tel || c.insurance.tel,
              accidentNo: r.accidentNo || c.insurance.accidentNo,
              approvalNo: r.approvalNo || c.insurance.approvalNo,
              insured: r.insured || c.insurance.insured,
              repairShop: r.repairShop || c.insurance.repairShop,
            };
            const cust = {
              ...c.customer,
              name: c.customer.name || r.userName || r.insured || "",
              phone: c.customer.phone || r.userPhone || "",
            };
            let segments = c.segments || [];
            if (segments.length === 0 && r.start) {
              segments = [{
                id: "S" + Date.now(), vehicleId: "",
                start: r.start, end: r.end || r.start,
                slot: "days", unitPrice: r.dailyLimit || "", overHours: "",
                place: r.repairShop || "", returnMethod: "来店", staff: "",
              }];
            }
            const extraMemo = [
              r.vehicleClass && `指定車種：${r.vehicleClass}`,
              r.dailyLimit && `日額上限：${Number(r.dailyLimit).toLocaleString("ja-JP")}円（税別）`,
              r.notes,
            ].filter(Boolean).join("／");
            const memo = [c.memo, extraMemo && `【FAX読取】${extraMemo}`].filter(Boolean).join("\n");
            setC({ ...c, insurance: ins, customer: cust, segments, memo });
            setOcr(null);
          }} />
      )}

      {ocr === "license" && (
        <OcrModal docType="license" title="免許証のAI読取"
          onClose={() => setOcr(null)}
          onApply={(r) => {
            setCust({
              name: r.name || c.customer.name, kana: r.kana || c.customer.kana,
              birth: r.birth || c.customer.birth, address: r.address || c.customer.address,
              licenseNo: r.licenseNo || c.customer.licenseNo, licenseExpiry: r.expiry || c.customer.licenseExpiry,
              licenseType: r.types || c.customer.licenseType, licenseCond: r.conditions || c.customer.licenseCond,
              confirmed: false,
            });
            setOcr(null);
          }} />
      )}
    </div>
  );
}

const Card = ({ title, action, children }) => (
  <section className="bg-white rounded-xl border border-slate-200 p-4">
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-bold text-sm text-slate-700">{title}</h2>{action}
    </div>
    {children}
    <style>{`.inp{width:100%;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.5rem 0.7rem;font-size:0.875rem;background:#fff}
.inp:disabled{background:#f1f5f9;color:#94a3b8}.inp:focus{outline:2px solid #10b981;outline-offset:-1px}`}</style>
  </section>
);
const Field = ({ label, children, full }) => (
  <label className={`block ${full ? "sm:col-span-2" : ""}`}>
    <span className="block text-xs text-slate-500 mb-1">{label}</span>{children}
  </label>
);

/* ---------------- OCRモーダル ---------------- */
function OcrModal({ docType, title, onClose, onApply }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [consent, setConsent] = useState(false);
  const inputRef = useRef(null);

  const pick = (fs) => {
    const arr = Array.from(fs || []);
    if (!arr.length) return;
    // F-10: 入力ファイル制限(最大5ファイル・画像8MB/PDF4MB)
    if (arr.length > 5) { setError("ファイルは一度に5件までにしてください。"); return; }
    const big = arr.find((f) => f.size > (f.type === "application/pdf" ? 4 : 8) * 1024 * 1024);
    if (big) { setError(`「${big.name}」が上限（画像8MB・PDF4MB）を超えています。PDFは1ページずつ、写真は撮り直すか縮小して選択してください。`); return; }
    setFiles(arr); setResult(null); setError(null); setPreviews([]);
    arr.forEach((f, i) => {
      if (f.type === "application/pdf") return;
      const r = new FileReader();
      r.onload = () => setPreviews((p) => { const q = [...p]; q[i] = r.result; return q; });
      r.readAsDataURL(f);
    });
  };
  const exec = async () => {
    setBusy(true); setError(null);
    try {
      const r = await runOcr(files, docType);
      setResult(r);
    } catch (e) {
      if (e.kind === "too_large") {
        setError(`送信データが大きすぎます。ファイル数を減らすか、写真を撮り直して（低解像度で）再度お試しください。［詳細: ${e.detail || ""}］`);
      } else if (e.kind === "config") {
        setError(`サーバーのAPIキーが未設定です。Netlifyの Site configuration → Environment variables に ANTHROPIC_API_KEY を登録し、再デプロイしてください。［詳細: ${e.detail || ""}］`);
      } else if (e.kind === "auth") {
        setError(`APIキーの認証に失敗しました。Netlifyに設定した ANTHROPIC_API_KEY が正しいか（余分な空白がないか・失効していないか）確認してください。［詳細: ${e.detail || ""}］`);
      } else if (e.kind === "network") {
        setError(`サーバーに接続できませんでした。デプロイが完了しているか、時間をおいて再度お試しください。［詳細: ${e.detail || e.message}］`);
      } else {
        setError(`読取に失敗しました。かすれ・傾き・光の反射がないか確認し、明るい場所で正面から撮り直すか、手入力してください。［詳細: ${e.detail || e.message}］`);
      }
    }
    setBusy(false);
  };
  const labels = docType === "license"
    ? { name: "氏名", kana: "フリガナ", birth: "生年月日", address: "住所", licenseNo: "免許証番号", expiry: "有効期限", types: "免許の種類", conditions: "条件等" }
    : docType === "fax"
    ? { company: "保険会社名", branch: "支店・部署", contact: "担当者", tel: "保険会社TEL", accidentNo: "事故受付番号", approvalNo: "承認番号", insured: "被保険者", userName: "利用者", userPhone: "利用者連絡先", repairShop: "修理工場", start: "貸渡開始日", end: "返却予定日", vehicleClass: "指定車種・クラス", dailyLimit: "日額上限", notes: "特記事項" }
    : { regNo: "登録番号", chassis: "車台番号", name: "車名", expiry: "車検満了日", firstReg: "初度登録", category: "用途" };
  const hint = docType === "license" ? "表面・裏面をまとめて選択できます（裏面に住所変更があれば最新住所を採用）"
    : docType === "fax" ? "FAXが複数ページの場合は全ページをまとめて選択してください"
    : "車検証記録事項の写真またはPDFを選択してください";
  const unclear = result?.unclear || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 sticky top-0 bg-white">
          <div className="font-bold text-sm flex items-center gap-1.5"><Camera size={16} />{title}</div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={(e) => pick(e.target.files)} />
          <button onClick={() => inputRef.current.click()} className="w-full border-2 border-dashed border-slate-300 rounded-xl py-6 px-3 text-sm text-slate-500 hover:border-sky-400 hover:text-sky-600">
            {files.length ? `📄 ${files.length}ファイル選択中（タップで変更）` : "タップして撮影またはファイルを選択（JPEG・PNG・PDF／複数可）"}
            <div className="text-xs text-slate-400 mt-1">{hint}</div>
          </button>
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {files.map((f, i) => previews[i]
                ? <img key={i} src={previews[i]} alt={`ページ${i + 1}`} className="h-24 rounded-lg border border-slate-200 object-contain bg-slate-50" />
                : <div key={i} className="h-24 px-3 flex items-center text-xs text-slate-500 rounded-lg border border-slate-200 bg-slate-50">PDF: {f.name}</div>
              )}
            </div>
          )}
          {files.length > 0 && !result && (
            <>
              <label className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-4 h-4 mt-0.5 accent-sky-600" />
                <span>この書類の画像を読取のため外部AI（Anthropic API）へ送信することについて、本人への説明・同意取得または社内規程に基づく確認を行いました。<span className="text-slate-400">（個人情報保護委員会の生成AI利用注意喚起への対応。送信記録・委託管理は本開発で実装）</span></span>
              </label>
              <button onClick={exec} disabled={busy || !consent} className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2">
                {busy ? <><Loader2 size={16} className="animate-spin" />読取中…（画像を補正して解析しています）</> : consent ? "AIで読み取る" : "同意確認にチェックすると読取できます"}
              </button>
            </>
          )}
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          {result && (
            <div className="space-y-2">
              <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
                原本と読取値を必ず照合してください。<b>黄色⚠の項目はAIが自信を持てなかった項目</b>です。誤りはこの場で修正してから反映してください。
              </div>
              {Object.entries(labels).map(([k, l]) => {
                const isUnclear = unclear.includes(k);
                return (
                  <div key={k} className={`flex items-center text-sm py-1 px-1 rounded ${isUnclear ? "bg-amber-50" : ""}`}>
                    <span className="w-28 text-slate-500 shrink-0">{l}{isUnclear && <span className="text-amber-600 ml-0.5">⚠</span>}</span>
                    <input value={result[k] ?? ""} placeholder="未読取（手入力可）"
                      onChange={(e) => setResult({ ...result, [k]: e.target.value })}
                      className={`flex-1 border rounded-lg px-2 py-1.5 text-sm ${result[k] ? "border-slate-200" : "border-red-300 bg-red-50"}`} />
                  </div>
                );
              })}
              <div className="flex gap-2">
                <button onClick={() => { setResult(null); }} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm">再読取</button>
                <button onClick={() => onApply(result)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg">
                  この内容をフォームへ反映（原本照合済み）
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 車両タブ ---------------- */
function VehicleTab({ vehicles, cases, onChange, showToast }) {
  const [ocrOpen, setOcrOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  const upd = (id, patch) => onChange(vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-xl px-4 py-2.5 text-xs">
        車検切れ表示の車両は「整備中」となり貸渡に割当できません。継続検査の完了を確認のうえ、車検満了日を更新して「稼働」に戻してください（監査レポート第6章対応）。
      </div>
      <div className="flex justify-end">
        <button onClick={() => setOcrOpen(true)} className="flex items-center gap-1 text-sm bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded-lg">
          <Camera size={15} />車検証から車両追加（AI読取）
        </button>
      </div>
      {vehicles.map((v) => {
        const st = shakenStatus(v);
        const inUse = cases.some((c) => c.status === "貸渡中" && (c.segments || []).some((s) => s.vehicleId === v.id));
        return (
          <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{v.regNo}</span>
              <span className="text-sm text-slate-500">{v.name}</span>
              {inUse && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">貸渡中</span>}
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${st.cls}`}>{st.level === "expired" ? "車検切れ" : `車検 ${st.label}`}</span>
              <button onClick={() => setEdit(edit === v.id ? null : v.id)} className="ml-auto p-1.5 text-slate-400 hover:text-slate-700"><Pencil size={15} /></button>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">車台番号 {v.chassis}｜初度登録 {v.firstReg}｜報告区分 {v.category}</div>
            {edit === v.id && (
              <div className="grid sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100">
                <Field label="料金クラス">
                  <select value={v.cls} onChange={(e) => upd(v.id, { cls: e.target.value })} className="inp">
                    {CLASSES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="車検満了日"><input type="date" value={v.shaken} onChange={(e) => upd(v.id, { shaken: e.target.value })} className="inp" /></Field>
                <Field label="状態">
                  <select value={v.state} onChange={(e) => upd(v.id, { state: e.target.value })} className="inp">
                    <option>稼働</option><option>整備中</option><option>売却・廃車</option>
                  </select>
                </Field>
              </div>
            )}
            <div className="text-xs text-slate-400 mt-2">クラス：{v.cls}（24時間 {yen(RATES[v.cls].h24)}・追加1日 {yen(RATES[v.cls].addDay)}）</div>
          </div>
        );
      })}
      {ocrOpen && (
        <OcrModal docType="shaken" title="車検証記録事項のAI読取"
          onClose={() => setOcrOpen(false)}
          onApply={(r) => {
            const regNorm = (r.regNo || "").replace(/[\s　]/g, "");
            const dup = vehicles.find((v) => (r.chassis && v.chassis === r.chassis) || (regNorm && v.regNo === regNorm));
            if (dup) {
              onChange(vehicles.map((v) => v.id === dup.id ? { ...v, shaken: r.expiry || v.shaken, regNo: regNorm || v.regNo } : v));
              showToast(`既存車両（${dup.regNo}）の情報を更新しました`);
            } else {
              onChange([...vehicles, {
                id: "V" + Date.now(), regNo: regNorm, name: r.name || "", chassis: r.chassis || "",
                cls: "1200CC", shaken: r.expiry || "", firstReg: r.firstReg || "", category: r.category || "乗用", state: "稼働",
              }]);
              showToast("車両を追加しました。料金クラスを確認してください。");
            }
            setOcrOpen(false);
          }} />
      )}
    </div>
  );
}

/* ---------------- 帳票タブ ---------------- */
function DocsTab({ cases, vehicles, settings, onPrint }) {
  const printable = cases.filter((c) => !c.deleted && (c.segments || []).length > 0);
  const nowY = new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  const [year, setYear] = useState(nowY);

  const downloadCsv = () => {
    const { cats, agg } = annualAgg(cases, vehicles, year);
    const lines = [
      `年次報告 転記用集計,${year}年度（${year}-04-01〜${year + 1}-03-31）`,
      "車種区分,配置車両数(3/31時点),貸渡回数,延貸渡日数,延走行キロ",
      ...cats.map((k) => `${k},${agg[k].fleet},${agg[k].count},${agg[k].days},${agg[k].km}`),
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `年次報告集計_${year}年度.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      <Panel title="料金表（保険会社提出用・案件に依存しない）">
        <button onClick={() => onPrint({ type: "price" })} className="flex items-center gap-1.5 text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700">
          <Printer size={15} />料金表を表示・印刷
        </button>
        <div className="text-xs text-slate-400 mt-2">適用版：{settings.priceVersion}</div>
      </Panel>
      <Panel title="法定帳票（貸渡簿・年次報告）">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => onPrint({ type: "ledger" })} className="flex items-center gap-1.5 text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700">
            <Printer size={15} />貸渡簿（全件一覧）
          </button>
          <div className="flex items-center gap-1.5 ml-2">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border border-slate-300 rounded-lg px-2 py-2 text-sm bg-white">
              {[nowY - 1, nowY, nowY + 1].map((yy) => <option key={yy} value={yy}>{yy}年度</option>)}
            </select>
            <button onClick={() => onPrint({ type: "annual", year })} className="text-sm border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50">年次報告 集計表</button>
            <button onClick={downloadCsv} className="text-sm border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50">CSV出力</button>
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-2">年次報告は九州運輸局の公式Excel様式（様式1・2）への転記用集計です。貸渡簿は貸渡終了日から2年間の保存が必要です。</div>
      </Panel>
      <Panel title="案件別帳票（貸渡証・配車表・請求書）">
        {printable.length === 0 ? <Empty text="配車区間が登録された案件がありません" /> : (
          <div className="space-y-2">
            {printable.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[c.status]}`}>{c.status}</span>
                <span className="text-sm font-medium">{c.caseNo}｜{c.customer?.name || "―"} 様</span>
                {c.invoiceNo && <span className="text-xs font-mono text-violet-600">{c.invoiceNo}（確定済）</span>}
                <div className="ml-auto flex gap-1.5">
                  <button onClick={() => onPrint({ type: "certificate", caseId: c.id })} className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 hover:bg-slate-50">貸渡証</button>
                  <button onClick={() => onPrint({ type: "dispatch", caseId: c.id })} className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 hover:bg-slate-50">配車表</button>
                  <button onClick={() => onPrint({ type: "invoice", caseId: c.id })} className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 hover:bg-slate-50">請求書</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <div className="text-xs text-slate-400">
        ※ 印刷画面で「PDFに保存」を選ぶとA4 PDFとして出力できます。必須項目（許可番号・適格番号・請求書採番）が未設定の帳票は印刷できず、「下書き・提出不可」の透かしが表示されます。
      </div>
    </div>
  );
}

/* ---------------- 印刷ビュー ---------------- */
function PrintView({ doc, c, cases, vehicles, settings, onClose, onAssignInvoiceNo }) {
  const calc = c ? calcCase(c, vehicles, settings) : null;
  const titles = { dispatch: "配車表", invoice: "請求書", price: "料金表", certificate: "貸渡証", ledger: "貸渡簿", annual: "年次報告集計" };
  const missing = [];
  if (doc.type === "invoice") {
    if (!settings.invoiceRegNo) missing.push("適格請求書発行事業者番号が未設定（設定タブで登録）");
    if (!c?.invoiceNo) missing.push("請求書番号が未採番（確定前のため印刷不可）");
  }
  if ((doc.type === "dispatch" || doc.type === "certificate") && !settings.permitNo) missing.push("貸渡許可番号が未設定");
  const printable = missing.length === 0; // F-14: 必須未設定の帳票は印刷・PDF出力禁止

  return (
    <div className="min-h-screen bg-slate-300">
      <style>{`
        @page { size: A4 portrait; margin: 10mm; }
        @media print {
          .no-print { display: none !important; }
          .sheet { box-shadow: none !important; margin: 0 !important; width: auto !important; min-height: 0 !important; }
          body { background: white; }
        }
        .sheet { background: white; width: 210mm; min-height: 280mm; margin: 16px auto; padding: 14mm 16mm; box-shadow: 0 4px 20px rgba(0,0,0,0.25); color: #111; font-family: 'Hiragino Mincho ProN','Yu Mincho','Noto Serif JP',serif; position: relative; page-break-after: always; }
        .sheet table { border-collapse: collapse; width: 100%; }
        .sheet th, .sheet td { border: 1px solid #333; padding: 5px 8px; font-size: 11px; }
        .sheet th { background: #f0f0f0; font-weight: 600; }
        .sheet thead { display: table-header-group; }   /* F-15: ページ跨ぎで見出し繰返し */
        .sheet tr { page-break-inside: avoid; }          /* F-15: 行の途中分割禁止 */
        .draft-mark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
        .draft-mark span { font-size: 64px; font-weight: 700; color: rgba(220, 38, 38, 0.18); transform: rotate(-28deg); border: 6px solid rgba(220, 38, 38, 0.18); padding: 8px 40px; white-space: nowrap; }
      `}</style>
      <div className="no-print sticky top-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={onClose} className="flex items-center gap-1 text-sm hover:bg-slate-700 px-2 py-1.5 rounded"><ChevronLeft size={17} />戻る</button>
        <div className="font-bold text-sm">{titles[doc.type]}プレビュー（A4）</div>
        {doc.type === "invoice" && !c?.invoiceNo && (
          <button onClick={onAssignInvoiceNo} className="text-xs bg-violet-600 hover:bg-violet-500 px-3 py-1.5 rounded-lg">採番して確定</button>
        )}
        <button onClick={() => printable && window.print()} disabled={!printable}
          className={`ml-auto flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg ${printable ? "bg-emerald-500 hover:bg-emerald-400" : "bg-slate-600 opacity-60 cursor-not-allowed"}`}>
          <Printer size={15} />{printable ? "印刷 / PDF保存" : "印刷不可（必須未設定）"}
        </button>
      </div>
      {missing.length > 0 && (
        <div className="no-print max-w-3xl mx-auto mt-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-2.5">
          <b>印刷不可：</b>{missing.join("／")}。外部提出可能な帳票は必須項目をすべて設定・確定したうえで出力できます。
        </div>
      )}
      <div style={{ position: "relative" }}>
        {doc.type === "dispatch" && <DispatchSheet c={c} vehicles={vehicles} settings={settings} calc={calc} draft={!printable} />}
        {doc.type === "invoice" && <InvoiceSheet c={c} vehicles={vehicles} settings={settings} calc={calc} draft={!printable} />}
        {doc.type === "price" && <PriceSheet settings={settings} />}
        {doc.type === "certificate" && <CertificateSheet c={c} vehicles={vehicles} settings={settings} draft={!printable} />}
        {doc.type === "ledger" && <LedgerSheet cases={cases} vehicles={vehicles} settings={settings} />}
        {doc.type === "annual" && <AnnualSheet cases={cases} vehicles={vehicles} settings={settings} year={doc.year} />}
      </div>
    </div>
  );
}

const DraftMark = () => (
  <div className="draft-mark"><span>下書き・提出不可</span></div>
);

function CompanyBlock({ settings }) {
  return (
    <div style={{ fontSize: 11, lineHeight: 1.7, textAlign: "left" }}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{settings.brand}</div>
      <div>{settings.company}</div>
      <div>{settings.address}</div>
      <div>TEL {settings.tel}　FAX {settings.fax}</div>
      <div>貸渡許可番号：{settings.permitNo || "（設定未完了）"}</div>
    </div>
  );
}

function DispatchSheet({ c, vehicles, settings, calc, draft }) {
  return (
    <div className="sheet">
      {draft && <DraftMark />}
      <div style={{ textAlign: "center", fontSize: 22, letterSpacing: 8, fontWeight: 700, borderBottom: "3px double #111", paddingBottom: 8 }}>配　車　表</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        <div style={{ fontSize: 13 }}>
          <div style={{ fontSize: 15, borderBottom: "1px solid #111", paddingBottom: 3, minWidth: 260 }}>
            {c.insurance?.company || c.customer?.name || "　"} {c.type === "事故代車" ? "御中" : "様"}
          </div>
          {c.insurance?.branch && <div style={{ fontSize: 11, marginTop: 3 }}>{c.insurance.branch}</div>}
        </div>
        <div style={{ textAlign: "right", fontSize: 11 }}>
          <div>作成日：{jpDate(todayStr())}</div>
          <div style={{ marginTop: 6 }}><CompanyBlock settings={settings} /></div>
        </div>
      </div>
      {c.type === "事故代車" && (
        <table style={{ marginTop: 12 }}>
          <tbody>
            <tr><th style={{ width: "18%" }}>事故受付番号</th><td style={{ width: "32%" }}>{c.insurance?.accidentNo || "―"}</td><th style={{ width: "18%" }}>承認番号</th><td>{c.insurance?.approvalNo || "―"}</td></tr>
            <tr><th>被保険者</th><td>{c.insurance?.insured || "―"}</td><th>利用者</th><td>{c.customer?.name || "―"} 様</td></tr>
            <tr><th>修理工場</th><td colSpan={3}>{c.insurance?.repairShop || "―"}</td></tr>
          </tbody>
        </table>
      )}
      <table style={{ marginTop: 12 }}>
        <thead>
          <tr><th>No.</th><th>配車日</th><th>返却日</th><th>日数</th><th>登録番号</th><th>車名</th><th>クラス</th><th>日額(税別)</th><th>金額(税別)</th></tr>
        </thead>
        <tbody>
          {calc.segs.map((s, i) => {
            const seg = c.segments[i];
            return (
              <tr key={i}>
                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td>{jpDate(seg.start)}</td><td>{jpDate(seg.end)}</td>
                <td style={{ textAlign: "center" }}>{s.days}</td>
                <td>{s.vehicle?.regNo || "―"}</td><td>{s.vehicle?.name || "―"}</td><td>{s.vehicle?.cls || "―"}</td>
                <td style={{ textAlign: "right" }}>{seg.slot === "days" ? yen(s.unit) : "―"}</td>
                <td style={{ textAlign: "right" }}>{yen(s.total)}</td>
              </tr>
            );
          })}
          {calc.optLines.map((o, i) => (
            <tr key={"o" + i}><td style={{ textAlign: "center" }}>―</td><td colSpan={5}>{o.label}（{o.days}日）</td><td></td><td style={{ textAlign: "right" }}>{yen(o.price)}</td><td style={{ textAlign: "right" }}>{yen(o.amount)}</td></tr>
          ))}
          {calc.nocAmt > 0 && <tr><td style={{ textAlign: "center" }}>―</td><td colSpan={6}>{NOC[c.noc].label}（{calc.nocTaxable ? "課税10%" : "消費税対象外"}）</td><td></td><td style={{ textAlign: "right" }}>{yen(calc.nocAmt)}</td></tr>}
          {calc.other > 0 && <tr><td style={{ textAlign: "center" }}>―</td><td colSpan={6}>その他費用</td><td></td><td style={{ textAlign: "right" }}>{yen(calc.other)}</td></tr>}
          {calc.discount > 0 && <tr><td style={{ textAlign: "center" }}>―</td><td colSpan={6}>値引き</td><td></td><td style={{ textAlign: "right" }}>−{yen(calc.discount).slice(1)}</td></tr>}
        </tbody>
      </table>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <table style={{ width: "48%" }}>
          <tbody>
            <tr><th>10%対象 小計（税別）</th><td style={{ textAlign: "right" }}>{yen(calc.taxable)}</td></tr>
            <tr><th>消費税（{calc.taxNone ? "非課税" : settings.taxRate + "%"}）</th><td style={{ textAlign: "right" }}>{yen(calc.tax)}</td></tr>
            {calc.nonTaxable > 0 && <tr><th>消費税対象外（NOC等）</th><td style={{ textAlign: "right" }}>{yen(calc.nonTaxable)}</td></tr>}
            <tr><th style={{ fontSize: 12 }}>合計</th><td style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>{yen(calc.total)}</td></tr>
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 14, fontSize: 11 }}>
        <div style={{ fontWeight: 700, borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 4 }}>特記事項</div>
        <div style={{ minHeight: 42, whiteSpace: "pre-wrap" }}>{c.memo || ""}</div>
      </div>
      <div style={{ marginTop: 10, fontSize: 9, color: "#555" }}>※ 日数は配車日から返却日までを両端含みで計算しています（同日配車・返却は1日）。</div>
    </div>
  );
}

function InvoiceSheet({ c, vehicles, settings, calc, draft }) {
  // F-13: 発行済(採番済)の場合はスナップショットから描画し、後日の変更を反映しない
  const snap = c.invoiceSnapshot;
  const d = snap || {
    no: c.invoiceNo, date: c.invoiceDate || todayStr(),
    calc, segments: c.segments || [], customer: { name: c.customer?.name || "" },
    insurance: c.insurance || {}, type: c.type, noc: c.noc,
    settings: settings,
  };
  const dc = d.calc, ds = d.settings;
  return (
    <div className="sheet">
      {draft && <DraftMark />}
      <div style={{ textAlign: "center", fontSize: 22, letterSpacing: 8, fontWeight: 700, borderBottom: "3px double #111", paddingBottom: 8 }}>御　請　求　書</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        <div>
          <div style={{ fontSize: 15, borderBottom: "1px solid #111", paddingBottom: 3, minWidth: 260 }}>
            {(d.type === "事故代車" ? d.insurance?.company : d.customer?.name) || "　"} {d.type === "事故代車" ? "御中" : "様"}
          </div>
          {d.insurance?.branch && <div style={{ fontSize: 11, marginTop: 3 }}>{d.insurance.branch}</div>}
          <div style={{ fontSize: 11, marginTop: 12 }}>
            件名：レンタカー使用料{d.insurance?.accidentNo ? `（事故受付番号 ${d.insurance.accidentNo}）` : ""}
            {d.type === "事故代車" && d.customer?.name ? `　利用者：${d.customer.name} 様` : ""}
          </div>
          <div style={{ marginTop: 10, fontSize: 12 }}>下記のとおりご請求申し上げます。</div>
          <div style={{ marginTop: 8, border: "2px solid #111", display: "inline-block", padding: "6px 22px", fontSize: 16, fontWeight: 700 }}>
            ご請求金額　{yen(dc.total)}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11 }}>
          <div>請求書番号：{d.no || "（未採番・確定前）"}</div>
          <div>請求日：{jpDate(d.date)}</div>
          <div style={{ marginTop: 6 }}><CompanyBlock settings={ds} /></div>
          <div style={{ marginTop: 3 }}>登録番号：{ds.invoiceRegNo || "（設定未完了）"}</div>
          {snap && <div style={{ marginTop: 3, color: "#555" }}>※ 発行時点の内容で確定済み</div>}
        </div>
      </div>
      <table style={{ marginTop: 14 }}>
        <thead><tr><th>品目</th><th>利用期間</th><th>数量</th><th>単位</th><th>単価(税別)</th><th>金額(税別)</th></tr></thead>
        <tbody>
          {dc.segs.map((s, i) => {
            const seg = d.segments[i] || {};
            return (
              <tr key={i}>
                <td>レンタカー使用料　{s.vehicle?.regNo}（{s.vehicle?.name}）</td>
                <td>{jpDate(seg.start)}〜{jpDate(seg.end)}</td>
                <td style={{ textAlign: "right" }}>{seg.slot === "days" ? s.days : 1}</td>
                <td style={{ textAlign: "center" }}>{seg.slot === "days" ? "日" : "式"}</td>
                <td style={{ textAlign: "right" }}>{seg.slot === "days" ? yen(s.unit) : yen(s.base)}</td>
                <td style={{ textAlign: "right" }}>{yen(s.total)}</td>
              </tr>
            );
          })}
          {dc.optLines.map((o, i) => (
            <tr key={"o" + i}><td>{o.label}</td><td></td><td style={{ textAlign: "right" }}>{o.days}</td><td style={{ textAlign: "center" }}>日</td><td style={{ textAlign: "right" }}>{yen(o.price)}</td><td style={{ textAlign: "right" }}>{yen(o.amount)}</td></tr>
          ))}
          {dc.nocAmt > 0 && <tr><td>{NOC[d.noc]?.label || "NOC"}{dc.nocTaxable ? "" : "（消費税対象外）"}</td><td></td><td style={{ textAlign: "right" }}>1</td><td style={{ textAlign: "center" }}>式</td><td style={{ textAlign: "right" }}>{yen(dc.nocAmt)}</td><td style={{ textAlign: "right" }}>{yen(dc.nocAmt)}</td></tr>}
          {dc.other > 0 && <tr><td>その他費用</td><td></td><td style={{ textAlign: "right" }}>1</td><td style={{ textAlign: "center" }}>式</td><td style={{ textAlign: "right" }}>{yen(dc.other)}</td><td style={{ textAlign: "right" }}>{yen(dc.other)}</td></tr>}
          {dc.discount > 0 && <tr><td>値引き</td><td></td><td></td><td></td><td></td><td style={{ textAlign: "right" }}>−{yen(dc.discount).slice(1)}</td></tr>}
        </tbody>
      </table>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 16 }}>
        <div style={{ flex: 1, fontSize: 11 }}>
          <div style={{ fontWeight: 700, borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 4 }}>お振込先</div>
          <div>{ds.bank}</div>
          <div>口座名義：{ds.bankHolder}</div>
          <div style={{ marginTop: 6, color: "#555" }}>※ 恐れ入りますが振込手数料は貴社にてご負担願います。</div>
          {dc.nonTaxable > 0 && <div style={{ marginTop: 6, color: "#555" }}>※ NOC（ノンオペレーションチャージ）は損害賠償金相当として消費税対象外で計上しています。課税区分は税理士確認のうえ最終決定してください。</div>}
        </div>
        <table style={{ width: "44%" }}>
          <tbody>
            <tr><th>10%対象 小計（税別）</th><td style={{ textAlign: "right" }}>{yen(dc.taxable)}</td></tr>
            <tr><th>消費税（{dc.taxNone ? "非課税" : (dc.rate != null ? dc.rate : ds.taxRate) + "%"}）</th><td style={{ textAlign: "right" }}>{yen(dc.tax)}</td></tr>
            {dc.nonTaxable > 0 && <tr><th>消費税対象外</th><td style={{ textAlign: "right" }}>{yen(dc.nonTaxable)}</td></tr>}
            <tr><th style={{ fontSize: 12 }}>合計</th><td style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>{yen(dc.total)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PriceSheet({ settings }) {
  return (
    <div className="sheet">
      <div style={{ textAlign: "center", fontSize: 22, letterSpacing: 8, fontWeight: 700, borderBottom: "3px double #111", paddingBottom: 8 }}>料　金　表</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11 }}>
        <div>適用開始日を含む版：{settings.priceVersion}　※ 金額はすべて税別</div>
        <CompanyBlock settings={settings} />
      </div>
      <table style={{ marginTop: 12 }}>
        <thead>
          <tr><th>クラス</th><th>3時間</th><th>6時間</th><th>12時間</th><th>24時間</th><th>超過1時間</th><th>追加1日</th></tr>
        </thead>
        <tbody>
          {CLASSES.map((cl) => {
            const r = RATES[cl];
            return (
              <tr key={cl}>
                <th style={{ textAlign: "left" }}>{cl}</th>
                <td style={{ textAlign: "right" }}>{yen(r.h3)}</td><td style={{ textAlign: "right" }}>{yen(r.h6)}</td>
                <td style={{ textAlign: "right" }}>{yen(r.h12)}</td><td style={{ textAlign: "right" }}>{yen(r.h24)}</td>
                <td style={{ textAlign: "right" }}>{yen(r.over)}</td><td style={{ textAlign: "right" }}>{yen(r.addDay)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 16, fontWeight: 700, fontSize: 13, borderBottom: "1px solid #111", paddingBottom: 3 }}>オプション・NOC（税別）</div>
      <table style={{ marginTop: 8, width: "60%" }}>
        <thead><tr><th>項目</th><th>単価</th><th>単位・条件</th></tr></thead>
        <tbody>
          {OPTIONS.map((o) => (
            <tr key={o.key}><td>{o.label}</td><td style={{ textAlign: "right" }}>{yen(o.price)}</td><td>{o.unit}</td></tr>
          ))}
          <tr><td>NOC・自走可能</td><td style={{ textAlign: "right" }}>{yen(20000)}</td><td>1事故</td></tr>
          <tr><td>NOC・自走不可／レッカー</td><td style={{ textAlign: "right" }}>{yen(50000)}</td><td>1事故</td></tr>
        </tbody>
      </table>
      <div style={{ marginTop: 12, fontSize: 10, color: "#555" }}>
        ※ 24時間を超えるご利用は、24時間料金に追加日数料金および超過時間料金を加算します。<br />
        ※ 消費税は別途申し受けます（税率 {settings.taxRate}%）。
      </div>
    </div>
  );
}

/* ---------------- 法定帳票(F-11/F-12) ---------------- */
// 車種区分(年次報告用)
function vehicleCategory(v) {
  if ((v.cls || "").includes("軽")) return "軽自動車";
  if (v.category === "貨物") return "貨物自動車";
  return "乗用自動車";
}
const fmtDT = (s) => s?.start ? `${jpDate(s.start)} ${s.startTime || ""}` : "―";
const fmtDTEnd = (s) => s?.end ? `${jpDate(s.end)} ${s.endTime || ""}` : "―";

// 貸渡証(道路運送法80条許可・貸渡簿記載事項に対応。項目は所轄運輸支局に要確認)
function CertificateSheet({ c, vehicles, settings, draft }) {
  const seg = (c.segments || [])[0] || {};
  const v = vehicles.find((x) => x.id === seg.vehicleId);
  return (
    <div className="sheet">
      {draft && <DraftMark />}
      <div style={{ textAlign: "center", fontSize: 22, letterSpacing: 8, fontWeight: 700, borderBottom: "3px double #111", paddingBottom: 8 }}>貸　渡　証</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11 }}>
        <div>貸渡証番号：{c.caseNo}　交付日：{jpDate(todayStr())}</div>
        <CompanyBlock settings={settings} />
      </div>
      <table style={{ marginTop: 10 }}>
        <tbody>
          <tr><th style={{ width: "22%" }}>借受人 氏名</th><td>{c.customer?.name || "―"}</td><th style={{ width: "18%" }}>電話番号</th><td>{c.customer?.phone || "―"}</td></tr>
          <tr><th>借受人 住所</th><td colSpan={3}>{c.customer?.address || "―"}</td></tr>
          <tr><th>運転者 氏名</th><td colSpan={3}>{c.customer?.name || "―"}（借受人に同じ）</td></tr>
          <tr><th>免許の種類</th><td>{c.customer?.licenseType || "―"}</td><th>免許証番号</th><td>{c.customer?.licenseNo || "―"}</td></tr>
          <tr><th>免許有効期限</th><td>{c.customer?.licenseExpiry ? wareki(c.customer.licenseExpiry) : "―"}</td><th>本人確認</th><td>{c.customer?.confirmed ? `確認済（${c.customer.confirmedBy || "―"}／${c.customer.confirmedAt ? new Date(c.customer.confirmedAt).toLocaleString("ja-JP") : ""}）` : "未確認"}</td></tr>
        </tbody>
      </table>
      <table style={{ marginTop: 10 }}>
        <tbody>
          <tr><th style={{ width: "22%" }}>登録番号</th><td>{v?.regNo || "―"}</td><th style={{ width: "18%" }}>車名</th><td>{v?.name || "―"}</td></tr>
          <tr><th>車台番号</th><td>{v?.chassis || "―"}</td><th>車検満了日</th><td>{v?.shaken ? wareki(v.shaken) : "―"}</td></tr>
          <tr><th>貸渡日時</th><td>{fmtDT(seg)}</td><th>返還予定日時</th><td>{fmtDTEnd(seg)}</td></tr>
          <tr><th>貸渡場所</th><td>{seg.place || settings.address}</td><th>返還場所</th><td>{seg.returnMethod === "当社引取" ? "当社引取" : settings.address}</td></tr>
          <tr><th>貸渡時 走行距離</th><td>{c.meterOut ? num(c.meterOut) + " km" : "―"}</td><th>貸渡時 燃料</th><td>{c.fuelOut || "―"}</td></tr>
        </tbody>
      </table>
      <div style={{ marginTop: 12, fontSize: 10.5, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 700, borderBottom: "1px solid #111", paddingBottom: 2, marginBottom: 4 }}>借受人が遵守すべき事項</div>
        一　貸渡自動車を転貸し、または他人に運転させないこと。<br />
        二　届出した運転者以外は運転しないこと。無免許運転・酒気帯び運転・薬物等の影響下での運転をしないこと。<br />
        三　本貸渡証を車内に携行し、係員の請求があったときは提示すること。<br />
        四　自動車の使用中は日常点検を行い、異常を認めたときは直ちに当社へ連絡すること。<br />
        五　返還予定日時までに返還場所へ返還すること。延長する場合は事前に当社の承諾を得ること。<br />
        六　事故が発生したときは、法令に定める措置を講じるとともに、直ちに当社および警察へ届け出ること。
      </div>
      <div style={{ marginTop: 10, fontSize: 9, color: "#555" }}>
        ※ 本貸渡証は貸渡期間中車内に携行してください。記載事項は貸渡簿として貸渡終了日から2年間保存されます（電子保存・改ざん防止は本開発で実装）。
      </div>
    </div>
  );
}

// 貸渡簿(一覧)
function LedgerSheet({ cases, vehicles, settings }) {
  const rows = [];
  cases.filter((c) => !c.deleted && (c.segments || []).length).forEach((c) => {
    (c.segments || []).forEach((s, i) => {
      const v = vehicles.find((x) => x.id === s.vehicleId);
      rows.push({ c, s, v, idx: i });
    });
  });
  rows.sort((a, b) => (a.s.start || "").localeCompare(b.s.start || ""));
  return (
    <div className="sheet">
      <div style={{ textAlign: "center", fontSize: 20, letterSpacing: 6, fontWeight: 700, borderBottom: "3px double #111", paddingBottom: 8 }}>貸　渡　簿</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10 }}>
        <div>作成日：{jpDate(todayStr())}　貸渡人：{settings.company}（許可番号：{settings.permitNo || "設定未完了"}）</div>
        <div>※ 貸渡終了日から2年間保存</div>
      </div>
      <table style={{ marginTop: 8 }}>
        <thead>
          <tr><th>貸渡証番号</th><th>借受人氏名</th><th>免許証番号</th><th>登録番号</th><th>貸渡日時</th><th>返還日時</th><th>貸渡場所</th><th>走行km</th><th>状態</th></tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", color: "#888" }}>記録がありません</td></tr>}
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.c.caseNo}{r.c.segments.length > 1 ? `-${r.idx + 1}` : ""}</td>
              <td>{r.c.customer?.name || "―"}</td>
              <td style={{ fontSize: 10 }}>{r.c.customer?.licenseNo || "―"}</td>
              <td>{r.v?.regNo || "―"}</td>
              <td style={{ fontSize: 10 }}>{fmtDT(r.s)}</td>
              <td style={{ fontSize: 10 }}>{fmtDTEnd(r.s)}</td>
              <td style={{ fontSize: 10 }}>{r.s.place || "本社"}</td>
              <td style={{ textAlign: "right" }}>{r.c.meterOut && r.c.meterIn ? num(Number(r.c.meterIn) - Number(r.c.meterOut)) : "―"}</td>
              <td>{r.c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8, fontSize: 9, color: "#555" }}>
        ※ 借受人住所・免許の種類・本人確認記録は各貸渡証に記載。運輸支局の要求項目一覧との最終照合を実施してください。
      </div>
    </div>
  );
}

// 年次報告(様式1・2 転記用集計): 年度=4月1日〜翌3月31日
function annualAgg(cases, vehicles, year) {
  const ys = `${year}-04-01`, ye = `${year + 1}-03-31`;
  const cats = ["乗用自動車", "軽自動車", "貨物自動車"];
  const agg = {};
  cats.forEach((k) => (agg[k] = { fleet: 0, count: 0, days: 0, km: 0 }));
  // 3/31時点の配置車両数(売却・廃車を除く)
  vehicles.filter((v) => v.state !== "売却・廃車").forEach((v) => { agg[vehicleCategory(v)].fleet += 1; });
  // 貸渡実績(年度内に開始した区間で集計)
  cases.filter((c) => !c.deleted && c.status !== "キャンセル").forEach((c) => {
    const kmTotal = c.meterOut && c.meterIn ? Math.max(0, Number(c.meterIn) - Number(c.meterOut)) : 0;
    const segsInYear = (c.segments || []).filter((s) => s.start && s.start >= ys && s.start <= ye);
    segsInYear.forEach((s, i) => {
      const v = vehicles.find((x) => x.id === s.vehicleId);
      if (!v) return;
      const k = vehicleCategory(v);
      agg[k].count += 1;
      agg[k].days += incDays(s.start, s.end);
      if (i === 0) agg[k].km += kmTotal; // 走行距離は案件単位のため先頭区間の車種へ計上
    });
  });
  return { cats, agg, ys, ye };
}

function AnnualSheet({ cases, vehicles, settings, year }) {
  const y = year || (new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1);
  const { cats, agg, ys, ye } = annualAgg(cases, vehicles, y);
  return (
    <div className="sheet">
      <div style={{ textAlign: "center", fontSize: 18, letterSpacing: 4, fontWeight: 700, borderBottom: "3px double #111", paddingBottom: 8 }}>
        貸渡実績報告書・配置車両数一覧表（様式1・2 転記用集計）
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10 }}>
        <div>対象年度：{y}年度（{jpDate(ys)}〜{jpDate(ye)}）　提出期限：{y + 1}年5月31日</div>
        <div>{settings.company}（許可番号：{settings.permitNo || "設定未完了"}）</div>
      </div>
      <table style={{ marginTop: 10 }}>
        <thead>
          <tr><th>車種区分</th><th>3月31日時点 配置車両数</th><th>貸渡回数</th><th>延貸渡日数</th><th>延走行キロ</th></tr>
        </thead>
        <tbody>
          {cats.map((k) => (
            <tr key={k}>
              <th style={{ textAlign: "left" }}>{k}</th>
              <td style={{ textAlign: "right" }}>{num(agg[k].fleet)} 台</td>
              <td style={{ textAlign: "right" }}>{num(agg[k].count)} 回</td>
              <td style={{ textAlign: "right" }}>{num(agg[k].days)} 日</td>
              <td style={{ textAlign: "right" }}>{num(agg[k].km)} km</td>
            </tr>
          ))}
          <tr>
            <th style={{ textAlign: "left" }}>合計</th>
            <td style={{ textAlign: "right", fontWeight: 700 }}>{num(cats.reduce((a, k) => a + agg[k].fleet, 0))} 台</td>
            <td style={{ textAlign: "right", fontWeight: 700 }}>{num(cats.reduce((a, k) => a + agg[k].count, 0))} 回</td>
            <td style={{ textAlign: "right", fontWeight: 700 }}>{num(cats.reduce((a, k) => a + agg[k].days, 0))} 日</td>
            <td style={{ textAlign: "right", fontWeight: 700 }}>{num(cats.reduce((a, k) => a + agg[k].km, 0))} km</td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 10, fontSize: 9.5, color: "#555", lineHeight: 1.7 }}>
        ※ 本表は九州運輸局の公式Excel様式（様式1「貸渡実績報告書」・様式2「事務所別車種別配置車両数一覧表」）への転記用集計です。<br />
        ※ 貸渡回数は年度内に開始した配車区間数、延貸渡日数は両端含み、延走行キロは案件の貸渡時・返却時メーター差です。<br />
        ※ 公式様式への直接出力・提出前の手集計照合は本開発で対応してください。
      </div>
    </div>
  );
}

/* ---------------- API接続テスト ---------------- */
function ApiTest() {
  const [state, setState] = useState(null); // {ok, msg}
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true); setState(null);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: "OKとだけ返答してください。" }],
        }),
      });
      const body = await res.text();
      if (res.ok) {
        setState({ ok: true, msg: "接続成功。AI読取（免許証・車検証・FAX）が利用できます。" });
      } else if (body.includes("ANTHROPIC_API_KEY")) {
        setState({ ok: false, msg: "APIキー未設定です。Netlifyの Site configuration → Environment variables に ANTHROPIC_API_KEY を登録し、Deploys → Trigger deploy で再デプロイしてください。" });
      } else if (res.status === 401 || res.status === 403) {
        setState({ ok: false, msg: `認証エラー（HTTP ${res.status}）。ANTHROPIC_API_KEY の値が正しいか（コピー時の余分な空白・失効）を確認してください。` });
      } else if (res.status === 404) {
        setState({ ok: false, msg: "サーバー関数が見つかりません（HTTP 404）。netlify/functions/anthropic.js を含むプロジェクト一式をデプロイしているか確認してください（distフォルダのみのアップロードでは動きません）。" });
      } else {
        setState({ ok: false, msg: `APIエラー（HTTP ${res.status}）: ${body.slice(0, 200)}` });
      }
    } catch (e) {
      setState({ ok: false, msg: `通信エラー（${e.name}）。サイトのデプロイ状態とネットワークを確認してください。` });
    }
    setBusy(false);
  };
  return (
    <div className="space-y-2">
      <button onClick={run} disabled={busy} className="flex items-center gap-2 text-sm bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white px-4 py-2 rounded-lg">
        {busy ? <><Loader2 size={15} className="animate-spin" />接続確認中…</> : "API接続テストを実行"}
      </button>
      {state && (
        <div className={`text-sm rounded-lg px-3 py-2.5 border ${state.ok ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-red-50 border-red-300 text-red-700"}`}>
          {state.msg}
        </div>
      )}
      <div className="text-xs text-slate-400">読取エラーが出る場合、まずこのテストで環境の問題（APIキー・デプロイ）か書類側の問題（読取失敗）かを切り分けできます。</div>
    </div>
  );
}

/* ---------------- バックアップ ---------------- */
function BackupTools() {
  const fileRef = useRef(null);
  const doExport = () => {
    const raw = localStorage.getItem("gr:data") || "{}";
    const blob = new Blob([raw], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ぐっどレンタカー_バックアップ_${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const doImport = (f) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        JSON.parse(r.result); // 形式確認
        localStorage.setItem("gr:data", r.result);
        location.reload();
      } catch (e) {
        alert("バックアップファイルの形式が正しくありません。");
      }
    };
    r.readAsText(f);
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={doExport} className="text-sm border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50">エクスポート（JSON保存）</button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => doImport(e.target.files[0])} />
        <button onClick={() => fileRef.current.click()} className="text-sm border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50">インポート（復元）</button>
      </div>
      <div className="text-xs text-slate-400 leading-relaxed">
        データは<b>この端末・このブラウザ内</b>にのみ保存されます。別の端末とは共有されず、ブラウザの履歴消去で失われるため、定期的にエクスポートして保管してください（複数端末での共有・自動バックアップは本開発のデータベース化で対応）。
      </div>
    </div>
  );
}

/* ---------------- 設定タブ ---------------- */
function SettingsTab({ settings, onChange, showToast }) {
  const [s, setS] = useState(settings);
  const set = (patch) => setS({ ...s, ...patch });
  return (
    <div className="space-y-5">
      <Card title="会社情報（帳票へ出力）">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="商号"><input value={s.company} onChange={(e) => set({ company: e.target.value })} className="inp" /></Field>
          <Field label="屋号"><input value={s.brand} onChange={(e) => set({ brand: e.target.value })} className="inp" /></Field>
          <Field label="所在地" full><input value={s.address} onChange={(e) => set({ address: e.target.value })} className="inp" /></Field>
          <Field label="TEL"><input value={s.tel} onChange={(e) => set({ tel: e.target.value })} className="inp" /></Field>
          <Field label="FAX"><input value={s.fax} onChange={(e) => set({ fax: e.target.value })} className="inp" /></Field>
          <Field label="代表者"><input value={s.rep} onChange={(e) => set({ rep: e.target.value })} className="inp" /></Field>
        </div>
      </Card>
      <Card title="許可・登録番号（本番運用前の必須項目）">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="自家用自動車有償貸渡許可番号 *">
            <input value={s.permitNo} onChange={(e) => set({ permitNo: e.target.value })} className="inp" placeholder="未入力（配車表に「設定未完了」と表示）" />
          </Field>
          <Field label="適格請求書発行事業者登録番号 *">
            <input value={s.invoiceRegNo} onChange={(e) => set({ invoiceRegNo: e.target.value })} className="inp" placeholder="T0000000000000" />
          </Field>
        </div>
      </Card>
      <Card title="請求・税">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="振込先" full><input value={s.bank} onChange={(e) => set({ bank: e.target.value })} className="inp" /></Field>
          <Field label="口座名義"><input value={s.bankHolder} onChange={(e) => set({ bankHolder: e.target.value })} className="inp" /></Field>
          <Field label="消費税率（%）"><input type="number" value={s.taxRate} onChange={(e) => set({ taxRate: Number(e.target.value) })} className="inp" /></Field>
          <Field label="税の丸め（請求書・税率ごとに1回）">
            <select value={s.rounding} onChange={(e) => set({ rounding: e.target.value })} className="inp">
              <option value="round">四捨五入</option><option value="floor">切捨て</option><option value="ceil">切上げ</option>
            </select>
          </Field>
          <Field label="NOCの消費税区分（税理士確認のうえ設定）" full>
            <select value={s.nocTaxable ? "taxable" : "exempt"} onChange={(e) => set({ nocTaxable: e.target.value === "taxable" })} className="inp">
              <option value="exempt">対象外・不課税（損害賠償金相当／既定）</option>
              <option value="taxable">課税10%（役務対価として扱う場合）</option>
            </select>
          </Field>
          <Field label="請求書番号 年度"><input type="number" value={s.invoiceYear} onChange={(e) => set({ invoiceYear: Number(e.target.value) })} className="inp" /></Field>
          <Field label="次の連番"><input type="number" value={s.invoiceSeq} onChange={(e) => set({ invoiceSeq: Number(e.target.value) })} className="inp" /></Field>
          <Field label="料金表 版表示" full><input value={s.priceVersion} onChange={(e) => set({ priceVersion: e.target.value })} className="inp" /></Field>
        </div>
      </Card>
      <Card title="AI読取（OCR）診断">
        <ApiTest />
      </Card>
      <Card title="データのバックアップ">
        <BackupTools />
      </Card>
      <button onClick={() => { onChange(s); showToast("設定を保存しました"); }}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl">設定を保存</button>
      <div className="text-xs text-slate-400 leading-relaxed">
        本アプリは要件確認用プロトタイプです（監査判定に基づき本番利用不可）。以下は本開発（サーバー化）の範囲です：ユーザー認証・役割別権限・変更履歴（F-08）、データベース保存・バックアップ・復元（F-07）、OCRのサーバー側処理と送信記録（F-09）、請求書のサーバー採番・排他制御・取消再発行（F-13）、貸渡簿の2年間の改ざん防止保存（F-11）、公式Excel様式への年次報告出力（F-12）。
      </div>
    </div>
  );
}
