// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import './RWD.sol';
import './Tether.sol';



contract DBank {
    address public owner;
    string public name = 'DBank';
    Tether public tether;
    RWD public rwd;

    address[] public stakers;
    
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaked;

    constructor(RWD _rwd, Tether _tether) public {
        rwd = _rwd;
        tether = _tether;
        owner = msg.sender;
    }

    function depositTokens(uint _amount) public {
        require(_amount > 0, 'Amount cannot be 0!');
        //Transfer tether tokens to this contract address for staking
        tether.transferFrom(msg.sender, address(this), _amount);

        //update staking balance
        stakingBalance[msg.sender] += _amount;

        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        isStaked[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    function issueTokens() public {
        require(msg.sender == owner, 'the caller must be the owner');

        for (uint i = 0; i < stakers.length; i++) {
            address recepient = stakers[i];
            uint balance = stakingBalance[recepient];
            if (balance > 0) {
                rwd.transfer(recepient, balance/9);
            }
        }
    }

    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, 'staking balance should be greater than 0');
        tether.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isStaked[msg.sender] = false;
    }

}