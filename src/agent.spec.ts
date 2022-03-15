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
const IRRELEVENT_IFACE: utils.Interface = new utils.Interface([
  "event wrongsig()",
  "function wrongFunction()",
]);

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

describe("Paraswap Admin operations Agent tests", () => {
  let handler: HandleTransaction = provideHandleTransaction(testAugustus);

  it("should ignore empty transactions", async () => {
    const tx: TransactionEvent = new TestTransactionEvent();

    const findings: Finding[] = await handler(tx);
    expect(findings).toStrictEqual([]);
  });

  it("should return a Finding from setImplementation function call ", async () => {
    const testBytes: string = "0xabcd1234";
    const testImplementation: string = createAddress("0xde1");

    const Transaction: string = createTransaction("setImplementation", [
      testBytes,
      testImplementation,
    ]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setTo(testAugustus)
      .setFrom(USER_ADDR)
      .setData(Transaction);

    const findings = await handler(txEvent);

    const expectedFinding = createFinding("setImplementation", {
      selector: testBytes.toLowerCase(),
      implementation: testImplementation,
    });

    expect(findings).toStrictEqual([expectedFinding]);
  });

  it("should return a Finding from setFeeWallet function call", async () => {
    const testAddress: string = createAddress("0xabc12");

    const Transaction: string = createTransaction("setFeeWallet", [
      testAddress,
    ]);

    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setTo(testAugustus)
      .setFrom(USER_ADDR)
      .setData(Transaction);

    const findings = await handler(txEvent);
    const expectedFinding = createFinding("setFeeWallet", {
      _feeWallet: testAddress,
    });

    expect(findings).toStrictEqual([expectedFinding]);
  });

  it("should return a Finding from transfer function call", async () => {
    const testTokenAddress: string = createAddress("0xbd1");
    const testDestinationAddress: string = createAddress("0xbd2");
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
    const expectedFinding = createFinding("transferTokens", {
      token: testTokenAddress,
      destination: testDestinationAddress,
      amount: testAmount,
    });

    expect(findings).toStrictEqual([expectedFinding]);
  });
  it("should return a Finding from register partner function call", async () => {
    const testPartnerAddress: string = createAddress("0xabc1");
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
    const expectedFinding = createFinding("registerPartner", {
      partner: testPartnerAddress,
      _partnerShare: testPartnerShare,
      _noPositiveSlippage: testNoPositiveSlippage,
      _positiveSlippageToUser: testPositiveSlippageToUser,
      _feePercent: testFeePercent,
      partnerId: testPartnerId,
      _data: testData,
    });

    expect(findings).toStrictEqual([expectedFinding]);
  });
  it("should return findings from adapter initialized call", async () => {
    const testAdapter: string = createAddress("0xabc4d");

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
  it("should return findings from router initialized call", async () => {
    const testRouter: string = createAddress("0xde321");

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
    const WRONG_ADDRESS = createAddress("0xff");
    let { data, topics } = iface.encodeEventLog(
      iface.getEvent("RouterInitialized"),
      [createAddress("0xd4")]
    );
    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(USER_ADDR)
      .addTraces({
        to: WRONG_ADDRESS,
        from: USER_ADDR,
        input: iface.encodeFunctionData("setImplementation", [
          "0xafde1234",
          createAddress("0xe2"),
        ]),
      })
      .addTraces({
        to: WRONG_ADDRESS,
        from: USER_ADDR,
        input: iface.encodeFunctionData("setFeeWallet", [
          createAddress("0xf12"),
        ]),
      })

      .addAnonymousEventLog(WRONG_ADDRESS, data, ...topics);
    const findings = await handler(txEvent);
    expect(findings).toStrictEqual([]);
  });
  it("should return findings from incorrect event signature", async () => {
    const log1 = IRRELEVENT_IFACE.encodeEventLog(
      IRRELEVENT_IFACE.getEvent("wrongsig"),
      []
    );
    const log2 = IRRELEVENT_IFACE.encodeEventLog(
      IRRELEVENT_IFACE.getEvent("wrongsig"),
      []
    );
    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(USER_ADDR)
      .addTraces({
        to: testAugustus,
        from: USER_ADDR,
        input: IRRELEVENT_IFACE.encodeFunctionData("wrongFunction", []),
      })
      .addTraces({
        to: testAugustus,
        from: USER_ADDR,
        input: IRRELEVENT_IFACE.encodeFunctionData("wrongFunction", []),
      })
      .addAnonymousEventLog(testAugustus, log1.data, ...log1.topics)
      .addAnonymousEventLog(testAugustus, log2.data, ...log2.topics);
    const findings = await handler(txEvent);
    expect(findings).toStrictEqual([]);
  });
  it("Should return findings when admin operations are executed on AugustusSwapper Contract", async () => {
    const log1 = iface.encodeEventLog(iface.getEvent("AdapterInitialized"), [
      createAddress("0xab4"),
    ]);
    const log2 = iface.encodeEventLog(iface.getEvent("RouterInitialized"), [
      createAddress("0xab21"),
    ]);
    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(USER_ADDR)
      .addTraces({
        to: testAugustus,
        from: USER_ADDR,
        input: iface.encodeFunctionData("setImplementation", [
          "0xafde1234",
          createAddress("0xa1"),
        ]),
      })
      .addTraces({
        to: testAugustus,
        from: USER_ADDR,
        input: iface.encodeFunctionData("setFeeWallet", [
          createAddress("0xab12"),
        ]),
      })
      .addTraces({
        to: testAugustus,
        from: USER_ADDR,
        input: iface.encodeFunctionData("registerPartner", [
          createAddress("0xd6"),
          BigNumber.from(100),
          true,
          false,
          1,
          "partnerId",
          "0xda12",
        ]),
      })
      .addTraces({
        to: testAugustus,
        from: USER_ADDR,
        input: iface.encodeFunctionData(
          "transferTokens",
          [createAddress("0xdef"), createAddress("0xc1"), BigNumber.from(30)] // transferTokens args
        ),
      })

      .addAnonymousEventLog(testAugustus, log1.data, ...log1.topics)
      .addAnonymousEventLog(testAugustus, log2.data, ...log2.topics);
    const findings = await handler(txEvent);
    const setImplementation = createFinding("setImplementation", {
      selector: "0xafde1234",
      implementation: createAddress("0xa1"),
    });
    const setFeeWallet = createFinding("setFeeWallet", {
      _feeWallet: createAddress("0xab12"),
    });
    const registerPartner = createFinding("registerPartner", {
      partner: createAddress("0xd6"),
      _partnerShare: BigNumber.from(100),
      _noPositiveSlippage: true,
      _positiveSlippageToUser: false,
      _feePercent: 1,
      partnerId: "partnerId",
      _data: "0xda12",
    });
    const transferTokens = createFinding("transferTokens", {
      token: createAddress("0xdef"),
      destination: createAddress("0xc1"),
      amount: BigNumber.from(30),
    });
    const AdapterInitialized = createFinding("AdapterInitialized", {
      adapter: createAddress("0xab4"),
    });
    const RouterInitialized = createFinding("RouterInitialized", {
      router: createAddress("0xab21"),
    });
    expect(findings).toStrictEqual([
      setImplementation,
      setFeeWallet,
      registerPartner,
      transferTokens,
      AdapterInitialized,
      RouterInitialized,
    ]);
  });
  it("Should return multiple findings when transferTokens is called many times", async () => {
    const txEvent: TransactionEvent = new TestTransactionEvent()
      .setFrom(USER_ADDR)
      .addTraces({
        to: testAugustus,
        from: USER_ADDR,
        input: iface.encodeFunctionData(
          "transferTokens",
          [createAddress("0xabc"), createAddress("0xf1"), BigNumber.from(30)] // transferTokens args
        ),
      })
      .addTraces({
        to: testAugustus,
        from: USER_ADDR,
        input: iface.encodeFunctionData("transferTokens", [
          createAddress("0xbc4"),
          createAddress("0xcd2"),
          BigNumber.from(50),
        ]),
      });

    const findings = await handler(txEvent);
    const transferTokens1 = createFinding("transferTokens", {
      token: createAddress("0xabc"),
      destination: createAddress("0xf1"),
      amount: BigNumber.from(30),
    });
    const transferTokens2 = createFinding("transferTokens", {
      token: createAddress("0xbc4"),
      destination: createAddress("0xcd2"),
      amount: BigNumber.from(50),
    });

    expect(findings).toStrictEqual([transferTokens1, transferTokens2]);
  });
});
