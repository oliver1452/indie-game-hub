const gameList = document.getElementById('gameList');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
let allGames = [];

// Fetch indie games from SteamSpy (multiple pages for more results)
async function fetchIndieGames() {
    try {
        for (let page = 0; page < 5; page++) {  // Fetch 5 pages (~5,000 games)
            const response = await fetch(`https://steamspy.com/api.php?request=tag&tag=Indie&page=${page}`);
            const data = await response.json();
            allGames = allGames.concat(Object.values(data));  // SteamSpy returns object, convert to array
        }
        displayGames(allGames);
    } catch (error) {
        console.error('Error fetching games:', error);
    }
}

// Display games as cards
function displayGames(games) {
    gameList.innerHTML = '';
    games.forEach(game => {
        const card = document.createElement('div');
        card.classList.add('game-card');
        card.innerHTML = `
            <img src="https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg" alt="${game.name}">
            <h3>${game.name}</h3>
            <p>Owners: ${game.owners}</p>
        `;
        card.addEventListener('click', () => showGameDetails(game.appid));
        gameList.appendChild(card);
    });
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const filtered = allGames.filter(game => game.name.toLowerCase().includes(e.target.value.toLowerCase()));
    displayGames(filtered);
});

// Show details in modal using Steam Store API
async function showGameDetails(appid) {
    try {
        const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
        const data = await response.json();
        const gameData = data[appid].data;

        document.getElementById('gameTitle').textContent = gameData.name;
        document.getElementById('gameImage').src = gameData.header_image;
        document.getElementById('gameDescription').innerHTML = gameData.short_description;
        document.getElementById('gameGenres').textContent = `Genres: ${gameData.genres.map(g => g.description).join(', ')}`;
        document.getElementById('gameDevelopers').textContent = `Developer: ${gameData.developers.join(', ')} | Publisher: ${gameData.publishers.join(', ')}`;
        document.getElementById('gamePrice').textContent = `Price: ${gameData.is_free ? 'Free' : gameData.price_overview.final_formatted}`;
        document.getElementById('gameReviews').textContent = `Reviews: ${gameData.metacritic ? gameData.metacritic.score + '/100' : 'N/A'}`;

        const screenshots = document.getElementById('gameScreenshots');
        screenshots.innerHTML = '';
        gameData.screenshots.slice(0, 5).forEach(shot => {  // Show first 5 screenshots
            const img = document.createElement('img');
            img.src = shot.path_thumbnail;
            screenshots.appendChild(img);
        });

        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching details:', error);
    }
}

// Close modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Initial fetch
fetchIndieGames();