// ========================================
// SLIDER JAVASCRIPT
// ========================================

import * as THREE from "https://esm.sh/three";

// ========================================
// Preloader Animation
// ========================================
class PreloaderAnimation {
  constructor() {
    this.wrapper = document.querySelector('.slider-wrapper');
  }

  show() {
    if (this.wrapper) {
      this.wrapper.classList.add('loaded');
    }
  }
}

// ========================================
// Configuration
// ========================================
const SLIDER_CONFIG = {
  images: [
    "assets/imgs/slider/slide-01.webp",
    "assets/imgs/slider/slide-02.webp",
    "assets/imgs/slider/slide-03.webp",
    "assets/imgs/slider/slide-04.webp",
    "assets/imgs/slider/slide-05.webp",
    "assets/imgs/slider/slide-06.webp"
  ],
  titles: [
    "Innovation",
    "Experience",
    "Identity",
    "Growth",
    "Intelligence",
    "Performance"
  ],
  effects: {
    glass: {
      distortionScale: 0.5,
      cellSize: 0.15,
      speed: 0.8,
      chromatic: 0.02
    },
    frost: {
      distortionScale: 0.3,
      cellSize: 0.25,
      speed: 0.5,
      chromatic: 0.015
    },
    ripple: {
      distortionScale: 0.4,
      cellSize: 0.2,
      speed: 1.0,
      chromatic: 0.025
    },
    plasma: {
      distortionScale: 0.6,
      cellSize: 0.1,
      speed: 1.2,
      chromatic: 0.03
    },
    timeshift: {
      distortionScale: 0.35,
      cellSize: 0.3,
      speed: 0.6,
      chromatic: 0.01
    }
  },
  autoSlide: true,
  autoSlideDelay: 5000
};

// ========================================
// Shaders
// ========================================
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D currentTexture;
  uniform sampler2D nextTexture;
  uniform float progress;
  uniform float distortionScale;
  uniform float cellSize;
  uniform float speed;
  uniform float chromatic;
  uniform vec2 resolution;
  varying vec2 vUv;

  // Noise function for distortion
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = resolution.x / resolution.y;

    // Create distortion effect
    vec2 center = vec2(0.5);
    vec2 toCenter = center - uv;
    float dist = length(toCenter);

    // Animated noise-based distortion
    float noiseVal = noise(uv * (1.0 / cellSize) + progress * speed);
    vec2 distortion = toCenter * noiseVal * distortionScale * progress * (1.0 - progress);

    // Apply chromatic aberration
    vec2 uvR = uv + distortion * (1.0 + chromatic);
    vec2 uvG = uv + distortion;
    vec2 uvB = uv + distortion * (1.0 - chromatic);

    // Sample textures with chromatic aberration
    vec4 currentR = texture2D(currentTexture, uvR);
    vec4 currentG = texture2D(currentTexture, uvG);
    vec4 currentB = texture2D(currentTexture, uvB);
    vec4 current = vec4(currentR.r, currentG.g, currentB.b, 1.0);

    vec4 nextR = texture2D(nextTexture, uvR);
    vec4 nextG = texture2D(nextTexture, uvG);
    vec4 nextB = texture2D(nextTexture, uvB);
    vec4 next = vec4(nextR.r, nextG.g, nextB.b, 1.0);

    // Mix based on progress
    vec4 finalColor = mix(current, next, progress);

    gl_FragColor = finalColor;
  }
