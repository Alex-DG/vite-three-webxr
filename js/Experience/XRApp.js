import { ARButton } from 'three/examples/jsm/webxr/ARButton.js'

class XRApp {
  constructor({ renderer }) {
    this.renderer = renderer
    this.init()
  }

  init() {
    this.setARButton()
  }

  setARButton() {
    // Create the AR button element, configure our XR session, and append it to the DOM.
    document.body.appendChild(
      ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] })
    )
  }
}

export default XRApp
