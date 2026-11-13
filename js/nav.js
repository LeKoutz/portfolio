// Mobile menu. aria-expanded on the button is the only state: CSS reads it to show the links.

const button = document.querySelector(".menu-button");

function setOpen(open) {
  button.setAttribute("aria-expanded", String(open));
}

button.addEventListener("click", () => {
  setOpen(button.getAttribute("aria-expanded") !== "true");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setOpen(false);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".navbar__actions")) setOpen(false);
});
