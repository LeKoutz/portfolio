// Light/dark toggle. The inline script in <head> sets the first theme.
// No data-theme means dark. The toggle saves the choice in localStorage.

const root = document.documentElement;
const button = document.querySelector(".theme-toggle");
const systemLight = matchMedia("(prefers-color-scheme: light)");

function apply(theme) {
  if (theme === "light") root.dataset.theme = "light";
  else delete root.dataset.theme;
}

// localStorage can throw, for example when the browser blocks storage.
function savedTheme() {
  try { return localStorage.getItem("theme"); } catch { return null; }
}

button.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  apply(next);
  try { localStorage.setItem("theme", next); } catch {}
});

// Until the visitor uses the toggle, follow changes to the system setting.
systemLight.addEventListener("change", () => {
  if (!savedTheme()) apply(systemLight.matches ? "light" : "dark");
});
