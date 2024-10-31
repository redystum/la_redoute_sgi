import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'

let cena = new THREE.Scene();

let carregador = new GLTFLoader()
carregador.load(
    './models/Sofa2.gltf',
    function (gltf) {
        cena.add(gltf.scene)
    }
)

const threeCanvas = document.getElementById('three-canvas');
let renderer = new THREE.WebGLRenderer({canvas: threeCanvas})
renderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight);
renderer.setClearColor(0xefefef, 1);

let camera = new THREE.PerspectiveCamera(70, threeCanvas.clientWidth / threeCanvas.clientHeight, 0.1, 1000)
camera.position.set(3 / 2, .5, 1 / 3)
// camera.rotation.set(-1, 1.2, 1)
camera.lookAt(0, 0, 0)

// let grelha = new THREE.GridHelper()
// cena.add( grelha )
//
// let eixos = new THREE.AxesHelper()
// cena.add( eixos )

let isOrbitActive = false
let orbit = new OrbitControls(camera, renderer.domElement)
orbit.enableZoom = false
orbit.enablePan = false
orbit.target.set(0, 0, 0)
orbit.minPolarAngle = Math.PI / 4
orbit.maxPolarAngle = Math.PI / 2


let btnOrbit = document.getElementById('orbitBtn')
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
    const luzAmbiente = new THREE.AmbientLight("lightblue", 0.5)
    cena.add(luzAmbiente)

    const luzPonto = new THREE.PointLight("white", 1)
    luzPonto.position.set(1, 1, 1)
    luzPonto.intensity = 2
    cena.add(luzPonto)

}

luzes();
animar();

window.addEventListener('resize', () => {
    camera.aspect = threeCanvas.clientWidth / threeCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight);
});