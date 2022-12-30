
// Please start your own codes from here!

//import './example_and_test';
import {events} from 'bdsx/event';
import {PistonAction} from 'bdsx/event_impl/blockevent';

events.pistonMove.on((ev) => {
    console.log(ev.blockPos);
    console.log(ev.affectedBlocks);
    console.log(PistonAction[ev.action]);
})