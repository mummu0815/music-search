// Spotify API 설정
const SPOTIFY_CLIENT_ID = '3bdf3377e2c24913a0fbf5a9d1fdb3d0'; // 실제 사용시 Spotify Developer Dashboard에서 발급받은 Client ID로 교체
const SPOTIFY_CLIENT_SECRET = '9f21f9d8bef14948b07f02e5e826691c'; // 실제 사용시 Spotify Developer Dashboard에서 발급받은 Client Secret로 교체

// 기본 검색 결과 데이터 (IU 곡들)
const defaultResults = [
    {
        id: "1",
        title: "Never Ending Story",
        artist: "IU",
        albumArt: "https://via.placeholder.com/120x120/1F2937/FFFFFF?text=NE",
        spotify: true
    },
    {
        id: "2", 
        title: "Through the Night",
        artist: "IU",
        albumArt: "https://via.placeholder.com/120x120/374151/FFFFFF?text=TTN",
        spotify: true
    },
    {
        id: "3",
        title: "Twenty-three",
        artist: "IU", 
        albumArt: "https://via.placeholder.com/120x120/EC4899/FFFFFF?text=23",
        spotify: true
    },
    {
        id: "4",
        title: "My sea",
        artist: "IU",
        albumArt: "https://via.placeholder.com/120x120/06B6D4/FFFFFF?text=MS",
        spotify: true
    },
    {
        id: "5",
        title: "Celebrity",
        artist: "IU",
        albumArt: "https://via.placeholder.com/120x120/F59E0B/FFFFFF?text=CE",
        spotify: true
    },
    {
        id: "6",
        title: "Love wins all",
        artist: "IU",
        albumArt: "https://via.placeholder.com/120x120/EF4444/FFFFFF?text=LWA",
        spotify: true
    },
    {
        id: "7",
        title: "Drama",
        artist: "IU",
        albumArt: "https://via.placeholder.com/120x120/8B5CF6/FFFFFF?text=DR",
        spotify: true
    },
    {
        id: "8",
        title: "Meaning of you",
        artist: "IU, Kim Chang-Wan",
        albumArt: "https://via.placeholder.com/120x120/10B981/FFFFFF?text=MOY",
        spotify: true
    },
    {
        id: "9",
        title: "strawberry moon",
        artist: "IU",
        albumArt: "https://via.placeholder.com/120x120/F472B6/FFFFFF?text=SM",
        spotify: true
    },
    {
        id: "10",
        title: "Square's dream",
        artist: "IU",
        albumArt: "https://via.placeholder.com/120x120/6366F1/FFFFFF?text=SD",
        spotify: true
    },
    {
        id: "11",
        title: "Blueming",
        artist: "IU",
        albumArt: "https://via.placeholder.com/120x120/3B82F6/FFFFFF?text=BM",
        spotify: true
    },
    {
        id: "12",
        title: "eight(Prod.&Feat. SUGA of BTS)",
        artist: "IU, SUGA",
        albumArt: "https://via.placeholder.com/120x120/DC2626/FFFFFF?text=8",
        spotify: true
    }
];

let spotifyResults = [...defaultResults];

// DOM 요소들
const searchResults = document.getElementById('searchResults');
const settingsContent = document.getElementById('settingsContent');
const toggleSettings = document.getElementById('toggleSettings');
const musicPlayer = document.getElementById('musicPlayer');
const songTitle = document.getElementById('songTitle');
const channelInfo = document.getElementById('channelInfo');
const playerAlbumArt = document.getElementById('playerAlbumArt');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const fileInput = document.getElementById('fileInput');
const imageUpload = document.getElementById('imageUpload');
const fileName = document.getElementById('fileName');
const channelNameInput = document.getElementById('channelName');
const cardColorInput = document.getElementById('cardColor');
const applyColorBtn = document.getElementById('applyColorBtn');
const applyCover = document.getElementById('applyCover');
const originalThumbnail = document.getElementById('originalThumbnail');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const updateChartBtn = document.getElementById('updateChartBtn');
const currentArtist = document.getElementById('currentArtist');

