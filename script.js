/* ============================================================
   The Language Pair — скрипты сайта
   ------------------------------------------------------------
   ⚙ НАСТРОЙКИ — САМОЕ ВАЖНОЕ МЕСТО В ЭТОМ ФАЙЛЕ.
   ============================================================ */

const CONFIG = {
  // Юзернейм общего Telegram-аккаунта БЕЗ символа @.
  telegramUsername: "pawuchiieva",

  // Ссылка на встроенную Google Форму
  // (та же форма: https://forms.gle/EexAkYcPDcb11wEh6).
  googleFormEmbedUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSd5Mjk-YAuyp7f7052hfsRuDOpUNUVqlptT9YbTzlg8cn0z5Q/viewform?embedded=true",
};

/* ============================================================
   ДАЛЬШЕ ИДЁТ ЛОГИКА — менять её не требуется.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. Шапка: тень при прокрутке ---------- */

  const header = document.querySelector(".header");

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Мобильное меню (бургер) ---------- */

  const burger = document.getElementById("burger");

  burger.addEventListener("click", function () {
    const isOpen = header.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute(
      "aria-label",
      isOpen ? "Закрыть меню" : "Открыть меню"
    );
  });

  // Клик по пункту меню закрывает его
  document.querySelectorAll(".nav__link, .nav__cta").forEach(function (link) {
    link.addEventListener("click", function () {
      header.classList.remove("nav-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  // Esc тоже закрывает меню
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("nav-open")) {
      header.classList.remove("nav-open");
      burger.setAttribute("aria-expanded", "false");
      burger.focus();
    }
  });

  /* ---------- 3. Вкладки в блоке «Запись» ---------- */

  const tabsBox = document.querySelector("[data-tabs]");

  if (tabsBox) {
    const tabs = tabsBox.querySelectorAll('[role="tab"]');
    const panels = tabsBox.querySelectorAll('[role="tabpanel"]');

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.setAttribute("aria-selected", String(t === tab));
        });
        panels.forEach(function (p) {
          p.hidden = p.id !== tab.getAttribute("aria-controls");
        });
      });
    });
  }

  /* ---------- 4. Кнопки направлений подставляют язык в форму ---------- */

  document.querySelectorAll("[data-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const select = document.getElementById("f-lang");
      if (!select) return;
      if (btn.dataset.lang === "en") select.value = "Английский";
      if (btn.dataset.lang === "zh") select.value = "Китайский";
    });
  });

  /* ---------- 5. Форма заявки → Telegram ---------- */

  const form = document.getElementById("tg-form");
  const resultBox = document.getElementById("tg-result");
  const resultText = document.getElementById("tg-result-text");
  const resultOpen = document.getElementById("tg-result-open");
  const resultCopy = document.getElementById("tg-result-copy");
  const errorBox = document.getElementById("tg-error");
  const directLink = document.getElementById("tg-direct-link");

  const isTelegramConfigured =
    CONFIG.telegramUsername && !CONFIG.telegramUsername.includes("TODO");

  // Ссылка «написать напрямую» в самом низу панели результата
  if (directLink) {
    directLink.textContent = "@" + CONFIG.telegramUsername;
    directLink.href = "https://t.me/" + CONFIG.telegramUsername;
  }

  function showMessage() {
    const name = document.getElementById("f-name").value.trim();
    const lang = document.getElementById("f-lang").value;
    const goal = document.getElementById("f-goal").value;
    const time = document.getElementById("f-time").value;
    const comment = document.getElementById("f-comment").value.trim();

    let text =
      "Здравствуйте! Хочу записаться на занятие.\n" +
      "Имя: " + name + "\n" +
      "Язык: " + lang + "\n" +
      "Цель: " + goal + "\n" +
      "Время: " + time;
    if (comment) {
      text += "\nКомментарий: " + comment;
    }
    return text;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // страница не перезагружается

      // Простая проверка обязательных полей (имя и согласие)
      const nameInput = document.getElementById("f-name");
      const consent = document.getElementById("f-consent");

      const problems = [];
      if (!nameInput.value.trim()) {
        problems.push("напишите ваше имя");
      }
      if (!consent.checked) {
        problems.push("нужно согласие на обработку данных");
      }

      if (problems.length > 0) {
        errorBox.textContent = "Проверьте форму: " + problems.join(", ") + ".";
        errorBox.hidden = false;
        resultBox.hidden = true;
        return;
      }
      errorBox.hidden = true;

      const message = showMessage();
      resultText.value = message;
      resultBox.hidden = false;

      if (isTelegramConfigured) {
        // Открываем Telegram с уже заполненным сообщением.
        // Пользователю остаётся нажать «Отправить».
        const url =
          "https://t.me/" + CONFIG.telegramUsername +
          "?text=" + encodeURIComponent(message);
        resultOpen.href = url;
      } else {
        resultOpen.removeAttribute("href");
      }

      resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  // Кнопка «Открыть Telegram»: если попап заблокирован, открываем в этой же вкладке
  if (resultOpen) {
    resultOpen.addEventListener("click", function (event) {
      if (!isTelegramConfigured) {
        event.preventDefault();
        alert(
          "Заявка ещё не подключена: впишите юзернейм Telegram-аккаунта " +
          "в файл script.js, в блок CONFIG (строка telegramUsername). " +
          "Текст заявки можно скопировать кнопкой ниже."
        );
        return;
      }
      const win = window.open(resultOpen.href, "_blank", "noopener");
      if (!win) {
        window.location.href = resultOpen.href;
      }
    });
  }

  // Кнопка «Скопировать текст»
  if (resultCopy) {
    resultCopy.addEventListener("click", function () {
      resultText.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(resultText.value).then(function () {
          resultCopy.textContent = "Скопировано ✓";
          setTimeout(function () {
            resultCopy.textContent = "Скопировать текст";
          }, 2000);
        });
      } else {
        // Резервный способ для старых браузеров
        document.execCommand("copy");
      }
    });
  }

  /* ---------- 6. Встраивание Google Формы ---------- */

  const gfPlaceholder = document.getElementById("gf-placeholder");

  if (gfPlaceholder && CONFIG.googleFormEmbedUrl) {
    const iframe = document.createElement("iframe");
    iframe.src = CONFIG.googleFormEmbedUrl;
    iframe.width = "100%";
    iframe.height = "900";
    iframe.title = "Форма записи (Google Форма)";
    iframe.style.border = "0";
    iframe.style.borderRadius = "24px";
    iframe.style.background = "#ffffff";
    gfPlaceholder.replaceWith(iframe);
  }

  /* ---------- 7. Лайтбокс сертификатов ---------- */

  const dialog = document.getElementById("cert-dialog");
  const dialogImg = document.getElementById("cert-dialog-img");
  const dialogCaption = document.getElementById("cert-dialog-caption");
  const dialogClose = document.getElementById("cert-dialog-close");

  document.querySelectorAll(".cert__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      dialogImg.src = btn.dataset.full;
      // alt копируем с миниатюры — там уже осмысленное описание
      dialogImg.alt = btn.querySelector("img").alt;
      dialogCaption.textContent = btn.dataset.caption || "";
      dialog.showModal();
    });
  });

  if (dialog) {
    dialogClose.addEventListener("click", function () {
      dialog.close();
    });
    // Клик по тёмной подложке тоже закрывает окно
    dialog.addEventListener("click", function (event) {
      const rect = dialog.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) dialog.close();
    });
  }

  /* ---------- 8. Год в подвале ---------- */

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- 9. Деликатное появление карточек при прокрутке ---------- */

  const revealItems = document.querySelectorAll(".reveal");

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }
})();
