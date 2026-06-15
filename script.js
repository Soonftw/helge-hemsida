/* =========================================================
   Tre lektioner i AI
   Enkel JavaScript för mobilmeny, mjuk scroll, fade-in
   och demo-validering av kontaktformulär.
   ========================================================= */

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupSmoothScroll();
  setupFadeIn();
  setupContactForm();
});

/* Mobilmeny */

function setupMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#primary-menu");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";

    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("is-open", !isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    }
  });

  document.addEventListener("click", (event) => {
    const clickInsideMenu = menu.contains(event.target);
    const clickOnToggle = toggle.contains(event.target);

    if (!clickInsideMenu && !clickOnToggle) {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    }
  });
}

/* Mjuk scroll för länkar på samma sida */

function setupSmoothScroll() {
  const samePageHashLinks = document.querySelectorAll('a[href^="#"]');

  samePageHashLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
      });

      history.pushState(null, "", targetId);
    });
  });
}

/* Fade-in när sektioner visas */

function setupFadeIn() {
  const elements = document.querySelectorAll(".fade-in");

  if (!elements.length) return;

  if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.14
    }
  );

  elements.forEach((element) => observer.observe(element));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Kontaktformulär */

function setupContactForm() {
  const form = document.querySelector("#contactForm");

  if (!form) return;

  const status = document.querySelector("#formStatus");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    clearFormErrors(form);
    setStatus(status, "", "");

    const isSpam = form.elements.website && form.elements.website.value.trim() !== "";
    if (isSpam) return;

    const isValid = validateForm(form, status);

    if (!isValid) return;

    const demoMode = form.dataset.demo === "true";

    if (demoMode) {
      form.reset();
      setStatus(
        status,
        "Tack! Formuläret är i demoläge, men din förfrågan ser korrekt ut. Koppla formuläret till en formulärtjänst eller server för att skicka på riktigt.",
        "success"
      );
      return;
    }

    /*
      När data-demo="false" skickas formuläret vidare till den URL
      som står i formens action-attribut.
    */
    form.submit();
  });
}

function validateForm(form, status) {
  let valid = true;

  const fields = [
    {
      input: form.elements.name,
      message: "Skriv ditt namn."
    },
    {
      input: form.elements.organization,
      message: "Skriv skola eller organisation."
    },
    {
      input: form.elements.email,
      message: "Skriv en giltig e-postadress.",
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    {
      input: form.elements.topic,
      message: "Välj vad kontakten gäller."
    },
    {
      input: form.elements.message,
      message: "Skriv ett meddelande."
    }
  ];

  fields.forEach(({ input, message, validate }) => {
    if (!input) return;

    const value = input.value.trim();
    const passesCustomValidation = validate ? validate(value) : true;

    if (!value || !passesCustomValidation) {
      valid = false;
      showFieldError(input, message);
    }
  });

  if (!valid) {
    setStatus(status, "Kontrollera fälten som är markerade ovan.", "error");

    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      firstInvalid.focus();
    }
  }

  return valid;
}

function showFieldError(input, message) {
  input.setAttribute("aria-invalid", "true");

  const errorId = input.getAttribute("aria-describedby");
  const errorElement = errorId ? document.getElementById(errorId) : null;

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearFormErrors(form) {
  const invalidFields = form.querySelectorAll('[aria-invalid="true"]');
  const errorMessages = form.querySelectorAll(".error-message");

  invalidFields.forEach((field) => {
    field.removeAttribute("aria-invalid");
  });

  errorMessages.forEach((message) => {
    message.textContent = "";
  });
}

function setStatus(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.className = "form-status";

  if (type) {
    element.classList.add(type);
  }
}