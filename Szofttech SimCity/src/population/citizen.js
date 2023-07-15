import * as Buildings from '../field/buildings.js'
import * as Zones from '../field/zone.js';

export class Citizen{
    static EDUCATION = {
        BASIC: 0,
        INTERMEDIATE: 1,
        ADVANCED: 2,
    }

    static MAX_SATISFACTION = 10;

    constructor({getMoney, home, workplace, age, education, tax_payed, years_taxed} = {}) {
        this._getMoney = getMoney;
        this._home = home || null;
        this._workplace = workplace || null;
        this._tax_payed = tax_payed || 0;
        this._years_taxed = years_taxed || 0;
        this._age = age || 18; // 18 - 60
        this.education = education || Citizen.EDUCATION.BASIC;
        this.update();
    }

    set age(amount) { this._age += amount; }
    get age() { return this._age; }
    get home() { return this._home; }
    get workplace() { return this._workplace; }
    get satisfaction() { return this._satisfaction; }

    /**
     * Citizen-enkénti adóv összegével tér vissza
     */
    payTax() { //& getPension
        let tax = Math.floor(
            100000 * (this.education+1)/100 * this._home.tax/100 * this._workplace.tax/100
        );

        if(this._age > 45 && this._age < 65) {
            this._years_taxed++;
            this._tax_payed += tax;
        }

        if(this._age > 65)
            return (-1)*(this._tax_payed / this._years_taxed)/2;

        return tax;
    }

    /**
     * 65 év feletti randomizált elhalálozás
     */
    _death() {
        if(this._age < 65) return false;
        if(this._age/200 > Math.random()) return true;
    }
    /**
     * Elégedettséget frissít, halált és város elhagyást kalkulál.
     */
    update() {
        // TODO közbiztonság annál fontosabb minél nagyobb a population
        this._satisfaction = Citizen.MAX_SATISFACTION;
        [
            !this._home.hasNearby(Zones.Industrial),
            this._home.hasNearby(this._workplace),
            this._home.hasNearby(Buildings.Police),
            this._workplace.hasNearby(Buildings.Police),
            this._home.hasNearby(Buildings.Stadium),
            this._workplace.hasNearby(Buildings.Stadium),
            this._home.hasNearby(Buildings.Forest),
            this._home.tax < 18,
            this._workplace.tax < 18,
            this._home.Service_Equals_Industrial(),
            !(this._getMoney() < 0),
            !(this._getMoney() < -10000),
            !(this._getMoney() < -20000),
            !(this._getMoney() < -30000),
            !(this._getMoney() < -40000),
            !(this._getMoney() < -50000),
        ]
        .forEach(point => { if(!point) --this._satisfaction });
        
        if(this._death())
            return 'died';

        if(this._age < 65 && this._satisfaction < 0)
            return 'left';

        return false;
    }
}