`;

// ========================================
// Slider Class
// ========================================
class Slider {
  constructor() {
    this.currentSlide = 0;
    this.isAnimating = false;
    this.autoSlideTimer = null;

    this.setupThree();
    this.loadTextures();
    this.setupControls();
    this.setupNavigation();
    this.animate();

    // Show preloader when ready
    const preloader = new PreloaderAnimation();
    preloader.show();

    if (SLIDER_CONFIG.autoSlide) {
      this.startAutoSlide();
    }
  }

  setupThree() {
    this.canvas = document.querySelector('.webgl-canvas');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Get current effect settings
    const currentEffect = Object.values(SLIDER_CONFIG.effects)[0];

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        currentTexture: { value: null },
        nextTexture: { value: null },
        progress: { value: 0 },
        distortionScale: { value: currentEffect.distortionScale },
        cellSize: { value: currentEffect.cellSize },
        speed: { value: currentEffect.speed },
        chromatic: { value: currentEffect.chromatic },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader,
      fragmentShader
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    window.addEventListener('resize', () => this.onResize());
  }

  async loadTextures() {
    this.textures = await Promise.all(
      SLIDER_CONFIG.images.map(url => {
        return new Promise((resolve) => {
          new THREE.TextureLoader().load(url, resolve);
        });
      })
    );

    this.material.uniforms.currentTexture.value = this.textures[0];
    this.material.uniforms.nextTexture.value = this.textures[1];
    this.updateSlideNumber();
  }

  setupControls() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowRight' || e.code === 'Space') {
        this.next();
      } else if (e.code === 'ArrowLeft') {
        this.prev();
      }
    });

    // Touch/swipe controls
    let touchStartX = 0;
    let touchEndX = 0;

    this.canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    this.canvas.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        this.next();
      } else if (touchEndX - touchStartX > 50) {
        this.prev();
      }
    });

    // Click to advance
    this.canvas.addEventListener('click', () => this.next());
  }

  setupNavigation() {
    const nav = document.getElementById('slidesNav');

    SLIDER_CONFIG.titles.forEach((title, index) => {
      const item = document.createElement('button');
      item.className = 'slide-nav-item';
      if (index === 0) item.classList.add('active');

      const progressLine = document.createElement('div');
      progressLine.className = 'slide-progress-line';

      const progressFill = document.createElement('div');
      progressFill.className = 'slide-progress-fill';

      progressLine.appendChild(progressFill);

      const titleEl = document.createElement('span');
      titleEl.className = 'slide-nav-title';
      titleEl.textContent = title;

      item.appendChild(progressLine);
      item.appendChild(titleEl);

      item.addEventListener('click', () => this.goToSlide(index));

      nav.appendChild(item);
    });
  }

  goToSlide(index) {
    if (this.isAnimating || index === this.currentSlide) return;

    const nextSlide = index;
    this.transition(nextSlide);
  }

  next() {
    if (this.isAnimating) return;
    const nextSlide = (this.currentSlide + 1) % this.textures.length;
    this.transition(nextSlide);
  }

  prev() {
    if (this.isAnimating) return;
    const nextSlide = (this.currentSlide - 1 + this.textures.length) % this.textures.length;
    this.transition(nextSlide);
  }

  transition(nextSlideIndex) {
    this.isAnimating = true;
    this.stopAutoSlide();

    this.material.uniforms.currentTexture.value = this.textures[this.currentSlide];
    this.material.uniforms.nextTexture.value = this.textures[nextSlideIndex];

    // Animate progress from 0 to 1
    const duration = 1.5;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      this.material.uniforms.progress.value = this.easeInOutCubic(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.currentSlide = nextSlideIndex;
        this.material.uniforms.progress.value = 0;
        this.isAnimating = false;
        this.updateSlideNumber();
        this.updateNavigation();

        if (SLIDER_CONFIG.autoSlide) {
          this.startAutoSlide();
        }
      }
    };

    animate();
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  updateSlideNumber() {
    const slideNumber = document.getElementById('slideNumber');
    const slideTotal = document.getElementById('slideTotal');

    if (slideNumber) {
      slideNumber.textContent = String(this.currentSlide + 1).padStart(2, '0');
    }

    if (slideTotal) {
      slideTotal.textContent = String(this.textures.length).padStart(2, '0');
    }
  }

  updateNavigation() {
    const items = document.querySelectorAll('.slide-nav-item');
    items.forEach((item, index) => {
      item.classList.toggle('active', index === this.currentSlide);

      const fill = item.querySelector('.slide-progress-fill');
      if (index === this.currentSlide) {
        fill.style.width = '100%';
      } else if (index < this.currentSlide) {
        fill.style.width = '100%';
        fill.style.opacity = '0.3';
      } else {
        fill.style.width = '0%';
        fill.style.opacity = '1';
      }
    });
  }

  startAutoSlide() {
    this.autoSlideTimer = setTimeout(() => {
      this.next();
    }, SLIDER_CONFIG.autoSlideDelay);
  }

  stopAutoSlide() {
    if (this.autoSlideTimer) {
      clearTimeout(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}

// ========================================
// Initialize
// ========================================
window.addEventListener('DOMContentLoaded', () => {
  new Slider();
});
