import express from "express"
import { createClient } from "redis"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prisma/client"
import jwt from "jsonwebtoken"
import { envFiles } from "./auth/env.ts"
import { authMiddleware } from "./auth/middleware.ts"

const adapter = new PrismaPg({ connectionString: envFiles.databaseUrl, ssl: true })
console.log("DB URL:", envFiles.databaseUrl)
const prisma = new PrismaClient({ adapter })

const client = await createClient()
  .connect()

const app = express()
app.use(express.json())


app.post("/signup", async (req, res) => {
  const { username, password } = req.body

  if (await prisma.user.findUnique({ where: { username } })) {
    return res.status(409).json({ message: "Username already exists" })
  }

  await prisma.user.create({
    data: {
      username,
      password
    }
  })

  res.status(200).json({ message: "You've signed up!" })
})

app.post("/signin", async (req, res) => {
  const { username, password } = req.body
  const userExists = await prisma.user.findUnique({ where: { username } })

  if (!userExists) {
    return res.status(403).json({ message: "User doesn't exists" })
  }

  if (userExists.password !== password) {
    return res.status(403).json({ message: "Incorrect Password!" })
  }

  const token = jwt.sign({
    userId: userExists.id
  }, envFiles.jwtSecret)

  res.status(200).json({ token })
})


app.post("/submissions", authMiddleware, async (req, res) => {
  const userId = req.userId
  const code = req.body.code
  const language = req.body.language


  await prisma.submission.create({
    data: {
      user: {
        connect: {
          id: userId
        }
      },
      code,
      language,
    }
  })

  client.lPush("problems", JSON.stringify({
    userId, code, language
  }))

  res.json({
    message: "Processing"
  })


})

app.get("/submissions/:submissionsId", (req, res) => {

})


app.listen(3000, () => console.log("backend listening to 3000"))


