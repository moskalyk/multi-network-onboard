# multi-network-onboard

Using [Sequence](docs.sequence.xyz), for the use cases requiring testnet and mainnet logins that yields a claimable hash for central store keeping for users, retrievable via email.

### use cases 
- central airdrops
- decentralized claimables

### packed hash claim
- address 1: EOA
- address 2: Mainnet Sequence
- address 3: Testnet Sequence
- uint: nonce
- uint: blocknumber (optional) for claims after a certain time

```
const args = [...]
ethers.utils.solidityKeccak256(["address", "address", "address", "uint"], args)
```

note: this is necessary to onboard users before sequence transfers to v2 where testnet addresses and mainnet addresses are the same.