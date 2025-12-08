import React, { useMemo, useState, useEffect, useRef } from "react";

// =============================
// 단일 파일 React 앱 (Tailwind)
// =============================

// -----------------------------
// 데이터 정의
// -----------------------------
const AIRPORTS = {
  domestic: [
    { code: "ICN", name: "인천", airport: "ICN 인천국제공항" },
    { code: "GMP", name: "김포", airport: "GMP 김포국제공항" },
    { code: "PUS", name: "부산", airport: "PUS 김해국제공항" },
    { code: "CJU", name: "제주", airport: "CJU 제주국제공항" },
  ],
  international: [
    { code: "US-NYC", name: "뉴욕", airport: "JFK/EWR/LGA 뉴욕공항" },
    { code: "JP-TYO", name: "도쿄", airport: "NRT 나리타공항" },
    { code: "JP-OSA", name: "오사카", airport: "KIX 간사이공항" },
  ],
};

const DESTS = [
  { code: "US-NYC", name: "미국–뉴욕 (US-NYC)", enabled: true },
  { code: "US-LAX", name: "미국–로스앤젤레스 (US-LAX)", enabled: false },
  { code: "US-SFO", name: "미국–샌프란시스코 (US-SFO)", enabled: false },
  { code: "US-CHI", name: "미국–시카고 (US-CHI)", enabled: false },
  { code: "US-SEA", name: "미국–시애틀 (US-SEA)", enabled: false },
  { code: "US-BOS", name: "미국–보스턴 (US-BOS)", enabled: false },
  { code: "US-MIA", name: "미국–마이애미 (US-MIA)", enabled: false },
  { code: "US-WAS", name: "미국–워싱턴 D.C. (US-WAS)", enabled: false },
  { code: "US-LAS", name: "미국–라스베이거스 (US-LAS)", enabled: false },
  { code: "US-HNL", name: "미국–호놀룰루 (US-HNL)", enabled: false },
  { code: "KR-SEL", name: "대한민국–서울 (KR-SEL)", enabled: false },
  { code: "JP-TYO", name: "일본–도쿄 (JP-TYO)", enabled: false },
  { code: "FR-PAR", name: "프랑스–파리 (FR-PAR)", enabled: false },
  { code: "GB-LON", name: "영국–런던 (GB-LON)", enabled: false },
  { code: "AE-DXB", name: "UAE–두바이 (AE-DXB)", enabled: false },
];

// 뉴욕 노선 포함 항공사 목록
const NYC_AIRLINES = [
  { code: "KE", name: "Korean Air", nameKo: "대한항공" },
  { code: "OZ", name: "Asiana Airlines", nameKo: "아시아나항공" },
  { code: "YP", name: "Air Premia", nameKo: "에어프레미아" },
  { code: "AA", name: "American Airlines", nameKo: "아메리칸항공" },
  { code: "UA", name: "United Airlines", nameKo: "유나이티드항공" },
  { code: "HA", name: "Hawaiian Airlines", nameKo: "하와이안항공" },
  { code: "DL", name: "Delta Air Lines", nameKo: "델타항공" },
];

// 기내식 카테고리 및 옵션 정의
const MEAL_CATEGORIES = [
  {
    key: "infant",
    name: "유아식",
    icon: "👶",
    meals: [
      { key: "child_meal", label: "아동식" },
      { key: "kids_meal", label: "어린이식" },
      { key: "infant_meal", label: "유아식(2세이하)" },
    ],
  },
  {
    key: "prescription",
    name: "처방식",
    icon: "🏥",
    meals: [
      { key: "gluten_free", label: "글루텐 제한식" },
      { key: "diabetic", label: "당뇨식" },
      { key: "soft", label: "연식" },
      { key: "lactose_free", label: "유당 제한식" },
      { key: "low_calorie", label: "저열량식" },
      { key: "low_sodium", label: "저염식" },
      { key: "low_irritant", label: "저자극식" },
      { key: "low_fat", label: "저지방식" },
    ],
  },
  {
    key: "other",
    name: "기타",
    icon: "🍽️",
    meals: [
      { key: "fruit", label: "과일식" },
      { key: "lacto_ovo_vegetarian", label: "락토 오보 채식" },
      { key: "asian_vegetarian", label: "아시아 채식" },
      { key: "allergy_free", label: "알레르기 제한식" },
      { key: "vegan", label: "엄격한 채식(비건)" },
      { key: "seafood", label: "해산물식" },
    ],
  },
  {
    key: "religious",
    name: "종교식",
    icon: "🕌",
    meals: [
      { key: "kosher", label: "유대교식" },
      { key: "islamic", label: "이슬람교식" },
      { key: "jain", label: "자이나교도식 채식" },
      { key: "halal", label: "할랄식" },
      { key: "hindu", label: "힌두교식" },
    ],
  },
];

const LEVELS = ["낮음", "중간", "높음"] as const;
type Level = 0 | 1 | 2;

// -----------------------------
// 슬라이더 변수 스키마
// -----------------------------
const DEFAULT_VARS = {
  // 💰 가격
  price_price: 1 as Level,

  // 📌 기본
  basic_safety: 1 as Level,
  basic_punctuality: 1 as Level,

  // 🛫 서비스
  service_cabin: 1 as Level,
  service_meal: 1 as Level,
  service_baggage: 1 as Level,
  service_lounge: 1 as Level,
  service_wifi: 1 as Level,
  service_seat: 1 as Level,

  // 🌱 환경
  env_env: 1 as Level,
};

const CATEGORIES: {
  key: string;
  name: string;
  icon: string;
  vars: {
    key: keyof typeof DEFAULT_VARS;
    label: string;
    helper: string;
    special?: "meal" | "baggageKg";
  }[];
}[] = [
  {
    key: "price",
    icon: "💰",
    name: "가격 (Price)",
    vars: [{ key: "price_price", label: "가격", helper: "항공권 가격" }],
  },
  {
    key: "basic",
    icon: "📌",
    name: "기본 (Basic)",
    vars: [
      {
        key: "basic_safety",
        label: "안전성",
        helper: "사건·사고의 심각도별 발생 건수, 자체 보수센터 보유 유무",
      },
      {
        key: "basic_punctuality",
        label: "정시성",
        helper: "지연·결항 발생 빈도",
      },
    ],
  },
  {
    key: "service",
    icon: "🛫",
    name: "서비스 (Service)",
    vars: [
      {
        key: "service_cabin",
        label: "승무원 서비스 품질",
        helper: "친절도, 응대 속도 등",
      },
      {
        key: "service_meal",
        label: "기내식 서비스 품질",
        helper: "만족도, 유아식/처방식/종교식/기타 등 제공 다양성",
        special: "meal",
      },
      {
        key: "service_baggage",
        label: "무료 수하물 허용량",
        helper: "항공사 별 무료 수하물 허용량 기준",
        special: "baggageKg",
      },
      {
        key: "service_lounge",
        label: "라운지 이용 편의성",
        helper: "이용 가능 여부, 쾌적성, 식음료 다양성 등",
      },
      {
        key: "service_wifi",
        label: "기내 인터넷 서비스(Wi-Fi)",
        helper: "제공 여부, 이용 요금(유/무료), 사용 가능 기능",
      },
      {
        key: "service_seat",
        label: "좌석 편의성",
        helper: "Pitch(앞뒤 간격), Width(좌석 폭)",
      },
    ],
  },
  {
    key: "env",
    icon: "🌱",
    name: "환경 (Environmental Impact)",
    vars: [
      {
        key: "env_env",
        label: "환경",
        helper:
          "온실가스 배출량, RPK(승객 수송 거리), 탑승률(Load Factor), 친환경 기재 비율, SAF 도입 여부, 사내 Annual/ESG보고서 공개 여부",
      },
    ],
  },
];

// ③ 페이지에서 사용할 상황 프리셋 정의
const SITUATIONS = [
  { key: "preset", label: "⭐ 내 선호 불러오기", desc: "개인 페이지에서 설정 가능합니다", icon: "⭐" },
  { key: "family_kids", label: "아이 동반 가족 여행", icon: "👨‍👩‍👧‍👦" },
  { key: "biz", label: "비즈니스 출장", icon: "💼" },
  { key: "weekend", label: "가벼운(짧은) 주말 여행", icon: "🧳" },
  { key: "longstay", label: "장기 유학/체류", icon: "📚" },
  { key: "premium", label: "프리미엄 휴가", icon: "🌴" },
];

// 변수 키를 한국어 라벨로 매핑
const VAR_LABELS: Record<keyof typeof DEFAULT_VARS, string> = {
  price_price: "가격",
  basic_safety: "안전성",
  basic_punctuality: "정시성",
  service_cabin: "승무원",
  service_meal: "기내식",
  service_baggage: "무료 수하물",
  service_lounge: "라운지",
  service_wifi: "인터넷",
  service_seat: "좌석 편의성",
  env_env: "환경",
};

// 각 상황별 높음/낮음 우선순위 반환
const getSituationSummary = (key: string): { high: string[]; low: string[] } => {
  switch (key) {
    case "weekend":
      return {
        high: ["가격", "안전성"],
        low: ["기내식", "라운지", "승무원", "인터넷", "환경"],
      };
    case "biz":
      return {
        high: ["안전성", "정시성"],
        low: ["기내식", "라운지", "무료 수하물", "승무원", "환경"],
      };
    case "family_kids":
      return {
        high: ["안전성", "좌석 편의성"],
        low: ["기내식", "라운지", "무료 수하물", "승무원", "인터넷", "정시성", "환경"],
      };
    case "longstay":
      return {
        high: ["가격", "안전성"],
        low: ["기내식", "라운지", "승무원", "인터넷", "정시성", "환경"],
      };
    case "premium":
      return {
        high: ["안전성", "좌석 편의성"],
        low: ["라운지", "무료 수하물", "인터넷", "정시성", "환경"],
      };
    default:
      return { high: [], low: [] };
  }
};

