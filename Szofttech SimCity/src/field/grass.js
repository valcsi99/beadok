import { Field } from "./field.js";

export class Grass extends Field{
    constructor(props){
        super({ sprite: 'grass.png', width: 1, height: 1, ...props});
    }
}
