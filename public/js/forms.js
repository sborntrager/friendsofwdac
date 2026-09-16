(() => {
  const forms = Array.from(
    document.querySelectorAll("form[data-json-endpoint][data-form-type]")
  );
  if (!forms.length) return;

  const toPayloadFields = (form) => {
    const data = new FormData(form);
    const fields = {};

    for (const [name, value] of data.entries()) {
      const cleaned = String(value || "").trim();
      if (!cleaned) continue;

      if (Object.prototype.hasOwnProperty.call(fields, name)) {
        if (Array.isArray(fields[name])) {
          fields[name].push(cleaned);
        } else {
          fields[name] = [fields[name], cleaned];
        }
      } else {
        fields[name] = cleaned;
      }
    }

    return fields;
  };

  forms.forEach((form) => {
    const note = form.querySelector("[data-form-note]");
    const submit = form.querySelector("button[type='submit']");
    const submitText = submit ? submit.textContent : "";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const endpoint = form.dataset.jsonEndpoint;
      const formType = form.dataset.formType;
      const successMessage =
        form.dataset.successMessage || "Form submitted successfully.";
      if (!endpoint || !formType) return;

      if (note) note.hidden = true;
      if (submit) {
        submit.disabled = true;
        submit.textContent = "Submitting...";
      }

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formType,
            fields: toPayloadFields(form),
          }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "Submission failed.");
        }

        if (note) {
          note.textContent = successMessage;
          note.style.color = "#2d4f65";
          note.hidden = false;
        }
        form.reset();
      } catch (error) {
        if (note) {
          note.textContent =
            error?.message || "Unable to submit right now. Please try again.";
          note.style.color = "#9b1c1c";
          note.hidden = false;
        }
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = submitText;
        }
      }
    });
  });
})();
