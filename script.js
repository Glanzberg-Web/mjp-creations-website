(() => {
  document.documentElement.classList.add("js");

  const base = window.MJP_CATALOG_BASE || "https://www.mjpcreations.com/";
  let catalogURL;
  try {
    catalogURL = new URL(base);
    if (catalogURL.protocol !== "https:") throw new Error("Catalog must use HTTPS");
  } catch {
    console.warn("MJP_CATALOG_BASE must be an absolute HTTPS URL.");
  }
  if (catalogURL) {
    document.querySelectorAll("[data-catalog-path]").forEach(link => {
      const path = link.dataset.catalogPath || "";
      link.href = new URL(path, catalogURL.href.endsWith("/") ? catalogURL.href : catalogURL.href + "/").href;
    });
  }

  const header = document.getElementById("site-header");
  const menu = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-nav");
  const setMenu = open => {
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.classList.toggle("is-open", open);
  };
  menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setMenu(false);
  });
  document.addEventListener("click", event => {
    if (menu.getAttribute("aria-expanded") === "true" && !menu.contains(event.target) && !nav.contains(event.target)) setMenu(false);
  });

  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {rootMargin:"0px 0px 60px 0px",threshold:.08});
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("is-visible"));
  }

  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submit = form?.querySelector('button[type="submit"]');
  if (form && status && submit) form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    status.textContent = "Sending your message…";
    status.dataset.state = "";
    submit.disabled = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/contact", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
        signal:controller.signal
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't send your message right now.");
      status.textContent = "Thanks for reaching out! Your message has been sent. We'll be in touch.";
      status.dataset.state = "success";
      form.reset();
    } catch (error) {
      status.textContent = error.name === "AbortError"
        ? "The request timed out. Please try again."
        : (error.message || "We couldn't send your message. Please try again.");
      status.dataset.state = "error";
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
    }
  });
})();