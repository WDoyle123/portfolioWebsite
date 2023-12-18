import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Disclaimer: This is a simplified version of the solar system
// Scale is compeletly off but everything would be tiny and slow otherwise!

// Function to handle window resize
function onWindowResize() {
    // Update camera aspect ratio and projection matrix
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Functions
function addStar() {
  const geometry = new THREE.SphereGeometry(1., 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

  const star = new THREE.Mesh(geometry, material);
  
  // Stops stars from spawning too close 
  let x, y, z;
  do {
    x = THREE.MathUtils.randFloatSpread(1500);
    y = THREE.MathUtils.randFloatSpread(1500);
    z = THREE.MathUtils.randFloatSpread(1500);
  } while (x*x + y*y + z*z < 500000);

  star.position.set(x, y, z);
  scene.add(star);
}

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  camera.position.y = t * -0.025;
  camera.position.x = t * 0.1;
  //camera.position.z = t * 0.050;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

}

function animate() {
  requestAnimationFrame(animate);

  const delta = 0.0008; 
  elapsedTime += delta;

  // Moon's orbit
  const moonOrbitRadius = 40;
  moon.position.x = (earth.position.x + moonOrbitRadius * Math.cos(elapsedTime));
  moon.position.z = earth.position.z - moonOrbitRadius * Math.sin(elapsedTime);

  earth.rotation.y += 0.0008;
  moon.rotation.y += 0.001;
  sun.rotation.y += 0.0003;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  controls.update();
  renderer.render(scene, camera);
}

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });

// Renderer configuration
document.body.appendChild(renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

let elapsedTime = 0;

// Lighting
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(120, 80, -470);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers
const lightHelper = new THREE.PointLightHelper(pointLight);
scene.add(lightHelper);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Background
const spaceTexture = new THREE.TextureLoader().load('black.jpg');
scene.background = spaceTexture;

// Celestial objects
const sunTexture = new THREE.TextureLoader().load('sun.jpg');
const earthTexture = new THREE.TextureLoader().load('earth.jpg');
const moonTexture = new THREE.TextureLoader().load('moon.jpg');

const sun = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 32), new THREE.MeshStandardMaterial({ map: sunTexture }));
sun.position.set(180, 80, -600);
scene.add(sun);

const earth = new THREE.Mesh(new THREE.SphereGeometry(18, 32, 32), new THREE.MeshStandardMaterial({ map: earthTexture }));
earth.position.set(60, 0, 400);
scene.add(earth);

const moon = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshStandardMaterial({ map: moonTexture }));
moon.position.set(100, 0, 300);
scene.add(moon);

// Add event listener for window resize
window.addEventListener('resize', onWindowResize, false);

// Camera setup
camera.position.set(300, -200, 500);
controls.target.copy(new THREE.Vector3(0, 0, 0)); 
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Event listeners
document.body.onscroll = moveCamera;
moveCamera();

// Star generation and animation
Array(1000).fill().forEach(addStar);
animate();
