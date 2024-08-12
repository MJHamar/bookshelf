use std::fmt::Binary;

use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};  // You need to add `chrono` to your Cargo.toml too
use log::debug;
use serde_json::Number;

pub const SHELF_KEY: &str = "shelves";
pub const BOOK_KEY: &str = "books";
pub const BOOK_COVER_KEY: &str = "book_covers";
pub const BOOK_PROGRESS_KEY: &str = "book_progress";

// a dictionary with a single key-value pair: "status": "ok"
#[derive(Serialize, Deserialize)]
pub struct DefaultResponse {
    pub status: String
}
impl Default for DefaultResponse {
    fn default() -> Self {
        DefaultResponse {
            status: "ok".to_string()
        }
    }
}


#[derive(Serialize, Deserialize)]
pub struct Shelf {
    pub id: Number,
    pub x_pos: Number,
    pub y_pos: Number,
    pub height: Number,
    pub width: Number,
}

#[derive(Serialize, Deserialize)]
pub struct Book {
    pub id: String,
    pub shelf_id: Number, // -1 if not on a shelf
    pub title: String,
    pub author: String,
    pub isbn: String,
    pub description: String,
}

#[derive(Serialize, Deserialize)]
pub struct BookCover {
    pub book_id: String,
    pub cover_fname: String,
    pub spine_fname: String
}

#[derive(Serialize, Deserialize)]
pub struct BookProgress {
    pub book_id: String,
    pub progress: Number, // 0: not started, 1: started, 2: finished
    pub started_dt: DateTime<Utc>,
    pub finished_dt: DateTime<Utc>,
    pub last_read_dt: DateTime<Utc>
}

pub async fn test_redis(params: String) -> redis::RedisResult<()> {
    let client = redis::Client::open(params)?;
    let mut con = client.get_multiplexed_async_connection().await?;

    // Set a key
    let _: () = con.set("test_key", "test_value").await?;

    // Get a key
    let result: String = con.get("test_key").await?;
    assert_eq!(result, "test_value");

    // Delete the key and test if the number of keys deleted was 1
    let result: i32 = con.del("test_key").await?;
    assert_eq!(result, 1);

    debug!("Redis test OK");

    Ok(())
}
