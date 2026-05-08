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
      const locations = locationData.map((location) => ({ value: location }));
      cityChoices.setChoices(locations, "value", "label", true);
    },
    (err) => {
      console.log(err);
    }
  );
};

init();