// 현재 재생 중인 곡 인덱스
let currentSongIndex = 0;
let isPlaying = false;
let uploadedImage = null;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    // 초기에는 빈 결과로 설정
    spotifyResults = [];
    renderSearchResults();
    updatePlayerInfo();
    updateChannelInfo(); // 초기 채널 정보 설정
    applyCardColor(); // 초기 카드 색상 설정
});

// 검색 결과 렌더링
function renderSearchResults() {
    searchResults.innerHTML = '';
    
    if (spotifyResults.length === 0) {
        searchResults.innerHTML = '<div class="no-results">검색 결과가 없습니다. 아티스트나 곡명을 검색해보세요.</div>';
        return;
    }
    
    spotifyResults.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.style.setProperty('--card-color', cardColorInput.value);
        songCard.innerHTML = `
            <div class="album-art">
                <img src="${song.albumArt}" alt="${song.title}">
                <div class="spotify-label">Spotify</div>
            </div>
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="artist-name">${song.artist}</div>
            </div>
        `;
        
        // 클릭 이벤트 추가
        songCard.addEventListener('click', (e) => {
            // Ctrl 키를 누르고 클릭하면 Spotify 링크 열기
            if (e.ctrlKey && song.externalUrl) {
                e.preventDefault();
                window.open(song.externalUrl, '_blank');
            } else {
                // 일반 클릭은 플레이어에 반영
                currentSongIndex = index;
                updatePlayerInfo();
                playSong();
            }
        });
        
        searchResults.appendChild(songCard);
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 설정 패널 토글
    toggleSettings.addEventListener('click', () => {
        const isVisible = settingsContent.style.display !== 'none';
        settingsContent.style.display = isVisible ? 'none' : 'block';
        toggleSettings.textContent = isVisible ? '▶' : '▼';
    });
    
    // 플레이어 컨트롤
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    // 파일 업로드
    imageUpload.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    
    // 커버 적용/원래 썸네일
    applyCover.addEventListener('click', applyCustomCover);
    originalThumbnail.addEventListener('click', resetToOriginalCover);
    
    // 채널명 변경
    channelNameInput.addEventListener('input', updateChannelInfo);
    
    // 카드 색상 적용 버튼
    applyColorBtn.addEventListener('click', applyCardColor);
    
    // 검색 기능
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 차트 업데이트 기능
    updateChartBtn.addEventListener('click', async () => {
        updateChartBtn.textContent = '업데이트 중...';
        updateChartBtn.disabled = true;
        
        const success = await forceUpdateKoreanCharts();
        
        if (success) {
            updateChartBtn.textContent = '업데이트 완료!';
            setTimeout(() => {
                updateChartBtn.textContent = '차트 업데이트';
                updateChartBtn.disabled = false;
            }, 2000);
        } else {
            updateChartBtn.textContent = '업데이트 실패';
            setTimeout(() => {
                updateChartBtn.textContent = '차트 업데이트';
                updateChartBtn.disabled = false;
            }, 2000);
        }
    });
}

// 플레이어 정보 업데이트
function updatePlayerInfo() {
    const currentSong = spotifyResults[currentSongIndex];
    songTitle.textContent = `${currentSong.title} - ${currentSong.artist}`;
    updateChannelInfo(); // 채널 정보 업데이트 함수 호출
    playerAlbumArt.src = currentSong.albumArt;
}

// 재생/일시정지 토글
function togglePlay() {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '⏸' : '▶';
    
    if (isPlaying) {
        // 실제 재생 로직은 여기에 구현
        console.log('재생 시작:', spotifyResults[currentSongIndex].title);
    } else {
        console.log('일시정지');
    }
}

// 이전 곡
function playPrevious() {
    currentSongIndex = currentSongIndex > 0 ? currentSongIndex - 1 : spotifyResults.length - 1;
    updatePlayerInfo();
    if (isPlaying) {
        playSong();
    }
}

