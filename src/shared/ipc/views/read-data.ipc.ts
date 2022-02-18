import { IPCBaseMessage } from "../base.ipc";

export namespace IPCReadData {
    export interface IIPCReadDataLimit {
        limit: number;
        offset: number;
    }

    export interface IIPCReadDataSearch {
        columns: string[],
        text: string
    }

    export interface IIPCReadDataWhere {
        column: string;
        opr: IIPCReadDataWhereOpr | string;
        value: any;
        or: boolean;
    }

    export interface IIPCReadDataJoin {
        table: string;
        alias?: string;
        on: IIPCRuleSet;
        columns: string[];
        /*{
            local: string,
            target: string,
            opr: IIPCReadDataWhereOpr
        }*/
    }

    export enum IIPCReadDataWhereOpr {
        EQ = "=",
        GT = ">",
        LT = "<"
    }

    export interface IIPCRuleSet {
        condition: string;
        rules: Array<IIPCRuleSet | IIPCRule>;
        isChild?: boolean;
    }

    export interface IIPCRule {
        field: string;
        value?: any;
        operator?: string;
        entity?: string;
    }

    export interface IRequest {
        table: string;
        limit: IIPCReadDataLimit;
        columns: string[];
        search?: IIPCReadDataSearch;
        where?: IIPCReadDataWhere[];
        join?: IIPCReadDataJoin[];
    }
    export interface IResponse {
        valid: boolean;
        error?: string;
        data?: {
            [key: string]: any
        }[],
        count?: number;
    }
    export class Request extends IPCBaseMessage<IRequest> { }
    export class Response extends IPCBaseMessage<IResponse> { }
    export const CHANNEL: string = "channel_read_data";
}