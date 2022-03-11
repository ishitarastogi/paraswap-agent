import {
  Finding,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";
import util from "./utils";

const AugustusSwapper: string = "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57";

const createFinding = (metadata: any): Finding => {
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

export function provideHandleTransaction(augustusSwapper: string) {
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];

    const logs = txEvent.filterLog(
      [util.ADAPTER_INITIALIZED, util.ROUTER_INITIALIZED],
      augustusSwapper
    );
    const functionLogs = txEvent.filterFunction(
      [
        util.TRANSFER_TOKENS,
        util.SET_FEE_WALLET,
        util.SET_IMPLEMENTATION,
        util.REGISTER_PARTNER,
      ],
      augustusSwapper
    );

    functionLogs.forEach((arr) => {
      let params = arr.functionFragment.inputs.map((e) => e.name);
      let metadata: any = {};

      for (let i of params) {
        metadata[i] = arr.args[i];
      }
      const newFinding: Finding = createFinding(metadata);
      findings.push(newFinding);
    });
    logs.forEach((arr) => {
      let params = arr.eventFragment.inputs.map((e) => e.name);
      let metadata: any = {};

      for (let i of params) {
        metadata[i] = arr.args[i];
      }
      const newFinding: Finding = createFinding(metadata);
      findings.push(newFinding);
    });

    return findings;
  };
}

export default {
  handleTransaction: provideHandleTransaction(AugustusSwapper),
};
