import { Field } from "./field.js";

export class Road extends Field{

    static price = 40;
    _destroyValue = -10;
    _maintenance = 1;

    constructor(props){
        super({ sprite: 'highway.png' ,height: 1,width: 1, ...props});
    }

    get destroyValue() { return this._destroyValue; }
    get maintenance() { return this._maintenance; }
}
