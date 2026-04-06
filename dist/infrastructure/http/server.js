"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LogController_1 = require("./controllers/LogController");
const Logger_1 = require("../../shared/Logger");
const PORT = process.env.PORT || 3000;
const logger = Logger_1.Logger.getInstance();
LogController_1.app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map