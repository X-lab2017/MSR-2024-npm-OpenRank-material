import Neo4j from "./neo4j";
import getLogger from "./logger";
import { readFileSync, writeFileSync } from 'fs';

(async () => {

  const neo4j = new Neo4j();
  const logger = getLogger('NPM OpenRank');

  const backGroundNodeLabel = 'BACKGROUND';
  const backGroundIds = {
    user: 1,
    repo: 2,
  };

  const userFactorMap = new Map<string, Factors>();

  // calculate the OpenRank for each step
  const calculateStep = async (factors: Factors, step: number) => {
    const graphName = `npm_graph_${step}`;
    const activityCaluse = `${factors.issueCommentFactor}*a.issue_comment+${factors.openIssueFactor}*a.open_issue+${factors.openPullFactor}*a.open_pull+${factors.reviewCommentFactor}*a.review_comment`;
    // drop the graph first
    await neo4j.runQuery(`CALL gds.graph.drop('${graphName}', false);`);
    const createGDSGraphQuery = `
CALL gds.graph.create.cypher(
  '${graphName}',
  '
MATCH (r:Repo) RETURN id(r) AS id, ${factors.repoAttribute} AS retentionFactor, r.initial AS initValue
UNION ALL
MATCH (u:User) RETURN id(u) AS id, ${factors.userAttribute} AS retentionFactor, u.initial AS initValue
UNION ALL
MATCH (b:${backGroundNodeLabel}) RETURN id(b) AS id, 0.1 AS retentionFactor, 0.0 AS initValue;',
  '
MATCH (b:${backGroundNodeLabel}{id:${backGroundIds.user}}) WITH b
MATCH (u:User) WITH COUNT(u) AS totalUser, b
MATCH (u:User) RETURN id(b) AS source, id(u) AS target, 1.0/totalUser AS weight
UNION ALL
MATCH (b:${backGroundNodeLabel}{id:${backGroundIds.repo}}) WITH b
MATCH (r:Repo) WITH COUNT(r) AS totalRepo, b
MATCH (r:Repo) RETURN id(b) AS source, id(r) AS target, 1.0/totalRepo AS weight
UNION ALL
MATCH (b:${backGroundNodeLabel}{id:${backGroundIds.user}}) WITH b
MATCH (u:User) WITH u, b
OPTIONAL MATCH (u)-[f:FOLLOW]->(:User) WITH u, b, COUNT(f) AS totalFollow
RETURN id(u) AS source, id(b) AS target, ${factors.userFollow}*1.0/(totalFollow + 1) AS weight
UNION ALL
MATCH (u:User) WITH u
MATCH (u)-[f:FOLLOW]->(:User) WITH u, COUNT(f) AS totalFollow
MATCH (u)-[f:FOLLOW]->(u2:User) WITH u, u2, totalFollow
RETURN id(u) AS source, id(u2) AS target, ${factors.userFollow}*1.0/(totalFollow + 1) AS weight
UNION ALL
MATCH (b:${backGroundNodeLabel}{id:${backGroundIds.repo}}) WITH b
MATCH (r:Repo) WITH r, b
OPTIONAL MATCH (r)-[d:DEPEND]->(:Repo) WITH r, b, COUNT(d) AS totalDepend
RETURN id(r) AS source, id(b) AS target, ${factors.repoDependency}*1.0/(totalDepend + 1) AS weight
UNION ALL
MATCH (r:Repo) WITH r
MATCH (r)-[d:DEPEND]->(:Repo) WITH r, COUNT(d) AS totalDepend
MATCH (r)-[d:DEPEND]->(r2:Repo) WITH r, r2, totalDepend
RETURN id(r) AS source, id(r2) AS target, ${factors.repoDependency}*1.0/(totalDepend + 1) AS weight
UNION ALL
MATCH (u:User) WITH u
MATCH (u)-[a:ACTION]->(:Repo) WITH u, SUM(${activityCaluse}) AS totalActivity
MATCH (u)-[a:ACTION]->(r:Repo) WITH u, a, r, totalActivity
RETURN id(u) AS source, id(r) AS target, ${factors.userActivity}*(${activityCaluse}) / totalActivity AS weight
UNION ALL
MATCH (r:Repo) WITH r
MATCH (:User)-[a:ACTION]->(r) WITH r, SUM(${activityCaluse}) AS totalActivity
MATCH (u:User)-[a:ACTION]->(r) WITH r, a, u, totalActivity
RETURN id(r) AS source, id(u) AS target, ${factors.repoActivity}*(${activityCaluse}) / totalActivity AS weight
  '
)
YIELD graphName AS graph, nodeCount AS nodes, relationshipCount AS rels`;
    const createGraphResult = await neo4j.runQuery(createGDSGraphQuery);
    logger.info(`Create GDS graph done, result=${JSON.stringify(createGraphResult)}`);

    // use OpenRank GDS algorithm to calculate the value
    const result = await neo4j.runQuery(`CALL xlab.pregel.openrank.write('${graphName}',{initValueProperty:'initValue',retentionFactorProperty:'retentionFactor',relationshipWeightProperty:'weight',tolerance:0.001,maxIterations:40,writeProperty:'',suffix:'_${step}'});`);
    logger.info(`Calcualte OpenRank for step ${step} done. result=${JSON.stringify(result)}`);

    // drop the graph after use
    await neo4j.runQuery(`CALL gds.graph.drop('${graphName}', false);`);
    logger.info(`Calcualte OpenRank for step ${step} done.`);
    return result;
  };

  // calculate the factors for each step
  const calculateFactors = async (step: number) => {
    if (userFactorMap.size === 0) {
      // first step, intialize the factors from survey file
      const userData: any[] = JSON.parse(readFileSync('data/survey_result.json').toString());
      userData.forEach(d => {
        userFactorMap.set(d.login, {
          repoActivity: d.repoAct,
          repoDependency: d.repoDep,
          repoAttribute: d.repoAttr,
          userActivity: d.devAct,
          userFollow: d.devFol,
          userAttribute: d.devAttr,
          issueCommentFactor: d.issueComment,
          openIssueFactor: d.openIssue,
          openPullFactor: d.openPull,
          reviewCommentFactor: d.reviewComment,
        });
      });
    }

    let totalOpenrank = 0;
    const factors: Factors = {
      repoActivity: 0,
      repoDependency: 0,
      repoAttribute: 0,
      userActivity: 0,
      userFollow: 0,
      userAttribute: 0,
      issueCommentFactor: 0,
      openIssueFactor: 0,
      openPullFactor: 0,
      reviewCommentFactor: 0,
    };
    for (const login of userFactorMap.keys()) {
      const userInfo = await neo4j.runQuery(`MATCH (u:User{login:"${login}"}) RETURN COALESCE(u.open_rank_${step}, 1) AS openrank, u.login AS login`);
      totalOpenrank += userInfo[0].openrank;
      for (const key of Object.keys(factors)) {
        factors[key] += userFactorMap.get(login)![key] * userInfo[0].openrank;
      }
    }
    for (const key of Object.keys(factors)) {
      factors[key] = factors[key] / totalOpenrank;
    }
    return factors;
  };


  const calculateOpenrank = async () => {
    logger.info('Start to calculate openrank.');
    const factorArray: Factors[] = [];
    const resultArray: any[] = [];
    do {
      const factors = await calculateFactors(factorArray.length);
      if (factorArray.length > 0) {
        const lastFactors = factorArray[factorArray.length - 1];
        const equal = (a: number, b: number): boolean => {
          return Math.abs(a - b) <= 0.001;
        };
        if ([
          'issueCommentFactor', 'openIssueFactor', 'openPullFactor', 'reviewCommentFactor',
          'repoActivity', 'repoDependency', 'repoAttribute',
          'userActivity', 'userFollow', 'userAttribute'].every(k => equal(factors[k], lastFactors[k]))) {
          break;
        }
      }
      logger.info(`Factors for step ${factorArray.length} is ${JSON.stringify(factors)}`);
      factorArray.push(factors);
      const result = await calculateStep(factors, factorArray.length);
      resultArray.push(result);
    } while (true);
    logger.info(`Calculate all openrank done. Total outer iterations: ${factorArray.length}`);

    // write back the calculation results
    writeFileSync('data/result.json', JSON.stringify(resultArray, null, 2));
    // write back the factors
    writeFileSync('data/factors.json', JSON.stringify(factorArray, null, 2));
  };

  logger.info('Start to calculate the OpenRank of NPM ecology.');
  await calculateOpenrank();
  neo4j.close();
  logger.info('Calculate OpenRank for NPM ecology finished.');

})();

interface Factors {
  repoActivity: number;
  repoDependency: number;
  repoAttribute: number;
  userActivity: number;
  userFollow: number;
  userAttribute: number;
  openIssueFactor: number;
  issueCommentFactor: number;
  openPullFactor: number;
  reviewCommentFactor: number;
}
