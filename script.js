document.addEventListener('DOMContentLoaded', () => {

    // 🚨🚨🚨 중요: 이 곳에 자신의 Spotify API 키를 입력하세요! 🚨🚨🚨
    // Spotify 개발자 대시보드에서 발급받을 수 있습니다: https://developer.spotify.com/dashboard
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
    const playerWaveform = document.querySelector('.player-waveform');
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

    // --- 애플리케이션 상태 변수 ---
    let spotifyResults = [];
    let currentSongIndex = -1;
    let isPlaying = false;
    let uploadedImage = localStorage.getItem('customCoverImage') || 'https://via.placeholder.com/60';
    let currentCardShape = localStorage.getItem('cardShape') || 'default';
    let accessToken = null;

    // --- Spotify API 함수 ---
    async function getAccessToken() {
        if (CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID' || CLIENT_SECRET === 'YOUR_SPOTIFY_CLIENT_SECRET') {
            console.error("Spotify 클라이언트 ID와 시크릿을 입력해야 합니다.");
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
        } catch (error) {
            console.error('Access Token Error:', error);
            return null;
        }
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
            if (response.status === 401) { // 토큰 만료 시 재발급
                accessToken = await getAccessToken();
                return searchSpotify(query);
            }
            if (!response.ok) throw new Error('API 검색 실패');
            const data = await response.json();
            return data.tracks.items.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(a => a.name).join(', '),
                cover: track.album.images[0]?.url || 'https://via.placeholder.com/150'
            }));
        } catch (error) {
            console.error('Search Error:', error);
            return generateDemoResults(query);
        }
    }

    function generateDemoResults(query = "데모") {
        alert("API 호출에 실패하여 데모 데이터를 표시합니다.");
        return Array.from({ length: 10 }, (_, i) => ({
            id: `demo${i+1}`,
            title: `${query} 트랙 ${i+1}`,
            artist: `데모 아티스트`,
            cover: `https://picsum.photos/200/200?random=${i}`
        }));
    }

    // --- UI 렌더링 함수 ---
    function renderSearchResults(results) {
        spotifyResults = results;
        searchResultsDiv.innerHTML = '';
        searchResultsDiv.className = `search-results ${currentCardShape}-shape`;
        
        if (results.length === 0) {
            searchResultsDiv.innerHTML = `<p>검색 결과가 없습니다.</p>`;
            updatePlayerControls(false); // 결과 없으면 플레이어 버튼 비활성화
            return;
        }

        results.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.dataset.index = index;
            card.innerHTML = `<img src="${song.cover}" alt="${song.title}"><div class="info"><div class="title">${song.title}</div><div class="artist">${song.artist}</div></div>`;
            searchResultsDiv.appendChild(card);
        });

        // 첫 곡을 플레이어에 기본으로 표시
        currentSongIndex = 0;
        updatePlayerInfo();
        updatePlayerControls(true);
    }

    function updatePlayerInfo() {
        const song = spotifyResults[currentSongIndex];
        if (!song) return;
        playerCover.src = uploadedImage;
        playerTitle.textContent = song.title;
        playerArtist.textContent = song.artist;
    }
    
    function updatePlayerControls(isEnabled) {
        playPauseBtn.disabled = !isEnabled;
        nextBtn.disabled = !isEnabled;
        previousBtn.disabled = !isEnabled;
    }

    // --- 플레이어 제어 함수 ---
    function playSong(index) {
        currentSongIndex = index;
        updatePlayerInfo();
        if (!isPlaying) {
            isPlaying = true;
            playPauseBtn.innerHTML = `<i class="fas fa-pause"></i>`;
            playerWaveform.classList.remove('paused');
        }
    }

    function togglePlayPause() {
        if (currentSongIndex === -1) return;
        isPlaying = !isPlaying;
        playPauseBtn.innerHTML = `<i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>`;
        playerWaveform.classList.toggle('paused', !isPlaying);
    }

    function playNext() {
        if (spotifyResults.length === 0) return;
        const nextIndex = (currentSongIndex + 1) % spotifyResults.length;
        playSong(nextIndex);
    }

    function playPrevious() {
        if (spotifyResults.length === 0) return;
        const prevIndex = (currentSongIndex - 1 + spotifyResults.length) % spotifyResults.length;
        playSong(prevIndex);
    }

    // --- 이벤트 리스너 설정 ---
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

        // 설정 기능들
        saveChannelNameBtn.addEventListener('click', () => {
            localStorage.setItem('channelName', channelNameInput.value);
            alert('채널 이름 저장됨');
        });

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
            baseColorPicker.value = defaultBase;
            accentColorPicker.value = defaultAccent;
            localStorage.removeItem('playerBaseColor');
            localStorage.removeItem('playerAccentColor');
        });

        coverUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedImage = event.target.result;
                    localStorage.setItem('customCoverImage', uploadedImage);
                    playerCover.src = uploadedImage;
                };
                reader.readAsDataURL(file);
            }
        });

        applyCoverUrlBtn.addEventListener('click', () => {
            const url = coverUrlInput.value.trim();
            if (url) {
                uploadedImage = url;
                localStorage.setItem('customCoverImage', uploadedImage);
                playerCover.src = uploadedImage;
            }
        });

        cardShapeButtons.forEach(button => {
            button.addEventListener('click', () => {
                cardShapeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentCardShape = button.dataset.shape;
                localStorage.setItem('cardShape', currentCardShape);
                renderSearchResults(spotifyResults); // 모양만 다시 렌더링
            });
        });
    }

    // --- 초기화 함수 ---
    function initialize() {
        // 저장된 설정 불러오기
        channelNameInput.value = localStorage.getItem('channelName') || '';
        playerCover.src = uploadedImage;

        const savedBase = localStorage.getItem('playerBaseColor') || '#6a1b9a';
        const savedAccent = localStorage.getItem('playerAccentColor') || '#4a148c';
        document.documentElement.style.setProperty('--player-bg-start', savedBase);
        document.documentElement.style.setProperty('--player-bg-end', savedAccent);
        baseColorPicker.value = savedBase;
        accentColorPicker.value = savedAccent;

        const savedShape = localStorage.getItem('cardShape') || 'default';
        cardShapeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.shape === savedShape));

        updatePlayerControls(false); // 처음에는 플레이어 버튼 비활성화
        setupEventListeners();
        
        // 초기 로딩 시 인기 차트 검색
        searchButton.value = "아이유"; // 예시
        searchButton.click();
    }

    initialize();
});
