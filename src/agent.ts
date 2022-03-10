import {
  Finding,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getEthersProvider,
  ethers,
} from "forta-agent";
import { BigNumber, utils, providers } from "ethers";
import util from "./utils";

const AugustusSwapper: string = "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57";

export const createFinding = (

): Finding => {
  return Finding.fromObject({
    name: "Admin Role",
    description: "Admin controlled functions",
    alertId: "PARASWAP-1",
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    protocol:"PARASWAP",
    metadata: {
  
    },
  });
};

export function provideHandleTransaction(
  augustusSwapper: string,

  provider: providers.Provider,

) {
  const transferTokensFunction = new ethers.Contract(
    augustusSwapper,
    util.TRANSFER_TOKENS,
    provider
  );
  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];


    const transferEvent = txEvent.filterLog(
      util.AUGUSTUS_SWAPPER,
      AugustusSwapper
    );
  

    await Promise.all(
      transferEvent.map(async(event)=>{
        const from: string= event.args.from;
        const to: string= event.args.to;
        const value: BigNumber= event.args.value;
        console.log(from,to,value)
        const functionValue = await transferTokensFunction.partitions(
          from,to,value,
          { blockTag: txEvent.blockNumber }
        );
        const newFinding: Finding = createFinding(
      
          );
          findings.push(newFinding);
      })
    );

    return findings;
  };
}

export default {
  handleTransaction: provideHandleTransaction(
    AugustusSwapper,
    getEthersProvider(),
  ),
};
