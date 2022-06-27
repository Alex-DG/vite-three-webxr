import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js'

import {
  browserHasImmersiveArCompatibility,
  displayUnsupportedBrowserMessage,
  handleXRHitTest,
} from './utils/xr'

import modelSrc from '../../assets/models/fox-v1.glb'

const DRACO_DECODER_PATH =
  'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'

class Experience {
  constructor(options) {
    this.container = options.container
    this.scene = new THREE.Scene()
    this.isReady = false

    this.start()
  }

  init() {
    this.bind()
    this.setLoader()
    this.setLight()
    this.setSizes()
    this.setCamera()
    this.setRenderer()
    this.setARButton()
    this.setBox()
    this.setFox()
    this.setMarker()
    this.setController()

    this.update()
  }

  bind() {
    this.onSelect = this.onSelect.bind(this)
  }

  onSelect() {
    if (this.marker?.visible) {
      const model = this.fox.clone()
      model.position.setFromMatrixPosition(this.marker.matrix)
      // Rotate the model randomly to give a bit of variation to the scene.
      model.rotation.y = Math.random() * (Math.PI * 2)
      model.visible = true
      this.scene.add(model)
    }
  }
  //////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////

  setLoader() {
    this.loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH)
    this.loader.setDRACOLoader(dracoLoader)
  }

  setLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    this.scene.add(ambientLight)
  }

  setSizes() {
    this.sizes = {
      width: this.container.offsetWidth,
      height: this.container.offsetHeight || window.innerHeight,
    }
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    )
    this.scene.add(this.camera)
  }

  setRenderer() {
    // Create a new WebGL renderer and set the size + pixel ratio.
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Enable XR functionality on the renderer.
    this.renderer.xr.enabled = true

    // Add it to the DOM.
    this.container.appendChild(this.renderer.domElement)
  }

  setARButton() {
    // Create the AR button element, configure our XR session, and append it to the DOM.
    document.body.appendChild(
      ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] })
    )
  }

  setBox() {
    const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
    const boxMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 'hotpink',
    })
    this.box = new THREE.Mesh(boxGeometry, boxMaterial)
    this.box.position.z = -3

    this.scene.add(this.box)
  }

  setFox() {
    this.loader.load(modelSrc, (gltf) => {
      this.fox = gltf.scene // .children[0]
      this.isReady = true

      console.log('🦊', 'Experience initialized', {
        fox: this.fox,
      })
    })
  }

  setMarker() {
    const planeMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const planeMarkerGeometry = new THREE.RingGeometry(0.14, 0.15, 16).rotateX(
      -Math.PI / 2
    )

    this.marker = new THREE.Mesh(planeMarkerGeometry, planeMarkerMaterial)
    this.marker.matrixAutoUpdate = false
    this.scene.add(this.marker)
  }

  setController() {
    this.controller = this.renderer.xr.getController(0)
    this.scene.add(this.controller)

    this.controller.addEventListener('select', this.onSelect)
  }

  //////////////////////////////////////////////////////////////////////////////

  // Check if browser supports WebXR with "immersive-ar".
  async start() {
    const immersiveArSupported = await browserHasImmersiveArCompatibility()
    immersiveArSupported ? this.init() : displayUnsupportedBrowserMessage()
  }

  update() {
    const renderLoop = (_, frame) => {
      if (!this.isReady) return

      this.box.rotation.y += 0.01
      this.box.rotation.x += 0.01

      if (this.renderer.xr.isPresenting) {
        if (frame) {
          handleXRHitTest(
            this.renderer,
            frame,
            (hitPoseTransformed) => {
              if (hitPoseTransformed) {
                this.marker.visible = true
                this.marker.matrix.fromArray(hitPoseTransformed)
              }
            },
            () => {
              this.marker.visible = false
            }
          )
        }
        this.renderer.render(this.scene, this.camera)
      }
    }

    this.renderer.setAnimationLoop(renderLoop)
  }
}

export default Experience
