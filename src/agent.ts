import {
  Finding,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import util from "./utils";

const AugustusSwapper: string = "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57";

export const createFinding = (Name: string, metadata: any): Finding => {
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
const ADDRESS_NAME = [
  "adapter",
  "router",
  "token",
  "destination",
  "implementation",
  "_feeWallet",
  "partner",
];

export function provideHandleTransaction(augustusSwapper: string) {
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    const eventsLogs = txEvent.filterLog(
      [util.ADAPTER_INITIALIZED, util.ROUTER_INITIALIZED],
      augustusSwapper
    );
    const functionLogs = txEvent.filterFunction(
      [
        util.TRANSFER_TOKENS,
        util.SET_IMPLEMENTATION,

        util.SET_FEE_WALLET,
        util.REGISTER_PARTNER,
      ],
      augustusSwapper
    );

    functionLogs.forEach((functionData) => {
      let functionName: string = functionData.name;

      let parameterNameArray = functionData.functionFragment.inputs.map(
        (e) => e.name
      );
      let metadata: any = {};

      for (let paramName of parameterNameArray) {
        if (ADDRESS_NAME.includes(paramName)) {
          metadata[paramName] = functionData.args[paramName].toLowerCase();
        } else {
          metadata[paramName] = functionData.args[paramName];
        }
      }
      const newFinding: Finding = createFinding(functionName, metadata);
      findings.push(newFinding);
    });
    eventsLogs.forEach((eventData) => {
      let eventName: string = eventData.name;

      let parameterArray = eventData.eventFragment.inputs.map((e) => e.name);
      let metadata: any = {};

      for (let paramName of parameterArray) {
        if (ADDRESS_NAME.includes(paramName)) {
          metadata[paramName] = eventData.args[paramName].toLowerCase();
        } else {
          metadata[paramName] = eventData.args[paramName];
        }
      }
      const newFinding: Finding = createFinding(eventName, metadata);
      findings.push(newFinding);
    });

    return findings;
  };
}

export default {
  handleTransaction: provideHandleTransaction(AugustusSwapper),
};
