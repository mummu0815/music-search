document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    // 상단 설정 (모양 전용)
    const cardShapeButtons = document.querySelectorAll('.card-shape-btn');
    
    // 검색 관련
    const searchQueryInput = document.getElementById('searchQuery');
    const searchButton = document.getElementById('searchButton');
    const searchResultsDiv = document.getElementById('searchResults');
    const noResultsMessage = document.querySelector('.no-results');

    // 플레이어 '카드' 관련
    const playerCover = document.getElementById('playerCover');
    const playerTitle = document.getElementById('playerTitle');
    const playerArtist = document.getElementById('playerArtist');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const previousBtn = document.getElementById('previousBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playerWaveform = document.querySelector('.player-waveform');

    // 플레이어 '카드' 내 설정
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

    // Application State
    let spotifyResults = [];
    let currentSongIndex = -1;
    let isPlaying = false;
    let uploadedImage = localStorage.getItem('customCoverImage') || 'https://via.placeholder.com/60';
    let currentCardShape = localStorage.getItem('cardShape') || 'default';

    // (이전과 동일한 Spotify API 관련 함수들: getAccessToken, searchSpotify, generateDemoResults)
    // ... (이전 코드의 API 함수 부분을 여기에 붙여넣으세요) ...

    // --- UI Rendering Functions ---
    function renderSearchResults(results) {
        searchResultsDiv.innerHTML = '';
        spotifyResults = results;
        searchResultsDiv.className = `search-results ${currentCardShape}-shape`;

        if (results.length === 0) {
            noResultsMessage.classList.remove('hidden');
            return;
        }
        noResultsMessage.classList.add('hidden');

        results.forEach((song, index) => {
            const songCard = document.createElement('div');
            songCard.classList.add('song-card');
            songCard.dataset.index = index;
            // 검색 결과 카드에는 커스텀 이미지를 적용하지 않고, 항상 Spotify 앨범 커버를 보여줌
            songCard.innerHTML = `
                <img src="${song.cover}" alt="Album Cover">
                <div class="info">
                    <div class="title">${song.title}</div>
                    <div class="artist">${song.artist}</div>
                </div>`;
            searchResultsDiv.appendChild(songCard);
        });
    }

    function updatePlayerInfo(song) {
        if (!song) {
            playerCover.src = uploadedImage;
            playerTitle.textContent = '노래를 선택하세요';
            playerArtist.textContent = '아티스트';
            return;
        }
        // 플레이어 커버는 업로드된 이미지를 우선으로 표시
        playerCover.src = uploadedImage;
        playerTitle.textContent = song.title;
        playerArtist.textContent = song.artist;
    }

    function togglePlayPause() {
        if (currentSongIndex === -1) return; // 재생할 곡이 없으면 아무것도 안함
        isPlaying = !isPlaying;
        playPauseBtn.innerHTML = `<i class="fas ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>`;
        playerWaveform.classList.toggle('paused', !isPlaying);
    }
    
    function playSong(index) {
        currentSongIndex = index;
        const song = spotifyResults[currentSongIndex];
        if (!song) return;

        // 플레이어 정보 업데이트 시, 커버 이미지는 현재 설정된 'uploadedImage'를 사용
        playerCover.src = uploadedImage;
        playerTitle.textContent = song.title;
        playerArtist.textContent = song.artist;

        if (!isPlaying) {
            togglePlayPause();
        }
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

    // --- Event Listeners ---
    function setupEventListeners() {
        // 플레이어 설정 토글
        playerSettingsToggle.addEventListener('click', () => {
            playerSettingsToggle.classList.toggle('active');
            playerSettingsContent.classList.toggle('visible');
             // .hidden 클래스는 더 이상 사용하지 않음
            if (playerSettingsContent.classList.contains('hidden')) {
                playerSettingsContent.classList.remove('hidden');
            }
        });

        // 채널 이름 저장
        saveChannelNameBtn.addEventListener('click', () => {
            const name = channelNameInput.value.trim();
            localStorage.setItem('channelName', name);
            // 채널 이름 표시 기능은 현재 UI에 없으므로 저장만 함 (필요시 추가)
            alert('채널 이름이 저장되었습니다.');
        });
        
        // 검색
        searchButton.addEventListener('click', async () => {
            const query = searchQueryInput.value;
            searchResultsDiv.innerHTML = '<p class="no-results">로딩 중...</p>';
            const results = await searchSpotify(query); // searchSpotify 함수는 이전 코드에서 가져와야 함
            renderSearchResults(results);
        });

        searchQueryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchButton.click();
        });

        // 검색 결과 클릭
        searchResultsDiv.addEventListener('click', (e) => {
            const card = e.target.closest('.song-card');
            if (card) playSong(parseInt(card.dataset.index));
        });

        // 플레이어 컨트롤
        playPauseBtn.addEventListener('click', togglePlayPause);
        previousBtn.addEventListener('click', playPrevious);
        nextBtn.addEventListener('click', playNext);

        // 커버 이미지 변경 (파일)
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
        
        // 커버 이미지 변경 (URL)
        applyCoverUrlBtn.addEventListener('click', () => {
            const url = coverUrlInput.value.trim();
            if (url) {
                uploadedImage = url;
                localStorage.setItem('customCoverImage', uploadedImage);
                playerCover.src = uploadedImage;
            }
        });

        // 카드(플레이어) 색상 변경
        applyCardColorsBtn.addEventListener('click', () => {
            const baseColor = baseColorPicker.value;
            const accentColor = accentColorPicker.value;
            document.documentElement.style.setProperty('--player-bg-start', baseColor);
            document.documentElement.style.setProperty('--player-bg-end', accentColor);
            localStorage.setItem('playerBaseColor', baseColor);
            localStorage.setItem('playerAccentColor', accentColor);
        });

        resetCardColorsBtn.addEventListener('click', () => {
            document.documentElement.style.setProperty('--player-bg-start', '#6a1b9a');
            document.documentElement.style.setProperty('--player-bg-end', '#4a148c');
            baseColorPicker.value = '#6a1b9a';
            accentColorPicker.value = '#4a148c';
            localStorage.removeItem('playerBaseColor');
            localStorage.removeItem('playerAccentColor');
        });

        // 검색 결과 모양 변경
        cardShapeButtons.forEach(button => {
            button.addEventListener('click', () => {
                cardShapeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentCardShape = button.dataset.shape;
                localStorage.setItem('cardShape', currentCardShape);
                renderSearchResults(spotifyResults); // 모양 변경 시 다시 렌더링
            });
        });
    }

    // --- Initialization ---
    function initialize() {
        // 저장된 채널 이름 불러오기
        channelNameInput.value = localStorage.getItem('channelName') || '';

        // 저장된 커버 이미지 불러오기
        playerCover.src = uploadedImage;

        // 저장된 플레이어 색상 불러오기
        const savedBaseColor = localStorage.getItem('playerBaseColor');
        const savedAccentColor = localStorage.getItem('playerAccentColor');
        if (savedBaseColor && savedAccentColor) {
            document.documentElement.style.setProperty('--player-bg-start', savedBaseColor);
            document.documentElement.style.setProperty('--player-bg-end', savedAccentColor);
            baseColorPicker.value = savedBaseColor;
            accentColorPicker.value = savedAccentColor;
        }

        // 저장된 검색 결과 모양 불러오기
        const savedCardShape = localStorage.getItem('cardShape');
        if (savedCardShape) {
            currentCardShape = savedCardShape;
            cardShapeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.shape === savedCardShape);
            });
        }
        
        renderSearchResults([]); // 초기에는 빈 결과로 시작
        setupEventListeners();
    }
    
    // 🚨 중요: 이전 코드의 Spotify API 함수(getAccessToken, searchSpotify, generateDemoResults)를
    // 이 스크립트 파일에 포함시켜야 정상적으로 작동합니다.
    // ...

    initialize();
});