// 다음 곡
function playNext() {
    currentSongIndex = currentSongIndex < spotifyResults.length - 1 ? currentSongIndex + 1 : 0;
    updatePlayerInfo();
    if (isPlaying) {
        playSong();
    }
}

// 곡 재생
function playSong() {
    isPlaying = true;
    playBtn.textContent = '⏸';
    console.log('재생:', spotifyResults[currentSongIndex].title);
}

// 파일 업로드 처리
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        fileName.textContent = file.name;
        
        // FileReader를 사용하여 이미지를 읽고 플레이어에 적용
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage = e.target.result;
            playerAlbumArt.src = uploadedImage;
            console.log('이미지 업로드됨:', file.name);
        };
        reader.readAsDataURL(file);
    }
}

// 커스텀 커버 적용
function applyCustomCover() {
    const coverUrl = document.getElementById('coverUrl').value;
    if (coverUrl) {
        playerAlbumArt.src = coverUrl;
        uploadedImage = coverUrl;
        console.log('커버 적용:', coverUrl);
    }
}

// 원래 썸네일로 복원
function resetToOriginalCover() {
    const currentSong = spotifyResults[currentSongIndex];
    playerAlbumArt.src = currentSong.albumArt;
    uploadedImage = null;
    console.log('원래 썸네일로 복원');
}

// 채널 정보 업데이트
function updateChannelInfo() {
    const channelName = channelNameInput.value.trim();
    if (channelName) {
        channelInfo.textContent = `SING ${channelName}`;
    } else {
        channelInfo.textContent = 'SING';
    }
}

// Spotify 한국 실시간 차트 로드
async function loadHot100() {
    try {
        console.log('Spotify 한국 실시간 차트 로드 중...');
        const token = await getSpotifyToken();
        
        if (token) {
            // 방법 1: 한국 인기 트랙 직접 검색
            try {
                const response = await fetch('https://api.spotify.com/v1/search?q=year:2024&type=track&limit=20&market=KR', {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
                        const results = data.tracks.items.map(track => ({
                            id: track.id,
                            title: track.name,
                            artist: track.artists.map(artist => artist.name).join(', '),
                            albumArt: track.album.images[0]?.url || 'https://via.placeholder.com/120x120/8B5CF6/FFFFFF?text=🎵',
                            spotify: true,
                            previewUrl: track.preview_url,
                            externalUrl: track.external_urls.spotify
                        }));
                        
                        spotifyResults = results;
                        renderSearchResults();
                        console.log('2024년 한국 트랙 로드 완료:', results.length, '곡');
                        return;
                    }
                }
            } catch (error) {
                console.log('2024년 트랙 검색 실패:', error);
            }
            
            // 방법 2: 한국 차트 플레이리스트 검색
            const playlistQueries = [
                'korea top 50',
                'korean hits',
                'k-pop top',
                'korean music',
                'korea viral'
            ];
            
            for (const query of playlistQueries) {
                try {
                    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=3&market=KR`, {
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.playlists && data.playlists.items.length > 0) {
                            // 가장 관련성 높은 플레이리스트 선택
                            const playlist = data.playlists.items[0];
                            console.log('한국 플레이리스트 발견:', playlist.name);
                            await loadPlaylistTracks(playlist.id, token);
                            return;
                        }
                    }
                } catch (error) {
                    console.log(`${query} 플레이리스트 검색 실패:`, error);
                }
            }
            
            // 방법 3: 한국 아티스트 검색으로 대체
            await loadKoreanCharts(token);
            return;
        }
        
        // API 실패 시 데모 한국 차트 데이터 사용
        loadDemoKoreanCharts();
        
    } catch (error) {
        console.error('한국 차트 로드 실패:', error);
        loadDemoKoreanCharts();
    }
}

// 한국 아티스트 차트 로드
async function loadKoreanCharts(token) {
    try {
        // 한국 인기 아티스트들로 검색 (더 많은 아티스트로 확장)
        const koreanArtists = ['BTS', 'NewJeans', 'LE SSERAFIM', 'aespa', 'IVE', 'ITZY', 'NCT', 'Stray Kids', 'SEVENTEEN', 'TWICE', 'BLACKPINK', '(G)I-DLE', 'Red Velvet', 'IU', '태연'];
        const allTracks = [];
        
        for (const artist of koreanArtists.slice(0, 5)) { // 상위 5개 아티스트 검색
            try {
                const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=track&limit=4&market=KR`, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.tracks && data.tracks.items) {
                        const tracks = data.tracks.items.map(track => ({
                            id: track.id,
                            title: track.name,
                            artist: track.artists.map(artist => artist.name).join(', '),
                            albumArt: track.album.images[0]?.url || 'https://via.placeholder.com/120x120/8B5CF6/FFFFFF?text=🎵',
                            spotify: true,
                            previewUrl: track.preview_url,
                            externalUrl: track.external_urls.spotify
                        }));
                        allTracks.push(...tracks);
                    }
                }
            } catch (error) {
                console.log(`${artist} 검색 실패:`, error);
            }
        }
        
        if (allTracks.length > 0) {
            spotifyResults = allTracks.slice(0, 20); // 최대 20개
            renderSearchResults();
            console.log('한국 아티스트 차트 로드 완료:', allTracks.length, '곡');
            return;
        }
        
        loadDemoKoreanCharts();
        
    } catch (error) {
        console.error('한국 아티스트 차트 로드 실패:', error);
        loadDemoKoreanCharts();
    }
}

