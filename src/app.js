
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

        // Fetch Vietnam GeoJSON for glow
        fetch('https://raw.githubusercontent.com/TungTh/tungth.github.io/master/data/vn.json')
            .then(res => res.json())
            .then(data => {
                L.geoJSON(data, {
                    style: {
                        color: '#FADB5F',
                        weight: 2,
                        opacity: 0.8,
                        fillColor: '#FADB5F',
                        fillOpacity: 0.05,
                        className: 'vietnam-glow'
                    }
                }).addTo(this.map);
            })
            .catch(err => console.log('Không tải được GeoJSON', err));

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
                const widget = document.getElementById('ai-chat-widget');
                if (widget) widget.style.display = 'none';
            } else {
                this.appHeader.classList.add('visible');
                const widget = document.getElementById('ai-chat-widget');
                if (widget) widget.style.display = 'flex';
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
