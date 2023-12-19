import neo4j = require('neo4j-driver');
import parser = require('parse-neo4j');

export default class Neo4j {

  private _driver: any;

  private get driver() {
    if (!this._driver) {
      this._driver = neo4j.driver('bolt://localhost:7687');
    }
    return this._driver;
  };

  public async runQuery<T = any>(query: string, params?: any) {
    const session = this.driver.session();
    const r = await session.run(query, params);
    await session.close();
    return parser.parse(r) as T;
  }

  public async close() {
    await this.driver.close();
  }

}
