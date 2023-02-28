import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import { useSigner, useProvider, useAccount, useConnect, useDisconnect } from 'wagmi'

import { ethers } from 'ethers'
import { sequence } from '0xsequence'

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const steps = ['Login with Genesis NFT', 'Register with Sequence', 'Login to Sequence'];

// const abi = require('ethereumjs-abi');

const doc: any = {
    genesisWalletAddress: '',
    testnetAddress: '',
    mainnetAddress: '',
    id: ''
}

let count = 0
function SequenceLogin(props: any) {
  const [countDOM, setCountDOM] = useState(0)
  sequence.initWallet(props.network)

  const connectTestNet = async () => {
    count++
    setCountDOM(count)
    console.log(countDOM)
    const wallet = sequence.getWallet()

    const connectWallet = await wallet.connect({
      app: 'onboard',
      networkId: props.network == 'polygon' ? 137 : 80001,
      authorize: true,
      settings: {
        theme: 'dark'
      },
      askForEmail: true
    })

    console.log('chainId:', await wallet.getChainId())

    if(props.network == 'polygon' && count == 1){
      
      doc.mainnetAddress = connectWallet?.session?.accountAddress
      console.log('chainId:', await wallet.getChainId())
    } else if(count > 1){
      const nonce = 0
      const args = [props.genesisAccountAddress, doc.mainnetAddress, connectWallet?.session?.accountAddress, nonce]
      console.log(args)
      console.log('chainId:', await wallet.getChainId())
      console.log([ethers.utils.solidityKeccak256(["address", "address", "address", "uint"], args), connectWallet?.email])
    }
    props.handleNext()
  }

  return(<>
      <br/>
      <button className="connect-button" onClick={connectTestNet}>connect</button>
  </>)
}
function Genesis(props: any) {
  return(<>
  {props.connectors.map((connector: any) => (
        <button
          className="connect-button"
          disabled={!connector.ready}
          key={connector.id}
          onClick={async () => {
            await props.connect({ connector })
            console.log(props.genesisAccountAddress)
            props.handleNext()
          }}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
          {/* {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'} */}
        </button>
      ))}
  </>)
}

function HorizontalLinearStepper(props: any) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const [panel, setPanel] = React.useState(null)

  const Compass = (activeStep: any, connectors: any, connect: any, address: any, handleNext: any) => {
    let navigator;
      switch(activeStep){
        case 0:
          navigator = <Genesis genesisAccountAddress={props.address} connectors={connectors} connect={connect} handleNext={handleNext}/>
          break;
        case 1:
          navigator = <SequenceLogin network={'polygon'} handleNext={handleNext}/>
          break;
        default:
          navigator = <SequenceLogin genesisAccountAddress={props.address} network={'mumbai'} handleNext={handleNext}/>
      }
    return(
      <>
      <br/>
      <br/>
      <br/>
      <br/>
        {
          navigator
        }
      </>
    )
  }
  const isStepOptional = (step: number) => {
    return step === 4;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
    count = 0;
    props.disconnect()
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
            <p className="completion">All steps completed - you&apos;re finished</p>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          {Compass(activeStep, props.connectors, props.connect, props.address, handleNext)}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            {activeStep === steps.length - 1 ? <Button onClick={handleNext}>
              {'Finish'}
            </Button> : null}
            
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}


function App() {

  const { address, isConnected } = useAccount()
  const provider = useProvider()
  const { data: signer } = useSigner()

  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const { disconnect } =  useDisconnect()

  window.onbeforeunload = function(){
    disconnect()
  };

  return (
    <div className="App">
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <img className="center" src="https://sequence.xyz/sequence-wordmark.svg" />
      <br/>
      <br/>
      <br/>
      <div>
      <p className="address">{address ? address?.slice(0,20)+"...": null}</p>
      <HorizontalLinearStepper connectors={connectors} connect={connect} disconnect={disconnect} address={address}/>
    </div>
    </div>
  );
}

export default App;
