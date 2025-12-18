import dotenv from "dotenv"
import axios from "axios"

dotenv.config({ quiet: true })

describe("fetch list of vendors", () => {
  const vendor = process.env.TEST_VENDOR_ID
  const URL = process.env.API_URI + "/vendors/search/" + vendor

  it("fetches the list of vendors matched agains a given query", async () => {
    const response = await axios.get(URL)

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("application/json")
    expect(response.data).toBeInstanceOf(Array)
  })

  it("receives an error text when no vendor were found", async () => {
    const URL = process.env.API_URI + "/vendors/search/INVALIDVENDOR"
    const response = await axios.get(URL)

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("text/text;charset=UTF-8")
    expect(response.data).toMatch(/no vendors/i)
  })
})
