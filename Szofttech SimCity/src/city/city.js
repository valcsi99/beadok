import * as PIXI from 'pixi.js'
import { Defaults } from '../defaults.js'
import { Grass } from '../field/grass.js'
import { Road } from '../field/road.js'
import * as Buildings from '../field/buildings.js'
import * as Roads from '../field/road.js'
import * as Zones from '../field/zone.js'
import { Population } from '../population/population.js'
import { Field } from '../field/field.js'
import firePNG from '../assets/fire.png'
import catastropheShade from '../assets/catastrophe.png'

export class City extends PIXI.Application{
    _name = Defaults.name
    _date = 0
    _money = Defaults.money
    _history = []
    _grassField = []
    _fields = []
    _selectedField = null
    _selectedZone = null
    _scaleValue = 1
    _residentialTaxValue = Defaults.tax
    _industrialTaxValue = Defaults.tax
    _serviceTaxValue = Defaults.tax

    //TODO docs
    constructor(params){
        super({
            width: params?.width*Defaults.tileSize  || Defaults.width*Defaults.tileSize,
            height: params?.height*Defaults.tileSize || Defaults.height*Defaults.tileSize,
        });

        this._init(params); //fill grass

        this.stage.onwheel = e => {
            if(!e.altKey) return;
            this._scale(e.deltaY < 0)
        };
    }
    printHistory() {
        this._history.forEach((item, index) => {
          console.log(`History #${index + 1}: ${item.title}, Value: ${item.value}, Additional: ${item.additional}`);
        });
    }

    /**
     * Visszaadja a kijelölt zónáról az információkat.
     *
     * @returns {Object.<string, string>} Az információk
     */
    get selectedZoneInfo() { 
        let zone = this._selectedZone;
        if(!zone) return null;
        return {
            name: zone.constructor.name,
            tax: zone.tax+'%',
            capacity: zone._capacity,
            maxCapacity: zone._max_capacity,
            developed: zone._developed,
            satisfaction: Math.round(this._population.getSatisfactionByZone(zone)*100)+'%',
        };
    }

    get name() { return this._name; }
    get history() { return this._history; }
    get money() { return this._money+'$'; }
    get population() { return this._population._citizens.length; }
    get satisfaction() { return Math.round(this._population.getSatisfactionByZone(Zones.Zone)*100)+'%'; }

    /**
     * Visszaadja this állapotát json formában
     *
     * @returns {Object} A mentés object json formában
     */
    get json() {
        const buildings = [
            Buildings.School,
            Buildings.Police,
            Buildings.University,
            Buildings.Forest,
            Buildings.Stadium
        ];
    
        const roads = [Roads.Road];
        const zones = [
            Zones.Residential,
            Zones.Service,
            Zones.Industrial
        ];
    
        const buildingFields = buildings.flatMap(building => this.getFields(building));
        const roadFields = roads.flatMap(road => this.getFields(road));
        const zoneFields = zones.flatMap(zone => this.getFields(zone));
        
    
        return {
            name: this._name,
            money: this._money,
            date: this._date,
            tax: this._tax,
            satisfaction: this._satisfaction,
            buildings: buildingFields.map(building => ({
                x: building.x,
                y: building.y,
                building: building.constructor.name,
                texturePath: building.texturePath,
                forestAge: this.get_age
            })),
            roads: roadFields.map(road => ({
                x: road.x,
                y: road.y,
                building: road.constructor.name,
                texturePath: road.texturePath
            })),
            zones: zoneFields.map(zone => ({
                x: zone.x,
                y: zone.y,
                building: zone.constructor.name,
                texturePath: zone.texturePath,
                capacity: zone._capacity,
                maxCapacity: zone._max_capacity,
                developedLevel: zone._developed,
                tax: zone.tax+'%',
                satisfaction: Math.round(this._population.getSatisfactionByZone(zone)*100)+'%',
            })),
            
        };
        
    }

