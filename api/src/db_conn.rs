
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};  // You need to add `chrono` to your Cargo.toml too
use log::debug;
use serde_json::Number;
use std::option::Option;
use std::vec::Vec;

pub const CURRENT_LAYOUT_KEY: &str = "crnt_layout";
pub const LAYOUT_KEY: &str = "layouts";
pub const SHELF_KEY: &str = "shelves";
pub const BOOK2SHELF_KEY: &str = "book2shelf";
pub const BOOK_ORDER_KEY: &str = "book_order";
pub const BOOK_KEY: &str = "books";
pub const BOOK_COVER_KEY: &str = "book_covers";
pub const BOOK_PROGRESS_KEY: &str = "book_progress";
pub const BOOK_PROGRESS_READS_KEY: &str = "book_progress_reads";
pub const DECORATION_SLOT_KEY: &str = "decoration_slots";
pub const DECORATION_KEY: &str = "decorations";

// DEFAULTS
pub const DEFAULT_BOOK_HEIGHT: i32 = 200;
pub const DEFAULT_BOOK_WIDTH: i32 = 150;
pub const DEFAULT_SPINE_WIDTH: i32 = 50;


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
pub struct Layout {
    pub id: String,
    pub layout_fname: String,
    pub texture_fname: Option<String>,
    pub width: Number,
    pub height: Number,
    // TODO: add shelf and decoration slot numbers
}


#[derive(Serialize, Deserialize)]
pub struct Shelf {
    pub id: Number,
    pub x_pos: Number,
    pub y_pos: Number,
    pub height: Number,
    pub width: Number,
}

#[derive(Deserialize)]
pub struct BookIdList {
    pub book_ids: Vec<String>
}
#[derive(Serialize, Deserialize)]
pub struct Book {
    pub id: String,
    pub title: Option<String>,
    pub author: Option<String>,
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct Book2Shelf {
    pub books: Vec<String>,
    pub shelf_id: Number,
}

#[derive(Serialize, Deserialize)]
pub struct BookOrder {
    pub shelf_id: Number,
    pub id_list: Vec<String>
}

#[derive(Serialize, Deserialize)]
pub struct BookCover {
    pub book_id: String,
    pub cover_fname: Option<String>,
    pub spine_fname: Option<String>,
    pub book_height: Number, // defaults to 200
    pub book_width: Number,  // defaults to 150
    pub spine_width: Number, // defaults to 50
}

#[derive(Serialize, Deserialize)]
pub struct BookProgress {
    pub book_id: String,
    pub started_dt: Option<DateTime<Utc>>,
    pub finished_dt: Option<DateTime<Utc>>,
}

#[derive(Serialize, Deserialize)]
pub struct BookProgressReads {
    pub book_id: String,
    pub reads: Vec<DateTime<Utc>>
}

#[derive(Serialize, Deserialize)]
pub struct BookView {
    pub book: Book,
    pub cover: BookCover,
    pub progress: BookProgress
}

#[derive(Serialize, Deserialize)]
pub struct DecorationSlot {
    pub id: Number,
    pub layout_id: String,
    pub decoration_id: String,
    pub x_pos: Number,
    pub y_pos: Number,
    pub height: Number,
    pub width: Number,
}

#[derive(Serialize, Deserialize)]
pub struct Decoration {
    pub id: String,
    pub decoration_type: String, 
    pub decoration_fname: String,
}

#[derive(Deserialize)]
pub struct DecorationIdList {
    pub dec_ids: Vec<String>
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

pub async fn _set_book(redis: &mut redis::aio::MultiplexedConnection, book: &Book) -> redis::RedisResult<()> {
    let book_json = serde_json::to_string(&book)
                    .expect("Failed to serialize book");
    let _: () = redis.hset(BOOK_KEY, book.id.clone(), book_json)
                    .await
                    .expect("Failed to set book cover");
    Ok(())
}

pub async fn _set_book_cover(redis: &mut redis::aio::MultiplexedConnection, cover: &BookCover) -> redis::RedisResult<()> {
    let cover_json = serde_json::to_string(&cover)
                    .expect("Failed to serialize book cover");
    let book_id = cover.book_id.clone();
    let _: () = redis.hset(BOOK_COVER_KEY, book_id, cover_json)
                    .await
                    .expect("Failed to set book cover");
    Ok(())
}

pub async fn _set_book_progress(redis: &mut redis::aio::MultiplexedConnection, progress: &BookProgress) -> redis::RedisResult<()> {
    let progress_json = serde_json::to_string(&progress)
                    .expect("Failed to serialize book progress");
    let _: () = redis.hset(BOOK_PROGRESS_KEY, progress.book_id.clone(), progress_json)
                    .await
                    .expect("Failed to set book progress");
    Ok(())
}

