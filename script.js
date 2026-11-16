(() => {
  const doc = document.documentElement;
  doc.classList.add("js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header: solid after hero ---------- */
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const setHeader = () => {
    const limit = hero ? hero.offsetHeight - 120 : 40;
    header.classList.toggle("is-solid", window.scrollY > limit);
  };
  window.addEventListener("scroll", setHeader, { passive: true });
  setHeader();

  /* ---------- full-screen menu ---------- */
  const menuBtn = document.querySelector(".menu-btn");
  const menu = document.getElementById("menu");
  const closeMenu = () => {
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "전체 메뉴 열기");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 350);
  };
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") === "true";
    if (open) { closeMenu(); menuBtn.focus(); return; }
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add("is-open"));
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "전체 메뉴 닫기");
    document.body.classList.add("menu-open");
    menu.querySelector("a").focus();
  });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { closeMenu(); menuBtn.focus(); }
  });

  /* ---------- hero: sheets rising like panes on the line ---------- */
  const slides = [...document.querySelectorAll(".slide")];
  const STRIPS = 5;
  slides.forEach((slide) => {
    const wrap = document.createElement("div");
    wrap.className = "strips";
    for (let i = 0; i < STRIPS; i++) {
      const s = document.createElement("div");
      s.className = "strip";
      s.style.setProperty("--i", i);
      s.style.setProperty("--p", `${(i / (STRIPS - 1)) * 100}%`);
      s.style.backgroundImage = `url("${slide.dataset.img}")`;
      wrap.appendChild(s);
    }
    slide.appendChild(wrap);
  });

  const caption = document.querySelector(".hero-caption");
  const cur = document.querySelector(".hero-count .cur");
  document.querySelector(".hero-count .tot").textContent = String(slides.length).padStart(2, "0");
  const bar = document.querySelector(".hero-progress i");
  const DURATION = 6500;
  let index = 0;
  let timer = null;
  let busy = false;

  const runBar = () => {
    bar.classList.remove("run");
    void bar.offsetWidth;
    if (!reduce) { bar.style.setProperty("--dur", DURATION + "ms"); bar.classList.add("run"); }
  };

  const go = (next) => {
    if (busy || next === index) return;
    busy = true;
    const from = slides[index];
    const to = slides[(next + slides.length) % slides.length];
    index = (next + slides.length) % slides.length;

    slides.forEach((s) => s.classList.remove("is-leaving"));
    from.classList.remove("is-active");
    from.classList.add("is-leaving");
    to.classList.add("is-active", "is-entering");

    caption.textContent = to.dataset.caption;
    cur.textContent = String(index + 1).padStart(2, "0");
    runBar();

    const done = () => {
      to.classList.remove("is-entering");
      from.classList.remove("is-leaving");
      busy = false;
    };
    setTimeout(done, reduce ? 0 : 1500);
  };

  const schedule = () => {
    clearInterval(timer);
    if (reduce) return;
    timer = setInterval(() => go(index + 1), DURATION);
  };
  document.querySelector(".hero-btn.next").addEventListener("click", () => { go(index + 1); schedule(); });
  document.querySelector(".hero-btn.prev").addEventListener("click", () => { go(index - 1); schedule(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearInterval(timer); else schedule(); });

  // first paint: wait for the first image, then play the single load sequence
  const first = new Image();
  const start = () => {
    doc.classList.add("is-loaded");
    slides[0].classList.add("is-entering");
    setTimeout(() => slides[0].classList.remove("is-entering"), 1500);
    runBar();
    schedule();
  };
  first.onload = first.onerror = start;
  first.src = slides[0].dataset.img;
  setTimeout(() => { if (!doc.classList.contains("is-loaded")) start(); }, 2500);

  /* ---------- product explorer ---------- */
  const NS = "http://www.w3.org/2000/svg";
  const P = {
    tempered: {
      std: "KS L 2002",
      title: "강화유리",
      desc: "판유리를 500~600℃ 이상으로 가열한 뒤 급랭해 만든 안전유리입니다. 일반 유리보다 약 5배 이상 충격에 강하고, 한계를 넘는 충격에 깨지더라도 끝이 날카롭지 않은 작은 입자로 부서져 파편 피해를 줄입니다.",
      points: ["일반 유리 대비 약 5배 이상의 내충격 강도", "파손 시 작은 입자로 부서져 상해 위험이 적음", "뜨거운 열과 급격한 온도 변화에 강함", "최대 3,000 × 6,500mm까지 강화 가공"],
      uses: "커튼월 유리창, 샤워부스·욕실 칸막이, 난간·계단·발코니, 상업·업무·공공시설의 실내 파티션",
      draw: "tempered",
    },
    hs: {
      std: "KS L 2015",
      title: "배강도유리",
      desc: "강화유리보다 천천히 냉각해 강도를 높인 열처리 유리입니다. 일반 판유리보다 강하고, 깨지더라도 큰 조각으로 금이 가 틀에서 쉽게 떨어지지 않습니다.",
      points: ["강화유리보다 평탄도가 좋아 반사상 왜곡이 적음", "파손 시 파편이 틀에 남아 낙하 위험이 낮음", "자연 파손(자파) 우려가 낮음", "접합유리 원판으로 함께 사용"],
      uses: "고층 건물 외벽, 커튼월, 접합유리 원판",
      draw: "hs",
    },
    laminated: {
      std: "KS L 2004",
      title: "접합유리",
      desc: "두 장 이상의 판유리 사이에 투명하고 접착력이 강한 PVB 필름을 넣고, 진공 상태에서 공기를 완전히 뺀 뒤 온도와 압력을 높여 밀착시킨 유리입니다. 필름이 충격을 흡수하고, 깨지더라도 파편을 붙잡아 줍니다.",
      points: ["충격 흡수력이 높아 쉽게 파손되지 않음", "파손돼도 필름이 파편 비산을 막음", "충격물이 관통하지 않아 도난 방지에 유리", "필름의 차음 효과로 조용한 실내", "후판 라미라이트 생산 가능, 기포·굴곡 없는 투시"],
      uses: "천창, 건물 간 연결통로, 쇼윈도·진열장, 위험물 취급소와 비상통로 감시창, 박물관·귀금속 진열장, 대형 수족관",
      draw: "laminated",
    },
    igu: {
      std: "KS L 2003",
      title: "복층유리",
      desc: "두 장 또는 세 장의 판유리 사이에 스페이서(간봉)를 두어 건조한 공기층이나 가스층을 만든 에너지 절감형 유리입니다. 유리 종류, 간봉의 재질과 폭, 충전 기체에 따라 다양하게 구성합니다.",
      points: ["실외로 빠져나가는 열을 줄여 단열 성능 향상", "실내외 온도 차를 줄여 결로 저감", "소음 차단으로 조용한 실내 환경", "아르곤 가스주입 단열유리 단체표준 인증"],
      uses: "주택·아파트 창문, 사무실·상업용 빌딩, 고층 건물 외벽, 냉장고 유리문",
      draw: "igu",
    },
    heatsoak: {
      std: "단체표준 인증 · 2024.12",
      title: "힛속(Heat Soak) 처리",
      desc: "강화유리를 챔버에서 일정 온도로 장시간 가열해, 내부 불순물(황화니켈) 때문에 깨질 가능성이 있는 유리를 출하 전에 걸러내는 공정입니다. 설치 후 자연 파손(자파) 위험을 크게 줄입니다.",
      points: ["출하 전 자파 가능성이 있는 유리 선별", "교체가 어려운 고층 외벽·천창에 권장", "2024년 힛속 심사 테스트 통과"],
      uses: "커튼월, 천창, 고층 외벽, 공공시설의 대형 유리",
      draw: "heatsoak",
    },
  };

  const svg = document.getElementById("section-svg");
  const el = (name, attrs = {}, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const defs = () => {
    const d = el("defs", {}, svg);
    const g = el("linearGradient", { id: "glass", x1: "0", x2: "1" }, d);
    el("stop", { offset: "0", "stop-color": "#a9d4c6" }, g);
    el("stop", { offset: ".5", "stop-color": "#d9eee7" }, g);
    el("stop", { offset: "1", "stop-color": "#9fcbbd" }, g);
    const pat = el("pattern", { id: "gas", width: "10", height: "10", patternUnits: "userSpaceOnUse" }, d);
    el("circle", { cx: "5", cy: "5", r: "1.3", fill: "#7fb7a5" }, pat);
  };
  const pane = (x, w, parent, y = 40, h = 280) =>
    el("rect", { x, y, width: w, height: h, fill: "url(#glass)", stroke: "#5f9c89", "stroke-width": 1.2 }, parent);
  const label = (x1, y1, ty, text, sub, parent) => {
    const g = el("g", {}, parent);
    el("path", { class: "leader", d: `M${x1} ${y1} H${370} L${386} ${ty}` }, g);
    el("circle", { cx: x1, cy: y1, r: 3, fill: "#0f2233" }, g);
    const t = el("text", { x: 394, y: ty + 5, class: "lbl" }, g);
    t.textContent = text;
    if (sub) { const s = el("text", { x: 394, y: ty + 28, class: "lbl lbl-sub" }, g); s.textContent = sub; }
    return g;
  };
  const layer = (dx = 0) => { const g = el("g", { class: "layer" }, svg); g.dataset.dx = dx; return g; };

  const drawers = {
    tempered() {
      const g = layer(0);
      pane(150, 34, g);
      // stress profile: compression at surfaces, tension in the core
      const s = layer(0);
      el("path", { d: "M150 330 L150 340 L184 340 L184 330", stroke: "#56636e", fill: "none" }, s);
      el("path", { d: "M150 352 Q167 312 184 352", stroke: "#0b5cad", "stroke-width": 2, fill: "rgba(11,92,173,.12)" }, s);
      label(184, 80, 70, "강화유리 1장", "500~600℃ 가열 후 급랭", g);
      label(152, 150, 150, "표면 압축응력층", "충격을 버티는 단단한 겉면", s);
      label(167, 230, 230, "내부 인장응력층", "깨질 때 잘게 부서지게 함", s);
    },
    hs() {
      const g = layer(0);
      pane(150, 34, g);
      const s = layer(0);
      el("path", { d: "M150 352 Q167 332 184 352", stroke: "#0b5cad", "stroke-width": 2, fill: "rgba(11,92,173,.12)" }, s);
      label(184, 80, 80, "배강도유리 1장", "가열 후 천천히 냉각", g);
      label(167, 200, 190, "완만한 응력 분포", "강화유리보다 응력이 낮음", s);
    },
    laminated() {
      const a = layer(-24); pane(120, 30, a);
      const f = layer(0); el("rect", { x: 152, y: 40, width: 9, height: 280, fill: "#8fbde3", stroke: "#4a86bf" }, f);
      const b = layer(24); pane(163, 30, b);
      label(135, 70, 60, "판유리 (실외측)", "Outboard lite", a);
      label(156, 160, 160, "PVB 필름", "충격 흡수 · 파편 비산 방지", f);
      label(178, 260, 260, "판유리 (실내측)", "Inboard lite", b);
    },
    igu() {
      const a = layer(-24); pane(100, 26, a);
      const gap = layer(0);
      el("rect", { x: 128, y: 58, width: 68, height: 244, fill: "url(#gas)" }, gap);
      el("rect", { x: 128, y: 40, width: 68, height: 18, fill: "#46535e" }, gap);
      el("rect", { x: 128, y: 302, width: 68, height: 18, fill: "#46535e" }, gap);
      const b = layer(24); pane(198, 26, b);
      label(113, 80, 50, "판유리 (실외측)", "로이유리 적용 가능", a);
      label(162, 49, 130, "스페이서(간봉)", "건조제가 습기를 흡수", gap);
      label(162, 200, 210, "중공층", "건조 공기 또는 아르곤(Ar) 가스", gap);
      label(211, 290, 290, "판유리 (실내측)", "", b);
    },
    heatsoak() {
      const c = layer(0);
      el("rect", { x: 60, y: 30, width: 260, height: 300, fill: "rgba(255,255,255,.55)", stroke: "#56636e", "stroke-dasharray": "6 5" }, c);
      const r = layer(0);
      [100, 150, 200, 250].forEach((x) => pane(x, 14, r, 70, 220));
      el("rect", { x: 86, y: 292, width: 196, height: 8, fill: "#46535e" }, r);
      const h = layer(0);
      [110, 175, 240].forEach((x) =>
        el("path", { d: `M${x} 322 q8 -7 0 -14 q-8 -7 0 -14`, stroke: "#b08a2e", "stroke-width": 2, fill: "none" }, h));
      label(320, 50, 50, "힛속 챔버", "일정 온도로 장시간 가열", c);
      label(264, 150, 150, "강화유리 (랙 적재)", "자파 가능 유리는 챔버 안에서 파손", r);
      label(240, 300, 260, "가열 유지 구간", "출하 전 선별 완료", h);
    },
  };

  const panel = document.getElementById("panel");
  const f = {
    std: document.getElementById("p-std"), title: document.getElementById("p-title"),
    desc: document.getElementById("p-desc"), points: document.getElementById("p-points"),
    uses: document.getElementById("p-uses"),
  };
  const render = (key, animate) => {
    const d = P[key];
    const apply = () => {
      f.std.textContent = d.std; f.title.textContent = d.title; f.desc.textContent = d.desc;
      f.points.innerHTML = ""; d.points.forEach((p) => { const li = document.createElement("li"); li.textContent = p; f.points.appendChild(li); });
      f.uses.textContent = d.uses;
      panel.classList.remove("is-swapping");
    };
    svg.querySelectorAll(":scope > :not(title)").forEach((n) => n.remove());
    defs();
    drawers[d.draw]();
    svg.setAttribute("aria-label", `${d.title} 단면 구조도`);
    if (animate && !reduce) {
      const layers = svg.querySelectorAll(".layer");
      layers.forEach((g, i) => { g.style.transform = `translateX(${g.dataset.dx * 3 || (i % 2 ? 30 : -30)}px)`; g.style.opacity = "0"; });
      requestAnimationFrame(() => requestAnimationFrame(() =>
        layers.forEach((g) => { g.style.transform = "translateX(0)"; g.style.opacity = "1"; })));
      panel.classList.add("is-swapping");
      setTimeout(apply, 180);
    } else apply();
  };

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => { const on = t === tab; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
    panel.setAttribute("aria-labelledby", tab.id);
    if (focus) tab.focus();
    tab.scrollIntoView({ block: "nearest", inline: "nearest" });
    render(tab.dataset.type, true);
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", (e) => {
      let n = null;
      if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") n = tabs[0];
      if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(n, true); }
    });
  });
  render("tempered", false);

  /* ---------- timeline ---------- */
  document.querySelectorAll(".timeline li").forEach((li) => {
    if (li.querySelector(".who").textContent.includes("복층")) li.dataset.plant = "pair";
  });
  const scroller = document.querySelector(".timeline-scroller");
  document.querySelectorAll(".history-nav .round-btn").forEach((b) =>
    b.addEventListener("click", () => {
      const step = scroller.querySelector("li").offsetWidth * 2;
      scroller.scrollBy({ left: step * Number(b.dataset.dir), behavior: reduce ? "auto" : "smooth" });
    }));

  /* ---------- quote form ---------- */
  const form = document.getElementById("quote-form");
  const fileInput = document.getElementById("f-file");
  const fileName = document.getElementById("file-name");
  fileInput.addEventListener("change", () => {
    fileName.textContent = fileInput.files[0] ? fileInput.files[0].name : "선택된 파일 없음 · PDF, DWG, 이미지, 엑셀";
  });
  const status = document.getElementById("form-status");
  const checks = [
    ["f-name", (v) => v.trim().length > 0],
    ["f-tel", (v) => /[0-9]{2,}.*[0-9]{3,}/.test(v)],
    ["f-email", (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
    ["f-msg", (v) => v.trim().length > 0],
  ];
  const validateField = (id, test) => {
    const input = document.getElementById(id);
    const ok = test(input.value);
    input.closest(".field").classList.toggle("has-error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    const err = input.closest(".field").querySelector(".err");
    if (err) { err.id && input.setAttribute("aria-describedby", err.id); }
    return ok;
  };
  checks.forEach(([id, test]) => {
    const input = document.getElementById(id);
    input.addEventListener("blur", () => { if (input.value !== "" || input.closest(".has-error")) validateField(id, test); });
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";
    let firstBad = null;
    checks.forEach(([id, test]) => { if (!validateField(id, test) && !firstBad) firstBad = document.getElementById(id); });
    const agree = document.getElementById("f-agree");
    const eAgree = document.getElementById("e-agree");
    eAgree.classList.toggle("show", !agree.checked);
    if (!agree.checked && !firstBad) firstBad = agree;
    if (firstBad) { firstBad.focus(); return; }
    status.textContent = "문의 내용이 확인되었습니다. 시안 단계라 실제로 전송되지는 않으며, 개발 시 메일 또는 관리자 페이지와 연결됩니다.";
  });
})();
