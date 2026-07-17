(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // web/public/app.js
  var require_app = __commonJS({
    "web/public/app.js"() {
      var app = document.querySelector("#app");
      var homeButton = document.querySelector("#home-button");
      var kubotaMark = document.querySelector("#kubota-mark");
      var KUBOTA_MARK_WIDTH = 142;
      var KUBOTA_MARK_HEIGHT = 38;
      var KUBOTA_PARTICLE_LIMIT = 720;
      var KUBOTA_ANIMATION_DURATION = 2100;
      var KUBOTA_SESSION_KEY = "cloze-maker-kubota-mark-played";
      var KUBOTA_PARTICLE_COLORS = ["#E9541F", "#C7420E", "#B5651D", "#8B5A2B"];
      var currentBook = null;
      var practiceState = null;
      var editorState = null;
      function createKubotaTargetPoints() {
        const canvas = document.createElement("canvas");
        canvas.width = KUBOTA_MARK_WIDTH;
        canvas.height = KUBOTA_MARK_HEIGHT;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return [];
        context.fillStyle = "#000";
        context.font = '800 30px "Segoe UI", "Yu Gothic UI", sans-serif';
        context.textBaseline = "middle";
        context.fillText("Kubota", 1, KUBOTA_MARK_HEIGHT / 2);
        const pixels = context.getImageData(0, 0, KUBOTA_MARK_WIDTH, KUBOTA_MARK_HEIGHT).data;
        const points = [];
        for (let y = 1; y < KUBOTA_MARK_HEIGHT; y += 2) {
          for (let x = 1; x < KUBOTA_MARK_WIDTH; x += 2) {
            if (pixels[(y * KUBOTA_MARK_WIDTH + x) * 4 + 3] > 96) points.push({ x, y });
          }
        }
        if (points.length <= KUBOTA_PARTICLE_LIMIT) return points;
        const stride = points.length / KUBOTA_PARTICLE_LIMIT;
        return Array.from({ length: KUBOTA_PARTICLE_LIMIT }, (_, index) => points[Math.floor(index * stride)]);
      }
      function createKubotaParticles(targets) {
        return targets.map((target, index) => {
          const edge = Math.floor(Math.random() * 4);
          const startX = edge === 0 ? -12 : edge === 1 ? KUBOTA_MARK_WIDTH + 12 : Math.random() * KUBOTA_MARK_WIDTH;
          const startY = edge === 2 ? -12 : edge === 3 ? KUBOTA_MARK_HEIGHT + 12 : Math.random() * KUBOTA_MARK_HEIGHT;
          return {
            ...target,
            startX,
            startY,
            delay: Math.random() * 320,
            radius: 0.75 + Math.random() * 0.65,
            color: KUBOTA_PARTICLE_COLORS[index % KUBOTA_PARTICLE_COLORS.length]
          };
        });
      }
      function easeOutCubic(value) {
        return 1 - (1 - value) ** 3;
      }
      function initializeKubotaMark() {
        if (!(kubotaMark instanceof HTMLCanvasElement)) return;
        const density = Math.max(1, window.devicePixelRatio || 1);
        kubotaMark.width = Math.round(KUBOTA_MARK_WIDTH * density);
        kubotaMark.height = Math.round(KUBOTA_MARK_HEIGHT * density);
        const context = kubotaMark.getContext("2d");
        if (!context) return;
        context.setTransform(density, 0, 0, density, 0, 0);
        const particles = createKubotaParticles(createKubotaTargetPoints());
        const draw = (progress) => {
          context.clearRect(0, 0, KUBOTA_MARK_WIDTH, KUBOTA_MARK_HEIGHT);
          for (const particle of particles) {
            const delayedProgress = Math.max(0, Math.min(
              1,
              (progress * KUBOTA_ANIMATION_DURATION - particle.delay) / (KUBOTA_ANIMATION_DURATION - particle.delay)
            ));
            const eased = easeOutCubic(delayedProgress);
            const x = particle.startX + (particle.x - particle.startX) * eased;
            const y = particle.startY + (particle.y - particle.startY) * eased;
            context.beginPath();
            context.arc(x, y, particle.radius, 0, Math.PI * 2);
            context.fillStyle = particle.color;
            context.fill();
          }
        };
        let hasPlayed = false;
        try {
          hasPlayed = window.sessionStorage.getItem(KUBOTA_SESSION_KEY) === "true";
        } catch {
        }
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (hasPlayed || reduceMotion) {
          draw(1);
          return;
        }
        try {
          window.sessionStorage.setItem(KUBOTA_SESSION_KEY, "true");
        } catch {
        }
        let startedAt = null;
        const animate = (timestamp) => {
          if (startedAt === null) startedAt = timestamp;
          const progress = Math.min(1, (timestamp - startedAt) / KUBOTA_ANIMATION_DURATION);
          draw(progress);
          if (progress < 1) window.requestAnimationFrame(animate);
        };
        window.requestAnimationFrame(animate);
      }
      function element2(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== void 0) node.textContent = text;
        return node;
      }
      function button(label, className, action) {
        const node = element2("button", className, label);
        node.type = "button";
        node.addEventListener("click", action);
        return node;
      }
      function showModal({ title, message, inputLabel, confirmLabel, danger = false, validate }) {
        return new Promise((resolve) => {
          const previouslyFocused = document.activeElement;
          const overlay = element2("div", "modal-overlay");
          const dialog = element2("form", "modal-dialog");
          const titleId = `modal-title-${createId3()}`;
          const heading = element2("h2", "modal-title", title);
          heading.id = titleId;
          dialog.setAttribute("role", "dialog");
          dialog.setAttribute("aria-modal", "true");
          dialog.setAttribute("aria-labelledby", titleId);
          if (message) dialog.append(heading, element2("p", "modal-message", message));
          else dialog.append(heading);
          let input = null;
          let errorMessage = null;
          if (inputLabel) {
            const label = element2("label", "modal-label", inputLabel);
            input = element2("input", "modal-input");
            input.type = "text";
            input.autocomplete = "off";
            input.autofocus = true;
            label.append(input);
            errorMessage = element2("p", "modal-error");
            errorMessage.setAttribute("role", "alert");
            errorMessage.hidden = true;
            dialog.append(label, errorMessage);
          }
          const actions = element2("div", "modal-actions");
          const cancelButton = button("\u30AD\u30E3\u30F3\u30BB\u30EB", "secondary-button", () => close(null));
          const submitButton = element2("button", danger ? "danger-button modal-danger-button" : "primary-button", confirmLabel);
          submitButton.type = "submit";
          actions.append(cancelButton, submitButton);
          dialog.append(actions);
          overlay.append(dialog);
          function close(result) {
            document.removeEventListener("keydown", handleKeydown);
            document.body.classList.remove("modal-open");
            overlay.remove();
            if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus();
            resolve(result);
          }
          function handleKeydown(event) {
            if (event.key === "Escape") close(null);
          }
          dialog.addEventListener("submit", (event) => {
            event.preventDefault();
            const value = input ? input.value.trim() : true;
            const validationMessage = validate ? validate(value) : "";
            if (validationMessage && errorMessage && input) {
              errorMessage.textContent = validationMessage;
              errorMessage.hidden = false;
              input.focus();
              return;
            }
            close(value);
          });
          overlay.addEventListener("click", (event) => {
            if (event.target === overlay) close(null);
          });
          document.addEventListener("keydown", handleKeydown);
          document.body.classList.add("modal-open");
          document.body.append(overlay);
          if (input) {
            input.focus();
            requestAnimationFrame(() => input.focus());
          } else {
            submitButton.focus();
          }
        });
      }
      function createId3() {
        return globalThis.crypto?.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      }
      function textUnits(text) {
        if (typeof Intl.Segmenter === "function") {
          const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
          return [...segmenter.segment(text)].map((item) => ({
            text: item.segment,
            start: item.index,
            end: item.index + item.segment.length
          }));
        }
        const units = [];
        let start2 = 0;
        for (const character of text) {
          units.push({ text: character, start: start2, end: start2 + character.length });
          start2 += character.length;
        }
        return units;
      }
      function focusPage() {
        app.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      function formatDate(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(date);
      }
      function formatFileSize(sizeBytes) {
        if (!Number.isFinite(sizeBytes) || sizeBytes < 0) return "";
        const megabytes = sizeBytes / (1024 * 1024);
        return `${megabytes >= 10 ? megabytes.toFixed(0) : megabytes.toFixed(1)} MB`;
      }
      function renderInstallerFooter(installerInfo) {
        if (!installerInfo?.available) return null;
        const footer = element2("footer", "installer-footer");
        const link = element2("a", "installer-link", "\u30C7\u30B9\u30AF\u30C8\u30C3\u30D7\u7248\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9(Windows)");
        link.href = "./download/installer";
        const size = formatFileSize(installerInfo.sizeBytes);
        footer.append(link);
        if (size) footer.append(element2("span", "muted", `\uFF08${size}\uFF09`));
        return footer;
      }
      async function getJson(path, options) {
        const response = await fetch(path, options);
        let value;
        try {
          value = await response.json();
        } catch {
          throw new Error("\u30B5\u30FC\u30D0\u30FC\u304B\u3089\u6B63\u3057\u3044\u5FDC\u7B54\u3092\u53D7\u3051\u53D6\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002");
        }
        if (!response.ok) throw new Error(value.error || "\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002");
        return value;
      }
      function showLoading(message = "\u8AAD\u307F\u8FBC\u307F\u4E2D\u3067\u3059\u2026") {
        app.replaceChildren(element2("p", "loading", message));
      }
      function showError(error, retry) {
        const panel = element2("section", "error-state");
        panel.append(element2("h1", "", "\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002"));
        panel.append(element2("p", "muted", error instanceof Error ? error.message : String(error)));
        panel.append(button("\u3082\u3046\u4E00\u5EA6\u8A66\u3059", "primary-button", retry));
        app.replaceChildren(panel);
        focusPage();
      }
      function renderSegments(question) {
        const paragraph = element2("p", "cloze-text");
        for (const segment of question.segments) {
          const span = element2("span", segment.kind === "blank" ? "blank-segment" : "", segment.text);
          if (segment.kind === "blank") span.setAttribute("aria-label", `\u7A7A\u6B04${segment.blankNumber}`);
          paragraph.append(span);
        }
        return paragraph;
      }
      async function showBookList() {
        currentBook = null;
        practiceState = null;
        editorState = null;
        document.title = "\u554F\u984C\u96C6\u4E00\u89A7 | Cloze Maker \u30B9\u30DE\u30DB\u7248";
        showLoading();
        try {
          const [data, installerInfo] = await Promise.all([
            getJson("./__local_api__/books"),
            getJson("./__local_api__/installer-info")
          ]);
          const heading = element2("div", "page-heading");
          const headingText = element2("div");
          headingText.append(element2("h1", "", "\u554F\u984C\u96C6"));
          headingText.append(element2("p", "lead", "\u554F\u984C\u96C6\u3092\u4F5C\u6210\u30FB\u7DE8\u96C6\u3057\u3066\u3001\u305D\u306E\u307E\u307E\u7DF4\u7FD2\u3067\u304D\u307E\u3059\u3002"));
          const headingActions = element2("div", "actions");
          headingActions.append(button("+ \u65B0\u3057\u3044\u554F\u984C\u96C6", "primary-button", () => void createBookFromDialog()));
          heading.append(headingText, headingActions);
          const content = document.createDocumentFragment();
          content.append(heading);
          if (data.books.length === 0) {
            const empty = element2("section", "empty-state");
            empty.append(element2("h2", "", "\u554F\u984C\u96C6\u304C\u3042\u308A\u307E\u305B\u3093"));
            empty.append(element2("p", "muted", "\u300C+ \u65B0\u3057\u3044\u554F\u984C\u96C6\u300D\u304B\u3089\u6700\u521D\u306E\u554F\u984C\u96C6\u3092\u4F5C\u308A\u307E\u3057\u3087\u3046\u3002"));
            content.append(empty);
          } else {
            const grid = element2("div", "card-grid");
            for (const book of data.books) {
              const card = element2("article", "card book-card");
              card.append(element2("h2", "", book.title));
              const meta = element2("p", "book-meta");
              meta.append(`${book.questionCount}\u554F`, document.createElement("br"), `\u66F4\u65B0: ${formatDate(book.updatedAt)}`);
              card.append(meta);
              card.append(button("\u554F\u984C\u96C6\u3092\u958B\u304F", "primary-button", () => void openBook(book.id)));
              grid.append(card);
            }
            content.append(grid);
          }
          const installerFooter = renderInstallerFooter(installerInfo);
          if (installerFooter) content.append(installerFooter);
          app.replaceChildren(content);
          focusPage();
        } catch (error) {
          showError(error, () => void showBookList());
        }
      }
      async function createBookFromDialog() {
        const title = await showModal({
          title: "\u65B0\u3057\u3044\u554F\u984C\u96C6",
          inputLabel: "\u554F\u984C\u96C6\u306E\u30BF\u30A4\u30C8\u30EB",
          confirmLabel: "\u4F5C\u6210",
          validate: (value) => value ? "" : "\u554F\u984C\u96C6\u306E\u30BF\u30A4\u30C8\u30EB\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
        });
        if (title === null) return;
        showLoading("\u554F\u984C\u96C6\u3092\u4F5C\u6210\u3057\u3066\u3044\u307E\u3059\u2026");
        try {
          const created = await getJson("./__local_api__/books", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
          });
          await openBook(created.id);
        } catch (error) {
          showError(error, () => void showBookList());
        }
      }
      async function openBook(bookId) {
        showLoading("\u554F\u984C\u96C6\u3092\u958B\u3044\u3066\u3044\u307E\u3059\u2026");
        try {
          currentBook = await getJson(`./__local_api__/books/${encodeURIComponent(bookId)}`);
          renderBook();
        } catch (error) {
          showError(error, () => void openBook(bookId));
        }
      }
      function renderBook() {
        const book = currentBook;
        if (!book) return;
        document.title = `${book.title} | Cloze Maker \u30B9\u30DE\u30DB\u7248`;
        const content = document.createDocumentFragment();
        const summary = element2("section", "book-summary");
        summary.append(button("\u2190 \u554F\u984C\u96C6\u4E00\u89A7", "text-button", () => void showBookList()));
        const heading = element2("div", "page-heading");
        const headingText = element2("div");
        headingText.append(element2("h1", "", book.title));
        const metadata = element2("div", "summary-meta");
        metadata.append(element2("span", "", `${book.questionCount}\u554F`));
        if (book.category) metadata.append(element2("span", "", `\u5206\u91CE: ${book.category}`));
        if (book.author) metadata.append(element2("span", "", `\u4F5C\u6210\u8005: ${book.author}`));
        metadata.append(element2("span", "", `\u66F4\u65B0: ${formatDate(book.updatedAt)}`));
        headingText.append(metadata);
        heading.append(headingText);
        const practiceQuestions = book.questions.filter((question) => question.segments.some((segment) => segment.kind === "blank"));
        const actions = element2("div", "actions");
        actions.append(button("+ \u554F\u984C\u3092\u4F5C\u308B", "primary-button", () => void openQuestionEditor()));
        const practiceButton = button("\u7DF4\u7FD2\u3059\u308B", "primary-button", () => showPracticeOrderSheet(practiceQuestions));
        practiceButton.disabled = practiceQuestions.length === 0;
        actions.append(practiceButton, button("\u554F\u984C\u96C6\u3092\u524A\u9664", "danger-button", () => void deleteCurrentBook()));
        heading.append(actions);
        summary.append(heading);
        if (book.description) summary.append(element2("p", "description", book.description));
        content.append(summary);
        if (book.questions.length === 0) {
          const empty = element2("section", "empty-state");
          empty.append(element2("h2", "", "\u554F\u984C\u304C\u3042\u308A\u307E\u305B\u3093"));
          empty.append(element2("p", "muted", "\u300C+ \u554F\u984C\u3092\u4F5C\u308B\u300D\u304B\u3089\u6700\u521D\u306E\u554F\u984C\u3092\u4F5C\u308A\u307E\u3057\u3087\u3046\u3002"));
          content.append(empty);
        } else {
          const list = element2("div", "question-list");
          for (const question of book.questions) {
            const card = element2("article", "question-card");
            const header = element2("div", "question-card-header");
            header.append(element2("h2", "", `\u554F\u984C ${question.number}`));
            header.append(element2("span", "mode-badge", question.answerMode === "choice" ? "\u9078\u629E\u5F0F" : "\u8A18\u8FF0\u5F0F"));
            card.append(header, renderSegments(question));
            if (question.hasExplanation) card.append(element2("p", "explanation-note", "\u7B54\u3048\u5408\u308F\u305B\u5F8C\u306B\u89E3\u8AAC\u304C\u3042\u308A\u307E\u3059\u3002"));
            const cardActions = element2("div", "question-actions");
            cardActions.append(
              button("\u7DE8\u96C6", "secondary-button", () => void openQuestionEditor(question.id)),
              button("\u524A\u9664", "danger-button", () => void deleteQuestion(question))
            );
            card.append(cardActions);
            list.append(card);
          }
          content.append(list);
        }
        app.replaceChildren(content);
        focusPage();
      }
      async function deleteCurrentBook() {
        if (!currentBook) return;
        const confirmed = await showModal({
          title: "\u554F\u984C\u96C6\u3092\u524A\u9664",
          message: `\u554F\u984C\u96C6\u300C${currentBook.title}\u300D\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F`,
          confirmLabel: "\u524A\u9664",
          danger: true
        });
        if (!confirmed) return;
        showLoading("\u554F\u984C\u96C6\u3092\u524A\u9664\u3057\u3066\u3044\u307E\u3059\u2026");
        try {
          await getJson(`./__local_api__/books/${encodeURIComponent(currentBook.id)}`, { method: "DELETE" });
          await showBookList();
        } catch (error) {
          showError(error, renderBook);
        }
      }
      async function deleteQuestion(question) {
        if (!currentBook) return;
        const confirmed = await showModal({
          title: "\u554F\u984C\u3092\u524A\u9664",
          message: `\u554F\u984C ${question.number} \u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F`,
          confirmLabel: "\u524A\u9664",
          danger: true
        });
        if (!confirmed) return;
        showLoading("\u554F\u984C\u3092\u524A\u9664\u3057\u3066\u3044\u307E\u3059\u2026");
        try {
          await getJson(
            `./__local_api__/books/${encodeURIComponent(currentBook.id)}/questions/${encodeURIComponent(question.id)}`,
            { method: "DELETE" }
          );
          await openBook(currentBook.id);
        } catch (error) {
          showError(error, renderBook);
        }
      }
      async function openQuestionEditor(questionId = null) {
        if (!currentBook) return;
        showLoading(questionId ? "\u554F\u984C\u3092\u8AAD\u307F\u8FBC\u3093\u3067\u3044\u307E\u3059\u2026" : "\u30A8\u30C7\u30A3\u30BF\u3092\u6E96\u5099\u3057\u3066\u3044\u307E\u3059\u2026");
        try {
          const existing = questionId ? await getJson(`./__local_api__/books/${encodeURIComponent(currentBook.id)}/questions/${encodeURIComponent(questionId)}`) : null;
          editorState = {
            bookId: currentBook.id,
            questionId,
            step: 1,
            editedText: existing?.editedText || "",
            answerCandidates: existing?.answerCandidates?.map((candidate) => ({ ...candidate })) || [],
            selectedBlankCandidateIds: existing?.selectedBlankCandidateIds?.slice() || [],
            blankCount: existing?.blankCount || 0,
            answerMode: existing?.answerMode || "written",
            mixBlankAnswersIntoChoices: existing?.mixBlankAnswersIntoChoices ?? true,
            explanation: existing?.explanation || "",
            rangeAnchor: null,
            pendingRange: null,
            message: "",
            busy: false,
            distractorDrafts: {}
          };
          renderQuestionEditor(true);
        } catch (error) {
          showError(error, renderBook);
        }
      }
      function setEditorMessage(message) {
        if (!editorState) return;
        editorState.message = message;
      }
      function validateEditorStep() {
        const state = editorState;
        if (!state) return false;
        if (state.step === 1 && !state.editedText.trim()) {
          setEditorMessage("\u554F\u984C\u6587\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
          return false;
        }
        if (state.step === 2 && state.answerCandidates.length === 0) {
          setEditorMessage("\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5\u30921\u3064\u4EE5\u4E0A\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
          return false;
        }
        if (state.step === 3 && state.selectedBlankCandidateIds.length !== state.blankCount) {
          setEditorMessage("\u7A7A\u6B04\u6570\u306B\u5408\u308F\u305B\u3066\u30B7\u30E3\u30C3\u30D5\u30EB\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
          return false;
        }
        return true;
      }
      function changeEditorStep(offset) {
        const state = editorState;
        if (!state || state.busy) return;
        if (offset > 0 && !validateEditorStep()) {
          renderQuestionEditor(true);
          return;
        }
        state.message = "";
        state.step = Math.max(1, Math.min(4, state.step + offset));
        renderQuestionEditor(true);
      }
      function renderEditorProgress(state) {
        const progress = element2("ol", "editor-progress");
        const labels = ["\u554F\u984C\u6587", "\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5", "\u7A7A\u6B04\u306E\u8ABF\u6574", "\u89E3\u7B54\u5F62\u5F0F"];
        labels.forEach((label, index) => {
          const item = element2("li", index + 1 === state.step ? "current" : index + 1 < state.step ? "done" : "");
          item.append(element2("span", "", String(index + 1)), element2("small", "", label));
          progress.append(item);
        });
        return progress;
      }
      function renderEditorMessage(state) {
        return state.message ? element2("p", "editor-message", state.message) : null;
      }
      function renderEditorStepOne(state) {
        const section = element2("section", "editor-step");
        section.append(element2("h1", "", "\u554F\u984C\u6587"));
        section.append(element2("p", "lead", "\u7A7A\u6B04\u554F\u984C\u306B\u3057\u305F\u3044\u6587\u7AE0\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"));
        const label = element2("label", "field-label", "\u554F\u984C\u6587");
        label.htmlFor = "question-text";
        const textarea = element2("textarea", "question-textarea");
        textarea.id = "question-text";
        textarea.rows = 9;
        textarea.value = state.editedText;
        textarea.placeholder = "\u4F8B\uFF1A\u65E5\u672C\u306E\u9996\u90FD\u306F\u6771\u4EAC\u3067\u3059\u3002";
        textarea.addEventListener("input", () => {
          if (textarea.value !== state.editedText && state.answerCandidates.length > 0) {
            state.answerCandidates = [];
            state.selectedBlankCandidateIds = [];
            state.blankCount = 0;
            state.message = "\u554F\u984C\u6587\u3092\u5909\u66F4\u3057\u305F\u305F\u3081\u3001\u767B\u9332\u6E08\u307F\u306E\u8A9E\u53E5\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3057\u305F\u3002";
          }
          state.editedText = textarea.value;
        });
        section.append(label, textarea);
        return section;
      }
      function candidateAtPosition(candidates, start2, end) {
        return candidates.find((candidate) => candidate.startPosition < end && start2 < candidate.endPosition);
      }
      function selectEditorUnit(unit) {
        const state = editorState;
        if (!state) return;
        const registered = candidateAtPosition(state.answerCandidates, unit.start, unit.end);
        if (registered) {
          state.answerCandidates = state.answerCandidates.filter((candidate) => candidate.id !== registered.id);
          state.selectedBlankCandidateIds = state.selectedBlankCandidateIds.filter((id) => id !== registered.id);
          state.blankCount = Math.min(state.blankCount, state.answerCandidates.length);
          state.rangeAnchor = null;
          state.pendingRange = null;
          state.message = `\u300C${registered.answerText}\u300D\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002`;
          renderQuestionEditor();
          return;
        }
        if (!state.rangeAnchor || state.pendingRange) {
          state.rangeAnchor = unit;
          state.pendingRange = null;
          state.message = "\u7D42\u4E86\u6587\u5B57\u3092\u30BF\u30C3\u30D7\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
        } else {
          state.pendingRange = {
            start: Math.min(state.rangeAnchor.start, unit.start),
            end: Math.max(state.rangeAnchor.end, unit.end)
          };
          state.message = "\u7BC4\u56F2\u3092\u78BA\u8A8D\u3057\u3066\u300C\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5\u306B\u8FFD\u52A0\u300D\u3092\u62BC\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
        }
        renderQuestionEditor();
      }
      function addPendingCandidate() {
        const state = editorState;
        if (!state?.pendingRange) return;
        const { start: start2, end } = state.pendingRange;
        if (candidateAtPosition(state.answerCandidates, start2, end)) {
          state.message = "\u65E2\u5B58\u306E\u8A9E\u53E5\u3068\u91CD\u306A\u3063\u3066\u3044\u307E\u3059\u3002";
          renderQuestionEditor();
          return;
        }
        const answerText = state.editedText.slice(start2, end);
        const candidate = {
          id: createId3(),
          answerText,
          distractors: [],
          startPosition: start2,
          endPosition: end,
          enabled: true,
          displayOrder: state.answerCandidates.length + 1
        };
        state.answerCandidates.push(candidate);
        state.selectedBlankCandidateIds = state.answerCandidates.map((item) => item.id);
        state.blankCount = state.answerCandidates.length;
        state.rangeAnchor = null;
        state.pendingRange = null;
        state.message = `\u300C${answerText}\u300D\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002`;
        renderQuestionEditor();
      }
      function renderSelectableText(state) {
        const text = element2("div", "selectable-text");
        const units = textUnits(state.editedText);
        const unitElements = /* @__PURE__ */ new Map();
        let activeSelection = null;
        function unitFromElement(target) {
          if (!(target instanceof Element)) return null;
          const unitElement = target.closest(".text-unit");
          if (!unitElement || !text.contains(unitElement)) return null;
          return unitElements.get(unitElement) || null;
        }
        function unitAtPoint(clientX, clientY) {
          return unitFromElement(document.elementFromPoint(clientX, clientY));
        }
        function normalizedRange(anchor, current) {
          return {
            // start/endは既存データと同じくUTF-16コードユニット位置を維持する。
            start: Math.min(anchor.start, current.start),
            end: Math.max(anchor.end, current.end)
          };
        }
        function highlightRange(anchor, current) {
          const range = normalizedRange(anchor, current);
          for (const [unitElement, unit] of unitElements) {
            const selected = range.start < unit.end && unit.start < range.end;
            unitElement.classList.toggle("range-selected", selected);
          }
        }
        for (const unit of units) {
          const candidate = candidateAtPosition(state.answerCandidates, unit.start, unit.end);
          const candidateIndex = candidate ? state.answerCandidates.findIndex((item) => item.id === candidate.id) : -1;
          const inPending = state.pendingRange && state.pendingRange.start < unit.end && unit.start < state.pendingRange.end;
          const isAnchor = state.rangeAnchor && !state.pendingRange && state.rangeAnchor.start === unit.start;
          const unitButton = button(unit.text, "text-unit", (event) => {
            if (event.detail === 0) selectEditorUnit(unit);
          });
          unitButton.dataset.start = String(unit.start);
          unitButton.dataset.end = String(unit.end);
          if (candidateIndex >= 0) unitButton.classList.add(`candidate-color-${candidateIndex % 4}`);
          if (inPending || isAnchor) unitButton.classList.add("range-selected");
          if (/^\s+$/u.test(unit.text)) unitButton.classList.add("whitespace-unit");
          unitElements.set(unitButton, unit);
          text.append(unitButton);
        }
        text.addEventListener("pointerdown", (event) => {
          if (!event.isPrimary || activeSelection) return;
          if (event.pointerType === "mouse" && event.button !== 0) return;
          const anchor = unitFromElement(event.target);
          if (!anchor) return;
          activeSelection = {
            pointerId: event.pointerId,
            anchor,
            current: anchor,
            moved: false,
            registered: Boolean(candidateAtPosition(state.answerCandidates, anchor.start, anchor.end))
          };
          text.setPointerCapture(event.pointerId);
          event.preventDefault();
          if (!activeSelection.registered) highlightRange(anchor, anchor);
        });
        text.addEventListener("pointermove", (event) => {
          if (!activeSelection || activeSelection.pointerId !== event.pointerId || activeSelection.registered) return;
          event.preventDefault();
          const current = unitAtPoint(event.clientX, event.clientY);
          if (!current) return;
          if (current.start !== activeSelection.anchor.start) activeSelection.moved = true;
          activeSelection.current = current;
          highlightRange(activeSelection.anchor, current);
        });
        text.addEventListener("pointerup", (event) => {
          if (!activeSelection || activeSelection.pointerId !== event.pointerId) return;
          event.preventDefault();
          const selection = activeSelection;
          activeSelection = null;
          if (selection.registered) {
            selectEditorUnit(selection.anchor);
            return;
          }
          const current = unitAtPoint(event.clientX, event.clientY) || selection.current;
          if (current.start !== selection.anchor.start) selection.moved = true;
          if (!selection.moved) {
            selectEditorUnit(selection.anchor);
            return;
          }
          state.rangeAnchor = selection.anchor;
          state.pendingRange = normalizedRange(selection.anchor, current);
          state.message = "\u7BC4\u56F2\u3092\u78BA\u8A8D\u3057\u3066\u300C\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5\u306B\u8FFD\u52A0\u300D\u3092\u62BC\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
          renderQuestionEditor();
        });
        function cancelActiveSelection(event) {
          if (!activeSelection || activeSelection.pointerId !== event.pointerId) return;
          activeSelection = null;
          renderQuestionEditor();
        }
        text.addEventListener("pointercancel", cancelActiveSelection);
        text.addEventListener("lostpointercapture", cancelActiveSelection);
        return text;
      }
      function renderEditorStepTwo(state) {
        const section = element2("section", "editor-step");
        section.append(element2("h1", "", "\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5"));
        section.append(element2("p", "lead", "\u306A\u305E\u3063\u3066\u7BC4\u56F2\u3092\u9078\u3076\u304B\u3001\u958B\u59CB\u3068\u7D42\u4E86\u306E\u6587\u5B57\u3092\u9806\u306B\u30BF\u30C3\u30D7\u3057\u307E\u3059\u3002\u8272\u4ED8\u304D\u306E\u767B\u9332\u6E08\u307F\u8A9E\u53E5\u3092\u30BF\u30C3\u30D7\u3059\u308B\u3068\u524A\u9664\u3067\u304D\u307E\u3059\u3002"));
        section.append(renderSelectableText(state));
        const addButton = button("\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5\u306B\u8FFD\u52A0", "primary-button wide-button", addPendingCandidate);
        addButton.disabled = !state.pendingRange;
        section.append(addButton);
        if (state.answerCandidates.length > 0) {
          const list = element2("div", "candidate-chips");
          state.answerCandidates.forEach((candidate, index) => {
            const chip = button(candidate.answerText, `candidate-chip candidate-color-${index % 4}`, () => {
              state.answerCandidates = state.answerCandidates.filter((item) => item.id !== candidate.id);
              state.selectedBlankCandidateIds = state.selectedBlankCandidateIds.filter((id) => id !== candidate.id);
              state.blankCount = Math.min(state.blankCount, state.answerCandidates.length);
              renderQuestionEditor();
            });
            chip.setAttribute("aria-label", `${candidate.answerText}\u3092\u524A\u9664`);
            list.append(chip);
          });
          section.append(list);
        }
        return section;
      }
      function chooseBlankIds(state) {
        const candidates = state.answerCandidates.filter((candidate) => candidate.enabled !== false);
        const count = Math.min(state.blankCount, candidates.length);
        const previous = state.selectedBlankCandidateIds.slice().sort().join("|");
        let selected = [];
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const shuffled = candidates.slice();
          for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
          }
          selected = shuffled.slice(0, count).map((candidate) => candidate.id);
          if (selected.slice().sort().join("|") !== previous || count === 0 || count === candidates.length) break;
        }
        state.selectedBlankCandidateIds = selected;
      }
      function renderEditorPreview(state) {
        const paragraph = element2("p", "cloze-text editor-preview");
        const selected = state.answerCandidates.filter((candidate) => state.selectedBlankCandidateIds.includes(candidate.id)).sort((left, right) => left.startPosition - right.startPosition);
        let position = 0;
        for (const candidate of selected) {
          paragraph.append(document.createTextNode(state.editedText.slice(position, candidate.startPosition)));
          paragraph.append(element2("span", "blank-segment", "\uFF3F\uFF3F\uFF3F\uFF3F"));
          position = candidate.endPosition;
        }
        paragraph.append(document.createTextNode(state.editedText.slice(position)));
        return paragraph;
      }
      function renderEditorStepThree(state) {
        const section = element2("section", "editor-step");
        section.append(element2("h1", "", "\u7A7A\u6B04\u306E\u8ABF\u6574"));
        section.append(element2("p", "lead", "\u7A7A\u6B04\u6570\u3092\u6C7A\u3081\u3001\u5FC5\u8981\u306A\u3089\u30B7\u30E3\u30C3\u30D5\u30EB\u3057\u3066\u7D44\u307F\u5408\u308F\u305B\u3092\u5909\u3048\u307E\u3059\u3002"));
        const sliderRow = element2("div", "slider-row");
        const label = element2("label", "field-label", `\u7A7A\u6B04\u6570\uFF1A${state.blankCount}`);
        label.htmlFor = "blank-count";
        const slider = element2("input", "blank-slider");
        slider.id = "blank-count";
        slider.type = "range";
        slider.min = state.answerCandidates.length > 0 ? "1" : "0";
        slider.max = String(state.answerCandidates.length);
        slider.value = String(state.blankCount || (state.answerCandidates.length > 0 ? 1 : 0));
        slider.addEventListener("input", () => {
          state.blankCount = Number(slider.value);
          chooseBlankIds(state);
          renderQuestionEditor();
        });
        sliderRow.append(label, slider);
        section.append(sliderRow);
        section.append(button("\u30B7\u30E3\u30C3\u30D5\u30EB", "secondary-button wide-button", () => {
          chooseBlankIds(state);
          renderQuestionEditor();
        }));
        const preview = element2("div", "preview-box");
        preview.append(element2("h2", "", "\u30D7\u30EC\u30D3\u30E5\u30FC"), renderEditorPreview(state));
        section.append(preview);
        return section;
      }
      function addDistractor(candidate) {
        const state = editorState;
        if (!state) return;
        const value = (state.distractorDrafts[candidate.id] || "").trim();
        if (!value || value === candidate.answerText || candidate.distractors.includes(value)) return;
        candidate.distractors.push(value);
        state.distractorDrafts[candidate.id] = "";
        renderQuestionEditor();
      }
      function renderDistractors(state, candidate) {
        const field = element2("section", "distractor-field");
        field.append(element2("h2", "", `\u300C${candidate.answerText}\u300D\u306E\u9078\u629E\u80A2\uFF08\u507D\u56DE\u7B54\uFF09`));
        const row = element2("div", "inline-input-row");
        const input = element2("input", "text-input");
        input.type = "text";
        input.value = state.distractorDrafts[candidate.id] || "";
        input.placeholder = "\u507D\u56DE\u7B54\u3092\u5165\u529B";
        input.setAttribute("aria-label", `${candidate.answerText}\u306E\u507D\u56DE\u7B54`);
        input.addEventListener("input", () => {
          state.distractorDrafts[candidate.id] = input.value;
        });
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addDistractor(candidate);
          }
        });
        row.append(input, button("\u8FFD\u52A0", "secondary-button", () => addDistractor(candidate)));
        field.append(row);
        if (candidate.distractors.length > 0) {
          const list = element2("div", "candidate-chips");
          candidate.distractors.forEach((distractor) => {
            list.append(button(`${distractor} \xD7`, "distractor-chip", () => {
              candidate.distractors = candidate.distractors.filter((item) => item !== distractor);
              renderQuestionEditor();
            }));
          });
          field.append(list);
        }
        return field;
      }
      function renderEditorStepFour(state) {
        const section = element2("section", "editor-step");
        section.append(element2("h1", "", "\u89E3\u7B54\u5F62\u5F0F"));
        section.append(element2("p", "lead", "\u8A18\u8FF0\u5F0F\u307E\u305F\u306F\u9078\u629E\u5F0F\u3092\u9078\u3073\u307E\u3059\u3002"));
        const modes = element2("div", "mode-options");
        for (const [value, labelText] of [["written", "\u8A18\u8FF0\u5F0F"], ["choice", "\u9078\u629E\u5F0F"]]) {
          const label = element2("label", "mode-option");
          const radio = element2("input");
          radio.type = "radio";
          radio.name = "answer-mode";
          radio.value = value;
          radio.checked = state.answerMode === value;
          radio.addEventListener("change", () => {
            state.answerMode = value;
            renderQuestionEditor();
          });
          label.append(radio, element2("span", "", labelText));
          modes.append(label);
        }
        section.append(modes);
        if (state.answerMode === "choice") {
          const mixLabel = element2("label", "toggle-row");
          const mix = element2("input");
          mix.type = "checkbox";
          mix.checked = state.mixBlankAnswersIntoChoices;
          mix.addEventListener("change", () => {
            state.mixBlankAnswersIntoChoices = mix.checked;
          });
          mixLabel.append(mix, element2("span", "", "\u4ED6\u306E\u7A7A\u6B04\u306E\u7B54\u3048\u3092\u81EA\u52D5\u3067\u6DF7\u305C\u308B"));
          section.append(mixLabel);
          state.answerCandidates.forEach((candidate) => section.append(renderDistractors(state, candidate)));
        }
        const explanationLabel = element2("label", "field-label", "\u89E3\u8AAC\uFF08\u4EFB\u610F\uFF09");
        explanationLabel.htmlFor = "question-explanation";
        const explanation = element2("textarea", "explanation-input");
        explanation.id = "question-explanation";
        explanation.rows = 4;
        explanation.value = state.explanation;
        explanation.placeholder = "\u7B54\u3048\u5408\u308F\u305B\u5F8C\u306B\u8868\u793A\u3059\u308B\u89E3\u8AAC";
        explanation.addEventListener("input", () => {
          state.explanation = explanation.value;
        });
        section.append(explanationLabel, explanation);
        return section;
      }
      async function saveQuestionEditor() {
        const state = editorState;
        if (!state || state.busy || !validateEditorStep()) {
          renderQuestionEditor();
          return;
        }
        state.busy = true;
        state.message = "";
        renderQuestionEditor();
        const path = state.questionId ? `./__local_api__/books/${encodeURIComponent(state.bookId)}/questions/${encodeURIComponent(state.questionId)}` : `./__local_api__/books/${encodeURIComponent(state.bookId)}/questions`;
        try {
          await getJson(path, {
            method: state.questionId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              editedText: state.editedText,
              answerCandidates: state.answerCandidates,
              selectedBlankCandidateIds: state.selectedBlankCandidateIds,
              blankCount: state.blankCount,
              answerMode: state.answerMode,
              mixBlankAnswersIntoChoices: state.mixBlankAnswersIntoChoices,
              explanation: state.explanation
            })
          });
          editorState = null;
          await openBook(state.bookId);
        } catch (error) {
          state.busy = false;
          state.message = error instanceof Error ? error.message : String(error);
          renderQuestionEditor();
        }
      }
      function renderQuestionEditor(scrollToTop = false) {
        const state = editorState;
        if (!state) return;
        document.title = `${state.questionId ? "\u554F\u984C\u3092\u7DE8\u96C6" : "\u554F\u984C\u3092\u4F5C\u308B"} | Cloze Maker \u30B9\u30DE\u30DB\u7248`;
        const layout = element2("div", "editor-layout");
        layout.append(button("\u2190 \u554F\u984C\u96C6\u3078\u623B\u308B", "text-button", renderBook), renderEditorProgress(state));
        let stepContent;
        if (state.step === 1) stepContent = renderEditorStepOne(state);
        else if (state.step === 2) stepContent = renderEditorStepTwo(state);
        else if (state.step === 3) stepContent = renderEditorStepThree(state);
        else stepContent = renderEditorStepFour(state);
        const message = renderEditorMessage(state);
        if (message) stepContent.append(message);
        layout.append(stepContent);
        const navigation = element2("nav", "editor-navigation");
        if (state.step > 1) navigation.append(button("\u623B\u308B", "secondary-button", () => changeEditorStep(-1)));
        const primary = state.step < 4 ? button("\u6B21\u3078", "primary-button", () => changeEditorStep(1)) : button(state.busy ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58", "primary-button", () => void saveQuestionEditor());
        primary.disabled = state.busy;
        navigation.append(primary);
        layout.append(navigation);
        app.replaceChildren(layout);
        app.focus({ preventScroll: true });
        if (scrollToTop) window.scrollTo({ top: 0, behavior: "instant" });
      }
      function shuffleQuestions(questions) {
        const shuffled = [...questions];
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
          const swapIndex = Math.floor(Math.random() * (index + 1));
          const current = shuffled[index];
          shuffled[index] = shuffled[swapIndex];
          shuffled[swapIndex] = current;
        }
        return shuffled;
      }
      function showPracticeOrderSheet(questions, preferredOrder = "book") {
        if (questions.length === 0 || !currentBook) return;
        document.title = `\u51FA\u984C\u9806\u3092\u9078\u3076 | ${currentBook.title}`;
        const sheet = element2("section", "practice-order-sheet");
        sheet.append(element2("h1", "", "\u51FA\u984C\u9806\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044"));
        sheet.append(element2("p", "lead", `${questions.length}\u554F\u3092\u3069\u306E\u9806\u756A\u3067\u7DF4\u7FD2\u3057\u307E\u3059\u304B\uFF1F`));
        const options = element2("div", "practice-order-options");
        options.append(
          button("\u554F\u984C\u96C6\u306E\u9806", preferredOrder === "book" ? "primary-button" : "secondary-button", () => startPractice(questions, "book")),
          button("\u30B7\u30E3\u30C3\u30D5\u30EB", preferredOrder === "shuffle" ? "primary-button" : "secondary-button", () => startPractice(questions, "shuffle"))
        );
        sheet.append(options, button("\u554F\u984C\u96C6\u3078\u623B\u308B", "text-button", renderBook));
        app.replaceChildren(sheet);
        focusPage();
      }
      function startPractice(sourceQuestions, order) {
        const questions = order === "shuffle" ? shuffleQuestions(sourceQuestions) : [...sourceQuestions];
        if (questions.length === 0 || !currentBook) return;
        practiceState = {
          sourceQuestions: [...sourceQuestions],
          questions,
          order,
          index: 0,
          answers: {},
          judgement: null,
          completed: [],
          busy: false
        };
        renderPractice();
      }
      function choicesFor(question, candidateId) {
        return question.choices.find((item) => item.candidateId === candidateId)?.options || [];
      }
      function renderAnswerField(question, segment, blankIndex) {
        const state = practiceState;
        const result = state.judgement?.results.find((item) => item.candidateId === segment.candidateId);
        const field = element2("fieldset", `answer-field${result ? result.correct ? " correct" : " incorrect" : ""}`);
        field.append(element2("legend", "", `\u7A7A\u6B04 ${blankIndex + 1}`));
        const choices = choicesFor(question, segment.candidateId);
        const useChoices = question.answerMode === "choice" && choices.length > 1;
        if (useChoices) {
          const list = element2("div", "choice-list");
          for (const option of choices) {
            const selected = state.answers[segment.candidateId] === option.text;
            const choice = button(`${option.symbol}. ${option.text}`, `choice-button${selected ? " selected" : ""}`, () => {
              if (state.judgement) return;
              state.answers[segment.candidateId] = option.text;
              renderPractice();
            });
            choice.disabled = Boolean(state.judgement);
            choice.setAttribute("aria-pressed", String(selected));
            list.append(choice);
          }
          field.append(list);
        } else {
          const input = element2("input", "written-input");
          input.type = "text";
          input.autocomplete = "off";
          input.value = state.answers[segment.candidateId] || "";
          input.disabled = Boolean(state.judgement);
          input.setAttribute("aria-label", `\u7A7A\u6B04${blankIndex + 1}\u306E\u7B54\u3048`);
          input.addEventListener("input", () => {
            state.answers[segment.candidateId] = input.value;
          });
          field.append(input);
        }
        if (result) {
          const judgement = element2("p", "judgement");
          judgement.append(element2("strong", "", result.correct ? "\u25CB \u6B63\u89E3" : "\xD7 \u4E0D\u6B63\u89E3"));
          judgement.append(element2("span", "", `\u6B63\u89E3: ${result.correctAnswer}`));
          field.append(judgement);
        }
        return field;
      }
      function renderPractice() {
        const state = practiceState;
        if (!state || !currentBook) return;
        const question = state.questions[state.index];
        document.title = `\u7DF4\u7FD2 ${state.index + 1}/${state.questions.length} | ${currentBook.title}`;
        const layout = element2("div", "practice-layout");
        layout.append(button("\u2190 \u554F\u984C\u96C6\u3078\u623B\u308B", "text-button", renderBook));
        const progress = element2("div", "practice-progress", `${state.index + 1} / ${state.questions.length}\u554F`);
        const track = element2("div", "progress-track");
        const value = element2("div", "progress-value");
        value.style.width = `${(state.index + 1) / state.questions.length * 100}%`;
        track.append(value);
        progress.append(track);
        layout.append(progress);
        const card = element2("section", "practice-card");
        card.append(element2("h1", "", `\u554F\u984C ${question.number}`), renderSegments(question));
        const answerList = element2("div", "answer-list");
        const blankSegments = question.segments.filter((segment) => segment.kind === "blank");
        blankSegments.forEach((segment, index) => answerList.append(renderAnswerField(question, segment, index)));
        card.append(answerList);
        if (state.judgement?.explanation) {
          const explanation = element2("aside", "explanation-box");
          explanation.append(element2("h2", "", "\u89E3\u8AAC"), element2("p", "", state.judgement.explanation));
          card.append(explanation);
        }
        const actions = element2("div", "practice-actions");
        if (!state.judgement) {
          const checkButton = button(state.busy ? "\u5224\u5B9A\u4E2D\u2026" : "\u7B54\u3048\u5408\u308F\u305B", "primary-button", () => void judgeCurrentQuestion());
          checkButton.disabled = state.busy;
          actions.append(checkButton);
        } else {
          const label = state.index + 1 === state.questions.length ? "\u7D50\u679C\u3092\u898B\u308B" : "\u6B21\u306E\u554F\u984C\u3078";
          actions.append(button(label, "primary-button", nextPracticeQuestion));
        }
        card.append(actions);
        layout.append(card);
        app.replaceChildren(layout);
        focusPage();
      }
      async function judgeCurrentQuestion() {
        const state = practiceState;
        if (!state || !currentBook || state.busy || state.judgement) return;
        state.busy = true;
        renderPractice();
        try {
          const question = state.questions[state.index];
          state.judgement = await getJson(`./__local_api__/books/${encodeURIComponent(currentBook.id)}/judge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionId: question.id, answers: state.answers })
          });
          state.busy = false;
          renderPractice();
        } catch (error) {
          state.busy = false;
          showError(error, renderPractice);
        }
      }
      function nextPracticeQuestion() {
        const state = practiceState;
        if (!state?.judgement) return;
        state.completed.push({
          questionNumber: state.questions[state.index].number,
          results: state.judgement.results
        });
        if (state.index + 1 >= state.questions.length) {
          renderResults();
          return;
        }
        state.index += 1;
        state.answers = {};
        state.judgement = null;
        renderPractice();
      }
      function renderResults() {
        const state = practiceState;
        if (!state || !currentBook) return;
        const results = state.completed.flatMap((item) => item.results);
        const correctCount = results.filter((item) => item.correct).length;
        const rate = results.length === 0 ? 0 : Math.round(correctCount / results.length * 100);
        document.title = `\u7DF4\u7FD2\u7D50\u679C | ${currentBook.title}`;
        const card = element2("section", "result-card");
        card.append(element2("h1", "", "\u7DF4\u7FD2\u7D50\u679C"));
        const score = element2("div", "score");
        score.append(element2("strong", "", `${rate}%`), element2("span", "", "\u6B63\u7B54\u7387"));
        card.append(score);
        card.append(element2("p", "lead", `${results.length}\u500B\u306E\u7A7A\u6B04\u4E2D ${correctCount}\u500B\u6B63\u89E3\u3067\u3057\u305F\u3002`));
        const breakdown = element2("div", "result-breakdown");
        for (const item of state.completed) {
          const correct = item.results.filter((result) => result.correct).length;
          const row = element2("div", "result-row");
          row.append(element2("strong", "", `\u554F\u984C ${item.questionNumber}`), element2("span", "", `${correct} / ${item.results.length} \u6B63\u89E3`));
          breakdown.append(row);
        }
        card.append(breakdown);
        const actions = element2("div", "actions");
        actions.style.justifyContent = "center";
        actions.append(
          button("\u3082\u3046\u4E00\u5EA6\u7DF4\u7FD2\u3059\u308B", "primary-button", () => showPracticeOrderSheet(state.sourceQuestions, state.order)),
          button("\u554F\u984C\u96C6\u3078\u623B\u308B", "secondary-button", renderBook)
        );
        card.append(actions);
        app.replaceChildren(card);
        focusPage();
      }
      initializeKubotaMark();
      homeButton.addEventListener("click", () => void showBookList());
      void showBookList();
    }
  });

  // src/shared/core/answerJudge.ts
  function normalizeWrittenAnswer(value) {
    return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
  }
  function judgeWrittenAnswer(userAnswer, correctAnswer) {
    return normalizeWrittenAnswer(userAnswer) === normalizeWrittenAnswer(correctAnswer);
  }
  function judgeChoiceAnswer(selectedAnswer, correctAnswer) {
    return selectedAnswer !== void 0 && selectedAnswer === correctAnswer.trim();
  }
  function getPracticeBlanks(question) {
    const selectedIds = new Set(question.selectedBlankCandidateIds);
    return question.answerCandidates.filter((candidate) => candidate.enabled && selectedIds.has(candidate.id)).sort((left, right) => left.startPosition - right.startPosition || left.displayOrder - right.displayOrder);
  }
  function filterPracticeQuestions(questions) {
    return questions.filter((question) => question.enabled && getPracticeBlanks(question).length > 0);
  }

  // src/shared/core/candidateUtils.ts
  function validateCandidatePositions(text, candidates) {
    const validCandidates = [];
    const invalidCandidates = [];
    for (const candidate of candidates) {
      const hasValidRange = Number.isInteger(candidate.startPosition) && Number.isInteger(candidate.endPosition) && candidate.startPosition >= 0 && candidate.endPosition > candidate.startPosition && candidate.endPosition <= text.length;
      const matchesText = hasValidRange && text.slice(candidate.startPosition, candidate.endPosition) === candidate.answerText;
      if (matchesText) validCandidates.push(candidate);
      else invalidCandidates.push(candidate);
    }
    return { validCandidates, invalidCandidates };
  }

  // src/shared/core/choiceOptions.ts
  var CHOICE_SYMBOLS = [
    "\u30A2",
    "\u30A4",
    "\u30A6",
    "\u30A8",
    "\u30AA",
    "\u30AB",
    "\u30AD",
    "\u30AF",
    "\u30B1",
    "\u30B3",
    "\u30B5",
    "\u30B7",
    "\u30B9",
    "\u30BB",
    "\u30BD",
    "\u30BF",
    "\u30C1",
    "\u30C4",
    "\u30C6",
    "\u30C8",
    "\u30CA",
    "\u30CB",
    "\u30CC",
    "\u30CD",
    "\u30CE",
    "\u30CF",
    "\u30D2",
    "\u30D5",
    "\u30D8",
    "\u30DB",
    "\u30DE",
    "\u30DF",
    "\u30E0",
    "\u30E1",
    "\u30E2",
    "\u30E4",
    "\u30E6",
    "\u30E8",
    "\u30E9",
    "\u30EA",
    "\u30EB",
    "\u30EC",
    "\u30ED",
    "\u30EF",
    "\u30F2",
    "\u30F3"
  ];
  function choiceSymbol(index) {
    return CHOICE_SYMBOLS[index] ?? `\u9078${index + 1}`;
  }
  function stableHash(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  function createChoiceOptions(question, candidate) {
    const answerText = candidate.answerText.trim();
    const values = [];
    const add = (value, source) => {
      const text = value.trim();
      if (text.length === 0) return;
      const existing = values.find((item) => item.text === text);
      if (existing !== void 0) {
        if (existing.source === "automatic" && source === "manual") existing.source = "manual";
        return;
      }
      values.push({ text, source });
    };
    add(answerText, "correct");
    if (question.answerMode === "choice" && question.mixBlankAnswersIntoChoices) {
      const selectedIds = new Set(question.selectedBlankCandidateIds);
      for (const item of question.answerCandidates) {
        if (item.id !== candidate.id && item.enabled && selectedIds.has(item.id)) {
          add(item.answerText, "automatic");
        }
      }
    }
    for (const distractor of candidate.distractors) add(distractor, "manual");
    const seed = `${question.id}\0${candidate.id}\0${question.choiceOrderVersion}`;
    return values.map((value) => ({ ...value, score: stableHash(`${seed}\0${value.text}`) })).sort((left, right) => left.score - right.score || left.text.localeCompare(right.text, "ja")).map(({ text, source }, index) => ({
      text,
      source,
      symbol: choiceSymbol(index),
      isCorrect: text === answerText
    }));
  }

  // src/shared/core/clozeRender.ts
  var DEFAULT_BLANK_STYLE = {
    style: "fixedUnderline",
    customSymbol: "",
    matchAnswerLength: false,
    fixedLength: 4
  };
  function normalizeStyle(style) {
    return typeof style === "string" ? { ...DEFAULT_BLANK_STYLE, style } : style;
  }
  function normalizedLength(length, fallback) {
    if (!Number.isFinite(length)) {
      return fallback;
    }
    return Math.max(1, Math.trunc(length));
  }
  function formatBlank(style, answerLength) {
    const usesStyleDefault = typeof style === "string";
    const settings = normalizeStyle(style);
    const fixedLength = normalizedLength(settings.fixedLength, DEFAULT_BLANK_STYLE.fixedLength);
    const proportionalLength = normalizedLength(answerLength, 1);
    const displayLength = settings.matchAnswerLength ? proportionalLength : fixedLength;
    switch (settings.style) {
      case "fixedUnderline":
        return "\uFF3F".repeat(displayLength);
      case "proportionalUnderline":
        return "\uFF3F".repeat(proportionalLength);
      case "brackets":
        return `[${"\u3000".repeat(usesStyleDefault ? 2 : displayLength)}]`;
      case "parentheses":
        return `(${"\u3000".repeat(usesStyleDefault ? 2 : displayLength)})`;
      case "blackout":
        return "\u25A0".repeat(displayLength);
      case "custom":
        return settings.customSymbol || "\uFF3F".repeat(displayLength);
    }
  }
  function answerCharacterLength(answerText) {
    return Array.from(answerText).length;
  }
  function renderCloze(text, candidates, blankIds, style = DEFAULT_BLANK_STYLE) {
    const sortedCandidates = [...candidates].sort(
      (first, second) => first.startPosition - second.startPosition
    );
    const blankIdSet = new Set(blankIds);
    const segments = [];
    let cursor = 0;
    let blankNumber = 0;
    for (const candidate of sortedCandidates) {
      if (candidate.startPosition < cursor || candidate.startPosition < 0 || candidate.endPosition < candidate.startPosition || candidate.endPosition > text.length) {
        throw new RangeError("\u7B54\u3048\u5019\u88DC\u306E\u6587\u5B57\u7BC4\u56F2\u304C\u4E0D\u6B63\u3067\u3059\u3002");
      }
      if (cursor < candidate.startPosition) {
        segments.push({ kind: "text", text: text.slice(cursor, candidate.startPosition) });
      }
      const sourceAnswerText = text.slice(candidate.startPosition, candidate.endPosition);
      if (candidate.enabled && blankIdSet.has(candidate.id)) {
        blankNumber += 1;
        segments.push({
          kind: "blank",
          text: formatBlank(style, answerCharacterLength(sourceAnswerText)),
          candidateId: candidate.id,
          blankNumber,
          answerText: candidate.answerText
        });
      } else {
        segments.push({
          kind: "answer",
          text: sourceAnswerText,
          candidateId: candidate.id
        });
      }
      cursor = candidate.endPosition;
    }
    if (cursor < text.length) {
      segments.push({ kind: "text", text: text.slice(cursor) });
    }
    return segments;
  }

  // src/shared/core/questionUtils.ts
  function renumberQuestions(questions) {
    return questions.map((question, index) => ({ ...question, number: index + 1 }));
  }

  // standalone/src/api.ts
  var LocalApiError = class extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  };
  function isRecord(value) {
    return typeof value === "object" && value !== null;
  }
  function createId() {
    return globalThis.crypto?.randomUUID?.() ?? `standalone-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function parseQuestionInput(value) {
    if (!isRecord(value) || typeof value.editedText !== "string" || value.editedText.trim().length === 0) {
      throw new LocalApiError(400, "\u554F\u984C\u6587\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    }
    if (!Array.isArray(value.answerCandidates) || !Array.isArray(value.selectedBlankCandidateIds)) {
      throw new LocalApiError(400, "\u554F\u984C\u30C7\u30FC\u30BF\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
    }
    const answerCandidates = value.answerCandidates.map((candidateValue, index) => {
      if (!isRecord(candidateValue) || typeof candidateValue.answerText !== "string" || typeof candidateValue.startPosition !== "number" || typeof candidateValue.endPosition !== "number") {
        throw new LocalApiError(400, "\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
      }
      const distractors = candidateValue.distractors ?? [];
      if (!Array.isArray(distractors) || !distractors.every((item) => typeof item === "string")) {
        throw new LocalApiError(400, "\u9078\u629E\u80A2\uFF08\u507D\u56DE\u7B54\uFF09\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
      }
      return {
        id: typeof candidateValue.id === "string" && candidateValue.id ? candidateValue.id : createId(),
        answerText: candidateValue.answerText,
        distractors: [...new Set(distractors.map((item) => item.trim()).filter(Boolean))],
        startPosition: candidateValue.startPosition,
        endPosition: candidateValue.endPosition,
        sourceRegion: null,
        sourcePage: null,
        enabled: candidateValue.enabled !== false,
        displayOrder: Number.isInteger(candidateValue.displayOrder) ? candidateValue.displayOrder : index + 1
      };
    });
    const candidateIds = new Set(answerCandidates.map((candidate) => candidate.id));
    if (candidateIds.size !== answerCandidates.length) {
      throw new LocalApiError(400, "\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5\u306EID\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002");
    }
    if (validateCandidatePositions(value.editedText, answerCandidates).invalidCandidates.length > 0) {
      throw new LocalApiError(400, "\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5\u306E\u7BC4\u56F2\u304C\u554F\u984C\u6587\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002");
    }
    if (!value.selectedBlankCandidateIds.every((id) => typeof id === "string")) {
      throw new LocalApiError(400, "\u7A7A\u6B04\u306E\u9078\u629E\u30C7\u30FC\u30BF\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
    }
    const selectedBlankCandidateIds = [...new Set(value.selectedBlankCandidateIds)];
    const enabledIds = new Set(answerCandidates.filter((candidate) => candidate.enabled).map((candidate) => candidate.id));
    if (selectedBlankCandidateIds.length !== value.selectedBlankCandidateIds.length || selectedBlankCandidateIds.some((id) => !enabledIds.has(id))) {
      throw new LocalApiError(400, "\u9078\u629E\u3055\u308C\u305F\u7A7A\u6B04\u304C\u767B\u9332\u6E08\u307F\u306E\u8A9E\u53E5\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002");
    }
    if (typeof value.blankCount !== "number" || !Number.isInteger(value.blankCount) || value.blankCount !== selectedBlankCandidateIds.length) {
      throw new LocalApiError(400, "\u7A7A\u6B04\u6570\u306F\u3001\u767B\u9332\u3055\u308C\u3066\u3044\u308B\u6709\u52B9\u306A\u7B54\u3048\u5019\u88DC\u6570\u4EE5\u4E0B\u306B\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    }
    if (value.answerMode !== "written" && value.answerMode !== "choice") {
      throw new LocalApiError(400, "\u89E3\u7B54\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
    }
    if (typeof value.mixBlankAnswersIntoChoices !== "boolean" || typeof value.explanation !== "string") {
      throw new LocalApiError(400, "\u554F\u984C\u30C7\u30FC\u30BF\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
    }
    return {
      editedText: value.editedText,
      answerCandidates,
      selectedBlankCandidateIds,
      blankCount: value.blankCount,
      answerMode: value.answerMode,
      mixBlankAnswersIntoChoices: value.mixBlankAnswersIntoChoices,
      explanation: value.explanation
    };
  }
  function createQuestion(input, number, now) {
    return {
      id: createId(),
      number,
      sourceType: "manual",
      sourceFilePath: null,
      source: "",
      sourcePage: null,
      sourceRegion: null,
      originalText: input.editedText,
      editedText: input.editedText,
      answerMode: input.answerMode,
      mixBlankAnswersIntoChoices: input.mixBlankAnswersIntoChoices,
      choiceOrderVersion: 0,
      answerCandidates: input.answerCandidates,
      selectedBlankCandidateIds: input.selectedBlankCandidateIds,
      blankCount: input.blankCount,
      randomizeMode: "fixed",
      explanation: input.explanation,
      memo: "",
      enabled: true,
      createdAt: now,
      updatedAt: now
    };
  }
  function toEditableQuestion(question) {
    return {
      id: question.id,
      number: question.number,
      editedText: question.editedText,
      answerCandidates: question.answerCandidates,
      selectedBlankCandidateIds: question.selectedBlankCandidateIds,
      blankCount: question.blankCount,
      answerMode: question.answerMode,
      mixBlankAnswersIntoChoices: question.mixBlankAnswersIntoChoices,
      explanation: question.explanation
    };
  }
  function toPublicQuestion(book, question) {
    const blanks = getPracticeBlanks(question);
    const choices = question.answerMode === "choice" ? blanks.map((candidate) => ({
      candidateId: candidate.id,
      options: createChoiceOptions(question, candidate).map(({ text, symbol }) => ({ text, symbol }))
    })).filter((item) => item.options.length > 1) : [];
    return {
      id: question.id,
      number: question.number,
      segments: renderCloze(
        question.editedText,
        question.answerCandidates,
        question.selectedBlankCandidateIds,
        book.printSettings.blankStyle
      ).map(({ answerText: _answerText, ...segment }) => segment),
      answerMode: question.answerMode,
      choices,
      hasExplanation: question.explanation.trim().length > 0
    };
  }
  function parseBody(body) {
    if (body === void 0 || body === null || body === "") return null;
    if (typeof body !== "string") throw new LocalApiError(400, "\u9001\u4FE1\u30C7\u30FC\u30BF\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
    try {
      return JSON.parse(body);
    } catch {
      throw new LocalApiError(400, "\u9001\u4FE1\u30C7\u30FC\u30BF\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
    }
  }
  function jsonResponse(status, value) {
    return new Response(JSON.stringify(value), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
  function localPath(input) {
    const rawUrl = input instanceof Request ? input.url : String(input);
    const pathname = new URL(rawUrl, window.location.href).pathname;
    const marker = "/__local_api__/";
    const markerIndex = pathname.indexOf(marker);
    return markerIndex < 0 ? null : `/api/${pathname.slice(markerIndex + marker.length)}`;
  }
  function installLocalApi(store) {
    let activeBookId = null;
    async function handle(pathname, method, body) {
      if (pathname === "/api/installer-info") return { available: false, fileName: null, sizeBytes: null };
      if (pathname === "/api/books") {
        if (method === "GET") {
          activeBookId = null;
          return { books: store.listBooks() };
        }
        if (method === "POST") {
          if (!isRecord(body) || typeof body.title !== "string") {
            throw new LocalApiError(400, "\u554F\u984C\u96C6\u306E\u30BF\u30A4\u30C8\u30EB\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
          }
          const book = store.createBook(body.title);
          return { id: book.id, title: book.title };
        }
        throw new LocalApiError(405, "\u3053\u306E\u64CD\u4F5C\u306B\u306F\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093\u3002");
      }
      const questionDetail = /^\/api\/books\/([^/]+)\/questions\/([^/]+)$/u.exec(pathname);
      if (questionDetail) {
        const book = store.loadBook(decodeURIComponent(questionDetail[1]));
        const questionId = decodeURIComponent(questionDetail[2]);
        const questionIndex = book.questions.findIndex((question) => question.id === questionId);
        if (questionIndex < 0) throw new LocalApiError(404, "\u6307\u5B9A\u3055\u308C\u305F\u554F\u984C\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
        if (method === "GET") return toEditableQuestion(book.questions[questionIndex]);
        if (method === "PUT") {
          const input = parseQuestionInput(body);
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const previous = book.questions[questionIndex];
          book.questions[questionIndex] = {
            ...previous,
            ...input,
            choiceOrderVersion: previous.choiceOrderVersion + 1,
            updatedAt: now
          };
          book.updatedAt = now;
          store.saveBook(book);
          return toEditableQuestion(book.questions[questionIndex]);
        }
        if (method === "DELETE") {
          book.questions = renumberQuestions(book.questions.filter((question) => question.id !== questionId));
          book.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
          store.saveBook(book);
          return { deleted: true };
        }
        throw new LocalApiError(405, "\u3053\u306E\u64CD\u4F5C\u306B\u306F\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093\u3002");
      }
      const questionCollection = /^\/api\/books\/([^/]+)\/questions$/u.exec(pathname);
      if (questionCollection) {
        if (method !== "POST") throw new LocalApiError(405, "\u3053\u306E\u64CD\u4F5C\u306B\u306F\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093\u3002");
        const book = store.loadBook(decodeURIComponent(questionCollection[1]));
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const question = createQuestion(parseQuestionInput(body), book.questions.length + 1, now);
        book.questions.push(question);
        book.updatedAt = now;
        store.saveBook(book);
        return toEditableQuestion(question);
      }
      const judge = /^\/api\/books\/([^/]+)\/judge$/u.exec(pathname);
      if (judge) {
        if (method !== "POST" || !isRecord(body) || typeof body.questionId !== "string" || !isRecord(body.answers)) {
          throw new LocalApiError(400, "\u89E3\u7B54\u30C7\u30FC\u30BF\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
        }
        const book = store.loadBook(decodeURIComponent(judge[1]));
        const question = filterPracticeQuestions(book.questions).find((item) => item.id === body.questionId);
        if (!question) throw new LocalApiError(404, "\u6307\u5B9A\u3055\u308C\u305F\u554F\u984C\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
        const answers = body.answers;
        return {
          questionId: question.id,
          results: getPracticeBlanks(question).map((candidate) => {
            const options = createChoiceOptions(question, candidate);
            const usesChoices = question.answerMode === "choice" && options.length > 1;
            const userAnswer = typeof answers[candidate.id] === "string" ? answers[candidate.id] : void 0;
            return {
              candidateId: candidate.id,
              correct: usesChoices ? judgeChoiceAnswer(userAnswer, candidate.answerText) : judgeWrittenAnswer(userAnswer ?? "", candidate.answerText),
              correctAnswer: candidate.answerText
            };
          }),
          explanation: question.explanation.trim() || null
        };
      }
      const bookDetail = /^\/api\/books\/([^/]+)$/u.exec(pathname);
      if (bookDetail) {
        const bookId = decodeURIComponent(bookDetail[1]);
        if (method === "GET") {
          const book = store.loadBook(bookId);
          activeBookId = book.id;
          return {
            id: book.id,
            title: book.title,
            category: book.category,
            author: book.author,
            description: book.description,
            updatedAt: book.updatedAt,
            questionCount: book.questions.length,
            questions: book.questions.filter((question) => question.enabled).map((question) => toPublicQuestion(book, question))
          };
        }
        if (method === "DELETE") {
          store.deleteBook(bookId);
          activeBookId = null;
          return { deleted: true };
        }
        throw new LocalApiError(405, "\u3053\u306E\u64CD\u4F5C\u306B\u306F\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093\u3002");
      }
      throw new LocalApiError(404, "\u6307\u5B9A\u3055\u308C\u305F\u30C7\u30FC\u30BF\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
    }
    window.fetch = async (input, init) => {
      const pathname = localPath(input);
      if (pathname === null) {
        return jsonResponse(404, { error: "\u30B9\u30BF\u30F3\u30C9\u30A2\u30ED\u30F3\u7248\u3067\u306F\u5916\u90E8\u901A\u4FE1\u3092\u5229\u7528\u3067\u304D\u307E\u305B\u3093\u3002" });
      }
      const request = input instanceof Request ? input : null;
      const method = (init?.method ?? request?.method ?? "GET").toUpperCase();
      try {
        const value = await handle(pathname, method, parseBody(init?.body));
        return jsonResponse(method === "POST" ? 201 : 200, value);
      } catch (error) {
        const status = error instanceof LocalApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "\u30C7\u30FC\u30BF\u3092\u51E6\u7406\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002";
        return jsonResponse(status, { error: message });
      }
    };
    return { getActiveBookId: () => activeBookId };
  }

  // src/shared/core/printSettings.ts
  var DEFAULT_PRINT_SETTINGS = {
    paperSize: "A4",
    orientation: "portrait",
    margins: { top: 15, right: 15, bottom: 15, left: 15 },
    fontSize: 12,
    lineHeight: 1.6,
    questionsPerPage: 0,
    showTitle: true,
    showNameField: true,
    showDateField: true,
    showPageNumbers: true,
    answerColor: "#d32f2f",
    showExplanations: true,
    printTarget: "both",
    blankStyle: { ...DEFAULT_BLANK_STYLE }
  };
  function completePrintSettings(value) {
    return {
      ...DEFAULT_PRINT_SETTINGS,
      ...value,
      margins: { ...DEFAULT_PRINT_SETTINGS.margins, ...value?.margins },
      blankStyle: { ...DEFAULT_PRINT_SETTINGS.blankStyle, ...value?.blankStyle }
    };
  }

  // standalone/src/data.ts
  var CURRENT_SCHEMA_VERSION = 5;
  var STORAGE_KEY_PREFIX = "cloze-maker:standalone:book:v1:";
  var StandaloneStorageError = class extends Error {
    constructor(message, options) {
      super(message);
      __publicField(this, "cause");
      this.name = "StandaloneStorageError";
      this.cause = options?.cause;
    }
  };
  function isRecord2(value) {
    return typeof value === "object" && value !== null;
  }
  function createId2() {
    return globalThis.crypto?.randomUUID?.() ?? `standalone-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function stringOr(value, fallback) {
    return typeof value === "string" ? value : fallback;
  }
  function normalizeCandidate(value, index) {
    if (!isRecord2(value) || typeof value.id !== "string" || value.id.length === 0 || typeof value.answerText !== "string" || !Number.isInteger(value.startPosition) || !Number.isInteger(value.endPosition)) {
      throw new StandaloneStorageError("\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5\u306E\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
    }
    const distractors = Array.isArray(value.distractors) ? value.distractors.filter((item) => typeof item === "string") : [];
    return {
      id: value.id,
      answerText: value.answerText,
      distractors,
      startPosition: value.startPosition,
      endPosition: value.endPosition,
      sourceRegion: isRecord2(value.sourceRegion) ? value.sourceRegion : null,
      sourcePage: typeof value.sourcePage === "number" ? value.sourcePage : null,
      enabled: value.enabled !== false,
      displayOrder: Number.isInteger(value.displayOrder) ? value.displayOrder : index + 1
    };
  }
  function normalizeQuestion(value, index, now) {
    if (!isRecord2(value) || typeof value.id !== "string" || value.id.length === 0 || typeof value.editedText !== "string" || !Array.isArray(value.answerCandidates)) {
      throw new StandaloneStorageError("\u554F\u984C\u96C6\u306E\u554F\u984C\u30C7\u30FC\u30BF\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
    }
    const answerCandidates = value.answerCandidates.map(normalizeCandidate);
    const candidateIds = new Set(answerCandidates.map((candidate) => candidate.id));
    if (candidateIds.size !== answerCandidates.length) {
      throw new StandaloneStorageError("\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5\u306EID\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002");
    }
    if (validateCandidatePositions(value.editedText, answerCandidates).invalidCandidates.length > 0) {
      throw new StandaloneStorageError("\u7A7A\u6B04\u306B\u3059\u308B\u8A9E\u53E5\u306E\u7BC4\u56F2\u304C\u554F\u984C\u6587\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002");
    }
    const selectedBlankCandidateIds = Array.isArray(value.selectedBlankCandidateIds) ? value.selectedBlankCandidateIds.filter((item) => typeof item === "string") : [];
    if (new Set(selectedBlankCandidateIds).size !== selectedBlankCandidateIds.length || selectedBlankCandidateIds.some((id) => !candidateIds.has(id))) {
      throw new StandaloneStorageError("\u9078\u629E\u3055\u308C\u305F\u7A7A\u6B04\u304C\u767B\u9332\u6E08\u307F\u306E\u8A9E\u53E5\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002");
    }
    return {
      id: value.id,
      number: Number.isInteger(value.number) ? value.number : index + 1,
      sourceType: value.sourceType === "image" || value.sourceType === "pdf" ? value.sourceType : "manual",
      sourceFilePath: typeof value.sourceFilePath === "string" ? value.sourceFilePath : null,
      source: stringOr(value.source, ""),
      sourcePage: typeof value.sourcePage === "number" ? value.sourcePage : null,
      sourceRegion: isRecord2(value.sourceRegion) ? value.sourceRegion : null,
      originalText: stringOr(value.originalText, value.editedText),
      editedText: value.editedText,
      answerMode: value.answerMode === "choice" ? "choice" : "written",
      mixBlankAnswersIntoChoices: typeof value.mixBlankAnswersIntoChoices === "boolean" ? value.mixBlankAnswersIntoChoices : true,
      choiceOrderVersion: typeof value.choiceOrderVersion === "number" ? value.choiceOrderVersion : 0,
      answerCandidates,
      selectedBlankCandidateIds,
      blankCount: selectedBlankCandidateIds.length,
      randomizeMode: value.randomizeMode === "onPrint" ? "onPrint" : "fixed",
      explanation: stringOr(value.explanation, ""),
      memo: stringOr(value.memo, ""),
      enabled: value.enabled !== false,
      createdAt: stringOr(value.createdAt, now),
      updatedAt: stringOr(value.updatedAt, now)
    };
  }
  function normalizeStoredProblemBook(value, now = (/* @__PURE__ */ new Date()).toISOString()) {
    if (!isRecord2(value) || typeof value.schemaVersion !== "number") {
      throw new StandaloneStorageError("\u554F\u984C\u96C6\u306E\u4FDD\u5B58\u5F62\u5F0F\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
    }
    if (value.schemaVersion < 1 || value.schemaVersion > CURRENT_SCHEMA_VERSION) {
      throw new StandaloneStorageError(
        `\u3053\u306E\u554F\u984C\u96C6\u306E\u30B9\u30AD\u30FC\u30DE\u30D0\u30FC\u30B8\u30E7\u30F3\uFF08${value.schemaVersion}\uFF09\u306B\u306F\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093\u3002`
      );
    }
    if (!isRecord2(value.book) || typeof value.book.id !== "string" || typeof value.book.title !== "string") {
      throw new StandaloneStorageError("\u554F\u984C\u96C6\u306E\u30C7\u30FC\u30BF\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093\u3002");
    }
    const book = value.book;
    const questions = Array.isArray(book.questions) ? book.questions.map((question, index) => normalizeQuestion(question, index, now)) : [];
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      book: {
        id: book.id,
        title: book.title,
        category: stringOr(book.category, ""),
        author: stringOr(book.author, ""),
        description: stringOr(book.description, ""),
        createdAt: stringOr(book.createdAt, now),
        updatedAt: stringOr(book.updatedAt, now),
        questions,
        sourceAssets: Array.isArray(book.sourceAssets) ? book.sourceAssets : [],
        printSettings: completePrintSettings(
          isRecord2(book.printSettings) ? book.printSettings : void 0
        ),
        printPatterns: Array.isArray(book.printPatterns) ? book.printPatterns : []
      }
    };
  }
  function parseStoredProblemBook(contents, fileName) {
    let value;
    try {
      value = JSON.parse(contents);
    } catch (error) {
      throw new StandaloneStorageError(`\u554F\u984C\u96C6\u30D5\u30A1\u30A4\u30EB\u300C${fileName}\u300D\u304C\u7834\u640D\u3057\u3066\u3044\u308B\u305F\u3081\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3002`, {
        cause: error
      });
    }
    return normalizeStoredProblemBook(value);
  }
  function serializeProblemBook(book) {
    const normalized = normalizeStoredProblemBook({ schemaVersion: CURRENT_SCHEMA_VERSION, book });
    return `${JSON.stringify(normalized, null, 2)}
`;
  }
  function isQuotaExceededError(error) {
    return isRecord2(error) && (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
  }
  function cloneBook(book) {
    return JSON.parse(JSON.stringify(book));
  }
  var LocalProblemBookStore = class {
    constructor(storage) {
      this.storage = storage;
    }
    keyFor(bookId) {
      return `${STORAGE_KEY_PREFIX}${encodeURIComponent(bookId)}`;
    }
    listBooks() {
      const summaries = [];
      for (let index = 0; index < this.storage.length; index += 1) {
        const key = this.storage.key(index);
        if (key === null || !key.startsWith(STORAGE_KEY_PREFIX)) continue;
        const contents = this.storage.getItem(key);
        if (contents === null) continue;
        const { book } = parseStoredProblemBook(contents, "\u7AEF\u672B\u5185\u30C7\u30FC\u30BF");
        summaries.push({
          id: book.id,
          title: book.title,
          updatedAt: book.updatedAt,
          questionCount: book.questions.length
        });
      }
      return summaries.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    }
    hasBook(bookId) {
      return this.storage.getItem(this.keyFor(bookId)) !== null;
    }
    loadBook(bookId) {
      const contents = this.storage.getItem(this.keyFor(bookId));
      if (contents === null) throw new StandaloneStorageError("\u6307\u5B9A\u3055\u308C\u305F\u554F\u984C\u96C6\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
      return cloneBook(parseStoredProblemBook(contents, "\u7AEF\u672B\u5185\u30C7\u30FC\u30BF").book);
    }
    saveBook(book) {
      const normalized = normalizeStoredProblemBook({ schemaVersion: CURRENT_SCHEMA_VERSION, book }).book;
      try {
        this.storage.setItem(this.keyFor(normalized.id), serializeProblemBook(normalized));
      } catch (error) {
        if (isQuotaExceededError(error)) {
          throw new StandaloneStorageError(
            "\u7AEF\u672B\u306E\u4FDD\u5B58\u5BB9\u91CF\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u308B\u305F\u3081\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u4E0D\u8981\u306A\u554F\u984C\u96C6\u3092\u524A\u9664\u3057\u3066\u3001\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002",
            { cause: error }
          );
        }
        throw new StandaloneStorageError("\u554F\u984C\u96C6\u3092\u7AEF\u672B\u306B\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002", { cause: error });
      }
      return cloneBook(normalized);
    }
    createBook(title, now = (/* @__PURE__ */ new Date()).toISOString()) {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) throw new StandaloneStorageError("\u554F\u984C\u96C6\u306E\u30BF\u30A4\u30C8\u30EB\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
      return this.saveBook({
        id: createId2(),
        title: trimmedTitle,
        category: "",
        author: "",
        description: "",
        createdAt: now,
        updatedAt: now,
        questions: [],
        sourceAssets: [],
        printSettings: structuredClone(DEFAULT_PRINT_SETTINGS),
        printPatterns: []
      });
    }
    deleteBook(bookId) {
      if (!this.hasBook(bookId)) throw new StandaloneStorageError("\u6307\u5B9A\u3055\u308C\u305F\u554F\u984C\u96C6\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
      this.storage.removeItem(this.keyFor(bookId));
    }
    exportBook(bookId) {
      return serializeProblemBook(this.loadBook(bookId));
    }
    importBook(contents, fileName, now = (/* @__PURE__ */ new Date()).toISOString()) {
      const imported = parseStoredProblemBook(contents, fileName).book;
      if (this.hasBook(imported.id)) {
        imported.id = createId2();
        imported.createdAt = now;
        imported.updatedAt = now;
      }
      return this.saveBook(imported);
    }
  };

  // standalone/src/app.ts
  function element(tag, className = "", text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== void 0) node.textContent = text;
    return node;
  }
  function showMessage(title, message) {
    const overlay = element("div", "modal-overlay");
    const dialog = element("form", "modal-dialog");
    const heading = element("h2", "modal-title", title);
    const titleId = `standalone-message-${Date.now()}`;
    heading.id = titleId;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", titleId);
    dialog.append(heading, element("p", "modal-message", message));
    const actions = element("div", "modal-actions");
    const closeButton = element("button", "primary-button", "\u9589\u3058\u308B");
    closeButton.type = "submit";
    actions.append(closeButton);
    dialog.append(actions);
    overlay.append(dialog);
    const close = () => {
      document.body.classList.remove("modal-open");
      overlay.remove();
    };
    dialog.addEventListener("submit", (event) => {
      event.preventDefault();
      close();
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    document.body.classList.add("modal-open");
    document.body.append(overlay);
    closeButton.focus();
  }
  function safeDownloadName(title) {
    const sanitized = title.replace(/[<>:"/\\|?*\u0000-\u001f]/gu, "_").replace(/[. ]+$/gu, "").trim();
    return `${sanitized || "\u554F\u984C\u96C6"}.json`;
  }
  function installFileTransferUi(store, api) {
    const input = element("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.hidden = true;
    input.setAttribute("aria-hidden", "true");
    document.body.append(input);
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      void file.text().then((contents) => {
        store.importBook(contents, file.name);
        input.value = "";
        document.querySelector("#home-button")?.click();
      }).catch((error) => {
        input.value = "";
        showMessage("\u30D5\u30A1\u30A4\u30EB\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F", error instanceof Error ? error.message : String(error));
      });
    });
    function addImportButton() {
      const pageHeading = document.querySelector(".page-heading");
      const heading = pageHeading?.querySelector("h1");
      const actions = pageHeading?.querySelector(".actions");
      if (heading?.textContent !== "\u554F\u984C\u96C6" || !(actions instanceof HTMLElement)) return;
      if (actions.querySelector("[data-standalone-import]")) return;
      const importButton = element("button", "secondary-button", "\u30D5\u30A1\u30A4\u30EB\u304B\u3089\u8AAD\u307F\u8FBC\u307F");
      importButton.type = "button";
      importButton.dataset.standaloneImport = "true";
      importButton.addEventListener("click", () => input.click());
      actions.prepend(importButton);
    }
    function addExportButton() {
      const actions = [...document.querySelectorAll(".page-heading .actions")].find((candidate) => [...candidate.querySelectorAll("button")].some((button) => button.textContent === "+ \u554F\u984C\u3092\u4F5C\u308B"));
      if (!actions || actions.querySelector("[data-standalone-export]")) return;
      const exportButton = element("button", "secondary-button", "\u30D5\u30A1\u30A4\u30EB\u3078\u66F8\u304D\u51FA\u3057");
      exportButton.type = "button";
      exportButton.dataset.standaloneExport = "true";
      exportButton.addEventListener("click", () => {
        try {
          const bookId = api.getActiveBookId();
          if (!bookId) throw new Error("\u66F8\u304D\u51FA\u3059\u554F\u984C\u96C6\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002");
          const book = store.loadBook(bookId);
          const blob = new Blob([store.exportBook(bookId)], { type: "application/json;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = element("a");
          link.href = url;
          link.download = safeDownloadName(book.title);
          document.body.append(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 0);
        } catch (error) {
          showMessage("\u30D5\u30A1\u30A4\u30EB\u3078\u66F8\u304D\u51FA\u305B\u307E\u305B\u3093\u3067\u3057\u305F", error instanceof Error ? error.message : String(error));
        }
      });
      const deleteButton = [...actions.querySelectorAll("button")].find((button) => button.textContent === "\u554F\u984C\u96C6\u3092\u524A\u9664");
      actions.insertBefore(exportButton, deleteButton ?? null);
    }
    let scheduled = false;
    const enhance = () => {
      scheduled = false;
      if (document.title.includes("Web\u30D7\u30EC\u30D3\u30E5\u30FC")) {
        document.title = document.title.split("Web\u30D7\u30EC\u30D3\u30E5\u30FC").join("\u30B9\u30DE\u30DB\u7248");
      }
      addImportButton();
      addExportButton();
    };
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(enhance);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    enhance();
  }
  async function start() {
    let store;
    try {
      store = new LocalProblemBookStore(window.localStorage);
    } catch (error) {
      showMessage(
        "\u7AEF\u672B\u306B\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093",
        error instanceof Error ? error.message : "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306FlocalStorage\u3092\u5229\u7528\u3067\u304D\u307E\u305B\u3093\u3002"
      );
      return;
    }
    const api = installLocalApi(store);
    installFileTransferUi(store, api);
    await Promise.resolve().then(() => __toESM(require_app()));
  }
  void start();
})();
