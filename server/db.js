const {Pool} = require('pg')
const pool = new Pool({
  user: 'peter',
  host: 'localhost',
  database: 'postgres',
  password: null
})

module.exports = {
  async query(text, params) {
    const res = await pool.query(text, params)
    return res.rows
  }
}