    /**
     * Visszaadja a dátumot YYYY/MM/DD formában.
     *
     * @returns {string}
     */
    get date() {
        const date = new Date(this._date * 86400000);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    /**
     * Megszűrve visszaadja egy listában a mezőket.
     *
     * @param {Field} [filter] - Field leszármazott amire szür.
     * @returns {Field[]} A mezők
     */
    getFields(filter = Zones.Zone) {
        let zones = [];
        this._fields.forEach(row => row.forEach(field => {
            if(field instanceof filter){
                zones.push(field);
            }
        }));
        return zones;
    }

    getMoney() {
        return this._money;
    }

    /**
     * Beállítja az adó értékét a zónákra.
     *
     * @param {function} zone - A zóna class
     * @param {number} value - Az adó értéke
     */
    setTax(zone, value) {
        if(zone && value) this[`_${zone}TaxValue`] = value;
        this._fields.forEach(row => row.forEach(field => {
            if(field instanceof Zones.Industrial) field.tax = this._industrialTaxValue;
            if(field instanceof Zones.Service) field.tax = this._serviceTaxValue;
            if(field instanceof Zones.Residential) field.tax = this._residentialTaxValue;
        }));
    }

    /**
     * Frissíti a belső adatokat. 
     * Egy nap elteltével hívja meg ezt a metódust az App.
     *
     */
    update() {
        let { tax } = this._population.update({ date: this._date }); //every month returns tax money
        //tax tartalmazza a nyugdíjjasok kifizetését is
        tax *= -1;
        if(tax < 0) this._makePurchase({ title: 'Adóbeszedés', value: tax });
        if(tax > 0) this._makePurchase({ title: 'Adóbeszedés', value: tax, additional: 'Úgy néz ki túl sok a nyugdíjas' });
        //tax == 0 nem hónap vége

        if (this._date % 365 === 0) {
            this._fields.forEach(row => row.forEach(field => {
                if(!field) return;
                if(field.constructor.name === "Forest") field.age();
            }));
        }
        if(this._date % 30 === 0){
            let price = 0;
            this._fields.forEach(row => row.forEach(field => {
                if(!field) return;
                if (field.constructor.name === "Forest" && field.get_age() >= 10) return;
                if(field.maintenance) price += field.maintenance
            }));
            this._makePurchase({
                title: 'Fenntartási költségek',
                value: price,
            });
        }

        this._date++;
    }

    /**
     * Felnagyobbítja a város nézetét.
     *
     * @param {boolean} [up] - Nagyobbítsa e vagy kicsinítse
     */
    _scale(up = false) {
        if(this._scaleValue*0.99 < 0.5) this._scaleValue = 0.51;
        if(this._scaleValue*1.01 > 1.5) this._scaleValue = 1.49;
        up  ? this._scaleValue *= 1.01
            : this._scaleValue *= 0.99;
        this.stage.scale.x = this._scaleValue;
        this.stage.scale.y = this._scaleValue;
    }

    /**
     * Betölti a mentés állapotát.
     * Ezt a függvényt constructor hívja meg.
     *
     * @param {Object} params - A betöltendő json object
     */
    _init(params) {
        this._initializeFields();
        this._population = new Population({ getFields: this.getFields.bind(this), getMoney: this.getMoney.bind(this) });
        if(!params) { //new game
            this._generateRandomForest();
            this._generateMainStreet();
        }
        else{ //load game
            this._parseParams(params);
        }
    }
    
    /**
     * Felállítja a pályát. 
     * Feltölti a fű mezőket és letrehozza a mezőket tartalmazó mátrixot.
     *
     */
    _initializeFields() {
        for (let x = 0; x < Defaults.width; ++x) {
            this._grassField[x] = [];
            this._fields[x] = [];
            for (let y = 0; y < Defaults.height; ++y) {
                let grass = new Grass({x, y});
                this._grassField[x][y] = grass;
                this.stage.addChild(grass);
                grass.onclick = this._onFieldSelected.bind(this);
            }
        }
    }
    
    /**
     * Új játék esetén legenerál véletlenszerűen Forest mezőket.
     *
     */
    _generateRandomForest() {
        const forestChance = 0.03;
        for (let x = 0; x < Defaults.width; ++x) {
            for (let y = 0; y < Defaults.height; ++y) {
                if (Math.random() < forestChance) {
                    let forest = new Buildings.Forest({age:10, x, y, grid: this._fields});
                    this._fields[x][y] = forest;
                    this.stage.addChild(forest);
                    forest.onclick = this._onFieldSelected.bind(this);
                } 
            }
        }
    }

    /**
     * Új játék esetén legenerálja a kezdő főutat.
     *
     */
    _generateMainStreet() {
        let x = 15;
        for(let y=0; y<3; ++y){
            let road = new Road({x, y, grid: this._fields});
            this.stage.addChild(road);
            this._fields[x][y] = road;
        }
    }

    /**
     * Segít függvény ami eldönit hogy (x,y) koordinátára
     * lehet e w szélességü, h magasságú épületet építeni.
     *
     * @param {number} x - Az x koordináta
     * @param {number} y - Az y koordináta
     * @param {number} w - Az épület szélessége
     * @param {number} h - Az épület magassága
     * @returns {boolean}
     */
    _canBuildAt(x,y,w,h){
        return  !this._fields[x][y] && 
                !this._fields[x+w-1][y+h-1] &&
                !this._fields[x+w-1][y] &&
                !this._fields[x][y+h-1];
    }

    /**
     * Lehelyez egy Field elemet a pályára.
     *
     * @param {function} constructor - A Field konstruktora
     * @param {number} x - Az x koordináta
     * @param {number} y - Az y koordináta
     */
    _buildBuilding(constructor, x, y) {
        let building = new constructor({x, y, grid: this._fields});
        if(!this._canBuildAt(x,y,building.size.width,building.size.height))
            return window.alert(`Az x: ${x + 1}, y: ${y + 1} helyre nem tudsz építkezni, mert az épület rálógna valamelyik környező épületre.`);

        if(building.countRoadNearby() == 0 && constructor.name !== 'Forest' && constructor.name !== 'Road')
            return window.alert(`Az x: ${x + 1}, y: ${y + 1} helyre nem tudsz építkezni, mert nincs út a közelben.`)

        if(building.countRoadNearby() == 0 && constructor.name === 'Road')
            return window.alert(`Az x: ${x + 1}, y: ${y + 1} helyre nem tudsz utat építeni. Az utnak csatlakoznia kell egy már meglévő úthoz!`)
        if(building.countRoadNearby() == 1 && constructor.name != 'Road' && building.getNextRoad().isEndOfRoad())
            return window.alert(`Az x: ${x + 1}, y: ${y + 1} helyre nem tudsz építkezni, mert így lezárod az utat!`)

        this.stage.addChild(building);
        building.onclick = this._onFieldSelected.bind(this);
        this._fields[x][y] = building;
        this._fields[x][y + building.size.height - 1] = building;
        this._fields[x + building.size.width - 1][y + building.size.height - 1] = building;
        this._fields[x + building.size.width - 1][y] = building;

        this._makePurchase({
            title: `(${x},${y}) helyen ${constructor.name} megépítve!`,
            value: constructor.price
        });
    }

    /**
     * Elvégez és elment egy vásárlást.
     * A pénz értéke lehet negatív is pl adó beszedés esetén,
     * ilyenkor az összeg hozzáadódik a jelenlegi vagyonhoz.
     *
     * @param {Object} purchase - A paraméter objektum
     * @param {string} purchase.title - A tétel neve
     * @param {string} purchase.value - A vásárlás értéke
     * @param {string} [purchase.additional] - A vásárlás leírása
     */
    _makePurchase({ title, value, additional }) {
        console.log(title, value, additional);
        this._money -= value;
        this._history.push({
            title,
            value: `${value}$`,
            additional,
        });
        this.view.dispatchEvent(new Event('money-changed'));
    }

    /**
     * Beállít a pályán egy zónát.
     *
     * @param {function} constructor - A zóna konstruktora
     * @param {number} x - Az x koordináta
     * @param {number} y - Az y koordináta
     */
    _setZone(constructor, x, y) {
        let zone = new constructor({x, y, grid: this._fields});
        if(this._fields[x][y])
            return window.alert(`Az x: ${x}, y: ${y} helyre nem tudsz építkezni, mert már foglalt: ${this._fields[x][y].constructor.name}`);

        if(zone.countRoadNearby() == 0)
            return window.alert(`Az x: ${x + 1}, y: ${y + 1} helyre nem tudsz zónát rakni mert nincs út a közelben.`);

        if(zone.countRoadNearby() == 1 && constructor.name != 'Road' && zone.getNextRoad().isEndOfRoad())
            return window.alert(`Az x: ${x + 1}, y: ${y + 1} helyre nem tudsz építkezni, mert így lezárod az utat!`)

        this._fields[x][y] = zone;
        this.setTax();
        this.stage.addChild(zone);
        zone.onclick = this._onZoneSelected.bind(this); 

        this._makePurchase({
            title: `(${x},${y}) helyen ${constructor.name} zóna kijelölve!`,
            value: constructor.price
        });
    }

    /**
     * Lebont egy Field elemet és visszaadja az árának egy részét.
     *
     * @param {number} x - Az x koordináta
     * @param {number} y - Az y koordináta
     * @param {boolean} [nopurchase] - Visszaadja e a Field árát
     * @throws {Error} - Nincs ezen a koordinátán Field
     */
    _removeField(x, y, nopurchase = false) {
        if(!this._fields[x][y]) throw new Error(`Nincs field x:${x} y:${y}`);
        let field = this._fields[x][y];
        this._fields[x][y + field.size.height - 1] = null;
        this._fields[x + field.size.width - 1][y + field.size.height - 1] = null;
        this._fields[x + field.size.width - 1][y] = null;
        this._fields[x][y] = null;
        field.destroy();

        if(nopurchase) { return; }
        this._makePurchase({
            title: `(${x},${y}) helyen ${field.constructor.name} lebontva!`,
            value: field.destroyValue,
        });
    }

    _onFieldSelected(e) {
        this._selectedField = e.target;
        this.view.dispatchEvent(new Event('building-selected'));
        this.view.dispatchEvent(new Event('field-selected'));
    }

    _onZoneSelected(e) {
        if(this._selectedZone) this._selectedZone.selected = false;
        this._selectedZone = e.target;
        this._selectedField = e.target;
        this._selectedZone.selected = true;
        this.view.dispatchEvent(new Event('zone-selected'));
        this.view.dispatchEvent(new Event('field-selected'));
    }

    /**
     * Feldolgozza a mentésből a lakók értékeit és visszaadja őket egy listában.
     *
     * @param {Object[]} citizens - A mentés citizens értéke
     * @returns {Object[]} A lakók
     */
    _parseCitizens(citizens = []) {
        let arr = [];
        citizens.forEach(({home, workplace, ...props}) =>
            arr.push({
                home: this._fields[home.x][home.y],
                workplace: this._fields[workplace.x][workplace.y],
                ...props,
            })
        );
        return arr;
    }
    
    /**
     * Feldolgoz egy mentést.
     *
     * @param {Object} params - A mentés json formában
     */
    _parseParams(params) {
        this._name = params?.name || Defaults.name;
        this._money = params?.money || Defaults.money;
        this._tax = params?.tax || Defaults.tax;
        this._size = {
            width: params?.width || Defaults.width,
            height: params?.height || Defaults.height,
        };
        this._date = params?.date || Defaults.date;
        this._satisfaction = params?.satisfaction || Defaults.satisfaction;
        this._population.citizens = this._parseCitizens(params?.citizens);
    
        //TODO
        // Set zones, buildings, roads from params JSON
        const buildingClasses = [
            Buildings.School,
            Buildings.Police,
            Buildings.University,
            Buildings.Forest,
            Buildings.Stadium
        ];
        const roadClasses = [Roads.Road];
        const zoneClasses = [
            Zones.Residential,
            Zones.Service,
            Zones.Industrial
        ];
    
        params.buildings.forEach(building => {
            const BuildingClass = buildingClasses.find(c => c.name === building.building);
            if (BuildingClass) {
                const { x, y, texturePath } = building;
                const newBuilding = new BuildingClass({ x, y, grid: this._fields, texturePath });
                this.stage.addChild(newBuilding);
                this._fields[x][y] = newBuilding;
                newBuilding.onclick = this._onFieldSelected.bind(this, newBuilding);
                this._setAction({
                    object: newBuilding,
                    event: 'field-selected',
                    callback: () => {
                        this._onFieldSelected(newBuilding);
                    },
                });
            }
        });
    
        params.roads.forEach(road => {
            const { x, y } = road;
            let newRoad = new Road({x, y, grid: this._fields});
            this.stage.addChild(newRoad);
            this._fields[x][y] = newRoad;
            newRoad.onclick = this._onFieldSelected.bind(this); 
            this._setAction({
                object: newRoad,
                event: 'field-selected',
                callback: () => {
                    this._onFieldSelected(road);
                },
            });
        });
    
        params.zones.forEach(zone => {
            const ZoneClass = zoneClasses.find(c => c.name === zone.building);
            if (ZoneClass) {
                const { x, y, texturePath } = zone;
                const newZone = new ZoneClass({ x, y, grid: this._fields, texturePath });
                this.stage.addChild(newZone);
                this._fields[x][y] = newZone;
                newZone.onclick = this._onFieldSelected.bind(this, newZone);
                this._setAction({
                    object: newZone,
                    event: 'field-selected',
                    callback: () => {
                        this._onFieldSelected(newZone);
                    },
                });
            }
        });
    
    
        this._roads = this.getFields(Roads.Road);
        this._zones = this.getFields(...zoneClasses);
        this._buildings = this.getFields(...buildingClasses);
    }
    
    /**
     * Beállít egy actiont.
     * A játék olyan állapotba kerül, hogy a játékostól várja az inputot.
     *
     * @param {Object} parameter - A parameter object
     * @param {HTMLElement} parameter.object - Az a dom element amire az eventListener rákerül
     * @param {string} parameter.event - Az event neve
     * @param {function} parameter.callback - A callback ami meghívódik ha elsült az event
     */
    _setAction({ object, event, callback }) {
        this._action = { object, event, callback };
        object.addEventListener(event, callback);
    }

    /**
     * Épület építő actiont beállítja.
     *
     * @param {string} building - Az építendő épület neve
     * @throws {Error} - Nincs ilyen épület
     */
    buildBuilding(building) {
        let constructor;
        switch (building) {
            case 'police':  constructor = Buildings.Police; break;
            case 'stadion': constructor = Buildings.Stadium; break;
            case 'school':  constructor = Buildings.School; break;
            case 'college': constructor = Buildings.University; break;
            case 'forest':  constructor = Buildings.Forest; break;
            default: throw new Error(`${constructor} building nincsen`);
        }
        let callback = () => {
            this._buildBuilding(constructor, this._selectedField.x, this._selectedField.y);
            this.view.dispatchEvent(new Event('action-finished')); 
        }
        this._setAction({
            object: this.view,
            event: 'field-selected',
            callback,
        });
    }

    /**
     * Zóna lehelyező actiont beállítja.
     *
     * @param {string} zone - A lehelyezendő zóna neve
     * @throws {Error} - Nincs ilyen zóna
     */
    setZone(zone) {
        let constructor;
        switch (zone) {
            case 'residential': constructor = Zones.Residential; break;
            case 'service': constructor = Zones.Service; break;
            case 'industrial': constructor = Zones.Industrial; break;
            default: throw new Error(`${constructor} zone nincsen`);
        }
        let callback = () => {
            let { x, y } = this._selectedField;
            this._setZone(constructor, x, y);

        }
        this._setAction({
            object: this.view,
            event: 'field-selected',
            callback,
        });
    }

    /**
     * Beállítja a fejlesztés actiont.
     *
     */
    upgrade() {
        this._setAction({
            object: this.view,
            event: 'field-selected',
            callback: () => {
                let { x, y } = this._selectedField;
                let zone = this._fields[x][y];
                if(!zone instanceof Zones.Zone) {
                    this.view.dispatchEvent(new Event('action-finished'));
                    return window.alert(`Az x: ${x}, y: ${y} helyen nincs zóna`);
                }
                if(zone.upgrade()) {
                    this._makePurchase({
                        title: `(${x},${y}) ${zone.constructor.name} Zóna fejlesztve`,
                        value: zone.upgradePrice,
                    });
                }
                else window.alert('Ezt a zónát nem lehet tovább fejleszteni');
            }
        })
    }
    
    /**
     * Beállítja az út építés actiont.
     *
     */
    buildRoad() {
        this._setAction({
            object: this.view,
            event: 'field-selected',
            callback: () => this._buildBuilding(Road, this._selectedField.x, this._selectedField.y),
        });
    }

    /**
     * Beállítja a lebontás acitont.
     *
     */
    destroyField() {
        let callback = () => {
            if (this._selectedField.isDestroyable()) {
                this._removeField(this._selectedField.x, this._selectedField.y);
                this._selectedField = null;
            }
            else{
                return window.alert(`Az x: ${this._selectedField.x}, y: ${this._selectedField.y} helyen lévő ${this._selectedField.constructor.name} nem elbontható!`);
            }
        }
        this._setAction({
            object: this.view,
            event: 'field-selected',
            callback,
        })
    }

    /**
     * Megszakítja az éppen futó actiont.
     *
     */
    cancelAction() {
        let { object, event, callback } = this._action;
        object.removeEventListener(event, callback);
        this._action = null;
    }

    /**
     * Előidéz egy katasztófát a városon, ami véletlenszerűen épületeket megsemmisít.
     *
     * @param {number} [duration] - Vizuálisan meddig tartson ezredmásodpercben
     */
    catastrophe(duration = 1000) {
        let shade = PIXI.Sprite.from(catastropheShade);
        shade.x = 0;
        shade.y = 0;
        shade.width = Defaults.width * Defaults.tileSize;
        shade.height = Defaults.height * Defaults.tileSize;
        this.stage.addChild(shade);
        setTimeout(() => { 
            shade.destroy();
            this.view.dispatchEvent(new Event('catastrophe-finished'));
        }, duration);

        let fields = this.getFields(Field);
        fields.forEach(field => {
            if(Math.random() > 0.08) return;
            if(field instanceof Road) return;
            if(field instanceof Zones.Zone) return;

            let {x, y, width, height} = field; 
            let fire = PIXI.Sprite.from(firePNG);
            fire.x = x*Defaults.tileSize;
            fire.y = y*Defaults.tileSize;
            fire.width = width;
            fire.height = height;
            this.stage.addChild(fire);

            setTimeout(() => {
                fire.destroy();
                this._removeField(x, y, true);
            }, duration);
        });
    }
}
