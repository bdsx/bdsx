/**
 * for changing colors to chalk.
 * not using currently
 */
import * as chalk from 'chalk';
import * as colors from 'colors';

const colorsKeys = [
    'strip',
    'stripColors',
    'rainbow',
    'zebra',
    'america',
    'trap',
    'random',
    'zalgo',
] as const;
const mixedKeys = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'gray',
    'grey',
    'bgBlack',
    'bgRed',
    'bgGreen',
    'bgYellow',
    'bgBlue',
    'bgMagenta',
    'bgCyan',
    'bgWhite',

    'reset',
    'bold',
    'dim',
    'italic',
    'underline',
    'inverse',
    'hidden',
    'strikethrough',
] as const;

interface ColorsChalk extends chalk.Chalk {
    strip:colors.Color;
    stripColors:colors.Color;
    rainbow:colors.Color;
    zebra:colors.Color;
    america:colors.Color;
    trap:colors.Color;
    random:colors.Color;
    zalgo:colors.Color;

    black:ColorsChalk;
    red:ColorsChalk;
    green:ColorsChalk;
    yellow:ColorsChalk;
    blue:ColorsChalk;
    magenta:ColorsChalk;
    cyan:ColorsChalk;
    white:ColorsChalk;
    gray:ColorsChalk;
    grey:ColorsChalk;
    bgBlack:ColorsChalk;
    bgRed:ColorsChalk;
    bgGreen:ColorsChalk;
    bgYellow:ColorsChalk;
    bgBlue:ColorsChalk;
    bgMagenta:ColorsChalk;
    bgCyan:ColorsChalk;
    bgWhite:ColorsChalk;

    reset:ColorsChalk;
    bold:ColorsChalk;
    dim:ColorsChalk;
    italic:ColorsChalk;
    underline:ColorsChalk;
    inverse:ColorsChalk;
    hidden:ColorsChalk;
    strikethrough:ColorsChalk;

    (text: TemplateStringsArray, ...placeholders: unknown[]): string;
    (...text: unknown[]): string;
}

/**
 * @deprecated it will be removed someday. Please use chalk directly
 */
function chalkToColors(chalk:chalk.Chalk):ColorsChalk {
    for (const key of colorsKeys) {
        (chalk as ColorsChalk)[key] = colors[key];
    }
    for (const key of mixedKeys) {
        (chalk as ColorsChalk)[key] = chalkToColors(chalk[key]);
    }
    return chalk as ColorsChalk;
}

// declare module 'colors'
// {
//     /** @deprecated bdsx will use chalk module */
//     export const brightRed:chalk.Chalk;
//     /** @deprecated bdsx will use chalk module */
//     export const brightGreen:Color;
//     /** @deprecated bdsx will use chalk module */
//     export const brightYellow:chalk.Chalk;
//     /** @deprecated bdsx will use chalk module */
//     export const brightBlue:Color;
//     /** @deprecated bdsx will use chalk module */
//     export const brightMagenta:Color;
//     /** @deprecated bdsx will use chalk module */
//     export const brightCyan:Color;
//     /** @deprecated bdsx will use chalk module */
//     export const brightWhite:chalk.Chalk;
// }

/*
compatible for events.serverLog
using chalk as colors
colors.brightRed === chalk.redBright, makes it true
*/

(colors as any).brightRed = chalkToColors(chalk.redBright);
(colors as any).brightWhite = chalkToColors(chalk.whiteBright);
(colors as any).brightYellow = chalkToColors(chalk.yellowBright);
(colors as any).white = chalkToColors(chalk.white);
