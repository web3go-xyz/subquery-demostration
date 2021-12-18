import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { CollectionEntity, NFTEntity, RemarkEntity, StarterEntity } from "../types";
import { Balance, Call } from "@polkadot/types/interfaces";
import { Collection, NFT, RemarkResult, RmrkEvent, RmrkSpecVersion } from "./RemarkTypes";
import { getAction, getRmrkSpecVersion, hexToString, isSystemRemar4RMRK, unwrap } from "./NftUtils";

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
            formatedValue: ''
        };
        remarkResult.formatedValue = hexToString(remarkResult.value);
    }

    if (remarkResult) {
        logger.info(`blockNumber:${remarkResult.blockNumber},value:${remarkResult.value},formatedValue:${remarkResult.formatedValue}`);
    }

    let remarkEntities = RemarkEntity.create({
        id: `${remarkResult.blockNumber}-${remarkResult.timestamp}`,
        ...remarkResult,
    });
    await remarkEntities.save();


    //handle interaction
    try {
        const event: RmrkEvent = getAction(remarkResult.formatedValue);
        const specVersion: RmrkSpecVersion = getRmrkSpecVersion(remarkResult.formatedValue);

        switch (event) {
            case RmrkEvent.MINT:
                if (specVersion == RmrkSpecVersion.V1 || specVersion == RmrkSpecVersion.V01) {
                    await collection_V1(remarkResult);
                }
                break;
            case RmrkEvent.MINTNFT:
                await mintNFT_V1(remarkResult)
                break;

            default:
                logger.warn(`[SKIP] ${event}::${remarkResult.formatedValue}::${remarkResult.blockNumber}`)
                break;
        }

    } catch (error) {
        logger.error(error);
    }
}

async function collection_V1(remark: RemarkResult) {
    let collection = null
    try {
        collection = unwrap(remark.formatedValue) as Collection;
        if (!collection.id) {
            throw new ReferenceError('[CONSOLIDATE error] collection id is null');
        }
        const existEntity = await CollectionEntity.get(collection.id);
        if (existEntity) {
            throw new ReferenceError('[CONSOLIDATE error] collection id already exist');
        }

        const newEntity = CollectionEntity.create(collection);
        newEntity.name = collection.name || collection.symbol;
        newEntity.max = Number(collection.max);
        newEntity.issuer = remark.caller;
        newEntity.currentOwner = remark.caller;
        newEntity.symbol = collection.symbol;
        newEntity.blockNumber = BigInt(remark.blockNumber);
        newEntity.metadata = collection.metadata;
        newEntity.timestampCreatedAt = remark.timestamp;
        newEntity.timestampUpdatedAt = remark.timestamp;

        logger.info(`SAVED [COLLECTION] ${newEntity.id}`);
        await newEntity.save();
    } catch (e) {
        logger.error(`[COLLECTION] ${e.message}, ${JSON.stringify(collection)}`);

    }

}


function getNftId(nft: any, blocknumber?: string | number): string {
    return `${blocknumber ? blocknumber + '-' : ''}${nft.collection}-${nft.instance || nft.name}-${nft.sn}`
}
function getNftId_V01(nft: any): string {
    return `${nft.collection}-${nft.instance || nft.name}-${nft.sn}`
}

async function mintNFT_V1(remark: RemarkResult) {
    let nft = null;
    const specVersion: RmrkSpecVersion = getRmrkSpecVersion(remark.formatedValue);

    try {

        nft = unwrap(remark.formatedValue) as NFT;
        if (!nft.collection) {
            throw new ReferenceError('[CONSOLIDATE error] nft collection is null');
        }

        const collection = await CollectionEntity.get(nft.collection);
        if (!collection) {
            throw new ReferenceError('[CONSOLIDATE error] collection does not exist');
        }

        if (specVersion === RmrkSpecVersion.V01) {
            nft.id = getNftId_V01(nft);
        } else if (specVersion === RmrkSpecVersion.V1) {
            nft.id = getNftId(nft, remark.blockNumber);
        }
        const newNFT = NFTEntity.create(nft);
        newNFT.issuer = remark.caller;
        newNFT.currentOwner = remark.caller;
        newNFT.blockNumber = BigInt(remark.blockNumber);
        newNFT.name = nft.name;
        newNFT.transferable = nft.transferable;
        newNFT.collectionId = nft.collection;
        newNFT.sn = nft.sn;
        newNFT.metadata = nft.metadata;
        newNFT.price = BigInt(0);
        newNFT.burned = false;
        newNFT.timestampCreatedAt = remark.timestamp;
        newNFT.timestampUpdatedAt = remark.timestamp;

        logger.info(`SAVED [MINT_NFT ${specVersion} SIMPLE] ${newNFT.id}`);
        await newNFT.save();
    } catch (e) {
        logger.error(`[MINT_NFT ${specVersion} ] ${e.message} ${JSON.stringify(nft)} ${JSON.stringify(remark)}`);

    }
}
