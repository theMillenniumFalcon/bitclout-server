import { Context } from "../types/types";
import { MiddlewareFn } from "type-graphql";

export const Authentication: MiddlewareFn<Context> = ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new Error("not authenticated")
    }

    return next()
}
