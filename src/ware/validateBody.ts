import { Request } from "express"
import type { BodyValidationCustomValidation, BodyValidationFunction, BodyValidationOption } from "../types.js"



export const validateBody = async (req: Request, options: Record<string, BodyValidationOption>) => {
    const errors: string[] = []

    for (const key in options) {
        const opt = options[key]
        let { errors: optionErrors, newValue } = await handleBodyValidationOption(key, opt, req.body[key])
        req.body[key] = newValue
        errors.push(...optionErrors)
    }

    if (errors.length) throw {
        status: 400,
        message: "Invalid input",
        data: {
            errors
        }
    }
}

// Helpers

async function handleBodyValidationOption(key: string, opt: BodyValidationOption, value: any): Promise<{
    errors: string[],
    newValue: any
}> {
    const errors: string[] = []

    // sanitization
    switch (opt.type) {
        case 'string':
            if (typeof value !== 'string') {
                errors.push('must be a string')
                return
            }
            value = sanitizeString(key, opt, value)
            break
    }

    // custom validation
    if (opt.validation) {
        errors.push(...(await handleBodyCustomValidation(key, opt.validation, value)))
    }

    // built-in validation
    switch (opt.type) {
        case 'string':
            errors.push(...(validateString(key, opt, value)))
            break
    }

    return {
        errors,
        newValue: value
    }
}

async function handleBodyCustomValidation(key: string, validation: BodyValidationCustomValidation, value: any): Promise<string[]> {
    const errors: string[] = []
    const arr = Array.isArray(validation) ? validation : [validation]
    for (const { validator, message } of arr) {
        if (!validator(value)) errors.push(message)
    }
    return errors
}

// Sanitizers

function sanitizeString(key: string, opt: BodyValidationOption, value: string): string {

    if (opt.trim) {
        value = value.trim()
    }

    if (opt.lcrs || opt.lowercase) {
        value = value.toLowerCase()
    }

    if (opt.lcrs || opt.removeSpaces) {
        value = value.replaceAll(/\s+/gm, ' ')
    }

    return value

}

// Built-in validators

function validateString(key: string, opt: BodyValidationOption, value: string): string[] {
    const errors: string[] = []

    if (opt.len) {
        const [min, max = Infinity] = opt.len
        let msg = ""
        if (value.length < min || value.length > max) {
            msg = `${key} must be at least ${min}`
            if (max < Infinity) msg += ` and ${max}`
            msg += ` characters long`
            errors.push(msg)
        }
    }

    return errors
}