import type { RequestHandler, Request, Response } from "express";
import type { NeodugHandler, NeodugMiddleware, NeodugResponse } from "../types.js";

export const defineHandler = (handler: NeodugHandler): RequestHandler => {
    return async (req, res) => {
        try {
            const response = await handler(req)
            expressifyNeodugResponse(req, res, response)
        } catch (error) {
            console.log(`Error at ${req.$title}`)
            console.log(error)
            expressifyNeodugError(req, res, error || {})
        }
    }
}

export const defineMiddleware = (middleware: NeodugMiddleware): RequestHandler => {
    return async (req, res, next) => {
        try {
            const response = await middleware(req)
            if (!response) {
                next()
                return
            };
            expressifyNeodugResponse(req, res, response)
        } catch (error) {
            console.log(`Error at ${req.$title}`)
            console.log(error)
            expressifyNeodugError(req, res, error)
        }
    }
}

// Helpers

export const expressifyNeodugResponse = (
    req: Request, 
    res: Response, 
    neo: NeodugResponse
) => {

    res.status(neo.status || 200)

    switch (neo.type) {

        case "html":
            res.header('Content-Type', 'text/html')
            res.send(neo.html)
            break

        case "json":
        case undefined:
        default:
            res.json({
                error: false,
                message: neo.message || "Success",
                data: neo.data
            })
            break

    } // END SWITCH

}

export const expressifyNeodugError = (
    req: Request,
    res: Response,
    error: Record<string, any>
) => {
    res.status(error.status || 500)
    res.json({
        error: true,
        message: error.statusText || error.message || "Internal server error",
        data: error.data
    })
}