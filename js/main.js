/* =========================================================================
   HUBTOWN 复刻版 —— 交互脚本
   依赖：GSAP + ScrollTrigger + Lenis（均已在 index.html 用 CDN 引入）
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const hasGSAP = typeof window.gsap !== "undefined";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------------
     1. 自定义光标（淡蓝小方块跟随鼠标，悬停可交互元素时放大）
     --------------------------------------------------------------------- */
  const cursor = document.getElementById("cursor");
  if (cursor && window.matchMedia("(hover: hover)").matches) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;

    window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });

    // 用 rAF 做平滑跟随（带一点拖尾延迟）
    const renderCursor = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // 悬停在按钮/链接上时光标放大
    const hoverTargets = document.querySelectorAll("a, button, [data-cursor]");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ---------------------------------------------------------------------
     2. Lenis 平滑滚动 + 与 ScrollTrigger 同步
     --------------------------------------------------------------------- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined" && !reduceMotion) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", () => { if (hasGSAP) ScrollTrigger.update(); });
    if (hasGSAP) {
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // 导航锚点平滑跳转（交给 Lenis 处理）
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      document.getElementById("nav")?.classList.remove("is-open"); // 关闭移动端菜单
      if (lenis) lenis.scrollTo(target, { offset: 0 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------------------------------------------------------------------
     3. 加载页：进度 0→100% + 字标逐字揭示，完成后揭幕
     --------------------------------------------------------------------- */
  const loader = document.getElementById("loader");
  const pctEl = document.getElementById("loaderPct");
  const barEl = document.getElementById("loaderBarFill");
  const wordSpans = document.querySelectorAll("#loaderWord span");

  let sitePromoted = false;
  function startSite() {
    if (sitePromoted) return;   // 一次性守卫，避免重复初始化
    sitePromoted = true;
    revealNav();
    revealIntro();
    initStoryScenes();
    initStatsCount();
    initWhatsApp();
    if (hasGSAP) ScrollTrigger.refresh();
  }

  // 安全兜底：万一加载动画因后台标签页被 rAF 节流而卡住，
  // 5 秒后强制揭幕，保证内容一定显示出来。
  function forcePromote() {
    if (sitePromoted) return;
    startSite();
    const ld = document.getElementById("loader");
    if (ld) {
      if (hasGSAP) gsap.to(ld, { yPercent: -100, duration: 0.6, ease: "power3.inOut", onComplete: () => ld.remove() });
      else { ld.style.display = "none"; }
    }
  }
  setTimeout(forcePromote, 5000);
  window.addEventListener("load", () => setTimeout(() => { if (!sitePromoted) forcePromote(); }, 1500));

  if (loader && hasGSAP && !reduceMotion) {
    const counter = { v: 0 };
    const tl = gsap.timeline();

    // 字母逐个从下往上揭示
    tl.to(wordSpans, {
      clipPath: "inset(0 0 0% 0)",
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.09,
    }, 0.2);

    // 进度数字 + 进度条
    tl.to(counter, {
      v: 100,
      duration: 2.4,
      ease: "power2.inOut",
      onUpdate: () => {
        const val = Math.round(counter.v);
        if (pctEl) pctEl.textContent = val + "%";
        if (barEl) barEl.style.width = val + "%";
      },
    }, 0.1);

    // 揭幕：整页加载层上移消失
    tl.to(loader, {
      yPercent: -100,
      duration: 0.9,
      ease: "power3.inOut",
      onStart: startSite,
      onComplete: () => loader.remove(),
    }, ">-0.1");
  } else {
    // 没有 GSAP 或用户偏好减少动画：直接进入站点
    if (loader) loader.style.display = "none";
    // 没有 GSAP 时也要把隐藏的内容显示出来
    if (!hasGSAP) {
      document.querySelectorAll(".reveal, .story__content > *").forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = "none";
      });
    }
    startSite();
  }

  /* ---------------------------------------------------------------------
     4. 导航入场 + 移动端汉堡菜单
     --------------------------------------------------------------------- */
  function revealNav() {
    if (!hasGSAP) return;
    gsap.from(".nav", { y: -40, opacity: 0, duration: 1, ease: "power3.out", delay: 0.1 });
  }

  const burger = document.getElementById("navBurger");
  burger?.addEventListener("click", () => {
    document.getElementById("nav").classList.toggle("is-open");
  });

  // 滚动时给导航一点背景（这里用 mix-blend 已足够，保留钩子）
  if (hasGSAP) {
    ScrollTrigger.create({
      start: "top -80",
      onUpdate: (self) => {
        document.getElementById("nav")?.classList.toggle("is-scrolled", self.scroll() > 80);
      },
    });
  }

  /* ---------------------------------------------------------------------
     5. 开场区入场动画
     --------------------------------------------------------------------- */
  function revealIntro() {
    if (!hasGSAP) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".intro .label", { y: 30, opacity: 0, duration: 0.8 })
      .from(".intro__title", { y: 50, opacity: 0, duration: 1 }, "-=0.5")
      .to(".reveal", { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, "-=0.6");
  }

  /* ---------------------------------------------------------------------
     6. 项目统计数字 count-up（滚动进入视口时触发）
     --------------------------------------------------------------------- */
  function initStatsCount() {
    if (!hasGSAP) return;
    document.querySelectorAll(".stat__num").forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => { el.textContent = String(Math.round(obj.v)).padStart(2, "0"); },
          });
        },
      });
    });
  }

  /* ---------------------------------------------------------------------
     7. 6 大滚动叙事板块：CSS sticky 钉住 + GSAP scrub 时间线
        文字入场 → 停留(背景视差) → 出场，随滚动进度播放。
     --------------------------------------------------------------------- */
  function initStoryScenes() {
    if (!hasGSAP) return;

    document.querySelectorAll(".story").forEach((section) => {
      const content = section.querySelectorAll(".story__content > *");
      const visual = section.querySelector(".story__visual");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      // 文字逐个入场
      tl.fromTo(content,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "power3.out" },
        0.05
      );
      // 背景全程视差：从放大缓缓回到原位并轻微上移
      tl.fromTo(visual,
        { scale: 1.18, yPercent: 4 },
        { scale: 1.0, yPercent: -4, ease: "none", duration: 4 },
        0
      );
      // 文字出场（上移淡出），给下一段腾位置
      tl.to(content,
        { y: -60, opacity: 0, duration: 1, stagger: 0.05, ease: "power3.in" },
        3.1
      );
    });
  }

  /* ---------------------------------------------------------------------
     8. Sound Off 轮播
     --------------------------------------------------------------------- */
  const track = document.getElementById("carouselTrack");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsWrap = document.getElementById("carouselDots");

  if (track && slides.length) {
    let index = 0;

    // 生成圆点
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", "slide " + (i + 1));
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function slideStep() {
      // 每次移动一张幻灯片的宽度 + 间距
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.gap) || 24;
      return slides[0].getBoundingClientRect().width + gap;
    }

    function maxIndex() {
      // 让最后一张刚好停在可视区，避免右侧大片空白
      const wrapW = track.parentElement.clientWidth;
      const totalW = slides.length * slideStep();
      const stepW = slideStep();
      const max = Math.ceil((totalW - wrapW) / stepW);
      return Math.max(0, Math.min(max, slides.length - 1));
    }

    function goTo(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      track.style.transform = `translateX(${-index * slideStep()}px)`;
      dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === maxIndex();
    }

    prevBtn?.addEventListener("click", () => goTo(index - 1));
    nextBtn?.addEventListener("click", () => goTo(index + 1));
    window.addEventListener("resize", () => goTo(index));
    goTo(0);
  }

  /* ---------------------------------------------------------------------
     9. WhatsApp 浮动按钮（开场后滑入）
     --------------------------------------------------------------------- */
  function initWhatsApp() {
    const wa = document.getElementById("whatsapp");
    if (!wa) return;
    if (hasGSAP) {
      gsap.to(wa, { y: 0, duration: 0.7, ease: "back.out(1.6)", delay: 1.2 });
    } else {
      wa.style.transform = "translateY(0)";
    }
  }
});
