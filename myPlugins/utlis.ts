export interface pluginInfo {
    name: string,
    version: [number, number, number],
    author: string
}

export const log2console = (message: any, title: string | null = null): void => {
    if (title === null) title = '---';

    console.log(`\n--- [ ${title} ]`)
    console.log(`\n ->  ${message}`)
    console.log('\n--- [ --- ]---')
}


export const plugin2console = (info: pluginInfo = { name: 'Empty', version: [1, 0, 0], author: 'BuraQ33' }): void => {
    console.log(`[ ${info.name} ] v${info.version.join('.')} (by: ${info.author})--> Loaded`)
}