
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
}

export {};