// 🚨 중요: 아래는 이전 코드에서 가져와야 할 Spotify API 관련 함수들입니다.
// 이 부분을 script.js 파일의 적절한 위치에 꼭 추가해주세요.

async function getAccessToken() {
    // This is a placeholder. In a real app, use a server-side proxy.
    const CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // 🚨 실제 ID로 교체
    const CLIENT_SECRET = 'YOUR_SPOTIFY_CLIENT_SECRET'; // 🚨 실제 Secret으로 교체
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
            },
            body: 'grant_type=client_credentials'
        });
        if (!response.ok) throw new Error('Failed to get access token');
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

async function searchSpotify(query) {
    if (!query.trim()) return [];
    const token = await getAccessToken();
    if (!token) return generateDemoResults(query);

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=$0{encodeURIComponent(query)}&type=track&limit=20`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Spotify API search failed');
        const data = await response.json();
        return data.tracks.items.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            cover: track.album.images[0]?.url || 'https://via.placeholder.com/150'
        }));
    } catch (error) {
        console.error('Error searching Spotify:', error);
        return generateDemoResults(query);
    }
}

function generateDemoResults(query = "데모") {
    console.warn("API 호출 실패. 데모 데이터를 사용합니다.");
    return Array.from({ length: 10 }, (_, i) => ({
        id: `demo${i+1}`,
        title: `${query} 트랙 ${i+1}`,
        artist: `데모 아티스트`,
        album: `데모 앨범`,
        cover: `https://picsum.photos/200/200?random=${i}`
    }));
}
