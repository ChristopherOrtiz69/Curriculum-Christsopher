const menuButton = document.querySelector("#menuButton");
const menu = document.querySelector("#menu");
const form = document.querySelector("#contactForm");
const feedback = document.querySelector("#formFeedback");
const submitButton = document.querySelector("#submitButton");
const defaultEndpoint = "/api/contact";

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    menu.classList.toggle("is-open", !expanded);
  });

  menu.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement) {
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeErrorMessage(error, fallback) {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return fallback;
}

function openMailFallback(payload) {
  if (!(form instanceof HTMLFormElement)) {
    return false;
  }

  const fallbackEmail = form.dataset.fallbackEmail?.trim() ?? "";
  if (!emailPattern.test(fallbackEmail) || fallbackEmail.endsWith("@ejemplo.com")) {
    return false;
  }

  const subject = `Contacto CV - ${payload.name}`;
  const body = [
    `Nombre: ${payload.name}`,
    `Email: ${payload.email}`,
    "",
    payload.message
  ].join("\n");

  const mailto = `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  return true;
}

function setFeedback(message, kind) {
  if (!feedback) return;
  feedback.textContent = message;
  feedback.classList.remove("is-success", "is-error");
  if (kind === "success") feedback.classList.add("is-success");
  if (kind === "error") feedback.classList.add("is-error");
}

function validateFormData(data) {
  const name = data.get("name")?.toString().trim() ?? "";
  const email = data.get("email")?.toString().trim() ?? "";
  const message = data.get("message")?.toString().trim() ?? "";

  if (name.length < 2) {
    return { ok: false, message: "Escribe un nombre valido." };
  }

  if (!emailPattern.test(email)) {
    return { ok: false, message: "Escribe un email valido." };
  }

  if (message.length < 20) {
    return {
      ok: false,
      message: "Escribe un mensaje con al menos 20 caracteres."
    };
  }

  return { ok: true };
}

if (form instanceof HTMLFormElement) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFeedback("", "");

    const formData = new FormData(form);
    const validation = validateFormData(formData);

    if (!validation.ok) {
      setFeedback(validation.message, "error");
      return;
    }

    const payload = Object.fromEntries(formData.entries());
    const endpoint = form.dataset.endpoint?.trim() || defaultEndpoint;
    const isGitHubPages = window.location.hostname.endsWith("github.io");

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        if ((response.status === 404 || response.status === 405) && isGitHubPages) {
          const usedFallback = openMailFallback(payload);
          if (usedFallback) {
            setFeedback("Abrimos tu cliente de correo para completar el envio.", "success");
            return;
          }
        }

        throw new Error(result.message || "No se pudo enviar el mensaje.");
      }

      form.reset();
      setFeedback(result.message || "Mensaje enviado correctamente.", "success");
    } catch (error) {
      if (isGitHubPages) {
        const usedFallback = openMailFallback(payload);
        if (usedFallback) {
          setFeedback("Abrimos tu cliente de correo para completar el envio.", "success");
          return;
        }
      }

      setFeedback(normalizeErrorMessage(error, "Ocurrio un error inesperado."), "error");
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar mensaje";
      }
    }
  });
}

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});
