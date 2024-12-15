// noinspection JSFileReferences
// noinspection ES6CheckImport

import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {OutlinePass} from "three/addons/postprocessing/OutlinePass.js";

// Model Meshes
let suporte;
let lampada_cilindrica;
let lampada_esferica;
let AbajurJoint, ArmToAbajurJoint, ShortArm, LongArm, SupportJoint, Abajur, SupportJointHolder, CircleJoint;
let WoodMaterial;
let MarbleMaterial;

// Default Colors
const cor_default = new THREE.Color("white");

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

// Add Ambient Light
const luzAmbiente = new THREE.AmbientLight(0xffffff, 1)
cena.add(luzAmbiente)

// Renderer Setup
const threeCanvas = document.getElementById("three-canvas");
let renderer = new THREE.WebGLRenderer({
    canvas: threeCanvas,
    antialias: true,
    powerPreference: "high-performance",
    precision: "lowp",
});
renderer.setSize(width, height);
renderer.setPixelRatio(1.2);
// renderer.setClearColor(0x5f5f5f, 1);
renderer.setClearColor(0x2a2a35, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
window.renderer = renderer;

const geometry = new THREE.PlaneGeometry(10000, 10000);
geometry.rotateX(-Math.PI / 2);
geometry.translate(0, -1.63, 0);
const material = new THREE.ShadowMaterial({opacity: 0.5});
const plane = new THREE.Mesh(geometry, material);
plane.receiveShadow = true;
cena.add(plane);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Camera Setup
let camara = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camara.position.set(9, 5.5, -.7);
camara.lookAt(-0.6, 5, -5);
// Orbit Controls
const controls = new OrbitControls(camara, renderer.domElement);
controls.target.set(-0.6, 5, -5);
controls.enableDamping = true;
controls.enablePan = false
controls.maxDistance = 30;
controls.minDistance = 10;
controls.zoomSpeed = 0.4;
controls.maxPolarAngle = Math.PI / 1.8;
controls.minPolarAngle = Math.PI / 10;
controls.maxAzimuthAngle = Math.PI / 1.8;
controls.minAzimuthAngle = -Math.PI / 17;
controls.enablePan = false;

cena.add(camara);

// Composer and Outline Pass
const outlinePass = new OutlinePass(
    new THREE.Vector2(width, height),
    cena,
    camara
);
outlinePass.edgeStrength = 10;
outlinePass.edgeGlow = 0;
outlinePass.edgeThickness = 1;
outlinePass.pulsePeriod = 0;
// outlinePass.visibleEdgeColor.set("#ffae00");
// outlinePass.hiddenEdgeColor.set("#ffae00");
outlinePass.visibleEdgeColor.set("#ff7300");
outlinePass.hiddenEdgeColor.set("#ff7300");

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
    "SupportJointHolder", // the same for this
    "CircleJoint", // this
    "SupportJoint", // and this one too
    // "Support",
];

