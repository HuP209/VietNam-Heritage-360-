
class VRTravelApp {
    constructor() {
        this.currentLocation = null;
        this.map = null;
        this.mode = 'hero'; // 'hero', 'map', 'story', 'vr'
        
        // Flow container
        this.heroView = document.getElementById('hero-view');
        this.mapView = document.getElementById('map-view');
        
        // Absolute Views
        this.storyView = document.getElementById('story-view');
        this.vrView = document.getElementById('vr-view');
        this.transitionOverlay = document.getElementById('transition-overlay');
        
        // Story Elements
        this.storyBg = document.getElementById('story-bg');
        this.storyTitle = document.getElementById('story-title');
        this.storyHook = document.getElementById('story-hook');
        this.storyDesc = document.getElementById('story-desc');
        this.storyContent = document.querySelector('.story-content');
        
        // VR Elements
        this.vrIframe = document.getElementById('vr-iframe');
        this.vrLocationName = document.getElementById('vr-location-name');
        this.guideText = document.getElementById('guide-text');
        this.vrLoading = document.getElementById('vr-loading');
        
        // Buttons
        this.btnExplore = document.getElementById('btn-explore');
        this.btnBackStory = document.getElementById('btn-back-story');
        this.btnStartVr = document.getElementById('btn-start-vr');
        this.btnBackVr = document.getElementById('btn-back-vr');
        
        // Map controls
        this.btnZoomIn = document.getElementById('btn-zoom-in');
        this.btnZoomOut = document.getElementById('btn-zoom-out');
        
        // Header
        this.appHeader = document.querySelector('.app-header');
        this.videoToggleBtn = document.getElementById('video-toggle-btn');
        
        // Dashboard
        this.dashboardOverlay = document.getElementById('dashboard-overlay');
        this.btnShowDashboard = document.getElementById('btn-show-dashboard');
        this.btnCloseDashboard = document.getElementById('btn-close-dashboard');
        
        // Memorial elements
        this.memorialMessage = document.getElementById('memorial-message');
        
        // Charts Reference
        this.charts = {};
        this.dashboardDataInterval = null;
        
        // Visit Tracking (User interaction based)
        this.visitCounts = JSON.parse(localStorage.getItem('vn_heritage_visits')) || {};
        this.initializeVisitData();

        // Rating Feature State
        // Cho phép người dùng đánh giá tiếp ở các lượt truy cập sau (reload) thay vì khóa vĩnh viễn
        this.userHasRated = false;
        
        let savedRatings = localStorage.getItem('vn_heritage_ratings_v6');
        if (!savedRatings) {
            // Khởi tạo dữ liệu cơ bản để mô phỏng một hệ thống đã có người đánh giá
            this.ratingData = [5, 15, 60, 240, 480]; 
            localStorage.setItem('vn_heritage_ratings_v6', JSON.stringify(this.ratingData));
        } else {
            this.ratingData = JSON.parse(savedRatings);
        }

        this.realTimeInterval = null;
        
        // Rating Elements
        this.ratingContainer = document.getElementById('rating-container');
        this.chartResultContainer = document.getElementById('chart-result-container');
        this.kpiRating = document.getElementById('kpi-rating');
        
        window.vrAppInstance = this;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    initMap() {
        if (this.map) return;
        
        // Vietnam Bounds (prevent zooming out of Vietnam too much)
        const southWest = L.latLng(7.0, 100.0);
        const northEast = L.latLng(24.0, 118.0);
        const bounds = L.latLngBounds(southWest, northEast);
        
        this.map = L.map('leaflet-map', {
            center: [16.0, 106.0],
            zoom: 6,
            zoomControl: false,
            scrollWheelZoom: true, // Allow wheel zoom
            minZoom: 5,
            maxZoom: 12,
            maxBounds: bounds,
            maxBoundsViscosity: 1.0 // Bounce back when dragging out
        });

        // Dark Matter Base
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(this.map);

        // Sử dụng dữ liệu GeoJSON chất lượng cao (đã load từ vietnam_highres.js)
        try {
            if (typeof vnHighResData === 'undefined') throw new Error("Missing High-Res GeoJSON data");

            // 1. Lấy đa giác lớn nhất (đất liền) từ high-res GeoJSON
            let mainlandCoords = [];
            let maxLen = 0;
            
            const geom = vnHighResData.features[0].geometry;
            const polys = geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates];
            
            polys.forEach(poly => {
                if (poly[0].length > maxLen) {
                    maxLen = poly[0].length;
                    mainlandCoords = poly[0];
                }
            });

            // 2. Tìm điểm Móng Cái (Bắc/Đông Bắc) và Hà Tiên (Tây Nam)
            let mongCaiIdx = 0, haTienIdx = 0;
            let minDistMC = 9999, minDistHT = 9999;
            
            mainlandCoords.forEach((coord, idx) => {
                const distMC = Math.pow(coord[0] - 108.05, 2) + Math.pow(coord[1] - 21.55, 2);
                if (distMC < minDistMC) { minDistMC = distMC; mongCaiIdx = idx; }
                
                const distHT = Math.pow(coord[0] - 104.45, 2) + Math.pow(coord[1] - 10.38, 2);
                if (distHT < minDistHT) { minDistHT = distHT; haTienIdx = idx; }
            });

            // 3. Tách lấy phần đường biên giới đất liền (phía Tây)
            let path1, path2;
            if (mongCaiIdx < haTienIdx) {
                path1 = mainlandCoords.slice(mongCaiIdx, haTienIdx + 1);
                path2 = [...mainlandCoords.slice(haTienIdx), ...mainlandCoords.slice(0, mongCaiIdx + 1)];
            } else {
                path1 = mainlandCoords.slice(haTienIdx, mongCaiIdx + 1);
                path2 = [...mainlandCoords.slice(mongCaiIdx), ...mainlandCoords.slice(0, haTienIdx + 1)];
            }
            
            // Kiểm tra mảng nào chứa biên giới phía Tây (Gần Điện Biên Phủ ~ 103.0, 21.3)
            let isPath1Border = false;
            path1.forEach(coord => {
                if (coord[0] < 103.5 && coord[1] > 20.5) isPath1Border = true;
            });
            
            let landBorder = isPath1Border ? path1 : path2;
            
            // 4. Chỉ vẽ viền màu tím đứt nét ở biên giới đất liền tiếp giáp các nước (landBorder)
            // Không vẽ bờ biển, không vẽ biển, không làm tối các nước láng giềng
            const customGeoJSON = {
                "type": "Feature",
                "geometry": { 
                    "type": "LineString", 
                    "coordinates": landBorder 
                }
            };

            L.geoJSON(customGeoJSON, {
                style: {
                    color: '#a855f7', // Màu tím
                    weight: 2.5,
                    opacity: 0.9,
                    dashArray: '5, 5', 
                    className: 'vietnam-border'
                }
            }).addTo(this.map);
        } catch(err) {
            console.log('Lỗi vẽ viền biên giới:', err);
        }

        this.renderMarkers();
        
        // Force resize calculation
        setTimeout(() => this.map.invalidateSize(), 100);
    }
    
