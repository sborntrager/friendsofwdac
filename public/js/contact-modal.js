// Modular Contact Modal for Friends of WDAC
// Usage: Include this script on any page with the modal markup and a trigger button with [data-open-contact-modal]
(() => {
  const modal = document.getElementById("wd5-contact-modal");
  if (!modal) return;

  const openButtons = Array.from(document.querySelectorAll("[data-open-contact-modal]"));
  const closeButtons = Array.from(document.querySelectorAll("[data-close-contact-modal]"));
  const card = modal.querySelector(".wd5-modal-card");
  const firstField = modal.querySelector("#wd5-contact-name");
  let lastTrigger = null;

  const setModalOpen = (isOpen, trigger = null) => {
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
    button.addEventListener("click", () => {
      setModalOpen(true, button);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setModalOpen(false);
    });
  });

  modal.addEventListener("click", (event) => {
    if (card && card.contains(event.target)) return;
    setModalOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !modal.classList.contains("is-open")) return;
    setModalOpen(false);
  });
})();
