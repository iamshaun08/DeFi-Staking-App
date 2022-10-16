const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const DBank = artifacts.require('DBank');

require('chai')
.use(require('chai-as-promised'))
.should()

contract('DBank', ([owner, customer]) => {
    
    let tether, rwd, dBank;

    function tokens(eth) {
        return web3.utils.toWei(eth, 'ether');
    }

    before(async () => {
        tether = await Tether.new();
        rwd = await RWD.new();
        dBank = await DBank.new(rwd.address, tether.address);

        await rwd.transfer(dBank.address, tokens('1000000'));
        await tether.transfer(customer, tokens('100'), {from: owner});

    })  
    
    describe('Tether Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await tether.name();
            assert.equal(name, 'Tether')
        })
    })

    describe('RWD Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await rwd.name();
            assert.equal(name, 'Reward Token')
        })
    })

    describe('DBank Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await dBank.name();
            assert.equal(name, 'DBank')
        })

        it('contract has tokens', async () => {
            let balance = await rwd.balanceOf(dBank.address);
            assert.equal(balance, tokens('1000000'));
        })
    })

    describe('Yeild Farming', async () => {
        it('rewards tokens for staking', async () => {
            let result;
            result = await tether.balanceOf(customer);
            assert.equal(result.toString(), tokens('100'), 'customer wallet balance');

            await tether.approve(dBank.address, tokens('100'), {from: customer});
            await dBank.depositTokens(tokens('100'), {from: customer});

            result = await tether.balanceOf(customer);
            assert.equal(result.toString(), tokens('0'), 'new customer wallet balance');

            result = await tether.balanceOf(dBank.address);
            assert.equal(result.toString(), tokens('100'), 'bank balance after staking');

            result = await dBank.isStaked(customer);
            assert.equal(result.toString(), 'true', 'staking status of customer after staking');

            await dBank.issueTokens({from: owner});
            await dBank.issueTokens({from: customer}).should.be.rejected;

            await dBank.unstakeTokens({from: customer});

            result = await tether.balanceOf(customer);
            assert.equal(result.toString(), tokens('100'), 'new customer wallet balance');

            result = await tether.balanceOf(dBank.address);
            assert.equal(result.toString(), tokens('0'), 'bank balance after unstaking');

            result = await dBank.isStaked(customer);
            assert.equal(result.toString(), 'false', 'staking status of customer after unstaking');

        })
    })
})