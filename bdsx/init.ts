
// install source map
import { install as installSourceMapSupport } from "./source-map-support";
installSourceMapSupport();

// disable colors
import { disable as disableColors } from 'colors';
if(process.env.COLOR && !(process.env.COLOR === 'true' || process.env.COLOR === 'on')) disableColors();

// check
import './check';

// install bdsx error handler
import { installErrorHandler } from "./errorhandler";
installErrorHandler();

// legacy
import './legacy';

