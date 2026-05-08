const API_URL = "https://workspace-methed.vercel.app/";
const LOCATION_URL = "api/locations";
const VACANCY_URL = "api/vacancy";

const getData = async (url, cbSuccess, cbError) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    cbSuccess(data);
  } catch (err) {
    cbError(err);
  }
};

const createCard = (vacancy) => `
      <article class="vacancy" tabindex="0" data-id="${vacancy.id}">
            <picture class="vacancy__picture">
              <source srcset="${API_URL}${vacancy.logo}" type="image/avif" />
              <source srcset="${API_URL}${vacancy.logo}" type="image/webp" />
              <img
                class="vacancy__img"
                src="${API_URL}${vacancy.logo}"
                alt="Логотип компании ${vacancy.company}"
                loading="lazy"
                decoding="async"
                width="44"
                height="44" />
            </picture>

            <h3 class="vacancy__company">${vacancy.company}</h3>
            <span class="vacancy__role">${vacancy.title}</span>

            <ul class="vacancy__fields">
              <li class="vacancy__field">от ${parseInt(vacancy.salary).toLocaleString("ru-RU")}₽</li>
              <li class="vacancy__field">${vacancy.format}</li>
              <li class="vacancy__field">${vacancy.type}</li>
              <li class="vacancy__field">${vacancy.experience}</li>
            </ul>
          </article>
`;

const createCards = (data) =>
  data.vacancies.map((vacancy) => {
    const li = document.createElement("li");
    li.classList.add("cards__item");
    li.insertAdjacentHTML("beforeend", createCard(vacancy));
    return li;
  });

const renderVacancy = (data) => {
  const cardsList = document.querySelector(".cards__list");
  if (!cardsList) return;

  cardsList.textContent = "";

  const cards = createCards(data);
  cardsList.append(...cards);
};

const renderError = (err) => {
  console.warn(err);
};

const init = () => {
  const citySelect = document.querySelector("#city");
  if (!citySelect || !window.Choices) return;

  const cityChoices = new window.Choices(citySelect, {
    searchEnabled: false,
    itemSelectText: "",
    shouldSort: false,
  });

  getData(
    `${API_URL}${LOCATION_URL}`,
    (locationData) => {
      const locations = locationData.map((location) => ({
        value: location,
        label: location,
      }));
      cityChoices.setChoices(locations, "value", "label", true);
    },
    (err) => {
      console.log(err);
    }
  );

  // cards

  const url = new URL(`${API_URL}${VACANCY_URL}`);

  getData(url, renderVacancy, renderError);
};

init();
