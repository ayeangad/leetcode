import express from "express"
import { createClient } from "redis"
import { prisma } from "./db"


const client = await createClient()
  .connect()

const app = express()
app.use(express.json())


app.post("/submissions", async (req, res) => {
  const code = req.body.code
  const language = req.body.language


  const response = await prisma.submission.create({
    data: {
      code,
      language,
      status: "Processing"
    }
  })

  client.lPush("problems", JSON.stringify({
    submissionId: response.id, code, language
  }))

  res.json({
    message: "Processing",
    id: response.id
  })


})

app.get("/submissions/:submissionsId", async (req, res) => {
  const submissionId = req.params.submissionsId

  const response = await prisma.submission.findFirst({
    where: {
      id: submissionId
    }
  })

  res.json({ submissions: response })

})


app.listen(3000, () => console.log("backend listening to 3000"))