function onPointerClick(event) {
    // Ensure the click is within the Three.js canvas
    if (event.target !== threeCanvas) {
        return;
    }

    let rect = threeCanvas.getBoundingClientRect();
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
            outlinePass.selectedObjects = [];
            return;
        }
        updateSliders();
        if (clickedMesh.name === "CircleJointSolo" || clickedMesh.name === "SupportJointSolo" || clickedMesh.name === "SupportJointHolderSolo") {
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
let path;
if (!/Mobi|Android/i.test(navigator.userAgent)) {
    path = './gltf/sofa_aplique.gltf';
} else {
    path = './gltf/sofa_aplique_mobile.gltf';
}

let animator = new THREE.AnimationMixer(cena);

new GLTFLoader().load(path, function (gltf) {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
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
    
    Abajur = cena.getObjectByName("Abajur");
    SupportJointHolder = cena.getObjectByName("SupportJointHolder");
    CircleJoint = cena.getObjectByName("CircleJoint");
    suporte = cena.getObjectByName("Support");

    const d = 100;
    // Light Configuration
    const ponto_luminoso = cena.getObjectByName("Point");
    const cone_luminoso = cena.getObjectByName("Spot");
    ponto_luminoso.intensity = 300;
    ponto_luminoso.distance = 1.25 * 1000;
    cone_luminoso.intensity = 0;
    cone_luminoso.distance = 10;
    ponto_luminoso.scale.set(0.5, 0.5, 0.5);
    ponto_luminoso.color = cone_luminoso.color = cor_default;
    if (!/Mobi|Android/i.test(navigator.userAgent)) {
        ponto_luminoso.castShadow = true;
        cone_luminoso.castShadow = true;
    } else {
        ponto_luminoso.castShadow = false;
        cone_luminoso.castShadow = false;
    }

    const ponto_lum_helper = new THREE.PointLightHelper(ponto_luminoso);
    cena.add(ponto_lum_helper);

    ponto_luminoso.shadow.mapSize.width = 256;
    ponto_luminoso.shadow.mapSize.height = 256;
    ponto_luminoso.shadow.bias = -0.001;

    ponto_luminoso.shadow.camera.near = 0.5;
    ponto_luminoso.shadow.camera.far = 500;
    ponto_luminoso.shadow.camera.left = -d;
    ponto_luminoso.shadow.camera.right = d;
    ponto_luminoso.shadow.camera.top = d;
    ponto_luminoso.shadow.camera.bottom = -d;


    // Configure Lamps
    lampada_cilindrica = cena.getObjectByName("C_LightBulb");
    lampada_esferica = cena.getObjectByName("S_LightBulb");
    lampada_esferica.visible = false;
    lampada_cilindrica.children[0].material.emissive = cor_default;

    WoodMaterial = cena.getObjectByName("WoodMaterial").material;
    WoodMaterial.emissive = new THREE.Color(0x8b4513);
    WoodMaterial.emissiveIntensity = .2;

    MarbleMaterial = cena.getObjectByName("MarbleMaterial").material;
    MarbleMaterial.emissive = new THREE.Color(0xffffff);
    MarbleMaterial.emissiveIntensity = .2;

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

    setSoloObjectsPosition();
    updateSliders();
    updateRotation();
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
    console.log("Updating sliders...");
    abajurJointSlider.value = THREE.MathUtils.radToDeg(AbajurJoint.rotation.z);
    abajurArmSlider.value = THREE.MathUtils.radToDeg(ArmToAbajurJoint.rotation.x);
    shortArmSlider.value = THREE.MathUtils.radToDeg(ShortArm.rotation.x);
    longArmSlider.value = THREE.MathUtils.radToDeg(LongArm.rotation.x);
    supportJointSlider.value = THREE.MathUtils.radToDeg(SupportJoint.rotation.y);
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
            animator.update(delta);
            setSoloObjectsPosition();
            delta %= latencia_minima;
        }
    }

    animar();
}

const blackMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
const whiteMaterial = new THREE.MeshBasicMaterial({color: 0xf1f1f1});

$("#btn_abajur_black").click(function () {
    if (Abajur) {
        $(".abajurSection").removeClass("active");
        $("#btn_abajur_black").addClass("active");
        $("#abajurHeading span").text("Preto");
        if (Abajur.children.length > 0 && Abajur.children[0].isMesh) {
            console.log(Abajur.children[0]);
            Abajur.children[0].material = blackMaterial;
        }
    }
});

$("#btn_abajur_white").click(function () {
    if (Abajur) {
        $(".abajurSection").removeClass("active");
        $("#btn_abajur_white").addClass("active");
        $("#abajurHeading span").text("Branco");
        Abajur.material = whiteMaterial;
        if (Abajur.children.length > 0 && Abajur.children[0].isMesh) {
            console.log(Abajur.children[0]);
            Abajur.children[0].material = whiteMaterial;
        }
    }
});

$("#btn_abajur_wood").click(function () {
    if (Abajur) {
        $(".abajurSection").removeClass("active");
        $("#btn_abajur_wood").addClass("active");
        $("#abajurHeading span").text("Madeira");
        Abajur.material = WoodMaterial;
        if (Abajur.children.length > 0 && Abajur.children[0].isMesh) {
            Abajur.children[0].material = WoodMaterial;
        }
    }
});

