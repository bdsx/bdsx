
interface IExecuteCommandCallbackFix extends IExecuteCommandCallback {
    data: {
        message:string;
        statucMessage: string;
        statusCode: number;
    }
}

declare global
{
    namespace NodeJS {
        interface Process
        {
            jsEngine?:'chakracore';
        }
        interface ProcessVersions
        {
            chakracore?:string;
            // bedrock_server:string; // it does not exists yet
        }
    }
    interface IServerSystem<TSystem> {
        executeCommand(command: string, callback: (callback: IExecuteCommandCallbackFix) => void): void;
    }
} 

export {};