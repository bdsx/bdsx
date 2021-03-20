
export class ScriptWriter {
    public script = '';
    private tabstr = '';

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