$("#btn_abajur_marble").click(function () {
    if (Abajur) {
        $(".abajurSection").removeClass("active");
        $("#btn_abajur_marble").addClass("active");
        $("#abajurHeading span").text("Mármore");
        Abajur.material = MarbleMaterial;
        if (Abajur.children.length > 0 && Abajur.children[0].isMesh) {
            Abajur.children[0].material = MarbleMaterial;
        }
    }
});

$("#btn_arms_black").click(function () {
    if (ShortArm && LongArm && CircleJoint && SupportJoint && ArmToAbajurJoint && AbajurJoint) {
        $(".armsSection").removeClass("active");
        $("#btn_arms_black").addClass("active");
        $("#armsHeading span").text("Preto");
        ShortArm.material = blackMaterial;
        LongArm.material = blackMaterial;
        CircleJoint.material = blackMaterial;
        SupportJoint.material = blackMaterial;
        ArmToAbajurJoint.material = blackMaterial;
        AbajurJoint.material = blackMaterial;
    }
});

$("#btn_arms_white").click(function () {
    if (ShortArm && LongArm && CircleJoint && SupportJoint && ArmToAbajurJoint && AbajurJoint) {
        $(".armsSection").removeClass("active");
        $("#btn_arms_white").addClass("active");
        $("#armsHeading span").text("Branco");
        ShortArm.material = whiteMaterial;
        LongArm.material = whiteMaterial;
        CircleJoint.material = whiteMaterial;
        SupportJoint.material = whiteMaterial;
        ArmToAbajurJoint.material = whiteMaterial;
        AbajurJoint.material = whiteMaterial;
    }
});

$("#btn_arms_wood").click(function () {
    if (ShortArm && LongArm && CircleJoint && SupportJoint && ArmToAbajurJoint && AbajurJoint) {
        $(".armsSection").removeClass("active");
        $("#btn_arms_wood").addClass("active");
        $("#armsHeading span").text("Madeira");
        ShortArm.material = WoodMaterial;
        LongArm.material = WoodMaterial;
        CircleJoint.material = WoodMaterial;
        SupportJoint.material = WoodMaterial;
        ArmToAbajurJoint.material = WoodMaterial;
        AbajurJoint.material = WoodMaterial;
    }
});

$("#btn_arms_marble").click(function () {
    if (ShortArm && LongArm && CircleJoint && SupportJoint && ArmToAbajurJoint && AbajurJoint) {
        $(".armsSection").removeClass("active");
        $("#btn_arms_marble").addClass("active");
        $("#armsHeading span").text("Mármore");
        ShortArm.material = MarbleMaterial;
        LongArm.material = MarbleMaterial;
        CircleJoint.material = MarbleMaterial;
        SupportJoint.material = MarbleMaterial;
        ArmToAbajurJoint.material = MarbleMaterial;
        AbajurJoint.material = MarbleMaterial;
    }
});

$("#btn_support_black").click(function () {
    if (suporte && SupportJointHolder) {
        $(".supportSection").removeClass("active");
        $("#btn_support_black").addClass("active");
        $("#supportHeading span").text("Preto");
        suporte.material = blackMaterial;
        SupportJointHolder.material = blackMaterial;
    }
});

$("#btn_support_white").click(function () {
    if (suporte && SupportJointHolder) {
        $(".supportSection").removeClass("active");
        $("#btn_support_white").addClass("active");
        $("#supportHeading span").text("Branco");
        suporte.material = whiteMaterial;
        SupportJointHolder.material = whiteMaterial;
    }
});

$("#btn_support_wood").click(function () {
    if (suporte && SupportJointHolder) {
        $(".supportSection").removeClass("active");
        $("#btn_support_wood").addClass("active");
        $("#supportHeading span").text("Madeira");
        suporte.material = WoodMaterial;
        SupportJointHolder.material = WoodMaterial;
    }
});

$("#btn_support_marble").click(function () {
    if (suporte && SupportJointHolder) {
        $(".supportSection").removeClass("active");
        $("#btn_support_marble").addClass("active");
        $("#supportHeading span").text("Mármore");
        suporte.material = MarbleMaterial;
        SupportJointHolder.material = MarbleMaterial;
    }
});


