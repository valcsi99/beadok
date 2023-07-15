customElements.define('menu-panel',
class MenuPanel extends HTMLDivElement{

    _saveBtn = document.createElement('button')
    _quitBtn = document.createElement('button')
    _catastropheBtn = document.createElement('button')
    _cityNameNode = document.createElement('span')

    constructor() {
        super();

        this.classList.add('panel');
        this.classList.add('menu-panel');
        this._initElement(this._saveBtn, 'Játék mentése', 'save-game');
        this._initElement(this._quitBtn, 'Kilépés a főmenübe', 'quit');
        this._initElement(this._catastropheBtn, 'Katasztrófa', 'catastrophe');
        this.appendChild(this._cityNameNode);

    }

    /**
     * Beállítja a panelen a város nevét.
     *
     * @param {string} name - A város neve
     */
    set cityName(name) {
        this._cityName = name;
        this._cityNameNode.innerText = `Város neve: ${name}`;
    }

    /**
     * Beállít egy gombot.
     *
     * @param {HTMLButtonElement} element - A beállítandó gomb
     * @param {string} text - A gomb tartalma
     * @param {string} eventName - A dispatch-elt event neve kattintáskor
     */
    _initElement(element, text, eventName) {
        element.innerHTML = text;
        this.appendChild(element);
        element.onclick = () => this.dispatchEvent(
            new Event(eventName)
        );
    }
    
}, { extends: 'div' })
