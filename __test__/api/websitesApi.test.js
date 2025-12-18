import dotenv from "dotenv"
import axios from "axios"

dotenv.config({ quiet: true })

describe("fetch the websites list", () => {
  const URL = process.env.API_URI + "/websites"
  it("fetches the list of websites", async () => {
    const response = await axios.get(URL)

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("application/json")
    expect(response.data).toBeInstanceOf(Array)
  })
})

describe("fetch the list of subsites of a given website", () => {
  const validSiteCode = process.env.TEST_SITE_CODE
  const URL = process.env.API_URI + "/websites/" + validSiteCode + "/screens"
  it("fetches the list of subsites", async () => {
    const response = await axios.get(URL)

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("application/json")
    expect(response.data).toBeInstanceOf(Array)
  })

  it("returns the correct message and status code when the website does not exist", async () => {
    const response = await axios.get(process.env.API_URI + "/websites/XX-XXXX/screens")

    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("text/text;charset=UTF-8")
    expect(response.data).toMatch(/no screens found/i)
  })
})
