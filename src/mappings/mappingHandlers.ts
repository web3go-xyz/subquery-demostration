import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { RemarkEntity, StarterEntity } from "../types";
import { Balance, Call } from "@polkadot/types/interfaces";
import { RemarkResult } from "./RemarkTypes";



export async function handleBlock(block: SubstrateBlock): Promise<void> {
    //Create a new starterEntity with ID using block hash
    let record = new StarterEntity(block.block.header.hash.toString());
    //Record block number
    record.field1 = block.block.header.number.toNumber();
    await record.save();
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
    const { event: { data: [account, balance] } } = event;
    //Retrieve the record by its ID
    const record = await StarterEntity.get(event.extrinsic.block.block.header.hash.toString());
    record.field2 = account.toString();
    //Big integer type Balance of a transfer event
    record.field3 = (balance as Balance).toBigInt();
    await record.save();
}
export function isSystemRemar4RMRK(call: Call): boolean {
    if (call.section === "system" &&
        call.method === "remark") {

        //rmrk 0x726d726b / RMRK 0x524d524b
        return call.args.toString().startsWith('0x726d726b') || call.args.toString().startsWith('0x524d524b');

    }
    return false;
}
function hexToString(text) {
    return Buffer.from(text.replace(/^0x/, ''), 'hex').toString()
}
export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {

    if (!extrinsic.success) {
        return;
    }

    //get system.remark
    const signer = extrinsic.extrinsic.signer.toString();
    const blockNumber = extrinsic.block.block.header.number.toString()
    const timestamp = extrinsic.block.timestamp;

    let remarkResult: RemarkResult = null;
    if (isSystemRemar4RMRK(extrinsic.extrinsic.method as Call)) {
        remarkResult = {
            value: extrinsic.extrinsic.args.toString(),
            caller: signer,
            blockNumber,
            timestamp,
        };
    }

    if (remarkResult) {
        logger.info(`blockNumber:${remarkResult.blockNumber},value:${remarkResult.value},formatedValue:${hexToString(remarkResult.value)}`);
    }

    let remarkEntities = RemarkEntity.create({
        id: `${remarkResult.blockNumber}-${remarkResult.timestamp}`,
        ...remarkResult,
        formatedValue: hexToString(remarkResult.value)
    });
    await remarkEntities.save();

}


