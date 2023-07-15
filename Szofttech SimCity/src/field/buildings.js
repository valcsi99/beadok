import { Field } from "./field.js";

/**
 * Létrehozza a Police class-t, és beállítja hozzá a építés árát, 
 * bontás árát, fenntartás árát éshozzárendeli a megfelelő sprite-ot.
 */
export class Police extends Field{
    static price = 10000;
    _destroyValue = -2500;
    _maintenance = 5;
    constructor(props){
        super({ sprite: 'Police.png', height: 1,width: 1, ...props});
    }
    get destroyValue() { return this._destroyValue; }
    get maintenance() { return this._maintenance; }
}

/**
 * Létrehozza a Stadium class-t, és beállítja hozzá a építés árát, 
 * bontás árát, fenntartás árát éshozzárendeli a megfelelő sprite-ot.
 */
export class Stadium extends Field{
    static price = 20000;
    _destroyValue = -5000;
    _maintenance = 5;
    constructor(props){
        super({ sprite: 'Stadium.png', height: 2,width: 2, ...props});
    }
    get destroyValue() { return this._destroyValue; }
    get maintenance() { return this._maintenance; }
}

/**
 * Létrehozza a School class-t, és beállítja hozzá a építés árát, 
 * bontás árát, fenntartás árát éshozzárendeli a megfelelő sprite-ot.
 */
export class School extends Field{
    static price = 8000;
    _destroyValue = -2000;
    _maintenance = 5;
    constructor(props){
        super({ sprite: 'School.png', height: 2,width: 1, ...props});
    }
    get destroyValue() { return this._destroyValue; }
    get maintenance() { return this._maintenance; }
}

/**
 * Létrehozza a University class-t, és beállítja hozzá a építés árát, 
 * bontás árát, fenntartás árát éshozzárendeli a megfelelő sprite-ot.
 */
export class University extends Field{
    static price = 20000;
    _destroyValue = -5000;
    _maintenance = 5;
    constructor(props){
        super({ sprite: 'University.png', height: 2,width: 2, ...props});
    }
    get destroyValue() { return this._destroyValue; }
    get maintenance() { return this._maintenance; }
}

/**
 * Létrehozza a Forest class-t, és beállítja hozzá a építés árát, 
 * bontás árát, fenntartás árát éshozzárendeli a megfelelő sprite-ot.
 */
export class Forest extends Field{
    static price = 1000;
    _destroyValue = -250;
    _maintenance = 5;
    constructor({ age, ...props }){
        super({ sprite: 'forest1.png', height: 1,width: 1, ...props});
        this._age = age || 0;
        this.update();
    }
    get destroyValue() { return this._destroyValue; }
    get maintenance() { return this._age > 10 ? 0 : this._maintenance; }

    get_age() { return this._age; }

    age() {
        this._age++;
        this.update();
    }

    update() {
        this._setTexture(`forest${this._age >= 10 ? '6' : Math.round((this._age+1)/2)}.png`);
    }
}
