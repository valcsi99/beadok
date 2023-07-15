import * as Building from '../field/buildings.js'
import * as Zone from '../field/zone.js'
import { Road } from '../field/road.js'
import { Defaults } from '../defaults.js';

customElements.define('action-panel',
class ActionPanel extends HTMLDivElement{

    // time buttons
    _stopBtn = document.createElement('button')
    _startBtn = document.createElement('button')
    _speed1Btn = document.createElement('button')
    _speed2Btn = document.createElement('button')
    
    // zone buttons
    _residentialBtn = document.createElement('button')
    _industrialBtn = document.createElement('button')
    _serviceBtn = document.createElement('button')

    //buildings
    _policeBtn = document.createElement('button')
    _stadionBtn = document.createElement('button')
    _schoolBtn = document.createElement('button')
    _collegeBtn = document.createElement('button')
    _forestBtn = document.createElement('button')

    //other
    _roadBtn = document.createElement('button')
    _destroyBtn = document.createElement('button')
    _upgradeBtn = document.createElement('button')

    //tax spinners
    _residentialTax = document.createElement('input')
    _industrialTax = document.createElement('input')
    _serviceTax = document.createElement('input')

    constructor() {
        super();
        this.classList.add('action-panel');
        
        //time
        this._stopBtn.innerHTML += '<i class="fa fa-pause"></i>';
        this._stopBtn.id = "_stopBtn";
        this._stopBtn.className = "time";
        this._startBtn.innerHTML += '<i class="fa fa-play"></i>';
        this._startBtn.id = "_startBtn";
        this._startBtn.className = "time";
        this._speed1Btn.innerHTML += '<i class="fa fa-forward"></i>';
        this._speed1Btn.id = "_speed1Btn";
        this._speed1Btn.className = "time";
        this._speed2Btn.innerHTML += '<i class="fa fa-forward"><i class="fa fa-forward"></i></i>';
        this._speed2Btn.id = "_speed2Btn";
        this._speed2Btn.className = "time";

        //zone
        this._setButton(this._residentialBtn, "_residentialBtn", "Lakó", Zone.Residential.price)
        this._setButton(this._industrialBtn, "_industrialBtn", "Ipari", Zone.Industrial.price)
        this._setButton(this._serviceBtn, "_serviceBtn", "Szolgáltatási", Zone.Service.price)
    
        //buildings
        this._setButton(this._policeBtn, "_policeBtn", "Rendőrség", Building.Police.price)
        this._setButton(this._stadionBtn, "_stadionBtn", "Stadion", Building.Stadium.price)
        this._setButton(this._schoolBtn, "_schoolBtn", "Gimnázium", Building.School.price)
        this._setButton(this._collegeBtn, "_collegeBtn", "Egyetem", Building.University.price)
        this._setButton(this._forestBtn, "_forestBtn", "Erdő", Building.Forest.price)
    
        //other
        this._setButton(this._roadBtn, "_roadBtn", "Út", Road.price)
        this._setButton(this._destroyBtn, "_destroyBtn", "Bontás", null)
        this._setButton(this._upgradeBtn, "_upgradeBtn", "Fejlesztés", Zone.Zone.upgradePrice)
    
        //tax spinners
        this._setInputfield(this._residentialTax,'_residentialTax', 'Lakó Zóna ')
        this._setInputfield(this._industrialTax,'_industrialTax', 'Ipari Zóna ')
        this._setInputfield(this._serviceTax,'_serviceTax', 'Szolgáltatási Zóna ')
        this._buildUI();
    }

    /**
     * Beállít egy gombot.
     *
     * @param {HTMLButtonElement} element - A button
     * @param {string} id - A button id selectorja
     * @param {string} label - A button tartalma
     * @param {string} [cost] - A művelet ára
     */
    _setButton(element, id, label, cost){
        element.innerHTML = `
            ${label} <br>
            ${cost ? cost + '$' : ''}
        `;
        element.id = id;
        element.className = 'construction';
    }

    /**
     * Beállít egy tax slider-t.
     *
     * @param {HTMLInputElement} element - Az input dom element
     * @param {string} id - Az input id selectorja
     * @param {string} label - A slider címkéje
     */
    _setInputfield(element, id, label){
        element.id = id;
        element.setAttribute('type', 'range');
        element.setAttribute('min', '0');
        element.setAttribute('max', '40');
        element.setAttribute('value', Defaults.tax);

        element.label = document.createElement('h4');
        element.label.innerText = label;
        element.label.spanValue = document.createElement('span');
        element.label.spanValue.innerText = element.value+'%';
        element.label.appendChild(element.label.spanValue);

        element.addEventListener('input', () => element.label.spanValue.innerText = element.value+'%');
    }

    /**
     * Felépíti a panel dom structuráját.
     */
    _buildUI(){
        let timeBox = document.createElement('div');
        let zoneBox = document.createElement('div');
        let buildingsBox1 = document.createElement('div');
        let buildingsBox2 = document.createElement('div');
        let otherBox = document.createElement('div');
        let taxBox = document.createElement('div');

        timeBox.classList.add('htimebox');
        zoneBox.classList.add('hbox');
        buildingsBox1.classList.add('hbox');
        buildingsBox2.classList.add('hbox');
        otherBox.classList.add('hbox');
        taxBox.classList.add('vtaxbox');

        timeBox.appendChild(this._stopBtn);
        timeBox.appendChild(this._startBtn);
        timeBox.appendChild(this._speed1Btn);
        timeBox.appendChild(this._speed2Btn);
        
        zoneBox.appendChild(this._residentialBtn);
        zoneBox.appendChild(this._industrialBtn);
        zoneBox.appendChild(this._serviceBtn);
    
        buildingsBox1.appendChild(this._policeBtn);
        buildingsBox1.appendChild(this._stadionBtn);
        buildingsBox1.appendChild(this._schoolBtn);
        buildingsBox2.appendChild(this._collegeBtn);
        buildingsBox2.appendChild(this._forestBtn);
    
        otherBox.appendChild(this._roadBtn);
        otherBox.appendChild(this._destroyBtn);
        otherBox.appendChild(this._upgradeBtn);

        taxBox.appendChild(this._residentialTax.label);
        taxBox.appendChild(this._residentialTax);
        taxBox.appendChild(this._industrialTax.label);
        taxBox.appendChild(this._industrialTax);
        taxBox.appendChild(this._serviceTax.label);
        taxBox.appendChild(this._serviceTax);

        this.innerHTML += `<h3>Idő módosítás</h3>`
        this.appendChild(timeBox);
        this.innerHTML += `<h3>Zónák</h3>`
        this.appendChild(zoneBox);
        this.innerHTML += `<h3>Kiszolgáló épületek</h3>`
        this.appendChild(buildingsBox1);
        this.appendChild(buildingsBox2);
        this.innerHTML += `<h3>Egyéb műveletek</h3>`
        this.appendChild(otherBox);
        this.innerHTML += `<h3>Adók</h3>`
        this.appendChild(taxBox);
    }
}, { extends: 'div' })
