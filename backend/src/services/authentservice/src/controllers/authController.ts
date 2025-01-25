const authcontroller = {
  async RegisterController(req, res) {
    return res.status(200).send(req.body)
  },
}

export default authcontroller
