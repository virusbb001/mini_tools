/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import App from './App'

const root = document.getElementById('root')

document.fonts.load("12px 'Fira Code'").then(() => {
  console.log("Fira Code ready");
});

render(() => <App />, root!)
