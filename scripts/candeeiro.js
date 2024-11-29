import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {OutlinePass} from "three/addons/postprocessing/OutlinePass.js";
import * as SGI_Example from "./example_scene.min.js";

// Model Meshes
let suporte;
let lampada_cilindrica;
let lampada_esferica;
let AbajurJoint, ArmToAbajurJoint, ShortArm, LongArm, SupportJoint;

// Default Colors
const cor_default = new THREE.Color("lightblue");

// Sizes
let width = document.getElementById("three-canvas-container").clientWidth;
let height = document.getElementById("three-canvas-container").clientHeight;
// Sliders
const abajurJointSlider = document.getElementById("AbajurJointSlider");
const abajurArmSlider = document.getElementById("ArmToAbajurJointSlider");
const shortArmSlider = document.getElementById("ShortArmSlider");
const longArmSlider = document.getElementById("LongArmSlider");
const supportJointSlider = document.getElementById("SupportJointSlider");

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
    width = document.getElementById("three-canvas-container").clientWidth;
    height = document.getElementById("three-canvas-container").clientHeight;
    camara.aspect = width / height;
    camara.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
    outlinePass.setSize(width, height);
}

// Scene Setup
let cena = new THREE.Scene();
window.cena = cena;

// Renderer Setup
const threeCanvas = document.getElementById("three-canvas");
let renderer = new THREE.WebGLRenderer({canvas: threeCanvas});
renderer.setSize(width, height);
renderer.setClearColor(0x5f5f5f, 1);
renderer.setPixelRatio(1.5);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Camera Setup
let camara = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camara.position.set(0, 2, 5);
cena.add(camara);

// Orbit Controls
const controls = new OrbitControls(camara, renderer.domElement);
controls.enableDamping = true;

// Composer and Outline Pass
const outlinePass = new OutlinePass(
    new THREE.Vector2(width, height),
    cena,
    camara
);
outlinePass.edgeStrength = 5;
outlinePass.edgeGlow = 0;
outlinePass.edgeThickness = 1;
outlinePass.pulsePeriod = 0;
outlinePass.visibleEdgeColor.set("#ffae00");
outlinePass.hiddenEdgeColor.set("#ffae00");

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(cena, camara));
composer.addPass(outlinePass);

// Interaction Handlers
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

window.addEventListener("pointerdown", onPointerClick);
const Objects = [
    "AbajurJoint", // this and
    "Abajur", // this whill represent the same object when outlined
    "ArmToAbajurJoint",
    "LongArm",
    "ShortArm",
    "SupportJointHolder",
    "CircleJoint", // the same for this
    "SupportJoint", // and this
    "Support",
];

function onPointerClick(event) {
    // Ensure the click is within the Three.js canvas
    if (event.target !== threeCanvas) {
        return;
    }

    var rect = threeCanvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
    console.log("X:" + mouse.x, "Y:" + mouse.y);

    raycaster.setFromCamera(mouse, camara);
    const intersects = raycaster.intersectObjects(cena.children, true);

    document.querySelectorAll(".sliderDiv").forEach((div) => {
        div.className = "sliderDiv";
    });

    if (intersects.length > 0) {
        let clickedMesh = intersects[0].object;
        if (!clickedMesh.name.endsWith("Solo")) {
            return;
        }
        if (clickedMesh.name === "CircleJointSolo" || clickedMesh.name === "SupportJointSolo") {
            outlinePass.selectedObjects = [cena.getObjectByName("CircleJointSolo"), cena.getObjectByName("SupportJointSolo")];
            document.getElementById("SupportJointSliderDiv").className = "sliderDiv active";
        } else if (clickedMesh.name === "AbajurSolo" || clickedMesh.name === "AbajurJointSolo") {
            outlinePass.selectedObjects = [cena.getObjectByName("AbajurSolo"), cena.getObjectByName("AbajurJointSolo")];
            document.getElementById("AbajurJointSliderDiv").className = "sliderDiv active";
        } else {
            outlinePass.selectedObjects = [clickedMesh];
            let sliderDiv = document.getElementById(clickedMesh.name.replace("Solo", "SliderDiv"));
            if (sliderDiv) {
                sliderDiv.className = "sliderDiv active";
            }
        }
        console.log("Outlined mesh:", clickedMesh.name);
    } else {
        outlinePass.selectedObjects = [];
    }
}

// Transparent Material
let transparentMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0,
});

