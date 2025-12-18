import dotenv from "dotenv"
import axios from "axios"

dotenv.config({ quiet: true })

describe("fetching of accounts", () => {
  describe("fetch an active account details", () => {
    const validAccountId = process.env.TEST_ACCOUNT_ID
    const URL = process.env.API_URI + "/accounts/" + validAccountId

    it("fetches the account details when account exists", async () => {
      const response = await axios.get(URL)

      const expectedProperties = [
        "ACCOUNT_ID",
        "ACCOUNT_NICK",
        "ACCOUNT_PASS",
        "SITE_CODE",
      ]

      expect(response.status).toBe(200)
      expect(response.headers["content-type"]).toBe("application/json")

      for (let prop of expectedProperties)
        expect(response.data).toHaveProperty(prop)
    })

    it("returns the correct message and status code when the account does not exist", async () => {
      const response = await axios.get(
        process.env.API_URI + "/accounts/" + "XX-XXXX"
      )

      expect(response.status).toBe(200)
      expect(response.headers["content-type"]).toBe("text/text;charset=UTF-8")
      expect(response.data).toContain("No found account")
    })
  })

  describe("fetch a disabled account details", () => {
    const validAccountId = process.env.TEST_DISABLED_ACCOUNT_ID
    const URL = process.env.API_URI + "/accounts_killed/" + validAccountId

    it("fetches the account details when account exists", async () => {
      const response = await axios.get(URL)

      const expectedProperties = [
        "ACCOUNT_ID",
        "ACCOUNT_NICK",
        "ACCOUNT_PASS",
        "SITE_CODE",
        "ACTION_DATE",
        "MOTIVE",
      ]

      expect(response.status).toBe(200)
      expect(response.headers["content-type"]).toBe("application/json")

      for (let prop of expectedProperties)
        expect(response.data).toHaveProperty(prop)
    })

    it("returns an correct message and status code when the account does not exist", async () => {
      const response = await axios.get(
        process.env.API_URI + "/accounts_killed/" + "XX-XXXX"
      )

      expect(response.status).toBe(200)
      expect(response.headers["content-type"]).toBe("text/text;charset=UTF-8")
      expect(response.data).toContain("No found account")
    })
  })
})
