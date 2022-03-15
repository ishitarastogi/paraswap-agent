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
const IRRELEVENT_IFACE:utils.Interface = new utils.Interface(["event wrongsig()", "function wrongFunction()"]);

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
    const IRRELEVENT_ADDR = createAddress("0xff");
    const log1 = iface.encodeEventLog(iface.getEvent("RouterInitialized"),[createAddress("0xd4")])
    const log2 = iface.encodeEventLog(iface.getEvent("RouterInitialized"),[createAddress("0xd4")])
    const tx: TransactionEvent = new TestTransactionEvent()
    .setFrom(USER_ADDR)
    .addTraces({
      to: IRRELEVENT_ADDR,
      from: USER_ADDR,
      input: iface.encodeFunctionData(
        "setImplementation",
        ["0xafde1234", createAddress("0xd1")] 
      ),
    })
    .addTraces({
      to: IRRELEVENT_ADDR,
      from: USER_ADDR,
      input: iface.encodeFunctionData(
        "setFeeWallet",
        [createAddress("0xd3")] 
      ),
    })

    .addAnonymousEventLog(IRRELEVENT_ADDR, log1.data, ...log1.topics)
    .addAnonymousEventLog(IRRELEVENT_ADDR, log2.data, ...log2.topics)
    const findings = await handler(tx);
    expect(findings).toStrictEqual([]);
  });
  it("should return findings from incorrect event signature", async () => {
    const log1 = IRRELEVENT_IFACE.encodeEventLog(IRRELEVENT_IFACE.getEvent("wrongsig"),[])
    const log2 = IRRELEVENT_IFACE.encodeEventLog(IRRELEVENT_IFACE.getEvent("wrongsig"),[])
    const tx: TransactionEvent = new TestTransactionEvent()
    .setFrom(USER_ADDR)
    .addTraces({
      to: testAugustus,
      from: USER_ADDR,
      input: IRRELEVENT_IFACE.encodeFunctionData(
        "wrongFunction",
        [] 
      ),
    })
    .addTraces({
      to: testAugustus,
      from: USER_ADDR,
      input: IRRELEVENT_IFACE.encodeFunctionData(
        "wrongFunction",
        [] 
      ),
    })
    .addAnonymousEventLog(testAugustus, log1.data, ...log1.topics)
    .addAnonymousEventLog(testAugustus, log2.data, ...log2.topics)
    const findings = await handler(tx);
    expect(findings).toStrictEqual([]);
  });
  it("Should return findings when admin operations are executed on AugustusSwapper Contract", async ()=>{
    const log1 = iface.encodeEventLog(iface.getEvent("AdapterInitialized"),[createAddress("0xd4")])
   // const log2 = iface.encodeEventLog(iface.getEvent("RouterInitialized"),[createAddress("0xd4")])
    const tx: TransactionEvent = new TestTransactionEvent()
    .setFrom(USER_ADDR)
    .addTraces({
      to: testAugustus,
      from: USER_ADDR,
      input: iface.encodeFunctionData(
        "setImplementation",
        ["0xafde1234", createAddress("0xd1")] 
      ),
    })
    .addTraces({
      to: testAugustus,
      from: USER_ADDR,
      input: iface.encodeFunctionData(
        "setFeeWallet",
        [createAddress("0xd3")]
      ),
    })
    .addTraces({
      to: testAugustus,
      from: USER_ADDR,
      input: iface.encodeFunctionData(
        "registerPartner",
        [createAddress("0xd6"), BigNumber.from(100), true, false, 1, "partnerId", "0xda12"],
      ),
    })

    .addAnonymousEventLog(testAugustus, log1.data, ...log1.topics)
   // .addAnonymousEventLog(testAugustus, log2.data, ...log2.topics)
    const findings = await handler(tx);
    const a=createFinding("setImplementation", {selector:"0xafde1234", implementation:createAddress("0xd1")}) 
    const b=createFinding("setFeeWallet", {_feeWallet:createAddress("0xd3")})
const c=      createFinding("registerPartner", {
  partner: createAddress("0xd6"),
  _partnerShare: BigNumber.from(100),
  _noPositiveSlippage: true,
  _positiveSlippageToUser: false,
  _feePercent: 1,
  partnerId: "partnerId",
  _data: "0xda12",
})
const d= createFinding("AdapterInitialized", {
        adapter:createAddress("0xd4"),
      })
    console.log(findings,"set",a,b,c,d)
    expect(findings).toStrictEqual([a,b,c,d]);
  })
  it("Should return multiple findings when transferTokens is called many times", async () => {
    const tx: TransactionEvent = new TestTransactionEvent()
      .setFrom(USER_ADDR)
      .addTraces({
        to: testAugustus,
        from: USER_ADDR,
        input: iface.encodeFunctionData(
          "transferTokens",
          [createAddress("0xb1"), createAddress("0xc1"), BigNumber.from(10)] // transferTokens args
        ),
      })
      .addTraces({
        to: testAugustus,
        from: USER_ADDR, 
        input: iface.encodeFunctionData(
          "transferTokens",
          [createAddress("0xb2"), createAddress("0xc2"), BigNumber.from(80)] 
        ),
      });

    const findings = await handler(tx);
    const a= createFinding("transferTokens",{token: createAddress("0xb1"),destination: createAddress("0xc1"),amount:BigNumber.from(10)})
    const b= createFinding("transferTokens",{token: createAddress("0xb2"),destination: createAddress("0xc2"),amount:BigNumber.from(80)})

    expect(findings).toStrictEqual([a,b]);
    })
});
