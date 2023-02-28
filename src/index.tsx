import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { SequenceConnector } from '@0xsequence/wagmi-connector'
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import {
  useAccount, useConnect, useDisconnect,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected'

import { mainnet } from '@wagmi/chains'
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains(
  [mainnet],
  [
    publicProvider()
  ]
);

  const connectors = [
    // new SequenceConnector({
    //   chains,
    //   options: {
    //     connect: {
    //       app: 'boomland',
    //       networkId: 137
    //     }
    //   }
    // }),
    new MetaMaskConnector({
      chains,
    }),
  ]
  
  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider
  })


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <WagmiConfig client={wagmiClient}>
    <App />
</WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
