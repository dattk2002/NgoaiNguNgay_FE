import React from 'react';
import WalletMain from '../components/wallet/WalletMain';

const WalletPage = ({ showPaymentReturn = false }) => {
  return (
    <div className="wallet-page">
      <WalletMain showPaymentReturn={showPaymentReturn} />
    </div>
  );
};

export default WalletPage; 