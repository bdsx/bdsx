
export class ScriptWriter {
    public script = '';
    private tabstr = '';

    static generateWarningComment(generatorName?:string, instead?:string):string[] {
        const out:string[] = [];
        if (generatorName != null) out.push(`Generated with ${generatorName}.`);
        else out.push(`Generated script.`);
        out.push(`Please DO NOT modify this directly.`);
        if (instead != null) {
            out.push(`If it's needed to update, Modify ${instead} instead`);
        }
        return out;
    }

    generateWarningComment(generatorName?:string, instead?:string):void {
        this.writeln('/**');
        for (const line of ScriptWriter.generateWarningComment(generatorName, instead)) {
            this.writeln(' * '+line);
        }
        this.writeln(' */');
    }

    tab(n:number):void {
        if (n < 0) {
            this.tabstr = this.tabstr.substr(0, this.tabstr.length + n);
        } else {
            this.tabstr += ' '.repeat(n);
        }
    }

    writeln(line:string):void {
        this.script += this.tabstr;
        this.script += line;
        this.script += '\r\n';
    }
}
