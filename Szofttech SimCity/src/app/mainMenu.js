customElements.define('main-menu',
class MainMenu extends HTMLDivElement{
    
    _title = document.createElement('h1')
    _newBtn = document.createElement('button')
    _loadBtn = document.createElement('button')

    constructor() {
        super();

        this.classList.add('main-menu');
        this._title.innerText = 'Városépítő Szimulátor';
        this._newBtn.innerText = 'Új Játék';
        this._loadBtn.innerText = 'Játék Betöltése';
        this._newBtn.onclick  = () => this.dispatchEvent(new Event('new-game'))
        this._loadBtn.onclick = () => this.dispatchEvent(new Event('load-game'))
        this.appendChild(this._title);
        this.appendChild(this._newBtn);
        this.appendChild(this._loadBtn);
    }

}, { extends: 'div' })
