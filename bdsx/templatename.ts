
export function templateName(name:string, ...templateParams:string[]):string {
    const idx = templateParams.length-1;
    if (templateParams[idx].endsWith('>')) templateParams[idx] += ' ';
    return name+'<'+templateParams.join(',')+'>';
}
