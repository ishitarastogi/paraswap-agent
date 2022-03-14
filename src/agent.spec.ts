import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  TransactionEvent,
} from "forta-agent";
import { createAddress, TestTransactionEvent } from "forta-agent-tools";
import { provideHandleTransaction } from "./agent";
import { utils, BigNumber } from "ethers";
import util from "./utils";

const testAugustus: string = createAddress("0xdef1");
const USER_ADDR = createAddress("0xf1e4a");

const iface: utils.Interface = new utils.Interface([
  util.SET_IMPLEMENTATION,
  util.SET_FEE_WALLET,
  util.TRANSFER_TOKENS,
  util.REGISTER_PARTNER,
  util.ADAPTER_INITIALIZED,
  util.ROUTER_INITIALIZED,
]);

const createTransaction = (functionName: string, params: any[]) => {
  return iface.encodeFunctionData(functionName, [...params]);
};

const createFinding = (Name: string, params: any) => {
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

    const expectedFinding = createFinding("setImplementation", {
      selector: testBytes.toLowerCase(),
      implementation: testImplementation,
    });
    console.log("L1", expectedFinding);

    expect(findings).toStrictEqual([expectedFinding]);
  });

  it("should return a Finding from setFeeWallet function call", async () => {
    const testAddress: string = createAddress("0xabc");

    const Transaction: string = createTransaction("setFeeWallet", [
      testAddress,
    ]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setTo(testAugustus)
      .setFrom(USER_ADDR)
      .setData(Transaction);

    const findings = await handler(txEvent);
    console.log("f2", findings);
    const expectedFinding = createFinding("setFeeWallet", {
      _feeWallet: testAddress,
    });

    console.log("l2", expectedFinding);
    expect(findings).toStrictEqual([expectedFinding]);
  });

  it("should return a Finding from transfer function call", async () => {
    const testTokenAddress: string = createAddress("0xb1");
    const testDestinationAddress: string = createAddress("0xb2");
    const testAmount: BigNumber = BigNumber.from(100);
    const Transaction: string = createTransaction("transferTokens", [
      testTokenAddress,
      testDestinationAddress,
      testAmount,
    ]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setTo(testAugustus)
      .setFrom(USER_ADDR)
      .setData(Transaction);

    const findings = await handler(txEvent);
    console.log("f2", findings);
    const expectedFinding = createFinding("transferTokens", {
      token: testTokenAddress,
      destination: testDestinationAddress,
      amount: testAmount,
    });

    console.log("l2", expectedFinding);
    expect(findings).toStrictEqual([expectedFinding]);
  });
  it("should return a Finding from register partner function call", async () => {
    const testPartnerAddress: string = createAddress("0xb1");
    const testPartnerShare: BigNumber = BigNumber.from(100);
    const testNoPositiveSlippage: boolean = true;
    const testPositiveSlippageToUser: boolean = false;
    const testFeePercent: number = 1;
    const testPartnerId: string = "partnerId";
    const testData: string = "0xda12";
    const Transaction: string = createTransaction("registerPartner", [
      testPartnerAddress,
      testPartnerShare,
      testNoPositiveSlippage,
      testPositiveSlippageToUser,
      testFeePercent,
      testPartnerId,
      testData,
    ]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setTo(testAugustus)
      .setFrom(USER_ADDR)
      .setData(Transaction);

    const findings = await handler(txEvent);
    console.log("f2", findings);
    const expectedFinding = createFinding("registerPartner", {
      partner: testPartnerAddress,
      _partnerShare: testPartnerShare,
      _noPositiveSlippage: testNoPositiveSlippage,
      _positiveSlippageToUser: testPositiveSlippageToUser,
      _feePercent: testFeePercent,
      partnerId: testPartnerId,
      _data: testData,
    });

    console.log("l2", expectedFinding);
    expect(findings).toStrictEqual([expectedFinding]);
  });
  it("should return findings from adapter initialized call", async () => {
    const testAdapter: string = createAddress("0xd34d");

    const { data, topics } = iface.encodeEventLog(
      iface.getEvent("AdapterInitialized"),
      [testAdapter]
    );

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(USER_ADDR)
      .addAnonymousEventLog(testAugustus, data, ...topics);

    const findings = await handler(txEvent);
    const expectedFinding = createFinding("AdapterInitialized", {
      adapter: testAdapter,
    });
    expect(findings).toStrictEqual([expectedFinding]);
  });
  it("should return findings from adapter initialized call", async () => {
    const testRouter: string = createAddress("0xd34d");

    const { data, topics } = iface.encodeEventLog(
      iface.getEvent("RouterInitialized"),
      [testRouter]
    );

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(USER_ADDR)
      .addAnonymousEventLog(testAugustus, data, ...topics);

    const findings = await handler(txEvent);
    const expectedFinding = createFinding("RouterInitialized", {
      router: testRouter,
    });
    expect(findings).toStrictEqual([expectedFinding]);
  });
  it("should return no findings from incorrect address", async () => {

  });
  it("should return no findings from incorrect event signature", async () => {

  });
  it("should return findings for multiple function calls for transferTokens", async ()=>{
  })
});
