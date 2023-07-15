import './actionPanel.js'
import './infoPanels.js'
import './menuPanel.js'

customElements.define('game-gui',
class GameGUI extends HTMLDivElement{
    
    _menuPanel = document.createElement('div', { is: 'menu-panel' })
    _topInfoPanel = document.createElement('div', { is: 'top-info-panel' })
    _bottomInfoPanel = document.createElement('div', { is: 'bottom-info-panel' })
    _actionPanel = document.createElement('div', { is: 'action-panel' })
    _cityContainer = document.createElement('div')

    constructor() {
        super();

        this.classList.add('game-gui');
        this._cityContainer.id = 'city-container'
        this._buildUI();
    }

    /**
     * Beállítja a várost.
     *
     * @param {City} city - A város
     */
    set city(city) {
        this._city = city;
        this._cityContainer.innerHTML = '';
        this._cityContainer.appendChild(city.view);

        city.view.addEventListener('money-changed', this.update.bind(this));
        city.view.addEventListener('field-selected', this.update.bind(this));
        this._menuPanel.cityName = city.name;
        this.update();
    }

    get city() {
        return this._city;
    }

    /**
     * Visszaadja az action gombokat.
     *
     * @returns {Object} buttons - A gombok
     * @returns {Object.<string, HTMLButtonElement>} buttons.zone - A zóna gombok
     * @returns {Object.<string, HTMLButtonElement>} buttons.building - Az épület gombok
     * @returns {Object.<string, HTMLButtonElement>} buttons.other - Az egyéb gombok
     */
    get actionButtons() {
        let buttons = { zone: {}, building: {}, other: {} };
        let ids = {
            zone: [ 'residential', 'industrial', 'service' ],
            building: [ 'police', 'stadion', 'school', 'college', 'forest' ],
            other: [ 'road', 'destroy', 'upgrade' ],
        };
        Object.keys(ids).forEach(type => ids[type].forEach(id =>
            buttons[type][id] = document.getElementById(`_${id}Btn`)
        ));

        return buttons;
    }

    /**
     * Visszaadja az adó slidereket.
     *
     * @returns {Object.<string, HTMLInputElement>} A sliderek
     */
    get taxSliders() {
        return {
            residential: document.getElementById('_residentialTax'),
            industrial: document.getElementById('_industrialTax'),
            service: document.getElementById('_serviceTax'),
        };
    }

    /**
     * Frissíti a felületen látott információkat.
     *
     */
    update() {
        [ 'date', 'money', 'population', 'satisfaction' ]
        .forEach(e => this._topInfoPanel.setInfo(e, this.city[e]));

        if (this.city.selectedZoneInfo) {
            this._bottomInfoPanel.visible = true;
            Object.keys(this.city.selectedZoneInfo).forEach(info => {
                let value = this.city.selectedZoneInfo[info];
                this._bottomInfoPanel.setInfo(info, value);
            });
        }else{
            this._bottomInfoPanel.visible = false;
        }
    }

    /**
     * Felépíti a felületet.
     *
     */
    _buildUI() {
        let vbox = document.createElement('div');
        let hbox = document.createElement('div');
        vbox.classList.add('vbox');
        hbox.classList.add('hbox');

        this.appendChild(this._menuPanel);
        this.appendChild(hbox);
        hbox.appendChild(this._actionPanel);
        hbox.appendChild(vbox);
        vbox.appendChild(this._topInfoPanel);
        vbox.appendChild(this._cityContainer);
        vbox.appendChild(this._bottomInfoPanel);
    }

}, { extends: 'div' })
