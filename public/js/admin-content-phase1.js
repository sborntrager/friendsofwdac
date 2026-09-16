(() => {
  const SESSION_KEY = "fo_wdac_admin_token_v3";

  const shell = document.querySelector("[data-admin-api-base]");
  const panel = document.getElementById("admin-content-panel");
  if (!shell || !panel) return;

  const apiBase = String(shell.dataset.adminApiBase || "").trim().replace(/\/+$/, "");
  if (!apiBase) return;

  const pageSelect = document.getElementById("admin-content-page");
  const refreshButton = document.getElementById("admin-content-refresh");
  const saveButton = document.getElementById("admin-content-save");
  const publishButton = document.getElementById("admin-content-publish");
  const metaNote = document.getElementById("admin-content-meta");
  const inlineNote = document.getElementById("admin-content-note");
  const connectionBadge = document.getElementById("admin-content-connection-state");
  const contentForm = document.getElementById("admin-content-form");

  if (!pageSelect || !refreshButton || !saveButton || !publishButton || !metaNote || !inlineNote || !connectionBadge || !contentForm) {
    return;
  }

  const groups = Array.from(contentForm.querySelectorAll("[data-content-group]"));
  const fields = Array.from(contentForm.querySelectorAll("[data-content-field]"));

  fields.forEach((field) => {
    field.dataset.defaultValue = field.value;
  });

  const asString = (value) => {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number") return String(value);
    return "";
  };

  const toPageLabel = (page) => {
    const value = asString(page);
    return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "Page";
  };

  const visualEditorConfig = {
    home: {
      label: "Home",
      previewPath: "../index.html",
      sections: [
        {
          id: "hero",
          label: "Hero + metrics",
          description: "Update the opening message, background image, and impact metrics.",
          fieldPrefixes: ["home.hero.", "home.metrics."]
        },
        {
          id: "section-cards",
          label: "Section cards",
          description: "Edit the five overview cards that introduce the main site sections.",
          fieldPrefixes: ["home.sections."]
        },
        {
          id: "support",
          label: "Get involved",
          description: "Edit the support intro and the two get-involved cards.",
          fieldPrefixes: ["home.support.", "home.involved."]
        },
        {
          id: "priorities",
          label: "Priorities",
          description: "Update the priorities summary, links, and three priority cards.",
          fieldPrefixes: ["home.priorities."]
        },
        {
          id: "cta-subscribe",
          label: "Subscribe CTA",
          description: "Edit the stay connected call-to-action block.",
          fieldPrefixes: ["home.cta.subscribe."]
        },
        {
          id: "cta-contact",
          label: "Contact CTA",
          description: "Edit the contact call-to-action block.",
          fieldPrefixes: ["home.cta.contact."]
        }
      ]
    },
    about: {
      label: "About",
      previewPath: "../about/index.html",
      sections: [
        {
          id: "hero",
          label: "Hero + stats",
          description: "Update the hero copy, background image, and top highlight stats.",
          fieldPrefixes: ["about.hero.", "about.stats."]
        },
        {
          id: "who-we-are",
          label: "Who we are",
          description: "Edit the core background copy and supporting WDAC links.",
          fieldPrefixes: ["about.whoWeAre."]
        },
        {
          id: "mission",
          label: "Mission",
          description: "Edit the mission statement card.",
          fieldPrefixes: ["about.mission."]
        },
        {
          id: "objectives",
          label: "Objectives",
          description: "Edit the objectives heading and bullet points.",
          fieldPrefixes: ["about.objectives."]
        },
        {
          id: "leadership",
          label: "Leadership",
          description: "Update leadership lists and the accompanying image.",
          fieldPrefixes: ["about.leadership."]
        },
        {
          id: "impact",
          label: "Impact + gallery",
          description: "Edit the impact copy, callout, and supporting image gallery.",
          fieldPrefixes: ["about.impact.", "about.gallery."]
        },
        {
          id: "testimonials",
          label: "Testimonials",
          description: "Update the testimonial intro, CTA, and quote set.",
          fieldPrefixes: ["about.testimonials."]
        },
        {
          id: "sponsor",
          label: "Sponsor",
          description: "Edit the Be Your Best sponsor section, links, and contact details.",
          fieldPrefixes: ["about.sponsor."]
        },
        {
          id: "cta-subscribe",
          label: "Subscribe CTA",
          description: "Edit the stay connected call-to-action card.",
          fieldPrefixes: ["about.cta.subscribe."]
        },
        {
          id: "cta-contact",
          label: "Contact CTA",
          description: "Edit the contact call-to-action card.",
          fieldPrefixes: ["about.cta.contact."]
        }
      ]
    },
    membership: {
      label: "Membership",
      previewPath: "../membership/index.html",
      sections: [
        {
          id: "hero",
          label: "Hero",
          description: "Update the membership intro and top action buttons.",
          fieldPrefixes: ["membership.hero."]
        },
        {
          id: "benefits",
          label: "Benefits",
          description: "Edit the four membership benefit cards.",
          fieldPrefixes: ["membership.benefits."]
        },
        {
          id: "members",
          label: "Members",
          description: "Edit the member description and alumni link.",
          fieldPrefixes: ["membership.members."]
        },
        {
          id: "quick-actions",
          label: "Quick actions",
          description: "Update the sidebar action buttons and payment note.",
          fieldPrefixes: ["membership.quickActions."]
        },
        {
          id: "join",
          label: "How to join",
          description: "Edit the join overview and the print and online workflow details.",
          fieldPrefixes: ["membership.join."]
        },
        {
          id: "gallery",
          label: "Gallery",
          description: "Update the membership photo gallery and captions.",
          fieldPrefixes: ["membership.gallery."]
        },
        {
          id: "utility-subscribe",
          label: "Subscribe utility",
          description: "Edit the subscribe utility card.",
          fieldPrefixes: ["membership.utility.subscribe."]
        },
        {
          id: "utility-contact",
          label: "Contact utility",
          description: "Edit the contact utility card.",
          fieldPrefixes: ["membership.utility.contact."]
        }
      ]
    },
    donate: {
      label: "Donate",
      previewPath: "../donate/index.html",
      sections: [
        {
          id: "hero",
          label: "Hero",
          description: "Update the donation page intro message.",
          fieldPrefixes: ["donate.hero."]
        },
        {
          id: "priorities",
          label: "Priorities",
          description: "Edit the funding priorities summary, bullet points, and primary CTA.",
          fieldPrefixes: ["donate.priorities."]
        },
        {
          id: "general",
          label: "General donation",
          description: "Edit the general donation card, links, and payment note.",
          fieldPrefixes: ["donate.general."]
        },
        {
          id: "mail",
          label: "Mail-in donations",
          description: "Edit the mail-in donation instructions and note.",
          fieldPrefixes: ["donate.mail."]
        },
        {
          id: "legacy",
          label: "Legacy giving",
          description: "Update the planned giving options, recipient details, and CTA.",
          fieldPrefixes: ["donate.legacy."]
        },
        {
          id: "shirt",
          label: "T-shirt order",
          description: "Edit the T-shirt order copy, CTA, and image.",
          fieldPrefixes: ["donate.shirt."]
        },
        {
          id: "utility-subscribe",
          label: "Subscribe utility",
          description: "Edit the subscribe utility card.",
          fieldPrefixes: ["donate.utility.subscribe."]
        },
        {
          id: "utility-contact",
          label: "Contact utility",
          description: "Edit the contact utility card.",
          fieldPrefixes: ["donate.utility.contact."]
        },
        {
          id: "utility-thanks",
          label: "Thank-you utility",
          description: "Edit the thank-you utility card.",
          fieldPrefixes: ["donate.utility.thanks."]
        }
      ]
    },
    history: {
      label: "History",
      previewPath: "../history/index.html",
      sections: [
        {
          id: "hero",
          label: "Hero",
          description: "Update the introductory History copy at the top of the page.",
          fieldPrefixes: ["history.hero."]
        },
        {
          id: "stats",
          label: "Stats",
          description: "Edit the four highlight cards below the hero.",
          fieldPrefixes: ["history.stats."]
        },
        {
          id: "overview",
          label: "Overview",
          description: "Adjust the opening overview title and paragraphs.",
          fieldPrefixes: ["history.overview."]
        },
        {
          id: "partnership",
          label: "Partnership",
          description: "Edit the city and school district partnership section.",
          fieldPrefixes: ["history.partnership."]
        },
        {
          id: "downloads",
          label: "Downloads",
          description: "Manage the supporting graph download labels, meta text, and links.",
          fieldPrefixes: ["history.downloads."]
        },
        {
          id: "timeline",
          label: "Timeline",
          description: "Update the timeline intro, legend, and row copy.",
          fieldPrefixes: ["history.timeline."]
        },
        {
          id: "gallery",
          label: "Gallery",
          description: "Edit historic photo sources, alt text, and captions.",
          fieldPrefixes: ["history.gallery."]
        },
        {
          id: "cta-subscribe",
          label: "Subscribe CTA",
          description: "Update the stay connected callout card.",
          fieldPrefixes: ["history.cta.subscribe."]
        },
        {
          id: "cta-contact",
          label: "Contact CTA",
          description: "Update the contact callout card.",
          fieldPrefixes: ["history.cta.contact."]
        }
      ]
    },
    docs: {
      label: "Docs",
      previewPath: "../docs/index.html",
      sections: [
        {
          id: "hero",
          label: "Hero",
          description: "Update the docs page intro copy.",
          fieldPrefixes: ["docs.hero."]
        },
        {
          id: "highlights",
          label: "Highlights",
          description: "Edit the four docs highlight cards.",
          fieldPrefixes: ["docs.highlights."]
        },
        {
          id: "forms",
          label: "Forms library",
          description: "Manage the forms library list, labels, meta text, and links.",
          fieldPrefixes: ["docs.library.forms."]
        },
        {
          id: "supporting",
          label: "Supporting PDFs",
          description: "Manage the supporting document list, labels, meta text, and links.",
          fieldPrefixes: ["docs.library.supporting."]
        },
        {
          id: "notes",
          label: "Notes",
          description: "Edit the notes callout and bullet points.",
          fieldPrefixes: ["docs.notes."]
        },
        {
          id: "access",
          label: "Accessibility",
          description: "Edit the accessibility callout and its two CTAs.",
          fieldPrefixes: ["docs.access."]
        },
        {
          id: "utility-contact",
          label: "Contact utility",
          description: "Edit the contact utility card.",
          fieldPrefixes: ["docs.utility.contact."]
        },
        {
          id: "utility-involved",
          label: "Get involved utility",
          description: "Edit the get involved utility card.",
          fieldPrefixes: ["docs.utility.involved."]
        },
        {
          id: "utility-subscribe",
          label: "Subscribe utility",
          description: "Edit the subscribe utility card.",
          fieldPrefixes: ["docs.utility.subscribe."]
        }
      ]
    },
    news: {
      label: "News",
      previewPath: "../news/index.html",
      sections: [
        {
          id: "hero",
          label: "Hero",
          description: "Update the news page intro copy.",
          fieldPrefixes: ["news.hero."]
        },
        {
          id: "summary",
          label: "Summary",
          description: "Edit the summary callout and highlight chips.",
          fieldPrefixes: ["news.summary."]
        },
        {
          id: "updates",
          label: "Updates",
          description: "Edit the recent updates list and timeline copy.",
          fieldPrefixes: ["news.updates."]
        },
        {
          id: "photos",
          label: "Photos",
          description: "Update the community photo grid, captions, and section link.",
          fieldPrefixes: ["news.photos."]
        },
        {
          id: "utility-contact",
          label: "Contact utility",
          description: "Edit the contact utility card.",
          fieldPrefixes: ["news.utility.contact."]
        },
        {
          id: "utility-docs",
          label: "Docs utility",
          description: "Edit the docs utility card.",
          fieldPrefixes: ["news.utility.docs."]
        },
        {
          id: "utility-donate",
          label: "Donate utility",
          description: "Edit the donate utility card.",
          fieldPrefixes: ["news.utility.donate."]
        }
      ]
    }
  };

  const pageOptions = Array.from(pageSelect.options)
    .map((option) => {
      const page = asString(option.value).toLowerCase();
      if (!page) return null;

      const parsedPhase = Number.parseInt(option.dataset.phase || "1", 10);
      return {
        page,
        phase: Number.isFinite(parsedPhase) && parsedPhase > 0 ? parsedPhase : 1,
        label: visualEditorConfig[page]?.label || toPageLabel(page)
      };
    })
    .filter(Boolean);

  if (!pageOptions.length) {
    return;
  }

  const pageConfig = Object.fromEntries(pageOptions.map((entry) => [entry.page, entry]));
  const initialPage = pageConfig[pageSelect.value] ? pageSelect.value : pageOptions[0].page;
  pageSelect.value = initialPage;

  const previewStyleText = `
[data-content-section].wdac-admin-editable-section {
  position: relative;
  outline: 1px dashed rgba(15, 92, 134, 0.2);
  outline-offset: 6px;
}

[data-content-section].wdac-admin-editable-section:hover,
[data-content-section].wdac-admin-editable-section:focus-within {
  outline-color: rgba(31, 110, 166, 0.65);
}

.wdac-admin-section-edit {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 50;
  min-height: 40px;
  border: 0;
  padding: 0 14px;
  background: #0f5c86;
  color: #ffffff;
  font-family: "Montserrat", "Inter", system-ui, sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
}

.wdac-admin-section-edit:hover,
.wdac-admin-section-edit:focus-visible {
  background: #1f6ea6;
}
`;

  const visualEditorShells = new Map();

  const state = {
    activePage: initialPage,
    cache: Object.fromEntries(pageOptions.map(({ page }) => [page, null])),
    metadata: Object.fromEntries(
      pageOptions.map(({ page }) => [page, { updatedAt: "", publishedAt: "" }])
    ),
    activeSectionPage: "",
    activeSectionId: "",
    dirty: false,
    busy: false
  };

  const getPhaseForPage = (page) => pageConfig[page]?.phase || 1;

  const getPageGroup = (page) =>
    groups.find((group) => group.dataset.contentGroup === page) || null;

  const getPageEditorConfig = (page) => visualEditorConfig[page] || null;

  const getToken = () => sessionStorage.getItem(SESSION_KEY) || "";

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

  const setByPath = (target, path, value) => {
    const segments = path.split(".");
    let cursor = target;

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const isLeaf = index === segments.length - 1;

      if (isLeaf) {
        cursor[segment] = value;
        return;
      }

      if (!cursor[segment] || typeof cursor[segment] !== "object") {
        cursor[segment] = {};
      }

      cursor = cursor[segment];
    }
  };

  const normalizePageContent = (content, page) => {
    if (!content || typeof content !== "object") {
      return { [page]: {} };
    }

    if (content[page] && typeof content[page] === "object") {
      return content;
    }

    return { [page]: content };
  };

  const getFieldsForPage = (page) =>
    fields.filter((field) => field.closest(`[data-content-group='${page}']`));

  const resetPageToDefaults = (page) => {
    getFieldsForPage(page).forEach((field) => {
      field.value = field.dataset.defaultValue || "";
    });
  };

  const populatePage = (page, contentRoot) => {
    const scopedRoot = normalizePageContent(contentRoot, page);

    getFieldsForPage(page).forEach((field) => {
      const key = field.dataset.contentField || "";
      const rawValue = getByPath(scopedRoot, key);
      const nextValue = asString(rawValue);
      field.value = nextValue || field.dataset.defaultValue || "";
    });
  };

  const collectPageDraft = (page) => {
    const draft = {};

    getFieldsForPage(page).forEach((field) => {
      const key = field.dataset.contentField || "";
      const value = asString(field.value);
      if (!key || !value) return;
      setByPath(draft, key, value);
    });

    return draft;
  };

  const formatDateTime = (value) => {
    const timestamp = Date.parse(value || "");
    if (Number.isNaN(timestamp)) return "";

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(timestamp));
  };

  const showInlineNote = (message, isError = false) => {
    if (!message) {
      inlineNote.hidden = true;
      inlineNote.textContent = "";
      delete inlineNote.dataset.state;
      return;
    }

    inlineNote.hidden = false;
    inlineNote.textContent = message;
    inlineNote.dataset.state = isError ? "error" : "info";
  };

  const setStatusBadgeState = (node, message, variant = "muted") => {
    if (!node) return;

    node.textContent = message;
    node.classList.remove(
      "admin-status-badge--active",
      "admin-status-badge--pending",
      "admin-status-badge--lapsed",
      "admin-status-badge--muted"
    );

    const safeVariant = ["active", "pending", "lapsed", "muted"].includes(variant)
      ? variant
      : "muted";

    node.classList.add(`admin-status-badge--${safeVariant}`);
  };

  const setConnectionState = (message, variant = "muted") => {
    setStatusBadgeState(connectionBadge, message, variant);
  };

  const setMeta = (message) => {
    metaNote.textContent = message;
  };

  const updateMetaForPage = (page) => {
    const details = state.metadata[page] || { updatedAt: "", publishedAt: "" };
    const updatedLabel = formatDateTime(details.updatedAt);
    const publishedLabel = formatDateTime(details.publishedAt);

    if (updatedLabel && publishedLabel) {
      setMeta(`Draft updated ${updatedLabel}. Last published ${publishedLabel}.`);
      return;
    }

    if (updatedLabel) {
      setMeta(`Draft updated ${updatedLabel}. Not published yet.`);
      return;
    }

    if (publishedLabel) {
      setMeta(`No draft metadata available. Last published ${publishedLabel}.`);
      return;
    }

    setMeta("No saved content metadata returned yet for this page.");
  };

  const setBusy = (busy, activeButton = null) => {
    state.busy = busy;

    [refreshButton, saveButton, publishButton, pageSelect].forEach((node) => {
      node.disabled = busy;
    });

    if (activeButton && busy) {
      if (!activeButton.dataset.defaultLabel) {
        activeButton.dataset.defaultLabel = activeButton.textContent;
      }
      const busyLabel = activeButton.dataset.busyLabel || "Working...";
      activeButton.textContent = busyLabel;
    }

    if (activeButton && !busy && activeButton.dataset.defaultLabel) {
      activeButton.textContent = activeButton.dataset.defaultLabel;
    }
  };

  refreshButton.dataset.busyLabel = "Loading...";
  saveButton.dataset.busyLabel = "Saving...";
  publishButton.dataset.busyLabel = "Publishing...";

  const setGroupVisibility = (page) => {
    groups.forEach((group) => {
      const isActive = group.dataset.contentGroup === page;
      group.hidden = !isActive;
    });
  };

  const getEditorRefs = (page) => visualEditorShells.get(page) || null;

  const setPreviewState = (page, message, variant = "muted") => {
    const refs = getEditorRefs(page);
    if (!refs) return;
    setStatusBadgeState(refs.previewBadge, message, variant);
  };

  const setPreviewNote = (page, message) => {
    const refs = getEditorRefs(page);
    if (!refs) return;
    refs.previewMetaNote.textContent = message;
  };

  const getPreviewDefaultNote = (page) => {
    const config = getPageEditorConfig(page);
    if (!config) return "Click an Edit button in the preview to open one field group at a time.";
    return `Click an Edit button in the ${config.label} preview to open one field group at a time.`;
  };

  const closeSection = (page) => {
    const refs = getEditorRefs(page);
    if (!refs) return;

    if (state.activeSectionPage === page) {
      state.activeSectionPage = "";
      state.activeSectionId = "";
    }

    refs.panels.forEach((panel) => {
      panel.hidden = true;
    });

    refs.editorDrawer.hidden = true;
    refs.editorTitle.textContent = "Pick a section";
    refs.editorDescription.textContent = "Click an Edit button in the preview to open the matching fields.";
    refs.editorEmpty.hidden = false;
    setPreviewNote(page, getPreviewDefaultNote(page));
  };

  const openSection = (page, sectionId, { focus = true } = {}) => {
    const refs = getEditorRefs(page);
    if (!refs) return;

    const section = refs.sectionConfig.get(sectionId);
    const panel = refs.panels.get(sectionId);
    if (!section || !panel) return;

    state.activeSectionPage = page;
    state.activeSectionId = sectionId;

    refs.panels.forEach((candidate, id) => {
      candidate.hidden = id !== sectionId;
    });

    refs.editorDrawer.hidden = false;
    refs.editorTitle.textContent = section.label;
    refs.editorDescription.textContent = section.description;
    refs.editorEmpty.hidden = true;
    setPreviewNote(page, `Editing ${section.label}. Changes update the preview as you type.`);

    if (!focus) return;

    const firstField = panel.querySelector("[data-content-field]");
    if (firstField && typeof firstField.focus === "function") {
      firstField.focus();
    }
  };

  const buildSectionPanel = (page, refs, section, fieldNodes) => {
    if (!fieldNodes.length) return false;

    const panelNode = document.createElement("section");
    panelNode.className = "admin-history-section-panel";
    panelNode.dataset.contentSectionPanel = section.id;
    panelNode.hidden = true;

    const panelHead = document.createElement("div");
    panelHead.className = "admin-history-section-panel__head";
    panelHead.innerHTML = `
      <p class="admin-history-section-panel__eyebrow">${refs.config.label} page</p>
      <h5>${section.label}</h5>
      <p>${section.description}</p>
    `;

    const panelGrid = document.createElement("div");
    panelGrid.className = "admin-history-section-panel__grid";
    fieldNodes.forEach((fieldNode) => {
      panelGrid.appendChild(fieldNode);
    });

    panelNode.appendChild(panelHead);
    panelNode.appendChild(panelGrid);
    refs.sectionHost.appendChild(panelNode);
    refs.panels.set(section.id, panelNode);
    refs.sectionConfig.set(section.id, section);

    return true;
  };

  const buildVisualEditorShell = (page, refs) => {
    if (refs.shell.dataset.initialized === "true") {
      return;
    }

    const fieldNodes = Array.from(refs.sourceGrid.children).filter(
      (node) => node instanceof HTMLElement && node.classList.contains("admin-field")
    );
    const remainingNodes = [...fieldNodes];

    refs.config.sections.forEach((section) => {
      const matchedNodes = remainingNodes.filter((fieldNode) => {
        const field = fieldNode.querySelector("[data-content-field]");
        const key = field?.dataset.contentField || "";
        return section.fieldPrefixes.some((prefix) => key.startsWith(prefix));
      });

      if (!matchedNodes.length) {
        return;
      }

      buildSectionPanel(page, refs, section, matchedNodes);
      matchedNodes.forEach((node) => {
        const index = remainingNodes.indexOf(node);
        if (index >= 0) {
          remainingNodes.splice(index, 1);
        }
      });
    });

    if (remainingNodes.length) {
      buildSectionPanel(page, refs, {
        id: "other",
        label: "Other fields",
        description: "Fields that are not grouped into a preview section yet.",
        fieldPrefixes: []
      }, remainingNodes);
    }

    refs.sourceGrid.hidden = true;
    refs.sourceGrid.dataset.historySectionSource = "true";
    refs.shell.dataset.initialized = "true";
  };

  const createVisualEditorShell = (page) => {
    const config = getPageEditorConfig(page);
    const group = getPageGroup(page);
    const sourceGrid = group?.querySelector(".admin-content-grid");
    if (!config || !group || !sourceGrid) {
      return null;
    }

    const shellNode = document.createElement("div");
    shellNode.className = "admin-content-visual-editor";
    shellNode.dataset.contentVisualEditor = page;
    shellNode.innerHTML = `
      <div class="admin-content-visual-editor__head">
        <div>
          <p class="admin-content-visual-editor__eyebrow">${config.label} visual editor</p>
          <h4>Edit the real page layout</h4>
          <p>Use the live ${config.label} page preview to pick a section, then edit only the matching fields in the drawer.</p>
        </div>

        <button class="admin-outline-btn" type="button" data-content-preview-reload>Reload preview</button>
      </div>

      <div class="admin-history-workspace">
        <div class="admin-history-preview-shell">
          <div class="admin-history-preview-toolbar">
            <span class="admin-status-badge admin-status-badge--muted" data-content-preview-state>Preview loading</span>
            <p data-content-preview-meta>${getPreviewDefaultNote(page)}</p>
          </div>

          <div class="admin-history-preview-frame-wrap">
            <iframe
              class="admin-history-preview-frame"
              title="${config.label} page content preview"
              src="${config.previewPath}"
              loading="lazy"
              data-content-preview-frame
            ></iframe>
          </div>
        </div>

        <aside class="admin-history-editor-drawer" data-content-editor-drawer hidden>
          <div class="admin-history-editor-drawer__head">
            <div>
              <p class="admin-history-editor-drawer__eyebrow">${config.label} section</p>
              <h4 data-content-editor-title>Pick a section</h4>
              <p data-content-editor-description>Click an Edit button in the preview to open the matching fields.</p>
            </div>

            <button class="admin-outline-btn" type="button" data-content-editor-close>Close</button>
          </div>

          <div class="admin-history-editor-drawer__body" data-content-editor-body>
            <div class="admin-history-editor-empty" data-content-editor-empty>
              <p>Preview the live ${config.label} page, then click an Edit button to focus that section's fields.</p>
            </div>
          </div>
        </aside>
      </div>
    `;

    group.insertBefore(shellNode, sourceGrid);

    const refs = {
      config,
      group,
      shell: shellNode,
      sourceGrid,
      previewFrame: shellNode.querySelector("[data-content-preview-frame]"),
      reloadButton: shellNode.querySelector("[data-content-preview-reload]"),
      previewBadge: shellNode.querySelector("[data-content-preview-state]"),
      previewMetaNote: shellNode.querySelector("[data-content-preview-meta]"),
      editorDrawer: shellNode.querySelector("[data-content-editor-drawer]"),
      editorTitle: shellNode.querySelector("[data-content-editor-title]"),
      editorDescription: shellNode.querySelector("[data-content-editor-description]"),
      closeButton: shellNode.querySelector("[data-content-editor-close]"),
      editorNav: shellNode.querySelector("[data-content-editor-nav]"),
      editorBody: shellNode.querySelector("[data-content-editor-body]"),
      editorEmpty: shellNode.querySelector("[data-content-editor-empty]"),
      sectionHost: document.createElement("div"),
      sectionConfig: new Map(),
      panels: new Map()
    };

    refs.sectionHost.className = "admin-history-editor-sections";
    refs.editorBody.appendChild(refs.sectionHost);

    refs.reloadButton?.addEventListener("click", () => {
      if (!refs.previewFrame) {
        return;
      }

      setPreviewState(page, "Reloading preview", "pending");
      refs.previewFrame.src = refs.config.previewPath;
    });

    refs.closeButton?.addEventListener("click", () => {
      closeSection(page);
    });

    refs.previewFrame?.addEventListener("load", () => {
      setPreviewState(page, "Preview loading", "pending");
      injectPreviewControls(page);
    });

    visualEditorShells.set(page, refs);
    buildVisualEditorShell(page, refs);

    if (refs.previewFrame?.contentDocument?.readyState === "complete") {
      injectPreviewControls(page);
    } else {
      setPreviewState(page, "Preview loading", "pending");
    }

    return refs;
  };

  const ensureVisualEditorShell = (page) => getEditorRefs(page) || createVisualEditorShell(page);

  const syncPreview = (page) => {
    if (state.activePage !== page) {
      return;
    }

    const refs = ensureVisualEditorShell(page);
    if (!refs || !refs.previewFrame) {
      return;
    }

    const previewWindow = refs.previewFrame.contentWindow;
    if (!previewWindow || typeof previewWindow.__wdacApplyContentPreview !== "function") {
      setPreviewState(page, "Preview loading", "pending");
      return;
    }

    previewWindow.__wdacApplyContentPreview(normalizePageContent(collectPageDraft(page), page));
    setPreviewState(page, state.dirty ? "Draft preview live" : "Preview ready", "active");
  };

  const injectPreviewControls = (page) => {
    const refs = ensureVisualEditorShell(page);
    if (!refs || !refs.previewFrame) {
      return;
    }

    const previewDocument = refs.previewFrame.contentDocument;
    const previewWindow = refs.previewFrame.contentWindow;
    if (!previewDocument || !previewWindow) {
      setPreviewState(page, "Preview unavailable", "pending");
      return;
    }

    let styleNode = previewDocument.getElementById("wdac-admin-page-preview-style");
    if (!styleNode) {
      styleNode = previewDocument.createElement("style");
      styleNode.id = "wdac-admin-page-preview-style";
      styleNode.textContent = previewStyleText;
      previewDocument.head.appendChild(styleNode);
    }

    if (!previewDocument.documentElement.dataset.wdacAdminPreviewBound) {
      previewDocument.documentElement.dataset.wdacAdminPreviewBound = "true";
      previewDocument.addEventListener("click", (event) => {
        const interactiveNode = event.target.closest("a[href], button");
        if (!interactiveNode || interactiveNode.classList.contains("wdac-admin-section-edit")) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
      });
    }

    Array.from(previewDocument.querySelectorAll(".wdac-admin-section-edit")).forEach((button) => {
      button.remove();
    });

    previewDocument.querySelectorAll("[data-content-section]").forEach((node) => {
      const sectionId = node.dataset.contentSection || "";
      const section = refs.sectionConfig.get(sectionId);
      if (!section || !refs.panels.has(sectionId)) {
        return;
      }

      node.classList.add("wdac-admin-editable-section");

      const button = previewDocument.createElement("button");
      button.type = "button";
      button.className = "wdac-admin-section-edit";
      button.textContent = `Edit ${section.label}`;
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openSection(page, sectionId);
      });

      node.appendChild(button);
    });

    setPreviewNote(page, `Click an Edit button in the ${refs.config.label} preview to focus that section's fields.`);
    syncPreview(page);
  };

  const syncPageUi = (page) => {
    const refs = ensureVisualEditorShell(page);
    if (!refs) {
      return;
    }

    syncPreview(page);
  };

  const syncAuthState = () => {
    const token = getToken();
    const signedIn = Boolean(token);

    refreshButton.disabled = !signedIn;
    saveButton.disabled = !signedIn;
    publishButton.disabled = !signedIn;
    pageSelect.disabled = !signedIn;

    if (!signedIn) {
      setConnectionState("Waiting for sign-in", "muted");
      setMeta("Sign in to load and publish content.");
      return false;
    }

    setConnectionState("Connected", "active");
    return true;
  };

  const requestContentJson = async (path, options = {}) => {
    const token = getToken();
    if (!token) {
      throw new Error("Sign in to use the content editor.");
    }

    const hasBody = Object.prototype.hasOwnProperty.call(options, "body");
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(payload.error || "Content API request failed.");
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  };

  const parsePayloadForPage = (payload, page) => {
    const records = [payload?.record, payload?.page, payload].filter(
      (entry) => entry && typeof entry === "object"
    );

    let draft = null;
    let updatedAt = "";
    let publishedAt = "";

    for (const record of records) {
      const draftCandidates = [
        record?.draft?.content,
        record?.draft?.fields,
        record?.draft,
        record?.content,
        record?.fields
      ];

      for (const candidate of draftCandidates) {
        if (!candidate || typeof candidate !== "object") continue;
        draft = normalizePageContent(candidate, page);
        break;
      }

      if (!updatedAt) {
        updatedAt =
          record?.updatedAt ||
          record?.draft?.updatedAt ||
          record?.draftUpdatedAt ||
          payload?.updatedAt ||
          "";
      }

      if (!publishedAt) {
        publishedAt =
          record?.publishedAt ||
          record?.published?.updatedAt ||
          payload?.publishedAt ||
          "";
      }

      if (draft) break;
    }

    return {
      draft: draft || { [page]: {} },
      updatedAt,
      publishedAt
    };
  };

  const handleRequestError = (error) => {
    if (error?.status === 401) {
      setConnectionState("Session expired", "lapsed");
      showInlineNote("Your admin session expired. Sign in again to continue.", true);
      return;
    }

    if (error?.status === 404 || error?.status === 501) {
      setConnectionState("Endpoint unavailable", "pending");
      showInlineNote(
        "Content endpoints or page configuration are not available yet. The public site remains unchanged until they are deployed.",
        true
      );
      return;
    }

    setConnectionState("Connection issue", "pending");
    showInlineNote(error?.message || "Unable to complete that content request.", true);
  };

  const loadPage = async ({ announce = true } = {}) => {
    const signedIn = syncAuthState();
    const page = state.activePage;
    const phase = getPhaseForPage(page);

    if (!signedIn) {
      if (announce) showInlineNote("Sign in first, then load content.", true);
      return;
    }

    setBusy(true, refreshButton);

    try {
      const payload = await requestContentJson(
        `/content/pages/${encodeURIComponent(page)}?phase=${encodeURIComponent(String(phase))}&view=draft`
      );
      const parsed = parsePayloadForPage(payload, page);

      state.cache[page] = parsed.draft;
      state.metadata[page] = {
        updatedAt: parsed.updatedAt,
        publishedAt: parsed.publishedAt
      };
      state.dirty = false;

      populatePage(page, parsed.draft);
      updateMetaForPage(page);
      setConnectionState("Connected", "active");
      syncPageUi(page);
      if (announce) {
        showInlineNote(`Loaded ${page} content draft.`, false);
      }
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusy(false, refreshButton);
    }
  };

  const saveDraft = async () => {
    const signedIn = syncAuthState();
    const page = state.activePage;
    const phase = getPhaseForPage(page);

    if (!signedIn) {
      showInlineNote("Sign in first, then save your draft.", true);
      return;
    }

    const draft = collectPageDraft(page);
    if (!Object.keys(draft).length) {
      showInlineNote("Add at least one value before saving the draft.", true);
      return;
    }

    setBusy(true, saveButton);

    try {
      const payload = await requestContentJson(
        `/content/pages/${encodeURIComponent(page)}?phase=${encodeURIComponent(String(phase))}`,
        {
          method: "PUT",
          body: JSON.stringify({
            page,
            phase,
            saveMode: "draft",
            draft
          })
        }
      );

      const parsed = parsePayloadForPage(payload, page);
      state.cache[page] = parsed.draft;
      state.metadata[page] = {
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        publishedAt: parsed.publishedAt || state.metadata[page].publishedAt
      };
      state.dirty = false;

      populatePage(page, parsed.draft);
      updateMetaForPage(page);
      showInlineNote(`Draft saved for ${page}.`, false);
      setConnectionState("Connected", "active");
      syncPageUi(page);
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusy(false, saveButton);
    }
  };

  const publishPage = async () => {
    const signedIn = syncAuthState();
    const page = state.activePage;
    const phase = getPhaseForPage(page);

    if (!signedIn) {
      showInlineNote("Sign in first, then publish content.", true);
      return;
    }

    const draft = collectPageDraft(page);
    if (!Object.keys(draft).length) {
      showInlineNote("Add at least one value before publishing.", true);
      return;
    }

    setBusy(true, publishButton);

    try {
      const payload = await requestContentJson(
        `/content/pages/${encodeURIComponent(page)}/publish?phase=${encodeURIComponent(String(phase))}`,
        {
          method: "POST",
          body: JSON.stringify({
            page,
            phase,
            draft
          })
        }
      );

      const parsed = parsePayloadForPage(payload, page);
      state.cache[page] = parsed.draft;
      state.metadata[page] = {
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        publishedAt: parsed.publishedAt || new Date().toISOString()
      };
      state.dirty = false;

      populatePage(page, parsed.draft);
      updateMetaForPage(page);
      showInlineNote(`Published ${page} content.`, false);
      setConnectionState("Connected", "active");
      syncPageUi(page);
    } catch (error) {
      handleRequestError(error);
    } finally {
      setBusy(false, publishButton);
    }
  };

  const switchPage = (page) => {
    const previousPage = state.activePage;
    if (previousPage && previousPage !== page) {
      closeSection(previousPage);
    }

    state.activePage = page;
    state.dirty = false;
    setGroupVisibility(page);

    if (state.cache[page]) {
      populatePage(page, state.cache[page]);
      updateMetaForPage(page);
      showInlineNote("", false);
      syncPageUi(page);
      return;
    }

    resetPageToDefaults(page);
    setMeta("No cached draft loaded yet for this page. Use Load content.");
    showInlineNote("", false);
    syncPageUi(page);
  };

  pageSelect.addEventListener("change", () => {
    switchPage(pageSelect.value || "home");
    syncAuthState();
  });

  contentForm.addEventListener("input", (event) => {
    const targetField = event.target.closest("[data-content-field]");
    if (!targetField) return;

    if (!targetField.closest(`[data-content-group='${state.activePage}']`)) {
      return;
    }

    state.dirty = true;
    setMeta("Unsaved changes in this page draft.");
    syncPageUi(state.activePage);
  });

  refreshButton.addEventListener("click", () => {
    loadPage({ announce: true });
  });

  saveButton.addEventListener("click", () => {
    saveDraft();
  });

  publishButton.addEventListener("click", () => {
    publishPage();
  });

  const dashboardExperience = document.getElementById("admin-dashboard-experience");
  if (dashboardExperience && typeof MutationObserver === "function") {
    const observer = new MutationObserver(() => {
      syncAuthState();
    });
    observer.observe(dashboardExperience, {
      attributes: true,
      attributeFilter: ["hidden"]
    });
  }

  window.addEventListener("focus", () => {
    syncAuthState();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncAuthState();
    }
  });

  setGroupVisibility(state.activePage);
  syncAuthState();
  pageOptions.forEach(({ page }) => {
    resetPageToDefaults(page);
  });
  syncPageUi(state.activePage);
  setMeta("Sign in, pick a page, and load current content.");
})();
