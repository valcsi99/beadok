import { Field } from "./field.js";
import { Defaults } from "../defaults.js";

export class Zone extends Field{

    static price = 500;
    static upgradePrice = 500;
    
    _destroyValue = -250;
    _upgradePrice = 500;

    constructor({ capacity, developed, tax, ...rest}){
        super({ width: 1, height: 1, ...rest});
        this._capacity = capacity || 0;
        this._developed = developed || 0;
        this._max_capacity = this._developed === 1 ? 400 : (this._developed === 2 ? 500 : (this._developed === 3 ? 600 : 300));
        this.tax = tax || Defaults.tax;
    }

    get destroyValue() { return this._destroyValue; }

    get upgradePrice() { return this._upgradePrice; }

    get available() { return this._max_capacity - this._capacity; }

    set selected(bool) {
        bool ? this.tint = 0xff4a4a : this.tint = this._tint;
        this._selected = true;
    }

    /**
     * Ha még senki nem költözött/dolgozik a zónában akkor bontható.
     */
    isDestroyable() {
        return this._capacity === 0;
    }

    /**
     * Hozzárendeli az adott lakó/munkahelyhez a polgárt
     *
     * @param {boolean} movedIn - Be és kiköltözés kapcsolója
     */
    citizenMove(movedIn = true) {
        if(movedIn){
            if(this._capacity === this._max_capacity)
                throw `${this} zónában nincs több hely!`

            ++this._capacity;
        }
        else{
            if(this._capacity === 0)
                throw `${this} már üres!`

            --this._capacity;
        }
        return this;
    }
    /**
     * Az első beköltözés fázisban változtatja a zóna textúrát.
     */

    update() {
        if (!this._selected)
            this.tint = this._tint;

        if(this._capacity > 0)
            this._setTexture(`${this.constructor.name}${Math.floor((this._capacity-1)/100)+1}.png`);
    }

    /**
     * Zónák fejlesztése
     */
    upgrade() {
        if(this._developed === 3 || this._capacity !== this._max_capacity) return false;
        ++this._developed;
        this._max_capacity+=100;
        return true;
    }
}

export class Residential extends Zone{
    constructor(props){
        super({ sprite: 'grass.png', ...props});
        this._tint = 0x2de35e;
        this.update();
    }
}

export class Service extends Zone{
    constructor(props){
        super({ sprite: 'grass.png', ...props});
        this._tint = 0x458bf5;
        this.update();
    }
}

export class Industrial extends Zone{
    constructor(props){
        super({ sprite: 'grass.png', ...props});
        this._tint = 0xf0c20c;
        this.update();
    }
}
