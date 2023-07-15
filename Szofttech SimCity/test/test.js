import { Defaults } from '../src/defaults.js'
import * as Building from '../src/field/buildings.js'
import { Road } from '../src/field/road.js'
import * as Zone from '../src/field/zone.js'
import { Population } from '../src/population/population.js';
import { Citizen } from '../src/population/citizen.js'

function addToGrid(grid, field) {
    let { x, y, type } = field;
    let f = new type({ x, y, grid: grid });
    grid[x][y] = f;
    grid[x+f.size.width-1][y] = f;
    grid[x][y+f.size.height-1] = f;
    grid[x+f.size.width-1][y+f.size.height-1] = f;
}

function makeGrid(fields = []) {
    let grid = [];
    for (let x=0; x<Defaults.width; ++x)
        grid[x] = [];

    fields.forEach(field => addToGrid(grid, field) );
    return grid;
}

// function printGrid(grid) {
//     console.log('grid:');
//     let i = 0;
//     grid.forEach(row => {
//         let arr = [];
//         row.forEach(cell => {
//             if(cell) arr.push(cell.constructor.name);
//             else arr.push('');
//         });
//         console.log(i++, JSON.stringify(arr.reverse()));
//     });
// }
//
// function printArr(arr) {
//     let out = [];
//     arr.forEach(cell => {
//         if(cell) out.push(cell.constructor.name);
//         else out.push('');
//     });
//     console.log(JSON.stringify(out.reverse()));
// }

const grid = makeGrid([
    { x: 0, y: 0, type: Zone.Service },
    { x: 0, y: 1, type: Zone.Residential },
    { x: 0, y: 2, type: Zone.Industrial },
    { x: 1, y: 0, type: Road },
    { x: 1, y: 1, type: Road },
    { x: 1, y: 2, type: Road },
    { x: 1, y: 3, type: Road },
    { x: 2, y: 0, type: Building.Stadium },
    { x: 2, y: 2, type: Building.Police },
]);

describe('Field', () => {
    describe('getNeighbours', () => {
        it('all four sides', () => { return grid[1][1].getNeighbours().length === 4 });
        it('only two', () => { return grid[0][0].getNeighbours().length === 2 });
        it('only two', () => { return grid[2][2].getNeighbours().length === 2 });
        it('only two', () => { return grid[0][2].getNeighbours().length === 2 });
        it('only two', () => { return grid[2][0].getNeighbours().length === 2 });
        it('only three', () => { return grid[0][1].getNeighbours().length === 3 });
        it('only three', () => { return grid[1][0].getNeighbours().length === 3 });
        it('only three', () => { return grid[1][2].getNeighbours().length === 4 });
        it('only three', () => { return grid[2][1].getNeighbours().length === 4 });
    });

    describe('hasNearby', () => {
        it('instanceof Building.Police', () => { return grid[1][1].hasNearby(Building.Police) });
        it('instanceof Building.Stadium', () => { return grid[1][1].hasNearby(Building.Stadium) });
        it('!instanceof Building.Forest', () => { return !grid[1][1].hasNearby(Building.Forest) });
        it('!instanceof Building.School', () => { return !grid[1][1].hasNearby(Building.School) });
        it('instanceof Zone.Service', () => { return grid[1][1].hasNearby(Zone.Service) });
        it('instanceof Zone', () => { return grid[1][1].hasNearby(Zone.Zone) });
        it('instanceof Road', () => { return grid[1][1].hasNearby(Road) });
        it('matches', () => { return grid[1][1].hasNearby(grid[1][2]) });
    });

    describe('countRoadNearby', () => {
        it('end of road', () => { return grid[1][2].countRoadNearby().length === 1 });
        it('has two', () => { return grid[1][1].countRoadNearby().length === 1 });
    });

    describe('matches', () => {
        it('===', () => { return grid[1][1].matches(grid[1][1]) });
        it('!==', () => { return grid[1][1].matches(grid[1][2]) });
        it('Road type', () => { return grid[1][1].matches(Road) });
        it('Zone type', () => { return grid[0][0].matches(Zone.Zone) });
        it('Service Zone', () => { return grid[0][0].matches(Zone.Service) });
        it('Stadium Building', () => { return grid[0][0].matches(Building.Stadium) });
        it('not Zone', () => { return !grid[0][0].matches(Zone.Zone) });
    });

    describe('isEndofRoad()', () => {
        it('end', () => { return grid[1][2].isEndOfRoad() });
        it('also end', () => { return grid[1][0].isEndOfRoad() });
        it('!end', () => { return !grid[1][1].isEndOfRoad() });
    });

    describe('isDestroyable', () => {
        it('end of road is destroyable', () => { return grid[1][3].isDestroyable() });
        it('built around road is not', () => { return !grid[1][1].isDestroyable() });
        it('any building is destroyable', () => { return grid[2][0].isDestroyable() });
    });

    describe('getNextRoad', () => {
        it('next', () => { return grid[1][0].getNextRoad() === grid[1][1] });
        it('next', () => { return grid[1][1].getNextRoad() === grid[1][2] });
        it('next', () => { return grid[1][2].getNextRoad() === grid[1][3] });
        it('next', () => { return grid[1][3].getNextRoad() === grid[1][2] });
    });
})

