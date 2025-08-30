import dotenv from 'dotenv'; dotenv.config();
import app from "./config/express.js";
import { testSupabaseConnection } from './database/supabase.js';

// Routers
import testRouter from './controllers/test/testController.js';
app.use("/api/test", testRouter)
import userRouter from './controllers/user/userRouter.js';
app.use("/api/user", userRouter)
import commentRouter from './controllers/comment/commentRouter.js';
app.use("/api/comment", commentRouter)
import htmlRouter from './controllers/html/htmlRouter.js';
app.use(htmlRouter)

// Not found
app.use(/.+/gm, (req, res) => {
    res.status(404)
    res.send("NOT FOUND")
})

// Start
start()
async function start() {
    const port = process.env.PORT || 7654

    const connected = await testSupabaseConnection()

    if (!connected) app.use((req, res) => {
        res.status(503)
        res.json({
            error: true,
            message: "Database down"
        })
    })

    app.listen(port, () => {
        console.log(`
            ***********************************
            | NEODUG ~ http://localhost:${port}/ |
            ***********************************
        `)
    })
}

// Helps  vercel?
export default app