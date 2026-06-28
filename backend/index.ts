import express from "express"
import { createClient } from "redis"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prisma/client"
import jwt from "jsonwebtoken"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const client = await createClient()
  .connect()


const app = express()
app.use(express.json())



app.post("signup", async (req, res) => {
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

app.post("signin", async (req, res) => {
  const { username, password } = req.body
  const userExists = await prisma.user.findUnique({ where: username })

  if (!userExists) {
    return res.status(403).json({ message: "User doesn't exists" })
  }

  if (userExists.password !== password) {
    return res.status(403).json({ message: "Incorrect Password!" })
  }

  const token = jwt.sign({
    username: userExists.username
  }, process.env.JWT_SECRET)

  res.status(200).json({ token })
})


app.post("submissions", (req, res) => {

})

app.get("submissions/:submissionsId", (req, res) => {

})


app.listen(3000)


