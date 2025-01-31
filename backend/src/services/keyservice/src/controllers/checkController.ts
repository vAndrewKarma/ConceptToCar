const checksController = {
  async healthcheck(_req, res) {
    return res.status(200).send('OK')
  },
}

export default checksController
