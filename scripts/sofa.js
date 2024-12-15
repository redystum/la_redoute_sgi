// noinspection JSFileReferences
// noinspection ES6CheckImport

import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'

let cena = new THREE.Scene();
window.cena = cena;

let carregador = new GLTFLoader()
let animator = new THREE.AnimationMixer(cena);

// tive de mudar a pasta pois ele dava erro da path ser muito grande, dai estar no /gltf
let path;
if (!/Mobi|Android/i.test(navigator.userAgent)) {
    path = './gltf/sofa_aplique.gltf';
} else {
    path = './gltf/sofa_aplique_mobile.gltf';
}

carregador.load(path, function (gltf) {

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
            try {
                const soloObjName = name + "Solo"; // Derive the Solo object's name
                const soloObj = cena.getObjectByName(soloObjName); // Get the Solo object

                if (soloObj) soloObj.visible = false;
            } catch (e) {
                console.log(e);
            }
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
        lampada_esferica.visible = true;
        lampada_cilindrica.visible = true;
        // lampada_cilindrica.children[0].material.emissive = cor_default;

        let water = cena.getObjectByName("water");
        water.material = new THREE.MeshBasicMaterial({
            color: 0x57a8bd,
            opacity: 0.3,
            transparent: true,
        });

        function setupAnimation(name, delay, speed) {
            let animation = THREE.AnimationClip.findByName(gltf.animations, name);
            if (!animation) {
                console.warn("Couldn't find animation: " + name);
                return;
            }
            let clip = animator.clipAction(animation);
            if (!clip) {
                console.warn("Couldn't create clip: " + name);
                return;
            }

            if (name === "kelp") {
                clip.setLoop(THREE.LoopPingPong);
            } else {
                clip.setLoop(THREE.LoopRepeat);
            }

            clip.startAt(delay);
            clip.timeScale = speed;
            clip.play();
        }


        if (!/Mobi|Android/i.test(navigator.userAgent)) {
            for (let i = 0; i <= 10; i++) {
                setupAnimation("kelp" + i, Math.random() * 2, .1 + Math.random() * .5);
                setupAnimation("fish" + i, Math.random() * 2, .1 + Math.random() * .3);
            }
        }

    }
)

const threeCanvas = document.getElementById('three-canvas');
const threeContainer = document.getElementById('canvas-container');
let renderer = new THREE.WebGLRenderer({
    canvas: threeCanvas,
    antialias: true,
    powerPreference: "high-performance",
    precision: "lowp",
});
renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
renderer.setClearColor(0xefefef, 1);
// renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const geometry = new THREE.PlaneGeometry(100, 100);
geometry.rotateX(-Math.PI / 2);
geometry.translate(0, -1.63, 0);
const material = new THREE.ShadowMaterial({opacity: 0.5});
const plane = new THREE.Mesh(geometry, material);
plane.receiveShadow = true;
cena.add(plane);


let camera = new THREE.PerspectiveCamera(70, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000)
camera.position.set(11, 5, 4)
// camera.rotation.set(-1, 1.2, 1)
camera.lookAt(2, 2.7, 0)

let isOrbitActive = false
let orbit = new OrbitControls(camera, renderer.domElement)
orbit.target.set(2, 2.7, 0)
orbit.enableDamping = true;
orbit.enablePan = false
orbit.maxDistance = 30;
orbit.minDistance = 10;
orbit.zoomSpeed = 0.4;
orbit.maxPolarAngle = Math.PI / 2;
orbit.minPolarAngle = Math.PI / 8;
orbit.maxAzimuthAngle = Math.PI / 1.7;
orbit.minAzimuthAngle = -Math.PI / 12;
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

function luzes() {
    const luzDirecional = new THREE.DirectionalLight("white", 1)
    luzDirecional.position.set(-1, 5, -2)
    luzDirecional.target.position.set(0, 0, 0)
    luzDirecional.intensity = 3
    luzDirecional.castShadow = true;

    luzDirecional.shadow.mapSize.width = 1024 * 4;

    luzDirecional.shadow.mapSize.height = 1024 * 4;
    luzDirecional.shadow.camera.near = 0.5;
    luzDirecional.shadow.camera.far = 500;

    cena.add(luzDirecional)

    const d = 100;

    luzDirecional.shadow.camera.left = -d;
    luzDirecional.shadow.camera.right = d;
    luzDirecional.shadow.camera.top = d;
    luzDirecional.shadow.camera.bottom = -d;

    const luzAmbiente = new THREE.AmbientLight(0xffffff, 1)
    cena.add(luzAmbiente)
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
            animator.update(delta);
            renderer.render(cena, camera);
            delta %= latencia_minima;
        }
    }

    animar();
}
