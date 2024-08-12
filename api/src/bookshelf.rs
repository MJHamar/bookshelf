use std::ptr::null;

use log::{debug,warn,info,error};
use actix_web::Responder;
use actix_web::{web, HttpResponse};
use redis::{AsyncCommands, RedisError};
use crate::db_conn::{Shelf, Book, BookCover, BookProgress, DefaultResponse,
                    SHELF_KEY, BOOK_KEY, BOOK_COVER_KEY, BOOK_PROGRESS_KEY};
use uuid::Uuid;

pub async fn get_shelves(conn: web::Data<redis::Client>) -> impl Responder {
    info!("Getting shelves");
    let mut shelfs: Vec<Shelf> = Vec::new();

    let mut con = match conn.get_multiplexed_tokio_connection().await {
        Ok(con) => con,
        Err(_) => {
            error!("Failed to get connection to Redis");
            return HttpResponse::InternalServerError().json(shelfs)
        }
    };
    let shelf_strs: Vec<String> = match con.hvals(&SHELF_KEY).await {
        Ok(shelf_strs) => shelf_strs,
        Err(_) => {
            warn!("{} key not found in Redis", SHELF_KEY);
            return HttpResponse::Ok().json(shelfs)
        }
    };

    // query all shelf_strs at once
    for shelf_str in shelf_strs {
        let shelf: Shelf = match serde_json::from_str(&shelf_str) {
            Ok(shelf) => shelf,
            Err(_) => {
                error!("Failed to parse shelf: {}", shelf_str);
                return HttpResponse::InternalServerError().json(shelfs)
            }
        };
        debug!("Retreived shelf: {:?}", shelf.id);
        shelfs.push(shelf);
    }

    HttpResponse::Ok().json(shelfs)
}

pub async fn get_books(conn: web::Data<redis::Client>) -> impl Responder {
    info!("Getting shelves");
    let mut books: Vec<Book> = Vec::new();

    let mut con = match conn.get_multiplexed_tokio_connection().await {
        Ok(con) => con,
        Err(_) => {
            error!("Failed to get connection to Redis");
            return HttpResponse::InternalServerError().json(books)
        }
    };
    let book_strs: Vec<String> = match con.hvals(&BOOK_KEY).await {
        Ok(book_strs) => book_strs,
        Err(_) => {
            warn!("{} key not found in Redis", BOOK_KEY);
            return HttpResponse::Ok().json(books)
        }
    };

    // query all book_strs at once
    for book_str in book_strs {
        let book: Book = match serde_json::from_str(&book_str) {
            Ok(book) => book,
            Err(_) => {
                error!("Failed to parse book: {}", book_str);
                return HttpResponse::InternalServerError().json(books)
            }
        };
        debug!("Retreived book: {:?}", book.id);
        books.push(book);
    }

    HttpResponse::Ok().json(books)
}

pub async fn get_book_covers(book_ids: web::Json<Vec<String>>, conn: web::Data<redis::Client>) -> impl Responder {
    let mut book_covers: Vec<BookCover> = Vec::new();
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");

    for book_id in book_ids.iter() {
        let book_cover_str: String = con.hget(&BOOK_COVER_KEY, book_id).await.expect("Failed to read book cover");
        let book_cover: BookCover = serde_json::from_str(&book_cover_str).expect("Failed to parse book cover");
        book_covers.push(book_cover);
    }

    HttpResponse::Ok().json(book_covers)
}

pub async fn get_book_progress(book_ids: web::Json<Vec<String>>, conn: web::Data<redis::Client>) -> impl Responder {
    let mut book_progress_v: Vec<BookProgress> = Vec::new();
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");

    for book_id in book_ids.iter() {
        let book_progress_str: String = con.hget(&BOOK_PROGRESS_KEY, book_id).await.expect("Failed to read book progress");
        let book_progress: BookProgress = serde_json::from_str(&book_progress_str).expect("Failed to parse book progress");
        book_progress_v.push(book_progress);
    }

    HttpResponse::Ok().json(book_progress_v)
}

pub async fn set_book(conn: web::Data<redis::Client>, book: web::Json<Book>) -> impl Responder {
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");
    // check if book already exists
    // i.e. if book.id is not None and book.id is in the BOOK_KEY
    if book.into_inner().id != "" {
        let book_id: String = book.into_inner().id;
        let book_str: Option<String>  = con.hget(&BOOK_KEY, book_id.clone()).await.expect("Failed to read book");
        if book_str.is_some() {
        // Update the book
        let book_str: String = serde_json::to_string(&book).expect("Failed to serialize book");
        con.hset(&BOOK_KEY, book_id, book_str).await.expect("Failed to set book");
        return HttpResponse::Ok().json(DefaultResponse::default());
    } else {
            // create new book
            let book_id = Uuid::new_v4().to_string();
            let book = book.into_inner();
            book.id = book_id.clone();
            let book_str = serde_json::to_string(&book).expect("Failed to serialize book");
            con.hset(&BOOK_KEY, book_id, book_str).await.expect("Failed to set book");
            return HttpResponse::Ok().json(DefaultResponse::default())
        }
    }
    let book_id = book.id.to_string();
    let book = book.into_inner();
    let book_str = serde_json::to_string(&book).expect("Failed to serialize book");

    con.hset(&BOOK_KEY, book_id, book_str).await.expect("Failed to set book");

    HttpResponse::Ok().json(DefaultResponse::default())
}

pub async fn set_book_cover(conn: web::Data<redis::Client>, book_cover: web::Json<BookCover>) -> impl Responder {
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");
    let book_cover = book_cover.into_inner();
    let book_id: String = book_cover.book_id.to_string();
    let book_cover_str: String = serde_json::to_string(&book_cover).expect("Failed to serialize book cover");

    con.hset(&BOOK_COVER_KEY, book_id, book_cover_str).await.expect("Failed to set book cover");

    HttpResponse::Ok().json(DefaultResponse::default())
}

pub async fn set_book_progress(conn: web::Data<redis::Client>, book_progress: web::Json<BookProgress>) -> impl Responder {
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");
    let book_progress = book_progress.into_inner();
    let book_id = book_progress.book_id.to_string();
    let book_progress_str: String = serde_json::to_string(&book_progress).expect("Failed to serialize book progress");
    
    con.hset(&BOOK_PROGRESS_KEY, book_id, &book_progress_str as &str).await.expect("Failed to set book progress");

    HttpResponse::Ok().json(DefaultResponse::default())
}
