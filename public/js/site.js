(() => {
  const getSiteNavItems = (root) => [
    { id: "about", label: "About", href: `${root}/about/index.html` },
    { id: "history", label: "History", href: `${root}/history/index.html` },
    { id: "membership", label: "Membership", href: `${root}/membership/index.html` },
    { id: "donate", label: "Donate", href: `${root}/donate/index.html` },
    { id: "news", label: "News", href: `${root}/news/index.html` },
    { id: "docs", label: "Docs", href: `${root}/docs/index.html` },
  ];

  const renderSharedSiteHeader = () => {
    const sharedHeader = document.querySelector("[data-site-header]");
    if (!sharedHeader) return;

    const rawRoot = sharedHeader.dataset.root || ".";
    const root = rawRoot.replace(/\/$/, "");
    const current = (sharedHeader.dataset.current || "").trim().toLowerCase();
    const navItems = getSiteNavItems(root);

    const navClassName = "nav shared-site-nav";

    const navMarkup = navItems
      .map(({ id, label, href }) => `<a href="${href}"${current === id ? ' aria-current="page"' : ""}>${label}</a>`)
      .join("");

    sharedHeader.classList.add("shared-site-top-bar");

    sharedHeader.innerHTML = `
      <a class="logo-group" href="${root}/index.html" aria-label="Friends of WDAC home">
        <img class="logo-horizontal" src="${root}/assets/logo/hLogo.png" alt="Friends of WDAC horizontal logo" />
      </a>

      <button class="menu-toggle" id="menuToggle" type="button" aria-label="Toggle menu" aria-expanded="false">Menu</button>

      <nav class="${navClassName}" aria-label="Primary">
        ${navMarkup}
      </nav>
    `;
  };

  renderSharedSiteHeader();

  const renderSharedSubpageFooter = () => {
    const footerNodes = Array.from(document.querySelectorAll("[data-subpage-footer]"));
    if (!footerNodes.length) return;

    footerNodes.forEach((footerNode) => {
      const rawRoot = footerNode.dataset.root || ".";
      const root = rawRoot.replace(/\/$/, "");
      const current = (footerNode.dataset.current || "").trim().toLowerCase();
      const legalCurrent = (footerNode.dataset.legal || "").trim().toLowerCase();
      const navItems = getSiteNavItems(root);
      const legalItems = [
        { id: "privacy", label: "Privacy Policy", href: `${root}/privacy/index.html` },
        { id: "terms", label: "Terms of Use", href: `${root}/terms/index.html` },
        { id: "donation-policy", label: "Donation Policy", href: `${root}/donation-policy/index.html` },
        { id: "accessibility", label: "Accessibility Statement", href: `${root}/accessibility/index.html` },
      ];

      const navMarkup = navItems
        .map(({ id, label, href }) => `<a href="${href}"${current === id ? ' aria-current="page"' : ""}>${label}</a>`)
        .join("");

      const legalMarkup = legalItems
        .map(({ id, label, href }) => `<a href="${href}"${legalCurrent === id ? ' aria-current="page"' : ""}>${label}</a>`)
        .join("");

      footerNode.innerHTML = `
        <section class="subpage-utility-band" aria-label="Quick actions">
          <div class="subpage-container subpage-utility-band__grid">
            <article class="subpage-utility">
              <span class="subpage-utility__icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" focusable="false">
                  <rect x="9" y="13" width="30" height="22" rx="3" />
                  <path d="M12 17l12 9 12-9" />
                </svg>
              </span>
              <div>
                <h2>Need help?</h2>
                <p>Questions about forms, access, or next steps? Reach us through the contact section.</p>
                <button
                  class="subpage-btn subpage-btn--band"
                  type="button"
                  data-open-contact-modal
                  aria-haspopup="dialog"
                  aria-controls="wd5-contact-modal"
                  aria-expanded="false"
                >Contact us</button>
              </div>
            </article>

            <article class="subpage-utility">
              <span class="subpage-utility__icon subpage-utility__icon--teal" aria-hidden="true">
                <svg viewBox="0 0 48 48" focusable="false">
                  <circle cx="18" cy="18" r="5" />
                  <circle cx="30" cy="18" r="5" />
                  <path d="M10 34c2-5 6-8 10-8s8 3 10 8" />
                  <path d="M22 34c2-5 6-8 10-8s8 3 10 8" />
                </svg>
              </span>
              <div>
                <h2>Get involved</h2>
                <p>Membership, volunteering, advocacy, and donations all help strengthen WDAC community support.</p>
                <a class="subpage-btn subpage-btn--band" href="${root}/membership/index.html">Become a Friend</a>
              </div>
            </article>

            <article class="subpage-utility">
              <span class="subpage-utility__icon subpage-utility__icon--coral" aria-hidden="true">
                <svg viewBox="0 0 48 48" focusable="false">
                  <path d="M24 37c-2-3-5-5-8-7-5-4-8-7-8-13 0-5 4-9 9-9 3 0 5 1 7 3 2-2 4-3 7-3 5 0 9 4 9 9 0 6-3 9-8 13-3 2-6 4-8 7z" />
                </svg>
              </span>
              <div>
                <h2>Stay connected</h2>
                <p>Keep up with advocacy updates, equipment goals, and community news from Friends of the WDAC.</p>
                <a class="subpage-btn subpage-btn--band" href="${root}/forms/membership/index.html">Subscribe for updates</a>
              </div>
            </article>
          </div>
        </section>

        <footer class="subpage-footer">
          <div class="subpage-container">
            <div class="subpage-footer__grid">
              <div class="subpage-footer__brand">
                <img class="subpage-footer__logo" src="${root}/assets/logo/markLogo.png" alt="Friends of WDAC logo mark" />
                <div>
                  <p><strong>Friends of the WDAC</strong><br />Cottage Grove Aquatic Center<br />P.O. Box 51<br />Cottage Grove, OR 97424</p>
                </div>
              </div>

              <nav class="subpage-footer__nav" aria-label="Footer">
                ${navMarkup}
              </nav>

              <div class="subpage-footer__social-wrap">
                <a class="subpage-footer__social" href="https://www.facebook.com/groups/5199757425" aria-label="Friends of WDAC Facebook group">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M13.5 8.5h2V5.8c-.35-.05-1.12-.13-2.02-.13-2 0-3.36 1.2-3.36 3.42V11H8v3.02h2.12V21h3.02v-6.98h2.36L15.88 11H13.14V9.39c0-.88.24-1.49 1.36-1.49Z" />
                  </svg>
                </a>
                <p class="subpage-footer__tagline">A community working together for Cottage Grove.</p>
              </div>
            </div>

            <div class="subpage-footer__meta">
              <p>&copy; 2026 Friends of the WDAC. All rights reserved.</p>
              <div class="subpage-footer__legal" aria-label="Legal links">
                ${legalMarkup}
                <a href="${root}/admin/index.html" rel="nofollow">Client admin</a>
              </div>
            </div>
          </div>
        </footer>
      `;
    });
  };

  renderSharedSubpageFooter();

  const contactModalMarkup = `
    <div class="wd5-modal" id="wd5-contact-modal" aria-hidden="true">
      <div
        class="wd5-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wd5-contact-modal-title"
      >
        <button class="wd5-modal-close" type="button" data-close-contact-modal aria-label="Close contact form">&times;</button>
        <p class="wd5-modal-kicker">Contact us</p>
        <h2 id="wd5-contact-modal-title">Send Friends of the WDAC a message.</h2>
        <p class="wd5-modal-intro">
          Ask a question, share a concern, or tell us how you would like to help. Your message will be sent to
          contact@friendsofwdac.org.
        </p>
        <form
          class="wd5-contact-form"
          data-contact-endpoint="https://friendsofwadc-subscribe.shannonborntrager.workers.dev/contact"
          data-success-message="Thanks. Your message was sent to Friends of WDAC."
        >
          <div class="wd5-form-grid">
            <div class="wd5-field">
              <label for="wd5-contact-name">Name *</label>
              <input class="wd5-input" id="wd5-contact-name" name="name" type="text" maxlength="160" required />
            </div>
            <div class="wd5-field">
              <label for="wd5-contact-email">Email *</label>
              <input class="wd5-input" id="wd5-contact-email" name="email" type="email" maxlength="254" required />
            </div>
          </div>
          <div class="wd5-form-grid">
            <div class="wd5-field">
              <label for="wd5-contact-phone">Phone</label>
              <input class="wd5-input" id="wd5-contact-phone" name="phone" type="tel" maxlength="60" />
            </div>
            <div class="wd5-field">
              <label for="wd5-contact-subject">Subject</label>
              <input class="wd5-input" id="wd5-contact-subject" name="subject" type="text" maxlength="180" />
            </div>
          </div>
          <div class="wd5-field">
            <label for="wd5-contact-message">Message *</label>
            <textarea class="wd5-textarea" id="wd5-contact-message" name="message" maxlength="5000" required></textarea>
          </div>
          <div class="wd5-visually-hidden" aria-hidden="true">
            <label for="wd5-contact-website">Website</label>
            <input id="wd5-contact-website" name="website" type="text" tabindex="-1" autocomplete="off" />
          </div>
          <div class="wd5-modal-actions">
            <button class="wd5-btn wd5-btn-primary" type="submit">Send message</button>
            <button class="wd5-btn wd5-btn-outline" type="button" data-close-contact-modal>Cancel</button>
          </div>
          <p class="wd5-form-note" data-form-note role="status" aria-live="polite" hidden></p>
          <p class="wd5-form-meta">If the form is unavailable, email contact@FriendsofWDAC.org directly.</p>
        </form>
      </div>
    </div>
  `;

  const ensureContactModal = () => {
    if (document.getElementById("wd5-contact-modal")) return;
    document.body.insertAdjacentHTML("beforeend", contactModalMarkup);
  };

  const isHomepageContactLink = (link) => {
    const href = link.getAttribute("href") || "";
    return /(?:^|\/|\.{1,2}\/)index(?:\.html)?#contact$/.test(href);
  };

  const setupContactModal = () => {
    const legacyContactLinks = Array.from(document.querySelectorAll("a[href]")).filter(isHomepageContactLink);
    if (legacyContactLinks.length) {
      ensureContactModal();
      legacyContactLinks.forEach((link) => {
        link.setAttribute("role", "button");
        link.setAttribute("aria-haspopup", "dialog");
        link.setAttribute("aria-controls", "wd5-contact-modal");
        link.setAttribute("aria-expanded", "false");
        link.dataset.openContactModal = "";
      });
    }

    const openButtons = Array.from(document.querySelectorAll("[data-open-contact-modal]"));
    if (!openButtons.length) return;

    ensureContactModal();

    const modal = document.getElementById("wd5-contact-modal");
    const closeButtons = Array.from(document.querySelectorAll("[data-close-contact-modal]"));
    const card = modal?.querySelector(".wd5-modal-card");
    const firstField = modal?.querySelector("#wd5-contact-name");
    let lastTrigger = null;

    const setModalOpen = (isOpen, trigger = null) => {
      if (!modal) return;
      modal.classList.toggle("is-open", isOpen);
      modal.setAttribute("aria-hidden", isOpen ? "false" : "true");
      document.body.classList.toggle("wd5-modal-open", isOpen);
      openButtons.forEach((button) => {
        button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });

      if (isOpen) {
        lastTrigger = trigger || document.activeElement;
        window.setTimeout(() => firstField?.focus(), 30);
        return;
      }

      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
    };

    openButtons.forEach((button) => {
      if (button.dataset.contactModalBound === "true") return;
      button.dataset.contactModalBound = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        setModalOpen(true, button);
      });
    });

    closeButtons.forEach((button) => {
      if (button.dataset.contactModalBound === "true") return;
      button.dataset.contactModalBound = "true";
      button.addEventListener("click", () => {
        setModalOpen(false);
      });
    });

    if (modal && modal.dataset.contactModalBound !== "true") {
      modal.dataset.contactModalBound = "true";
      modal.addEventListener("click", (event) => {
        if (card && card.contains(event.target)) return;
        setModalOpen(false);
      });

      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !modal.classList.contains("is-open")) return;
        setModalOpen(false);
      });
    }
  };

  setupContactModal();

  const setFormNote = (note, message) => {
    if (!note) return;
    note.textContent = message;
    note.hidden = !message;
  };

  const menuToggle = document.getElementById("menuToggle");
  const primaryNav = document.querySelector("nav.nav");
  if (menuToggle) {
    if (primaryNav) {
      if (!primaryNav.id) primaryNav.id = "primaryNav";
      menuToggle.setAttribute("aria-controls", primaryNav.id);
    }

    const setNavOpen = (nextOpen) => {
      document.body.classList.toggle("nav-open", nextOpen);
      menuToggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    };

    menuToggle.addEventListener("click", () => {
      const expanded = document.body.classList.contains("nav-open");
      setNavOpen(!expanded);
    });

    if (primaryNav) {
      primaryNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 980) setNavOpen(false);
        });
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!document.body.classList.contains("nav-open")) return;
      setNavOpen(false);
      menuToggle.focus();
    });
  }

  const subscribeForms = Array.from(document.querySelectorAll("form[data-endpoint]"));
  subscribeForms.forEach((form) => {
    const note = form.querySelector("[data-form-note]");
    const button = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const endpoint = form.dataset.endpoint;
      const emailInput = form.querySelector("input[type='email']");
      const email = (emailInput?.value || "").trim();
      if (!endpoint || !email) return;

      if (note) note.hidden = true;
      if (button) button.disabled = true;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const payload = await response.json().catch(() => ({}));
        if (response.ok) {
          setFormNote(note, "Thanks - you are on the list.");
          form.reset();
        } else {
          setFormNote(note, payload.error || "Sorry - something went wrong.");
        }
      } catch (error) {
        setFormNote(note, "Unable to submit right now.");
      } finally {
        if (note) note.hidden = false;
        if (button) button.disabled = false;
      }
    });
  });

  const contactForms = Array.from(document.querySelectorAll("form[data-contact-endpoint]"));
  contactForms.forEach((form) => {
    const note = form.querySelector("[data-form-note]");
    const button = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const endpoint = form.dataset.contactEndpoint;
      if (!endpoint) return;

      const data = new FormData(form);
      const payload = {};
      for (const [name, value] of data.entries()) {
        payload[name] = String(value || "").trim();
      }

      if (note) note.hidden = true;
      if (button) button.disabled = true;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const responsePayload = await response.json().catch(() => ({}));

        if (response.ok) {
          setFormNote(note, form.dataset.successMessage || "Thanks. Your message was sent.");
          form.reset();
        } else {
          setFormNote(note, responsePayload.error || "Unable to send your message right now.");
        }
      } catch (error) {
        setFormNote(note, "Unable to send your message right now.");
      } finally {
        if (note) note.hidden = false;
        if (button) button.disabled = false;
      }
    });
  });

  const contentMode = String(
    document.body?.dataset.contentEnabled || document.body?.dataset.contentPhase1 || ""
  )
    .trim()
    .toLowerCase();
  if (contentMode === "on") {
    const pageSlug = String(document.body?.dataset.contentPage || "").trim().toLowerCase();
    const parsedContentPhase = Number.parseInt(document.body?.dataset.contentPhase || "1", 10);
    const contentPhase = Number.isFinite(parsedContentPhase) && parsedContentPhase > 0 ? parsedContentPhase : 1;
    const apiBase = String(document.querySelector("meta[name='wdac-content-api-base']")?.content || "")
      .trim()
      .replace(/\/+$/, "");
    const hasContentTargets = Boolean(
      document.querySelector("[data-content-key], [data-content-link-key], [data-content-image-key], [data-content-bg-key]")
    );
    let contentPreviewLocked = false;

    const asTrimmedString = (value) => {
      if (typeof value === "string") return value.trim();
      if (typeof value === "number") return String(value);
      return "";
    };

    const getByPath = (source, path) => {
      if (!source || typeof source !== "object" || !path) return undefined;
      if (Object.prototype.hasOwnProperty.call(source, path)) {
        return source[path];
      }

      return path.split(".").reduce((current, segment) => {
        if (!current || typeof current !== "object") return undefined;
        return current[segment];
      }, source);
    };

    const isSafeRelativePath = (value) => {
      if (!value) return false;
      if (value.startsWith("//")) return false;
      return !/^[a-z][a-z0-9+.-]*:/i.test(value);
    };

    const toSafeHref = (value) => {
      const href = asTrimmedString(value);
      if (!href) return "";
      if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
      if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) return href;
      if (isSafeRelativePath(href)) return href;
      return "";
    };

    const toSafeAssetSrc = (value) => {
      const src = asTrimmedString(value);
      if (!src) return "";
      if (/^https?:\/\//i.test(src)) return src;
      if (src.startsWith("/") || src.startsWith("./") || src.startsWith("../")) return src;
      if (isSafeRelativePath(src)) return src;
      return "";
    };

    const toCssUrl = (src) => `url("${src.replace(/"/g, "\\\"")}")`;

    const unwrapContentPayload = (payload, page) => {
      const records = [payload?.record, payload?.page, payload?.contentPage, payload].filter(
        (entry) => entry && typeof entry === "object"
      );

      for (const record of records) {
        const candidates = [
          record?.published?.content,
          record?.published?.fields,
          record?.published,
          record?.content,
          record?.fields,
          record?.draft?.content,
          record?.draft?.fields,
          record?.draft,
          record
        ];

        for (const candidate of candidates) {
          if (!candidate || typeof candidate !== "object") continue;

          if (candidate[page] && typeof candidate[page] === "object") {
            return candidate;
          }

          if (
            Object.keys(candidate).some((key) => key.startsWith(`${page}.`)) ||
            candidate.hero ||
            candidate.support ||
            candidate.mission ||
            candidate.impact ||
            candidate.leadership
          ) {
            return { [page]: candidate };
          }
        }
      }

      return null;
    };

    const applyPublishedContent = (contentRoot) => {
      const setLinkLabel = (node, nextLabel) => {
        const explicitLabelNode = node.querySelector("[data-content-link-label]");
        if (explicitLabelNode) {
          explicitLabelNode.textContent = nextLabel;
          return;
        }

        const nonEmptyTextNode = Array.from(node.childNodes).find(
          (child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim()
        );

        if (nonEmptyTextNode) {

    window.__wdacApplyContentPreview = (contentRoot) => {
      if (!contentRoot || typeof contentRoot !== "object") return;
      contentPreviewLocked = true;
      applyPublishedContent(contentRoot);
    };
          const leadingWhitespaceMatch = nonEmptyTextNode.textContent.match(/^\s*/);
          const trailingWhitespaceMatch = nonEmptyTextNode.textContent.match(/\s*$/);
          const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : "";
          const trailingWhitespace = trailingWhitespaceMatch ? trailingWhitespaceMatch[0] : "";

          nonEmptyTextNode.textContent = `${leadingWhitespace}${nextLabel}${trailingWhitespace}`;
          return;
        }

        if (node.firstChild) {
          node.insertBefore(document.createTextNode(nextLabel), node.firstChild);
          return;
        }

        node.textContent = nextLabel;
      };

      document.querySelectorAll("[data-content-key]").forEach((node) => {
        const key = node.dataset.contentKey;
        const nextValue = asTrimmedString(getByPath(contentRoot, key));
        if (!nextValue) return;
        node.textContent = nextValue;
      });

      document.querySelectorAll("[data-content-link-key]").forEach((node) => {
        const key = node.dataset.contentLinkKey;
        const direct = getByPath(contentRoot, key);

        const nextLabel =
          (direct && typeof direct === "object" ? asTrimmedString(direct.label) : "") ||
          asTrimmedString(getByPath(contentRoot, `${key}.label`));
        const nextHref =
          (direct && typeof direct === "object" ? toSafeHref(direct.href) : "") ||
          toSafeHref(getByPath(contentRoot, `${key}.href`));

        if (nextLabel) {
          setLinkLabel(node, nextLabel);
        }
        if (nextHref) {
          node.setAttribute("href", nextHref);
        }
      });

      document.querySelectorAll("img[data-content-image-key]").forEach((node) => {
        const key = node.dataset.contentImageKey;
        const direct = getByPath(contentRoot, key);

        const nextSrc =
          (direct && typeof direct === "object"
            ? toSafeAssetSrc(direct.src || direct.url)
            : toSafeAssetSrc(direct)) || toSafeAssetSrc(getByPath(contentRoot, `${key}.src`));
        const nextAlt =
          (direct && typeof direct === "object" ? asTrimmedString(direct.alt) : "") ||
          asTrimmedString(getByPath(contentRoot, `${key}.alt`));

        if (nextSrc) {
          node.setAttribute("src", nextSrc);
        }
        if (nextAlt) {
          node.setAttribute("alt", nextAlt);
        }
      });

      document.querySelectorAll("[data-content-bg-key]").forEach((node) => {
        const key = node.dataset.contentBgKey;
        const cssVar = node.dataset.contentBgVar || "--content-bg-image";
        const direct = getByPath(contentRoot, key);

        const nextSrc =
          (direct && typeof direct === "object"
            ? toSafeAssetSrc(direct.src || direct.url)
            : toSafeAssetSrc(direct)) || toSafeAssetSrc(getByPath(contentRoot, `${key}.src`));

        if (!nextSrc) return;
        node.style.setProperty(cssVar, toCssUrl(nextSrc));
      });
    };

    if (pageSlug && apiBase && hasContentTargets && typeof window.fetch === "function") {
      const controller = typeof AbortController === "function" ? new AbortController() : null;
      const timeoutId = window.setTimeout(() => {
        controller?.abort();
      }, 2500);

      const requestOptions = controller ? { signal: controller.signal } : {};

      fetch(
        `${apiBase}/pages/${encodeURIComponent(pageSlug)}?view=published&phase=${encodeURIComponent(String(contentPhase))}`,
        requestOptions
      )
        .then((response) => (response.ok ? response.json().catch(() => null) : null))
        .then((payload) => {
          if (!payload) return;
          if (contentPreviewLocked) return;
          const contentRoot = unwrapContentPayload(payload, pageSlug);
          if (!contentRoot) return;
          applyPublishedContent(contentRoot);
        })
        .catch(() => {
          // Keep static HTML defaults when content API is unavailable.
        })
        .finally(() => {
          window.clearTimeout(timeoutId);
        });
    }
  }

  const revealNodes = Array.from(document.querySelectorAll(".reveal"));
  if (revealNodes.length) {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
    } else {
      document.body.classList.add("motion-ready");

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -10% 0px" }
      );

      revealNodes.forEach((node, index) => {
        node.style.setProperty("--reveal-delay", `${Math.min(index * 65, 390)}ms`);
        observer.observe(node);
      });
    }
  }
})();
