// this javascript file is responsible for the interactivity of the page

// variables
const pokedata = new Map();
const pokemon_info_data = new Map();
const no_pokemons = 18;
const button_inactive =
    "bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded";
const button_active =
    "bg-blue-500 font-semibold text-white py-2 px-4 border border-transparent rounded hover:cursor-pointer";
let curr_page = 1;
let max_page = 0;
let count = -1;
let id_active = true;
let name_active = false;
let reverse_active = false;

// search
const search = document.getElementById("search");

// texts
const page_info = document.getElementById("page-info");

// buttons
const id_button = document.getElementById("sort-id");
const name_button = document.getElementById("sort-name");
const reverse_button = document.getElementById("sort-reverse");
const previous_button = document.getElementById("previous-button");
const next_button = document.getElementById("next-button");

// Timeout
let timeoutID;

// string template for search endpoint
const getSearchEndpoint = () => {
    return `https://pokeapi.co/api/v2/pokemon/${search.value}/`;
};

// string template for fetching pokemons by pages
const getEndpoint = () => {
    if (reverse_active && id_active) {
        return `https://pokeapi.co/api/v2/pokemon?limit=${no_pokemons}&offset=${
            max_page * no_pokemons - curr_page * no_pokemons
        }`;
    }

    return `https://pokeapi.co/api/v2/pokemon?limit=${no_pokemons}&offset=${
        curr_page * no_pokemons - no_pokemons
    }`;
};

// string template for displaying the page info
const getPageInfo = () => {
    return `Page ${curr_page} of ${max_page}`;
};

// fetch pokemons by pages
const fetchPokemons = async () => {
    try {
        if (pokedata.get(curr_page) !== undefined) {
            return;
        }

        const response = await fetch(getEndpoint());
        if (!response.ok) {
            console.log("error fetching");
            console.log(response.status);
            return;
        }

        const json = await response.json();
        max_page = Math.ceil(json.count / 18);
        count = json.count;
        pokedata.set(curr_page, json);
    } catch (error) {
        console.log(error.message);
    }
};

// fetch pokemon from the search value, must be exact spelling in order to return result
const searchPokemon = async () => {
    try {
        const response = await fetch(getSearchEndpoint());
        if (!response.ok) {
            console.log("error fetching");
            console.log(response.status);
        }

        const json = await response.json();
        pokemon_info_data.set(search.value, json);
    } catch (error) {
        console.log(error.message);
    }
};

// displays the search result
const displaySearchResult = () => {
    const json = pokemon_info_data.get(search.value);
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = "";

    const template = document.querySelector("#pokemon-card").content.cloneNode(true);
    const id = json.id;
    const id_template = id >= 100 ? "#" : id >= 10 ? "#0" : "#00";

    const id_container = template.querySelector("span");
    id_container.textContent = id_template + id;

    const img_container = template.querySelector("img");
    img_container.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    img_container.alt = json.name;

    const name_container = template.querySelector("h2");
    name_container.textContent = json.name;

    cardContainer.appendChild(template);
};

// displays the pokemon for each page
const displayPokemons = () => {
    const json = { ...pokedata.get(curr_page) };
    const results = json.results;
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = "";

    if (name_active) {
        results.sort((a, b) => {
            if (a.name > b.name) {
                return 1;
            }

            if (a.name < b.name) {
                return -1;
            }

            return 0;
        });
    }

    if (reverse_active) {
        results.reverse();
    }

    results.map((item) => {
        const template = document.querySelector("#pokemon-card").content.cloneNode(true);
        const id = item.url.substring(34, item.url.length - 1);
        const id_template = id >= 100 ? "#" : id >= 10 ? "#0" : "#00";

        const id_container = template.querySelector("span");
        id_container.textContent = id_template + id;

        const img_container = template.querySelector("img");
        img_container.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        img_container.alt = item.name;

        const name_container = template.querySelector("h2");
        name_container.textContent = item.name;

        cardContainer.appendChild(template);
    });
};

//// Event Listeners ////

// on mount fetch the first page of pokemon
window.addEventListener("load", async () => {
    await fetchPokemons();
    displayPokemons();
    page_info.textContent = getPageInfo();
});

// get the pokemon for the previoux page
previous_button.addEventListener("click", async () => {
    if (curr_page === 1) {
        return;
    }

    curr_page -= 1;
    page_info.textContent = getPageInfo();

    await fetchPokemons();
    displayPokemons();
});

// get the pokemon for the next page
next_button.addEventListener("click", async () => {
    if (curr_page === max_page) {
        return;
    }

    curr_page += 1;
    page_info.textContent = getPageInfo();

    await fetchPokemons();
    displayPokemons();
});

// sort pokemon by id
id_button.addEventListener("click", async () => {
    if (id_active) {
        return;
    }

    id_active = true;
    name_active = false;
    id_button.className = button_active;
    name_button.className = button_inactive;

    pokedata.clear();
    await fetchPokemons();
    displayPokemons();
});

// sort pokemon by name
name_button.addEventListener("click", async () => {
    if (name_active) {
        return;
    }

    id_active = false;
    name_active = true;
    id_button.className = button_inactive;
    name_button.className = button_active;

    pokedata.clear();
    await fetchPokemons();
    displayPokemons();
});

// reverses the result
reverse_button.addEventListener("click", async () => {
    reverse_active = reverse_active ? false : true;
    reverse_button.className = reverse_active ? button_active : button_inactive;

    if (id_active) {
        pokedata.clear();
        await fetchPokemons();
    }

    displayPokemons();
});

// fetch pokemon after 1 seconds after keypress
search.addEventListener("keydown", async (event) => {
    clearTimeout(timeoutID);

    timeoutID = setTimeout(async () => {
        if (search.value === "") {
            pokedata.clear();
            await fetchPokemons();
            displayPokemons();
            return;
        }

        pokemon_info_data.clear();
        await searchPokemon();
        displaySearchResult();
    }, 1000);
});

//// Event Listeners ////
