'use strict'

import './style.scss'
import { App } from './src/app/app.js'
import { getSpritesheet } from './src/assets/textureLoader.js'

getSpritesheet().then(() => new App());