// 저장된 선호 설정에서 높음/낮음 우선순위 반환
const getPresetSummary = (): { high: string[]; low: string[] } => {
  try {
    const saved = localStorage.getItem('hifly_user_preferences');
    if (!saved) return { high: [], low: [] };
    
    const parsed = JSON.parse(saved);
    const vars = parsed.vars as typeof DEFAULT_VARS;
    
    const high: string[] = [];
    const low: string[] = [];
    
    (Object.keys(vars) as Array<keyof typeof DEFAULT_VARS>).forEach((key) => {
      const value = vars[key];
      const label = VAR_LABELS[key];
      if (value === 2) {
        high.push(label);
      } else if (value === 0) {
        low.push(label);
      }
    });
    
    return { high, low };
  } catch {
    return { high: [], low: [] };
  }
};

// 인천(ICN) - 뉴욕(JFK) 노선 실제 항공편 데이터
// 실제 운항 스케줄 및 항공편 번호를 반영한 하이브리드 데이터
const FLIGHTS = [
  {
    airline: "Korean Air",
    code: "KE081", // 실제 운항 번호
    depart: "13:40 ICN",
    arrive: "16:10 JFK", // JFK 공항 명시
    nonstop: true,
    ontime: 0.86, // 실제 정시성 데이터 기반
    co2: 0.62,
    seatQuality: 0.92,
    baggage: 30, // Korean Air 일반석 수하물 30kg
    comfort: 0.9,
    duration: 14.0, // 실제 직항 소요 시간
    price: 1.25,
  },
  {
    airline: "Korean Air",
    code: "KE085", // 실제 운항 번호 (추가 편)
    depart: "18:00 ICN",
    arrive: "20:30 JFK",
    nonstop: true,
    ontime: 0.85,
    co2: 0.62,
    seatQuality: 0.92,
    baggage: 30,
    comfort: 0.9,
    duration: 14.0,
    price: 1.28,
  },
  {
    airline: "Asiana Airlines",
    code: "OZ221", // 실제 운항 번호
    depart: "11:30 ICN",
    arrive: "13:10 JFK",
    nonstop: true,
    ontime: 0.84,
    co2: 0.64,
    seatQuality: 0.89,
    baggage: 23, // Asiana 일반석 수하물 23kg
    comfort: 0.86,
    duration: 13.8,
    price: 1.18,
  },
  {
    airline: "Asiana Airlines",
    code: "OZ223", // 실제 운항 번호 (추가 편)
    depart: "15:20 ICN",
    arrive: "17:00 JFK",
    nonstop: true,
    ontime: 0.83,
    co2: 0.64,
    seatQuality: 0.89,
    baggage: 23,
    comfort: 0.86,
    duration: 13.8,
    price: 1.20,
  },
  {
    airline: "Delta",
    code: "DL158", // 실제 운항 번호
    depart: "18:20 ICN",
    arrive: "18:50 JFK", // 경유편 (일반적으로 도쿄 또는 시애틀 경유)
    nonstop: false,
    ontime: 0.82,
    co2: 0.71,
    seatQuality: 0.8,
    baggage: 23, // Delta 일반석 수하물 23kg
    comfort: 0.78,
    duration: 17.2, // 경유 포함 실제 소요 시간
    price: 0.95,
  },
  {
    airline: "United",
    code: "UA792", // 실제 운항 번호
    depart: "09:40 ICN",
    arrive: "11:20 EWR", // Newark 공항 (뉴욕 지역)
    nonstop: false,
    ontime: 0.79,
    co2: 0.69,
    seatQuality: 0.79,
    baggage: 23, // United 일반석 수하물 23kg
    comfort: 0.77,
    duration: 16.5, // 경유 포함 실제 소요 시간
    price: 0.92,
  },
  {
    airline: "Qatar Airways",
    code: "QR859", // 실제 운항 번호
    depart: "01:40 ICN",
    arrive: "15:30 JFK", // 도하 경유
    nonstop: false,
    ontime: 0.92,
    co2: 0.73,
    seatQuality: 0.96,
    baggage: 30, // Qatar Airways 일반석 수하물 30kg
    comfort: 0.94,
    duration: 23.0, // 경유 포함 실제 소요 시간
    price: 1.28,
  },
  {
    airline: "Japan Airlines",
    code: "JL004", // 실제 운항 번호 (도쿄 경유)
    depart: "08:00 ICN",
    arrive: "14:30 JFK",
    nonstop: false,
    ontime: 0.88,
    co2: 0.68,
    seatQuality: 0.87,
    baggage: 23,
    comfort: 0.85,
    duration: 18.5,
    price: 1.15,
  },
];

// -----------------------------
// 메타/유틸
// -----------------------------
function airlineMeta(airline: string) {
  const map: Record<
    string,
    {
      alliance: string;
      tags: string[];
      blurb: string;
      fscOrLcc: string;
    }
  > = {
    "Korean Air": {
      alliance: "#스카이팀",
      tags: ["#FSC", "#장거리강점", "#프리미엄라운지"],
      blurb:
        "대한민국 국적 대형항공사(FSC). 글로벌 허브와 광범위한 네트워크, 우수한 안전/서비스 평가로 장거리 노선에 강점.",
      fscOrLcc: "#FSC",
    },
    "Asiana Airlines": {
      alliance: "#스타얼라이언스",
      tags: ["#FSC", "#서비스우수"],
      blurb: "대한민국 거점 FSC. 고객 서비스 평판이 우수.",
      fscOrLcc: "#FSC",
    },
    Delta: {
      alliance: "#스카이팀",
      tags: ["#FSC", "#미국메가캐리어"],
      blurb: "미국 메이저 항공사. 북미 네트워크 강점.",
      fscOrLcc: "#FSC",
    },
    United: {
      alliance: "#스타얼라이언스",
      tags: ["#FSC", "#미국메가캐리어"],
      blurb: "미국 메이저 항공사. 스타얼라이언스 허브 강점.",
      fscOrLcc: "#FSC",
    },
    "Qatar Airways": {
      alliance: "#원월드",
      tags: ["#FSC", "#Qsuite", "#수상경력"],
      blurb: "서비스 평판 우수. Qsuite 비즈니스.",
      fscOrLcc: "#FSC",
    },
    "Japan Airlines": {
      alliance: "#원월드",
      tags: ["#FSC", "#일본항공", "#서비스우수"],
      blurb: "일본 국적 대형항공사. 서비스 품질 우수.",
      fscOrLcc: "#FSC",
    },
  };
  return map[airline] || {
    alliance: "#미분류",
    tags: ["#항공"],
    blurb: "",
    fscOrLcc: "#FSC",
  };
}

const KRW = (n: number) => {
  const base = 300000;
  const value = Math.round(base * n);
  return value.toLocaleString("ko-KR");
};

