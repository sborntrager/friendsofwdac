// Social Media panel for /admin. Talks to the social Worker at <admin api>/social/*
// using the same admin sign-in token as the rest of the dashboard.
(() => {
  const SESSION_KEY = "fo_wdac_admin_token_v3";
  const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
  const MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime"];
  // Soft limits (characters). Shown as a warning only; each network enforces its own rules.
  const SERVICE_LIMITS = { twitter: 280, bluesky: 300, threads: 500, mastodon: 500, instagram: 2200, linkedin: 3000 };
  const SERVICE_NAMES = {
    twitter: "X", facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", bluesky: "Bluesky", threads: "Threads",
    mastodon: "Mastodon", googlebusiness: "Google Business", pinterest: "Pinterest", tiktok: "TikTok", youtube: "YouTube",
  };
  const MISSING_LABELS = {
    BUFFER_API_KEY: "Buffer API key (kept secret on the server)",
    BUFFER_ORGANIZATION_ID: "Buffer organization ID",
    PUBLIC_MEDIA_BASE_URL: "Public web address for uploaded photos and videos",
    MEDIA_BUCKET: "Photo and video storage (R2 bucket)",
    DB: "Social posts database (D1)",
    ADMIN_API: "Link to the admin sign-in service",
    ALLOWED_ORIGINS: "Allowed website addresses",
  };
  const STATUS_LABELS = { draft: "Draft", approved: "Approved", publishing: "Sending...", queued: "In Buffer", failed: "Needs attention" };

  const shell = document.querySelector("[data-admin-api-base]");
  const panel = document.getElementById("admin-social-panel");
  if (!shell || !panel) return;
  const apiBase = String(shell.dataset.adminApiBase || "").trim().replace(/\/+$/, "");
  if (!apiBase) return;
  const base = `${apiBase}/social`;

  const $ = (id) => document.getElementById(id);
  const refs = {
    state: $("admin-social-state"), note: $("admin-social-note"), setup: $("admin-social-setup"), setupCopy: $("admin-social-setup-copy"),
    setupList: $("admin-social-setup-list"), main: $("admin-social-main"), form: $("admin-social-form"), title: $("admin-social-title"),
    body: $("admin-social-body"), count: $("admin-social-count"), media: $("admin-social-media"), mediaPreview: $("admin-social-media-preview"),
    mediaImage: $("admin-social-media-image"), mediaLabel: $("admin-social-media-label"), mediaClear: $("admin-social-media-clear"),
    channels: $("admin-social-channels-list"), sync: $("admin-social-sync"), when: $("admin-social-when"), save: $("admin-social-save"),
    formStatus: $("admin-social-form-status"), filter: $("admin-social-filter"), refresh: $("admin-social-refresh"), posts: $("admin-social-posts-list"),
  };

  const state = { channels: [], selected: new Set(), mediaId: null, mediaUrl: null, uploading: false, ready: false, loading: false, lastTry: 0, lastPosts: [], confirming: null, open: new Set() };

  const getToken = () => {
    try {
      return sessionStorage.getItem(SESSION_KEY) || "";
    } catch {
      return "";
    }
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const setState = (text, tone) => {
    refs.state.textContent = text;
    refs.state.className = `admin-social-chip admin-social-chip--${tone}`;
  };

  const showNote = (message, isError = false) => {
    refs.note.textContent = message;
    refs.note.hidden = !message;
    refs.note.classList.toggle("admin-panel-note--error", Boolean(isError));
  };

  const parseTime = (value) => {
    if (!value) return null;
    const text = String(value);
    const parsed = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(text) ? text : `${text.replace(" ", "T")}Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const formatTime = (value) => {
    const date = parseTime(value);
    return date ? date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "";
  };

  const serviceName = (service) => SERVICE_NAMES[service] || (service ? service.charAt(0).toUpperCase() + service.slice(1) : "Channel");

  const request = async (path, options = {}) => {
    const response = await fetch(`${base}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${getToken()}`, ...(options.headers || {}) },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || `Request failed (${response.status})`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  };

  const handleError = (error, fallback = "Something went wrong.") => {
    if (error?.status === 401) {
      state.ready = false;
      setState("Session expired", "lapsed");
      showNote("Your admin session expired. Sign in again to continue.", true);
    } else if (error?.status === 404) {
      setState("Not set up yet", "pending");
      showNote("The social posting service is not live yet.", true);
    } else if (error?.name === "TypeError") {
      setState("Cannot connect", "lapsed");
      showNote("Could not reach the social posting service. Check your connection and try again.", true);
    } else {
      showNote(error?.message || fallback, true);
    }
  };

  // ---- Health: shows what is missing before anyone has Buffer keys --------------------
  const checkHealth = async () => {
    refs.setup.hidden = true;
    let response;
    try {
      response = await fetch(`${base}/health`);
    } catch {
      setState("Cannot connect", "lapsed");
      showNote("Could not reach the social posting service.", true);
      return false;
    }
    const payload = await response.json().catch(() => ({}));
    if (response.status === 404 || (!response.ok && !Array.isArray(payload.missing))) {
      setState("Not set up yet", "pending");
      refs.setupCopy.textContent = "The social posting service has not been turned on for this site yet. Once it is, this panel will work.";
      refs.setupList.replaceChildren();
      refs.setup.hidden = false;
      return false;
    }
    if (!response.ok) {
      const labels = payload.missing.map((item) => MISSING_LABELS[item.replace(/ \(.*\)$/, "")] || item);
      setState("Setup needed", "pending");
      refs.setupCopy.textContent = "Social posting is built but not switched on yet. These items are still missing:";
      refs.setupList.replaceChildren(...labels.map((label) => el("li", "", label)));
      refs.setup.hidden = false;
      return false;
    }
    return true;
  };

  // ---- Channels --------------------------------------------------------------------------
  const renderChannels = () => {
    if (!state.channels.length) {
      refs.channels.replaceChildren(el("p", "admin-social-hint", "No channels yet. Click \"Sync channels from Buffer\" to load them."));
      return;
    }
    refs.channels.replaceChildren(...state.channels.map((channel) => {
      const label = el("label", "admin-social-channel");
      const box = el("input");
      box.type = "checkbox";
      box.value = channel.id;
      box.checked = state.selected.has(channel.id);
      box.addEventListener("change", () => {
        if (box.checked) state.selected.add(channel.id);
        else state.selected.delete(channel.id);
        updateCount();
      });
      label.append(box, el("span", "", `${channel.name} `), el("span", "admin-social-hint", `(${serviceName(channel.service)})`));
      return label;
    }));
  };

  const loadChannels = async () => {
    const payload = await request("/channels");
    state.channels = payload.channels || [];
    state.selected = new Set([...state.selected].filter((id) => state.channels.some((channel) => channel.id === id)));
    renderChannels();
  };

  const syncChannels = async () => {
    refs.sync.disabled = true;
    showNote("");
    try {
      const payload = await request("/channels/sync", { method: "POST" });
      showNote(`Synced ${payload.channels.length} channel${payload.channels.length === 1 ? "" : "s"} from Buffer.`);
      await loadChannels();
    } catch (error) {
      handleError(error, "Could not sync channels from Buffer.");
    } finally {
      refs.sync.disabled = false;
    }
  };

  // ---- Composer --------------------------------------------------------------------------
  const updateCount = () => {
    const length = refs.body.value.length;
    const warnings = [];
    for (const channel of state.channels) {
      const limit = SERVICE_LIMITS[channel.service];
      if (state.selected.has(channel.id) && limit && length > limit) warnings.push(`${channel.name} allows about ${limit}`);
    }
    refs.count.textContent = `${length} character${length === 1 ? "" : "s"}${warnings.length ? `. Too long for: ${warnings.join("; ")}.` : ""}`;
    refs.count.classList.toggle("admin-social-hint--warn", warnings.length > 0);
  };

  const clearMedia = () => {
    state.mediaId = null;
    state.mediaUrl = null;
    refs.media.value = "";
    refs.mediaPreview.hidden = true;
    refs.mediaImage.hidden = true;
    refs.mediaImage.removeAttribute("src");
  };

  const uploadMedia = async (file) => {
    if (!MEDIA_TYPES.includes(file.type)) {
      refs.formStatus.textContent = "Use a JPEG, PNG, GIF, WebP, MP4 or MOV file.";
      refs.media.value = "";
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      refs.formStatus.textContent = "That file is over 10 MB. Choose a smaller one.";
      refs.media.value = "";
      return;
    }
    state.uploading = true;
    refs.save.disabled = true;
    refs.formStatus.textContent = "Uploading...";
    try {
      const uploaded = await request("/media/upload", { method: "POST", headers: { "Content-Type": file.type }, body: file });
      state.mediaId = uploaded.id;
      state.mediaUrl = uploaded.url;
      refs.mediaLabel.textContent = file.name;
      refs.mediaPreview.hidden = false;
      if (file.type.startsWith("image/")) {
        refs.mediaImage.src = uploaded.url;
        refs.mediaImage.hidden = false;
      } else {
        refs.mediaImage.hidden = true;
      }
      refs.formStatus.textContent = "File uploaded.";
    } catch (error) {
      clearMedia();
      refs.formStatus.textContent = "";
      handleError(error, "The upload failed.");
    } finally {
      state.uploading = false;
      refs.save.disabled = false;
    }
  };

  const saveDraft = async (event) => {
    event.preventDefault();
    showNote("");
    const body = refs.body.value.trim();
    const channelIds = [...state.selected];
    if (!body) return void (refs.formStatus.textContent = "Write some text for the post first.");
    if (!channelIds.length) return void (refs.formStatus.textContent = "Choose at least one channel.");
    let scheduledFor;
    if (refs.when.value) {
      const when = new Date(refs.when.value);
      if (Number.isNaN(when.getTime()) || when.getTime() < Date.now() + 60_000) return void (refs.formStatus.textContent = "Pick a send time in the future, or leave it blank.");
      scheduledFor = when.toISOString();
    }
    refs.save.disabled = true;
    refs.formStatus.textContent = "Saving...";
    try {
      await request("/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: refs.title.value.trim(), body, channelIds, scheduledFor, mediaAssetId: state.mediaId || undefined }),
      });
      refs.form.reset();
      state.selected.clear();
      clearMedia();
      renderChannels();
      updateCount();
      refs.formStatus.textContent = "Draft saved. Approve it in the list to send it.";
      await loadPosts();
    } catch (error) {
      refs.formStatus.textContent = "";
      handleError(error, "Could not save the draft.");
    } finally {
      refs.save.disabled = false;
    }
  };

  // ---- Posts -----------------------------------------------------------------------------
  const statusChip = (status) => el("span", `admin-social-chip admin-social-chip--${status}`, STATUS_LABELS[status] || status);

  const renderTargets = (host, detail) => {
    host.replaceChildren();
    if (!detail.targets.length) return;
    const list = el("ul", "admin-social-targets");
    for (const target of detail.targets) {
      const item = el("li");
      item.append(statusChip(target.status), el("span", "", ` ${target.channelName} (${serviceName(target.service)})`));
      if (target.errorMessage) item.append(el("span", "admin-social-error", ` ${target.errorMessage}`));
      list.append(item);
    }
    host.append(list);
  };

  const toggleDetails = async (post, host, button) => {
    if (state.open.has(post.id)) {
      state.open.delete(post.id);
      host.replaceChildren();
      button.textContent = "Details";
      return;
    }
    button.disabled = true;
    try {
      renderTargets(host, await request(`/posts/${post.id}`));
      state.open.add(post.id);
      button.textContent = "Hide details";
    } catch (error) {
      handleError(error, "Could not load the details.");
    } finally {
      button.disabled = false;
    }
  };

  const act = async (post, action, button) => {
    button.disabled = true;
    showNote("");
    try {
      const result = await request(`/posts/${post.id}/${action}`, { method: "POST" });
      if (action === "publish") {
        const failed = (result.results || []).filter((item) => !item.ok).length;
        showNote(failed ? `${failed} channel${failed === 1 ? "" : "s"} did not accept the post. Open Details to see why, then try again.` : "Sent to Buffer.", Boolean(failed));
        if (result.rateLimited) showNote("Buffer asked us to slow down. Wait a few minutes and send again.", true);
      }
    } catch (error) {
      handleError(error, `Could not ${action} the post.`);
    } finally {
      state.confirming = null;
      await loadPosts().catch((error) => handleError(error));
    }
  };

  const renderPost = (post) => {
    const card = el("article", "admin-social-post");
    const head = el("div", "admin-social-post__head");
    head.append(el("strong", "", post.title || post.body.slice(0, 70) + (post.body.length > 70 ? "..." : "")), statusChip(post.status));
    const when = post.scheduledFor ? `Scheduled for ${formatTime(post.scheduledFor)}` : `Created ${formatTime(post.createdAt)}`;
    const meta = el("p", "admin-social-hint", `${post.channelCount} channel${post.channelCount === 1 ? "" : "s"} | ${when}${post.createdBy ? ` | ${post.createdBy}` : ""}`);
    const text = el("p", "admin-social-post__body", post.body.length > 240 ? `${post.body.slice(0, 240)}...` : post.body);
    card.append(head, meta, text);
    if (post.mediaUrl) {
      const link = el("a", "admin-inline-link", "View attached file");
      link.href = post.mediaUrl;
      link.target = "_blank";
      link.rel = "noopener";
      card.append(link);
    }
    const details = el("div", "admin-social-post__details");
    const actions = el("div", "admin-action-row");
    const detailButton = el("button", "admin-outline-btn admin-outline-btn--compact", state.open.has(post.id) ? "Hide details" : "Details");
    detailButton.type = "button";
    detailButton.addEventListener("click", () => toggleDetails(post, details, detailButton));
    actions.append(detailButton);

    if (post.status === "draft") {
      const approve = el("button", "admin-primary-btn", "Approve");
      approve.type = "button";
      approve.addEventListener("click", () => act(post, "approve", approve));
      actions.append(approve);
    } else if (post.status === "approved" || post.status === "failed") {
      if (state.confirming === post.id) {
        const question = el("span", "admin-social-confirm", `Send to ${post.channelCount} channel${post.channelCount === 1 ? "" : "s"} now?`);
        const yes = el("button", "admin-primary-btn", "Yes, send");
        yes.type = "button";
        yes.addEventListener("click", () => act(post, "publish", yes));
        const no = el("button", "admin-outline-btn admin-outline-btn--compact", "Cancel");
        no.type = "button";
        no.addEventListener("click", () => { state.confirming = null; renderPosts(state.lastPosts); });
        actions.append(question, yes, no);
      } else {
        const send = el("button", "admin-primary-btn", post.status === "failed" ? "Try again" : "Send to Buffer");
        send.type = "button";
        send.addEventListener("click", () => { state.confirming = post.id; renderPosts(state.lastPosts); });
        actions.append(send);
      }
    }
    card.append(actions, details);
    if (state.open.has(post.id)) request(`/posts/${post.id}`).then((detail) => renderTargets(details, detail)).catch(() => {});
    return card;
  };

  const renderPosts = (posts) => {
    state.lastPosts = posts;
    if (!posts.length) {
      refs.posts.replaceChildren(el("p", "admin-social-hint", refs.filter.value ? "No posts with that status." : "No posts yet. Save a draft to get started."));
      return;
    }
    refs.posts.replaceChildren(...posts.map(renderPost));
  };

  const loadPosts = async () => {
    const status = refs.filter.value;
    const payload = await request(`/posts?limit=50${status ? `&status=${encodeURIComponent(status)}` : ""}`);
    renderPosts(payload.posts || []);
  };

  // ---- Start-up --------------------------------------------------------------------------
  // Refresh stays usable once signed in, so "Setup needed" can be re-checked after the keys are added.
  const setControlsEnabled = (enabled) => {
    for (const control of panel.querySelectorAll("input, textarea, select, button")) control.disabled = !enabled;
    refs.refresh.disabled = !getToken();
  };

  const load = async () => {
    if (state.loading) return;
    state.loading = true;
    state.lastTry = Date.now();
    showNote("");
    try {
      if (!(await checkHealth())) {
        state.ready = false;
        setControlsEnabled(false);
        return;
      }
      setControlsEnabled(true);
      await Promise.all([loadChannels(), loadPosts()]);
      state.ready = true;
      setState("Connected", "active");
    } catch (error) {
      setControlsEnabled(false);
      handleError(error, "Could not load social posts.");
    } finally {
      state.loading = false;
    }
  };

  const syncAuthState = () => {
    if (!getToken()) {
      state.ready = false;
      setControlsEnabled(false);
      setState("Waiting for sign-in", "muted");
      return;
    }
    // Retry on focus or sign-in, but not more than once every 15 seconds while setup is incomplete.
    if (!state.ready && !state.loading && Date.now() - state.lastTry > 15_000) load();
  };

  refs.body.addEventListener("input", updateCount);
  refs.media.addEventListener("change", () => { if (refs.media.files[0]) uploadMedia(refs.media.files[0]); });
  refs.mediaClear.addEventListener("click", () => { clearMedia(); refs.formStatus.textContent = ""; });
  refs.sync.addEventListener("click", syncChannels);
  refs.form.addEventListener("submit", saveDraft);
  refs.filter.addEventListener("change", () => loadPosts().catch((error) => handleError(error)));
  refs.refresh.addEventListener("click", () => { state.ready = false; state.lastTry = 0; load(); });

  const dashboardExperience = $("admin-dashboard-experience");
  if (dashboardExperience && typeof MutationObserver === "function") {
    new MutationObserver(syncAuthState).observe(dashboardExperience, { attributes: true, attributeFilter: ["hidden"] });
  }
  window.addEventListener("focus", syncAuthState);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") syncAuthState(); });

  setControlsEnabled(false);
  renderChannels();
  syncAuthState();
})();
