// src/chat-page.js
(function () {
  const API_URL = "https://keena-bot.vercel.app/api/chat";
  const history = [];

  const msgs = document.getElementById("keenabot-msgs");
  const typing = document.getElementById("keenabot-typing");
  const form = document.getElementById("keenabot-form");
  const input = document.getElementById("keenabot-input");
  const send = document.getElementById("keenabot-send");
/*Character Count*/
  const count = document.getElementById("charCount");
  const MAX = 300;
  function charLen(str) { return Array.from(str || "").length; }
  function updateCounter() {
    const len = charLen(input.value);
    count.textContent = `${len} / ${MAX}`;
    send.disabled = len === 0 || len > MAX;
  }
  input.addEventListener("input", updateCounter);
  updateCounter();
  function addBubble(role, text) {
    const d = document.createElement("div");
    d.className = `kb-bubble ${role === "user" ? "kb-user" : "kb-bot"}`;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function setTyping(on) { typing.style.display = on ? "block" : "none"; }

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

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });
})();