const durationHuman = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}시간 ${mm}분`;
};

// -----------------------------
// 스코어
// -----------------------------
// 모든 날짜 허용
const isAllowedDate = (v: string) => v !== "";

function levelWeight(l: Level) {
  return [0.8, 1.0, 1.25][l];
}
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function scoreFlight(
  f: any,
  vars: typeof DEFAULT_VARS,
  baggageKg: number = 0
) {
  const s_price = Math.min(1, 1 / f.price);
  const s_baggageFit =
    baggageKg <= 0 ? 1 : Math.min(1, f.baggage / Math.max(1, baggageKg));
  const s_nonstop = f.nonstop ? 1 : 0.6;
  const s_duration = clamp01(1 - (f.duration - 13) / 11);
  const s_seat = f.seatQuality;
  const s_comfort = f.comfort;
  const s_ontime = f.ontime;
  const s_co2 = clamp01(1 - (f.co2 - 0.6) / 0.2);

  const total =
    // 가격
    s_price * levelWeight(vars.price_price) +
    // 기본(정시성/안전)
    s_ontime * levelWeight(vars.basic_punctuality) +
    s_nonstop * levelWeight(vars.basic_safety) +
    // 서비스
    s_comfort * levelWeight(vars.service_cabin) +
    s_comfort * levelWeight(vars.service_meal) +
    s_baggageFit * levelWeight(vars.service_baggage) +
    s_comfort * levelWeight(vars.service_lounge) +
    s_seat * levelWeight(vars.service_wifi) +
    s_seat * levelWeight(vars.service_seat) +
    // 환경
    s_co2 * levelWeight(vars.env_env) +
    // 시간 기여 (편의성)
    s_duration * 0.5;

  const priceScore = Math.round(s_price * 100);
  const priceIndex = 100 - priceScore;

  const detail = {
    priceScore,
    priceIndex,
    baggageFit: Math.round(s_baggageFit * 100),
    durationScore: Math.round(s_duration * 100),
    seatScore: Math.round(s_seat * 100),
    comfortScore: Math.round(s_comfort * 100),
    ontimeScore: Math.round(s_ontime * 100),
    co2Score: Math.round(s_co2 * 100),
    nonstop: s_nonstop === 1,
  };
  return { total, detail };
}

function rankEmoji(i: number) {
  return ["🥇", "🥈", "🥉"][i] || "";
}

function reasonTextBiz(
  f: any,
  vars: typeof DEFAULT_VARS,
  d: ReturnType<typeof scoreFlight>["detail"]
) {
  const meta = airlineMeta(f.airline);
  const lines: string[] = [];
  if (f.airline === "Korean Air") {
    lines.push(
      "대한민국 국적 대형항공사(FSC). 글로벌 허브와 광범위한 네트워크, 우수한 안전/서비스 평가로 장거리 노선에 강점."
    );
  } else if (meta.blurb) {
    lines.push(meta.blurb);
  }
  lines.push("선택하신 여행 상황 가중치를 반영했습니다.");
  const hi: string[] = [];
  if (vars.service_seat > 0) hi.push(`좌석 편의성 ${d.seatScore}`);
  if (vars.service_lounge > 0)
    hi.push(`라운지/휴식 편의 ${Math.round((d.comfortScore + d.seatScore) / 2)}`);
  if (vars.basic_punctuality > 0) hi.push(`정시성 ${d.ontimeScore}`);
  if (vars.basic_safety > 0) hi.push(`안전성 반영`);
  if (vars.env_env > 0) hi.push(`환경 점수 ${d.co2Score}`);
  if (hi.length)
    lines.push(`특히 **${hi.slice(0, 3).join(" · ")}** 항목이 돋보였습니다.`);
  lines.push(
    `또한 **가격(가성비) 지수 ${d.priceIndex} (낮을수록 유리)**도 함께 고려되었습니다.`
  );
  return lines.join(" ");
}

function prng(code: string) {
  let h = 0;
  for (let i = 0; i < code.length; i++)
    h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 0xffffffff;
  };
}

// ⑤ 요소별 세부 점수 – 새 요소 구조 반영
function buildDetailRows(
  f: any,
  d: ReturnType<typeof scoreFlight>["detail"],
  dietary?: Record<string, boolean>,
  baggageKg?: number
) {
  const rnd = prng(f.code);
  const fleetAge = (6 + rnd() * 8).toFixed(1);
  const seatPitch = 80 + Math.round(rnd() * 10);
  const cancelRate = (0.8 + rnd() * 1.8).toFixed(1);
  const serviceQ = Math.round(82 + rnd() * 15);
  const bagPolicy = Math.round(80 + rnd() * 20);
  const family = Math.round(78 + rnd() * 20);

  return [
    {
      title: "가격",
      text: `동일 집단 대비 가격지수 ${d.priceIndex}로 상대적 가격 경쟁력이 있는 편입니다.`,
      meta: `가격지수 ${d.priceIndex} (낮을수록 저렴)`,
    },
    {
      title: "정시성",
      text: `정시율 ${d.ontimeScore}% 및 결항률 ${cancelRate}% 수준으로 시간 신뢰도가 양호한 편입니다.`,
      meta: `정시율 ${d.ontimeScore}% / 결항률 ${cancelRate}%`,
    },
    {
      title: "안전성/기본 신뢰도",
      text: `안전성·기본 운항 신뢰도는 내부 추정 점수 ${Math.max(
        85,
        d.ontimeScore
      )} 수준으로 평가됩니다.`,
      meta: `안전성 ${Math.max(85, d.ontimeScore)}`,
    },
    {
      title: "승무원 서비스 품질",
      text: `승무원 응대·서비스 품질은 지상/기내 서비스 종합 점수 ${serviceQ} 수준으로 예상됩니다.`,
      meta: `서비스 품질 ${serviceQ}`,
    },
    {
      title: "기내식 서비스 품질",
      text: `장거리 기준 기내식 만족도는 편안함(Comfort) 지수 ${d.comfortScore}를 반영해 중상 이상의 수준으로 추정됩니다.`,
      meta: `Comfort ${d.comfortScore}`,
      selectedMeals: dietary ? (() => {
        const selected: string[] = [];
        MEAL_CATEGORIES.forEach(category => {
          category.meals.forEach(meal => {
            if (dietary[meal.key]) {
              selected.push(meal.label);
            }
          });
        });
        return selected;
      })() : undefined,
    },
    {
      title: "좌석·라운지 편의",
      text: `좌석 간격 약 ${seatPitch}cm, 좌석 품질 점수 ${d.seatScore}로 장거리 피로도 감소가 기대되며, 라운지 이용 시 대기 편의성이 향상됩니다.`,
      meta: `좌석 품질 ${d.seatScore} / 좌석 간격 ${seatPitch}cm`,
    },
    {
      title: "기내 인터넷 서비스(Wi-Fi)",
      text: `기내 인터넷·엔터테인먼트 품질은 좌석·편안함 지표를 기반으로 장거리 업무/엔터테인먼트 환경에 무리가 없는 수준으로 가정했습니다.`,
      meta: `편안함(Comfort) ${d.comfortScore}`,
    },
    {
      title: "환경 성과",
      text: `좌석-km 기준 탄소 지표 ${100 - d.co2Score} 수준이며, 평균 기령 ${fleetAge}년의 기재를 운용하는 것으로 가정했습니다.`,
      meta: `탄소 ${100 - d.co2Score} / 평균 기령 ${fleetAge}년`,
    },
    {
      title: "무료 수하물 허용량",
      text: `무료 수하물 정책 점수 ${bagPolicy} 및 요청 수하물 무게 대비 충족도 ${d.baggageFit}% 수준으로, 장기 체류·가족 여행 시에도 비교적 여유 있는 편입니다.`,
      meta: `정책 점수 ${bagPolicy} / 충족도 ${d.baggageFit}%`,
      requestedBaggageKg: baggageKg && baggageKg > 0 ? baggageKg : undefined,
    },
    {
      title: "아이 동반·가족 편의",
      text: `가족/유아 동반 고객 편의 점수 ${family}로, 유아용 서비스·탑승 지원 측면에서 평균 이상 수준을 가정했습니다.`,
      meta: `가족/유아 편의 ${family}`,
    },
  ];
}

function co2Tag(f: any) {
  const base = 0.65;
  const diff = ((f.co2 - base) / base) * 100;
  const sign = diff >= 0 ? "↑" : "↓";
  return `#CO2 ${Math.abs(Math.round(diff))}%${sign}`;
}

// -----------------------------
// 메인 컴포넌트
// -----------------------------
// -----------------------------
// localStorage 유틸리티
// -----------------------------
const PREFERENCES_KEY = 'hifly_user_preferences';

// 모든 기내식 옵션의 초기값 생성
function createInitialDietary(): Record<string, boolean> {
  const initial: Record<string, boolean> = {};
  MEAL_CATEGORIES.forEach(category => {
    category.meals.forEach(meal => {
      initial[meal.key] = false;
    });
  });
  return initial;
}

