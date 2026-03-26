import { routing } from "./src/utils/routing.js";

Array.from(document.querySelectorAll("div[data-section]")).forEach(section => section.remove());

routing.updateNav();
routing.goTo("/");