// 한국 차트 강제 업데이트 함수
async function forceUpdateKoreanCharts() {
    try {
        console.log('한국 차트 강제 업데이트 시작...');
        const token = await getSpotifyToken();
        
        if (token) {
            // 최신 한국 트랙 검색
            const response = await fetch('https://api.spotify.com/v1/search?q=year:2024&type=track&limit=20&market=KR', {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
                    const results = data.tracks.items.map(track => ({
                        id: track.id,
                        title: track.name,
                        artist: track.artists.map(artist => artist.name).join(', '),
                        albumArt: track.album.images[0]?.url || 'https://via.placeholder.com/120x120/8B5CF6/FFFFFF?text=🎵',
                        spotify: true,
                        previewUrl: track.preview_url,
                        externalUrl: track.external_urls.spotify
                    }));
                    
                    spotifyResults = results;
                    renderSearchResults();
                    console.log('한국 차트 강제 업데이트 완료:', results.length, '곡');
                    return true;
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error('한국 차트 강제 업데이트 실패:', error);
        return false;
    }
}

// 플레이리스트 트랙 로드
async function loadPlaylistTracks(playlistId, token) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20&market=KR`, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.items) {
                const results = data.items.map(item => ({
                    id: item.track.id,
                    title: item.track.name,
                    artist: item.track.artists.map(artist => artist.name).join(', '),
                    albumArt: item.track.album.images[0]?.url || 'https://via.placeholder.com/120x120/8B5CF6/FFFFFF?text=🎵',
                    spotify: true,
                    previewUrl: item.track.preview_url,
                    externalUrl: item.track.external_urls.spotify
                }));
                
                spotifyResults = results;
                renderSearchResults();
                console.log('Spotify 핫100 로드 완료:', results.length, '곡');
                return;
            }
        }
        
        loadDemoKoreanCharts();
        
    } catch (error) {
        console.error('플레이리스트 트랙 로드 실패:', error);
        loadDemoKoreanCharts();
    }
}

// 데모 한국 차트 데이터 로드
function loadDemoKoreanCharts() {
    const koreanCharts = [
        { id: "kr1", title: "Dynamite", artist: "BTS", albumArt: "https://via.placeholder.com/120x120/54A0FF/FFFFFF?text=DY" },
        { id: "kr2", title: "Butter", artist: "BTS", albumArt: "https://via.placeholder.com/120x120/FD79A8/FFFFFF?text=BT" },
        { id: "kr3", title: "Permission to Dance", artist: "BTS", albumArt: "https://via.placeholder.com/120x120/FF6B6B/FFFFFF?text=PTD" },
        { id: "kr4", title: "Hype Boy", artist: "NewJeans", albumArt: "https://via.placeholder.com/120x120/4ECDC4/FFFFFF?text=HB" },
        { id: "kr5", title: "Attention", artist: "NewJeans", albumArt: "https://via.placeholder.com/120x120/45B7D1/FFFFFF?text=AT" },
        { id: "kr6", title: "Cookie", artist: "NewJeans", albumArt: "https://via.placeholder.com/120x120/96CEB4/FFFFFF?text=CO" },
        { id: "kr7", title: "FEARLESS", artist: "LE SSERAFIM", albumArt: "https://via.placeholder.com/120x120/FFEAA7/FFFFFF?text=FL" },
        { id: "kr8", title: "ANTIFRAGILE", artist: "LE SSERAFIM", albumArt: "https://via.placeholder.com/120x120/DDA0DD/FFFFFF?text=AF" },
        { id: "kr9", title: "Next Level", artist: "aespa", albumArt: "https://via.placeholder.com/120x120/98D8C8/FFFFFF?text=NL" },
        { id: "kr10", title: "Savage", artist: "aespa", albumArt: "https://via.placeholder.com/120x120/F7DC6F/FFFFFF?text=SV" },
        { id: "kr11", title: "ELEVEN", artist: "IVE", albumArt: "https://via.placeholder.com/120x120/FF9FF3/FFFFFF?text=EL" },
        { id: "kr12", title: "LOVE DIVE", artist: "IVE", albumArt: "https://via.placeholder.com/120x120/5F27CD/FFFFFF?text=LD" },
        { id: "kr13", title: "WANNABE", artist: "ITZY", albumArt: "https://via.placeholder.com/120x120/00D2D3/FFFFFF?text=WB" },
        { id: "kr14", title: "LOCO", artist: "ITZY", albumArt: "https://via.placeholder.com/120x120/FF6348/FFFFFF?text=LC" },
        { id: "kr15", title: "Kick It", artist: "NCT 127", albumArt: "https://via.placeholder.com/120x120/2ED573/FFFFFF?text=KI" },
        { id: "kr16", title: "Sticker", artist: "NCT 127", albumArt: "https://via.placeholder.com/120x120/FFA502/FFFFFF?text=ST" },
        { id: "kr17", title: "God's Menu", artist: "Stray Kids", albumArt: "https://via.placeholder.com/120x120/FF3838/FFFFFF?text=GM" },
        { id: "kr18", title: "Thunderous", artist: "Stray Kids", albumArt: "https://via.placeholder.com/120x120/FF9F43/FFFFFF?text=TH" },
        { id: "kr19", title: "Left & Right", artist: "SEVENTEEN", albumArt: "https://via.placeholder.com/120x120/6C5CE7/FFFFFF?text=LR" },
        { id: "kr20", title: "HOT", artist: "SEVENTEEN", albumArt: "https://via.placeholder.com/120x120/A29BFE/FFFFFF?text=HT" }
    ];
    
    spotifyResults = koreanCharts;
    renderSearchResults();
    console.log('데모 한국 차트 로드 완료:', koreanCharts.length, '곡');
}

// 카드 색상 적용
function applyCardColor() {
    const color = cardColorInput.value;
    const darkerColor = adjustBrightness(color, -20); // 더 어두운 색상 생성
    
    document.documentElement.style.setProperty('--card-color', color);
    document.documentElement.style.setProperty('--player-card-color', color);
    document.documentElement.style.setProperty('--player-card-color-dark', darkerColor);
    
    // 기존 카드들의 색상도 즉시 업데이트
    const cards = document.querySelectorAll('.song-card');
    cards.forEach(card => {
        card.style.setProperty('--card-color', color);
    });
    
    console.log('카드 색상 적용됨:', color);
}

// 색상 밝기 조정 함수
function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Spotify API 토큰 가져오기
async function getSpotifyToken() {
    try {
        console.log('Spotify 토큰 요청 중...');
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
            },
            body: 'grant_type=client_credentials'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('토큰 응답:', data);
        
        if (data.access_token) {
            console.log('토큰 획득 성공');
            return data.access_token;
        } else {
            console.error('토큰 응답에 access_token 없음:', data);
            return null;
        }
    } catch (error) {
        console.error('Spotify 토큰 가져오기 실패:', error);
        return null;
    }
}

// Spotify API로 검색
async function searchSpotify(query, token) {
    try {
        console.log('Spotify API 검색 요청:', query);
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20&market=KR`, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Spotify API 응답:', data);
        
        if (data.tracks && data.tracks.items) {
            const results = data.tracks.items.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                albumArt: track.album.images[0]?.url || 'https://via.placeholder.com/120x120/8B5CF6/FFFFFF?text=🎵',
                spotify: true,
                previewUrl: track.preview_url,
                externalUrl: track.external_urls.spotify
            }));
            console.log('변환된 검색 결과:', results);
            return results;
        } else {
            console.log('검색 결과 없음');
            return [];
        }
    } catch (error) {
        console.error('Spotify 검색 실패:', error);
        return [];
    }
}

