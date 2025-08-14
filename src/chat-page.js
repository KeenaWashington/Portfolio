(function () {
  const API_URL = "https://keena-bot.vercel.app/api/chat"; // your Vercel endpoint
  const history = []; // keep a rolling memory so “tell me more” works

  const msgs = document.getElementById("keenabot-msgs");
  const typing = document.getElementById("keenabot-typing");
  const form = document.getElementById("keenabot-form");
  const input = document.getElementById("keenabot-input");
  const send = document.getElementById("keenabot-send");

  // Suggested prompt chips
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      input.value = chip.getAttribute("data-q");
      form.requestSubmit();
    });
  });

  // Auto-resize the textarea
  function autoGrow() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 160) + "px";
  }
  input.addEventListener("input", autoGrow);
  autoGrow();

  // Helpers
  function addBubble(role, text) {
    const d = document.createElement("div");
    d.className = `bubble ${role === "user" ? "user" : "bot"}`;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function setTyping(on) { typing.style.display = on ? "block" : "none"; }

  // Optional welcome message (remove if you don’t want it)
  addBubble("assistant", "Hi there! I’m KeenaBot. Ask about my background, experience, skills, education, or preferences.");

  // Submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addBubble("user", message);
    input.value = "";
    autoGrow();
    input.focus();
    send.disabled = true;
    setTyping(true);

    try {
      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, history: history.slice(-12) })
      });

      let data;
      try {
        data = await r.json();
      } catch {
        throw new Error(`Network/CORS: HTTP ${r.status} ${r.statusText}`);
      }
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);

      const reply = data.reply || "(no reply)";
      addBubble("assistant", reply);

      history.push({ role: "user", content: message });
      history.push({ role: "assistant", content: reply });

    } catch (err) {
      console.error(err);
      addBubble("assistant", `Sorry—API error: ${err.message}`);
    } finally {
      setTyping(false);
      send.disabled = false;
    }
  });

  // Enter to send, Shift+Enter for newline
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
})();
