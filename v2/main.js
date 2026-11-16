(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- hero load ---------- */
  const heroImg = document.querySelector(".hero-img");
  const ready = () => root.classList.add("is-ready");
  if (heroImg.complete) requestAnimationFrame(ready);
  else { heroImg.addEventListener("load", ready, { once: true }); heroImg.addEventListener("error", ready, { once: true }); }
  setTimeout(ready, 2500);

  /* ---------- letter roll ---------- */
  document.querySelectorAll(".roll").forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    const box = document.createElement("span");
    box.className = "r";
    box.setAttribute("aria-hidden", "true");
    [...text].forEach((ch, i) => {
      const col = document.createElement("span");
      col.style.setProperty("--i", i);
      const a = document.createElement("span"); a.textContent = ch;
      const b = document.createElement("span"); b.textContent = ch;
      col.append(a, b);
      box.appendChild(col);
    });
    el.textContent = "";
    el.appendChild(box);
  });

  /* ---------- word reveal ---------- */
  const reveals = [...document.querySelectorAll(".reveal-words")].map((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.textContent = "";
    const spans = words.map((w, i) => {
      const s = document.createElement("span");
      s.className = "w"; s.textContent = w; s.setAttribute("aria-hidden", "true");
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      return s;
    });
    return { el, spans };
  });

  /* ---------- scroll-linked pieces ---------- */
  const bar = document.querySelector(".bar");
  const hero = document.querySelector(".hero");
  const wa = document.querySelector(".word-a");
  const wb = document.querySelector(".word-b");
  const scene = document.querySelector(".pane-scene");
  const frame = document.querySelector(".frame");
  const panes = [...document.querySelectorAll(".pane")];
  const speeds = [1.25, 1.6, 1.05, 1.9];

  const onScroll = () => {
    const vh = innerHeight;
    const y = scrollY;
    bar.classList.toggle("is-scrolled", y > hero.offsetHeight * 0.55);

    if (!reduce) {
      const p = clamp(y / hero.offsetHeight);
      wa.style.transform = `translate3d(0, ${-p * 40}%, 0)`;
      wb.style.transform = `translate3d(0, ${p * 30}%, 0)`;
      heroImg.style.translate = `0 ${p * 12}%`;

      const r = scene.getBoundingClientRect();
      const sp = clamp(-r.top / (r.height - vh));
      frame.style.setProperty("--draw", String(1 - clamp(sp * 1.7)));
      panes.forEach((el, i) => { el.style.transform = `translate3d(0, ${-sp * speeds[i] * vh}px, 0)`; });
    }

    reveals.forEach(({ el, spans }) => {
      const r = el.getBoundingClientRect();
      const prog = reduce ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const lit = Math.round(prog * spans.length);
      spans.forEach((s, i) => s.classList.toggle("lit", i < lit));
    });
  };
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- cursor ---------- */
  const cursor = document.querySelector(".cursor");
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let tx = -100, ty = -100, cx = -100, cy = -100;
    addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      const t = e.target;
      cursor.classList.toggle("is-card", !!t.closest?.(".card-btn"));
      cursor.classList.toggle("on-dark", !!t.closest?.(".hero, .pane-scene, .foot"));
    });
    const loop = () => {
      cx += (tx - cx) * (reduce ? 1 : 0.22);
      cy += (ty - cy) * (reduce ? 1 : 0.22);
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- product sheet ---------- */
  const P = {
    tempered: { std: "KS L 2002", title: "강화유리",
      desc: "판유리를 500~600℃ 이상으로 가열한 뒤 급랭해 만든 안전유리입니다. 일반 유리보다 약 5배 이상 충격에 강하고, 깨지더라도 끝이 날카롭지 않은 작은 입자로 부서져 파편 피해를 줄입니다.",
      points: ["일반 유리 대비 약 5배 이상의 내충격 강도", "파손 시 작은 입자로 부서져 상해 위험이 적음", "뜨거운 열과 급격한 온도 변화에 강함", "최대 3,000 × 6,500mm 강화 가공"],
      uses: "커튼월 유리창, 샤워부스·욕실 칸막이, 난간·계단·발코니, 실내 파티션" },
    hs: { std: "KS L 2015", title: "배강도유리",
      desc: "강화유리보다 천천히 냉각해 강도를 높인 열처리 유리입니다. 일반 판유리보다 강하고, 깨지더라도 큰 조각으로 금이 가 틀에서 쉽게 떨어지지 않습니다.",
      points: ["강화유리보다 평탄도가 좋아 반사상 왜곡이 적음", "파손 시 파편이 틀에 남아 낙하 위험이 낮음", "자연 파손(자파) 우려가 낮음", "접합유리 원판으로 함께 사용"],
      uses: "고층 건물 외벽, 커튼월, 접합유리 원판" },
    laminated: { std: "KS L 2004", title: "접합유리",
      desc: "두 장 이상의 판유리 사이에 투명하고 접착력이 강한 PVB 필름을 넣고, 진공 상태에서 공기를 뺀 뒤 온도와 압력을 높여 밀착시킨 유리입니다.",
      points: ["충격 흡수력이 높아 쉽게 파손되지 않음", "파손돼도 필름이 파편 비산을 막음", "충격물이 관통하지 않아 도난 방지", "필름의 차음 효과로 조용한 실내", "기포·굴곡 없는 깨끗한 투시"],
      uses: "천창, 연결통로, 쇼윈도·진열장, 비상통로 감시창, 박물관·귀금속 진열장, 대형 수족관" },
    igu: { std: "KS L 2003", title: "복층유리",
      desc: "두 장 또는 세 장의 판유리 사이에 스페이서(간봉)를 두어 건조한 공기층이나 아르곤 가스층을 만든 에너지 절감형 유리입니다.",
      points: ["실외로 빠져나가는 열을 줄여 단열 성능 향상", "실내외 온도 차를 줄여 결로 저감", "소음 차단으로 조용한 실내", "가스주입 단열유리 단체표준 인증"],
      uses: "주택·아파트 창문, 사무실·상업 빌딩, 고층 외벽, 냉장고 유리문" },
    heatsoak: { std: "Heat Soak", title: "힛속 처리 강화유리",
      desc: "강화유리를 챔버에서 일정 온도로 장시간 가열해, 내부 불순물(황화니켈) 때문에 깨질 가능성이 있는 유리를 출하 전에 걸러내는 공정입니다.",
      points: ["출하 전 자파 가능 유리 선별", "교체가 어려운 고층 외벽·천창에 권장", "2024년 힛속 심사 통과, 단체표준 인증"],
      uses: "커튼월, 천창, 고층 외벽, 공공시설 대형 유리" },
  };
  const sheet = document.getElementById("sheet");
  let opener = null;
  document.querySelectorAll(".card").forEach((card) => {
    card.querySelector(".card-btn").addEventListener("click", (e) => {
      const d = P[card.dataset.key];
      opener = e.currentTarget;
      document.getElementById("sheet-std").textContent = d.std;
      document.getElementById("sheet-title").textContent = d.title;
      document.getElementById("sheet-desc").textContent = d.desc;
      const ul = document.getElementById("sheet-points"); ul.innerHTML = "";
      d.points.forEach((t) => { const li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
      document.getElementById("sheet-uses").textContent = d.uses;
      sheet.showModal();
    });
  });
  sheet.querySelector(".sheet-close").addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
  sheet.querySelector("[data-close]").addEventListener("click", () => sheet.close());
  sheet.addEventListener("close", () => { if (opener && !location.hash.includes("contact")) opener.focus(); });

  /* ---------- certificate carousel ---------- */
  const car = document.querySelector(".carousel");
  let down = false, sx = 0, sl = 0, moved = false;
  car.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = car.scrollLeft; });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 4) { moved = true; car.classList.add("dragging"); }
    car.scrollLeft = sl - dx;
  });
  addEventListener("pointerup", () => { if (!down) return; down = false; car.classList.remove("dragging"); });
  car.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);
  document.querySelectorAll(".carousel-nav .round").forEach((b) =>
    b.addEventListener("click", () => {
      const w = car.querySelector(".cert").offsetWidth + 16;
      car.scrollBy({ left: w * Number(b.dataset.dir), behavior: reduce ? "auto" : "smooth" });
    }));

  /* ---------- video: poster first, YouTube loads only on play ---------- */
  const player = document.getElementById("player");
  const pTitle = document.getElementById("player-title");
  const pCat = document.getElementById("player-cat");
  const pLink = document.getElementById("player-link");
  const thumb = (id, q) => `https://i.ytimg.com/vi/${id}/${q}.jpg`;
  const posterFallback = (img, id) => {
    img.onload = () => { if (img.naturalWidth <= 120) img.src = thumb(id, "hqdefault"); };
    img.onerror = () => { img.src = thumb(id, "hqdefault"); };
  };
  const posterImg = player.querySelector(".player-poster img");
  posterFallback(posterImg, player.dataset.id);

  const embed = (id) => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
    f.title = pTitle.textContent;
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    player.replaceChildren(f);
  };
  const posterFor = (id, title) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "player-poster"; b.setAttribute("aria-label", `영상 재생: ${title}`);
    const img = document.createElement("img"); img.alt = ""; img.src = thumb(id, "maxresdefault"); posterFallback(img, id);
    const play = document.createElement("span"); play.className = "play"; play.setAttribute("aria-hidden", "true");
    play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    b.append(img, play);
    b.addEventListener("click", () => embed(id));
    return b;
  };
  player.querySelector(".player-poster").addEventListener("click", () => embed(player.dataset.id));

  const items = [...document.querySelectorAll("#vlist li")];
  items.forEach((li, i) => {
    const { id, label } = li.dataset;
    const title = li.textContent.trim();
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "vitem";
    if (i === 0) btn.setAttribute("aria-current", "true");
    const img = document.createElement("img"); img.src = thumb(id, "mqdefault"); img.alt = ""; img.loading = "lazy";
    const txt = document.createElement("span"); txt.className = "vitem-text";
    txt.innerHTML = `<span class="vitem-cat"></span><span class="vitem-title"></span>`;
    txt.firstChild.textContent = label; txt.lastChild.textContent = title;
    btn.append(img, txt);
    li.replaceChildren(btn);
    btn.addEventListener("click", () => {
      document.querySelectorAll(".vitem[aria-current]").forEach((b) => b.removeAttribute("aria-current"));
      btn.setAttribute("aria-current", "true");
      player.dataset.id = id;
      pTitle.textContent = title; pCat.textContent = label;
      pLink.href = `https://www.youtube.com/watch?v=${id}`;
      player.replaceChildren(posterFor(id, title));
      embed(id); // the visitor chose this video, so start it
      if (innerWidth < 1000) player.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  });
  document.querySelectorAll(".vchip").forEach((chip) =>
    chip.addEventListener("click", () => {
      document.querySelectorAll(".vchip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      const cat = chip.dataset.cat;
      items.forEach((li) => { li.hidden = cat !== "all" && li.dataset.cat !== cat; });
    }));

  /* ---------- quote form ---------- */
  const form = document.getElementById("quote");
  const status = form.querySelector(".status");
  const rules = [
    ["q-name", (v) => v.trim() !== ""],
    ["q-tel", (v) => /[0-9]{2,}.*[0-9]{3,}/.test(v)],
    ["q-mail", (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
    ["q-msg", (v) => v.trim() !== ""],
  ];
  const check = ([id, ok]) => {
    const el = document.getElementById(id);
    const good = ok(el.value);
    el.closest(".field").classList.toggle("bad", !good);
    el.setAttribute("aria-invalid", String(!good));
    return good;
  };
  rules.forEach((r) => document.getElementById(r[0]).addEventListener("blur", (e) => { if (e.target.value) check(r); }));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";
    let first = null;
    rules.forEach((r) => { if (!check(r) && !first) first = document.getElementById(r[0]); });
    const agree = document.getElementById("q-agree");
    document.getElementById("q-agree-err").classList.toggle("show", !agree.checked);
    if (!agree.checked && !first) first = agree;
    if (first) { first.focus(); return; }
    status.textContent = "문의 내용이 확인되었습니다. 시안 단계라 실제로 전송되지는 않습니다.";
  });
})();
