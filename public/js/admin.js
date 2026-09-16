(() => {
  const SESSION_KEY = "fo_wdac_admin_token_v3";
  const DASHBOARD_LIMIT = 40;
  const SUBSCRIBER_LIMIT = 12;
  const MIN_PASSWORD_LENGTH = 12;

  const shell = document.querySelector("[data-admin-api-base]");
  if (!shell) return;

  const apiBase = shell.dataset.adminApiBase;
  if (!apiBase) return;

  const body = document.body;
  const sharedHeader = document.querySelector(".admin-shared-header");
  const authExperience = document.getElementById("admin-auth-experience");
  const dashboardExperience = document.getElementById("admin-dashboard-experience");

  const setupCard = document.getElementById("admin-setup-card");
  const loginCard = document.getElementById("admin-login-card");
  const resetRequestCard = document.getElementById("admin-reset-request-card");
  const resetCard = document.getElementById("admin-reset-card");

  const setupForm = document.getElementById("admin-setup-form");
  const loginForm = document.getElementById("admin-login-form");
  const resetRequestForm = document.getElementById("admin-reset-request-form");
  const resetForm = document.getElementById("admin-reset-form");
  const passwordForm = document.getElementById("admin-password-form");

  const showSignupButton = document.getElementById("admin-show-signup");
  const showLoginButton = document.getElementById("admin-show-login");
  const showResetRequestButton = document.getElementById("admin-show-reset-request");
  const showResetRequestFromSignupButton = document.getElementById("admin-show-reset-request-from-signup");
  const showLoginFromResetRequestButton = document.getElementById("admin-show-login-from-reset-request");
  const showSignupFromResetRequestButton = document.getElementById("admin-show-signup-from-reset-request");
  const showResetRequestFromResetButton = document.getElementById("admin-show-reset-request-from-reset");
  const showLoginFromResetButton = document.getElementById("admin-show-login-from-reset");

  const setupEmailInput = document.getElementById("admin-setup-email");
  const setupPasswordInput = document.getElementById("admin-setup-password");
  const setupConfirmPasswordInput = document.getElementById("admin-setup-confirm-password");

  const loginEmailInput = document.getElementById("admin-email");
  const loginPasswordInput = document.getElementById("admin-password");
  const resetRequestEmailInput = document.getElementById("admin-reset-request-email");
  const resetPasswordInput = document.getElementById("admin-reset-password");
  const resetConfirmPasswordInput = document.getElementById("admin-reset-confirm-password");

  const currentPasswordInput = document.getElementById("admin-current-password");
  const newPasswordInput = document.getElementById("admin-new-password");
  const confirmPasswordInput = document.getElementById("admin-confirm-password");

  const authNoteCard = document.getElementById("admin-auth-note-card");
  const authNote = document.getElementById("admin-auth-note");
  const dashboardNoteCard = document.getElementById("admin-dashboard-note-card");
  const dashboardNote = document.getElementById("admin-dashboard-note");

  const refreshButton = document.getElementById("admin-refresh");
  const exportButton = document.getElementById("admin-export");
  const logoutButtons = Array.from(document.querySelectorAll("[data-admin-logout]"));
  const userLabel = document.getElementById("admin-user-label");
  const sessionMeta = document.getElementById("admin-session-meta");

  const userMenuToggle = document.getElementById("admin-user-menu-toggle");
  const userMenuPanel = document.getElementById("admin-user-menu-panel");

  const openSecurityButton = document.getElementById("admin-open-security");
  const securityDetails = document.getElementById("admin-security-details");

  const summarySubmissions = document.getElementById("admin-summary-submissions");
  const summarySignups = document.getElementById("admin-summary-signups");
  const summaryMembers = document.getElementById("admin-summary-members");
  const summaryDonors = document.getElementById("admin-summary-donors");
  const summaryImports = document.getElementById("admin-summary-imports");
  const summaryDrafts = document.getElementById("admin-summary-drafts");

  const attentionReviewCount = document.getElementById("admin-attention-review-count");
  const attentionReviewNote = document.getElementById("admin-attention-review-note");
  const attentionFollowupCount = document.getElementById("admin-attention-followup-count");
  const attentionFollowupNote = document.getElementById("admin-attention-followup-note");
  const attentionImportsCount = document.getElementById("admin-attention-imports-count");
  const attentionImportsNote = document.getElementById("admin-attention-imports-note");

  const inboxBody = document.getElementById("admin-inbox-body");
  const reviewCard = document.getElementById("admin-review-card");
  const reviewType = document.getElementById("admin-review-type");
  const reviewTitle = document.getElementById("admin-review-title");
  const reviewMeta = document.getElementById("admin-review-meta");
  const reviewFields = document.getElementById("admin-review-fields");
  const reviewCloseButton = document.getElementById("admin-review-close");

  const peopleSearchInput = document.getElementById("admin-people-search");
  const peopleFilterButton = document.getElementById("admin-people-filter");
  const peopleBody = document.getElementById("admin-people-body");

  const membersActive = document.getElementById("admin-members-active");
  const membersLapsed = document.getElementById("admin-members-lapsed");
  const membersPending = document.getElementById("admin-members-pending");
  const membersImported = document.getElementById("admin-members-imported");
  const membersManager = document.getElementById("admin-members-manager");
  const membersRecordCount = document.getElementById("admin-members-record-count");
  const membersBody = document.getElementById("admin-members-body");
  const membersAddButton = document.getElementById("admin-members-add");
  const membersEditor = document.getElementById("admin-members-editor");
  const memberForm = document.getElementById("admin-member-form");
  const memberEditorEyebrow = document.getElementById("admin-member-editor-eyebrow");
  const memberEditorTitle = document.getElementById("admin-member-editor-title");
  const memberEditorMeta = document.getElementById("admin-member-editor-meta");
  const memberNameInput = document.getElementById("admin-member-name");
  const memberEmailInput = document.getElementById("admin-member-email");
  const memberPhoneInput = document.getElementById("admin-member-phone");
  const memberStreetInput = document.getElementById("admin-member-street");
  const memberCityInput = document.getElementById("admin-member-city");
  const memberStateInput = document.getElementById("admin-member-state");
  const memberZipInput = document.getElementById("admin-member-zip");
  const memberJoinDateInput = document.getElementById("admin-member-join-date");
  const memberRenewalDateInput = document.getElementById("admin-member-renewal-date");
  const memberStatusInput = document.getElementById("admin-member-status");
  const memberNotesInput = document.getElementById("admin-member-notes");
  const memberCancelButton = document.getElementById("admin-member-cancel");

  const donorsPaid = document.getElementById("admin-donors-paid");
  const donorsPledged = document.getElementById("admin-donors-pledged");
  const donorsRecurring = document.getElementById("admin-donors-recurring");
  const donorsOneTime = document.getElementById("admin-donors-onetime");
  const donorsManager = document.getElementById("admin-donors-manager");
  const donorsRecordCount = document.getElementById("admin-donors-record-count");
  const donorsBody = document.getElementById("admin-donors-body");
  const donorsAddButton = document.getElementById("admin-donors-add");
  const donorsEditor = document.getElementById("admin-donors-editor");
  const donorForm = document.getElementById("admin-donor-form");
  const donorEditorEyebrow = document.getElementById("admin-donor-editor-eyebrow");
  const donorEditorTitle = document.getElementById("admin-donor-editor-title");
  const donorEditorMeta = document.getElementById("admin-donor-editor-meta");
  const donorNameInput = document.getElementById("admin-donor-name");
  const donorEmailInput = document.getElementById("admin-donor-email");
  const donorPhoneInput = document.getElementById("admin-donor-phone");
  const donorPaymentStatusInput = document.getElementById("admin-donor-payment-status");
  const donorAmountInput = document.getElementById("admin-donor-amount");
  const donorDateInput = document.getElementById("admin-donor-date");
  const donorFrequencyInput = document.getElementById("admin-donor-frequency");
  const donorRecurringInput = document.getElementById("admin-donor-recurring");
  const donorNotesInput = document.getElementById("admin-donor-notes");
  const donorCancelButton = document.getElementById("admin-donor-cancel");

  const membersUploadButton = document.getElementById("admin-members-upload");
  const membersDownloadButton = document.getElementById("admin-members-download");
  const membersEditButton = document.getElementById("admin-members-edit");
  const donorsUploadButton = document.getElementById("admin-donors-upload");
  const donorsDownloadButton = document.getElementById("admin-donors-download");
  const donorsEditButton = document.getElementById("admin-donors-edit");

  const importMembersButton = document.getElementById("admin-import-members");
  const importDonorsButton = document.getElementById("admin-import-donors");
  const exportMembersButton = document.getElementById("admin-export-members");
  const exportDonorsButton = document.getElementById("admin-export-donors");
  const previewImportsButton = document.getElementById("admin-preview-imports");
  const membersUploadInput = document.getElementById("admin-members-upload-input");
  const donorsUploadInput = document.getElementById("admin-donors-upload-input");
  const importStatusTitle = document.getElementById("admin-import-status-title");
  const importStatusCopy = document.getElementById("admin-import-status-copy");
  const importStatusDetail = document.getElementById("admin-import-status-detail");
  const importHelpButton = document.getElementById("admin-import-help");
  const importHelpModal = document.getElementById("admin-import-help-modal");
  const importHelpModalClose = document.getElementById("admin-import-help-modal-close");
  const importHelpModalDismiss = document.getElementById("admin-import-help-modal-dismiss");
  const guideModal = document.getElementById("admin-guide-modal");
  const guideModalClose = document.getElementById("admin-guide-modal-close");
  const guideModalDismiss = document.getElementById("admin-guide-modal-dismiss");
  const supportOpenButton = document.getElementById("admin-support-open");
  const supportModal = document.getElementById("admin-support-modal");
  const supportModalClose = document.getElementById("admin-support-modal-close");
  const supportModalDismiss = document.getElementById("admin-support-modal-dismiss");
  const supportForm = document.getElementById("admin-support-form");
  const supportNameInput = document.getElementById("admin-support-name");
  const supportEmailInput = document.getElementById("admin-support-email");
  const supportSubjectInput = document.getElementById("admin-support-subject");
  const supportMessageInput = document.getElementById("admin-support-message");
  const supportWebsiteInput = document.getElementById("admin-support-website");
  const supportFormStatus = document.getElementById("admin-support-form-status");
  const supportFormCancelButton = document.getElementById("admin-support-form-cancel");

  const newsletterSubjectInput = document.getElementById("admin-newsletter-subject");
  const newsletterBodyInput = document.getElementById("admin-newsletter-body");
  const newsletterAudienceInputs = Array.from(document.querySelectorAll("input[name='admin-newsletter-audience']"));
  const newsletterRecipientCount = document.getElementById("admin-newsletter-recipient-count");
  const newsletterRecipientNote = document.getElementById("admin-newsletter-recipient-note");
  const newsletterPreviewButton = document.getElementById("admin-newsletter-preview");
  const newsletterViewListButton = document.getElementById("admin-newsletter-view-list");
  const newsletterConnectButton = document.getElementById("admin-newsletter-connect");
  const newsletterTestButton = document.getElementById("admin-newsletter-test");
  const newsletterSendButton = document.getElementById("admin-newsletter-send");
  const newsletterDeliveryStatus = document.getElementById("admin-newsletter-delivery-status");
  const newsletterAudienceNote = document.getElementById("admin-newsletter-audience-note");
  const newsletterCustomListInput = document.getElementById("admin-newsletter-custom-list");
  const newsletterZohoState = document.getElementById("admin-newsletter-zoho-state");
  const newsletterTestState = document.getElementById("admin-newsletter-test-state");
  const newsletterLimitState = document.getElementById("admin-newsletter-limit-state");
  const emailSettingsButton = document.getElementById("admin-email-settings");

  const settingsButtons = Array.from(document.querySelectorAll("[data-admin-setting]"));
  const guideButton = document.getElementById("admin-guide-button");
  const downloadTemplatesButton = document.getElementById("admin-download-templates");

  const navItems = Array.from(document.querySelectorAll(".admin-dashboard-nav__item"));

  let currentDashboard = null;
  let authMode = "login";
  let signedIn = false;
  let selectedReviewId = "";
  let peopleFilterMode = "all";
  let persistentMembers = [];
  let persistentDonors = [];
  let persistentImports = [];
  let zohoMailStatus = null;
  let memberEditorState = { open: false, mode: "create", recordId: "", draft: null };
  let donorEditorState = { open: false, mode: "create", recordId: "", draft: null };

  const getResetTokenFromLocation = () => {
    const url = new URL(window.location.href);
    return url.searchParams.get("reset") || "";
  };

  const getAuthModeFromLocation = () => {
    const url = new URL(window.location.href);
    const hash = url.hash || "";

    if (getResetTokenFromLocation()) {
      return "reset";
    }

    if (url.searchParams.get("forgot") === "1" || hash === "#admin-reset-request-card") {
      return "request-reset";
    }

    if (url.searchParams.get("signup") === "1" || hash === "#admin-setup-card") {
      return "signup";
    }

    return "login";
  };

  const updateLocationForAuthMode = (nextMode) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("signup");
    url.searchParams.delete("forgot");

    if (nextMode !== "reset") {
      url.searchParams.delete("reset");
    }

    if (nextMode === "signup") {
      url.searchParams.set("signup", "1");
      url.hash = "admin-setup-card";
    } else if (nextMode === "request-reset") {
      url.searchParams.set("forgot", "1");
      url.hash = "admin-reset-request-card";
    } else if (nextMode === "reset") {
      url.hash = "admin-reset-card";
    } else if (["#admin-setup-card", "#admin-reset-request-card", "#admin-reset-card"].includes(url.hash)) {
      url.hash = "admin-login-card";
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const toSentenceCase = (value) => {
    const text = String(value ?? "").replace(/[_-]+/g, " ").trim();
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const syncModalBodyLock = () => {
    const guideOpen = Boolean(guideModal && !guideModal.hidden);
    const importHelpOpen = Boolean(importHelpModal && !importHelpModal.hidden);
    const supportOpen = Boolean(supportModal && !supportModal.hidden);
    body.classList.toggle("admin-import-help-open", guideOpen || importHelpOpen || supportOpen);
  };

  const setImportHelpOpen = (open) => {
    if (!importHelpModal) return;
    importHelpModal.hidden = !open;
    importHelpModal.setAttribute("aria-hidden", open ? "false" : "true");
    syncModalBodyLock();
    if (open) {
      importHelpModalDismiss?.focus();
    } else {
      importHelpButton?.focus();
    }
  };

  const setGuideModalOpen = (open) => {
    if (!guideModal) return;
    guideModal.hidden = !open;
    guideModal.setAttribute("aria-hidden", open ? "false" : "true");
    syncModalBodyLock();
    if (open) {
      guideModalDismiss?.focus();
    } else {
      guideButton?.focus();
    }
  };

  const setSupportFormStatus = (message = "", isError = false) => {
    if (!supportFormStatus) return;
    const text = String(message || "").trim();
    if (!text) {
      supportFormStatus.hidden = true;
      supportFormStatus.textContent = "";
      delete supportFormStatus.dataset.state;
      return;
    }

    supportFormStatus.hidden = false;
    supportFormStatus.textContent = text;
    supportFormStatus.dataset.state = isError ? "error" : "info";
  };

  const setSupportModalOpen = (open) => {
    if (!supportModal) return;
    supportModal.hidden = !open;
    supportModal.setAttribute("aria-hidden", open ? "false" : "true");
    syncModalBodyLock();
    if (open) {
      setSupportFormStatus("");
      const sessionEmail = String(currentDashboard?.session?.email || "").trim();
      if (sessionEmail && supportEmailInput && !supportEmailInput.value.trim()) {
        supportEmailInput.value = sessionEmail;
      }
      supportNameInput?.focus();
    } else {
      supportOpenButton?.focus();
    }
  };

  const toTitleCase = (value) =>
    String(value ?? "")
      .toLowerCase()
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();

  const normalizePhone = (value) => String(value ?? "").replace(/[^\d+]/g, "");

  const hasMeaningfulValue = (value) => {
    if (Array.isArray(value)) {
      return value.some((item) => hasMeaningfulValue(item));
    }
    return String(value ?? "").trim().length > 0;
  };

  const formatDateTime = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "Unknown date";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  };

  const formatDateOnly = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "Unknown date";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value.filter((item) => hasMeaningfulValue(item)).join(", ");
    }
    if (!hasMeaningfulValue(value)) {
      return "Not provided";
    }
    return String(value);
  };

  const summarizeText = (value, maxLength = 180) => {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1).trim()}...`;
  };

  const getToken = () => sessionStorage.getItem(SESSION_KEY) || "";

  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`
  });

  const getNameFromFields = (fields) => {
    return [fields?.first_name, fields?.last_name].filter((item) => hasMeaningfulValue(item)).join(" ") || "";
  };

  const getDisplayNameFromEmail = (email) => {
    const localPart = String(email || "").split("@")[0];
    return toTitleCase(localPart || "newsletter contact");
  };

  const getFollowUpSummary = (record) => {
    const fields = record?.fields || {};
    const parts = [];

    if (hasMeaningfulValue(fields.comments)) parts.push(fields.comments);
    if (hasMeaningfulValue(fields.special_instructions)) parts.push(fields.special_instructions);
    if (hasMeaningfulValue(fields.designation)) parts.push(`Designation: ${fields.designation}`);
    if (hasMeaningfulValue(fields.tribute_name)) parts.push(`Tribute: ${fields.tribute_name}`);

    return summarizeText(parts.join(" | "));
  };

  const recordHasFollowUp = (record) => {
    const fields = record?.fields || {};
    return ["comments", "special_instructions", "designation", "tribute_name"].some((key) =>
      hasMeaningfulValue(fields[key])
    );
  };

  const recordIsRecurringDonation = (record) => {
    const frequency = String(record?.fields?.donation_frequency || "").toLowerCase();
    return Boolean(frequency && !["once", "one time", "one-time", "single"].includes(frequency));
  };

  const currentAudience = () =>
    newsletterAudienceInputs.find((input) => input.checked)?.value || "members";

  const parseRecipientEmails = (value) => {
    const raw = String(value || "")
      .split(/[,\n;]/g)
      .map((entry) => normalizeEmail(entry))
      .filter((entry) => hasMeaningfulValue(entry));

    const unique = Array.from(new Set(raw));
    const valid = unique.filter((entry) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry));
    const invalid = unique.filter((entry) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry));
    return { valid, invalid };
  };

  const formatCurrency = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return "Not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(numeric);
  };

  const toDateInputValue = (value) => {
    const text = String(value ?? "").trim();
    const match = text.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : "";
  };

  const getMemberDraftDefaults = (record = {}) => ({
    name: String(record.name ?? "").trim(),
    email: String(record.email ?? "").trim(),
    phone: String(record.phone ?? "").trim(),
    street: String(record.street ?? "").trim(),
    city: String(record.city ?? "").trim(),
    state: String(record.state ?? "").trim(),
    zip: String(record.zip ?? "").trim(),
    joinDate: toDateInputValue(record.joinDate),
    renewalDate: toDateInputValue(record.renewalDate),
    status: String(record.status ?? "active").trim() || "active",
    notes: String(record.notes ?? "")
  });

  const getDonorDraftDefaults = (record = {}) => ({
    name: String(record.name ?? "").trim(),
    email: String(record.email ?? "").trim(),
    phone: String(record.phone ?? "").trim(),
    amount: hasMeaningfulValue(record.amount) ? String(record.amount) : "",
    donationDate: toDateInputValue(record.donationDate),
    paymentStatus: String(record.paymentStatus ?? "paid").trim() || "paid",
    frequency: String(record.frequency ?? "").trim(),
    recurring: Boolean(record.recurring),
    notes: String(record.notes ?? "")
  });

  const getMemberRecordById = (recordId) => persistentMembers.find((record) => record.id === recordId) || null;
  const getDonorRecordById = (recordId) => persistentDonors.find((record) => record.id === recordId) || null;

  const getStatusBadgeClass = (value) => {
    const text = String(value ?? "").toLowerCase();
    if (/active|paid/.test(text)) return "admin-status-badge--active";
    if (/pending|submitted|pledged/.test(text)) return "admin-status-badge--pending";
    if (/lapsed/.test(text)) return "admin-status-badge--lapsed";
    return "admin-status-badge--muted";
  };

  const readMemberDraftFromForm = () => ({
    name: memberNameInput?.value.trim() || "",
    email: memberEmailInput?.value.trim() || "",
    phone: memberPhoneInput?.value.trim() || "",
    street: memberStreetInput?.value.trim() || "",
    city: memberCityInput?.value.trim() || "",
    state: memberStateInput?.value.trim() || "",
    zip: memberZipInput?.value.trim() || "",
    joinDate: memberJoinDateInput?.value || "",
    renewalDate: memberRenewalDateInput?.value || "",
    status: memberStatusInput?.value || "active",
    notes: memberNotesInput?.value || ""
  });

  const writeMemberDraftToForm = (draft) => {
    if (!memberForm) return;
    const nextDraft = getMemberDraftDefaults(draft);
    if (memberNameInput) memberNameInput.value = nextDraft.name;
    if (memberEmailInput) memberEmailInput.value = nextDraft.email;
    if (memberPhoneInput) memberPhoneInput.value = nextDraft.phone;
    if (memberStreetInput) memberStreetInput.value = nextDraft.street;
    if (memberCityInput) memberCityInput.value = nextDraft.city;
    if (memberStateInput) memberStateInput.value = nextDraft.state;
    if (memberZipInput) memberZipInput.value = nextDraft.zip;
    if (memberJoinDateInput) memberJoinDateInput.value = nextDraft.joinDate;
    if (memberRenewalDateInput) memberRenewalDateInput.value = nextDraft.renewalDate;
    if (memberStatusInput) memberStatusInput.value = nextDraft.status;
    if (memberNotesInput) memberNotesInput.value = nextDraft.notes;
  };

  const readDonorDraftFromForm = () => ({
    name: donorNameInput?.value.trim() || "",
    email: donorEmailInput?.value.trim() || "",
    phone: donorPhoneInput?.value.trim() || "",
    amount: donorAmountInput?.value || "",
    donationDate: donorDateInput?.value || "",
    paymentStatus: donorPaymentStatusInput?.value || "paid",
    frequency: donorFrequencyInput?.value.trim() || "",
    recurring: Boolean(donorRecurringInput?.checked),
    notes: donorNotesInput?.value || ""
  });

  const writeDonorDraftToForm = (draft) => {
    if (!donorForm) return;
    const nextDraft = getDonorDraftDefaults(draft);
    if (donorNameInput) donorNameInput.value = nextDraft.name;
    if (donorEmailInput) donorEmailInput.value = nextDraft.email;
    if (donorPhoneInput) donorPhoneInput.value = nextDraft.phone;
    if (donorAmountInput) donorAmountInput.value = nextDraft.amount;
    if (donorDateInput) donorDateInput.value = nextDraft.donationDate;
    if (donorPaymentStatusInput) donorPaymentStatusInput.value = nextDraft.paymentStatus;
    if (donorFrequencyInput) donorFrequencyInput.value = nextDraft.frequency;
    if (donorRecurringInput) donorRecurringInput.checked = nextDraft.recurring;
    if (donorNotesInput) donorNotesInput.value = nextDraft.notes;
  };

  const focusMemberEditor = () => memberNameInput?.focus();
  const focusDonorEditor = () => donorNameInput?.focus();

  const openMemberEditor = (mode = "create", recordId = "") => {
    const record = mode === "edit" ? getMemberRecordById(recordId) : null;
    memberEditorState = {
      open: true,
      mode,
      recordId: record?.id || "",
      draft: getMemberDraftDefaults(record || {})
    };
    renderDashboard();
    focusMemberEditor();
  };

  const closeMemberEditor = () => {
    memberEditorState = { open: false, mode: "create", recordId: "", draft: null };
    renderDashboard();
  };

  const openDonorEditor = (mode = "create", recordId = "") => {
    const record = mode === "edit" ? getDonorRecordById(recordId) : null;
    donorEditorState = {
      open: true,
      mode,
      recordId: record?.id || "",
      draft: getDonorDraftDefaults(record || {})
    };
    renderDashboard();
    focusDonorEditor();
  };

  const closeDonorEditor = () => {
    donorEditorState = { open: false, mode: "create", recordId: "", draft: null };
    renderDashboard();
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
      const error = new Error(payload.error || "Unable to load admin data right now.");
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  };

  const getLatestRecordTimestamp = (record, fields) => {
    for (const field of fields) {
      const timestamp = Date.parse(record?.[field] || "");
      if (!Number.isNaN(timestamp) && timestamp > 0) {
        return timestamp;
      }
    }
    return 0;
  };

  const sortNewestRecords = (records, fields) =>
    [...records].sort(
      (left, right) => getLatestRecordTimestamp(right, fields) - getLatestRecordTimestamp(left, fields)
    );

  const recordIsImported = (record) =>
    Boolean(record?.sourceBatchId) || /import/i.test(String(record?.source || ""));

  const hideAllNotes = () => {
    [authNoteCard, dashboardNoteCard].forEach((card) => {
      if (card) card.hidden = true;
    });
    [authNote, dashboardNote].forEach((note) => {
      if (!note) return;
      note.hidden = true;
      note.textContent = "";
      delete note.dataset.state;
    });
  };

  const showNote = (message, isError = false, context = signedIn ? "dashboard" : "auth") => {
    hideAllNotes();
    if (!message) return;

    const targetCard = context === "dashboard" ? dashboardNoteCard : authNoteCard;
    const targetNote = context === "dashboard" ? dashboardNote : authNote;
    if (!targetCard || !targetNote) return;

    targetCard.hidden = false;
    targetNote.hidden = false;
    targetNote.textContent = message;
    targetNote.dataset.state = isError ? "error" : "info";
  };

  const setFormBusy = (form, busy, busyLabel) => {
    const button = form?.querySelector("button[type='submit']");
    if (!button) return;

    if (!button.dataset.defaultLabel) {
      button.dataset.defaultLabel = button.textContent;
    }

    button.disabled = busy;
    button.textContent = busy ? busyLabel : button.dataset.defaultLabel;
  };

  const updateDashboardButtons = (busy) => {
    [refreshButton, exportButton, newsletterPreviewButton, newsletterViewListButton, newsletterConnectButton, newsletterTestButton, newsletterSendButton].forEach((button) => {
      if (button) button.disabled = busy;
    });

    logoutButtons.forEach((button) => {
      button.disabled = busy;
    });
  };

  const closeUserMenu = () => {
    if (!userMenuPanel || !userMenuToggle) return;
    userMenuPanel.hidden = true;
    userMenuToggle.setAttribute("aria-expanded", "false");
  };

  const openSecurityDetails = () => {
    if (!securityDetails) return;
    securityDetails.open = true;
    securityDetails.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderExperienceState = () => {
    if (authExperience) authExperience.hidden = signedIn;
    if (dashboardExperience) dashboardExperience.hidden = !signedIn;
    if (sharedHeader) sharedHeader.hidden = signedIn;
    body.classList.toggle("admin-dashboard-active", signedIn);
    closeUserMenu();
  };

  const renderAuthState = () => {
    if (setupCard) setupCard.hidden = signedIn || authMode !== "signup";
    if (loginCard) loginCard.hidden = signedIn || authMode !== "login";
    if (resetRequestCard) resetRequestCard.hidden = signedIn || authMode !== "request-reset";
    if (resetCard) resetCard.hidden = signedIn || authMode !== "reset";
  };

  const setAuthMode = (nextMode, { updateLocation = true } = {}) => {
    authMode = nextMode;
    renderAuthState();

    if (updateLocation) {
      updateLocationForAuthMode(nextMode);
    }

    if (nextMode === "signup") {
      setupEmailInput?.focus();
    } else if (nextMode === "request-reset") {
      resetRequestEmailInput?.focus();
    } else if (nextMode === "reset") {
      resetPasswordInput?.focus();
    } else {
      loginEmailInput?.focus();
    }
  };

  const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
    currentDashboard = null;
    persistentMembers = [];
    persistentDonors = [];
    persistentImports = [];
    zohoMailStatus = null;
    memberEditorState = { open: false, mode: "create", recordId: "", draft: null };
    donorEditorState = { open: false, mode: "create", recordId: "", draft: null };
    selectedReviewId = "";
    setSignedIn(false);
    renderDashboard();
  };

  const setSignedIn = (nextSignedIn) => {
    signedIn = nextSignedIn;
    renderExperienceState();
    renderAuthState();

    if (!nextSignedIn) {
      setupForm?.reset();
      loginForm?.reset();
      resetRequestForm?.reset();
      resetForm?.reset();
      passwordForm?.reset();
      hideAllNotes();
      if (sessionMeta) sessionMeta.textContent = "Signed out.";
      if (userLabel) userLabel.textContent = "Admin User";
    }
  };

  const updateSessionMeta = (session) => {
    if (!sessionMeta || !userLabel) return;
    const email = session?.email || "";
    const displayName = email ? getDisplayNameFromEmail(email) : "Admin User";
    const expiry = session?.expiresAt ? `Session active until ${formatDateTime(session.expiresAt)}.` : "";

    userLabel.textContent = displayName || "Admin User";
    sessionMeta.textContent = [email ? `Signed in as ${email}.` : "Signed in.", expiry].filter(Boolean).join(" ");
  };

  const getResettableUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("signup");
    url.searchParams.delete("forgot");
    url.searchParams.delete("zoho");
    url.searchParams.delete("zoho_message");
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const getZohoResultFromLocation = () => {
    const url = new URL(window.location.href);
    return {
      state: String(url.searchParams.get("zoho") || "").trim().toLowerCase(),
      message: String(url.searchParams.get("zoho_message") || "").trim()
    };
  };

  const syncAuthModeFromLocation = () => {
    if (signedIn) return;
    setAuthMode(getAuthModeFromLocation(), { updateLocation: false });
  };

  const parseCsvLine = (line) => {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current);
    return values.map((value) => value.trim());
  };

  const normalizeHeader = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  const parseCsv = (text) => {
    const lines = String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      return [];
    }

    const headers = parseCsvLine(lines[0]).map(normalizeHeader);

    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const row = {};

      headers.forEach((header, index) => {
        row[header] = values[index] ?? "";
      });

      return row;
    });
  };

  const getRowValue = (row, aliases) => {
    for (const alias of aliases) {
      const normalized = normalizeHeader(alias);
      if (hasMeaningfulValue(row?.[normalized])) {
        return row[normalized];
      }
    }
    return "";
  };

  const toImportRecord = (row, type, index, fileName) => {
    if (type === "member") {
      const firstName = getRowValue(row, ["first name", "firstname"]);
      const lastName = getRowValue(row, ["last name", "lastname"]);
      const fullName =
        getRowValue(row, ["full name", "fullname", "name"]) ||
        [firstName, lastName].filter(Boolean).join(" ").trim();

      return {
        id: `member-import-${index}`,
        type,
        fileName,
        name: fullName || "Imported member",
        email: getRowValue(row, ["email", "email address"]),
        phone: getRowValue(row, ["phone", "phone number", "mobile"]),
        status: getRowValue(row, ["status", "member status", "membership status"]) || "Imported",
        joinDate: getRowValue(row, ["join date", "joindate"]),
        renewalDate: getRowValue(row, ["renewal date", "renewaldate"]),
        importedAt: new Date().toISOString(),
        raw: row
      };
    }

    return {
      id: `donor-import-${index}`,
      type,
      fileName,
      name:
        getRowValue(row, ["full name", "fullname", "name"]) ||
        [getRowValue(row, ["first name", "firstname"]), getRowValue(row, ["last name", "lastname"])]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        "Imported donor",
      email: getRowValue(row, ["email", "email address"]),
      phone: getRowValue(row, ["phone", "phone number", "mobile"]),
      status: getRowValue(row, ["status", "donor status", "payment status"]) || "Paid",
      amount: getRowValue(row, ["amount", "donation amount", "gift amount"]),
      frequency: getRowValue(row, ["frequency", "donation frequency", "recurring"]),
      donatedAt: getRowValue(row, ["date", "donation date", "gift date"]),
      importedAt: new Date().toISOString(),
      raw: row
    };
  };

  const toImportPreviewRows = (records, type) =>
    records.slice(0, 5).map((record) => {
      if (type === "member") {
        return {
          name: record.name,
          email: record.email,
          phone: record.phone,
          status: record.status,
          join_date: record.joinDate,
          renewal_date: record.renewalDate
        };
      }

      return {
        name: record.name,
        email: record.email,
        phone: record.phone,
        payment_status: record.status,
        amount: record.amount,
        frequency: record.frequency,
        donation_date: record.donatedAt
      };
    });

  const toPersistentImportPayload = (record, type, index) => {
    if (type === "member") {
      return {
        source: "csv-import",
        sourceRecordId: `${record.fileName || "member-import.csv"}#${index + 2}`,
        name: record.name,
        email: record.email,
        phone: record.phone,
        status: record.status,
        joinDate: record.joinDate,
        renewalDate: record.renewalDate
      };
    }

    return {
      source: "csv-import",
      sourceRecordId: `${record.fileName || "donor-import.csv"}#${index + 2}`,
      name: record.name,
      email: record.email,
      phone: record.phone,
      amount: record.amount,
      donationDate: record.donatedAt,
      paymentStatus: record.status,
      frequency: record.frequency,
      recurring: /recurr|monthly|annual|quarterly/i.test(String(record.frequency || ""))
    };
  };

  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportRowsToCsv = (rows, fileName) => {
    if (!rows.length) {
      showNote("There are no records to export yet.", false, "dashboard");
      return false;
    }

    const headers = Object.keys(rows[0]);
    const escapeCsvCell = (value) => {
      const text = String(value ?? "");
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const lines = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(","))
    ];

    downloadBlob(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }), fileName);
    return true;
  };

  const exportDashboardSnapshot = () => {
    const snapshot = {
      dashboard: currentDashboard,
      persistentMembers,
      persistentDonors,
      persistentImports
    };

    downloadBlob(
      new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" }),
      `friends-of-wdac-admin-export-${new Date().toISOString().slice(0, 10)}.json`
    );
  };

  const buildInboxItems = (dashboard) => {
    const formItems = (dashboard?.recentForms || []).map((record, index) => {
      const fields = record.fields || {};
      const name = getNameFromFields(fields) || getDisplayNameFromEmail(fields.email);

      return {
        id: `form-${index}`,
        kind: record.formType === "membership" ? "membership" : "general-donation",
        typeLabel: record.formType === "membership" ? "Membership form" : "General donation form",
        name,
        email: fields.email || "",
        phone: fields.phone || "",
        submittedAt: record.submittedAt,
        rawFields: fields,
        note: getFollowUpSummary(record),
        reviewTitle: name,
        reviewMeta: `${record.formType === "membership" ? "Membership submission" : "Donation submission"} received ${formatDateTime(record.submittedAt)}`
      };
    });

    const signupItems = (dashboard?.recentSubscribers || []).map((record, index) => ({
      id: `signup-${index}`,
      kind: "newsletter",
      typeLabel: "Newsletter signup",
      name: getDisplayNameFromEmail(record.email),
      email: record.email || "",
      phone: "",
      submittedAt: record.createdAt,
      rawFields: { email: record.email },
      note: "Joined the site update list.",
      reviewTitle: record.email || "Newsletter signup",
      reviewMeta: `Newsletter signup received ${formatDateTime(record.createdAt)}`
    }));

    return [...formItems, ...signupItems]
      .sort((left, right) => (Date.parse(right.submittedAt || "") || 0) - (Date.parse(left.submittedAt || "") || 0))
      .slice(0, 6);
  };

  const buildPeopleRecords = (dashboard) => {
    const map = new Map();
    const nameCounts = new Map();

    const upsertPerson = (payload) => {
      const normalizedEmail = normalizeEmail(payload.email);
      const fallbackKey = `${payload.name || "unknown"}|${normalizePhone(payload.phone) || payload.kind}`;
      const key = normalizedEmail || fallbackKey.toLowerCase();
      const timestamp = Date.parse(payload.timestamp || "") || 0;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: payload.name || payload.email || "Unknown contact",
          email: payload.email || "",
          phone: payload.phone || "",
          roles: new Set(),
          memberStatuses: new Set(),
          donorStatuses: new Set(),
          recurring: false,
          imported: false,
          sources: [],
          lastContact: payload.timestamp || "",
          lastContactTime: timestamp
        });
      }

      const person = map.get(key);
      person.name = person.name || payload.name || payload.email || "Unknown contact";
      person.email = person.email || payload.email || "";
      person.phone = person.phone || payload.phone || "";
      const roles = Array.isArray(payload.roles) ? payload.roles : [payload.role];
      roles.filter(Boolean).forEach((role) => person.roles.add(role));
      if (payload.memberStatus) person.memberStatuses.add(payload.memberStatus);
      if (payload.donorStatus) person.donorStatuses.add(payload.donorStatus);
      if (payload.recurring) person.recurring = true;
      if (payload.imported) person.imported = true;
      if (payload.kind) person.sources.push(payload.kind);

      if (timestamp >= person.lastContactTime) {
        person.lastContact = payload.timestamp || person.lastContact;
        person.lastContactTime = timestamp;
      }
    };

    (dashboard?.recentForms || []).forEach((record) => {
      const fields = record.fields || {};
      upsertPerson({
        kind: record.formType,
        role: record.formType === "membership" ? "member" : "donor",
        name: getNameFromFields(fields) || getDisplayNameFromEmail(fields.email),
        email: fields.email || "",
        phone: fields.phone || "",
        timestamp: record.submittedAt,
        memberStatus: record.formType === "membership" ? (recordHasFollowUp(record) ? "Pending" : "Active") : "",
        donorStatus: record.formType === "general-donation" ? "Paid" : "",
        recurring: record.formType === "general-donation" ? recordIsRecurringDonation(record) : false,
        imported: false
      });
    });

    (dashboard?.recentSubscribers || []).forEach((record) => {
      upsertPerson({
        kind: "newsletter",
        role: "newsletter",
        name: getDisplayNameFromEmail(record.email),
        email: record.email || "",
        phone: "",
        timestamp: record.createdAt,
        imported: false
      });
    });

    persistentMembers.forEach((record) => {
      upsertPerson({
        kind: "member-record",
        role: "member",
        name: record.name,
        email: record.email,
        phone: record.phone,
        timestamp: record.updatedAt || record.renewalDate || record.joinDate || record.createdAt,
        memberStatus: toTitleCase(record.status || "active"),
        imported: recordIsImported(record)
      });
    });

    persistentDonors.forEach((record) => {
      upsertPerson({
        kind: "donor-record",
        role: "donor",
        name: record.name,
        email: record.email,
        phone: record.phone,
        timestamp: record.updatedAt || record.donationDate || record.createdAt,
        donorStatus: toTitleCase(record.paymentStatus || "paid"),
        recurring: Boolean(record.recurring),
        imported: recordIsImported(record)
      });
    });

    const people = Array.from(map.values()).map((person) => {
      const normalizedName = String(person.name || "").toLowerCase();
      nameCounts.set(normalizedName, (nameCounts.get(normalizedName) || 0) + 1);
      return person;
    });

    return people
      .map((person) => ({
        ...person,
        roles: Array.from(person.roles),
        memberStatuses: Array.from(person.memberStatuses),
        donorStatuses: Array.from(person.donorStatuses),
        possibleDuplicate:
          Boolean(String(person.name || "").trim()) &&
          (nameCounts.get(String(person.name || "").toLowerCase()) || 0) > 1
      }))
      .sort((left, right) => right.lastContactTime - left.lastContactTime);
  };

  const getDashboardStats = (dashboard) => {
    const stats = dashboard?.stats || {};
    return {
      totalForms: Number(stats.totalForms || 0),
      membershipForms: Number(stats.membershipForms || 0),
      donationForms: Number(stats.donationForms || 0),
      totalSubscribers: Number(stats.totalSubscribers || 0),
      followUpForms: Number(stats.followUpForms || 0)
    };
  };

  const buildViewModel = () => {
    const dashboard = currentDashboard || { recentForms: [], recentSubscribers: [], stats: {}, session: {}, records: {} };
    const stats = getDashboardStats(dashboard);
    const inboxItems = buildInboxItems(dashboard);
    const peopleRecords = buildPeopleRecords(dashboard);
    const peopleSearchQuery = String(peopleSearchInput?.value || "").trim().toLowerCase();

    const filteredPeople = peopleRecords.filter((person) => {
      if (peopleFilterMode === "duplicates" && !person.possibleDuplicate) return false;

      if (!peopleSearchQuery) return true;
      return [
        person.name,
        person.email,
        person.phone,
        person.roles.join(" "),
        person.memberStatuses.join(" "),
        person.donorStatuses.join(" ")
      ]
        .join(" ")
        .toLowerCase()
        .includes(peopleSearchQuery);
    });

    const memberRecords = sortNewestRecords(persistentMembers, ["updatedAt", "renewalDate", "joinDate", "createdAt"]);
    const donorRecords = sortNewestRecords(persistentDonors, ["updatedAt", "donationDate", "createdAt"]);
    const importRecords = sortNewestRecords(persistentImports, ["uploadedAt", "updatedAt", "createdAt"]);

    const memberStats = {
      active: memberRecords.filter(
        (person) =>
          !/lapsed/i.test(person.status || "") &&
          !/pending/i.test(person.status || "")
      ).length,
      lapsed: memberRecords.filter((person) => /lapsed/i.test(person.status || "")).length,
      pending: memberRecords.filter((person) => /pending/i.test(person.status || "")).length,
      imported: memberRecords.filter((person) => recordIsImported(person)).length
    };

    const donorStats = {
      paid: donorRecords.filter((person) => !/pledged|submitted|pending/i.test(person.paymentStatus || "")).length,
      pledged: donorRecords.filter((person) => /pledged|submitted|pending/i.test(person.paymentStatus || "")).length,
      recurring: donorRecords.filter((person) => Boolean(person.recurring)).length,
      oneTime: donorRecords.filter((person) => !person.recurring).length
    };

    const importStats = {
      total: importRecords.length,
      lastBatch: importRecords[0] || null
    };

    const audience = currentAudience();
    const peopleAudienceRecipients = peopleRecords.filter((person) => {
      if (!normalizeEmail(person.email)) return false;
      if (audience === "members") return person.roles.includes("member");
      if (audience === "donors") return person.roles.includes("donor");
      return person.roles.includes("member") || person.roles.includes("donor");
    });
    const customRecipientParse = parseRecipientEmails(newsletterCustomListInput?.value || "");
    const recipientPool = audience === "custom"
      ? customRecipientParse.valid.map((email) => ({ name: "", email }))
      : peopleAudienceRecipients;

    const draftCount =
      hasMeaningfulValue(newsletterSubjectInput?.value) || hasMeaningfulValue(newsletterBodyInput?.value) ? 1 : 0;

    const duplicateCount = peopleRecords.filter((person) => person.possibleDuplicate).length;
    const reviewCount = inboxItems.length + duplicateCount;
    const followUpCount = stats.followUpForms + duplicateCount;

    return {
      dashboard,
      stats,
      inboxItems,
      peopleRecords,
      filteredPeople,
      memberRecords,
      donorRecords,
      memberStats,
      donorStats,
      importRecords,
      importStats,
      audience,
      peopleAudienceCount: peopleAudienceRecipients.length,
      recipientPool,
      customRecipientCount: customRecipientParse.valid.length,
      customInvalidCount: customRecipientParse.invalid.length,
      customInvalidPreview: customRecipientParse.invalid.slice(0, 3),
      draftCount,
      duplicateCount,
      reviewCount,
      followUpCount,
      pendingImports: importStats.total
    };
  };

  const renderSummaryCards = (model) => {
    if (summarySubmissions) summarySubmissions.textContent = String(model.dashboard.recentForms?.length || 0);
    if (summarySignups) summarySignups.textContent = String(model.stats.totalSubscribers || model.inboxItems.filter((item) => item.kind === "newsletter").length);
    if (summaryMembers) summaryMembers.textContent = String(model.memberStats.active);
    if (summaryDonors) summaryDonors.textContent = String(model.donorRecords.length);
    if (summaryImports) summaryImports.textContent = String(model.pendingImports);
    if (summaryDrafts) summaryDrafts.textContent = String(model.draftCount);
  };

  const renderAttentionCards = (model) => {
    if (attentionReviewCount) attentionReviewCount.textContent = String(model.reviewCount);
    if (attentionReviewNote) attentionReviewNote.textContent = model.duplicateCount ? "New submissions or possible duplicates." : "New submissions waiting to be processed.";
    if (attentionFollowupCount) attentionFollowupCount.textContent = String(model.followUpCount);
    if (attentionFollowupNote) attentionFollowupNote.textContent = model.followUpCount ? "Records marked for follow-up or duplicate review." : "No contacts currently marked for follow-up.";
    if (attentionImportsCount) attentionImportsCount.textContent = String(model.importStats.total + model.draftCount);
    if (attentionImportsNote) attentionImportsNote.textContent = model.importStats.total ? "Saved import batches are tracked here." : "No import batches saved yet.";
  };

  const renderInboxTable = (model) => {
    if (!inboxBody) return;

    if (!model.inboxItems.length) {
      inboxBody.innerHTML = `
        <tr class="admin-empty-row">
          <td colspan="5">No recent submissions or newsletter signups have been saved yet.</td>
        </tr>
      `;
      if (reviewCard) reviewCard.hidden = true;
      return;
    }

    inboxBody.innerHTML = model.inboxItems
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.typeLabel)}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(formatDateTime(item.submittedAt))}</td>
            <td><span class="admin-status-badge admin-status-badge--new">New</span></td>
            <td><button class="admin-review-btn" type="button" data-admin-review="${escapeHtml(item.id)}">Review</button></td>
          </tr>
        `
      )
      .join("");

    if (selectedReviewId) {
      renderReviewCard(model, selectedReviewId);
    }
  };

  const renderReviewCard = (model, itemId) => {
    if (!reviewCard || !reviewTitle || !reviewMeta || !reviewFields || !reviewType) return;

    const item = model.inboxItems.find((entry) => entry.id === itemId);
    if (!item) {
      reviewCard.hidden = true;
      return;
    }

    selectedReviewId = itemId;
    reviewCard.hidden = false;
    reviewType.textContent = item.typeLabel;
    reviewTitle.textContent = item.reviewTitle;
    reviewMeta.textContent = item.note ? `${item.reviewMeta} ${item.note}` : item.reviewMeta;

    const entries = Object.entries(item.rawFields || {});
    reviewFields.innerHTML = entries.length
      ? entries
          .map(
            ([key, value]) => `
              <div class="admin-review-field">
                <span>${escapeHtml(toSentenceCase(key))}</span>
                <strong>${escapeHtml(formatValue(value))}</strong>
              </div>
            `
          )
          .join("")
      : `
          <div class="admin-review-field">
            <span>Details</span>
            <strong>No additional fields were saved for this record.</strong>
          </div>
        `;
  };

  const renderPeopleTable = (model) => {
    if (!peopleBody) return;

    if (peopleFilterButton) {
      peopleFilterButton.textContent = peopleFilterMode === "duplicates" ? "Showing duplicates" : "Filters";
    }

    if (!model.filteredPeople.length) {
      peopleBody.innerHTML = `
        <tr class="admin-empty-row">
          <td colspan="4">No contacts match the current search or filter.</td>
        </tr>
      `;
      return;
    }

    peopleBody.innerHTML = model.filteredPeople
      .slice(0, 8)
      .map((person) => {
        const badges = [];

        if (person.roles.includes("member")) {
          badges.push('<span class="admin-role-badge admin-role-badge--member">Member</span>');
        }
        if (person.roles.includes("donor")) {
          badges.push('<span class="admin-role-badge admin-role-badge--donor">Donor</span>');
        }
        if (person.roles.includes("newsletter")) {
          badges.push('<span class="admin-role-badge admin-role-badge--newsletter">Newsletter</span>');
        }
        if (person.possibleDuplicate) {
          badges.push('<span class="admin-role-badge admin-role-badge--duplicate">Possible duplicate</span>');
        }

        return `
          <tr>
            <td>${escapeHtml(person.name)}</td>
            <td>${person.email ? `<a href="mailto:${encodeURIComponent(person.email)}">${escapeHtml(person.email)}</a>` : '<span class="admin-empty">No email</span>'}</td>
            <td>${badges.join("")}</td>
            <td>${escapeHtml(formatDateOnly(person.lastContact))}</td>
          </tr>
        `;
      })
      .join("");
  };

  const renderMemberPanel = (model) => {
    if (membersActive) membersActive.textContent = String(model.memberStats.active);
    if (membersLapsed) membersLapsed.textContent = String(model.memberStats.lapsed);
    if (membersPending) membersPending.textContent = String(model.memberStats.pending);
    if (membersImported) membersImported.textContent = String(model.memberStats.imported);

    if (membersRecordCount) {
      membersRecordCount.textContent = String(model.memberRecords.length);
    }

    if (membersBody) {
      if (!model.memberRecords.length) {
        membersBody.innerHTML = `
          <tr class="admin-empty-row">
            <td colspan="5">No saved member records yet. Use New member to create the first one.</td>
          </tr>
        `;
      } else {
        membersBody.innerHTML = model.memberRecords
          .slice(0, 8)
          .map((record) => {
            const statusLabel = toTitleCase(record.status || "active");
            const renewalLabel = record.renewalDate ? formatDateOnly(record.renewalDate) : "Not set";
            const sourceLabel = toTitleCase(record.source || "manual");

            return `
              <tr>
                <td>
                  <div class="admin-record-meta">
                    <strong>${escapeHtml(record.name || "Unnamed member")}</strong>
                    <span>${escapeHtml(record.email || "No email on file")}</span>
                  </div>
                </td>
                <td>
                  <div class="admin-record-badges">
                    <span class="admin-status-badge ${getStatusBadgeClass(record.status)}">${escapeHtml(statusLabel)}</span>
                    ${recordIsImported(record) ? '<span class="admin-role-badge admin-role-badge--imported">Imported</span>' : `<span class="admin-role-badge">${escapeHtml(sourceLabel)}</span>`}
                  </div>
                </td>
                <td>${record.email ? `<a href="mailto:${encodeURIComponent(record.email)}">${escapeHtml(record.email)}</a>` : '<span class="admin-record-subtle">No email</span>'}</td>
                <td>${escapeHtml(renewalLabel)}</td>
                <td><button class="admin-review-btn" type="button" data-admin-member-edit="${escapeHtml(record.id)}">Edit</button></td>
              </tr>
            `;
          })
          .join("");
      }
    }

    if (!membersEditor || !memberForm) return;
    membersEditor.hidden = !memberEditorState.open;
    if (!memberEditorState.open) return;

    const activeRecord = memberEditorState.recordId ? getMemberRecordById(memberEditorState.recordId) : null;
    const activeDraft = memberEditorState.draft || getMemberDraftDefaults(activeRecord || {});
    const modeLabel = memberEditorState.mode === "edit" ? "Edit member" : "Create member";
    const metaLabel =
      memberEditorState.mode === "edit"
        ? `Editing ${activeRecord?.name || "member record"}${activeRecord?.updatedAt ? `, last updated ${formatDateTime(activeRecord.updatedAt)}.` : "."}`
        : "Add a saved member record to the admin data store.";

    if (memberEditorEyebrow) memberEditorEyebrow.textContent = modeLabel;
    if (memberEditorTitle) memberEditorTitle.textContent = memberEditorState.mode === "edit" ? (activeRecord?.name || "Edit member record") : "New member record";
    if (memberEditorMeta) memberEditorMeta.textContent = metaLabel;
    writeMemberDraftToForm(activeDraft);
  };

  const renderDonorPanel = (model) => {
    if (donorsPaid) donorsPaid.textContent = String(model.donorStats.paid);
    if (donorsPledged) donorsPledged.textContent = String(model.donorStats.pledged);
    if (donorsRecurring) donorsRecurring.textContent = String(model.donorStats.recurring);
    if (donorsOneTime) donorsOneTime.textContent = String(model.donorStats.oneTime);

    if (donorsRecordCount) {
      donorsRecordCount.textContent = String(model.donorRecords.length);
    }

    if (donorsBody) {
      if (!model.donorRecords.length) {
        donorsBody.innerHTML = `
          <tr class="admin-empty-row">
            <td colspan="5">No saved donor records yet. Use New donor to create the first one.</td>
          </tr>
        `;
      } else {
        donorsBody.innerHTML = model.donorRecords
          .slice(0, 8)
          .map((record) => {
            const paymentLabel = toTitleCase(record.paymentStatus || "paid");
            const donationLabel = record.donationDate ? formatDateOnly(record.donationDate) : "Not set";

            return `
              <tr>
                <td>
                  <div class="admin-record-meta">
                    <strong>${escapeHtml(record.name || "Unnamed donor")}</strong>
                    <span>${escapeHtml(record.email || record.phone || "No contact details on file")}</span>
                  </div>
                </td>
                <td>
                  <div class="admin-record-badges">
                    <span class="admin-status-badge ${getStatusBadgeClass(record.paymentStatus)}">${escapeHtml(paymentLabel)}</span>
                    ${record.recurring ? '<span class="admin-role-badge admin-role-badge--imported">Recurring</span>' : '<span class="admin-role-badge">One-time</span>'}
                  </div>
                </td>
                <td>${escapeHtml(formatCurrency(record.amount))}</td>
                <td>${escapeHtml(donationLabel)}</td>
                <td><button class="admin-review-btn" type="button" data-admin-donor-edit="${escapeHtml(record.id)}">Edit</button></td>
              </tr>
            `;
          })
          .join("");
      }
    }

    if (!donorsEditor || !donorForm) return;
    donorsEditor.hidden = !donorEditorState.open;
    if (!donorEditorState.open) return;

    const activeRecord = donorEditorState.recordId ? getDonorRecordById(donorEditorState.recordId) : null;
    const activeDraft = donorEditorState.draft || getDonorDraftDefaults(activeRecord || {});
    const modeLabel = donorEditorState.mode === "edit" ? "Edit donor" : "Create donor";
    const metaLabel =
      donorEditorState.mode === "edit"
        ? `Editing ${activeRecord?.name || "donor record"}${activeRecord?.updatedAt ? `, last updated ${formatDateTime(activeRecord.updatedAt)}.` : "."}`
        : "Add a saved donor record to the admin data store.";

    if (donorEditorEyebrow) donorEditorEyebrow.textContent = modeLabel;
    if (donorEditorTitle) donorEditorTitle.textContent = donorEditorState.mode === "edit" ? (activeRecord?.name || "Edit donor record") : "New donor record";
    if (donorEditorMeta) donorEditorMeta.textContent = metaLabel;
    writeDonorDraftToForm(activeDraft);
  };

  const renderNewsletterPanel = (model) => {
    const configured = Boolean(zohoMailStatus?.configured);
    const connected = Boolean(zohoMailStatus?.connected);

    if (newsletterRecipientCount) newsletterRecipientCount.textContent = String(model.recipientPool.length);
    if (newsletterRecipientNote) {
      if (model.audience === "custom") {
        newsletterRecipientNote.textContent = model.customInvalidCount
          ? `Using ${model.customRecipientCount} valid custom email(s). ${model.customInvalidCount} invalid email(s) will be ignored.`
          : "Using valid emails from the custom list.";
      } else {
        newsletterRecipientNote.textContent = "Estimated recipients from the selected saved-contact audience.";
      }
    }

    if (newsletterAudienceNote) {
      if (model.audience === "custom") {
        newsletterAudienceNote.textContent = "Custom list mode is active. Newsletter sends only to valid emails entered below.";
      } else {
        newsletterAudienceNote.textContent = `Audience recipients are pulled from saved contacts (${model.peopleAudienceCount} currently matched).`;
      }
    }

    if (newsletterCustomListInput) {
      newsletterCustomListInput.disabled = model.audience !== "custom";
    }

    if (newsletterZohoState) {
      newsletterZohoState.textContent = zohoMailStatus?.connected ? "Connected" : (zohoMailStatus?.configured ? "Not connected" : "Missing config");
    }
    if (newsletterTestState) {
      if (!configured) {
        newsletterTestState.textContent = "Blocked";
      } else if (!connected) {
        newsletterTestState.textContent = "Connect first";
      } else if (model.audience === "custom") {
        newsletterTestState.textContent = model.customRecipientCount
          ? `Custom (${Math.min(model.customRecipientCount, 5)})`
          : "Add custom email";
      } else {
        newsletterTestState.textContent = "Admin inbox";
      }
    }
    if (newsletterLimitState) {
      const limit = Number(zohoMailStatus?.maxNewsletterRecipients || 75);
      newsletterLimitState.textContent = `Max ${limit}`;
    }

    if (newsletterConnectButton) {
      if (!configured) {
        newsletterConnectButton.textContent = "Zoho not configured";
        newsletterConnectButton.disabled = true;
      } else if (!connected) {
        newsletterConnectButton.textContent = "Connect Zoho";
        newsletterConnectButton.disabled = false;
      } else {
        newsletterConnectButton.textContent = "Zoho connected";
        newsletterConnectButton.disabled = true;
      }
    }

    if (newsletterTestButton) {
      if (!configured || !connected) {
        newsletterTestButton.disabled = true;
      }
    }

    if (newsletterSendButton) {
      if (!configured || !connected) {
        newsletterSendButton.disabled = true;
      }
    }

    if (newsletterDeliveryStatus) {
      if (!zohoMailStatus?.configured) {
        newsletterDeliveryStatus.textContent = "Email delivery status: Zoho credentials are not configured in Cloudflare yet.";
      } else if (!zohoMailStatus?.connected) {
        newsletterDeliveryStatus.textContent = "Email delivery status: Zoho is configured but not connected. Click Connect Zoho to complete OAuth connection.";
      } else {
        const mailbox = zohoMailStatus.mailboxEmail || "shared mailbox";
        newsletterDeliveryStatus.textContent = `Email delivery status: connected to Zoho mailbox ${mailbox}.`;
      }
    }
  };

  const renderImportStatus = (model) => {
    if (!importStatusTitle || !importStatusCopy || !importStatusDetail) return;

    if (!model.importRecords.length) {
      importStatusTitle.textContent = "Import guidance";
      importStatusCopy.textContent = "Upload a member or donor CSV to save records and an import batch to the admin database.";
      importStatusDetail.textContent = "No import batches have been saved yet.";
      return;
    }

    const latestBatch = model.importStats.lastBatch;
    const latestStatus = /imported/i.test(String(latestBatch?.status || "")) ? "saved" : toSentenceCase(latestBatch?.status || "saved");
    const latestCount = Number(latestBatch?.rowCount || 0);
    const latestType = toSentenceCase(latestBatch?.entityType || "record");
    const latestDate = formatDateTime(latestBatch?.uploadedAt || latestBatch?.createdAt);

    importStatusTitle.textContent = `${latestType} import ${latestStatus}`;
    importStatusCopy.textContent = `${latestCount} ${String(latestBatch?.entityType || "record")} record${latestCount === 1 ? "" : "s"} were saved from ${latestBatch?.fileName || "the uploaded CSV"} on ${latestDate}.`;
    importStatusDetail.textContent = `${model.importStats.total} saved import batch${model.importStats.total === 1 ? "" : "es"} are available in the admin record store.`;
  };

  const renderDashboard = () => {
    const model = buildViewModel();
    renderSummaryCards(model);
    renderAttentionCards(model);
    renderInboxTable(model);
    renderPeopleTable(model);
    renderMemberPanel(model);
    renderDonorPanel(model);
    renderNewsletterPanel(model);
    renderImportStatus(model);
  };

  const loadDashboard = async (announceSuccess = false) => {
    const token = getToken();
    if (!token) {
      clearSession();
      return;
    }

    updateDashboardButtons(true);

    try {
      const dashboardPayload = await requestAdminJson(`/dashboard?limit=${DASHBOARD_LIMIT}&subscriberLimit=${SUBSCRIBER_LIMIT}`);
      const [membersPayload, donorsPayload, importsPayload, mailStatusPayload] = await Promise.all([
        requestAdminJson("/members"),
        requestAdminJson("/donors"),
        requestAdminJson("/imports"),
        requestAdminJson("/mail/status")
      ]);

      currentDashboard = {
        stats: dashboardPayload?.stats || {},
        recentForms: Array.isArray(dashboardPayload?.recentForms) ? dashboardPayload.recentForms : [],
        recentSubscribers: Array.isArray(dashboardPayload?.recentSubscribers) ? dashboardPayload.recentSubscribers : [],
        session: dashboardPayload?.session || {},
        records: dashboardPayload?.records || {}
      };
      persistentMembers = Array.isArray(membersPayload?.records) ? membersPayload.records : [];
      persistentDonors = Array.isArray(donorsPayload?.records) ? donorsPayload.records : [];
      persistentImports = Array.isArray(importsPayload?.records) ? importsPayload.records : [];
      zohoMailStatus = mailStatusPayload || null;

      setSignedIn(true);
      updateSessionMeta(currentDashboard.session);
      renderDashboard();

      if (announceSuccess) {
        showNote("Admin dashboard refreshed.", false, "dashboard");
      }
    } catch (error) {
      if (error?.status === 401) {
        clearSession();
        showNote("Your admin session expired. Sign in again to continue.", true, "auth");
        return;
      }
      showNote(error?.message || "Unable to load admin data right now.", true, signedIn ? "dashboard" : "auth");
    } finally {
      updateDashboardButtons(false);
    }
  };

  const handleImportFile = async (file, type) => {
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCsv(text);

      if (!rows.length) {
        throw new Error("This CSV file does not contain any data rows.");
      }

      const mappedRows = rows.map((row, index) => toImportRecord(row, type, index, file.name));
      const payload = await requestAdminJson("/imports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          entityType: type,
          fileName: file.name,
          rowCount: mappedRows.length,
          status: "imported",
          source: "admin-upload",
          notes: `${mappedRows.length} ${type} record${mappedRows.length === 1 ? "" : "s"} uploaded from ${file.name}.`,
          previewRows: toImportPreviewRows(mappedRows, type),
          records: mappedRows.map((record, index) => toPersistentImportPayload(record, type, index))
        })
      });

      await loadDashboard(false);
      showNote(
        `${Number(payload?.importedCount || mappedRows.length)} ${type === "member" ? "member" : "donor"} record${mappedRows.length === 1 ? "" : "s"} saved from ${file.name}.`,
        false,
        "dashboard"
      );
    } catch (error) {
      if (error?.status === 401) {
        clearSession();
        showNote("Your admin session expired. Sign in again to continue.", true, "auth");
        return;
      }
      showNote(error?.message || "Unable to read that CSV file.", true, "dashboard");
    }
  };

  const createMemberExportRows = () => {
    const { memberRecords } = buildViewModel();
    return memberRecords.map((record) => ({
      name: record.name,
      email: record.email,
      phone: record.phone,
      status: record.status || "active",
      join_date: record.joinDate || "",
      renewal_date: record.renewalDate || "",
      source: record.source || "manual",
      updated_at: formatDateOnly(record.updatedAt || record.createdAt)
    }));
  };

  const createDonorExportRows = () => {
    const { donorRecords } = buildViewModel();
    return donorRecords.map((record) => ({
      name: record.name,
      email: record.email,
      phone: record.phone,
      payment_status: record.paymentStatus || "paid",
      amount: record.amount ?? "",
      recurring: record.recurring ? "Yes" : "No",
      donation_date: record.donationDate || "",
      source: record.source || "manual",
      updated_at: formatDateOnly(record.updatedAt || record.createdAt)
    }));
  };

  const scrollRecordManagerIntoView = (element) => {
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const persistMemberEditorDraft = () => {
    if (!memberEditorState.open) return;
    memberEditorState = {
      ...memberEditorState,
      draft: readMemberDraftFromForm()
    };
  };

  const persistDonorEditorDraft = () => {
    if (!donorEditorState.open) return;
    donorEditorState = {
      ...donorEditorState,
      draft: readDonorDraftFromForm()
    };
  };

  const saveMemberRecord = async () => {
    const draft = readMemberDraftFromForm();
    memberEditorState = { ...memberEditorState, draft };

    if (!draft.name && !draft.email) {
      throw new Error("Add at least a member name or email before saving.");
    }

    const path = memberEditorState.mode === "edit" && memberEditorState.recordId
      ? `/members/${encodeURIComponent(memberEditorState.recordId)}`
      : "/members";
    const method = memberEditorState.mode === "edit" && memberEditorState.recordId ? "PATCH" : "POST";

    const payload = {
      name: draft.name,
      email: draft.email,
      phone: draft.phone,
      street: draft.street,
      city: draft.city,
      state: draft.state,
      zip: draft.zip,
      joinDate: draft.joinDate,
      renewalDate: draft.renewalDate,
      status: draft.status,
      notes: draft.notes
    };

    return requestAdminJson(path, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  };

  const saveDonorRecord = async () => {
    const draft = readDonorDraftFromForm();
    donorEditorState = { ...donorEditorState, draft };

    if (!draft.name && !draft.email) {
      throw new Error("Add at least a donor name or email before saving.");
    }

    const path = donorEditorState.mode === "edit" && donorEditorState.recordId
      ? `/donors/${encodeURIComponent(donorEditorState.recordId)}`
      : "/donors";
    const method = donorEditorState.mode === "edit" && donorEditorState.recordId ? "PATCH" : "POST";

    const payload = {
      name: draft.name,
      email: draft.email,
      phone: draft.phone,
      amount: draft.amount,
      donationDate: draft.donationDate,
      paymentStatus: draft.paymentStatus,
      frequency: draft.frequency,
      recurring: draft.recurring,
      notes: draft.notes
    };

    return requestAdminJson(path, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  };

  const downloadTemplates = () => {
    exportRowsToCsv(
      [
        {
          name: "Jane Supporter",
          email: "jane@example.com",
          phone: "541-555-0100",
          status: "Active",
          join_date: "2026-01-15",
          renewal_date: "2027-01-15"
        }
      ],
      "friends-of-wdac-members-template.csv"
    );

    window.setTimeout(() => {
      exportRowsToCsv(
        [
          {
            name: "John Donor",
            email: "john@example.com",
            phone: "541-555-0110",
            status: "Paid",
            amount: "100.00",
            frequency: "One-time",
            donation_date: "2026-04-21"
          }
        ],
        "friends-of-wdac-donors-template.csv"
      );
    }, 220);
  };

  const previewNewsletter = () => {
    const subject = newsletterSubjectInput?.value.trim() || "Friends of WDAC update";
    const bodyContent = newsletterBodyInput?.value.trim() || "Draft newsletter content goes here.";
    const { recipientPool } = buildViewModel();

    const previewWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!previewWindow) {
      showNote("The preview window was blocked. Please allow popups and try again.", true, "dashboard");
      return;
    }

    previewWindow.document.write(`
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(subject)}</title>
        <style>
          body { margin: 0; padding: 32px; background: #f4f8fc; color: #17384f; font-family: Inter, Arial, sans-serif; }
          .shell { max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid rgba(15, 92, 134, 0.12); }
          .hero { padding: 28px 30px; background: #0f5c86; color: #ffffff; }
          .hero h1 { margin: 0; font-size: 34px; line-height: 1.05; }
          .body { padding: 28px 30px; white-space: pre-wrap; line-height: 1.7; }
          .meta { padding: 0 30px 28px; color: #5d7891; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="shell">
          <div class="hero">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:800;">Friends of WDAC newsletter preview</p>
            <h1>${escapeHtml(subject)}</h1>
          </div>
          <div class="body">${escapeHtml(bodyContent)}</div>
          <div class="meta">Estimated recipients: ${recipientPool.length}</div>
        </div>
      </body>
      </html>
    `);
    previewWindow.document.close();
  };

  const startZohoConnect = async () => {
    const status = await requestAdminJson("/mail/status");
    zohoMailStatus = status || null;
    renderDashboard();

    if (!status?.configured) {
      throw new Error("Zoho is not configured yet. Add the Zoho secrets in Cloudflare first.");
    }

    if (status?.connected) {
      showNote("Zoho is already connected.", false, "dashboard");
      return false;
    }

    const connectPayload = await requestAdminJson("/mail/connect");
    if (!connectPayload?.authorizeUrl) {
      throw new Error("Unable to start Zoho OAuth connection.");
    }

    window.location.assign(connectPayload.authorizeUrl);
    return true;
  };

  const ensureZohoReadyForMail = async () => {
    const status = await requestAdminJson("/mail/status");
    zohoMailStatus = status || null;
    renderDashboard();

    if (!status?.configured) {
      throw new Error("Zoho is not configured yet. Add the Zoho secrets in Cloudflare first.");
    }

    if (status?.connected) {
      return true;
    }

    throw new Error("Zoho is not connected yet. Click Connect Zoho first.");
  };

  const getTestEmailRecipients = (model) => {
    if (model.audience === "custom") {
      const customRecipients = model.recipientPool
        .map((person) => normalizeEmail(person.email))
        .filter((email) => hasMeaningfulValue(email));

      return {
        recipients: customRecipients.slice(0, 5),
        requestedCount: customRecipients.length,
        mode: "custom"
      };
    }

    const fallback = normalizeEmail(currentDashboard?.session?.email || "");
    return {
      recipients: fallback ? [fallback] : [],
      requestedCount: fallback ? 1 : 0,
      mode: "session"
    };
  };

  const sendTestEmail = async () => {
    const ready = await ensureZohoReadyForMail();
    if (!ready) return false;

    const subject = newsletterSubjectInput?.value.trim() || "Friends of WDAC update";
    const content = newsletterBodyInput?.value.trim() || "This is a test message from the Friends of WDAC admin.";
    const model = buildViewModel();
    const target = getTestEmailRecipients(model);

    if (!target.recipients.length) {
      if (target.mode === "custom") {
        throw new Error("Add at least one valid custom recipient email before sending a test.");
      }
      throw new Error("Your admin session email is unavailable. Sign out and sign back in, then retry.");
    }

    if (target.mode === "custom" && target.requestedCount > target.recipients.length) {
      showNote("Custom list has more than 5 recipients. Test send will use the first 5 valid emails.", false, "dashboard");
    }

    const payload = await requestAdminJson("/mail/send-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        toEmails: target.recipients,
        subject,
        content
      })
    });

    const sentTo = Array.isArray(payload?.sentTo)
      ? payload.sentTo.filter((email) => hasMeaningfulValue(email))
      : [];
    const failureCount = Number(payload?.failureCount || 0);
    if (sentTo.length && failureCount > 0) {
      showNote(`Test email sent to ${sentTo.length} recipient(s), ${failureCount} failed.`, true, "dashboard");
    } else if (sentTo.length) {
      showNote(`Test email sent to: ${sentTo.join(", ")}.`, false, "dashboard");
    } else {
      showNote("Test email request completed, but no successful recipients were reported.", true, "dashboard");
    }
    return true;
  };

  const sendNewsletter = async () => {
    const model = buildViewModel();
    const subject = newsletterSubjectInput?.value.trim() || "";
    const content = newsletterBodyInput?.value.trim() || "";
    const recipients = model.recipientPool
      .map((person) => normalizeEmail(person.email))
      .filter((email) => hasMeaningfulValue(email));

    if (!subject) {
      throw new Error("Add a subject before sending the newsletter.");
    }

    if (!content) {
      throw new Error("Add newsletter body content before sending.");
    }

    if (!recipients.length) {
      throw new Error("No recipient emails are available in the current audience.");
    }

    const ready = await ensureZohoReadyForMail();
    if (!ready) return;

    const audience = currentAudience();
    if (audience === "custom" && model.customInvalidCount) {
      const sample = model.customInvalidPreview.length ? ` (${model.customInvalidPreview.join(", ")})` : "";
      showNote(`Ignored ${model.customInvalidCount} invalid custom email(s)${sample}.`, true, "dashboard");
    }
    const confirmSend = window.confirm(`Send this newsletter to ${recipients.length} recipient(s)?`);
    if (!confirmSend) return;

    const payload = await requestAdminJson("/mail/send-newsletter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        subject,
        content,
        audience,
        recipients
      })
    });

    const failureCount = Number(payload?.failureCount || 0);
    const successCount = Number(payload?.successCount || 0);
    if (failureCount > 0) {
      showNote(`Newsletter sent to ${successCount} recipient(s), ${failureCount} failed.`, true, "dashboard");
    } else {
      showNote(`Newsletter sent to ${successCount} recipient(s).`, false, "dashboard");
    }
  };

  const sendSupportMessage = async () => {
    const name = supportNameInput?.value.trim() || "";
    const email = supportEmailInput?.value.trim() || "";
    const subject = supportSubjectInput?.value.trim() || "";
    const message = supportMessageInput?.value.trim() || "";
    const website = supportWebsiteInput?.value || "";

    if (!name) {
      throw new Error("Please add your name.");
    }

    if (!email) {
      throw new Error("Please add your email.");
    }

    if (!message) {
      throw new Error("Please add a message.");
    }

    return requestAdminJson("/support/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        website
      })
    });
  };

  const initializeNavState = () => {
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        navItems.forEach((navItem) => navItem.classList.remove("is-active"));
        item.classList.add("is-active");
      });
    });
  };

  setupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = setupEmailInput?.value.trim() || "";
    const password = setupPasswordInput?.value || "";
    const confirmPassword = setupConfirmPasswordInput?.value || "";

    if (!email || !password || !confirmPassword) {
      showNote("Complete every field to create your admin account.", true, "auth");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      showNote(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, true, "auth");
      return;
    }

    if (password !== confirmPassword) {
      showNote("The password confirmation does not match.", true, "auth");
      return;
    }

    setFormBusy(setupForm, true, "Creating account...");

    try {
      const response = await fetch(`${apiBase}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.token) {
        throw new Error(payload.error || "Unable to create your admin account.");
      }

      sessionStorage.setItem(SESSION_KEY, payload.token);
      setSignedIn(true);
      await loadDashboard(false);
      showNote("Account created. Loading the dashboard now.", false, "dashboard");
    } catch (error) {
      showNote(error?.message || "Unable to create your admin account right now.", true, "auth");
    } finally {
      setFormBusy(setupForm, false, "Creating account...");
    }
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = loginEmailInput?.value.trim() || "";
    const password = loginPasswordInput?.value || "";

    if (!email || !password) {
      showNote("Enter the admin email and password to continue.", true, "auth");
      return;
    }

    setFormBusy(loginForm, true, "Signing in...");

    try {
      const response = await fetch(`${apiBase}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 404 && payload.signupAvailable) {
        setAuthMode("signup");
        throw new Error(payload.error || "No account exists for this email yet. Use Create account first.");
      }

      if (!response.ok || !payload.token) {
        throw new Error(payload.error || "Sign-in failed.");
      }

      sessionStorage.setItem(SESSION_KEY, payload.token);
      setSignedIn(true);
      await loadDashboard(false);
      showNote("Sign-in successful. Welcome to the operations hub.", false, "dashboard");
    } catch (error) {
      clearSession();
      showNote(error?.message || "Unable to sign in right now.", true, "auth");
    } finally {
      setFormBusy(loginForm, false, "Signing in...");
    }
  });

  resetRequestForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = resetRequestEmailInput?.value.trim() || "";
    if (!email) {
      showNote("Enter your admin email to request a reset link.", true, "auth");
      return;
    }

    setFormBusy(resetRequestForm, true, "Sending reset link...");

    try {
      const response = await fetch(`${apiBase}/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 404 && payload.signupAvailable) {
        setAuthMode("signup");
        throw new Error(payload.error || "No account exists for this email yet. Create account first.");
      }

      if (!response.ok) {
        throw new Error(payload.error || "Unable to send the reset link.");
      }

      if (loginEmailInput) {
        loginEmailInput.value = email;
      }
      showNote(payload.message || "If that email can reset this account, we sent a reset link.", false, "auth");
    } catch (error) {
      showNote(error?.message || "Unable to send the reset link right now.", true, "auth");
    } finally {
      setFormBusy(resetRequestForm, false, "Sending reset link...");
    }
  });

  resetForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = getResetTokenFromLocation();
    const newPassword = resetPasswordInput?.value || "";
    const confirmPassword = resetConfirmPasswordInput?.value || "";

    if (!token) {
      showNote("This reset link is missing or invalid. Request a new reset email.", true, "auth");
      setAuthMode("request-reset");
      return;
    }

    if (!newPassword || !confirmPassword) {
      showNote("Enter and confirm your new password.", true, "auth");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      showNote(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`, true, "auth");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNote("The new password confirmation does not match.", true, "auth");
      return;
    }

    setFormBusy(resetForm, true, "Resetting password...");

    try {
      const response = await fetch(`${apiBase}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, newPassword })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.token) {
        throw new Error(payload.error || "Unable to reset the password.");
      }

      sessionStorage.setItem(SESSION_KEY, payload.token);
      setSignedIn(true);
      await loadDashboard(false);
      showNote("Password reset successful. Loading the dashboard now.", false, "dashboard");
    } catch (error) {
      showNote(error?.message || "Unable to reset the password right now.", true, "auth");
    } finally {
      setFormBusy(resetForm, false, "Resetting password...");
    }
  });

  passwordForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentPassword = currentPasswordInput?.value || "";
    const nextPassword = newPasswordInput?.value || "";
    const confirmPassword = confirmPasswordInput?.value || "";

    if (!currentPassword || !nextPassword || !confirmPassword) {
      showNote("Complete all password fields to update the admin password.", true, "dashboard");
      return;
    }

    if (nextPassword.length < MIN_PASSWORD_LENGTH) {
      showNote(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`, true, "dashboard");
      return;
    }

    if (nextPassword !== confirmPassword) {
      showNote("The new password confirmation does not match.", true, "dashboard");
      return;
    }

    setFormBusy(passwordForm, true, "Updating password...");

    try {
      const response = await fetch(`${apiBase}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({ currentPassword, newPassword: nextPassword })
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        clearSession();
        throw new Error(payload.error || "Your session expired. Sign in again.");
      }

      if (!response.ok || !payload.token) {
        throw new Error(payload.error || "Unable to update the password.");
      }

      sessionStorage.setItem(SESSION_KEY, payload.token);
      passwordForm.reset();
      updateSessionMeta({
        expiresAt: payload.expiresAt,
        email: payload?.user?.email || currentDashboard?.session?.email
      });
      showNote("Admin password updated.", false, "dashboard");
    } catch (error) {
      showNote(error?.message || "Unable to update the password.", true, "dashboard");
    } finally {
      setFormBusy(passwordForm, false, "Updating password...");
    }
  });

  refreshButton?.addEventListener("click", () => {
    closeUserMenu();
    loadDashboard(true);
  });

  exportButton?.addEventListener("click", () => {
    closeUserMenu();
    exportDashboardSnapshot();
    showNote("Admin export downloaded.", false, "dashboard");
  });

  logoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      clearSession();
      setAuthMode("login");
      showNote("Signed out.", false, "auth");
    });
  });

  showSignupButton?.addEventListener("click", (event) => {
    event.preventDefault();
    setAuthMode("signup");
    hideAllNotes();
  });

  showLoginButton?.addEventListener("click", (event) => {
    event.preventDefault();
    setAuthMode("login");
    hideAllNotes();
  });

  showResetRequestButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (resetRequestEmailInput && loginEmailInput?.value.trim()) {
      resetRequestEmailInput.value = loginEmailInput.value.trim();
    }
    setAuthMode("request-reset");
    hideAllNotes();
  });

  showResetRequestFromSignupButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (resetRequestEmailInput && setupEmailInput?.value.trim()) {
      resetRequestEmailInput.value = setupEmailInput.value.trim();
    }
    setAuthMode("request-reset");
    hideAllNotes();
  });

  showLoginFromResetRequestButton?.addEventListener("click", (event) => {
    event.preventDefault();
    setAuthMode("login");
    hideAllNotes();
  });

  showSignupFromResetRequestButton?.addEventListener("click", (event) => {
    event.preventDefault();
    setAuthMode("signup");
    hideAllNotes();
  });

  showResetRequestFromResetButton?.addEventListener("click", (event) => {
    event.preventDefault();
    setAuthMode("request-reset");
    hideAllNotes();
  });

  showLoginFromResetButton?.addEventListener("click", (event) => {
    event.preventDefault();
    setAuthMode("login");
    hideAllNotes();
  });

  userMenuToggle?.addEventListener("click", () => {
    if (!userMenuPanel) return;
    const nextExpanded = userMenuPanel.hidden;
    userMenuPanel.hidden = !nextExpanded;
    userMenuToggle.setAttribute("aria-expanded", nextExpanded ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    if (!userMenuPanel || !userMenuToggle) return;
    if (userMenuPanel.hidden) return;
    if (userMenuPanel.contains(event.target) || userMenuToggle.contains(event.target)) return;
    closeUserMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeUserMenu();
    }
  });

  openSecurityButton?.addEventListener("click", () => {
    closeUserMenu();
    openSecurityDetails();
  });

  reviewCloseButton?.addEventListener("click", () => {
    selectedReviewId = "";
    if (reviewCard) reviewCard.hidden = true;
  });

  inboxBody?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-review]");
    if (!button) return;
    const itemId = button.dataset.adminReview || "";
    if (!itemId) return;
    const model = buildViewModel();
    renderReviewCard(model, itemId);
  });

  peopleSearchInput?.addEventListener("input", () => {
    renderDashboard();
  });

  peopleFilterButton?.addEventListener("click", () => {
    peopleFilterMode = peopleFilterMode === "all" ? "duplicates" : "all";
    renderDashboard();
  });

  membersAddButton?.addEventListener("click", () => {
    openMemberEditor("create");
    scrollRecordManagerIntoView(membersManager);
  });

  donorsAddButton?.addEventListener("click", () => {
    openDonorEditor("create");
    scrollRecordManagerIntoView(donorsManager);
  });

  membersBody?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-member-edit]");
    if (!button) return;
    const recordId = button.dataset.adminMemberEdit || "";
    if (!recordId) return;
    openMemberEditor("edit", recordId);
    scrollRecordManagerIntoView(membersManager);
  });

  donorsBody?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-donor-edit]");
    if (!button) return;
    const recordId = button.dataset.adminDonorEdit || "";
    if (!recordId) return;
    openDonorEditor("edit", recordId);
    scrollRecordManagerIntoView(donorsManager);
  });

  [memberForm].forEach((form) => {
    form?.addEventListener("input", persistMemberEditorDraft);
    form?.addEventListener("change", persistMemberEditorDraft);
  });

  [donorForm].forEach((form) => {
    form?.addEventListener("input", persistDonorEditorDraft);
    form?.addEventListener("change", persistDonorEditorDraft);
  });

  memberCancelButton?.addEventListener("click", () => {
    closeMemberEditor();
    showNote("Member edit cancelled.", false, "dashboard");
  });

  donorCancelButton?.addEventListener("click", () => {
    closeDonorEditor();
    showNote("Donor edit cancelled.", false, "dashboard");
  });

  memberForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isEditMode = memberEditorState.mode === "edit";
    const busyLabel = isEditMode ? "Saving member..." : "Creating member...";
    setFormBusy(memberForm, true, busyLabel);

    try {
      await saveMemberRecord();
      closeMemberEditor();
      await loadDashboard(false);
      showNote(isEditMode ? "Member record updated." : "Member record created.", false, "dashboard");
      scrollRecordManagerIntoView(membersManager);
    } catch (error) {
      if (error?.status === 401) {
        clearSession();
        showNote("Your admin session expired. Sign in again to continue.", true, "auth");
        return;
      }
      showNote(error?.message || "Unable to save the member record.", true, "dashboard");
    } finally {
      setFormBusy(memberForm, false, busyLabel);
    }
  });

  donorForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isEditMode = donorEditorState.mode === "edit";
    const busyLabel = isEditMode ? "Saving donor..." : "Creating donor...";
    setFormBusy(donorForm, true, busyLabel);

    try {
      await saveDonorRecord();
      closeDonorEditor();
      await loadDashboard(false);
      showNote(isEditMode ? "Donor record updated." : "Donor record created.", false, "dashboard");
      scrollRecordManagerIntoView(donorsManager);
    } catch (error) {
      if (error?.status === 401) {
        clearSession();
        showNote("Your admin session expired. Sign in again to continue.", true, "auth");
        return;
      }
      showNote(error?.message || "Unable to save the donor record.", true, "dashboard");
    } finally {
      setFormBusy(donorForm, false, busyLabel);
    }
  });

  newsletterAudienceInputs.forEach((input) => {
    input.addEventListener("change", () => {
      renderDashboard();
    });
  });

  [newsletterSubjectInput, newsletterBodyInput, newsletterCustomListInput].forEach((input) => {
    input?.addEventListener("input", () => {
      renderDashboard();
    });
  });

  newsletterPreviewButton?.addEventListener("click", () => {
    previewNewsletter();
  });

  newsletterConnectButton?.addEventListener("click", async () => {
    const defaultLabel = newsletterConnectButton.textContent;
    newsletterConnectButton.disabled = true;
    newsletterConnectButton.textContent = "Connecting...";
    try {
      await startZohoConnect();
    } catch (error) {
      showNote(error?.message || "Unable to start Zoho connection right now.", true, "dashboard");
      newsletterConnectButton.disabled = false;
      newsletterConnectButton.textContent = defaultLabel;
    }
  });

  newsletterViewListButton?.addEventListener("click", () => {
    const model = buildViewModel();
    if (!model.recipientPool.length) {
      showNote("No recipients are available for the selected audience.", true, "dashboard");
      return;
    }

    const previewList = model.recipientPool
      .slice(0, 15)
      .map((person) => person.email)
      .filter((email) => hasMeaningfulValue(email))
      .join(", ");
    const suffix = model.recipientPool.length > 15 ? "..." : "";
    showNote(`Preview recipients (${model.recipientPool.length}): ${previewList}${suffix}`, false, "dashboard");
  });

  newsletterTestButton?.addEventListener("click", async () => {
    const defaultLabel = newsletterTestButton.textContent;
    newsletterTestButton.disabled = true;
    newsletterTestButton.textContent = "Sending...";
    try {
      const sent = await sendTestEmail();
      if (sent) {
        await loadDashboard(false);
      }
    } catch (error) {
      showNote(error?.message || "Unable to send a test email right now.", true, "dashboard");
    } finally {
      newsletterTestButton.disabled = false;
      newsletterTestButton.textContent = defaultLabel;
    }
  });

  newsletterSendButton?.addEventListener("click", async () => {
    const defaultLabel = newsletterSendButton.textContent;
    newsletterSendButton.disabled = true;
    newsletterSendButton.textContent = "Sending...";
    try {
      await sendNewsletter();
      await loadDashboard(false);
    } catch (error) {
      showNote(error?.message || "Unable to send the newsletter right now.", true, "dashboard");
    } finally {
      newsletterSendButton.disabled = false;
      newsletterSendButton.textContent = defaultLabel;
    }
  });

  emailSettingsButton?.addEventListener("click", () => {
    const mailbox = zohoMailStatus?.mailboxEmail || "Not connected yet";
    const sender = zohoMailStatus?.fromAddress || "Not configured";
    const limit = Number(zohoMailStatus?.maxNewsletterRecipients || 75);
    showNote(`Zoho mailbox: ${mailbox}. Sender: ${sender}. Current send guardrail: ${limit} recipients per send.`, false, "dashboard");
  });

  membersUploadButton?.addEventListener("click", () => membersUploadInput?.click());
  donorsUploadButton?.addEventListener("click", () => donorsUploadInput?.click());
  importMembersButton?.addEventListener("click", () => membersUploadInput?.click());
  importDonorsButton?.addEventListener("click", () => donorsUploadInput?.click());

  membersUploadInput?.addEventListener("change", async () => {
    const file = membersUploadInput.files?.[0];
    await handleImportFile(file, "member");
    membersUploadInput.value = "";
  });

  donorsUploadInput?.addEventListener("change", async () => {
    const file = donorsUploadInput.files?.[0];
    await handleImportFile(file, "donor");
    donorsUploadInput.value = "";
  });

  const exportMembers = () => {
    if (exportRowsToCsv(createMemberExportRows(), "friends-of-wdac-members.csv")) {
      showNote("Members CSV downloaded.", false, "dashboard");
    }
  };

  const exportDonors = () => {
    if (exportRowsToCsv(createDonorExportRows(), "friends-of-wdac-donors.csv")) {
      showNote("Donors CSV downloaded.", false, "dashboard");
    }
  };

  membersDownloadButton?.addEventListener("click", exportMembers);
  exportMembersButton?.addEventListener("click", exportMembers);
  donorsDownloadButton?.addEventListener("click", exportDonors);
  exportDonorsButton?.addEventListener("click", exportDonors);

  membersEditButton?.addEventListener("click", () => {
    if (persistentMembers.length) {
      openMemberEditor("edit", persistentMembers[0].id);
      showNote("Member editor opened below.", false, "dashboard");
    } else {
      openMemberEditor("create");
      showNote("Create the first saved member record below.", false, "dashboard");
    }
    scrollRecordManagerIntoView(membersManager);
  });

  donorsEditButton?.addEventListener("click", () => {
    if (persistentDonors.length) {
      openDonorEditor("edit", persistentDonors[0].id);
      showNote("Donor editor opened below.", false, "dashboard");
    } else {
      openDonorEditor("create");
      showNote("Create the first saved donor record below.", false, "dashboard");
    }
    scrollRecordManagerIntoView(donorsManager);
  });

  previewImportsButton?.addEventListener("click", () => {
    const { importRecords } = buildViewModel();
    if (!importRecords.length) {
      showNote("No import batches have been saved yet.", false, "dashboard");
      return;
    }

    const summary = importRecords
      .slice(0, 3)
      .map((record) => `${toSentenceCase(record.entityType)}: ${record.rowCount} rows from ${record.fileName}`)
      .join(" | ");
    showNote(`Saved import batches: ${summary}`, false, "dashboard");
  });

  importHelpButton?.addEventListener("click", () => {
    setImportHelpOpen(true);
  });

  importHelpModalDismiss?.addEventListener("click", () => {
    setImportHelpOpen(false);
  });

  importHelpModalClose?.addEventListener("click", () => {
    setImportHelpOpen(false);
  });

  guideButton?.addEventListener("click", () => {
    setGuideModalOpen(true);
  });

  guideModalDismiss?.addEventListener("click", () => {
    setGuideModalOpen(false);
  });

  guideModalClose?.addEventListener("click", () => {
    setGuideModalOpen(false);
  });

  supportOpenButton?.addEventListener("click", () => {
    setSupportModalOpen(true);
  });

  supportModalDismiss?.addEventListener("click", () => {
    setSupportModalOpen(false);
  });

  supportModalClose?.addEventListener("click", () => {
    setSupportModalOpen(false);
  });

  supportFormCancelButton?.addEventListener("click", () => {
    setSupportModalOpen(false);
  });

  supportForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setSupportFormStatus("");
    setFormBusy(supportForm, true, "Sending...");

    try {
      await sendSupportMessage();
      supportForm.reset();
      setSupportFormStatus("Support message sent successfully.", false);
      setSupportModalOpen(false);
      showNote("Support message sent to contact@shannonborntrager.com.", false, "dashboard");
    } catch (error) {
      const message = error?.message || "Unable to send support message right now.";
      setSupportFormStatus(message, true);
      showNote(message, true, "dashboard");
    } finally {
      setFormBusy(supportForm, false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (guideModal && !guideModal.hidden) {
      setGuideModalOpen(false);
      return;
    }
    if (supportModal && !supportModal.hidden) {
      setSupportModalOpen(false);
      return;
    }
    if (importHelpModal && !importHelpModal.hidden) {
      setImportHelpOpen(false);
    }
  });

  settingsButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const setting = button.dataset.adminSetting || "";
      if (setting === "security") {
        openSecurityDetails();
        return;
      }

      showNote(`${toSentenceCase(setting)} settings are planned in the next admin backend pass.`, false, "dashboard");
    });
  });

  downloadTemplatesButton?.addEventListener("click", () => {
    downloadTemplates();
    showNote("CSV templates downloaded for members and donors.", false, "dashboard");
  });

  window.addEventListener("hashchange", syncAuthModeFromLocation);
  window.addEventListener("popstate", syncAuthModeFromLocation);

  initializeNavState();

  const initialize = async () => {
    renderExperienceState();
    renderAuthState();
    renderDashboard();
    const zohoResult = getZohoResultFromLocation();

    if (getToken()) {
      setSignedIn(true);
      await loadDashboard(false);
      if (zohoResult.state === "connected") {
        showNote("Zoho mailbox connected. You can now send test and newsletter emails.", false, "dashboard");
      } else if (zohoResult.state === "error") {
        showNote(zohoResult.message || "Zoho connection was not completed.", true, "dashboard");
      }
    } else {
      clearSession();
      syncAuthModeFromLocation();
      if (zohoResult.state === "connected") {
        showNote("Zoho connected successfully. Sign in to continue.", false, "auth");
      } else if (zohoResult.state === "error") {
        showNote(zohoResult.message || "Zoho connection was not completed.", true, "auth");
      }
    }

    if (zohoResult.state) {
      window.history.replaceState({}, "", getResettableUrl());
    }
  };

  initialize();
})();
