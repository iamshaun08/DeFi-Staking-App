import React, {Component} from 'react';
import  './App.css';
import Navbar from './Navbar';
import Main from './Main';
import Web3 from 'web3';
import Tether from '../truffle_abis/Tether.json';
import RWD from '../truffle_abis/RWD.json';
import DBank from '../truffle_abis/DBank.json';

class App extends Component {
    
    async UNSAFE_componentWillMount() {
        await this.loadWeb3();
        await this.loadBlockchainData();
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert("No ethereum browser detected!");
        }
    }

    async loadBlockchainData() {
        const web3 = window.web3;
        const account = await web3.eth.getAccounts();
        this.setState({account: account[0]})
        // console.log(account);
        
        const networkID = await web3.eth.net.getId();
        // console.log(networkID, 'Network ID: ')

        const tetherData = Tether.networks[networkID];
        if (tetherData) {
            const tether = new web3.eth.Contract(Tether.abi, tetherData.address);
            this.setState({tether});
            let tetherBalance = await tether.methods.balanceOf(this.state.account).call();
            this.setState({tetherBalance: tetherBalance.toString()});
            // console.log({balance: tetherBalance});
        } else {
            window.alert("Error: Tether not deployed!");
        }

        const rwdData = RWD.networks[networkID];
        if (rwdData) {
            const rwd = new web3.eth.Contract(RWD.abi, rwdData.address);
            this.setState({rwd});
            let rwdBalance = await rwd.methods.balanceOf(this.state.account).call();
            this.setState({rwdBalance: rwdBalance.toString()});
            // console.log({balance: rwdBalance});
        } else {
            window.alert("Error: RWD not deployed!");
        }

        const dBankData = DBank.networks[networkID];
        if (dBankData) {
            const dBank = new web3.eth.Contract(DBank.abi, dBankData.address);
            this.setState({dBank});
            let stakingBalance = await dBank.methods.stakingBalance(this.state.account).call();
            this.setState({stakingBalance: stakingBalance.toString()});
            // console.log({balance: stakingBalance});
        } else {
            window.alert("Error: DBank not deployed!");
        }
        this.setState({loading: false});
    }

    stakeTokens = (amount) => {
        this.setState({loading: true});
        this.state.tether.methods.approve(this.state.dBank._address, amount).send({from: this.state.account}).on('transactionHash', (hash) => {
            this.state.dBank.methods.depositTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
                this.setState({loading: false});
            })
        })
    }

    unstakeTokens = () => {
        this.setState({loading: true});
        this.state.dBank.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
            this.setState({loading: false});
        })
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '0x0',
            tether: {},
            rwd: {},
            dBank: {},
            tetherBalance: '0',
            rwdBalance: '0',
            stakingBalance: '0',
            loading: true
        }
    }

    
    render() {
        let content;

        {this.state.loading ?
        content = <p id='loader' className='text-center' style={{margin: '30px'}}>LOADING...</p> :
        content = <Main
        tetherBalance={this.state.tetherBalance}
        rwdBalance={this.state.rwdBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        />
        }
        return (
            <div>
                <Navbar account = {this.state.account}/>
                <div className='container-fluid mt-5'>
                    <div className='row'>
                        <main role='main' className='col-lg-12 ml-auto mr-auto' style={{maxWidth: '600px', minHeight: '100vm'}}>
                            <div>
                                {content}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }
}

export default App;