const API_URL = "https://workspace-methed.vercel.app/";
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

const renderError = (err) => {
  console.warn(err);
};

const createDetailVacancy = ({
  id,
  title,
  company,
  description,
  email,
  salary,
  type,
  format,
  experience,
  location,
  logo,
}) => `
    <article class="detail">
      <div class="detail__header">
        <img
          class="detail__logo"
          src="${API_URL}${logo}"
          height="101"
          width="101"
          alt="creative people logo" />
        <h2 class="detail__company">${company}</h2>
        <span class="detail__role">${title}</span>
      </div>

      <div class="detail__info">
        <div class="detail__text">
          <p class="detail__desc">
            ${description.replaceAll("\n", "<br>")}
          </p>
        </div>

        <ul class="detail__fields">
          <li class="detail__field">от ${parseInt(salary).toLocaleString("ru-RU")}₽</li>
          <li class="detail__field">${type}</li>
          <li class="detail__field">${format}</li>
          <li class="detail__field">${experience}</li>
          <li class="detail__field">${location}</li>
        </ul>
      </div>

      <div class="detail__resume">
        Отправляйте резюме на
        <a class="detail__resume-name">CreativePeople@gmail.com</a>
      </div>
    </article>
`;

const renderModal = (data) => {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  const modalMain = document.createElement("div");
  modalMain.classList.add("modal__main");
  modalMain.innerHTML = createDetailVacancy(data);
  const modalClose = document.createElement("button");
  modalClose.classList.add("modal__close");
  modalClose.innerHTML = ` 
      <svg class="modal__close-icon">
        <use href="/icons/sprite.svg#close"></use>
      </svg>
   `;
  modalMain.append(modalClose);
  modal.append(modalMain);
  document.body.append(modal);
};

const openModal = (id) => {
  getData(`${API_URL}${VACANCY_URL}/${id}`, renderModal, renderError);
};

const initModal = () => {
  const cardsList = document.querySelector(".cards__list");
  if (!cardsList) return;

  cardsList.addEventListener("click", ({ target }) => {
    const vacancyCard = target.closest(".vacancy");
    if (!vacancyCard) return;

    const vacancyId = vacancyCard.dataset.id;
    if (!vacancyId) return;

    openModal(vacancyId);
  });
};

initModal();
