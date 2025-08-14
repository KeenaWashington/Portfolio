(function () {
  // Your deployed Vercel endpoint:
  const API_URL = "https://keena-bot.vercel.app/api/chat";

  const history = []; // rolling memory we send with each request

  function el(tag, cls, text) {
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    if (text != null) d.textContent = text;
    return d;
  }

  function mountUI() {
    // Launcher button
    const launch = el("button", "", "Chat with KeenaBot");
    launch.id = "keenabot-launcher";

    // Panel
    const panel = el("div"); panel.id = "keenabot-panel";
    const header = el("div", "", "KeenaBot");
    header.id = "keenabot-header";

    const msgs = el("div"); msgs.id = "keenabot-msgs";
    const typing = el("div", ""); typing.id = "keenabot-typing"; typing.textContent = "KeenaBot is typing…";

    const form = el("form"); form.id = "keenabot-form";
    const input = el("input"); input.id = "keenabot-input"; input.type = "text";
    input.placeholder = "Ask about Keena…"; input.autocomplete = "off";
    const send = el("button"); send.id = "keenabot-send"; send.type = "submit"; send.textContent = "Send";

    form.appendChild(input); form.appendChild(send);
    panel.appendChild(header); panel.appendChild(msgs); panel.appendChild(typing); panel.appendChild(form);
    document.body.appendChild(launch); document.body.appendChild(panel);

    function addBubble(role, text) {
      const b = el("div", `kb-bubble ${role === "user" ? "kb-user" : "kb-bot"}`, text);
      msgs.appendChild(b);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function setTyping(on) { typing.style.display = on ? "block" : "none"; }

    launch.addEventListener("click", () => {
      panel.style.display = panel.style.display === "flex" ? "none" : "flex";
      panel.style.flexDirection = "column";
      if (panel.style.display === "flex") input.focus();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;
      addBubble("user", message);
      input.value = ""; input.focus();
      send.disabled = true; setTyping(true);

      try {
        const r = await fetch(API_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message, history: history.slice(-12) })
        });
        const data = await r.json();
        const reply = data.reply || "(no reply)";
        addBubble("assistant", reply);
        history.push({ role: "user", content: message });
        history.push({ role: "assistant", content: reply });
      } catch (err) {
        console.error(err);
        addBubble("assistant", "Sorry—couldn’t reach the API.");
      } finally {
        setTyping(false);
        send.disabled = false;
      }
    });

    // Enter to send; Shift+Enter for newline
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); send.click();
      }
    });
  }

  // Load CSS then mount (uses /src path now)
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./src/chat.css";
  link.onload = mountUI;
  document.head.appendChild(link);
})();
