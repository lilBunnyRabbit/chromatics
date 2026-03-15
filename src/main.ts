import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import './packages/chromatics/init'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
