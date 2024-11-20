import * as THREE from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as SGI_Example from "./example_scene.min.js"

// Malhas do modelo
let suporte     // suporte do aplique, pode ser utilizado para posicionar o aplique na cena 3d
let lampada_cilindrica
let lampada_esferica

// Cor default para as luzes e cor da lampada
const cor_default = new THREE.Color("lightblue")

// Criar cena do threeJS e expor na consola
let cena = new THREE.Scene()
window.cena = cena

// Criar Renderer
const threeCanvas = document.getElementById('three-canvas');
let renderer = new THREE.WebGLRenderer({canvas: threeCanvas})
renderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight);
//renderer.setSize(window.innerWidth, window.innerHeight)
//document.body.appendChild(renderer.domElement)

// Criar e preparar camara
let camara = new THREE.PerspectiveCamera(60, threeCanvas.clientWidth / threeCanvas.clientHeight, 1, 1000)
let controls = new OrbitControls(camara, renderer.domElement)
camara.position.set(-6, 2, 8)
camara.lookAt(0, -1, 2.5)
controls.target.set(0, -1, 2.5)


// Carregar modelo, ajustar luzes, e preparar cena exemplo
new GLTFLoader().load(
    'models/ApliqueArticuladoPecaUnica.gltf',
    function (gltf) {
        // informacao: 1 unidade = 0.1m = 1 dm = 10 cm

        cena.add(gltf.scene)

        suporte = cena.getObjectByName("Support")
        console.log(suporte)

        // Configurar das fontes luminosas do modelo
        const ponto_luminoso = cena.getObjectByName("Point")
        const cone_luminoso = cena.getObjectByName("Spot")
        ponto_luminoso.intensity = 3
        ponto_luminoso.distance = 1.25  // 0.125 metros
        cone_luminoso.intensity = 16
        cone_luminoso.distance = 10     // 1 metro; ajustar consoante o pretendido
        ponto_luminoso.color = cone_luminoso.color = cor_default // alterar cor da luz
        console.log(ponto_luminoso)

        // Obter os dois tipos de lampada e esconder a redonda
        lampada_cilindrica = cena.getObjectByName("C_LightBulb")
        lampada_esferica = cena.getObjectByName("S_LightBulb")
        lampada_esferica.visible = false

        // Ajustar a cor da lampada visivel
        lampada_cilindrica.children[0].material.emissive = cor_default// alterar cor da lampada
        console.log(lampada_cilindrica)

        // Criar cena exemplo. Pode ser removida/substituida
        SGI_Example.setupMockupScene(cena, suporte)
    }
)

// Renderizar/Animar
{
    let delta = 0;
    let relogio = new THREE.Clock();
    let latencia_minima = 1 / 60;    // para 60 frames por segundo
    animar()
    function animar() {
        requestAnimationFrame(animar);
        delta += relogio.getDelta();

        if (delta < latencia_minima) return;

        renderer.render(cena, camara)

        delta = delta % latencia_minima;
    }
}
