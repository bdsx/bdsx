
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
        }
    }
}

export {};
