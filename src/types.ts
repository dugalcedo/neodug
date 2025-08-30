import type { 
    NextFunction,
    Request, 
    Response 
} from "express"

type P<T> = T | Promise<T>;
type A<T> = T | T[];

export type NeodugHandler = (req: Request) => P<NeodugResponse>

export type NeodugResponse_base = {
    status?: number
    statusText?: string
    message?: string
}

export type NeodugResponse_JSON = NeodugResponse_base & {
    type?: "json"
    data?: any
}

export type NeodugResponse_HTML = NeodugResponse_base & {
    type: "html"
    html: string
}

export type NeodugResponse = (
    | NeodugResponse_JSON
    | NeodugResponse_HTML
)

export type NeodugMiddleware = (req: Request) => P<NeodugResponse | void>

export type BodyValidationFunction<T = any> = ((v: T) => P<boolean>)

export type BodyValidationCustomValidation<T = any> = A<{
    validator: BodyValidationFunction<T>,
    message: string
}>

export type BodyValidationOption_base = {
    type: (
        | 'string'
        | 'number'
        | 'boolean'
    )
}

export type BodyValidationOption_string = BodyValidationOption_base & {
    type: 'string'
    trim?: boolean
    len?: [number, number?]
    validation?: BodyValidationCustomValidation<string>
    lowercase?: boolean
    removeSpaces?: boolean
    lcrs?: boolean
}

export type BodyValidationOption<T = any> = (
    | BodyValidationOption_string
)
