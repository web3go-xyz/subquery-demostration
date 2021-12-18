import { Balance, Call } from "@polkadot/types/interfaces";
import { RmrkEvent, RmrkInteraction, RmrkSpecVersion } from "./RemarkTypes";

export function hexToString(text) {
    return Buffer.from(text.replace(/^0x/, ''), 'hex').toString();
}
export function isHex(text: string) {
    return text.startsWith('0x');
}


export function isSystemRemar4RMRK(call: Call): boolean {
    if (call.section === "system" &&
        call.method === "remark") {

        //rmrk 0x726d726b / RMRK 0x524d524b
        return call.args.toString().startsWith('0x726d726b') || call.args.toString().startsWith('0x524d524b');

    }
    return false;
}

export function getAction(rmrkString: string): RmrkEvent {
    if (RmrkActionRegex.MINT.test(rmrkString)) {
        return RmrkEvent.MINT;
    }

    if (RmrkActionRegex.MINTNFT.test(rmrkString)) {
        return RmrkEvent.MINTNFT;
    }

    if (RmrkActionRegex.SEND.test(rmrkString)) {
        return RmrkEvent.SEND;
    }

    if (RmrkActionRegex.BUY.test(rmrkString)) {
        return RmrkEvent.BUY;
    }

    if (RmrkActionRegex.CONSUME.test(rmrkString)) {
        return RmrkEvent.CONSUME;
    }

    if (RmrkActionRegex.CHANGEISSUER.test(rmrkString)) {
        return RmrkEvent.CHANGEISSUER;
    }

    if (RmrkActionRegex.LIST.test(rmrkString)) {
        return RmrkEvent.LIST;
    }

    if (RmrkActionRegex.EMOTE.test(rmrkString)) {
        return RmrkEvent.EMOTE;
    }
    if (RmrkActionRegex.BURN.test(rmrkString)) {
        return RmrkEvent.BURN;
    }
    if (RmrkActionRegex.RESADD.test(rmrkString)) {
        return RmrkEvent.RESADD;
    }
    if (RmrkActionRegex.ACCEPT.test(rmrkString)) {
        return RmrkEvent.ACCEPT;
    }

    if (RmrkActionRegex.CREATE.test(rmrkString)) {
        return RmrkEvent.CREATE;
    }

    //throw new EvalError(`[NFTUtils] Unable to get action from ${rmrkString}`);
    logger.error(`[NFTUtils] Unable to get action from ${rmrkString}`);

    return RmrkEvent.UNKNOWN;

}
export class RmrkActionRegex {
    static MINTNFT = /^[rR][mM][rR][kK]::MINTNFT::/;
    static MINT = /^[rR][mM][rR][kK]::MINT::/;
    static SEND = /^[rR][mM][rR][kK]::SEND::/;
    static BUY = /^[rR][mM][rR][kK]::BUY::/;
    static CONSUME = /^[rR][mM][rR][kK]::CONSUME::/;
    static CHANGEISSUER = /^[rR][mM][rR][kK]::CHANGEISSUER::/;
    static LIST = /^[rR][mM][rR][kK]::LIST::/;
    static EMOTE = /^[rR][mM][rR][kK]::EMOTE::/;

    static BURN = /^[rR][mM][rR][kK]::BURN::/;
    static RESADD = /^[rR][mM][rR][kK]::RESADD::/;
    static ACCEPT = /^[rR][mM][rR][kK]::ACCEPT::/;

    static CREATE = /^[rR][mM][rR][kK]::CREATE::/;

}


export function getRmrkSpecVersion(rmrkString: string): RmrkSpecVersion {
    try {
        const split = splitRmrkString(rmrkString);

        if (split.length >= 3) {
            let version = split[2];

            if (version === RmrkSpecVersion.V1) {
                return RmrkSpecVersion.V1;
            }

            if (version === RmrkSpecVersion.V2) {
                return RmrkSpecVersion.V2;
            }
        }
        return RmrkSpecVersion.V01;
    } catch (e) {
        logger.error(`getRmrkSpecVersion ${e}`);
        return RmrkSpecVersion.V1;
    }
}

const SQUARE = '::';
function splitRmrkString(rmrkString: string): string[] {
    const rmrk = isHex(rmrkString) ? hexToString(rmrkString) : rmrkString;
    let decoded = rmrk;
    try {
        decoded = decodeURIComponent(rmrk);
    } catch (e) {
        logger.error(`splitRmrkString.decodeURIComponent exception ${e}`);
        decoded = rmrk;
    }

    const split = decoded.split(SQUARE);
    return split;

}



export function unwrap(rmrkString: string): any {
    const rmrk = isHex(rmrkString) ? hexToString(rmrkString) : rmrkString;
    try {
        const decoded = decodeURIComponent(rmrk);
        const rr: RegExp = /{.*}/;
        const match = decoded.match(rr);

        if (match) {
            return JSON.parse(match[0]);
        }

        const split = decoded.split(SQUARE);

        if (split.length >= 4) {
            return ({
                id: split[3],
                metadata: split[4]
            } as RmrkInteraction);
        }
        throw new TypeError(`RMRK: Unable to unwrap object ${decoded}`);
    } catch (e) {
        throw e;
    }
}