extern crate rmp_serde as rmps;
use rmps::{Deserializer, Serializer};
use serde::{Deserialize, Serialize};
use std::io::Cursor;

#[cfg(feature = "guest")]
extern crate wapc_guest as guest;
#[cfg(feature = "guest")]
use guest::prelude::*;

#[cfg(feature = "guest")]
use lazy_static::lazy_static;
#[cfg(feature = "guest")]
use std::sync::RwLock;

#[cfg(feature = "guest")]
pub struct Handlers {}

#[cfg(feature = "guest")]
impl Handlers {
    pub fn register_test_function(f: fn(Required, Optional, Maps, Lists) -> HandlerResult<Tests>) {
        *TEST_FUNCTION.write().unwrap() = Some(f);
        register_function(&"testFunction", test_function_wrapper);
    }
}

#[cfg(feature = "guest")]
lazy_static! {
    static ref TEST_FUNCTION: RwLock<Option<fn(Required, Optional, Maps, Lists) -> HandlerResult<Tests>>> =
        RwLock::new(None);
}

#[cfg(feature = "guest")]
fn test_function_wrapper(input_payload: &[u8]) -> CallResult {
    let input = deserialize::<TestFunctionArgs>(input_payload)?;
    let lock = TEST_FUNCTION.read().unwrap().unwrap();
    let result = lock(input.required, input.optional, input.maps, input.lists)?;
    Ok(serialize(result)?)
}

#[derive(Debug, PartialEq, Deserialize, Serialize, Default, Clone)]
pub struct TestFunctionArgs {
    #[serde(rename = "required")]
    pub required: Required,
    #[serde(rename = "optional")]
    pub optional: Optional,
    #[serde(rename = "maps")]
    pub maps: Maps,
    #[serde(rename = "lists")]
    pub lists: Lists,
}

/// All actors must return a health check response to the host upon receipt of a
/// health request. Returning in `Err` indicates total
///
/// actor failure, while returning a valid response with the `healthy` flag set to
/// false indicates that the actor has somehow detected that it cannot perform its
/// given task
#[derive(Debug, PartialEq, Deserialize, Serialize, Default, Clone)]
pub struct Tests {
    #[serde(rename = "required")]
    pub required: Required,
    #[serde(rename = "optional")]
    pub optional: Optional,
    #[serde(rename = "maps")]
    pub maps: Maps,
    #[serde(rename = "lists")]
    pub lists: Lists,
}

/// Required fields
#[derive(Debug, PartialEq, Deserialize, Serialize, Default, Clone)]
pub struct Required {
    #[serde(rename = "boolValue")]
    pub bool_value: bool,
    #[serde(rename = "u8Value")]
    pub u8_value: u8,
    #[serde(rename = "u16Value")]
    pub u16_value: u16,
    #[serde(rename = "u32Value")]
    pub u32_value: u32,
    #[serde(rename = "u64Value")]
    pub u64_value: u64,
    #[serde(rename = "s8Value")]
    pub s8_value: i8,
    #[serde(rename = "s16Value")]
    pub s16_value: i16,
    #[serde(rename = "s32Value")]
    pub s32_value: i32,
    #[serde(rename = "s64Value")]
    pub s64_value: i64,
    #[serde(rename = "f32Value")]
    pub f32_value: f32,
    #[serde(rename = "f64Value")]
    pub f64_value: f64,
    #[serde(rename = "stringValue")]
    pub string_value: String,
    #[serde(with = "serde_bytes")]
    #[serde(rename = "bytesValue")]
    pub bytes_value: Vec<u8>,
    #[serde(rename = "objectValue")]
    pub object_value: Thing,
}

/// Optional values
#[derive(Debug, PartialEq, Deserialize, Serialize, Default, Clone)]
pub struct Optional {
    #[serde(rename = "boolValue")]
    pub bool_value: Option<bool>,
    #[serde(rename = "u8Value")]
    pub u8_value: Option<u8>,
    #[serde(rename = "u16Value")]
    pub u16_value: Option<u16>,
    #[serde(rename = "u32Value")]
    pub u32_value: Option<u32>,
    #[serde(rename = "u64Value")]
    pub u64_value: Option<u64>,
    #[serde(rename = "s8Value")]
    pub s8_value: Option<i8>,
    #[serde(rename = "s16Value")]
    pub s16_value: Option<i16>,
    #[serde(rename = "s32Value")]
    pub s32_value: Option<i32>,
    #[serde(rename = "s64Value")]
    pub s64_value: Option<i64>,
    #[serde(rename = "f32Value")]
    pub f32_value: Option<f32>,
    #[serde(rename = "f64Value")]
    pub f64_value: Option<f64>,
    #[serde(rename = "stringValue")]
    pub string_value: Option<String>,
    #[serde(with = "serde_bytes")]
    #[serde(rename = "bytesValue")]
    pub bytes_value: Option<Vec<u8>>,
    #[serde(rename = "objectValue")]
    pub object_value: Option<Thing>,
}

#[derive(Debug, PartialEq, Deserialize, Serialize, Default, Clone)]
pub struct Maps {
    #[serde(rename = "mapStringPrimative")]
    pub map_string_primative: std::collections::HashMap<u32, String>,
    #[serde(rename = "mapU64Primative")]
    pub map_u64_primative: std::collections::HashMap<u32, u64>,
}

#[derive(Debug, PartialEq, Deserialize, Serialize, Default, Clone)]
pub struct Lists {
    #[serde(rename = "listStrings")]
    pub list_strings: Vec<String>,
    #[serde(rename = "listU64s")]
    pub list_u64s: Vec<u64>,
    #[serde(rename = "listObjects")]
    pub list_objects: Vec<Thing>,
    #[serde(rename = "listObjectsOptional")]
    pub list_objects_optional: Vec<Option<Thing>>,
}

#[derive(Debug, PartialEq, Deserialize, Serialize, Default, Clone)]
pub struct Thing {
    #[serde(rename = "value")]
    pub value: String,
}

/// The standard function for serializing codec structs into a format that can be
/// used for message exchange between actor and host. Use of any other function to
/// serialize could result in breaking incompatibilities.
pub fn serialize<T>(
    item: T,
) -> ::std::result::Result<Vec<u8>, Box<dyn std::error::Error + Send + Sync>>
where
    T: Serialize,
{
    let mut buf = Vec::new();
    item.serialize(&mut Serializer::new(&mut buf).with_struct_map())?;
    Ok(buf)
}

/// The standard function for de-serializing codec structs from a format suitable
/// for message exchange between actor and host. Use of any other function to
/// deserialize could result in breaking incompatibilities.
pub fn deserialize<'de, T: Deserialize<'de>>(
    buf: &[u8],
) -> ::std::result::Result<T, Box<dyn std::error::Error + Send + Sync>> {
    let mut de = Deserializer::new(Cursor::new(buf));
    match Deserialize::deserialize(&mut de) {
        Ok(t) => Ok(t),
        Err(e) => Err(format!("Failed to de-serialize: {}", e).into()),
    }
}
