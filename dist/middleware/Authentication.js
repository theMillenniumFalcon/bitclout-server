"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authentication = void 0;
const Authentication = ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new Error("not authenticated");
    }
    return next();
};
exports.Authentication = Authentication;
//# sourceMappingURL=Authentication.js.map