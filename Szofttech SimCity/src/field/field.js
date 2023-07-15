import { Sprite } from 'pixi.js'
import { Defaults } from '../defaults.js'
import { getSpritesheet } from '../assets/textureLoader.js'
import { Police } from './buildings.js';

export class Field extends Sprite{
    constructor({sprite, x, y, width, height, grid}) {
        super();
        this._setTexture(sprite);
        this.x = x*Defaults.tileSize;
        this.y = y*Defaults.tileSize;
        this.width = width * Defaults.tileSize;
        this.height = height * Defaults.tileSize;
        this._position = { x, y };
        this._size = { width, height };
        this._grid = grid;

        this.eventMode = 'static';
    }

    set grid(grid) {
        this._grid = grid;
    }

    get position() {
        return this._position;
    }
    
    get json() {
        //TODO
    }

    get size(){
        return this._size;
    }

    /**
     * Beállítja az adott textúrát a fieldhez.
     *
     * @param {sprite} sprite - A beállítani kívánt sprite
     */
    async _setTexture(sprite) {
        if(!sprite) return;
        let sheet = await getSpritesheet();
        this.texture = sheet.textures[sprite];
    }

    /**
     * Visszaadja egy mező érintkező szomszédjait 
     *
     */
    getNeighbours() {
        let arr = [];
        if(this._grid[this.x-1]?.[this.y]) arr.push(this._grid[this.x-1][this.y]);
        if(this._grid[this.x]?.[this.y-1]) arr.push(this._grid[this.x][this.y-1]);

        if(this._grid[this.x+this.size.width-1]?.[this.y-1]) arr.push(this._grid[this.x+this.size.width-1][this.y-1]);
        if(this._grid[this.x+this.size.width]?.[this.y]) arr.push(this._grid[this.x+this.size.width][this.y]);
        
        if(this._grid[this.x-1]?.[this.y+this.size.height-1]) arr.push(this._grid[this.x-1][this.y+this.size.height-1]);
        if(this._grid[this.x]?.[this.y + this.size.height]) arr.push(this._grid[this.x][this.y + this.size.height]);

        if(this._grid[this.x+this.size.width-1]?.[this.y + this.size.height]) arr.push(this._grid[this.x+this.size.width-1][this.y + this.size.height]);
        if(this._grid[this.x+this.size.width]?.[this.y + this.size.height - 1]) arr.push(this._grid[this.x+this.size.width][this.y + this.size.height - 1]);

        let uniqueNeighbours = [];
        arr.forEach((element) => {
            if (!uniqueNeighbours.includes(element)) {
                uniqueNeighbours.push(element);
            }
        });
        return uniqueNeighbours;
    }

    /**
     * Visszaadja a mezőt érintő utak számát.
     */
    countRoadNearby(){
        let arr = this.getNeighbours();
        let roadCount = 0;
        arr.forEach(field => {
            if(field.constructor.name === 'Road'){
                roadCount++;
            }
        });
        return roadCount;
    }

    /**
     * Megnézi, hogy az adott field egyenló-e a paraméterül kapottal.
     *
     * @param {field} field - Vizsgálni kívánt field
     */
    matches(field){
        if(!field) return false;
        if(typeof field === 'function') {
            return this instanceof field
        }
        return this === field;
    }

    /**
     * Megkeresi, hogy van-e paraméterül kapott mező a sugáron belül.
     *
     * @param {field} field - Keresendő mező
     * @param {int} r - Sugár
     */
    hasNearby(field, r = 3) {
        let { x, y } = this._position;
        for (let i=x-r; i<x+r+1; ++i) {
            for (let j=y-r; j<y+r+1; ++j) {
                let f = this._grid[i]?.[j];
                if(f && f.matches(field)) return true;
            }
        }
        return false;
    }

    /**
     * Megvizsgálja, hogy az adott út mező egy útszakasz vége-e.
     */
    isEndOfRoad(){
        let arr = [];
        let roadCount = 0;
        if(this._grid[this.x+1]?.[this.y]) arr.push(this._grid[this.x+1][this.y]);
        if(this._grid[this.x-1]?.[this.y]) arr.push(this._grid[this.x-1][this.y]);
        if(this._grid[this.x]?.[this.y+1]) arr.push(this._grid[this.x][this.y+1]);
        if(this._grid[this.x]?.[this.y-1]) arr.push(this._grid[this.x][this.y-1]);
        arr.forEach(field => {
            if(field.constructor.name === 'Road'){
                roadCount ++;
            }
        });
        let emptyField =  4 - arr.length;
        return (roadCount == 1 && emptyField == 1);
    }

    /**
     * Megvizsgálja, hogy az adott mező bontható-e.
     */
    isDestroyable() {
        let fieldName = this.constructor.name;
        let arr = [];
        let destroyable = true;

        if(this._grid[this.x+1]?.[this.y]) arr.push(this._grid[this.x+1][this.y]);
        if(this._grid[this.x-1]?.[this.y]) arr.push(this._grid[this.x-1][this.y]);
        if(this._grid[this.x]?.[this.y+1]) arr.push(this._grid[this.x][this.y+1]);
        if(this._grid[this.x]?.[this.y-1]) arr.push(this._grid[this.x][this.y-1]);

        let roadCount = 0;
        let buildingCount = 0;
        arr.forEach(field => {
            if(field.constructor.name === 'Road'){
                roadCount ++;
            }
            else{
                buildingCount ++;
            }
        });
        if ((fieldName === 'Road' && roadCount > 1)) {
            destroyable = false;
        }
        else if(fieldName === 'Road' && roadCount == 1 && buildingCount != 0){
            destroyable = false;
        }
        
        return destroyable;
    }

    /**
     * Visszaadja a mező melleti utat.
     */
    getNextRoad(){
        let arr = this.getNeighbours();
        let road;
        arr.forEach(field => {
            if(field.constructor.name === 'Road'){
                road = field;
            }
        });
        return road;
    }

    Service_Equals_Industrial(){
        let numOfService = 0;
        let numOfIndustrial = 0;
        for (let i = 0; i < this._grid.length; i++) {
            this._grid[i].forEach(field => {
                if(!field) return;
                if (field.constructor.name === "Service") {
                    numOfService++;
                }
                else if (field.constructor.name === "Industrial") {
                    numOfIndustrial++;
                }
            })
        }
        return (numOfIndustrial === numOfService);
    }
}
