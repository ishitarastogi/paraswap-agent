// const TRANSFER= 
//   `event Transfer(address indexed from, address indexed to, uint256 value)`

const ADAPTER_INITIALIZED=
`event AdapterInitialized(address indexed adapter)`
const ROUTER_INITIALIZED=
`event RouterInitialized(address indexed router)`
const TRANSFER_TOKENS:string = 
"function transferTokens(address token, address payable destination, uint256 amount)"

const SET_IMPLEMENTATION:string = 
"function setImplementation(bytes4 selector, address implementation)"
const SET_FEE_WALLET:string = 
  "function setFeeWallet(address payable _feeWallet)"
const REGISTER_PARTNER="function registerPartner(address partner, uint256 _partnerShare, bool _noPositiveSlippage, bool _positiveSlippageToUser, uint16 _feePercent, string calldata partnerId, bytes calldata _data)"

export default {
 
  TRANSFER_TOKENS,
  SET_IMPLEMENTATION,
  SET_FEE_WALLET,
  ADAPTER_INITIALIZED,
  ROUTER_INITIALIZED,
 REGISTER_PARTNER
};
