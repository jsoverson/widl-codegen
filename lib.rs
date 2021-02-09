mod generated;
extern crate wapc_guest as guest;
use guest::prelude::*;
pub use generated::*;

#[no_mangle]
pub fn wapc_init() {
    Handlers::register_test_function(test_function);
}

fn test_function(_required: Required, _optional: Optional, _maps: Maps, _lists: Lists) -> HandlerResult<Tests> {
    Ok(Tests::default()) // TODO: Provide implementation.
}
