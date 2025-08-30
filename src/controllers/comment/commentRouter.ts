///// /api/comment
import { Router } from "express";
import { defineHandler } from "../../util/routeHandling.js"
import { supabase } from "../../database/supabase.js";
import { validateBody } from "../../ware/validateBody.js"

const commentRouter = Router()

commentRouter.get("/", defineHandler(async req => {

    const { data: comments } = await supabase
        .from('comment')
        .select(`
            *, 
            domain:domain_id (*)
        `)
        .eq('domain.value', req.$originDomain)
        .throwOnError()

    

    return {
        message: "Comments retrieved",
        data: comments
    }
}))

commentRouter.post("/", defineHandler(async req => {

    await validateBody(req, {
        author: {
            type: "string",
            trim: true,
            removeSpaces: true
        },
        body: {
            type: "string",
            trim: true,
            removeSpaces: true
        }
    })

    const { data: domain } = await supabase
        .from('domain')
        .select()
        .eq('value', req.$originDomain)
        .single()

    if (!domain) throw {
        status: 404,
        message: `Domain not registered: "${req.$originDomain}"`
    }

    const { data: newComment } = await supabase
        .from('comment')
        .insert({
            author: req.body.author,
            body: req.body.body,
            domain_id: domain.id
        })
        .order("created_at", { ascending: true }) // why not working?
        .select()
        .single()

    return {
        message: "Comment added",
        data: newComment
    }

}))

export default commentRouter