// Load and Prepare Model
new GLTFLoader().load("./models/novo/ApliqueArticuladoPecaUnica.gltf", (gltf) => {
    gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.receiveShadow = true;
            child.castShadow = true;
        }
    });

    cena.add(gltf.scene);

    Objects.forEach((name) => {
        const baseObj = cena.getObjectByName(name); // Get the base object
        const soloObjName = name + "Solo"; // Derive the Solo object's name
        const soloObj = cena.getObjectByName(soloObjName); // Get the Solo object

        if (soloObj) soloObj.material = transparentMaterial;

        if (soloObj && baseObj) {
            AbajurJoint = cena.getObjectByName("AbajurJoint");
            ArmToAbajurJoint = cena.getObjectByName("ArmToAbajurJoint");
            ShortArm = cena.getObjectByName("ShortArm");
            LongArm = cena.getObjectByName("LongArm");
            SupportJoint = cena.getObjectByName("SupportJoint");
        }
    });

    suporte = cena.getObjectByName("Support");

    // Light Configuration
    const ponto_luminoso = cena.getObjectByName("Point");
    const cone_luminoso = cena.getObjectByName("Spot");
    ponto_luminoso.intensity = 3;
    ponto_luminoso.distance = 1.25;
    cone_luminoso.intensity = 16;
    cone_luminoso.distance = 10;
    ponto_luminoso.color = cone_luminoso.color = cor_default;


    // Configure Lamps
    lampada_cilindrica = cena.getObjectByName("C_LightBulb");
    lampada_esferica = cena.getObjectByName("S_LightBulb");
    lampada_esferica.visible = false;
    lampada_cilindrica.children[0].material.emissive = cor_default;


    // Directional Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1);
    cena.add(light);
    setSoloObjectsPosition();
    updateSliders();
});

function setSoloObjectsPosition() {
    Objects.forEach((name) => {
        const baseObj = cena.getObjectByName(name);
        const soloObjName = name + "Solo";
        const soloObj = cena.getObjectByName(soloObjName);

        if (soloObj && baseObj) {
            const baseWorldPosition = new THREE.Vector3();
            const baseWorldQuaternion = new THREE.Quaternion();
            baseObj.getWorldPosition(baseWorldPosition);
            baseObj.getWorldQuaternion(baseWorldQuaternion);

            soloObj.position.copy(baseWorldPosition);
            soloObj.quaternion.copy(baseWorldQuaternion);
        }
    });
}

// Update rotation function
function updateRotation() {
    console.log("Updating rotation...");
    const abajurRotationZ = THREE.MathUtils.degToRad(abajurJointSlider.value);
    const ArmToAbajurRotationX = THREE.MathUtils.degToRad(abajurArmSlider.value);
    const shortArmRotationX = THREE.MathUtils.degToRad(shortArmSlider.value);
    const longArmRotationX = THREE.MathUtils.degToRad(longArmSlider.value);
    const supportJointRotationY = THREE.MathUtils.degToRad(supportJointSlider.value);

    if (AbajurJoint) {
        AbajurJoint.rotation.z = abajurRotationZ;
    }
    if (ArmToAbajurJoint) {
        ArmToAbajurJoint.rotation.x = ArmToAbajurRotationX;
    }
    if (ShortArm) {
        ShortArm.rotation.x = shortArmRotationX;
    }
    if (LongArm) {
        LongArm.rotation.x = longArmRotationX;
    }
    if (SupportJoint) {
        SupportJoint.rotation.y = supportJointRotationY;
    }

    renderer.render(cena, camara);
}

function updateSliders() {
    abajurJointSlider.value = AbajurJoint.rotation.z;
    abajurArmSlider.value = ArmToAbajurJoint.rotation.x;
    shortArmSlider.value = ShortArm.rotation.x;
    longArmSlider.value = LongArm.rotation.x;
    supportJointSlider.value = SupportJoint.rotation.y;
}

// Add event listeners to sliders
abajurJointSlider.addEventListener("input", updateRotation);
abajurArmSlider.addEventListener("input", updateRotation);
shortArmSlider.addEventListener("input", updateRotation);
longArmSlider.addEventListener("input", updateRotation);
supportJointSlider.addEventListener("input", updateRotation);

// Animation Loop
{
    let delta = 0;
    let relogio = new THREE.Clock();
    const latencia_minima = 1 / 60;

    function animar() {
        requestAnimationFrame(animar);
        delta += relogio.getDelta();

        if (delta >= latencia_minima) {
            controls.update();
            composer.render();
            setSoloObjectsPosition();
            delta %= latencia_minima;
        }
    }

    animar();
}