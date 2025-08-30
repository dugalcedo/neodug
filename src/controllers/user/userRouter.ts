////////// /api/user
import { supabase } from "../../database/supabase.js";
import { defineHandler } from "../../util/routeHandling.js";
import { Router } from "express";
import bcrypt from 'bcryptjs'
import validator from "validator";
import { validateBody } from "../../ware/validateBody.js";

const userRouter = Router()


type RegisterBody = {
    username: string
    password: string
    domain: string
}

userRouter.post("/register", defineHandler(async (req) => {
    
    await validateBody(req, {
        username: {
            type: 'string',
            trim: true,
            lcrs: true,
            len: [3, 50]
        },
        password: {
            type: 'string',
            validation: {
                validator: validator.isStrongPassword,
                message: `Password must be at least 8 characters long and have one of each: lowercase, uppercase, number, symbol`
            }
        },
        domain: {
            type: 'string',
            validation: {
                validator: (v) => {
                    return v === 'localhost:5500' || validator.isURL(v)
                },
                message: `Domain must be a URL`
            }
        }
    })

    const { username, password, domain }: RegisterBody = req.body
    
    const { data: newUser } = await supabase
        .from('user')
        .insert({ 
            username,
            password: await bcrypt.hash(password, 7)
         })
        .select()
        .single()
        .throwOnError()


    const { data: newDomain, error: createDomainError } = await supabase
        .from('domain')
        .insert({ value: domain, user_id: newUser.id })
        .select()
        .single()

    if (createDomainError) {
        // rollback
        await supabase.from('user').delete().eq('id', newUser.id)
        throw createDomainError
    }

    return {
        status: 201,
        message: "New user and domain registered.",
        data: {
            user: newUser,
            domain: newDomain
        }
    }

}))

export default userRouter