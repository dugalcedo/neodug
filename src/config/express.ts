import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

// View engine
app.set('views', 'views')
app.set('view engine', 'pug')

// Config
app.use(express.static('public'))
app.use(cors())
app.use(express.json({ type: '*/*' }))
app.use(cookieParser())

// Middleware
app.use((req, res, next) => {
    // Request
    req.$title = `${req.method} ${req.url}`
    try {
        const origin = req.get('origin') || req.get('referrer')
        const url = new URL(origin)
        req.$originDomain = url.host
        req.$originPath = url.pathname
    } catch {}
    if (!req.body) req.body = {}

    // Logger start
    console.log(`\n⭐ New Request: ${req.$title}`)

    res.on('finish', () => {
        console.log(`\n--- End of ${req.$title} ${"-".repeat(40)}\n`)
    })

    next()
})

export default app
