import dotenv from "dotenv"
import axios from "axios"

dotenv.config({ quiet: true })

describe("fetch the details of a reclaim", () => {
  const reclaim = process.env.TEST_RECLAIM_ID
  const URL = process.env.API_URI + "/reclaims/" + reclaim

  const expectedProperties = [
    "RECLAIM_ID",
    "USER_EMAIL",
    "ACCOUNT_ID",
    "ORDER_ID",
  ]

  it("fetches a reclaim", async () => {
    const response = await axios.get(URL)

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("application/json")

    for (let prop of expectedProperties)
      expect(response.data).toHaveProperty(prop)
  })

  it("returns the correct message and status code when the reclaim does not exist", async () => {
    const response = await axios.get(process.env.API_URI + "/reclaims/XX-XXXX")

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("text/text;charset=UTF-8")
    expect(response.data).toMatch(/no reclaim/i)
  })
})
