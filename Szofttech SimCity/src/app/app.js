import './gameGUI.js'
import './mainMenu.js'
import { Defaults } from '../defaults.js'
import { City } from '../city/city.js'

export class App{
    gameGUI = document.createElement('div', { is: 'game-gui' })
    mainMenu = document.createElement('div', { is: 'main-menu' })
    root = document.querySelector('#root')
    _activeActionBtn = null

    constructor() {
        this._newGame();

        this.mainMenu.addEventListener('new-game', this._newGame.bind(this));
        this.mainMenu.addEventListener('load-game', this._loadGame.bind(this));

        this.gameGUI._menuPanel.addEventListener('save-game', this._saveGame.bind(this));
        this.gameGUI._menuPanel.addEventListener('quit', this._quitGame.bind(this));
        this.gameGUI._menuPanel.addEventListener('catastrophe', this._catastrophe.bind(this));        

        //time
        Defaults.speed.forEach(({name, value}) =>
            document.getElementById(`_${name}Btn`).addEventListener(
                'click', () => this._setSpeed(name, value)));

        this._setSpeed(Defaults.speed[1].name, Defaults.speed[1].value);
        
        //action buttons
        let buttons = this.gameGUI.actionButtons;
        Object.keys(buttons).forEach(type =>
            Object.keys(buttons[type]).forEach(id =>
                buttons[type][id].addEventListener('click', () => this._action(type, id))
        ));

        //tax spinners
        let taxSliders = this.gameGUI.taxSliders;
        Object.keys(taxSliders).forEach(zone =>
            taxSliders[zone].addEventListener('change', 
                () => this._tax(zone, taxSliders[zone].value)));
        
    }

    /**
     * Fő ciklusa a programnak, csak meghívja a ui és city update metódusát.
     */
    _mainLoop() {
        this.gameGUI.city.update();
        this.gameGUI.update();
    }

    /**
     * Beállítja az idő teltének sebességét és a gomb stílusát.
     * Ezt a metódust egy ui gomb element hívja meg.
     *
     * @param {string} btn - A gomb id selectorja
     * @param {number} speed - A sebesség ezredmásodpercben
     */
    _setSpeed(btn, speed) {
        this._speed = {btn, speed};
        Defaults.speed.forEach(({name, _}) =>
            document.getElementById(`_${name}Btn`).classList.remove('selected')
        );
        document.getElementById(`_${btn}Btn`).classList.add('selected');

        if(this._loopID) clearInterval(this._loopID);
        if(speed > 0)
            this._loopID = setInterval(this._mainLoop.bind(this), speed);
    }

    /**
     * Beállítja hogy milyen műveletet fog végezni a játékos a városon.
     * Ezt a metódust egy ui gomb element hívja meg.
     *
     * @param {string} type - Az action típusa
     * @param {string} id - Az action id-je
     */
    _action(type, id) {
        if(this._activeActionBtn == this.gameGUI.actionButtons[type][id])
            return this._actionFinished();

        this._selectActionButton(this.gameGUI.actionButtons[type][id]);

        switch (type) {
            case 'zone': this.gameGUI.city.setZone(id); break;
            case 'building': this.gameGUI.city.buildBuilding(id); break;
            case 'other':
                switch (id) {
                    case 'road': this.gameGUI.city.buildRoad(); break;
                    case 'destroy': this.gameGUI.city.destroyField(); break;
                    case 'upgrade': this.gameGUI.city.upgrade(); break
                    default: break;
                }
                break;
            default: break;
        }
    }

    /**
     * Visszaállítja a ui gombok stílusát.
     * Ez a metódus automatikusan meghívódik egy action után.
     */
    _actionFinished() {
        //reenable all
        let buttons = this.gameGUI.actionButtons;
        Object.keys(buttons).forEach(type =>
            Object.keys(buttons[type]).forEach(id => {
                buttons[type][id].disabled = false;
            })
        );
        this._activeActionBtn.classList.remove('selected');
        this._activeActionBtn = null;
        this.gameGUI.city.cancelAction();
    }

    /**
     * Bállítja egy zónára az adó értékét.
     * Ezt a metódust egy ui slider hívja meg.
     *
     * @param {string} zone - A zóna típus neve 
     * @param {number} value - Az adó értéke
     */
    _tax(zone, value) {
        this.gameGUI.city.setTax(zone, value);
    }

    /**
     * Megjeleníti a fő menüt.
     */
    showMainMenu() {
        this.root.innerHTML = '';
        this.root.appendChild(this.mainMenu);
    }

    /**
     * Megjeleníti a játék felületet.
     */
    showGameGUI() {
        this.root.innerHTML = '';
        this.root.appendChild(this.gameGUI);
    }

    /**
     * Megnyílik a fájl választó ablkak, majd fájl kiválasztája után betölti a mentést.
     */
    _loadGame() {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            let file = e.target.files[0];
            var reader = new FileReader();
            reader.onload = (e) => {
                var contents = e.target.result;
                try {
                    this._newGame(JSON.parse(contents));
                    this.showGameGUI();
                } catch (error) {
                    window.alert("Nem jó a fájl!");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    /**
     * Új játék kezdése.
     *
     * @param {object} [params] - City paraméterei
     */
    _newGame(params = null) {
        this.gameGUI.city = new City(params);
        this.gameGUI.city.view.addEventListener('action-finished', this._actionFinished.bind(this));
        this.showGameGUI();
    }

    /**
     * Elmenti a jelenlegi várost.
     * Letölti a városneve.json nevű fájlt.
     */
    _saveGame() {
        let json = this.gameGUI.city.json;
        let blob = new Blob([JSON.stringify(json)], {type:"text/plain"});
        let url = window.URL.createObjectURL(blob);
        let anchor = document.createElement("a");
        anchor.download = `${json.name.replace(/ /g, "_")}.json`;
        anchor.href = url;
        anchor.style.display = "none";
        anchor.click();
    }

    /**
     * Elmenti a játékot, majd kilép a főmenübe.
     */
    _quitGame() {
        //TODO
        // elakarod e menteni prompt
        this._saveGame();
        this.showMainMenu();
    }

    /**
     * Elindít egy katasztrófát.
     *
     */
    _catastrophe() {
        if(this._catastropheOnGoing) return;

        let {btn, speed} = this._speed;
        this._catastropheOnGoing = true;
        this._setSpeed('stop', 0);
        this.gameGUI.city.catastrophe();

        let callback = () => {
            this._catastropheOnGoing = false;
            this._setSpeed(btn, speed);
            this.gameGUI.city.view.removeEventListener('catastrophe-finished', callback);
        }
        this.gameGUI.city.view.addEventListener('catastrophe-finished', callback);
    }

    /**
     * Megjelöli a felületen az éppen futó action gombját.
     *
     * @param {HTMLButtonElement} button - A megjelölendő gomb
     */
    _selectActionButton(button) {
        //disable all
        let buttons = this.gameGUI.actionButtons;
        Object.keys(buttons).forEach(type =>
            Object.keys(buttons[type]).forEach(id => {
                buttons[type][id].classList.remove('selected');
                buttons[type][id].disabled = true;
            })
        );
        //select
        this._activeActionBtn = button;
        button.classList.add('selected');
        button.disabled = false;
    }
}
