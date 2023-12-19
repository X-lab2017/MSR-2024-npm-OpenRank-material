"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const neo4j_1 = tslib_1.__importDefault(require("./neo4j"));
const logger_1 = tslib_1.__importDefault(require("./logger"));
(async () => {
    const neo4j = new neo4j_1.default();
    const logger = (0, logger_1.default)('NPM OpenRank');
    const backGroundNodeLabel = 'BACKGROUND';
    const backGroundIds = {
        user: 1,
        repo: 2,
    };
    logger.info('Start to calculate the OpenRank of NPM ecology');
    neo4j.close();
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbnJhbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJvcGVucmFuay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw0REFBNEI7QUFDNUIsOERBQWlDO0FBRWpDLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFFVixNQUFNLEtBQUssR0FBRyxJQUFJLGVBQUssRUFBRSxDQUFDO0lBQzFCLE1BQU0sTUFBTSxHQUFHLElBQUEsZ0JBQVMsRUFBQyxjQUFjLENBQUMsQ0FBQztJQUV6QyxNQUFNLG1CQUFtQixHQUFHLFlBQVksQ0FBQztJQUN6QyxNQUFNLGFBQWEsR0FBRztRQUNwQixJQUFJLEVBQUUsQ0FBQztRQUNQLElBQUksRUFBRSxDQUFDO0tBQ1IsQ0FBQztJQUVGLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0RBQWdELENBQUMsQ0FBQztJQUU5RCxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyJ9