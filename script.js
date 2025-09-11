document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const toggleSettingsBtn = document.getElementById('toggleSettings');
    const settingsContent = document.getElementById('settingsContent');
    const channelNameInput = document.getElementById('channelNameInput');
    const saveChannelNameBtn = document.getElementById('saveChannelName');
    const playerChannel = document.getElementById('playerChannel');
    const searchQueryInput = document.getElementById('searchQuery');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
    const noResultsMessage = document.querySelector('.no-results');
    const playerCover = document.getElementById('playerCover');
    const playerTitle = document.getElementById('playerTitle');
    const playerArtist = document.getElementById('playerArtist');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const previousBtn = document.getElementById('previousBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playerWaveform = document.querySelector('.player-waveform');

    const coverUploadInput = document.getElementById('coverUpload');
    const coverUrlInput = document.getElementById('coverUrlInput');
    const applyCoverUrlBtn = document.getElementById('applyCoverUrl');

    // New color and shape elements
    const baseColorPicker = document.getElementById('baseColorPicker');
    const accentColorPicker = document.getElementById('accentColorPicker');
    const applyCardColorsBtn = document.getElementById('applyCardColors');
    const resetCardColorsBtn = document.getElementById('resetCardColors');
    const cardShapeButtons = document.querySelectorAll('.card-shape-btn');

    // Application State
    let spotifyResults = [];
    let currentSongIndex = -1;
    let isPlaying = false;
    let uploadedImage = localStorage.getItem('customCoverImage') || 'https://via.placeholder.com/60';
    let currentCardShape = localStorage.getItem('cardShape') || 'default'; // default, image-style, vertical

    // Dummy API credentials (🚨 Security Warning: Never expose these in client-side code in a real app)
    const CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // Replace with your Spotify Client ID
    const CLIENT_SECRET = 'YOUR_SPOTIFY_CLIENT_SECRET'; // Replace with your Spotify Client Secret
    const REDIRECT_URI = 'http://localhost:5500/index.html'; // Or your deployed URL

    // --- Spotify API Authentication (Simulated/Placeholder) ---
    // In a real app, this would involve OAuth flow and a backend to protect secrets.
    let accessToken = null;
    let tokenExpiry = 0;

    async function getAccessToken() {
        // This is a placeholder for a more complex OAuth flow.
        // In a real application, you would typically get an access token
        // from your backend server, which securely handles the client secret.
        // Direct client-side calls with client_credentials flow are not recommended for production.

        if (accessToken && Date.now() < tokenExpiry) {
            return accessToken;
        }

        console.warn("Attempting to get Spotify access token. Client secrets should ideally be handled server-side.");
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
                },
                body: 'grant_type=client_credentials'
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to get access token:', errorData);
                throw new Error('Failed to get access token');
            }

            const data = await response.json();
            accessToken = data.access_token;
            tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Expire 60 seconds early
            console.log('Spotify Access Token acquired:', accessToken);
            return accessToken;

        } catch (error) {
            console.error('Error getting Spotify access token:', error);
            // Fallback to dummy data if API access fails
            return null;
        }
    }

    async function searchSpotify(query) {
        // Correct Spotify API endpoint
        const SPOTIFY_SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search';

        if (!query.trim()) {
            console.log("Search query is empty.");
            return [];
        }

        try {
            const token = await getAccessToken();
            if (!token) {
                throw new Error("No Spotify access token available.");
            }

            const response = await fetch(`${SPOTIFY_SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&type=track&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Spotify API search failed:', errorData);
                throw new Error('Spotify API search failed');
            }

            const data = await response.json();
            return data.tracks.items.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                album: track.album.name,
                cover: track.album.images.length > 0 ? track.album.images[0].url : 'https://via.placeholder.com/60'
            }));

        } catch (error) {
            console.error('Error searching Spotify:', error);
            // Fallback to dummy data
            return generateDemoResults(query);
        }
    }

    // --- Demo Data Generation ---
    function generateDemoResults(query = "demo") {
        console.log("Using demo data due to API issues.");
        const demoTracks = [
            { id: '1', title: `${query} - Demo 1`, artist: 'Demo Artist A', album: 'Demo Album 1', cover: uploadedImage },
            { id: '2', title: `${query} - Demo 2`, artist: 'Demo Artist B', album: 'Demo Album 2', cover: uploadedImage },
            { id: '3', title: `${query} - Demo 3`, artist: 'Demo Artist C', album: 'Demo Album 3', cover: uploadedImage },
            { id: '4', title: `${query} - Demo 4`, artist: 'Demo Artist D', album: 'Demo Album 4', cover: uploadedImage },
            { id: '5', title: `${query} - Demo 5`, artist: 'Demo Artist E', album: 'Demo Album 5', cover: uploadedImage },
        ];
        // Add more demo tracks if needed
        for (let i = 6; i <= 20; i++) {
            demoTracks.push({
                id: `${i}`,
                title: `${query} - Demo ${i}`,
                artist: `Demo Artist ${String.fromCharCode(64 + i)}`,
                album: `Demo Album ${i}`,
                cover: uploadedImage
            });
        }
        return demoTracks;
    }

    // --- UI Rendering Functions ---

    function renderSearchResults(results) {
        searchResultsDiv.innerHTML = ''; // Clear previous results
        spotifyResults = results; // Update global state
        searchResultsDiv.className = `search-results ${currentCardShape}-shape`; // Apply current shape class

        if (results.length === 0) {
            noResultsMessage.classList.remove('hidden');
            return;
        } else {
            noResultsMessage.classList.add('hidden');
        }

        results.forEach((song, index) => {
            const songCard = document.createElement('div');
            songCard.classList.add('song-card');
            songCard.dataset.index = index; // Store index for easy access

            // Determine content based on currentCardShape
            let cardContent;
            if (currentCardShape === 'image-style') {
                cardContent = `
                    <img src="${uploadedImage === 'https://via.placeholder.com/60' ? song.cover : uploadedImage}" alt="Album Cover">
                    <div class="info">
                        <div class="title">${song.title}</div>
                        <div class="artist">${song.artist}</div>
                    </div>
                `;
            } else if (currentCardShape === 'vertical') {
                cardContent = `
                    <img src="${uploadedImage === 'https://via.placeholder.com/60' ? song.cover : uploadedImage}" alt="Album Cover">
                    <div class="info">
                        <div class="title">${song.title}</div>
                        <div class="artist">${song.artist}</div>
                    </div>
                `;
            } else { // 'default' shape
                cardContent = `
                    <img src="${uploadedImage === 'https://via.placeholder.com/60' ? song.cover : uploadedImage}" alt="Album Cover">
                    <div class="info">
                        <div class="title">${song.title}</div>
                        <div class="artist">${song.artist}</div>
                    </div>
                `;
            }
            songCard.innerHTML = cardContent;
            searchResultsDiv.appendChild(songCard);
        });
    }

    function updatePlayerInfo(song) {
        if (!song) {
            playerCover.src = 'https://via.placeholder.com/60';
            playerTitle.textContent = '노래 제목';
            playerArtist.textContent = '아티스트';
            return;
        }
        playerCover.src = uploadedImage === 'https://via.placeholder.com/60' ? song.cover : uploadedImage;
        playerTitle.textContent = song.title;
        playerArtist.textContent = song.artist;
    }

    function togglePlayPause() {
        isPlaying = !isPlaying;
        const iconClass = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        playPauseBtn.innerHTML = `<i class="${iconClass}"></i>`;
        playerWaveform.classList.toggle('paused', !isPlaying); // Pause/play waveform animation
        console.log(isPlaying ? 'Playing...' : 'Paused.');
    }

    function playSong(index) {
        if (index < 0 || index >= spotifyResults.length) {
            console.error("Invalid song index.");
            return;
        }
        currentSongIndex = index;
        updatePlayerInfo(spotifyResults[currentSongIndex]);
        if (!isPlaying) { // Only toggle if currently paused
            togglePlayPause();
        }
        console.log(`Now playing: ${spotifyResults[currentSongIndex].title}`);
    }

    function playNext() {
        if (spotifyResults.length === 0) return;
        currentSongIndex = (currentSongIndex + 1) % spotifyResults.length;
        playSong(currentSongIndex);
    }

    function playPrevious() {
        if (spotifyResults.length === 0) return;
        currentSongIndex = (currentSongIndex - 1 + spotifyResults.length) % spotifyResults.length;
        playSong(currentSongIndex);
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        toggleSettingsBtn.addEventListener('click', () => {
            settingsContent.classList.toggle('hidden');
        });

        saveChannelNameBtn.addEventListener('click', () => {
            const name = channelNameInput.value.trim();
            if (name) {
                localStorage.setItem('channelName', name);
                playerChannel.textContent = name;
            } else {
                localStorage.removeItem('channelName');
                playerChannel.textContent = '';
            }
        });

        searchButton.addEventListener('click', async () => {
            const query = searchQueryInput.value;
            searchResultsDiv.innerHTML = '<p class="no-results">로딩 중...</p>';
            noResultsMessage.classList.remove('hidden'); // Show loading message
            const results = await searchSpotify(query);
            renderSearchResults(results);
        });

        searchQueryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });

        searchResultsDiv.addEventListener('click', (e) => {
            const card = e.target.closest('.song-card');
            if (card) {
                const index = parseInt(card.dataset.index);
                playSong(index);
            }
        });

        playPauseBtn.addEventListener('click', togglePlayPause);
        previousBtn.addEventListener('click', playPrevious);
        nextBtn.addEventListener('click', playNext);

        // Custom Cover Image
        coverUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedImage = event.target.result;
                    localStorage.setItem('customCoverImage', uploadedImage);
                    // Re-render results and player with new image
                    renderSearchResults(spotifyResults);
                    if (currentSongIndex !== -1) {
                        updatePlayerInfo(spotifyResults[currentSongIndex]);
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        applyCoverUrlBtn.addEventListener('click', () => {
            const url = coverUrlInput.value.trim();
            if (url) {
                uploadedImage = url;
                localStorage.setItem('customCoverImage', uploadedImage);
                renderSearchResults(spotifyResults);
                if (currentSongIndex !== -1) {
                    updatePlayerInfo(spotifyResults[currentSongIndex]);
                }
            } else {
                alert("URL을 입력해주세요.");
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return; // Don't interfere with typing in input fields
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent scrolling down
                togglePlayPause();
            } else if (e.key === 'ArrowRight') {
                playNext();
            } else if (e.key === 'ArrowLeft') {
                playPrevious();
            }
        });

        // --- New Event Listeners for Color and Shape ---
        applyCardColorsBtn.addEventListener('click', () => {
            const baseColor = baseColorPicker.value;
            const accentColor = accentColorPicker.value;
            document.documentElement.style.setProperty('--card-bg-start', baseColor);
            document.documentElement.style.setProperty('--card-bg-end', accentColor);
            localStorage.setItem('cardBaseColor', baseColor);
            localStorage.setItem('cardAccentColor', accentColor);
        });

        resetCardColorsBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--card-bg-start', '#8A2BE2');
            document.documentElement.style.setProperty('--card-bg-end', '#CCCCFF');
            baseColorPicker.value = '#8A2BE2';
            accentColorPicker.value = '#CCCCFF';
            localStorage.removeItem('cardBaseColor');
            localStorage.removeItem('cardAccentColor');
        });

        cardShapeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                cardShapeButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                currentCardShape = button.dataset.shape;
                localStorage.setItem('cardShape', currentCardShape);
                renderSearchResults(spotifyResults); // Re-render with new shape
            });
        });
    }

    // --- Initialization ---
    function initialize() {
        // Restore channel name
        const savedChannelName = localStorage.getItem('channelName');
        if (savedChannelName) {
            channelNameInput.value = savedChannelName;
            playerChannel.textContent = savedChannelName;
        } else {
            playerChannel.textContent = 'Lavender Radio'; // Default if not set
        }

        // Restore custom cover image
        if (uploadedImage !== 'https://via.placeholder.com/60') {
            coverUrlInput.value = uploadedImage; // Display URL if it's a URL
            // If it's a Data URL, we just use it directly, no need to show in input
        }

        // Restore card colors
        const savedBaseColor = localStorage.getItem('cardBaseColor');
        const savedAccentColor = localStorage.getItem('cardAccentColor');
        if (savedBaseColor && savedAccentColor) {
            document.documentElement.style.setProperty('--card-bg-start', savedBaseColor);
            document.documentElement.style.setProperty('--card-bg-end', savedAccentColor);
            baseColorPicker.value = savedBaseColor;
            accentColorPicker.value = savedAccentColor;
        }

        // Restore card shape and set active button
        const savedCardShape = localStorage.getItem('cardShape');
        if (savedCardShape) {
            currentCardShape = savedCardShape;
            document.querySelector(`.card-shape-btn[data-shape="${savedCardShape}"]`)?.classList.add('active');
        } else {
            document.querySelector(`.card-shape-btn[data-shape="default"]`)?.classList.add('active');
        }
        
        // Initial rendering with demo data or saved data
        renderSearchResults(generateDemoResults("Popular"));
        updatePlayerInfo(spotifyResults[0] || null); // Initialize player with first song if available
        
        setupEventListeners();
    }

    initialize();
});
