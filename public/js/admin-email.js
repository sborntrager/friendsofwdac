(() => {
  const SESSION_KEY = "fo_wdac_admin_token_v3";
  const DEFAULT_MESSAGE_LIMIT = 50;
  const CONNECT_RETURN_PATH = "/admin/email/index.html";

  const shell = document.querySelector("[data-admin-api-base]");
  if (!shell) return;

  const apiBase = String(shell.dataset.adminApiBase || "").trim();
  if (!apiBase) return;

  const note = document.getElementById("admin-email-note");
  const refreshButton = document.getElementById("admin-email-refresh");
  const logoutButton = document.getElementById("admin-email-logout");

  const connectButton = document.getElementById("admin-email-connect");
  const zohoStatusEl = document.getElementById("admin-email-zoho-status");
  const mailboxEl = document.getElementById("admin-email-mailbox");
  const senderEl = document.getElementById("admin-email-sender");
  const scopeHintEl = document.getElementById("admin-email-scope-hint");

  const foldersEl = document.getElementById("admin-email-folders");
  const messagesEl = document.getElementById("admin-email-messages");
  const searchInput = document.getElementById("admin-email-search");
  const searchButton = document.getElementById("admin-email-search-button");

  const readerEmpty = document.getElementById("admin-email-reader-empty");
  const reader = document.getElementById("admin-email-reader");
  const readerSubject = document.getElementById("admin-email-reader-subject");
  const readerMeta = document.getElementById("admin-email-reader-meta");
  const readerContent = document.getElementById("admin-email-reader-content");
  const attachmentsEl = document.getElementById("admin-email-attachments");
  const markReadButton = document.getElementById("admin-email-mark-read");
  const markUnreadButton = document.getElementById("admin-email-mark-unread");

  const replyForm = document.getElementById("admin-email-reply-form");
  const replyToInput = document.getElementById("admin-email-reply-to");
  const replySubjectInput = document.getElementById("admin-email-reply-subject");
  const replyBodyInput = document.getElementById("admin-email-reply-body");

  const composeRoot = document.getElementById("admin-email-compose");
  const composeOpenButton = document.getElementById("admin-email-compose-open");
  const composeOpenButtonEmpty = document.getElementById("admin-email-compose-open-empty");
  const composeCloseBackdrop = document.getElementById("admin-email-compose-close");
  const composeCancelButton = document.getElementById("admin-email-compose-cancel");
  const composeForm = document.getElementById("admin-email-compose-form");
  const composeToInput = document.getElementById("admin-email-compose-to");
  const composeCcInput = document.getElementById("admin-email-compose-cc");
  const composeBccInput = document.getElementById("admin-email-compose-bcc");
  const composeSubjectInput = document.getElementById("admin-email-compose-subject");
  const composeBodyInput = document.getElementById("admin-email-compose-body");

  const state = {
    zohoStatus: null,
    folders: [],
    scopeWarning: "",
    messages: [],
    selectedFolderId: "",
    selectedMessageId: "",
    selectedMessageFolderId: "",
    selectedMessageDetail: null,
    search: "",
    loadingFolders: false,
    loadingMessages: false,
    loadingMessage: false
  };

  const getToken = () => sessionStorage.getItem(SESSION_KEY) || "";

  const hasMeaningfulValue = (value) => String(value ?? "").trim().length > 0;

  const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

  const parseRecipientList = (value) => {
    const entries = String(value ?? "")
      .split(/[,\n;]/g)
      .map((entry) => normalizeEmail(entry))
      .filter(Boolean);
    const unique = Array.from(new Set(entries));
    const valid = unique.filter((entry) => isValidEmail(entry));
    const invalid = unique.filter((entry) => !isValidEmail(entry));
    return { valid, invalid };
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatDateTime = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "Unknown date";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  };

  const getZohoResultFromLocation = () => {
    const url = new URL(window.location.href);
    return {
      state: String(url.searchParams.get("zoho") || "").trim().toLowerCase(),
      message: String(url.searchParams.get("zoho_message") || "").trim()
    };
  };

  const clearZohoResultFromLocation = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("zoho");
    url.searchParams.delete("zoho_message");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const showNote = (message, isError = false) => {
    if (!note) return;
    if (!message) {
      note.hidden = true;
      note.textContent = "";
      delete note.dataset.state;
      return;
    }

    note.hidden = false;
    note.textContent = message;
    note.dataset.state = isError ? "error" : "info";
  };

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`
  });

  const redirectToLogin = () => {
    window.location.assign("../index.html#admin-login-card");
  };

  const setButtonBusy = (button, busy, busyLabel) => {
    if (!button) return;
    if (!button.dataset.defaultLabel) {
      button.dataset.defaultLabel = button.textContent;
    }
    button.disabled = busy;
    button.textContent = busy ? busyLabel : button.dataset.defaultLabel;
  };

  const requestAdminJson = async (path, options = {}) => {
    const headers = {
      ...authHeaders(),
      ...(options.headers || {})
    };
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const suffix = payload.scopeHint ? ` ${payload.scopeHint}` : "";
      const error = new Error(`${payload.error || "Unable to load mailbox data."}${suffix}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  };

  const looksLikeHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value ?? ""));

  const sanitizeEmailHtml = (rawHtml) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(String(rawHtml || ""), "text/html");
    if (!doc?.body) return "";

    doc.body.querySelectorAll("script, style, iframe, object, embed, link, meta, base, form, input, select, textarea, button").forEach((node) => node.remove());

    const elements = doc.body.querySelectorAll("*");
    elements.forEach((element) => {
      const attributes = Array.from(element.attributes || []);
      attributes.forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value || "";
        if (name.startsWith("on")) {
          element.removeAttribute(attribute.name);
          return;
        }
        if ((name === "href" || name === "src") && /^\s*javascript:/i.test(value)) {
          element.removeAttribute(attribute.name);
          return;
        }
        if (name === "target") {
          element.setAttribute("rel", "noopener noreferrer");
        }
      });
    });

    return doc.body.innerHTML;
  };

  const normalizeAddressLine = (value) => String(value ?? "").trim();

  const readHeaderField = (headerContent, keys = []) => {
    if (!headerContent || !keys.length) return "";
    const normalizedKeys = keys.map((key) => String(key).toLowerCase());

    if (Array.isArray(headerContent)) {
      for (const row of headerContent) {
        if (!row || typeof row !== "object") continue;
        const rowKey = String(row?.key || row?.name || row?.label || row?.header || "").toLowerCase();
        if (!rowKey) continue;
        if (!normalizedKeys.some((candidate) => rowKey.includes(candidate))) continue;
        const candidate = row?.value ?? row?.content ?? row?.data ?? "";
        if (hasMeaningfulValue(candidate)) return String(candidate).trim();
      }
      return "";
    }

    if (typeof headerContent === "object") {
      const entries = Object.entries(headerContent);
      for (const key of normalizedKeys) {
        const direct = headerContent[key];
        if (hasMeaningfulValue(direct)) return String(direct).trim();
      }
      for (const [entryKey, entryValue] of entries) {
        const normalized = String(entryKey).toLowerCase();
        if (!normalizedKeys.some((candidate) => normalized.includes(candidate))) continue;
        if (hasMeaningfulValue(entryValue)) return String(entryValue).trim();
      }
    }

    return "";
  };

  const getMessageById = (messageId) => state.messages.find((entry) => entry.messageId === messageId) || null;

  const getSelectedMessage = () => getMessageById(state.selectedMessageId);

  const getMessageReceivedLabel = (message) => {
    if (!message) return "Unknown date";
    return formatDateTime(message.receivedAt || message.sentAt);
  };

  const ensureReplySubject = (subject) => {
    const cleaned = String(subject || "").trim();
    if (!cleaned) return "Re: (No subject)";
    return /^re:/i.test(cleaned) ? cleaned : `Re: ${cleaned}`;
  };

  const renderConnectionStatus = () => {
    const status = state.zohoStatus;
    const connected = Boolean(status?.connected);
    const configured = Boolean(status?.configured);
    const configuredFromAddress = normalizeEmail(status?.configuredFromAddress || "");
    const activeFromAddress = normalizeEmail(status?.fromAddress || "");
    const allowedFromAddresses = Array.isArray(status?.allowedFromAddresses)
      ? status.allowedFromAddresses
        .map((value) => normalizeEmail(value))
        .filter((value) => isValidEmail(value))
      : [];

    if (zohoStatusEl) {
      zohoStatusEl.textContent = connected ? "Connected" : configured ? "Not connected" : "Not configured";
      zohoStatusEl.dataset.state = connected ? "connected" : "warning";
    }
    if (mailboxEl) mailboxEl.textContent = status?.mailboxEmail || "Not available";
    if (senderEl) senderEl.textContent = status?.fromAddress || "Not configured";

    if (connectButton) {
      if (connected) {
        connectButton.textContent = "Reconnect Zoho";
      } else {
        connectButton.textContent = "Connect Zoho";
      }
      connectButton.disabled = !configured;
    }

    if (scopeHintEl) {
      const hintParts = [];
      if (state.scopeWarning) hintParts.push(state.scopeWarning);

      if (
        connected &&
        configuredFromAddress &&
        activeFromAddress &&
        configuredFromAddress !== activeFromAddress
      ) {
        const availableText = allowedFromAddresses.length
          ? ` Available Zoho send addresses: ${allowedFromAddresses.slice(0, 6).join(", ")}.`
          : "";
        hintParts.push(
          `Configured sender is ${configuredFromAddress}, but the active Zoho sender is ${activeFromAddress}.` +
          ` Add ${configuredFromAddress} in Zoho Settings > Send Mail As or reconnect Zoho with that mailbox.${availableText}`
        );
      }

      if (hintParts.length) {
        scopeHintEl.hidden = false;
        scopeHintEl.textContent = hintParts.join(" ");
      } else {
        scopeHintEl.hidden = true;
        scopeHintEl.textContent = "";
      }
    }
  };

  const getFolderLabel = (folder) => {
    const folderType = String(folder?.folderType || "").trim();
    const folderName = String(folder?.folderName || "").trim();
    if (folderType && folderType.toLowerCase() !== folderName.toLowerCase()) {
      return `${folderName} (${folderType})`;
    }
    return folderName || "Folder";
  };

  const renderFolders = () => {
    if (!foldersEl) return;
    foldersEl.innerHTML = "";

    if (state.loadingFolders) {
      foldersEl.innerHTML = '<li class="admin-email-folder-empty">Loading folders...</li>';
      return;
    }

    if (!state.folders.length) {
      foldersEl.innerHTML = '<li class="admin-email-folder-empty">No folders available yet.</li>';
      return;
    }

    const fragment = document.createDocumentFragment();
    state.folders.forEach((folder) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-email-folder-button";
      if (folder.folderId === state.selectedFolderId) {
        button.classList.add("is-active");
      }
      button.dataset.folderId = folder.folderId || "";
      button.textContent = getFolderLabel(folder);
      item.appendChild(button);
      fragment.appendChild(item);
    });

    foldersEl.appendChild(fragment);
  };

  const renderMessages = () => {
    if (!messagesEl) return;
    messagesEl.innerHTML = "";

    if (state.loadingMessages) {
      messagesEl.innerHTML = '<p class="admin-email-list-empty">Loading messages...</p>';
      return;
    }

    if (!state.messages.length) {
      messagesEl.innerHTML = '<p class="admin-email-list-empty">No messages found for this folder.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    state.messages.forEach((message) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-email-message";
      button.dataset.messageId = message.messageId || "";
      button.dataset.folderId = message.folderId || state.selectedFolderId || "";
      if (message.messageId === state.selectedMessageId) {
        button.classList.add("is-active");
      }
      if (message.isUnread) {
        button.classList.add("is-unread");
      }

      const fromLine = escapeHtml(message.fromAddress || message.sender || "Unknown sender");
      const subjectLine = escapeHtml(message.subject || "(No subject)");
      const summaryLine = escapeHtml(message.summary || "");
      const dateLine = escapeHtml(getMessageReceivedLabel(message));
      const attachBadge = message.hasAttachment ? '<span class="admin-email-message__badge">Attachment</span>' : "";

      button.innerHTML = `
        <span class="admin-email-message__top">
          <strong>${fromLine}</strong>
          <time>${dateLine}</time>
        </span>
        <span class="admin-email-message__subject">${subjectLine}</span>
        <span class="admin-email-message__summary">${summaryLine || "&nbsp;"}</span>
        ${attachBadge}
      `;

      fragment.appendChild(button);
    });

    messagesEl.appendChild(fragment);
  };

  const renderMessageAttachments = (attachments) => {
    if (!attachmentsEl) return;
    attachmentsEl.innerHTML = "";

    const list = Array.isArray(attachments) ? attachments : [];
    if (!list.length) return;

    const fragment = document.createDocumentFragment();

    list.forEach((attachment) => {
      const item = document.createElement("li");
      const name = String(
        attachment?.attachmentName ||
        attachment?.fileName ||
        attachment?.name ||
        "Attachment"
      ).trim();
      const size = Number.parseInt(String(attachment?.size || attachment?.fileSize || ""), 10);
      const sizeLabel = Number.isFinite(size) && size > 0 ? ` (${Math.round(size / 1024)} KB)` : "";
      item.textContent = `${name}${sizeLabel}`;
      fragment.appendChild(item);
    });

    attachmentsEl.appendChild(fragment);
  };

  const renderReader = () => {
    const selectedMessage = getSelectedMessage();

    if (!selectedMessage || !state.selectedMessageId) {
      if (readerEmpty) readerEmpty.hidden = false;
      if (reader) reader.hidden = true;
      return;
    }

    if (readerEmpty) readerEmpty.hidden = true;
    if (reader) reader.hidden = false;

    if (state.loadingMessage) {
      if (readerSubject) readerSubject.textContent = selectedMessage.subject || "Loading message...";
      if (readerMeta) readerMeta.textContent = "Loading message details...";
      if (readerContent) readerContent.innerHTML = '<p class="admin-email-reader-placeholder">Loading message body...</p>';
      if (attachmentsEl) attachmentsEl.innerHTML = "";
      return;
    }

    const detail = state.selectedMessageDetail || {};
    const headerContent = detail.headerContent;
    const messageFrom = normalizeAddressLine(
      readHeaderField(headerContent, ["from", "fromaddress"]) || selectedMessage.fromAddress || selectedMessage.sender
    );
    const messageTo = normalizeAddressLine(
      readHeaderField(headerContent, ["to", "toaddress"]) || selectedMessage.toAddress
    );
    const messageDate = getMessageReceivedLabel(selectedMessage);
    const messageSubject = normalizeAddressLine(
      readHeaderField(headerContent, ["subject"]) || selectedMessage.subject || "(No subject)"
    );

    if (readerSubject) readerSubject.textContent = messageSubject;
    if (readerMeta) {
      const metaParts = [];
      if (messageFrom) metaParts.push(`From: ${messageFrom}`);
      if (messageTo) metaParts.push(`To: ${messageTo}`);
      metaParts.push(`Received: ${messageDate}`);
      readerMeta.textContent = metaParts.join(" | ");
    }

    const content = String(detail.content || "").trim();
    if (readerContent) {
      if (!content) {
        readerContent.innerHTML = '<p class="admin-email-reader-placeholder">No body content returned for this message.</p>';
      } else if (looksLikeHtml(content)) {
        const safeHtml = sanitizeEmailHtml(content);
        readerContent.innerHTML = safeHtml || '<p class="admin-email-reader-placeholder">Unable to render this HTML message safely.</p>';
      } else {
        readerContent.innerHTML = `<pre>${escapeHtml(content)}</pre>`;
      }
    }

    renderMessageAttachments(detail.attachments);

    if (replyToInput) {
      const defaultReplyTo = messageFrom || selectedMessage.fromAddress || "";
      replyToInput.value = defaultReplyTo;
    }
    if (replySubjectInput) {
      replySubjectInput.value = ensureReplySubject(messageSubject);
    }

    const readOnly = !state.zohoStatus?.connected;
    if (markReadButton) markReadButton.disabled = readOnly || !selectedMessage.isUnread;
    if (markUnreadButton) markUnreadButton.disabled = readOnly || Boolean(selectedMessage.isUnread);
    if (replyToInput) replyToInput.disabled = readOnly;
    if (replySubjectInput) replySubjectInput.disabled = readOnly;
    if (replyBodyInput) replyBodyInput.disabled = readOnly;
    const submit = replyForm?.querySelector("button[type='submit']");
    if (submit) submit.disabled = readOnly;
  };

  const setSelectedFolder = (folderId) => {
    state.selectedFolderId = String(folderId || "").trim();
    state.selectedMessageId = "";
    state.selectedMessageFolderId = "";
    state.selectedMessageDetail = null;
    renderFolders();
    renderMessages();
    renderReader();
  };

  const setSelectedMessage = (messageId, folderId) => {
    state.selectedMessageId = String(messageId || "").trim();
    state.selectedMessageFolderId = String(folderId || "").trim();
    state.selectedMessageDetail = null;
    renderMessages();
    renderReader();
  };

  const withSessionHandling = async (work) => {
    try {
      return await work();
    } catch (error) {
      if (Number(error?.status) === 401) {
        sessionStorage.removeItem(SESSION_KEY);
        redirectToLogin("Your admin session expired. Please sign in again.");
        return null;
      }
      throw error;
    }
  };

  const loadZohoStatus = async () => {
    const payload = await withSessionHandling(() => requestAdminJson("/mail/status"));
    if (!payload) return;
    state.zohoStatus = payload;
    renderConnectionStatus();
  };

  const chooseDefaultFolder = () => {
    if (!state.folders.length) {
      state.selectedFolderId = "";
      return;
    }
    if (state.selectedFolderId && state.folders.some((folder) => folder.folderId === state.selectedFolderId)) {
      return;
    }
    const inbox = state.folders.find((folder) => String(folder.folderType || "").toLowerCase() === "inbox");
    state.selectedFolderId = (inbox?.folderId || state.folders[0]?.folderId || "").trim();
  };

  const loadFolders = async () => {
    state.loadingFolders = true;
    renderFolders();

    try {
      const payload = await withSessionHandling(() => requestAdminJson("/mail/folders"));
      if (!payload) return;
      state.scopeWarning = String(payload.scopeWarning || "").trim();
      state.folders = Array.isArray(payload.folders) ? payload.folders : [];
      chooseDefaultFolder();
      renderConnectionStatus();
      renderFolders();
    } catch (error) {
      state.folders = [];
      state.scopeWarning = "";
      renderFolders();
      throw error;
    } finally {
      state.loadingFolders = false;
      renderFolders();
    }
  };

  const loadMessages = async ({ keepSelection = false } = {}) => {
    if (!state.selectedFolderId && state.folders.length) {
      chooseDefaultFolder();
    }

    state.loadingMessages = true;
    renderMessages();

    try {
      const params = new URLSearchParams();
      params.set("limit", String(DEFAULT_MESSAGE_LIMIT));
      if (state.selectedFolderId) params.set("folderId", state.selectedFolderId);
      if (state.search) params.set("search", state.search);

      const payload = await withSessionHandling(() => requestAdminJson(`/mail/messages?${params.toString()}`));
      if (!payload) return;
      state.messages = Array.isArray(payload.messages) ? payload.messages : [];

      if (!keepSelection || !state.messages.some((message) => message.messageId === state.selectedMessageId)) {
        state.selectedMessageId = "";
        state.selectedMessageFolderId = "";
        state.selectedMessageDetail = null;
      }

      renderMessages();
      renderReader();
    } finally {
      state.loadingMessages = false;
      renderMessages();
    }
  };

  const loadMessageDetail = async (messageId, folderId = "") => {
    if (!messageId) return;
    setSelectedMessage(messageId, folderId || state.selectedFolderId);
    state.loadingMessage = true;
    renderReader();

    try {
      const selected = getSelectedMessage();
      const fallbackFolderId = folderId || selected?.folderId || state.selectedFolderId;
      const params = new URLSearchParams();
      if (fallbackFolderId) params.set("folderId", fallbackFolderId);

      const payload = await withSessionHandling(() =>
        requestAdminJson(`/mail/messages/${encodeURIComponent(messageId)}${params.toString() ? `?${params.toString()}` : ""}`)
      );
      if (!payload) return;
      state.selectedMessageDetail = payload;
      state.selectedMessageFolderId = payload.folderId || fallbackFolderId || "";
      renderReader();
    } finally {
      state.loadingMessage = false;
      renderReader();
    }
  };

  const refreshMailbox = async () => {
    const connected = Boolean(state.zohoStatus?.connected);
    await loadZohoStatus();

    if (!state.zohoStatus?.connected) {
      state.folders = [];
      state.messages = [];
      state.selectedFolderId = "";
      state.selectedMessageId = "";
      state.selectedMessageDetail = null;
      renderFolders();
      renderMessages();
      renderReader();
      return;
    }

    try {
      await loadFolders();
    } catch (error) {
      // Keep mailbox usable even when the folder endpoint fails; message list can still load.
      state.folders = [];
      state.selectedFolderId = "";
      renderFolders();
      showNote(error?.message || "Unable to load folders. Loading messages anyway.", true);
    }

    await loadMessages({ keepSelection: connected });
    if (state.selectedMessageId) {
      const message = getSelectedMessage();
      await loadMessageDetail(state.selectedMessageId, message?.folderId || state.selectedMessageFolderId || "");
    }
  };

  const startZohoConnect = async () => {
    if (!state.zohoStatus?.configured) {
      throw new Error("Zoho is not configured in Cloudflare yet.");
    }
    const qs = new URLSearchParams({ returnTo: CONNECT_RETURN_PATH }).toString();
    const payload = await withSessionHandling(() => requestAdminJson(`/mail/connect?${qs}`));
    if (!payload?.authorizeUrl) {
      throw new Error("Unable to generate Zoho authorization URL.");
    }
    window.location.assign(payload.authorizeUrl);
  };

  const updateReadState = async (mode = "read") => {
    const message = getSelectedMessage();
    if (!message?.messageId) {
      throw new Error("Select a message first.");
    }
    const route = `/mail/messages/${encodeURIComponent(message.messageId)}/${mode === "unread" ? "unread" : "read"}`;
    await withSessionHandling(() =>
      requestAdminJson(route, {
        method: "PUT"
      })
    );

    const nextUnread = mode === "unread";
    state.messages = state.messages.map((entry) =>
      entry.messageId === message.messageId
        ? { ...entry, isUnread: nextUnread }
        : entry
    );
    renderMessages();
    renderReader();
  };

  const setComposeOpen = (open) => {
    if (!composeRoot) return;
    composeRoot.hidden = !open;
    document.body.classList.toggle("admin-email-compose-open", open);
    if (open) {
      composeToInput?.focus();
    }
  };

  const sendComposeEmail = async () => {
    const to = parseRecipientList(composeToInput?.value || "");
    const cc = parseRecipientList(composeCcInput?.value || "");
    const bcc = parseRecipientList(composeBccInput?.value || "");
    const subject = String(composeSubjectInput?.value || "").trim();
    const content = String(composeBodyInput?.value || "").trim();

    if (!to.valid.length) {
      throw new Error("Add at least one valid recipient email in To.");
    }
    if (!subject) {
      throw new Error("Subject is required.");
    }
    if (!content) {
      throw new Error("Email body is required.");
    }
    if (to.invalid.length || cc.invalid.length || bcc.invalid.length) {
      throw new Error("One or more recipient emails are invalid.");
    }

    await withSessionHandling(() =>
      requestAdminJson("/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          toEmails: to.valid,
          ccEmails: cc.valid,
          bccEmails: bcc.valid,
          subject,
          content,
          mailFormat: "plaintext"
        })
      })
    );
  };

  const sendReplyEmail = async () => {
    const selected = getSelectedMessage();
    if (!selected?.messageId) {
      throw new Error("Select a message before replying.");
    }

    const to = parseRecipientList(replyToInput?.value || "");
    const subject = String(replySubjectInput?.value || "").trim();
    const content = String(replyBodyInput?.value || "").trim();

    if (to.invalid.length) {
      throw new Error("Reply recipient includes invalid email formatting.");
    }
    if (!to.valid.length) {
      throw new Error("Reply recipient is required.");
    }
    if (!subject) {
      throw new Error("Reply subject is required.");
    }
    if (!content) {
      throw new Error("Reply message is required.");
    }

    await withSessionHandling(() =>
      requestAdminJson("/mail/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messageId: selected.messageId,
          toEmails: to.valid,
          subject,
          content,
          mailFormat: "plaintext"
        })
      })
    );
  };

  foldersEl?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-folder-id]");
    if (!button) return;
    const folderId = String(button.dataset.folderId || "").trim();
    if (!folderId || folderId === state.selectedFolderId) return;

    setSelectedFolder(folderId);
    try {
      await loadMessages({ keepSelection: false });
    } catch (error) {
      showNote(error?.message || "Unable to load messages for this folder.", true);
    }
  });

  messagesEl?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-message-id]");
    if (!button) return;
    const messageId = String(button.dataset.messageId || "").trim();
    if (!messageId) return;
    const folderId = String(button.dataset.folderId || "").trim();

    try {
      await loadMessageDetail(messageId, folderId);
    } catch (error) {
      showNote(error?.message || "Unable to load this message.", true);
    }
  });

  searchButton?.addEventListener("click", async () => {
    state.search = String(searchInput?.value || "").trim();
    try {
      await loadMessages({ keepSelection: false });
    } catch (error) {
      showNote(error?.message || "Unable to search mailbox messages.", true);
    }
  });

  searchInput?.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    state.search = String(searchInput.value || "").trim();
    try {
      await loadMessages({ keepSelection: false });
    } catch (error) {
      showNote(error?.message || "Unable to search mailbox messages.", true);
    }
  });

  connectButton?.addEventListener("click", async () => {
    setButtonBusy(connectButton, true, "Opening...");
    try {
      await startZohoConnect();
    } catch (error) {
      showNote(error?.message || "Unable to start Zoho connection.", true);
    } finally {
      setButtonBusy(connectButton, false, "Opening...");
    }
  });

  refreshButton?.addEventListener("click", async () => {
    setButtonBusy(refreshButton, true, "Refreshing...");
    try {
      await refreshMailbox();
      showNote("Mailbox refreshed.", false);
    } catch (error) {
      showNote(error?.message || "Unable to refresh mailbox.", true);
    } finally {
      setButtonBusy(refreshButton, false, "Refreshing...");
    }
  });

  logoutButton?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    redirectToLogin("Signed out.");
  });

  markReadButton?.addEventListener("click", async () => {
    setButtonBusy(markReadButton, true, "Saving...");
    try {
      await updateReadState("read");
      showNote("Message marked as read.", false);
    } catch (error) {
      showNote(error?.message || "Unable to mark this message as read.", true);
    } finally {
      setButtonBusy(markReadButton, false, "Saving...");
    }
  });

  markUnreadButton?.addEventListener("click", async () => {
    setButtonBusy(markUnreadButton, true, "Saving...");
    try {
      await updateReadState("unread");
      showNote("Message marked as unread.", false);
    } catch (error) {
      showNote(error?.message || "Unable to mark this message as unread.", true);
    } finally {
      setButtonBusy(markUnreadButton, false, "Saving...");
    }
  });

  replyForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = replyForm.querySelector("button[type='submit']");
    setButtonBusy(button, true, "Sending...");

    try {
      await sendReplyEmail();
      if (replyBodyInput) replyBodyInput.value = "";
      showNote("Reply sent.", false);
      await loadMessages({ keepSelection: true });
    } catch (error) {
      showNote(error?.message || "Unable to send reply.", true);
    } finally {
      setButtonBusy(button, false, "Sending...");
    }
  });

  composeOpenButton?.addEventListener("click", () => {
    setComposeOpen(true);
  });

  composeOpenButtonEmpty?.addEventListener("click", () => {
    setComposeOpen(true);
  });

  composeCancelButton?.addEventListener("click", () => {
    setComposeOpen(false);
  });

  composeCloseBackdrop?.addEventListener("click", () => {
    setComposeOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !composeRoot?.hidden) {
      setComposeOpen(false);
    }
  });

  composeForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = composeForm.querySelector("button[type='submit']");
    setButtonBusy(button, true, "Sending...");

    try {
      await sendComposeEmail();
      showNote("Email sent.", false);
      composeForm.reset();
      setComposeOpen(false);
      await loadMessages({ keepSelection: true });
    } catch (error) {
      showNote(error?.message || "Unable to send email.", true);
    } finally {
      setButtonBusy(button, false, "Sending...");
    }
  });

  const initialize = async () => {
    const token = getToken();
    if (!token) {
      redirectToLogin("Sign in to access the Email workspace.");
      return;
    }

    const zohoResult = getZohoResultFromLocation();
    if (zohoResult.state === "connected") {
      showNote("Zoho mailbox connected successfully.", false);
    } else if (zohoResult.state === "error") {
      showNote(zohoResult.message || "Zoho connection did not complete.", true);
    }
    if (zohoResult.state) {
      clearZohoResultFromLocation();
    }

    try {
      await refreshMailbox();
    } catch (error) {
      showNote(error?.message || "Unable to initialize the mailbox workspace.", true);
    }
  };

  initialize();
})();
