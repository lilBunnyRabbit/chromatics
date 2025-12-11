import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import registerConversions from './packages/chromatics/register-conversions'
import registry from './packages/chromatics/conversions'

registerConversions(registry);

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
