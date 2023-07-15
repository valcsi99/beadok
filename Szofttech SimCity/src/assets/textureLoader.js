import * as PIXI from 'pixi.js';
import { spritesheet } from './spritesheet.js';

/**
 * Legenerálja a spritesheetet.
 *
 * @async
 * @returns {Promise<PIXI.Spritesheet>} A spritesheet
 */
async function generateSpriteSheet() {
    // Create the SpriteSheet from data and image
    const myspritesheet = new PIXI.Spritesheet(
        PIXI.BaseTexture.from(spritesheet.meta.image),
        spritesheet
    );

    // Generate all the Textures asynchronously
     await myspritesheet.parse();
     return myspritesheet;
}

let sheet = null;
/**
 * A generateSpriteSheet() által legenerált singleton instance-t adja vissza.
 *
 * @async
 * @returns {Promise<PIXI.Spritesheet>} A spritesheet
 */
export async function getSpritesheet() {
    if(sheet) return sheet;
    sheet = await generateSpriteSheet();
    return sheet;
}
