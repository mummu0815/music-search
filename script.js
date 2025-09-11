document.addEventListener('DOMContentLoaded', () => {

    // 🚨🚨🚨 중요: 이 곳에 자신의 Spotify API 키를 입력하세요! 🚨🚨🚨
    const CLIENT_ID = '3bdf3377e2c24913a0fbf5a9d1fdb3d0';
    const CLIENT_SECRET = '9f21f9d8bef14948b07f02e5e826691c';

    // --- DOM 요소 ---
    const searchResultsDiv = document.getElementById('searchResults');
    const searchQueryInput = document.getElementById('searchQuery');
    const searchButton = document.getElementById('searchButton');
    const playerCover = document.getElementById('playerCover');
    const playerTitle = document.getElementById('playerTitle');
    const playerArtist = document.getElementById('playerArtist');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const previousBtn = document.getElementById('previousBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playerSettingsToggle = document.getElementById('playerSettingsToggle');
    const playerSettingsContent = document.getElementById('playerSettingsContent');
    const channelNameInput = document.getElementById('channelNameInput');
    const saveChannelNameBtn = document.getElementById('saveChannelName');
    const coverUploadInput = document.getElementById('coverUpload');
    const coverUrlInput = document.getElementById('coverUrlInput');
    const applyCoverUrlBtn = document.getElementById('applyCoverUrl');
    const baseColorPicker = document.getElementById('baseColorPicker');
    const accentColorPicker = document.getElementById('accentColorPicker');
    const applyCardColorsBtn = document.getElementById('applyCardColors');
    const resetCardColorsBtn = document.getElementById('resetCardColors');
    const cardShapeButtons = document.querySelectorAll('.card-shape-btn');

    // --- 상태 변수 ---
    let spotifyResults = [];
    let currentSongIndex = -1;
    let isPlaying = false;
    let uploadedImage = localStorage.getItem('customCoverImage') || 'https://via.placeholder.com/60';
    let channelName = localStorage.getItem('channelName') || '';
    let currentCardShape = localStorage.getItem('cardShape') || 'default';
    let accessToken = null;

    // --- Spotify API ---
    async function getAccessToken() {
        if (CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID') {
            alert("🚨 script.js 파일에 Spotify API 키를 먼저 입력해주세요!");
            return null;
        }
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
                },
                body: 'grant_type=client_credentials'
            });
            if (!response.ok) throw new Error('토큰 발급 실패');
            const data = await response.json();
            return data.access_token;
        } catch (error) { return null; }
    }

    async function searchSpotify(query) {
        if (!accessToken) {
            accessToken = await getAccessToken();
            if (!accessToken) return generateDemoResults(query);
        }
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=$0{encodeURIComponent(query)}&type=track&limit=20`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error('API 검색 실패');
            const data = await response.json();
            return data.tracks.items.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(a => a.name).join(', '),
                cover: track.album.images[0]?.url || 'https://via.placeholder.com/150'
            }));
        } catch (error) { return generateDemoResults(query); }
    }

    function generateDemoResults(query) {
        alert("API 호출에 실패하여 데모 데이터를 표시합니다.");
        return Array.from({ length: 10 }, (_, i) => ({
            id: `demo${i+1}`,
            title: `${query} 트랙 ${i+1}`,
            artist: `데모 아티스트`,
            cover: `https://picsum.photos/200/200?random=${i}`
        }));
    }

    // --- UI 렌더링 ---
    function renderSearchResults(results) {
        spotifyResults = results;
        searchResultsDiv.innerHTML = '';
        searchResultsDiv.className = `search-results ${currentCardShape}-shape`;
        
        if (results.length === 0) {
            searchResultsDiv.innerHTML = `<p>검색 결과가 없습니다.</p>`;
            updatePlayerControls(false);
            return;
        }

        results.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.dataset.index = index;
            // 검색 결과 카드는 항상 실제 앨범 커버를 표시
            card.innerHTML = `<img src="${song.cover}" alt="${song.title}"><div class="info"><div class="title">${song.title}</div><div class="artist">${song.artist}</div></div>`;
            searchResultsDiv.appendChild(card);
        });

        playSong(0); // 검색 완료 후 첫 곡 자동 재생
    }

    function updatePlayerInfo() {
        if (currentSongIndex < 0 || currentSongIndex >= spotifyResults.length) return;
        
        const song = spotifyResults[currentSongIndex];
        
        // 1. 커버 이미지: 업로드된 이미지로 "고정"
        playerCover.src = uploadedImage;

        // 2. 제목 형식: "제목 - 아티스트"
        playerTitle.textContent = `${song.title} - ${song.artist}`;

        // 3. 아티스트/채널 이름: 저장된 채널 이름이 있으면 그것으로 표시
        playerArtist.textContent = channelName || song.artist; // 채널 이름이 없으면 원래 아티스트 표시
    }
    
    function updatePlayerControls(isEnabled) {
        [playPauseBtn, nextBtn, previousBtn].forEach(btn => btn.disabled = !isEnabled);
    }

    // --- 플레이어 제어 ---
    function playSong(index) {
        currentSongIndex = index;
        updatePlayerInfo();
        if (!isPlaying) {
            isPlaying = true;
            playPauseBtn.innerHTML = `<i class="fas fa-pause"></i>`;
        }
        updatePlayerControls(true);
    }

    function togglePlayPause() {
        if (currentSongIndex === -1) return;
        isPlaying = !isPlaying;
        playPauseBtn.innerHTML = `<i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>`;
    }

    function playNext() {
        if (spotifyResults.length === 0) return;
        playSong((currentSongIndex + 1) % spotifyResults.length);
    }

    function playPrevious() {
        if (spotifyResults.length === 0) return;
        playSong((currentSongIndex - 1 + spotifyResults.length) % spotifyResults.length);
    }
    
    function handleImageUpload(imageSrc) {
        uploadedImage = imageSrc;
        localStorage.setItem('customCoverImage', uploadedImage);
        playerCover.src = uploadedImage; // 즉시 플레이어 커버에 반영
    }

    // --- 이벤트 리스너 ---
    function setupEventListeners() {
        searchButton.addEventListener('click', async () => {
            const query = searchQueryInput.value.trim();
            if (!query) return;
            searchResultsDiv.innerHTML = `<p>로딩 중...</p>`;
            const results = await searchSpotify(query);
            renderSearchResults(results);
        });
        searchQueryInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchButton.click(); });

        searchResultsDiv.addEventListener('click', (e) => {
            const card = e.target.closest('.song-card');
            if (card) playSong(parseInt(card.dataset.index));
        });

        playPauseBtn.addEventListener('click', togglePlayPause);
        nextBtn.addEventListener('click', playNext);
        previousBtn.addEventListener('click', playPrevious);

        playerSettingsToggle.addEventListener('click', () => {
            playerSettingsToggle.classList.toggle('active');
            playerSettingsContent.classList.toggle('visible');
        });
        
        // 채널 이름 저장
        saveChannelNameBtn.addEventListener('click', () => {
            channelName = channelNameInput.value.trim();
            localStorage.setItem('channelName', channelName);
            updatePlayerInfo(); // 즉시 플레이어에 반영
            alert('채널 이름이 저장되었습니다.');
        });
        
        // 커버 이미지 업로드 (파일/URL)
        coverUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => handleImageUpload(event.target.result);
                reader.readAsDataURL(file);
            }
        });
        applyCoverUrlBtn.addEventListener('click', () => {
            if (coverUrlInput.value.trim()) handleImageUpload(coverUrlInput.value.trim());
        });

        // 카드(플레이어) 색상 변경
        applyCardColorsBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--player-bg-start', baseColorPicker.value);
            document.documentElement.style.setProperty('--player-bg-end', accentColorPicker.value);
            localStorage.setItem('playerBaseColor', baseColorPicker.value);
            localStorage.setItem('playerAccentColor', accentColorPicker.value);
        });
        resetCardColorsBtn.addEventListener('click', () => {
            const defaultBase = '#6a1b9a', defaultAccent = '#4a148c';
            document.documentElement.style.setProperty('--player-bg-start', defaultBase);
            document.documentElement.style.setProperty('--player-bg-end', defaultAccent);
            baseColorPicker.value = defaultBase; accentColorPicker.value = defaultAccent;
            localStorage.removeItem('playerBaseColor'); localStorage.removeItem('playerAccentColor');
        });

        // 검색 결과 모양 변경
        cardShapeButtons.forEach(button => {
            button.addEventListener('click', () => {
                cardShapeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentCardShape = button.dataset.shape;
                localStorage.setItem('cardShape', currentCardShape);
                renderSearchResults(spotifyResults);
            });
        });
    }

    // --- 초기화 ---
    function initialize() {
        channelNameInput.value = channelName;
        playerCover.src = uploadedImage;

        const savedBase = localStorage.getItem('playerBaseColor') || '#6a1b9a';
        const savedAccent = localStorage.getItem('playerAccentColor') || '#4a148c';
        document.documentElement.style.setProperty('--player-bg-start', savedBase);
        document.documentElement.style.setProperty('--player-bg-end', savedAccent);
        baseColorPicker.value = savedBase; accentColorPicker.value = savedAccent;

        cardShapeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.shape === currentCardShape));

        updatePlayerControls(false);
        setupEventListeners();
        
        searchQueryInput.value = "아이유 좋은날";
        searchButton.click();
    }

    initialize();
});
