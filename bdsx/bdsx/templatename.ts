
export function templateName(name:string, ...templateParams:string[]):string {
    let idx = templateParams.length;
    if (idx === 0) return name+'<>';
    idx--;
    if (templateParams[idx].endsWith('>')) templateParams[idx] += ' ';
    return name+'<'+templateParams.join(',')+'>';
}
