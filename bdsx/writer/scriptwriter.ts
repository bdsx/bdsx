export class ScriptWriter {
    public script = "";
    public lineNumber = 0;
    public columnNumber = 0;
    private tabstr = "";

    tab(n: number): void {
        if (n < 0) {
            this.tabstr = this.tabstr.substr(0, this.tabstr.length + n);
        } else {
            this.tabstr += " ".repeat(n);
        }
        this.columnNumber = this.tabstr.length;
    }

    writeln(line: string): void {
        this.script += this.tabstr;
        this.script += line;
        this.script += "\r\n";
        this.lineNumber += 1;
    }
}