    renderMarkers() {
        locations.forEach(loc => {
            const isIsland = loc.isIsland;
            
            const isSovereignty = loc.id === 'hoang_sa_island' || loc.id === 'truong_sa_island';
            const isOtherIsland = loc.isIsland && !isSovereignty;

            const customIcon = L.divIcon({
                className: isSovereignty ? 'custom-marker island-marker' : 
                          (isOtherIsland ? 'custom-marker island-dot-marker' : 'custom-marker'),
                html: isSovereignty ? `
                    <div class="flag-pole"></div>
                    <div class="island-flag"></div>
                    <div class="marker-core"></div>
                    <div class="marker-pulse"></div>
                ` : `
                    <div class="marker-core"></div>
                    <div class="marker-pulse"></div>
                `,
                iconSize: isSovereignty ? [20, 20] : (isOtherIsland ? [15, 15] : [40, 40]),
                iconAnchor: isSovereignty ? [10, 10] : (isOtherIsland ? [7, 7] : [20, 20])
            });

            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(this.map);
            
            if (isSovereignty) {
                // Permanent label for Hoang Sa / Truong Sa
                marker.bindTooltip(loc.name, {
                    permanent: true,
                    direction: 'right',
                    className: 'island-tooltip',
                    offset: [10, 0]
                });
            } else {
                marker.bindTooltip(loc.name, {
                    permanent: false,
                    direction: 'top',
                    className: 'custom-tooltip',
                    offset: [0, -10]
                });
            }

            marker.on('click', () => {
                if (this.mode === 'vr' || this.mode === 'story') return; // Prevent double click
                
                // Track visit (Record click)
                this.recordVisit(loc.id);
                
                // Zoom in effect before transition
                this.map.flyTo([loc.lat, loc.lng], 9, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
                
                setTimeout(() => {
                    this.fadeToView(this.storyView, () => this.openStory(loc));
                }, 1000);
            });

            // Add decorative island cluster ONLY for Hoang Sa / Truong Sa
            if (isSovereignty) {
                this.addDecorativeIslands(loc.lat, loc.lng, loc.id === 'hoang_sa_island' ? 15 : 30);
            }
        });
    }

    addDecorativeIslands(centerLat, centerLng, count) {
        const spread = count > 20 ? 2.5 : 1.2; // wider for Truong Sa
        for (let i = 0; i < count; i++) {
            const latOff = (Math.random() - 0.5) * spread;
            const lngOff = (Math.random() - 0.5) * spread;
            
            L.circle([centerLat + latOff, centerLng + lngOff], {
                radius: 800 + Math.random() * 2500,
                color: '#FADB5F',
                weight: 0,
                fillColor: '#FADB5F',
                fillOpacity: 0.15 + Math.random() * 0.35,
                className: 'decorative-island-glow'
            }).addTo(this.map);
        }
    }
    
    bindEvents() {
        // Hero to Map
        this.btnExplore.addEventListener('click', () => {
            if (!this.map) this.initMap();
            // Cinematic Transition fade
            this.fadeToView(this.mapView, () => {
                this.mode = 'map';
                document.body.classList.add('map-active');
            });
        });
        
        // Map controls
        this.btnZoomIn.addEventListener('click', () => {
            if(this.map) this.map.zoomIn();
        });
        this.btnZoomOut.addEventListener('click', () => {
            if(this.map) this.map.zoomOut();
        });

        // Story to Map
        this.btnBackStory.addEventListener('click', () => {
            this.fadeToView(this.mapView, () => {
                this.mode = 'map';
                document.body.classList.add('map-active');
                this.map.flyTo([16.0, 106.0], 6, {duration: 1});
            });
        });
        
        // Story to VR or Memorial
        this.btnStartVr.addEventListener('click', () => {
            const isSovereignty = this.currentLocation && 
                                (this.currentLocation.id === 'hoang_sa_island' || 
                                 this.currentLocation.id === 'truong_sa_island');

            if (isSovereignty) {
                // Island memorial interaction (Only for HS/TS)
                this.btnStartVr.style.opacity = '0';
                setTimeout(() => {
                    this.btnStartVr.style.display = 'none';
                    this.memorialMessage.style.display = 'block';
                    setTimeout(() => {
                        this.memorialMessage.style.opacity = '1';
                    }, 50);
                }, 1000);
            } else {
                // Check if location requires opening in a new tab (bypasses security blocks)
                if (this.currentLocation && this.currentLocation.forceNewTab) {
                    window.open(this.currentLocation.vrLink, '_blank');
                } else {
                    // Standard internal VR view for other locations
                    this.fadeToView(this.vrView, () => this.openVR());
                }
            }
        });
        
        // VR to Map
        this.btnBackVr.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Back VR Clicked!");
            
            this.mode = 'map';
            this.currentLocation = null;
            this.vrIframe.src = ''; 
            this.vrView.classList.remove('vr-loaded');
            document.body.classList.remove('in-vr');
            document.body.classList.add('map-active');
            
            this.fadeToView(this.mapView, () => {
                // Return to main map view smoothly
                if (this.map) {
                    try {
                        this.map.flyTo([16.0, 106.0], 6, {duration: 1});
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        });
        
        // Handle Iframe Load
        this.vrIframe.addEventListener('load', () => {
            if(!this.vrIframe.src || this.vrIframe.src === window.location.href) return;
            
            setTimeout(() => {
                this.vrLoading.style.opacity = '0';
                this.vrView.classList.add('vr-loaded'); 
                setTimeout(() => {
                    this.vrLoading.style.display = 'none';
                }, 800);
            }, 1000);
        });

        // Dashboard Toggle
        this.btnShowDashboard.addEventListener('click', () => {
            this.dashboardOverlay.classList.add('active');
            document.body.classList.add('dashboard-active');
            this.initDashboard();
        });
        
        this.btnCloseDashboard.addEventListener('click', () => {
            this.dashboardOverlay.classList.remove('active');
            document.body.classList.remove('dashboard-active');
            if (this.dashboardDataInterval) clearInterval(this.dashboardDataInterval);
        });
        
        // Close dashboard with Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dashboardOverlay.classList.contains('active')) {
                this.dashboardOverlay.classList.remove('active');
            }
        });

        // Emoji Rating Events
        const emojiBtns = document.querySelectorAll('.emoji-btn');
        emojiBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const score = parseInt(btn.getAttribute('data-score'));
                this.handleRating(score);
            });
        });
        
        // Handle Window Resize
        window.addEventListener('resize', () => {
            if(this.map) this.map.invalidateSize();
        });

        // Search Panel
        this.initSearch();

        // Video Panel
        this.initVideoPanel();
    }

    initSearch() {
        const panel      = document.getElementById('search-panel');
        const backdrop   = document.getElementById('search-backdrop');
        const toggleBtn  = document.getElementById('btn-search-toggle');
        const input      = document.getElementById('search-input');
        const clearBtn   = document.getElementById('search-clear-btn');
        const list       = document.getElementById('search-results-list');
        const countLabel = document.getElementById('search-count');

        if (!panel || !toggleBtn) return;

        let isOpen = false;
        let focusedIdx = -1;

        const sovereigntyIds = ['hoang_sa_island', 'truong_sa_island'];

        // --- Build full location list from data.js `locations` ---
        const allLocations = typeof locations !== 'undefined' ? locations : [];

        // --- Render items with optional highlight ---
        const renderList = (query = '') => {
            const q = query.trim().toLowerCase();
            const allLocations = typeof locations !== 'undefined' ? locations : [];
            const allVideos    = typeof videoData !== 'undefined' ? videoData : [];

            const filteredLocs = q
                ? allLocations.filter(l => l.name.toLowerCase().includes(q) || (l.region && l.region.toLowerCase().includes(q)))
                : allLocations;

            const filteredVids = q
                ? allVideos.filter(v => v.keywords.some(k => k.includes(q)) || v.title.toLowerCase().includes(q))
                : allVideos;

            list.innerHTML = '';
            focusedIdx = -1;

            const hasLoc = filteredLocs.length > 0;
            const hasVid = filteredVids.length > 0;

            if (!hasLoc && !hasVid) {
                list.innerHTML = `<li class="search-no-results">Không tìm thấy kết quả nào.</li>`;
                countLabel.textContent = '0 kết quả';
                return;
            }

            const total = filteredLocs.length + filteredVids.length;
            countLabel.textContent = q ? `${total} kết quả` : `Tất cả địa danh (${filteredLocs.length})`;

            // Section: Locations
            if (hasLoc) {
                if (q && hasVid) {
                    const secLoc = document.createElement('li');
                    secLoc.className = 'search-section-label';
                    secLoc.innerHTML = '📍 Địa danh';
                    list.appendChild(secLoc);
                }
                filteredLocs.forEach(loc => {
                    const isSov = ['hoang_sa_island','truong_sa_island'].includes(loc.id);
                    let displayName = loc.name;
                    if (q) {
                        const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                        displayName = loc.name.replace(re, '<span class="search-highlight">$1</span>');
                    }
                    const li = document.createElement('li');
                    li.className = 'search-result-item';
                    li.setAttribute('role', 'option');
                    li.innerHTML = `
                        <span class="search-item-dot${isSov ? ' sovereignty' : ''}"></span>
                        <span class="search-item-text">
                            <span class="search-item-name">${displayName}</span>
                            <span class="search-item-region">${loc.region || ''}</span>
                        </span>`;
                    li.addEventListener('click', () => this.searchSelect(loc));
                    list.appendChild(li);
                });
            }

            // Section: Videos
            if (hasVid) {
                const secVid = document.createElement('li');
                secVid.className = 'search-section-label';
                secVid.innerHTML = '🎥 Video lịch sử';
                list.appendChild(secVid);

                filteredVids.forEach(vid => {
                    let displayTitle = vid.title;
                    if (q) {
                        const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                        displayTitle = vid.title.replace(re, '<span class="search-highlight">$1</span>');
                    }
                    const li = document.createElement('li');
                    li.className = 'search-result-item video-item';
                    li.setAttribute('role', 'option');
                    li.innerHTML = `
                        <span class="search-item-dot">
                            <img src="https://img.youtube.com/vi/${vid.youtubeId}/default.jpg" alt="" loading="lazy">
                        </span>
                        <span class="search-item-text">
                            <span class="search-item-name">${displayTitle}</span>
                            <span class="search-item-region">${vid.description ? vid.description.slice(0,45)+'...' : ''}</span>
                        </span>`;
                    li.addEventListener('click', () => {
                        if (this._closeSearch) this._closeSearch();
                        this.openVideoFromSearch(vid);
                    });
                    list.appendChild(li);
                });
            }
        };

        // --- Open / Close panel ---
        const openPanel = () => {
            isOpen = true;
            panel.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
            backdrop.classList.add('active');
            toggleBtn.classList.add('active');
            renderList('');
            setTimeout(() => input.focus(), 180);
        };

        const closePanel = () => {
            isOpen = false;
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
            backdrop.classList.remove('active');
            toggleBtn.classList.remove('active');
            input.value = '';
            clearBtn.classList.remove('visible');
            countLabel.textContent = 'Tất cả địa danh';
            list.innerHTML = '';
            focusedIdx = -1;
        };

        toggleBtn.addEventListener('click', () => isOpen ? closePanel() : openPanel());
        backdrop.addEventListener('click', () => closePanel());

        // --- Typing ---
        input.addEventListener('input', () => {
            const q = input.value;
            clearBtn.classList.toggle('visible', q.length > 0);
            renderList(q);
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.classList.remove('visible');
            renderList('');
            input.focus();
        });

        // --- Keyboard navigation ---
        input.addEventListener('keydown', (e) => {
            const items = list.querySelectorAll('.search-result-item');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                focusedIdx = Math.min(focusedIdx + 1, items.length - 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                focusedIdx = Math.max(focusedIdx - 1, 0);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const target = focusedIdx >= 0 ? items[focusedIdx] : items[0];
                if (target) target.click();
                return;
            } else if (e.key === 'Escape') {
                closePanel();
                return;
            }
            items.forEach((el, i) => el.classList.toggle('focused', i === focusedIdx));
            if (items[focusedIdx]) items[focusedIdx].scrollIntoView({ block: 'nearest' });
        });

        // Store for external access
        this._closeSearch = closePanel;
    }

    searchSelect(loc) {
        // 1. Đóng panel
        if (this._closeSearch) this._closeSearch();

        // 2. Đảm bảo đang ở map view
        if (this.mode !== 'map') {
            this.fadeToView(this.mapView, () => {
                this.mode = 'map';
                this._searchFlyAndOpen(loc);
            });
        } else {
            this._searchFlyAndOpen(loc);
        }
    }

    _searchFlyAndOpen(loc) {
        if (!this.map) this.initMap();
        this.recordVisit(loc.id);

        // Zoom + pan to location
        this.map.flyTo([loc.lat, loc.lng], 9, {
            duration: 1.2,
            easeLinearity: 0.2
        });

        // After animation, fade into story view
        setTimeout(() => {
            this.fadeToView(this.storyView, () => this.openStory(loc));
        }, 1100);
    }

    // =========================================
    // VIDEO PANEL SYSTEM
    // =========================================

    initVideoPanel() {
        const panel      = document.getElementById('video-panel');
        const toggleBtn  = document.getElementById('video-toggle-btn');
        const closeBtn   = document.getElementById('video-panel-close');
        const carousel   = document.getElementById('video-carousel');
        const overlay    = document.getElementById('video-overlay');
        const backdrop   = document.getElementById('video-overlay-backdrop');
        const closeVidBtn= document.getElementById('video-close-btn');
        const iframe     = document.getElementById('video-iframe');

        if (!panel || !toggleBtn) return;

        // Store refs
        this._videoPanel   = panel;
        this._videoOverlay = overlay;
        this._videoIframe  = iframe;
        this._videoPanelOpen = false;

        // Render carousel cards
        this._renderCarousel(carousel);

        // Toggle open/close
        const openPanel = () => {
            this._videoPanelOpen = true;
            panel.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
            toggleBtn.classList.add('active');
        };
        const closePanelFn = () => {
            this._videoPanelOpen = false;
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
            toggleBtn.classList.remove('active');
        };
        this._closeVideoPanel = closePanelFn;

        toggleBtn.addEventListener('click', () =>
            this._videoPanelOpen ? closePanelFn() : openPanel()
        );
        closeBtn.addEventListener('click', closePanelFn);

        // Close when clicking outside panel (but ignore clicks on video player overlay)
        document.addEventListener('click', (e) => {
            if (this._videoPanelOpen &&
                !panel.contains(e.target) &&
                !overlay.contains(e.target) && // Don't close panel if interacting with video player
                e.target !== toggleBtn &&
                !toggleBtn.contains(e.target)) {
                closePanelFn();
            }
        });

        // Drag-to-scroll carousel
        let isDragging = false, startX = 0, scrollLeft = 0;
        carousel.addEventListener('mousedown', e => {
            isDragging = true;
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
            carousel.style.cursor = 'grabbing';
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
            carousel.style.cursor = 'grab';
        });
        carousel.addEventListener('mousemove', e => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            carousel.scrollLeft = scrollLeft - (x - startX) * 1.5;
        });

        // Horizontal scroll via mouse wheel
        carousel.addEventListener('wheel', e => {
            e.preventDefault();
            carousel.scrollLeft += e.deltaY * 1.2;
        }, { passive: false });

        // Video overlay close buttons
        closeVidBtn.addEventListener('click', () => this.closeVideoPlayer());
        backdrop.addEventListener('click', () => this.closeVideoPlayer());

        // Keyboard ESC to close overlay
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                this.closeVideoPlayer();
            }
        });
    }

    _renderCarousel(carousel) {
        const allVideos = typeof videoData !== 'undefined' ? videoData : [];
        carousel.innerHTML = '';
        allVideos.forEach(vid => {
            const loc = vid.locationId
                ? (typeof locations !== 'undefined' ? locations.find(l => l.id === vid.locationId) : null)
                : null;
            const locLabel = loc ? loc.name : (vid.lat ? '📍 Vị trí liên quan' : '');

            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="video-thumb">
                    <img src="https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg"
                         alt="${vid.title}" loading="lazy">
                    <div class="video-play-overlay">
                        <div class="video-play-btn">
                            <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                        </div>
                    </div>
                </div>
                <div class="video-card-body">
                    <div class="video-card-title">${vid.title}</div>
                    ${locLabel ? `<div class="video-card-loc">📍 ${locLabel}</div>` : ''}
                </div>`;

            card.addEventListener('click', () => this.openVideoPlayer(vid));
            carousel.appendChild(card);
        });
    }

    openVideoPlayer(vid) {
        // Vẫn giữ hiệu ứng đồng bộ: map tự động di chuyển đến vị trí liên quan
        if (this.map && vid.locationId) {
            const loc = typeof locations !== 'undefined'
                ? locations.find(l => l.id === vid.locationId) : null;
            if (loc) {
                this.map.flyTo([loc.lat, loc.lng], 7, {
                    duration: 1.4, easeLinearity: 0.3
                });
            }
        } else if (this.map && vid.lat && vid.lng) {
            this.map.flyTo([vid.lat, vid.lng], 7, {
                duration: 1.4, easeLinearity: 0.3
            });
        }

        // Mở thẳng video sang tab mới trên YouTube (Khắc phục triệt để Lỗi 153 trên môi trường file://)
        const youtubeUrl = `https://www.youtube.com/watch?v=${vid.youtubeId}`;
        window.open(youtubeUrl, '_blank');
    }

    closeVideoPlayer() {
        const overlay = this._videoOverlay;
        const iframe  = this._videoIframe;
        if (!overlay) return;

        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        // Stop video by clearing src
        setTimeout(() => { if (iframe) iframe.src = ''; }, 300);
    }

    // Called from search result click on a video item
    openVideoFromSearch(vid) {
        // Ensure we're on map view first
        if (this.mode !== 'map') {
            this.fadeToView(this.mapView, () => {
                this.mode = 'map';
                setTimeout(() => this.openVideoPlayer(vid), 400);
            });
        } else {
            this.openVideoPlayer(vid);
        }
    }

    fadeToView(targetView, callback) {
        // Show black overlay
        if (this.transitionOverlay) {
            this.transitionOverlay.classList.add('active');
        }
        
        setTimeout(() => {
            // Hide all absolute views
            this.heroView.classList.remove('active');
            this.mapView.classList.remove('active');
            this.storyView.classList.remove('active');
            this.vrView.classList.remove('active');
            
            // Header and Chat visibility logic
            if (targetView === this.heroView) {
                this.appHeader.classList.remove('visible');
                this.appHeader.classList.remove('compact');
                const widget = document.getElementById('ai-chat-widget');
                if (widget) widget.style.display = 'none';
            } else {
                this.appHeader.classList.add('visible');
                // Tự động thu gọn header khi vào Story View để không che nút Quay lại
                if (targetView === this.storyView || targetView === this.vrView) {
                    this.appHeader.classList.add('compact');
                } else {
                    this.appHeader.classList.remove('compact');
                }
                const widget = document.getElementById('ai-chat-widget');
                if (widget) widget.style.display = 'flex';
            }
            
            // Ẩn/Hiện nút Video tùy theo View
            if (this.videoToggleBtn) {
                if (targetView === this.storyView || targetView === this.vrView || targetView === this.heroView) {
                    this.videoToggleBtn.style.display = 'none';
                } else {
                    this.videoToggleBtn.style.display = 'flex';
                }
            }
            
            // Execute callback (e.g. data setting)
            if(callback) callback();
            
            // Show target
            targetView.classList.add('active');
            
            // Hide black overlay
            setTimeout(() => {
                if (this.transitionOverlay) {
                    this.transitionOverlay.classList.remove('active');
                }
                if (this.map && targetView === this.mapView) {
                    this.map.invalidateSize();
                }
            }, 500);
            
        }, 800); // 800ms match CSS transition
    }
    
    openStory(location) {
        this.mode = 'story';
        this.currentLocation = location;
        
        // Set Data
        this.storyBg.style.backgroundImage = `url(${location.image})`;
        this.storyTitle.textContent = location.name;
        this.storyHook.textContent = `"${location.hook}"`;
        this.storyDesc.textContent = location.description;
        
        // Reset Memorial state
        this.memorialMessage.style.display = 'none';
        this.memorialMessage.style.opacity = '0';
        this.btnStartVr.style.display = 'inline-block';
        this.btnStartVr.style.opacity = '1';
        
        const isSovereignty = location.id === 'hoang_sa_island' || location.id === 'truong_sa_island';
        if (isSovereignty) {
            this.btnStartVr.textContent = '✦ Tưởng Niệm Các Anh Hùng ✦';
        } else {
            this.btnStartVr.textContent = '✦ Bắt Đầu Hành Trình ✦';
        }
        
        // Reset animations
        this.storyContent.classList.remove('animate-in');
        
        // Trigger animation after slight delay
        setTimeout(() => {
            this.storyContent.classList.add('animate-in');
        }, 300);
    }
    
    initDashboard() {
        // Reset and show initial data
        this.updateDashboardData();
        
        // Handle Rating vs Chart Visibility
        if (this.userHasRated) {
            this.ratingContainer.style.display = 'none';
            this.chartResultContainer.style.display = 'block';
            this.chartResultContainer.style.opacity = '1';
        } else {
            this.ratingContainer.style.display = 'flex';
            this.ratingContainer.style.opacity = '1';
            this.chartResultContainer.style.display = 'none';
        }

        // Wait for the scale/fade animation to finish before initializing charts
        setTimeout(() => {
            this.initDashboardCharts();
        }, 400);
    }

    updateDashboardData() {
        // Calculate dynamic weighted average
        const avgRating = this.calculateWeightedAverage();
        const popularLoc = this.getMostVisitedLocation();
        const trend = "+11.5";

        this.kpiRating.textContent = `${avgRating}/5`;
        document.getElementById('kpi-popular').textContent = popularLoc;
        document.getElementById('kpi-trend').textContent = `${trend}%`;
        
        const now = new Date();
        const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        document.getElementById('last-updated').textContent = `Cập nhật lần cuối: ${dateStr} 00:00`;
    }

    initDashboardCharts() {
        const satisfactionCanvas = document.getElementById('satisfactionChart');
        if (!satisfactionCanvas) return;

        const ctxPie = satisfactionCanvas.getContext('2d');
        const ctxBar = document.getElementById('visitsChart').getContext('2d');

        // Destroy existing charts if they exist
        if (this.charts.satisfaction) this.charts.satisfaction.destroy();
        if (this.charts.visits) this.charts.visits.destroy();

        // Satisfaction Donut Chart (5 Levels)
        this.charts.satisfaction = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['1 sao', '2 sao', '3 sao', '4 sao', '5 sao'],
                datasets: [{
                    data: [...this.ratingData],
                    backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#a3e635', '#22c55e'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                layout: { padding: 15 },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            color: '#cbd5e1', 
                            padding: 20, 
                            usePointStyle: true, 
                            font: { size: 14 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 12,
                        bodyFont: { size: 12 }
                    }
                }
            }
        });

        // Visits Bar Chart (Based on USER CLICKS)
        const regions = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];
        const regionalData = regions.map(r => {
            // Sum of clicks for all locations in this region
            return locations
                .filter(l => l.region === r)
                .reduce((sum, l) => sum + (this.visitCounts[l.id] || 0), 0);
        });

        this.charts.visits = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: regions,
                datasets: [{
                    label: 'Lượt tham quan',
                    data: regionalData,
                    backgroundColor: [
                        'rgba(250, 219, 95, 0.8)', 
                        'rgba(163, 230, 53, 0.8)', 
                        'rgba(249, 115, 22, 0.8)'
                    ],
                    borderRadius: 8,
                    hoverBackgroundColor: '#FADB5F',
                    barThickness: 50
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 30, bottom: 15, left: 10, right: 10 } }, /* More space */
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } } /* Larger font */
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#cbd5e1', font: { size: 12, weight: 'bold' } } /* Larger font */
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#FADB5F',
                        titleFont: { size: 12, weight: 'bold' },
                        bodyColor: '#fff',
                        bodyFont: { size: 11 },
                        padding: 12,
                        cornerRadius: 6,
                        displayColors: false
                    }
                }
            }
        });

        // Force a resize check just in case
        this.charts.satisfaction.resize();
        this.charts.visits.resize();
    }

    // --- VISIT TRACKING LOGIC ---
    initializeVisitData() {
        // Ensure all locations have at least some starting data
        let updated = false;
        locations.forEach(loc => {
            if (!(loc.id in this.visitCounts)) {
                this.visitCounts[loc.id] = Math.floor(Math.random() * 50) + 20;
                updated = true;
            }
        });
        
        if (updated) this.saveVisitData();
    }

    recordVisit(locationId) {
        this.visitCounts[locationId] = (this.visitCounts[locationId] || 0) + 1;
        this.saveVisitData();
    }

    saveVisitData() {
        localStorage.setItem('vn_heritage_visits', JSON.stringify(this.visitCounts));
    }

    getMostVisitedLocation() {
        let max = -1;
        let popularName = "N/A";
        locations.forEach(l => {
            const count = this.visitCounts[l.id] || 0;
            if (count > max) {
                max = count;
                popularName = l.name;
            }
        });
        return popularName;
    }

    openVR() {
        this.mode = 'vr';
        if (!this.currentLocation) return;
        
        // Show loading
        this.vrLoading.style.display = 'flex';
        this.vrLoading.style.opacity = '1';
        this.vrView.classList.remove('vr-loaded'); // Reset
        document.body.classList.add('in-vr'); // Hide header
        
        // Set Data
        this.vrLocationName.textContent = this.currentLocation.name;
        this.guideText.textContent = this.currentLocation.description;
        
        // Set iframe source ONLY NOW (Optimized loading)
        this.vrIframe.src = this.currentLocation.vrLink;
    }

    // --- RATING & REAL-TIME LOGIC ---
    handleRating(score) {
        if (this.userHasRated) return;

        // 1. Update Data
        this.ratingData[score - 1]++;
        this.userHasRated = true;

        // 2. Persist
        localStorage.setItem('vn_heritage_ratings_v6', JSON.stringify(this.ratingData));

        // 3. Transition UI
        this.ratingContainer.classList.add('fade-out');
        
        setTimeout(() => {
            this.ratingContainer.style.display = 'none';
            this.chartResultContainer.style.display = 'block';
            
            // Trigger Fade-in
            setTimeout(() => {
                this.chartResultContainer.classList.add('fade-in');
                this.updateSatisfactionChart();
                this.updateDashboardData();
            }, 50);
        }, 500);
    }

    calculateWeightedAverage() {
        let totalScore = 0;
        let totalVotes = 0;

        this.ratingData.forEach((count, index) => {
            const score = index + 1;
            totalScore += score * count;
            totalVotes += count;
        });

        if (totalVotes === 0) return "0.0";
        return (totalScore / totalVotes).toFixed(1);
    }

    updateSatisfactionChart() {
        if (this.charts.satisfaction) {
            this.charts.satisfaction.data.datasets[0].data = [...this.ratingData];
            this.charts.satisfaction.update('active');
        }
    }
}

// Ensure data.js is loaded
if (typeof locations !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new VRTravelApp();
    });
} else {
    console.error('Data not loaded. Make sure data.js is included before app.js');
}

// Global handler for inline onClick
window.handleVrBack = function() {
    console.log("Inline Back VR Clicked!");
    const app = window.vrAppInstance;
    if (app) {
        app.mode = 'map';
        app.currentLocation = null;
        app.vrIframe.src = ''; 
        app.vrView.classList.remove('vr-loaded');
        document.body.classList.remove('in-vr');
        
        app.fadeToView(app.mapView, () => {
            if (app.map) {
                try {
                    app.map.flyTo([16.0, 106.0], 6, {duration: 1});
                } catch (e) {}
            }
        });
    }
};
