import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";
import { createAddress, TestTransactionEvent } from "forta-agent-tools";
import { provideHandleTransaction } from "./agent";
import {utils,BigNumber } from "ethers";
import util from "./utils";

const testAugustus: string = createAddress("0xdef1");
const USER_ADDR = createAddress("0xf1e4a");

const iface: utils.Interface = new utils.Interface([
  util.SET_IMPLEMENTATION,
  util.SET_FEE_WALLET,
  util.TRANSFER_TOKENS
]);

const createTransaction = (functionName: string, params: any[]) => {
  return iface.encodeFunctionData(functionName, [...params]);
};

const createFinding = (Name:string,params: any) => {
  const metadata: any = {};
  for (const key in params) {
    metadata[key] = params[key];
  }

  return Finding.fromObject({
    name: "Admin Role",
    description: `${Name}`,
    alertId: "PARASWAP-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol: "PARASWAP",
    metadata: metadata,
  });
};

describe("Large stake deposits", () => {
  let handler: HandleTransaction = provideHandleTransaction(testAugustus);

  it("should ignore empty transactions", async () => {
    const tx: TransactionEvent = new TestTransactionEvent();

    const findings: Finding[] = await handler(tx);
    expect(findings).toStrictEqual([]);
  });

  it("should return a Finding from setImplementation function call ", async () => {
    const testBytes: string = "0xabcd1234";
    const testImplementation: string = createAddress("0xd1");

    const Transaction: string = createTransaction("setImplementation", [
      testBytes,
      testImplementation,
    ]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setTo(testAugustus)
      .setFrom(USER_ADDR)
      .setData(Transaction);

    const findings = await handler(txEvent);
    console.log("F1", findings);

    const expectedFinding = createFinding("setImplementation",{
      selector: testBytes.toLowerCase(),
      implementation: testImplementation,
    });
    console.log("L1", expectedFinding);

    expect(findings).toStrictEqual([expectedFinding]);
  });

  it("should return a Finding from setFeeWallet function call", async () => {
    const testAddress: string = createAddress("0xaBc");

    const Transaction: string = createTransaction("setFeeWallet", [
      testAddress,
    ]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setTo(testAugustus)
      .setFrom(USER_ADDR)
      .setData(Transaction);

    const findings = await handler(txEvent);
    console.log("f2", findings);
    const expectedFinding = createFinding("setFeeWallet",{
      _feeWallet: testAddress,
    });

    console.log("l2", expectedFinding);
    expect(findings).toStrictEqual([expectedFinding]);
  });

  it("should return a Finding from transfer function call", async () => {
    const testTokenAddress: string = createAddress("0xAA");
const testDestinationAddress:string = createAddress("0xAA");
const testAmount:BigNumber=BigNumber.from(100);
    const Transaction: string = createTransaction("transferTokens", [
      testTokenAddress,
      testDestinationAddress,
      testAmount
    ]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setTo(testAugustus)
      .setFrom(USER_ADDR)
      .setData(Transaction);

    const findings = await handler(txEvent);
    console.log("f2", findings);
    const expectedFinding = createFinding("transferTokens",{
      address: testTokenAddress,
      destination:testDestinationAddress,
      amount:testAmount
    });

    console.log("l2", expectedFinding);
    expect(findings).toStrictEqual([expectedFinding]);
  });

});
