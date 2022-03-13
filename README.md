
import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";
import { createAddress, TestTransactionEvent } from "forta-agent-tools";
import { provideHandleTransaction } from "./agent";
import { BigNumber, utils } from "ethers";
import { Interface } from "@ethersproject/abi";
import util from "./utils";
//import { leftPad } from "web3-utils";
const USER_ADDR = createAddress("0xaa");
const testMsgSender: string = createAddress("0xcd85bf43");

//const toBytes32 = (n: string) => leftPad(BigNumber.from(n).toHexString(), 64);
const testAugustus: string = createAddress("0xdef1");
// const testAdapterIFace: Interface = new Interface(util.ADAPTER_INITIALIZED);
// const testRouterIFace: Interface = new Interface(util.ROUTER_INITIALIZED);
// const testRegisterIFace: Interface = new Interface(util.REGISTER_PARTNER);
// const testSetFeeIFace: Interface = new Interface(util.SET_FEE_WALLET);

// const testSetIFace = new utils.Interface([util.SET_IMPLEMENTATION]);
// const testSetFeeIFace = new utils.Interface(util.SET_FEE_WALLET);
// const iface: utils.Interface = new utils.Interface([
//   util.SET_IMPLEMENTATION,
//   // util.SET_FEE_WALLET
// ])
const testSetIFace: utils.Interface = new utils.Interface([util.SET_IMPLEMENTATION]);

//const testTransferIFace: Interface = new Interface(util.TRANSFER_TOKENS);
// const createTransaction = (functionName: string, params:any[]) => {
//   return iface.encodeFunctionData(
//     functionName, 
//     [...params],
//   );
// };

const createFinding = (params: any) => {
  const metadata: any = {};
  for (const key in params) {
    metadata[key] = params[key].toString();
  }

  return Finding.fromObject({
    name: "Admin Role",
    description: "Admin controlled functions",
    alertId: "PARASWAP-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "PARASWAP",
    metadata: metadata,
  });
};

describe("Large stake deposits", () => {
  let handleTransaction = provideHandleTransaction(testAugustus);
  const module: string = createAddress("0xdead");

  it("should return a Finding from Set function call", async () => {
    const testBytes: string = "0xafde1234";
    const testImplementation: string = createAddress("0xd1");
    const Transaction: string= testSetIFace.encodeFunctionData(
      testSetIFace.getFunction("setImplementation"),
      [testBytes, testImplementation]
    );
    console.log(Transaction)
    // const Transaction: string = createTransaction("setImplementation",[testBytes,testImplementation]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
    .setBlock(50)

    .setData(Transaction)
    
    const findings = await handleTransaction(txEvent);
    const expectedFinding = createFinding({
      selector: testBytes,
      implementation: testImplementation,
    });
    console.log(findings)
     expect(findings).toStrictEqual([]);
  });

  // it("should return a Finding from Set function call", async () => {
  //   const testImplementation: string = createAddress("0xd3");
  //   // const Transaction: string= testSetFeeIFace.encodeFunctionData(
  //   //   testSetFeeIFace.getFunction("setFeeWallet"),
  //   //   [testImplementation]
  //   // );
  //   const Transaction: string = createTransaction("setFeeWallet",[testImplementation]);

  //   const txEvent: TransactionEvent = new TestTransactionEvent().setData(Transaction);
    
  //   const findings = await handleTransaction(txEvent);
  //   const expectedFinding = createFinding({
  //     _feeWallet: testImplementation,
  //   });
  //   expect(findings).toStrictEqual([expectedFinding]);
  // });
});
