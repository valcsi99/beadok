import * as Buildings from '../field/buildings.js';
import * as Zones from '../field/zone.js'
import { Citizen } from './citizen.js'

export class Population{
    constructor({ getFields, getMoney, citizens, taxCollected, guaranteed }){
        this._getFields = getFields;
        this._getMoney = getMoney;
        this._citizens = citizens || [];
        this._taxCollected = taxCollected || 0;
        this._guaranteed = guaranteed || 10;
    }

    /**
     * Visszaadja a paraméterül kapott zóna Elégedettségét.
     *
     * @param {zone} zone - Lekérni kívánt zóna
     */
    getSatisfactionByZone(zone) {
        let max = 0;
        let satisfaction = 0;
        this._citizens.forEach(citizen => {
            let { home, workplace } = citizen;
            if(home.matches(zone) || workplace.matches(zone)) {
                max += Citizen.MAX_SATISFACTION;
                satisfaction += citizen.satisfaction;
            }
        });
        if(max === 0) return 0;
        return satisfaction/max; // 0-1
    }

    /**
     * Kiszámolja a beköltözés valószínűségét.
     *
     * @param {zone} home - Beköltözni kívánt lakó leendő otthona
     * @param {zone} workplace - Beköltözni kívánt lakó leendő munkahelye
     */
    chanceCalculator(home,workplace){
        let chance = 5.0;
        chance *= this.getSatisfactionByZone(Zones.Zone) + 0.5;
        home.hasNearby(Zones.Industrial) ? chance-- : chance++;
        home.hasNearby(workplace) ? chance += 2 : chance--;
        return chance;
    }
    
    /**
     * Fejleszti a lakosok oktatási szintjét.
     */
    _citizensGainEducation() {
        const maxEducated = this._citizens.length * 0.3;
        let intermediate = 0, advanced = 0;
        this._citizens.forEach(citizen => {
            if(citizen.education === Citizen.EDUCATION.ADVANCED) advanced++;
            if(citizen.education === Citizen.EDUCATION.INTERMEDIATE) intermediate++;
        });
        let uni = this._getFields(Buildings.University).length * 10;
        let school = this._getFields(Buildings.School).length * 10;
        this._citizens.forEach(citizen => {
            if(citizen.age > 60) return;
            if(citizen.education === Citizen.EDUCATION.BASIC
                    && intermediate < maxEducated && school > 0){

                citizen.education = Citizen.EDUCATION.INTERMEDIATE;
                ++intermediate; --school;
            }
            if(citizen.education === Citizen.EDUCATION.INTERMEDIATE
                    && advanced < maxEducated && uni > 0){

                citizen.education = Citizen.EDUCATION.ADVANCED;
                ++advanced; --uni;
            }
        });
    }

    /**
     * Beköltöztat egy új lakót ha van szabad lakás és munkahely.
     *
     * @param {boolean} force - Számol-e valószínűséget vagy nem
     */
    _newCitizen(force = false) {
        const service = this._getFields(Zones.Service).filter(zone => zone.available > 0);
        const industrial = this._getFields(Zones.Industrial).filter(zone => zone.available > 0);
        const residential = this._getFields(Zones.Residential).filter(zone => zone.available > 0);

        if(!(residential.length > 0 && (service.length > 0 || industrial.length > 0)) )
            return;

        let workplace, home,workplace1,workplace2;
        let chance;
        let random = Math.floor(Math.random() * 10) + 1;
        residential.forEach(zone => { if(zone.available > 0) home = zone });
        service.forEach(zone => { if(zone.available > 0) workplace1 = zone });
        industrial.forEach(zone => { if(zone.available > 0) workplace2 = zone });

        if (workplace1 != undefined && workplace2 === undefined) {
            workplace = workplace1;
        }
        else if (workplace2 != undefined && workplace1 === undefined) {
            workplace = workplace2;
        }
        else if (workplace1 !== undefined && workplace2 !== undefined) {
            Math.floor(Math.random() * 2) === 0 ? workplace = workplace1 : workplace = workplace2;
        }

        chance = this.chanceCalculator(home,workplace);

        if (force) {
            this._citizens.push(new Citizen({
            getMoney: this._getMoney,
            home: home.citizenMove(true),
            workplace: workplace.citizenMove(true),
            age: Math.floor(Math.random() * (60 - 18 + 1)) + 18,
            }));
            home.update();
            workplace.update();
            --this._guaranteed;
        }
        else if (random < chance) {
            this._citizens.push(new Citizen({
                getMoney: this._getMoney,
                home: home.citizenMove(true),
                workplace: workplace.citizenMove(true),
                age: Math.floor(Math.random() * (60 - 18 + 1)) + 18,
                }));
                home.update();
                workplace.update();
        }
        
    }

    /**
     * Frissíti a lakosokat (adóztatja őket havonta, évente pedig növeli az oktatásukat) 
     *
     * @param {int} date - Aktuális dátum
     */
    update({ date }) {
        this._citizens = this._citizens.filter(citizen => {
            let reason = citizen.update();
            if(reason === 'died'){
                this._newCitizen(true);
                return false;
            } 
            if(reason === 'left') return false;
            return true;
        });
        if(this._guaranteed > 0){
            this._newCitizen(true);
        }
        else{
            this._newCitizen();
        }
        

        let tax = 0;
        if(date % 30 === 0){
            this._citizens.forEach(citizen => this._taxCollected += citizen.payTax() );
            tax = this._taxCollected;
            this._taxCollected = 0;
        }
        if(date % 365 === 0){
            this._citizens.forEach(cizizen => ++cizizen.age);
            this._citizensGainEducation();
        }

        return {
            tax,
            satisfaction: this.getSatisfactionByZone(Zones.Zone),
        }
    }
}
