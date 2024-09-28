import './style.css';
import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();

// Adjusted camera parameters
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 1, 10000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true
});

// Renderer configuration
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

let elapsedTime = 0;
let scrollPercent = 0; 

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); 
scene.add(ambientLight);

// Background
const spaceTexture = new THREE.TextureLoader().load('black.jpg');
scene.background = spaceTexture;

// Load the Milky Way texture
const milkyWayTexture = new THREE.TextureLoader().load('mw.jpg');

// Create a SpriteMaterial with the Milky Way texture
const milkyWayMaterial = new THREE.SpriteMaterial({
  map: milkyWayTexture,
  transparent: true, 
  opacity: 0.2, 
  depthWrite: false, 
  blending: THREE.AdditiveBlending 
});

// Create the Sprite
const milkyWay = new THREE.Sprite(milkyWayMaterial);

// Scale the Sprite 
milkyWay.scale.set(20000, 12500, 1); 

// Position the Sprite behind other objects
milkyWay.position.set(0, 800, -4500); 

// Add the Milky Way to the scene
scene.add(milkyWay);
// **End of Milky Way Setup**

// Celestial objects
const sunTexture = new THREE.TextureLoader().load('sun.jpg');
const earthTexture = new THREE.TextureLoader().load('earth-real.jpg');
const moonTexture = new THREE.TextureLoader().load('moon.jpg');

// Sun material with emissiveMap and adjusted emissiveIntensity
const sunMaterial = new THREE.MeshStandardMaterial({
  map: sunTexture,
  emissiveMap: sunTexture,
  emissive: new THREE.Color(0xffffff),
  emissiveIntensity: 2 
});

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(80, 32, 32),
  sunMaterial
);
sun.position.set(10, 30, -200);
scene.add(sun);

// Create a point light at the sun's position
const sunLight = new THREE.PointLight(0xffffff, 2, 0); 
sunLight.position.copy(sun.position);
scene.add(sunLight);

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(18, 32, 32),
  new THREE.MeshStandardMaterial({ map: earthTexture })
);
earth.position.set(-150, 70, -1000);
scene.add(earth);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshStandardMaterial({ map: moonTexture })
);
moon.position.set(120, earth.position.y, 300);
scene.add(moon);

// Star generation using Points
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 2,
  sizeAttenuation: false
});

// Create an array to hold positions
const starVertices = [];

// Number of stars
const numStars = 2500;

// Generate stars in a sphere
const radius = 5000;

for (let i = 0; i < numStars; i++) {
  const r = radius * Math.cbrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  starVertices.push(x, y, z);
}

// Set positions in geometry
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

// Create Points object
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Functions
function moveCamera() {
  // Get the scroll position
  const scrollY = window.scrollY || window.pageYOffset;

  // Calculate the maximum scroll value
  const maxScroll = document.body.scrollHeight - window.innerHeight;

  // Calculate the scroll percentage (0 to 1)
  scrollPercent = scrollY / maxScroll;
}

function animate() {
  requestAnimationFrame(animate);

  const delta = 0.0008;
  elapsedTime += delta;

  // Moon's orbit
  const moonOrbitRadius = 40;
  moon.position.x = earth.position.x + moonOrbitRadius * Math.cos(elapsedTime);
  moon.position.z = earth.position.z - moonOrbitRadius * Math.sin(elapsedTime);

  // Rotate celestial bodies
  earth.rotation.y += 0.0008;
  moon.rotation.y += 0.001;
  sun.rotation.y += 0.0003;

  // Update sun light position (if the sun moves)
  sunLight.position.copy(sun.position);

  // Smooth camera zoom based on scroll
  const minZ = 300;  // Closest zoom
  const maxZ = 775; // Farthest zoom

  // Calculate the target z-position
  const targetZ = minZ + (maxZ - minZ) * scrollPercent;

  // Smoothly interpolate camera's z-position
  camera.position.z += (targetZ - camera.position.z) * 0.05;

  // Keep the camera looking beyond the Earth
  const lookAtPosition = new THREE.Vector3(
    earth.position.x,
    earth.position.y,
    earth.position.z - 9000 // Point beyond the Earth
  );
  camera.lookAt(lookAtPosition);

  renderer.render(scene, camera);
}

// Add event listener for window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  // Update camera aspect ratio and projection matrix
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Camera setup
camera.position.set(-200, 80, 300); // Move camera left and up

// Event listeners
document.body.onscroll = moveCamera;
moveCamera();

animate();