// 검색 수행
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    currentArtist.textContent = query;
    
    // 로딩 상태 표시
    searchResults.innerHTML = '<div class="loading">검색 중...</div>';
    
    try {
        // Spotify API 사용 가능한지 확인
        if (SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET && 
            SPOTIFY_CLIENT_ID !== 'your_spotify_client_id' && 
            SPOTIFY_CLIENT_SECRET !== 'your_spotify_client_secret') {
            
            console.log('Spotify API 사용 시도 중...');
            const token = await getSpotifyToken();
            
            if (token) {
                console.log('토큰 획득 성공, 검색 시작...');
                const results = await searchSpotify(query, token);
                
                if (results && results.length > 0) {
                    spotifyResults = results;
                    renderSearchResults();
                    console.log('Spotify API 검색 완료:', query, '결과 수:', results.length);
                    return;
                } else {
                    console.log('Spotify API 검색 결과 없음, 데모 데이터 사용');
                }
            } else {
                console.log('토큰 획득 실패, 데모 데이터 사용');
            }
        } else {
            console.log('API 키 미설정, 데모 데이터 사용');
        }
        
        // API 사용 불가능하거나 결과가 없을 때 데모 데이터 사용
        if (query.toLowerCase().includes('iu') || query.toLowerCase().includes('아이유')) {
            spotifyResults = [...defaultResults];
        } else {
            spotifyResults = generateDemoResults(query);
        }
        
        renderSearchResults();
        console.log('데모 검색 완료:', query);
        
    } catch (error) {
        console.error('검색 오류:', error);
        // 오류 시 기본 결과 표시
        spotifyResults = [...defaultResults];
        renderSearchResults();
        
        // 사용자에게 오류 알림
        alert('검색 중 오류가 발생했습니다. 데모 데이터를 표시합니다.');
    }
}

// 데모 검색 결과 생성
function generateDemoResults(query) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const results = [];
    
    for (let i = 1; i <= 12; i++) {
        results.push({
            id: `demo_${i}`,
            title: `${query} Song ${i}`,
            artist: query,
            albumArt: `https://via.placeholder.com/120x120/${colors[i % colors.length].substring(1)}/FFFFFF?text=${i}`,
            spotify: true
        });
    }
    
    return results;
}

// 키보드 단축키
document.addEventListener('keydown', (event) => {
    switch(event.code) {
        case 'Space':
            event.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft':
            event.preventDefault();
            playPrevious();
            break;
        case 'ArrowRight':
            event.preventDefault();
            playNext();
            break;
    }
});
