import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
//Import routes
import healthCheckRouter from "./routes/healthCheck.route.js"
import userRouter from "./routes/user.routes.js"

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
  })
)

//common middleware
app.use(express.json({limit:"32kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())

//Routes
app.use("/api/v1/healthcheck",healthCheckRouter)
app.use("/api/v1/users",userRouter)

export { app }