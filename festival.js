const dataContainer = document.getElementById("data-container");
const genreBoxes = document.querySelectorAll(".genre");

genreBoxes.forEach((checkbox) => {
  checkbox.addEventListener("change", (event) => {
    const label = event.target.closest("label");

    if (event.target.checked) {
      label.classList.add("active");

      genreBoxes.forEach((otherCheckbox) => {
        if (otherCheckbox !== event.target) {
          otherCheckbox.checked = false;
          const otherLabel = otherCheckbox.closest("label");
          otherLabel.classList.remove("active");
        }
      });
    } else {
      label.classList.remove("active");
    }

    filterArtists(event.target);
  });
});

const baseUrl = "https://cdn.contentful.com/spaces/";
const SPACE_ID = localStorage.getItem("space_id");
const ACCESS_TOKEN = localStorage.getItem("access_token");
let artists = [];
const apiUrl = `${baseUrl}${SPACE_ID}/entries?access_token=${ACCESS_TOKEN}&content_type=artist&include=3
`;

async function filterArtists(event) {
  await fetchData();
  if (event.checked) {
    const includes = artists.includes.Entry.reduce((acc, entry) => {
      acc[entry.sys.id] = entry.fields;
      return acc;
    }, {});

    const selectedGenreId = Object.keys(includes).find(
      (key) => includes[key].name === event.value
    );
    const newFilteredArtists = artists.items.filter(
      (artist) => artist.fields.genre.sys.id === selectedGenreId
    );

    artists.items = newFilteredArtists;
  }
  renderArtist();
}

const fetchData = async () => {
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("http-fel!");
    }

    const data = await response.json();

    artists = data;
  } catch (error) {
    console.error(error);
    dataContainer.innerHTML = `<p>Någonting gick fel i hämtningen. </p>`;
  }
};

function renderArtist() {
  const includes = artists.includes.Entry.reduce((acc, entry) => {
    acc[entry.sys.id] = entry.fields;
    return acc;
  }, {});

  const artistImage = {
    "Ariana Grande": "Images/ariana.grande.jpg",
    "Travis Scott": "Images/travis.scott.jpg",
    "Snarky Puppy": "Images/snarky.puppy.jpg",
    "Imagine Dragons": "Images/imagine.dragons.jpg",
    "The Lumineers": "Images/the.lumineers.jpg",
    Drake: "Images/drake.jpg",
    "Billie Eilish": "Images/billie.eilish.jpg",
    Slipknot: "Images/slipknot.jpg",
    "The Weeknd": "Images/the.weeknd.jpg",
    Metallica: "Images/metallica.jpg",
  };

  const festivalHTML = artists.items
    .map((artist) => {
      const fields = artist.fields;

      const genre = fields.genre ? includes[fields.genre.sys.id] : null;
      const stage = fields.stage ? includes[fields.stage.sys.id] : null;
      const day = fields.day ? includes[fields.day.sys.id] : null;

      let formattedDate = "Ingen dag";
      let formattedTime = "";

      if (day && day.date) {
        const date = new Date(day.date);

        const dateOptions = {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        };
        formattedDate = date.toLocaleDateString("sv-SE", dateOptions);

        const timeOptions = {
          hour: "2-digit",
          minute: "2-digit",
        };
        formattedTime = date.toLocaleTimeString("sv-SE", timeOptions);
      }

      const artistImageURL = artistImage[fields.name]
        ? artistImage[fields.name]
        : "default.jpg"; //

      if (fields.name) {
        return `
    <div class="card-wrapper">
      <div class="card">
        <div class="card-front">
          <img src="${artistImageURL}" alt="${fields.name}" class="card-image"/>
          <h2>${fields.name}</h2>
          <p><strong>Day:</strong> ${formattedDate}<br>
          <strong>Time:</strong> ${formattedTime}</p>
        </div>
        <div class="card-back">
          <p><strong>Genre:</strong> ${genre ? genre.name : "Ingen genre"}<br>
          ${genre.description ? `<em>${genre.description}</em>` : ""}</p>
          <p><strong>Stage:</strong> ${stage ? stage.name : "Ingen scen"}<br>
          ${stage.description ? `<em>${stage.description}</em>` : ""}<br>
          <strong>Area:</strong> ${
            stage.area ? `<em>${stage.area}</em>` : ""
          }</p>
          <p>${fields.description || "Ingen beskrivning tillgänglig."}</p>
        </div>
      </div>
    </div>`;
      }

      return "";
    })
    .join("");

  dataContainer.innerHTML = festivalHTML;
}

fetchData().then(() => {
  renderArtist();
});
