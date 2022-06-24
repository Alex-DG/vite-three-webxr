import '../styles/app.css'
import Experience from './Experience'

console.log('🎉', 'Project generated using vite-three-starter')
console.log(':: https://github.com/Alex-DG/vite-three-starter ::')

/**
 * WebXR
 */
document.querySelector('#app').innerHTML = `
 <div class="container">
   <h1>AR with WebXR</h1>
   <p>
    This is an experiment using augmented reality features with the WebXR Device API.<br></br>
    Upon entering AR, a fox is waiting for you! 🦊
   </p>
 </div>
`

/**
 * Experience
 */
window.experience = new Experience({
  domElement: document.getElementById('experience'),
})
