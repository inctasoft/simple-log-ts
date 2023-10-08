import { Log } from "./log";

const my_correlation_id = 'my_correlation_id' // or {correlation_id: 'my_correlation_id'}
const log = new Log(my_correlation_id);

const my_object = {a:1, b: 'xyz', c: { nested: ['elem1','elem2', 3], more_nested: {d:1, e: '2'} } };
const my_string = 'Lorem ipsum';
const my_number = 42;

log.debug(my_string);  
log.info(my_number);
log.warn(my_object);
log.error(my_string);
log.crit(my_number);