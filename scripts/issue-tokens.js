const DBank = artifacts.require('DBank');

module.exports = async function issueRewards(callback) {
    let dBank = await DBank.deployed();
    await dBank.issueTokens();
    console.log('Tokens have been issued successfully');
    callback();
}