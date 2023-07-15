//abstract class
class InfoPanel extends HTMLDivElement{
    constructor() {
        super();
        this.classList.add('panel');
    }

    /**
     * Létrehoz egy új infó elemet.
     *
     * @param {string} info - Az elem címkéje
     * @returns {HTMLSpanElement} A span dom element
     */
    _addInfoElem(info) {
        let span = document.createElement('span');
        let value = document.createElement('span');
        span.classList.add('info');
        value.classList.add('value');
        span.innerText = `${info}: `;
        span._value = value;
        span.appendChild(value);
        this.appendChild(span);
        return span;
    }

    /**
     * Beállítja egy címkének az értékét.
     *
     * @param {string} label - A beállítandó címke
     * @param {string} value - A címke értéke
     */
    setInfo(label, value) {
        this[`_${label}`]._value.innerText = value;
    }
}

//top panel
customElements.define('top-info-panel',
class TopInfoPanels extends InfoPanel{

    _population = this._addInfoElem('Népesség')
    _satisfaction = this._addInfoElem('Elégedettség');
    _money = this._addInfoElem('Rendelkezésre álló összeg')
    _date = this._addInfoElem('Dátum')

}, { extends: 'div' })

//bottom panel
customElements.define('bottom-info-panel',
class TopInfoPanels extends InfoPanel{

    _name = this._addInfoElem('Kijelölt Zóna')
    _satisfaction = this._addInfoElem('Elégedettség');
    _tax= this._addInfoElem('Adó');
    _capacity= this._addInfoElem('Kapacitás');
    _developed= this._addInfoElem('Fejlesztési szint');
    _maxCapacity= this._addInfoElem('Max kapacitás');

    /**
     * Beállítja a panel láthatóságát.
     *
     * @param {boolean} v - A láthatóság
     */
    set visible(v) {
        this.style.display = v ? 'flex' : 'none';
    }

}, { extends: 'div' })

