import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'

let cena = new THREE.Scene();

let carregador = new GLTFLoader()
carregador.load(
    './models/sofa.gltf',
    function (gltf) {
        cena.add(gltf.scene)
    }
)

const threeCanvas = document.getElementById('three-canvas');
let renderer = new THREE.WebGLRenderer({canvas: threeCanvas})
renderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight);
renderer.setClearColor(0xefefef, 1);
renderer.setPixelRatio(1.5);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader()

let camera = new THREE.PerspectiveCamera(70, threeCanvas.clientWidth / threeCanvas.clientHeight, 0.1, 1000)
camera.position.set((3 / 2) * 5, .5 * 5, (1 / 3) * 5)
// camera.position.set(3 / 2, .5, 1 / 3)
// camera.rotation.set(-1, 1.2, 1)
camera.lookAt(0, 0, 0)

let grelha = new THREE.GridHelper()
cena.add(grelha)

let eixos = new THREE.AxesHelper()
cena.add(eixos)

let orbit = new OrbitControls(camera, renderer.domElement)
// orbit.enableZoom = false
// orbit.enablePan = false
orbit.target.set(0, 0, 0)
// orbit.minPolarAngle = Math.PI / 4
// orbit.maxPolarAngle = Math.PI / 2

orbit.enableDamping = true;
orbit.autoRotate = true;
orbit.autoRotateSpeed = 1;
orbit.maxDistance = 30;
orbit.minDistance = 10;
orbit.zoomSpeed = 0.4;
orbit.enablePan = false;


let isOrbitActive = false
let btnOrbit = document.getElementById('orbitBtn')
// orbit.enabled = false;
btnOrbit.addEventListener('click', () => {
    isOrbitActive = !isOrbitActive
    orbit.enabled = isOrbitActive
    if (isOrbitActive)
        btnOrbit.className = 'floatingBtn active'
    else
        btnOrbit.className = 'floatingBtn'
})

let delta = 0
let relogio = new THREE.Clock()
let latencia_minima = 1 / 60

function animar() {
    requestAnimationFrame(animar);
    delta += relogio.getDelta();
    if (delta < latencia_minima) return;

    renderer.render(cena, camera)
    delta = delta % latencia_minima;
}

function luzes() {
    const luzDirecional = new THREE.DirectionalLight("white", 1)
    luzDirecional.position.set(1, 2, .5)
    luzDirecional.target.position.set(0, 0, -1)
    luzDirecional.castShadow = true

    luzDirecional.intensity = 2
    cena.add(luzDirecional)
    cena.add(luzDirecional.target)

    const lightHelper = new THREE.DirectionalLightHelper(luzDirecional)
    cena.add(lightHelper)
}

luzes();
animar();

window.addEventListener('resize', () => {
    camera.aspect = threeCanvas.clientWidth / threeCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight);
});