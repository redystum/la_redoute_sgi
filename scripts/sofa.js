import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let cena = new THREE.Scene();

let carregador = new GLTFLoader()
carregador.load(
    './models/sofa_aplique.gltf',
    function ( gltf ) {
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });

        cena.add(gltf.scene);

        const Objects = [
            "AbajurJoint",
            "Abajur",
            "ArmToAbajurJoint",
            "LongArm",
            "ShortArm",
            "SupportJointHolder",
            "CircleJoint",
            "SupportJoint",
        ];

        Objects.forEach((name) => {
            const soloObjName = name + "Solo"; // Derive the Solo object's name
            const soloObj = cena.getObjectByName(soloObjName); // Get the Solo object

            if (soloObj) soloObj.visible = false;
        });

        // Light Configuration
        const ponto_luminoso = cena.getObjectByName("Point");
        const cone_luminoso = cena.getObjectByName("Spot");
        ponto_luminoso.intensity = 0;
        ponto_luminoso.distance = 1.25 * 1000;
        cone_luminoso.intensity = 0;
        cone_luminoso.distance = 10;
        // ponto_luminoso.color = cone_luminoso.color = cor_default;


        // Configure Lamps
        let lampada_cilindrica = cena.getObjectByName("C_LightBulb");
        let lampada_esferica = cena.getObjectByName("S_LightBulb");
        lampada_esferica.visible = false;
        // lampada_cilindrica.children[0].material.emissive = cor_default;

    }
)

const threeCanvas = document.getElementById('three-canvas');
const threeContainer = document.getElementById('canvas-container');
let renderer = new THREE.WebGLRenderer({canvas: threeCanvas})
renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
renderer.setClearColor(0xefefef, 1);
renderer.setPixelRatio(1.5);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


let camera = new THREE.PerspectiveCamera( 70, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000 )
camera.position.set( 11, 5, 4 )
// camera.rotation.set(-1, 1.2, 1)
camera.lookAt(2, 2, 0)

let isOrbitActive = false
let orbit = new OrbitControls(camera, renderer.domElement)
orbit.target.set(2, 2, 0)
orbit.enableDamping = true;
orbit.enablePan = false
orbit.maxDistance = 30;
orbit.minDistance = 2;
orbit.zoomSpeed = 0.4;
orbit.maxPolarAngle = Math.PI / 1.75;
orbit.minPolarAngle = Math.PI / 7;
orbit.maxAzimuthAngle = Math.PI / 1.7;
orbit.minAzimuthAngle = -Math.PI / 9;
orbit.enabled = isOrbitActive


let btnOrbit = document.getElementById('orbitBtn')
btnOrbit.addEventListener('click', () => {
    isOrbitActive = !isOrbitActive
    orbit.enabled = isOrbitActive
    if (isOrbitActive)
        btnOrbit.className = 'floatingBtn active'
    else
        btnOrbit.className = 'floatingBtn'

})

function luzes(){
    const luzDirecional = new THREE.DirectionalLight("white", 1)
    luzDirecional.position.set(1,10,1)
    luzDirecional.target.position.set(0,0,0)
    luzDirecional.intensity = 3
    luzDirecional.castShadow = false
    cena.add(luzDirecional)

    const lightHelper = new THREE.DirectionalLightHelper(luzDirecional)
    cena.add(lightHelper)
}

luzes();

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
    let width = threeContainer.clientWidth;
    let height = threeContainer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Animation Loop
{
    let delta = 0;
    let relogio = new THREE.Clock();
    const latencia_minima = 1 / 60;

    function animar() {
        requestAnimationFrame(animar);
        delta += relogio.getDelta();

        if (delta >= latencia_minima) {
            orbit.update();
            renderer.render(cena, camera);
            delta %= latencia_minima;
        }
    }

    animar();
}
