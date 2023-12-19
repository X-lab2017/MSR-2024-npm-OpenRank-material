"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j = require("neo4j-driver");
const parser = require("parse-neo4j");
class Neo4j {
    get driver() {
        if (!this._driver) {
            this._driver = neo4j.driver('bolt://localhost:7687');
        }
        return this._driver;
    }
    ;
    async runQuery(query, params) {
        const session = this.driver.session();
        const r = await session.run(query, params);
        await session.close();
        return parser.parse(r);
    }
    async close() {
        await this.driver.close();
    }
}
exports.default = Neo4j;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVvNGouanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuZW80ai50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUF1QztBQUN2QyxzQ0FBdUM7QUFFdkMsTUFBcUIsS0FBSztJQUl4QixJQUFZLE1BQU07UUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7U0FDdEQ7UUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUFBLENBQUM7SUFFSyxLQUFLLENBQUMsUUFBUSxDQUFVLEtBQWEsRUFBRSxNQUFZO1FBQ3hELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEMsTUFBTSxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzQyxNQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFNLENBQUM7SUFDOUIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFLO1FBQ2hCLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM1QixDQUFDO0NBRUY7QUF0QkQsd0JBc0JDIn0=