const { connect } = require("mongoose");
const chalk = require("chalk")

module.exports = async(client, mongo) => {
  connect(mongo, {
    useNewUrlParser: true,
    autoIndex: false
    }).then(async()=>{
        console.log(chalk.green.bgGreen.bold("DB Connected."))
    }).catch(err=>{
        console.error(err)
        console.log(chalk.green.bgGreen.bold("DB Error."))
    })
}