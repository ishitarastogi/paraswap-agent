const TRANSFER= 
  `event Transfer(address indexed from, address indexed to, uint256 value)`

const ADAPTER_INITIALIZED=
`event AdapterInitialized(address indexed adapter)`
const ROUTER_INITIALIZED=
`event RouterInitialized(address indexed router)`
const TRANSFER_TOKENS = 
  "function transferTokens(address,address payable ,uint256)"

const SET_IMPLEMENTATION = 
  "function setImplementation(bytes4 , address )"

const SET_FEE_WALLET = 
  "function setFeeWallet(address payable _feeWallet)"

const REGISTER_PARTNER="function registerPartner(address partner, uint256 _partnerShare, bool _noPositiveSlippage, bool _positiveSlippageToUser, uint16 _feePercent, string calldata partnerId, bytes calldata _data)"

export default {
  TRANSFER,
  TRANSFER_TOKENS,
  SET_IMPLEMENTATION,
  SET_FEE_WALLET,
  ADAPTER_INITIALIZED,
  ROUTER_INITIALIZED,
  REGISTER_PARTNER
};
