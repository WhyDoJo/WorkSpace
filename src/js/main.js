import "../css/main.css";

// Подключение библиотек
import "./_libs.js";

// Подключение компонентов
import "./_components.js";

const citySelect = document.querySelector("#city");

if (citySelect && window.Choices) {
  new window.Choices(citySelect, {
    searchEnabled: false,
    itemSelectText: "",
    shouldSort: false,
  });
}