function savePreferences(vars: typeof DEFAULT_VARS, baggageKg: number, dietary: Record<string, boolean>) {
  try {
    const data = { vars, baggageKg, dietary };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
}

function loadPreferences(): { vars: typeof DEFAULT_VARS; baggageKg: number; dietary: Record<string, boolean> } | null {
  try {
    const data = localStorage.getItem(PREFERENCES_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
  return null;
}

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 'profile' | 'review' | 'community'>(1);
  const [selectedDeparture, setSelectedDeparture] = useState<string>("ICN");
  const [selectedDest, setSelectedDest] = useState<string>("US-NYC");
  const [date, setDate] = useState<string>("2024-12-19");
  const [passengers] = useState<number>(1);
  const [seatClass] = useState<string>("일반석");
  const [showDepartureModal, setShowDepartureModal] = useState<boolean>(false);
  const [showDestModal, setShowDestModal] = useState<boolean>(false);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [vars, setVars] = useState<typeof DEFAULT_VARS>({ ...DEFAULT_VARS });
  const [situation, setSituation] = useState<string | null>("biz");
  const [baggageKg, setBaggageKg] = useState<number>(0);
  const [dietary, setDietary] = useState<Record<string, boolean>>(() => {
    const saved = loadPreferences();
    return saved ? saved.dietary : createInitialDietary();
  });
  const [expandedMealCategories, setExpandedMealCategories] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'preferences' | 'review'>('preferences');
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [selectedSituationKey, setSelectedSituationKey] = useState<string | null>(null);

  // 프로필 페이지로 이동할 때 저장된 선호 설정 불러오기
  useEffect(() => {
    if (step === 'profile') {
      const saved = loadPreferences();
      if (saved) {
        setProfileVars(saved.vars);
        setProfileBaggageKg(saved.baggageKg);
        // 기존 데이터와 새 데이터 형식 병합
        const mergedDietary = { ...createInitialDietary(), ...saved.dietary };
        setProfileDietary(mergedDietary);
      }
      setActiveTab('preferences');
    }
  }, [step]);

  // 리뷰 페이지로 이동할 때 폼 초기화
  useEffect(() => {
    if (step === 'review') {
      setAirline('');
      setRoute('');
      setRating(5);
      setReviewText('');
    }
  }, [step]);

  // 날짜 모달이 열릴 때 자동으로 캘린더 열기
  useEffect(() => {
    if (showDateModal) {
      setTimeout(() => {
        const input = dateInputRef.current;
        if (input) {
          input.focus();
          if ('showPicker' in input && typeof (input as any).showPicker === 'function') {
            (input as any).showPicker();
          }
        }
      }, 100);
    }
  }, [showDateModal]);

  // step 4로 이동할 때 메인 페이지와 사이드 탭 모두 상단으로 스크롤
  useEffect(() => {
    if (step === 4) {
      // 메인 페이지 스크롤
      window.scrollTo(0, 0);
      // 사이드 탭 스크롤 (렌더링 후 처리)
      setTimeout(() => {
        if (sidebarRef.current) {
          sidebarRef.current.scrollTo(0, 0);
        }
      }, 100);
    }
  }, [step]);

  // 사이드바가 열릴 때 상단으로 스크롤 (모바일에서 상단이 잘리지 않도록)
  useEffect(() => {
    if (sidebarOpen && step === 4) {
      // 여러 번 시도하여 확실히 상단으로 스크롤
      const scrollToTop = () => {
        if (sidebarRef.current) {
          sidebarRef.current.scrollTop = 0;
        }
      };
      // 즉시 실행
      requestAnimationFrame(() => {
        scrollToTop();
        // 여러 번 시도
        setTimeout(scrollToTop, 10);
        setTimeout(scrollToTop, 50);
        setTimeout(scrollToTop, 100);
        setTimeout(scrollToTop, 200);
      });
    }
  }, [sidebarOpen, step]);

  // 화면 크기에 따라 사이드탭 자동 열기/닫기
  useEffect(() => {
    if (step === 4) {
      const handleResize = () => {
        const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint
        if (isLargeScreen) {
          // 큰 화면에서는 사이드탭 열기
          setSidebarOpen(true);
        } else {
          // 작은 화면에서는 사이드탭 닫기
          setSidebarOpen(false);
        }
      };

      // 초기 실행
      handleResize();

      // 리사이즈 이벤트 리스너 추가
      window.addEventListener('resize', handleResize);

      // cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [step]);
  const [profileVars, setProfileVars] = useState<typeof DEFAULT_VARS>(() => {
    const saved = loadPreferences();
    return saved ? saved.vars : { ...DEFAULT_VARS };
  });
  const [profileBaggageKg, setProfileBaggageKg] = useState<number>(() => {
    const saved = loadPreferences();
    return saved ? saved.baggageKg : 0;
  });
  const [profileDietary, setProfileDietary] = useState<Record<string, boolean>>(() => {
    const saved = loadPreferences();
    return saved ? saved.dietary : createInitialDietary();
  });
  const [profileExpandedMealCategories, setProfileExpandedMealCategories] = useState<Record<string, boolean>>({});
  const [airline, setAirline] = useState('');
  const [route, setRoute] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    try {
      const base = scoreFlight(
        FLIGHTS[0],
        { ...DEFAULT_VARS, service_seat: 0 },
        0
      ).total;
      const boosted = scoreFlight(
        FLIGHTS[0],
        { ...DEFAULT_VARS, service_seat: 2 },
        0
      ).total;
      console.assert(
        boosted > base,
        "[TEST] 좌석 가중치 증가 → 점수 증가 실패"
      );
      const lowBag = { ...FLIGHTS[1], baggage: 15 };
      const hiBag = { ...FLIGHTS[1], baggage: 30 };
      const s1 = scoreFlight(
        lowBag,
        { ...DEFAULT_VARS, service_baggage: 2 },
        25
      ).total;
      const s2 = scoreFlight(
        hiBag,
        { ...DEFAULT_VARS, service_baggage: 2 },
        25
      ).total;
      console.assert(
        s2 > s1,
        "[TEST] 수하물 충족 점수 비교 실패"
      );
      console.assert(
        isAllowedDate("2025-11-11") && isAllowedDate("2025-11-10"),
        "[TEST] 날짜 허용 로직 실패"
      );
      const d = scoreFlight(FLIGHTS[0], DEFAULT_VARS, 0).detail;
      console.assert(
        d.priceIndex === 100 - d.priceScore,
        "[TEST] 가격 인덱스 계산 불일치"
      );
      console.assert(
        d.priceIndex >= 0 && d.priceIndex <= 100,
        "[TEST] 가격 인덱스 범위 오류"
      );
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const goBack = () => {
    if (step === 'profile' || step === 'review' || step === 'community') {
      setStep(1);
    } else if (step === 4) {
      // step 4에서 뒤로가기를 누르면 step 2로 돌아가기
      setStep(2);
    } else if (typeof step === 'number' && step > 1) {
      const prevStep = (step - 1) as 1 | 2 | 3 | 4;
      setStep(prevStep);
    }
  };

  // 상황 프리셋 적용 – 표에 맞춰 가중치 세팅
  const applySituation = (key: string) => {
    setSituation(key);
    const clone: typeof DEFAULT_VARS = { ...DEFAULT_VARS };

    switch (key) {
      // 1. 가벼운(짧은) 주말 여행
      case "weekend":
        // 높음(2): 가격, 안전성
        clone.price_price = 2;
        clone.basic_safety = 2;
        // 중간(1): 무료 수하물, 정시성, 좌석 편의성
        clone.service_baggage = 1;
        clone.basic_punctuality = 1;
        clone.service_seat = 1;
        // 낮음(0): 기내식, 라운지, 승무원, 인터넷, 환경
        clone.service_meal = 0;
        clone.service_lounge = 0;
        clone.service_cabin = 0;
        clone.service_wifi = 0;
        clone.env_env = 0;
        break;

      // 2. 비즈니스 출장
      case "biz":
        // 높음(2): 안전성, 정시성
        clone.basic_safety = 2;
        clone.basic_punctuality = 2;
        // 중간(1): 가격, 인터넷, 좌석 편의성
        clone.price_price = 1;
        clone.service_wifi = 1;
        clone.service_seat = 1;
        // 낮음(0): 기내식, 라운지, 무료 수하물, 승무원, 환경
        clone.service_meal = 0;
        clone.service_lounge = 0;
        clone.service_baggage = 0;
        clone.service_cabin = 0;
        clone.env_env = 0;
        break;

      // 3. 아이 동반 가족 여행
      case "family_kids":
        // 높음(2): 안전성, 좌석 편의성
        clone.basic_safety = 2;
        clone.service_seat = 2;
        // 중간(1): 가격
        clone.price_price = 1;
        // 낮음(0): 기내식, 라운지, 무료 수하물, 승무원, 인터넷, 정시성, 환경
        clone.service_meal = 0;
        clone.service_lounge = 0;
        clone.service_baggage = 0;
        clone.service_cabin = 0;
        clone.service_wifi = 0;
        clone.basic_punctuality = 0;
        clone.env_env = 0;
        break;

      // 4. 장기 유학/체류
      case "longstay":
        // 높음(2): 가격, 안전성
        clone.price_price = 2;
        clone.basic_safety = 2;
        // 중간(1): 무료 수하물, 좌석 편의성
        clone.service_baggage = 1;
        clone.service_seat = 1;
        // 낮음(0): 기내식, 라운지, 승무원, 인터넷, 정시성, 환경
        clone.service_meal = 0;
        clone.service_lounge = 0;
        clone.service_cabin = 0;
        clone.service_wifi = 0;
        clone.basic_punctuality = 0;
        clone.env_env = 0;
        break;

      // 5. 프리미엄 휴가
      case "premium":
        // 높음(2): 안전성, 좌석 편의성
        clone.basic_safety = 2;
        clone.service_seat = 2;
        // 중간(1): 가격, 기내식, 승무원
        clone.price_price = 1;
        clone.service_meal = 1;
        clone.service_cabin = 1;
        // 낮음(0): 라운지, 무료 수하물, 인터넷, 정시성, 환경
        clone.service_lounge = 0;
        clone.service_baggage = 0;
        clone.service_wifi = 0;
        clone.basic_punctuality = 0;
        clone.env_env = 0;
        break;
    }
    setVars(clone);
  };

  const ranked = useMemo(() => {
    return FLIGHTS.map((f) => {
      const sc = scoreFlight(f, vars, baggageKg);
      return { ...f, score: sc.total, detail: sc.detail };
    }).sort((a, b) => b.score - a.score);
  }, [vars, baggageKg]);

  // -----------------------------
  // 공통 UI
  // -----------------------------
  const BackBar = () => (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-xs sm:text-sm font-medium text-gray-700 hover:shadow-md"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="hidden xs:inline">이전 단계</span>
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {typeof step === 'number' && [1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                n <= step ? "bg-blue-600 w-5 sm:w-8" : "bg-gray-300 w-1.5"
              }`}
            />
          ))}
          {typeof step === 'number' && (
          <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-600">
              {step}/4
          </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep('profile')}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            aria-label="개인 페이지"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
          <button
            onClick={() => setStep('community')}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
            aria-label="커뮤니티"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // ⚠️ 문구 – 페이지 하단, 덜 눈에 띄게
  const Disclaimer = () => (
    <div className="mt-8 sm:mt-10">
      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
        <p className="text-[10px] sm:text-xs text-gray-500 leading-snug">
          <span className="font-semibold">⚠️ 주의:</span>{" "}
          본 사이트는 실제 항공 정보나 추천 모델이 반영되지 않은 시연용 프로토타입으로, 실제 항공편 예약에 사용하면 안 됩니다.
        </p>
      </div>
    </div>
  );

  const Footer = () => (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 sm:py-8 mt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center text-xs sm:text-sm text-gray-600">
          <p className="mb-1.5 sm:mb-2">Made by 장유정</p>
          <p>Designed & Developed by Team HiFly</p>
        </div>
      </div>
    </footer>
  );

  const Page = ({
    title,
    children,
    subtitle,
  }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <BackBar />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-7 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
        <div>{children}</div>
        <Disclaimer />
      </div>
      <Footer />
    </div>
  );

  // -----------------------------
  // ① 출발지/도착지/날짜 선택
  // -----------------------------
  if (step === 1) {
    const getDepartureInfo = (code: string) => {
      const found = AIRPORTS.domestic.find(a => a.code === code);
      return found || { name: "인천", airport: "ICN 인천국제공항" };
    };

    const getDestInfo = (code: string) => {
      const found = AIRPORTS.international.find(a => a.code === code);
      if (found) return found;
      const dest = DESTS.find(d => d.code === code);
      if (dest) {
        return { code: dest.code, name: dest.name.split('–')[1] || dest.name, airport: dest.code };
      }
      return { code: "US-NYC", name: "뉴욕", airport: "NYC 뉴욕공항" };
    };

    const formatDate = (dateStr: string) => {
      if (!dateStr) return "날짜 선택";
      const date = new Date(dateStr);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dayName = days[date.getDay()];
      return `${month}.${day}.${dayName}`;
    };

    const departureInfo = getDepartureInfo(selectedDeparture);
    const destInfo = getDestInfo(selectedDest);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <BackBar />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-7 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ① 항공편 검색
            </h1>
            <p className="text-sm sm:text-lg text-gray-600">출발지, 도착지, 출발 날짜, 인원, 좌석을 선택하여 항공편을 검색하세요</p>
          </div>

          {/* 상단 검색 바 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-8">
            <div className="flex flex-wrap items-stretch gap-2 sm:gap-3">
              {/* 출발지 */}
              <button
                onClick={() => setShowDepartureModal(true)}
                className="flex-1 min-w-[140px] bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4 text-left hover:bg-gray-100 transition-all h-[72px] sm:h-[80px] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-gray-900">{departureInfo.name}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="text-xs sm:text-sm text-blue-600">{departureInfo.airport}</div>
              </button>

              {/* 교환 버튼 */}
              <button
                onClick={() => {
                  const temp = selectedDeparture;
                  setSelectedDeparture(selectedDest);
                  setSelectedDest(temp);
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all self-center"
                aria-label="출발지/도착지 교환"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>

              {/* 도착지 */}
              <button
                onClick={() => setShowDestModal(true)}
                className="flex-1 min-w-[140px] bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4 text-left hover:bg-gray-100 transition-all h-[72px] sm:h-[80px] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-gray-900">{destInfo?.name || "뉴욕"}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="text-xs sm:text-sm text-blue-600">{destInfo?.airport || "NYC 뉴욕공항"}</div>
              </button>

              {/* 날짜 */}
              <button
                onClick={() => setShowDateModal(true)}
                className="flex-1 min-w-[120px] bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4 text-left hover:bg-gray-100 transition-all h-[72px] sm:h-[80px] flex items-center"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm sm:text-base font-bold text-gray-900">{formatDate(date)}</span>
                </div>
              </button>

              {/* 승객 수 */}
              <button
                className="flex-1 min-w-[100px] bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4 text-left hover:bg-gray-100 transition-all h-[72px] sm:h-[80px] flex items-center"
                disabled
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm sm:text-base font-bold text-gray-900">성인 {passengers}명</span>
                </div>
              </button>

              {/* 좌석 등급 */}
              <button
                className="flex-1 min-w-[100px] bg-gray-50 rounded-xl border border-gray-200 p-3 sm:p-4 text-left hover:bg-gray-100 transition-all h-[72px] sm:h-[80px] flex items-center"
                disabled
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="text-sm sm:text-base font-bold text-gray-900">{seatClass}</span>
                </div>
              </button>

              {/* 검색 버튼 */}
              <button
                onClick={() => {
                  if (selectedDeparture && selectedDest && isAllowedDate(date)) {
                    setStep(2);
                  }
                }}
                disabled={!selectedDeparture || !selectedDest || !isAllowedDate(date)}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all ${
                  selectedDeparture && selectedDest && isAllowedDate(date)
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                검색
              </button>
            </div>
          </div>

          {/* 포함 항공사 목록 (뉴욕 선택 시) */}
          {selectedDest === "US-NYC" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-8">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">포함 항공사</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {NYC_AIRLINES.map((airline) => (
                  <div
                    key={airline.code}
                    className="px-3 sm:px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm sm:text-base"
                  >
                    <span className="font-semibold text-gray-900">{airline.nameKo}</span>
                    <span className="text-gray-500 ml-1">({airline.name})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 출발지 선택 모달 */}
          {showDepartureModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setShowDepartureModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">출발지 선택</h2>
                  <button
                    onClick={() => setShowDepartureModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="국가, 도시, 공항명 검색"
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">• 주요 도시</h3>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">최근 검색 도시</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setSelectedDeparture("ICN");
                          setShowDepartureModal(false);
                        }}
                        className="border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-semibold text-gray-900">인천</div>
                        <div className="text-xs text-blue-600">ICN</div>
                      </button>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">국내</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {AIRPORTS.domestic.map((airport) => (
                        <button
                          key={airport.code}
                          onClick={() => {
                            setSelectedDeparture(airport.code);
                            setShowDepartureModal(false);
                          }}
                          className={`border rounded-lg p-3 text-center transition-colors ${
                            selectedDeparture === airport.code
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">{airport.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 도착지 선택 모달 */}
          {showDestModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setShowDestModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">도착지 선택</h2>
                  <button
                    onClick={() => setShowDestModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="국가, 도시, 공항명 검색"
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">• 주요 도시</h3>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">해외</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {AIRPORTS.international.map((airport) => (
                        <button
                          key={airport.code}
                          onClick={() => {
                            setSelectedDest(airport.code);
                            setShowDestModal(false);
                          }}
                          className={`border rounded-lg p-3 text-center transition-colors ${
                            selectedDest === airport.code
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">{airport.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 날짜 선택 모달 */}
          {showDateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setShowDateModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">출발 날짜 선택</h2>
                  <button
                    onClick={() => setShowDateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 sm:p-6">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                    }}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setShowDateModal(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      확인
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Disclaimer />
        </div>
        <Footer />
      </div>
    );
  }

  // -----------------------------
  // ② 여행 상황 선택
  // -----------------------------
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        <BackBar />
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-7 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ② 중요도 설정
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <p className="text-sm sm:text-lg text-gray-600 flex-1">
                여행 상황 카드를 선택하거나, 원하는 상황이 없다면 '직접 맞춤 설정하기' 버튼을 누르세요.
              </p>
              <button
                onClick={() => {
                  // 기본값 설정: 안전성, 가격, 좌석 편의성, 무료 수하물: 높음(2)
                  // 정시성, 환경: 보통(1)
                  // 승무원, 기내식, 인터넷, 라운지: 낮음(0)
                  const newVars = { ...DEFAULT_VARS };
                  newVars.basic_safety = 2; // 안전성: 높음
                  newVars.price_price = 2; // 가격: 높음
                  newVars.service_seat = 2; // 좌석 편의성: 높음
                  newVars.service_baggage = 2; // 무료 수하물: 높음
                  newVars.basic_punctuality = 1; // 정시성: 보통
                  newVars.env_env = 1; // 환경: 보통
                  newVars.service_cabin = 0; // 승무원: 낮음
                  newVars.service_meal = 0; // 기내식: 낮음
                  newVars.service_wifi = 0; // 인터넷: 낮음
                  newVars.service_lounge = 0; // 라운지: 낮음
                  setVars(newVars);
                  setBaggageKg(0);
                  setSelectedSituationKey("custom");
                  setStep(3);
                }}
                className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 text-white text-sm sm:text-base font-semibold hover:shadow-lg transition-all hover:scale-105 whitespace-nowrap"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                직접 맞춤 설정하기
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-2 sm:mb-4">
          {SITUATIONS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => {
                if (s.key === "preset") {
                  const saved = loadPreferences();
                  if (saved) {
                    setVars(saved.vars);
                    setBaggageKg(saved.baggageKg);
                    // 기존 데이터와 새 데이터 형식 병합
                    const mergedDietary = { ...createInitialDietary(), ...saved.dietary };
                    setDietary(mergedDietary);
                    setSelectedSituationKey("preset");
                    setStep(4);
                  } else {
                    alert("저장된 선호 설정이 없습니다. 개인 페이지에서 먼저 설정을 저장해주세요.");
                  }
                } else {
                  applySituation(s.key);
                  setSelectedSituationKey(s.key);
                  setStep(4);
                }
              }}
              className={`group relative rounded-2xl border-2 p-4 sm:p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                i === 0
                  ? "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{s.icon}</div>
              <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                {s.label}
              </div>
              {s.desc && (
                <div className="text-xs sm:text-sm text-gray-600 mb-2">
                  {s.desc}
                </div>
              )}
              {(() => {
                const summary = s.key === "preset" ? getPresetSummary() : getSituationSummary(s.key);
                if (summary.high.length === 0 && summary.low.length === 0) return null;
                return (
                  <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    {summary.high.length > 0 && (
                      <>
                        {summary.high.map((item, idx) => (
                          <span
                            key={`high-${idx}`}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-blue-100 text-blue-700 font-medium"
                          >
                            {item} ↑
                          </span>
                        ))}
                      </>
                    )}
                    {summary.low.length > 0 && (
                      <>
                        {summary.low.map((item, idx) => (
                          <span
                            key={`low-${idx}`}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-gray-100 text-gray-600 font-medium"
                          >
                            {item} ↓
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                );
              })()}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-5 transition-opacity" />
            </button>
          ))}
          </div>
          <Disclaimer />
        </div>
        <Footer />
      </div>
    );
  }

  // -----------------------------
  // ③ 각 요소 직접 설정
  // -----------------------------
  if (step === 3) {
    const setBulk = (catKey: string, level: Level) => {
      const cat = CATEGORIES.find((c) => c.key === catKey)!;
      const clone = { ...vars } as any;
      cat.vars.forEach((v) => {
        clone[v.key] = level;
      });
      setVars(clone);
    };

    const Slider = ({
      vkey,
      label,
      helper,
      special,
    }: {
      vkey: keyof typeof DEFAULT_VARS;
      label: string;
      helper: string;
      special?: "meal" | "baggageKg";
    }) => (
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-gray-900 text-sm sm:text-base">
            {label}
          </div>
          <div className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium">
            {LEVELS[(vars as any)[vkey] as Level]}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={(vars as any)[vkey] as Level}
          onChange={(e) =>
            setVars({
              ...vars,
              [vkey]: Number(e.target.value) as Level,
            })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((vars as any)[vkey] / 2) * 100
            }%, #e5e7eb ${
              ((vars as any)[vkey] / 2) * 100
            }%, #e5e7eb 100%)`,
          }}
        />
        {special === "meal" && (
          <div className="mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              원하는 기내식 옵션을 선택하세요
            </p>
            <div className="space-y-1.5 sm:space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {MEAL_CATEGORIES.map((category) => {
                const isExpanded = expandedMealCategories[category.key] || false;
                const selectedCount = category.meals.filter(meal => dietary[meal.key]).length;
                
                return (
                  <div key={category.key} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedMealCategories({
                          ...expandedMealCategories,
                          [category.key]: !isExpanded,
                        });
                      }}
                      className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <span className="text-sm sm:text-base">{category.icon}</span>
                        <span className="font-semibold text-xs sm:text-sm text-gray-900">
                          {category.name}
                        </span>
                        {selectedCount > 0 && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            {selectedCount}
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="p-2 sm:p-3 bg-white border-t border-gray-200">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                          {category.meals.map((meal) => (
                            <label
                              key={meal.key}
                              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group p-1.5 sm:p-2 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={dietary[meal.key] || false}
                                onChange={(e) => {
                                  setDietary({
                                    ...dietary,
                                    [meal.key]: e.target.checked,
                                  });
                                }}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                              />
                              <span className="text-xs text-gray-700 group-hover:text-blue-600 transition-colors leading-tight">
                                {meal.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {special === "baggageKg" && (
          <div className="mt-3 sm:mt-4 bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
              <span className="text-gray-700">희망 무료 수하물 허용량</span>
              <span className="font-bold text-base sm:text-lg text-blue-600">
                {baggageKg}kg
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={baggageKg}
              onChange={(e) => setBaggageKg(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                  (baggageKg / 40) * 100
                }%, #d1d5db ${
                  (baggageKg / 40) * 100
                }%, #d1d5db 100%)`,
              }}
            />
          </div>
        )}
        <div className="text-[11px] sm:text-xs text-gray-500 mt-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg">
          <strong>📊 포함 데이터:</strong> {helper}
        </div>
      </div>
    );

    return (
      <Page
        title="③ 직접 맞춤 설정하기"
        subtitle="당신이 생각하는 중요도로 각 요소를 직접 설정하세요."
      >
        <div className="mb-6 sm:mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            일반적인 중요도를 반영하여 기본 설정되어 있습니다.
            <br className="hidden sm:block" />
            <span className="sm:ml-1">카테고리 일괄 변경 가능합니다.</span>
          </p>
        </div>
        <div className="space-y-6 sm:space-y-8">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className="bg-white rounded-2xl border-2 border-gray-200 p-5 sm:p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">{cat.icon}</div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">
                    {cat.name}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setBulk(cat.key, 0)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-xs sm:text-sm font-medium"
                  >
                    낮음
                  </button>
                  <button
                    onClick={() => setBulk(cat.key, 1)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs sm:text-sm font-medium"
                  >
                    중간
                  </button>
                  <button
                    onClick={() => setBulk(cat.key, 2)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-50 transition-all text-xs sm:text-sm font-medium"
                  >
                    높음
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {cat.vars.map((v) => (
                  <Slider
                    key={String(v.key)}
                    vkey={v.key}
                    label={v.label}
                    helper={v.helper}
                    special={v.special}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 flex justify-center">
          <button
            onClick={() => {
              setSelectedSituationKey("custom");
              setStep(4);
              window.scrollTo(0, 0);
            }}
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-lg font-bold hover:shadow-2xl transition-all hover:scale-105"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            추천 항공편 보기
          </button>
        </div>
      </Page>
    );
  }

  // -----------------------------
  // ④ 추천 결과
  // -----------------------------
  if (step === 4) {
  // 중요도 시각화 표 컴포넌트
  const ImportanceGraph = ({ vars, situationKey, dietary, baggageKg }: { vars: typeof DEFAULT_VARS; situationKey: string | null; dietary?: Record<string, boolean>; baggageKg?: number }) => {
    // 상황에 맞는 제목 생성
    const getSituationTitle = () => {
      if (!situationKey) return "현재 설정된 중요도";
      if (situationKey === "preset") {
        const preset = SITUATIONS.find(s => s.key === "preset");
        // preset의 label에 이미 아이콘이 포함되어 있음
        return `현재 설정된 '${preset?.label || "⭐ 내 선호 불러오기"}' 중요도`;
      }
      if (situationKey === "custom") return "현재 설정된 '직접 맞춤 설정하기' 중요도";
      const situation = SITUATIONS.find(s => s.key === situationKey);
      if (situation) return `현재 설정된 '${situation.icon}${situation.label}' 중요도`;
      return "현재 설정된 중요도";
    };
    // 모든 요소를 순서대로 배열 (이모티콘 포함)
    const allElements = [
      { key: "price_price" as keyof typeof DEFAULT_VARS, label: "가격", icon: "💰" },
      { key: "basic_safety" as keyof typeof DEFAULT_VARS, label: "안전성", icon: "🛡️" },
      { key: "basic_punctuality" as keyof typeof DEFAULT_VARS, label: "정시성", icon: "⏰" },
      { key: "service_cabin" as keyof typeof DEFAULT_VARS, label: "승무원", icon: "👨‍✈️" },
      { key: "service_meal" as keyof typeof DEFAULT_VARS, label: "기내식", icon: "🍽️" },
      { key: "service_baggage" as keyof typeof DEFAULT_VARS, label: "무료 수하물", icon: "🧳" },
      { key: "service_lounge" as keyof typeof DEFAULT_VARS, label: "라운지", icon: "🏛️" },
      { key: "service_wifi" as keyof typeof DEFAULT_VARS, label: "무료 인터넷", icon: "📶" },
      { key: "service_seat" as keyof typeof DEFAULT_VARS, label: "좌석 편의성", icon: "💺" },
      { key: "env_env" as keyof typeof DEFAULT_VARS, label: "환경", icon: "🌱" },
    ];

    const getLevelStyle = (level: Level) => {
      if (level === 2) {
        return {
          bgColor: "bg-blue-600",
          arrow: "↑",
        };
      } else if (level === 1) {
        return {
          bgColor: "bg-blue-400",
          arrow: "-",
        };
      } else {
        return {
          bgColor: "bg-blue-100",
          arrow: "↓",
        };
      }
    };

    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm mb-6 sm:mb-8 overflow-x-auto">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {getSituationTitle()}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            오른쪽 '중요도 변경' 버튼을 클릭하여 추가 변경 가능합니다.
          </p>
        </div>
        <div className="min-w-full">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr>
                {allElements.map((elem) => (
                  <th
                    key={elem.key}
                    className="border border-gray-300 bg-gray-50 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 text-center w-[10%]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base sm:text-lg">{elem.icon}</span>
                      <span>{elem.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {allElements.map((elem) => {
                  const level = vars[elem.key] as Level;
                  const style = getLevelStyle(level);
                  return (
                    <td
                      key={elem.key}
                      className={`border border-gray-300 ${style.bgColor} px-2 sm:px-3 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm transition-colors duration-300 w-[10%]`}
                    >
                      <span className="text-black">{style.arrow}</span>
                    </td>
                  );
                })}
              </tr>
              {/* 선택한 기내식 옵션 및 무료 수하물 허용량 표시 */}
              {(dietary || (baggageKg && baggageKg > 0)) && (
                <tr>
                  {allElements.map((elem) => {
                    if (elem.key === "service_meal" && dietary) {
                      // 선택한 기내식 옵션
                      const selectedMeals: string[] = [];
                      MEAL_CATEGORIES.forEach(category => {
                        category.meals.forEach(meal => {
                          if (dietary[meal.key]) {
                            selectedMeals.push(meal.label);
                          }
                        });
                      });
                      
                      return (
                        <td
                          key={elem.key}
                          className="border border-gray-300 bg-white px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm w-[10%]"
                        >
                          {selectedMeals.length > 0 ? (
                            <div className="flex flex-col gap-1 items-center">
                              {selectedMeals.slice(0, 2).map((meal, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium whitespace-nowrap">
                                  {meal}
                                </span>
                              ))}
                              {selectedMeals.length > 2 && (
                                <span className="text-gray-500 text-xs">+{selectedMeals.length - 2}개</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      );
                    } else if (elem.key === "service_baggage" && baggageKg && baggageKg > 0) {
                      // 무료 수하물 허용량
                      return (
                        <td
                          key={elem.key}
                          className="border border-gray-300 bg-white px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm w-[10%]"
                        >
                          <span className="font-semibold text-blue-600">{baggageKg}kg 이상</span>
                        </td>
                      );
                    } else {
                      return (
                        <td
                          key={elem.key}
                          className="border border-gray-300 bg-white px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm w-[10%]"
                        >
                          <span className="text-gray-400">-</span>
                        </td>
                      );
                    }
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const setBulk = (catKey: string, level: Level) => {
    const cat = CATEGORIES.find((c) => c.key === catKey)!;
    const clone = { ...vars } as any;
    cat.vars.forEach((v) => {
      clone[v.key] = level;
    });
    setVars(clone);
  };

  const Slider = ({
    vkey,
    label,
    helper,
    special,
  }: {
    vkey: keyof typeof DEFAULT_VARS;
    label: string;
    helper: string;
    special?: "meal" | "baggageKg";
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="font-semibold text-gray-900 text-xs sm:text-sm">
          {label}
        </div>
        <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
          {LEVELS[(vars as any)[vkey] as Level]}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={(vars as any)[vkey] as Level}
        onChange={(e) =>
          setVars({
            ...vars,
            [vkey]: Number(e.target.value) as Level,
          })
        }
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
            ((vars as any)[vkey] / 2) * 100
          }%, #e5e7eb ${
            ((vars as any)[vkey] / 2) * 100
          }%, #e5e7eb 100%)`,
        }}
      />
      {special === "meal" && (
        <div className="mt-3 sm:mt-4 space-y-2">
          {MEAL_CATEGORIES.map((category) => {
            const isExpanded = expandedMealCategories[category.key] || false;
            const selectedCount = category.meals.filter(meal => dietary[meal.key]).length;
            
            return (
              <div key={category.key} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setExpandedMealCategories({
                      ...expandedMealCategories,
                      [category.key]: !isExpanded,
                    });
                  }}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-base sm:text-lg">{category.icon}</span>
                    <span className="font-semibold text-xs sm:text-sm text-gray-900">
                      {category.name}
                    </span>
                    {selectedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {selectedCount}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {category.meals.map((meal) => (
                        <label
                          key={meal.key}
                          className="flex items-center gap-2 cursor-pointer group p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={dietary[meal.key] || false}
                            onChange={(e) => {
                              setDietary({
                                ...dietary,
                                [meal.key]: e.target.checked,
                              });
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-xs text-gray-700 group-hover:text-blue-600 transition-colors">
                            {meal.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {special === "baggageKg" && (
        <div className="mt-3 sm:mt-4 bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
            <span className="text-gray-700">희망 무료 수하물 허용량</span>
            <span className="font-bold text-base sm:text-lg text-blue-600">
              {baggageKg}kg
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={baggageKg}
            onChange={(e) => setBaggageKg(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                (baggageKg / 40) * 100
              }%, #d1d5db ${
                (baggageKg / 40) * 100
              }%, #d1d5db 100%)`,
            }}
          />
        </div>
      )}
      <div className="text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-3 p-2 sm:p-2.5 bg-gray-50 rounded-lg">
        <strong>📊 포함 데이터:</strong> {helper}
      </div>
    </div>
  );

const top3 = ranked.slice(0, 3);
return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* 큰 화면에서는 상단에 BackBar, 작은 화면에서는 하단에 */}
      <div className="hidden lg:block">
        <BackBar />
      </div>
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col lg:flex-row relative min-h-0">
        {/* 메인 콘텐츠 영역 - 작은 화면에서 위에 */}
        <div className={`flex-1 transition-all duration-300 min-w-0 order-1 lg:order-1 ${sidebarOpen ? 'lg:pr-0' : ''}`}>
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
            <div className="mb-7 sm:mb-10 flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ④ 추천 항공편 결과
                </h1>
                <p className="text-sm sm:text-lg text-gray-600">설정하신 중요도를 반영한 당신의 맞춤형 항공편 추천 결과입니다</p>
                {!sidebarOpen && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">'중요도 변경' 버튼을 클릭하여 추가 조정을 해보세요</p>
                )}
              </div>
              {!sidebarOpen && (
                <button
                  onClick={() => {
                    setSidebarOpen(true);
                    // 사이드바가 열릴 때 상단으로 스크롤
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        if (sidebarRef.current) {
                          sidebarRef.current.scrollTop = 0;
                        }
                      }, 50);
                      setTimeout(() => {
                        if (sidebarRef.current) {
                          sidebarRef.current.scrollTop = 0;
                        }
                      }, 150);
                    });
                  }}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 text-white text-sm sm:text-base font-semibold hover:shadow-lg transition-all hover:scale-105"
                  aria-label="중요도 변경"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  중요도 변경
                </button>
              )}
            </div>
            {/* 중요도 시각화 그래프 */}
            <ImportanceGraph vars={vars} situationKey={selectedSituationKey} dietary={dietary} baggageKg={baggageKg} />
            <div className="space-y-6">
{top3.map((f, idx) => {
const meta = airlineMeta(f.airline);
const score100 = Math.round(f.score * 10);
const reason = reasonTextBiz(f, vars, f.detail);
const rows = buildDetailRows(f, f.detail, dietary, baggageKg);
const tags = [
meta.fscOrLcc,
meta.alliance,
co2Tag(f),
...meta.tags,
].filter(Boolean);
const isOpen = !!expanded[f.code];
     return (
          <div
            key={f.code}
            className="group relative bg-white rounded-2xl border-2 border-gray-200 p-7 hover:border-blue-300 hover:shadow-2xl transition-all duration-300"
          >
            {/* 순위 배지 */}
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
              {rankEmoji(idx)}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {f.airline}{" "}
                  <span className="text-gray-500 text-lg">
                    {f.code}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 border border-gray-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* 점수 표시 */}
              <div className="shrink-0 text-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-5xl font-black leading-none mb-1">
                  {score100}
                </div>
                <div className="text-xs font-medium opacity-90">
                  총점
                </div>
              </div>
            </div>

            {/* 항공편 정보 */}
            <div className="mt-5 p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-sm">
                <div className="font-semibold text-gray-900">
                  <div className="text-xs text-gray-500 mb-1">
                    출발 → 도착
                  </div>
                  <div className="text-base">
                    {f.depart} → {f.arrive}
                  </div>
                </div>
                <div className="text-gray-700">
                  <div className="text-xs text-gray-500 mb-1">
                    비행 정보
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        f.nonstop
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {f.nonstop ? "직항" : "경유"}
                    </span>
                    <span>{durationHuman(f.duration)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">
                    예상 요금
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    ₩{KRW(f.price)}~
                  </div>
                  <button
                    onClick={() =>
                      alert("예약 페이지는 준비 중입니다")
                    }
                    className="mt-2 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-105"
                  >
                    예약하기
                  </button>
                </div>
              </div>
            </div>

            {/* 추천 이유 */}
            <div className="mt-5 p-5 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-sm font-semibold text-blue-900 mb-2">
                📝 추천 이유
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {reason}
              </p>
            </div>

            {/* 세부 점수 아코디언 */}
            <div className="mt-5">
              <button
                onClick={() =>
                  setExpanded({
                    ...expanded,
                    [f.code]: !isOpen,
                  })
                }
                className="w-full flex items-center justify-between px-5 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-gray-50 transition-all text-left font-semibold"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  요소별 세부 점수 보기
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isOpen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm animate-fadeIn">
                  {rows.map((r) => (
                    <div
                      key={r.title}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all"
                    >
                      <div className="font-bold text-gray-900 mb-2">
                        {r.title}
                      </div>
                      <div className="text-gray-700 mb-2">
                        {r.text}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 inline-block">
                        {r.meta}
                      </div>
                      {/* 선택한 기내식 옵션 표시 */}
                      {r.title === "기내식 서비스 품질" && r.selectedMeals && r.selectedMeals.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs font-semibold text-gray-700 mb-1.5">
                            선택한 기내식 옵션:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {r.selectedMeals.map((meal, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
                              >
                                {meal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* 선택한 무료 수하물 허용량 표시 */}
                      {r.title === "무료 수하물 허용량" && r.requestedBaggageKg && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs font-semibold text-gray-700">
                            요청한 무료 수하물 허용량: <span className="text-blue-600 font-bold">{r.requestedBaggageKg}kg 이상</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 진행률 바 */}
            <div className="mt-6">
              <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden shadow-inner">
                <div
                  className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${Math.min(100, score100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
            </div>
            <Disclaimer />
          </div>
        </div>

        {/* 사이드탭 - 작은 화면에서는 fixed 모달, 큰 화면에서는 오른쪽 */}
        <div
          ref={sidebarRef}
          className={`${
            sidebarOpen 
              ? 'fixed lg:fixed' 
              : 'hidden lg:hidden'
          } lg:sticky top-0 right-0 h-screen lg:h-screen lg:max-h-screen bg-white border-l border-gray-200 shadow-2xl z-40 transition-all duration-300 overflow-y-auto flex-shrink-0 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } ${sidebarOpen ? 'w-full sm:w-96 lg:w-80 xl:w-96' : 'w-0 lg:w-0'}`}
          style={sidebarOpen && step === 4 ? { scrollBehavior: 'auto' } : undefined}
        >
          <div className="p-3 sm:p-4 pt-8 sm:pt-8 lg:pt-4 h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 sm:mb-5 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                중요도 변경
              </h2>
      <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="사이드탭 닫기"
      >
        <svg
                  className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
                    d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              중요도 변경 시 실시간으로 반영됩니다
            </p>
            <div className="space-y-4 sm:space-y-5">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  className="bg-white rounded-xl border-2 border-gray-200 p-3 sm:p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="text-xl sm:text-2xl flex-shrink-0">{cat.icon}</div>
                      <div className="text-sm sm:text-base font-bold text-gray-900">
                        {cat.name}
                      </div>
                    </div>
                    <div className="flex flex-nowrap gap-1.5 sm:gap-1.5 w-full">
                      <button
                        onClick={() => setBulk(cat.key, 0)}
                        className="flex-1 px-2 py-1.5 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-xs font-medium whitespace-nowrap"
                      >
                        낮음
                      </button>
                      <button
                        onClick={() => setBulk(cat.key, 1)}
                        className="flex-1 px-2 py-1.5 rounded-lg border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs font-medium whitespace-nowrap"
                      >
                        중간
                      </button>
                      <button
                        onClick={() => setBulk(cat.key, 2)}
                        className="flex-1 px-2 py-1.5 rounded-lg border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-50 transition-all text-xs font-medium whitespace-nowrap"
                      >
                        높음
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:gap-5">
                    {cat.vars.map((v) => (
                      <Slider
                        key={String(v.key)}
                        vkey={v.key}
                        label={v.label}
                        helper={v.helper}
                        special={v.special}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* 작은 화면에서는 하단에 BackBar */}
      <div className="lg:hidden order-3">
        <BackBar />
      </div>
      <Footer />
    </div>
  );
  }

  // -----------------------------
  // 개인 페이지
  // -----------------------------
  if (step === 'profile') {

    const setBulk = (catKey: string, level: Level) => {
      const cat = CATEGORIES.find((c) => c.key === catKey)!;
      const clone = { ...profileVars } as any;
      cat.vars.forEach((v) => {
        clone[v.key] = level;
      });
      setProfileVars(clone);
    };

    const Slider = ({
      vkey,
      label,
      helper,
      special,
    }: {
      vkey: keyof typeof DEFAULT_VARS;
      label: string;
      helper: string;
      special?: "meal" | "baggageKg";
    }) => (
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-gray-900 text-sm sm:text-base">
            {label}
          </div>
          <div className="px-2.5 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium">
            {LEVELS[(profileVars as any)[vkey] as Level]}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={(profileVars as any)[vkey] as Level}
          onChange={(e) =>
            setProfileVars({
              ...profileVars,
              [vkey]: Number(e.target.value) as Level,
            })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              ((profileVars as any)[vkey] / 2) * 100
            }%, #e5e7eb ${
              ((profileVars as any)[vkey] / 2) * 100
            }%, #e5e7eb 100%)`,
          }}
        />
        {special === "meal" && (
          <div className="mt-3 sm:mt-4 space-y-2">
            {MEAL_CATEGORIES.map((category) => {
              const isExpanded = profileExpandedMealCategories[category.key] || false;
              const selectedCount = category.meals.filter(meal => profileDietary[meal.key]).length;
              
              return (
                <div key={category.key} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileExpandedMealCategories({
                        ...profileExpandedMealCategories,
                        [category.key]: !isExpanded,
                      });
                    }}
                    className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-base sm:text-lg">{category.icon}</span>
                      <span className="font-semibold text-sm sm:text-base text-gray-900">
                        {category.name}
                      </span>
                      {selectedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {selectedCount}개 선택
                        </span>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {category.meals.map((meal) => (
                          <label
                            key={meal.key}
                            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={profileDietary[meal.key] || false}
                              onChange={(e) => {
                                setProfileDietary({
                                  ...profileDietary,
                                  [meal.key]: e.target.checked,
                                });
                              }}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs sm:text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                              {meal.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {special === "baggageKg" && (
          <div className="mt-3 sm:mt-4 bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
              <span className="text-gray-700">희망 무료 수하물 허용량</span>
              <span className="font-bold text-base sm:text-lg text-blue-600">
                {profileBaggageKg}kg
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={profileBaggageKg}
              onChange={(e) => setProfileBaggageKg(Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                  (profileBaggageKg / 40) * 100
                }%, #d1d5db ${
                  (profileBaggageKg / 40) * 100
                }%, #d1d5db 100%)`,
              }}
            />
          </div>
        )}
        <div className="text-[11px] sm:text-xs text-gray-500 mt-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg">
          <strong>📊 포함 데이터:</strong> {helper}
        </div>
      </div>
    );

    const handleSavePreferences = () => {
      savePreferences(profileVars, profileBaggageKg, profileDietary);
      alert('선호 설정이 저장되었습니다!');
    };

    return (
      <Page
        title="개인 페이지"
        subtitle="내 선호 설정 및 리뷰 관리"
      >
        <div className="max-w-4xl mx-auto">
          {/* 탭 메뉴 */}
          <div className="flex gap-2 mb-6 sm:mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-all ${
                activeTab === 'preferences'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              내 선호 입력하기
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base transition-all ${
                activeTab === 'review'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              리뷰 남기기
            </button>
          </div>

          {/* 내 선호 입력하기 */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 sm:space-y-8">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-5 sm:p-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="text-2xl sm:text-3xl">{cat.icon}</div>
                      <div className="text-lg sm:text-xl font-bold text-gray-900">
                        {cat.name}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <button
                        onClick={() => setBulk(cat.key, 0)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-xs sm:text-sm font-medium"
                      >
                        낮음
                      </button>
                      <button
                        onClick={() => setBulk(cat.key, 1)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs sm:text-sm font-medium"
                      >
                        중간
                      </button>
                      <button
                        onClick={() => setBulk(cat.key, 2)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-50 transition-all text-xs sm:text-sm font-medium"
                      >
                        높음
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                    {cat.vars.map((v) => (
                      <Slider
                        key={String(v.key)}
                        vkey={v.key}
                        label={v.label}
                        helper={v.helper}
                        special={v.special}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-8 sm:mt-10 flex justify-center">
                <button
                  onClick={handleSavePreferences}
                  className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-lg font-bold hover:shadow-2xl transition-all hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  저장하기
                </button>
              </div>
            </div>
          )}

          {/* 리뷰 남기기 */}
          {activeTab === 'review' && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">리뷰를 작성하려면 아래 버튼을 클릭하세요.</p>
              <button
                onClick={() => setStep('review')}
                className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-lg font-bold hover:shadow-2xl transition-all hover:scale-105"
              >
                리뷰 작성하기
              </button>
            </div>
          )}

        </div>
      </Page>
    );
  }

  // -----------------------------
  // 리뷰 페이지
  // -----------------------------
  if (step === 'review') {

    const handleSubmitReview = () => {
      if (!airline || !route || !reviewText) {
        alert('모든 필드를 입력해주세요.');
        return;
      }
      // 여기서는 alert로만 표시, 실제로는 서버에 저장
      alert(`리뷰가 제출되었습니다!\n항공사: ${airline}\n노선: ${route}\n별점: ${rating}/5\n후기: ${reviewText}`);
      // 제출 후 초기화
      setAirline('');
      setRoute('');
      setRating(5);
      setReviewText('');
    };

    return (
      <Page
        title="리뷰 남기기"
        subtitle="항공편 경험을 공유해주세요"
      >
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                항공사
              </label>
              <input
                type="text"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                placeholder="예: Korean Air"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                노선
              </label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="예: ICN → NYC"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                별점
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl sm:text-4xl transition-all ${
                      star <= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    } hover:scale-110`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-sm sm:text-base text-gray-600">
                  {rating}/5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                후기
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="항공편 경험을 자유롭게 작성해주세요..."
                rows={6}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 sm:gap-4 pt-4">
              <button
                onClick={() => setStep('profile')}
                className="flex-1 px-4 sm:px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-sm sm:text-base font-semibold transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-base font-bold hover:shadow-lg transition-all hover:scale-105"
              >
                제출하기
              </button>
            </div>
          </div>
    </div>
  </Page>
);
}

  // -----------------------------
  // 커뮤니티 페이지
  // -----------------------------
  if (step === 'community') {
    const sampleReviews = [
      {
        airline: "Korean Air KE081",
        route: "ICN → JFK",
        rating: 5,
        text: "장거리 비행이었는데 좌석이 넓고 편안했어요. 기내식도 맛있고 승무원 서비스도 훌륭했습니다. 특히 정시 출발과 도착이 인상적이었습니다.",
        author: "익명 사용자",
        date: "2024.12.15"
      },
      {
        airline: "Asiana Airlines OZ221",
        route: "ICN → JFK",
        rating: 4,
        text: "직항편이라 편리했고, 수하물 허용량도 충분했습니다. 다만 좌석이 조금 좁았던 게 아쉬웠어요.",
        author: "익명 사용자",
        date: "2024.12.10"
      },
      {
        airline: "Qatar Airways QR859",
        route: "ICN → JFK (경유)",
        rating: 5,
        text: "경유편이었지만 도하 공항 라운지가 정말 훌륭했어요. Qsuite 비즈니스 클래스는 최고였습니다. 서비스 품질이 정말 우수했습니다.",
        author: "익명 사용자",
        date: "2024.12.08"
      }
    ];

    return (
      <Page
        title="커뮤니티"
        subtitle="다른 여행자들의 항공편 리뷰를 확인하고 공유해보세요"
      >
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 sm:space-y-8 py-8">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">항공편 리뷰 공유</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                다른 여행자들이 공유한 항공편 리뷰를 확인하고, 여러분의 경험도 공유해보세요.
              </p>
              
              {/* 샘플 리뷰 목록 */}
              <div className="space-y-4">
                {sampleReviews.map((review, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900">{review.airline}</span>
                          <span className="text-xs text-gray-500">{review.route}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= review.rating ? "text-yellow-400 text-sm" : "text-gray-300 text-sm"}>★</span>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">{review.rating}.0</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {review.text}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">작성자: {review.author}</span>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStep('review')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-base font-bold hover:shadow-2xl transition-all hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  내 리뷰 작성하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </Page>
    );
  }

return null;
}