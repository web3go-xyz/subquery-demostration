export interface RemarkResult {
    value: string;
    caller: string;
    blockNumber: string;
    timestamp: Date;
    formatedValue: string;
}
export interface RmrkInteraction {
    id: string;
    metadata?: string;
}

export interface Collection {
    version: string;
    name: string;
    max: number;
    issuer: string;
    symbol: string;
    id: string;
    metadata: string;
    blockNumber?: number;
}


export interface NFT {
    name: string;
    instance: string;
    transferable: number;
    collection: string;
    sn: string;
    id: string;
    metadata: string;
    currentOwner: string;
    price?: string;
    disabled?: boolean;
    blockNumber?: number;
}

export enum RmrkEvent {
    MINT = 'MINT',
    MINTNFT = 'MINTNFT',


    LIST = 'LIST',
    BUY = 'BUY',
    CONSUME = 'CONSUME',
    CHANGEISSUER = 'CHANGEISSUER',
    SEND = 'SEND',
    EMOTE = 'EMOTE',

    BURN = 'BURN',  //Event Alias as CONSUME in Standard 2.0.0   
    CREATE = 'CREATE',  //Event Alias as MINT COLLECTION in Standard 2.0.0  

    //Event for new features in Standard 2.0.0 
    ACCEPT = 'ACCEPT',
    RESADD = 'RESADD',

    //misc
    EQUIP = 'EQUIP',
    EQUIPPABLE = 'EQUIPPABLE',
    SETPRIORITY = 'SETPRIORITY',
    SETPROPERTY = 'SETPROPERTY',
    LOCK = 'LOCK',

    //UNKNOWN
    UNKNOWN = 'UNKNOWN'
}

export enum RmrkSpecVersion {
    V01 = "0.1",
    V1 = "1.0.0",
    V2 = "2.0.0"
}