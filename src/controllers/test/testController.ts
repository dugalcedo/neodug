///// /api/test

import { Router } from "express";
import { defineHandler, defineMiddleware } from "../../util/routeHandling.js";

const testRouter = Router()

testRouter.use(defineMiddleware((_req) => {
    console.log("THIS IS A TEST ROUTE")
}))

testRouter.get('/', defineHandler((req) => {

    return {
        data: {
            luckyNumber: Math.floor(Math.random()*100),
            domain: req.$originDomain,
            path: req.$originPath
        }
    }
}))

export default testRouter