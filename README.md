# multi-network-onboard

Using [Sequence](docs.sequence.xyz), for the use cases requiring testnet and mainnet logins that yields a claimable hash for central store keeping for users, retrievable via email.

### use cases 
- central airdrops
- decentralized claimables

### 1. packed hash claim, signed & distributed centrally
- address 1: EOA
- address 2: Mainnet Sequence
- address 3: Testnet Sequence
- uint: nonce
- uint: testParam (optional) for claims after a certain time use `blocknumber` or other (e.g. # of games won)

```js
import { ethers } from 'ethers';

(() => {
    // Create a wallet to sign the message with
    let privateKey = '...';
    let wallet = new ethers.Wallet(privateKey);

    const args = [,,,,]
    let message = ethers.utils.solidityKeccak256(["address", "address", "address", "uint", "uint"], args)

    let _sig = await wallet.signMessage(message);
})()

```

### 2. smart contract, verifying signature to claim came from contract owner

note: can be composed into an ERC721 

```s
contract Claimable is Ownable {

  using ECRecovery for bytes32;
  
  mapping(address => uint) public nonces_;

  function claim(address _genesisEOA, address _mainnetSequenceAddress, bytes _sig, address _contractAddress) public returns(bool) {
    
    // Recreate the message, which also confirms the msg.sender matches the arguments in the signature
    bytes32 message = keccak256(abi.encodePacked(msg.sender, _genesisEOA, _mainnetSequenceAddress, nonces_[msg.sender]++, _contractAddress));
    bytes32 preFixedMessage = message.toEthSignedMessageHash();
    
    // Confirm the signature came from the owner, eth.util.sign(...)
    require(owner == ECRecovery.recover(preFixedMessage, _sig));

    return true;
  }

}
```

note: this is necessary to onboard users before sequence transfers to v2 where testnet addresses and mainnet addresses are the same.
