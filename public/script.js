document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  // Auto-resize textarea
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
  });

  // Send on Enter, newline on Shift+Enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderMarkdown(text) {
    if (!text) return "";

    const escaped = escapeHtml(text);
    const codeBlocks = [];

    const withCodeBlocks = escaped.replace(/```([\s\S]*?)```/g, (_, code) => {
      const html = `<pre><code>${escapeHtml(code)}</code></pre>`;
      codeBlocks.push(html);
      return `@@CODE_BLOCK_${codeBlocks.length - 1}@@`;
    });

    let html = withCodeBlocks
      .replace(/`([^`]+?)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`)
      .replace(/\*\*(.+?)\*\*/g, (_m, bold) => `<strong>${bold}</strong>`)
      .replace(/\*(.+?)\*/g, (_m, italic) => `<em>${italic}</em>`)
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, (_m, label, href) =>
        `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`
      )
      .replace(/\n/g, "<br>");

    codeBlocks.forEach((block, index) => {
      html = html.replace(`@@CODE_BLOCK_${index}@@`, block);
    });

    return html;
  }

  function createMessageElement(role, text, { markdown = false } = {}) {
    const row = document.createElement("div");
    row.className = `message-row message-row--${role}`;

    const icon = document.createElement("div");
    icon.className = `message-icon message-icon--${role}`;
    icon.textContent = role === "user" ? "👤" : "🤖";

    const bubble = document.createElement("div");
    bubble.className = `message message--${role}`;
    if (markdown) {
      bubble.innerHTML = renderMarkdown(text);
    } else {
      bubble.textContent = text;
    }

    if (role === "user") {
      row.appendChild(bubble);
      row.appendChild(icon);
    } else {
      row.appendChild(icon);
      row.appendChild(bubble);
    }
    return row;
  }

  function appendMessage(role, text, options = {}) {
    const messageEl = createMessageElement(role, text, options);
    chatBox.appendChild(messageEl);
    messageEl.scrollIntoView({ block: "nearest" });
    return messageEl;
  }

  async function sendMessage(userText) {
    const payload = {
      conversation: [{ role: "user", text: userText }],
    };

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return response.json();
  }

const regionImages = document.querySelector(".region-images");
    const chatForm = document.getElementById("chat-form");

    function updateRegionImagesPosition() {
      if (!regionImages || !chatForm) return;
      const containerRect = chatForm.parentElement.getBoundingClientRect();
      const chatFormRect = chatForm.getBoundingClientRect();
      const top = chatFormRect.bottom - containerRect.top + 10;
      regionImages.style.top = `${top}px`;
    }

    window.addEventListener("resize", updateRegionImagesPosition);
    updateRegionImagesPosition();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const userText = input.value.trim();
      if (!userText) {
        return;
      }

      appendMessage("user", userText);
      input.value = "";
      input.focus();

      const thinkingEl = appendMessage("bot", "Thinking");
      thinkingEl.classList.add("typing");
      const thinkingBubble = thinkingEl.querySelector('.message--bot');

      try {
        const data = await sendMessage(userText);
        const aiReply =
          data && typeof data.result === "string" ? data.result.trim() : "";

        thinkingEl.classList.remove("typing");
        if (thinkingBubble) {
          thinkingBubble.innerHTML = renderMarkdown(
            aiReply || "Sorry, no response received."
          );
        }
      } catch (error) {
        console.error("Chat request failed:", error);
        thinkingEl.classList.remove("typing");
        if (thinkingBubble) {
          thinkingBubble.textContent = "Failed to get response from server.";
        }
      }
    });
  });
