import { MCRESULT } from "./bds/command";

export interface CommandResult<DATA extends CommandResult.Any> extends MCRESULT {
    data:DATA;
}
export namespace CommandResult {

    export interface Any {
        statusMessage: string;
        statusCode: number;
        [key:string]:any;
    }
    export interface List {
        currentPlayerCount:number;
        maxPlayerCount:number;
        players:string;
        statusMessage: string;
        statusCode: number;
    }
    export interface TestFor {
        victim:string[];
        statusMessage: string;
        statusCode: number;
    }
    export interface TestForBlock {
        matches: boolean,
        position: VectorXYZ,
        statusMessage: string;
        statusCode: number;
    }
    export interface TestForBlocks {
        compareCount: number;
        matches: boolean,
        statusMessage: string;
        statusCode: number;
    }
}
enum CommandResultTypeEnum {
    Mute = 0x00,
    Data = 0x01,
    Output = 0x02,
    OutputAndData = 0x03,
}
export type CommandResultType = boolean|CommandResultTypeEnum|null;
export const CommandResultType = CommandResultTypeEnum;
