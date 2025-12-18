import dotenv from "dotenv"
import axios from "axios"

dotenv.config({ quiet: true })

describe("fetch messages", () => {
  it("fetches messages without a given category", async () => {
    const URL = process.env.API_URI + "/messages"
    const response = await axios.get(URL)

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("application/json")
    expect(response.data).toBeInstanceOf(Array)
  })

  it("fetches messages with a given category", async () => {
    const category = process.env.TEST_MESSAGES_CATEGORY
    const URL = process.env.API_URI + "/messages?category=" + category
    const response = await axios.get(URL)

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("application/json")
    expect(response.data).toBeInstanceOf(Array)
  })
})

describe("fetch total number of messages", () => {
  it("fetches the total number of messages", async () => {
    const URL = process.env.API_URI + "/messages/total"
    const response = await axios.get(URL)

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("application/json")
    expect(response.data).toHaveProperty("TOTAL_MESSAGES")
  })

  it("fetches the total number of messages of a given category", async () => {
    const category = process.env.TEST_MESSAGES_CATEGORY
    const URL = process.env.API_URI + "/messages/total?category=" + category
    const response = await axios.get(URL)

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("application/json")
    expect(response.data).toHaveProperty("TOTAL_MESSAGES")
  })
})
