
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
            
            const customIcon = L.divIcon({
                className: isIsland ? 'custom-marker island-marker' : 'custom-marker',
                html: isIsland ? `
                    <div class="flag-pole"></div>
                    <div class="island-flag"></div>
                    <div class="marker-core"></div>
                    <div class="marker-pulse"></div>
                ` : `
                    <div class="marker-core"></div>
                    <div class="marker-pulse"></div>
                `,
                iconSize: isIsland ? [20, 20] : [40, 40],
                iconAnchor: isIsland ? [10, 10] : [20, 20]
            });

            const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(this.map);
            
            if (isIsland) {
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
                
                // Zoom in effect before transition
                this.map.flyTo([loc.lat, loc.lng], 9, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
                
                setTimeout(() => {
                    this.fadeToView(this.storyView, () => this.openStory(loc));
                }, 1000);
            });
        });
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
            if (this.currentLocation && this.currentLocation.isIsland) {
                // Island memorial interaction
                this.btnStartVr.style.opacity = '0';
                setTimeout(() => {
                    this.btnStartVr.style.display = 'none';
                    this.memorialMessage.style.display = 'block';
                    setTimeout(() => {
                        this.memorialMessage.style.opacity = '1';
                    }, 50);
                }, 1000);
            } else {
                // Standard VR transition
                this.fadeToView(this.vrView, () => this.openVR());
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
        });
        
        this.btnCloseDashboard.addEventListener('click', () => {
            this.dashboardOverlay.classList.remove('active');
        });
        
        // Close dashboard with Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dashboardOverlay.classList.contains('active')) {
                this.dashboardOverlay.classList.remove('active');
            }
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
            
            // Header visibility logic
            if (targetView === this.heroView) {
                this.appHeader.classList.remove('visible');
            } else {
                this.appHeader.classList.add('visible');
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
        
        if (location.isIsland) {
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