describe('Population', () => {
    const getFields = (grid, filter) => {
        let zones = [];
        grid.forEach(row => row.forEach(field => {
            if(field instanceof filter){
                zones.push(field);
            }
        }));
        return zones;
    }

    describe('getSatisfactionByZone', () => {
        const population = new Population({ getFields: (f) => getFields(grid, f), getMoney: () => { return 0 } });

        it('zero citizens', () => { return population.getSatisfactionByZone(Zone.Zone) === 0 });
        describe('one citizen', () => {
            let { _, satisfaction } = population.update({ date: 0 });

            it('one citizen', () => { return population._citizens.length === 1 });
            it('has satisfaction', () => { return satisfaction > 0 });
        });
    });
});

describe('Citizen', () => {
    const grid = makeGrid([
        { x: 2, y: 1, type: Zone.Service },
        { x: 2, y: 2, type: Zone.Residential },
    ]);
    let citizen = new Citizen({
        home: grid[2][2],
        workplace: grid[2][1],
        getMoney: () => { return 30000 }
    });

    describe('satisfaction', () => {
        let satisfaction0 = citizen.satisfaction;
        it('has satisfaction', () => { return satisfaction0 > 0 });

        addToGrid(grid, { x: 0, y: 4, type: Building.Forest });
        citizen.update();
        let satisfaction1 = citizen.satisfaction;
        it('more with Forest nearby', () => { satisfaction0 < satisfaction1  });

        addToGrid(grid, { x: 2, y: 3, type: Zone.Industrial });
        citizen.update();
        let satisfaction2 = citizen.satisfaction;
        it('less with Industrial Zone', () => { satisfaction1 > satisfaction2 });

        addToGrid(grid, { x: 0, y: 0, type: Building.Stadium });
        citizen.update();
        let satisfaction3 = citizen.satisfaction;
        it('has more with Stadium', () => { satisfaction2 < satisfaction3 });

        citizen.home._tax = 18;
        citizen.update();
        let satisfaction4 = citizen.satisfaction;
        it('has less with more tax', () => { satisfaction3 > satisfaction4 });
        
    });

    describe('payTax', () => {
        let payedTax0 = citizen.payTax();
        it('pays tax', () => { return payedTax0 > 0 });

        citizen.education = Citizen.EDUCATION.INTERMEDIATE;
        let payedTax1 = citizen.payTax();
        it('pays more when educated', () => { return payedTax1 > payedTax0 });

        citizen._age = 65;
        it('takes pension', () => { return citizen.payTax() < 0 });
    });
})
