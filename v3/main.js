(() => {
  /* ---------- 현재 페이지 메뉴 표시 ---------- */
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".menu a:not(.switch)").forEach((a) => {
    if (a.getAttribute("href").split("#")[0].toLowerCase() === here) a.setAttribute("aria-current", "page");
  });

  /* ---------- 모바일 메뉴 ---------- */
  const menuBtn = document.querySelector(".menu-btn");
  const menu = document.querySelector(".menu");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "✕" : "☰";
    });
  }

  /* ---------- 제품 탭 (products.html#tempered 처럼 바로 열기) ---------- */
  const tabs = [...document.querySelectorAll(".tab")];
  if (tabs.length) {
    const show = (key, focus) => {
      tabs.forEach((t) => {
        const on = t.dataset.key === key;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById("p-" + t.dataset.key).hidden = !on;
        if (on && focus) t.focus();
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => { show(t.dataset.key); history.replaceState(null, "", "#" + t.dataset.key); });
      t.addEventListener("keydown", (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        const n = tabs[(i + d + tabs.length) % tabs.length];
        show(n.dataset.key, true);
      });
    });
    const fromHash = () => {
      const k = location.hash.slice(1);
      show(tabs.some((t) => t.dataset.key === k) ? k : tabs[0].dataset.key);
    };
    addEventListener("hashchange", fromHash);
    fromHash();
  }

  /* ---------- 인증서 필터 ---------- */
  const certChips = [...document.querySelectorAll(".filter .chip")];
  certChips.forEach((chip) => chip.addEventListener("click", () => {
    certChips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    const f = chip.dataset.f;
    document.querySelectorAll(".cert").forEach((c) => { c.hidden = f !== "all" && c.dataset.f !== f; });
  }));

  /* ---------- 영상: 누르기 전엔 썸네일만, 재생할 때 유튜브 로드 ---------- */
  const player = document.getElementById("player");
  if (player) {
    const pTitle = document.getElementById("player-title");
    const pCat = document.getElementById("player-cat");
    const pLink = document.getElementById("player-link");
    const thumb = (id, q) => `https://i.ytimg.com/vi/${id}/${q}.jpg`;
    const fallback = (img, id) => {
      img.onload = () => { if (img.naturalWidth <= 120) img.src = thumb(id, "hqdefault"); };
      img.onerror = () => { img.src = thumb(id, "hqdefault"); };
    };
    const embed = (id) => {
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
      f.title = pTitle.textContent;
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      player.replaceChildren(f);
    };
    fallback(player.querySelector(".player-poster img"), player.dataset.id);
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
      const c = document.createElement("span"); c.className = "vitem-cat"; c.textContent = label;
      const t = document.createElement("span"); t.className = "vitem-title"; t.textContent = title;
      txt.append(c, t); btn.append(img, txt); li.replaceChildren(btn);
      btn.addEventListener("click", () => {
        document.querySelectorAll(".vitem[aria-current]").forEach((b) => b.removeAttribute("aria-current"));
        btn.setAttribute("aria-current", "true");
        player.dataset.id = id;
        pTitle.textContent = title; pCat.textContent = label;
        pLink.href = `https://www.youtube.com/watch?v=${id}`;
        embed(id);
        if (innerWidth < 1000) player.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
    const vchips = [...document.querySelectorAll(".vfilter .chip")];
    vchips.forEach((chip) => chip.addEventListener("click", () => {
      vchips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      const cat = chip.dataset.cat;
      items.forEach((li) => { li.hidden = cat !== "all" && li.dataset.cat !== cat; });
    }));
  }

  /* ---------- 견적 문의 양식 ---------- */
  const form = document.getElementById("quote");
  if (form) {
    const want = new URLSearchParams(location.search).get("item");
    if (want) form.querySelectorAll('input[name="type"]').forEach((b) => { if (b.value === want) b.checked = true; });
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
  }
})();
