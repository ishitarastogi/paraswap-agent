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
import util from "./utils";

const testAugustus: string = createAddress("0xdef1");
const USER_ADDR = createAddress("0xaa");


// const testSetIFace = new utils.Interface([util.SET_IMPLEMENTATION]);
// const testSetFeeIFace = new utils.Interface(util.SET_FEE_WALLET);
const iface: utils.Interface = new utils.Interface([
  util.SET_IMPLEMENTATION,
  util.SET_FEE_WALLET
])
//const testSetIFace: Interface = new Interface(util.SET_IMPLEMENTATION);

//const testTransferIFace: Interface = new Interface(util.TRANSFER_TOKENS);
const createTransaction = (functionName: string, params:any[]) => {
  return iface.encodeFunctionData(
    functionName, 
    [...params],
  );
};

const createFinding = (params: any) => {
  const metadata: any = {};
  for (const key in params) {
    metadata[key] = params[key].toString();
  }

   return Finding.fromObject({
    name: "Admin Role",
    description: "execeuted",
    alertId: "PARASWAP-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "PARASWAP",
    metadata: metadata,
  });
};

describe("Large stake deposits", () => {
  let handler:HandleTransaction = provideHandleTransaction(testAugustus);

  it("should return a Finding ", async () => {
    const testBytes: string = "0xafde1234";
    const testImplementation: string = createAddress("0xd1");
    // const Transaction: string= testSetIFace.encodeFunctionData(
    //   testSetIFace.getFunction("setImplementation"),
    //   [testBytes, testImplementation]
    // );
    const Transaction: string = createTransaction("setImplementation",[testBytes, testImplementation]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
    .setTo(testAugustus)
    .setFrom(USER_ADDR)
    .setData(Transaction);

    const findings = await handler(txEvent);
    console.log("F1",findings)

    const expectedFinding = createFinding({
      selector: testBytes.toLowerCase(),
      implementation: testImplementation,
    });
    console.log("L1",expectedFinding)

   expect(findings).toStrictEqual([expectedFinding]);
  });

  it("should return a Finding from Set function call", async () => {
    const testAddress: string = createAddress("0xd3");
    // const Transaction: string= testSetFeeIFace.encodeFunctionData(
    //   testSetFeeIFace.getFunction("setFeeWallet"),
    //   [testImplementation]
    // );
    const Transaction: string = createTransaction("setFeeWallet",[testAddress]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
    .setTo(testAugustus)
    .setFrom(USER_ADDR)
    .setData(Transaction);

    const findings = await handler(txEvent);
    console.log("f2",findings)
    const expectedFinding = createFinding({
      _feeWallet: testAddress,
    });
    
    console.log("l2",expectedFinding)
    expect(findings).toStrictEqual([expectedFinding]);
  });
  it("should ignore empty transactions", async () => {
    const tx: TransactionEvent = new TestTransactionEvent();

    const findings: Finding[] = await handler(tx);
    expect(findings).toStrictEqual([]);
  });

});
