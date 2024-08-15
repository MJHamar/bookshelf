// Module for handling bookshelf related requests
use log::{debug,warn,info,error};
use actix_web::Responder;
use actix_web::{web, HttpResponse};
use redis::AsyncCommands;
use crate::db_conn::{Layout, //CurrentLayout,
                    Shelf, Book2Shelf, BookIdList,
                    Book, BookCover, BookProgress, BookView,
                    DefaultResponse,
                    DecorationSlot, Decoration, DecorationIdList,
                    _set_book, _set_book_cover, _set_book_progress,
                    LAYOUT_KEY, CURRENT_LAYOUT_KEY,
                    SHELF_KEY, BOOK2SHELF_KEY, BOOK_KEY, BOOK_COVER_KEY, BOOK_PROGRESS_KEY,
                    DECORATION_SLOT_KEY, DECORATION_KEY,
                    DEFAULT_BOOK_HEIGHT, DEFAULT_BOOK_WIDTH, DEFAULT_SPINE_WIDTH};
use uuid::Uuid;

async fn _get_layout_by_id(layout_id: &str, conn: &mut redis::aio::MultiplexedConnection) -> Option<Layout> {
    let layout_str: String = match conn.hget(&LAYOUT_KEY, layout_id).await {
        Ok(layout_str) => layout_str,
        Err(_) => {
            warn!("{}:{} key not found in Redis", LAYOUT_KEY, layout_id);
            return None
        }
    };
    let layout: Layout = match serde_json::from_str(&layout_str) {
        Ok(layout) => layout,
        Err(_) => {
            error!("Failed to parse layout: {}", layout_str);
            return None
        }
    };
    Some(layout)
}

pub async fn get_layout(layout_id: web::Path<String>, conn: web::Data<redis::Client>) -> impl Responder {
    info!("Getting layout");
    let layout_id = layout_id.into_inner();
    let mut con = match conn.get_multiplexed_tokio_connection().await {
        Ok(con) => con,
        Err(_) => {
            error!("Failed to get connection to Redis");
            return HttpResponse::InternalServerError().json(DefaultResponse::default())
        }
    };
    let layout: Option<Layout> = _get_layout_by_id(&layout_id, &mut con).await;
    match layout {
        Some(layout) => HttpResponse::Ok().json(layout),
        None => HttpResponse::NotFound().json(DefaultResponse::default())
    }
}

pub async fn get_current_layout(conn: web::Data<redis::Client>) -> impl Responder {
    info!("Getting current layout");
    let mut con = match conn.get_multiplexed_tokio_connection().await {
        Ok(con) => con,
        Err(_) => {
            error!("Failed to get connection to Redis");
            return HttpResponse::InternalServerError().json(DefaultResponse::default())
        }
    };
    let layout_id: String = match con.get(&CURRENT_LAYOUT_KEY).await {
        Ok(layout_id) => layout_id,
        Err(_) => {
            warn!("{} key not found in Redis", CURRENT_LAYOUT_KEY);
            return HttpResponse::NotFound().json(DefaultResponse::default())
        }
    };
    let layout: Option<Layout> = _get_layout_by_id(&layout_id, &mut con).await;
    match layout {
        Some(layout) => HttpResponse::Ok().json(layout),
        None => HttpResponse::NotFound().json(DefaultResponse::default())
    }
}

pub async fn get_shelves(layout_id: web::Path<String>, conn: web::Data<redis::Client>) -> impl Responder {
    info!("Getting shelves");
    let mut shelfs: Vec<Shelf> = Vec::new();

    let mut con = match conn.get_multiplexed_tokio_connection().await {
        Ok(con) => con,
        Err(_) => {
            error!("Failed to get connection to Redis");
            return HttpResponse::InternalServerError().json(shelfs)
        }
    };
    let layout_id = layout_id.into_inner();
    let shelf_key: String = format!("{}:{}", SHELF_KEY, layout_id);
    let shelf_strs: Vec<String> = match con.hvals(&shelf_key).await {
        Ok(shelf_strs) => shelf_strs,
        Err(_) => {
            warn!("{} key not found in Redis", shelf_key.clone());
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

pub async fn get_book2shelf_map(layout_id: web::Path<String>, conn: web::Data<redis::Client>) -> impl Responder {
    info!("Getting book2shelf map");
    let mut book2shelf_map: Vec<Book2Shelf> = Vec::new();

    let mut con = match conn.get_multiplexed_tokio_connection().await {
        Ok(con) => con,
        Err(_) => {
            error!("Failed to get connection to Redis");
            return HttpResponse::InternalServerError().json(book2shelf_map)
        }
    };
    let layout_id = layout_id.into_inner();
    let book2shelf_key: String = format!("{}:{}", BOOK2SHELF_KEY, layout_id);
    let book2shelf_strs: Vec<String> = match con.hvals(&book2shelf_key).await {
        Ok(book2shelf_strs) => book2shelf_strs,
        Err(_) => {
            warn!("{} key not found in Redis", book2shelf_key.clone());
            return HttpResponse::Ok().json(book2shelf_map)
        }
    };

    // query all book2shelf_strs at once
    for book2shelf_str in book2shelf_strs {
        let book2shelf: Book2Shelf = match serde_json::from_str(&book2shelf_str) {
            Ok(book2shelf) => book2shelf,
            Err(_) => {
                error!("Failed to parse book2shelf: {}", book2shelf_str);
                return HttpResponse::InternalServerError().json(book2shelf_map)
            }
        };
        debug!("Retreived book2shelf: {:?}", book2shelf.book_id);
        book2shelf_map.push(book2shelf);
    }

    HttpResponse::Ok().json(book2shelf_map)
}

pub async fn get_books(book_ids: web::Json<BookIdList>, conn: web::Data<redis::Client>) -> impl Responder {
    info!("Getting books");
    let book_ids = &book_ids.book_ids;
    let mut books: Vec<Book> = Vec::new();

    let mut con = match conn.get_multiplexed_tokio_connection().await {
        Ok(con) => con,
        Err(_) => {
            error!("Failed to get connection to Redis");
            return HttpResponse::InternalServerError().json(books)
        }
    };

    // query all book_strs at once
    for book_id in book_ids.iter() {
        let book_str: String = match con.hget(&BOOK_KEY, book_id).await {
            Ok(book_str) => book_str,
            Err(_) => {
                warn!("{}:{} key not found in Redis", BOOK_KEY, book_id);
                return HttpResponse::Ok().json(books)
            }
        };
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

pub async fn get_book_covers(book_ids: web::Json<BookIdList>, conn: web::Data<redis::Client>) -> impl Responder {
    let book_ids  = &book_ids.book_ids;
    let mut book_covers: Vec<BookCover> = Vec::new();
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");

    for book_id in book_ids.iter() {
        let book_cover_str: String = con.hget(&BOOK_COVER_KEY, book_id).await.expect("Failed to read book cover");
        let book_cover: BookCover = serde_json::from_str(&book_cover_str).expect("Failed to parse book cover");
        book_covers.push(book_cover);
    }

    HttpResponse::Ok().json(book_covers)
}

pub async fn get_book_progress(book_ids: web::Json<BookIdList>, conn: web::Data<redis::Client>) -> impl Responder {
    let book_ids = &book_ids.book_ids;
    let mut book_progress_v: Vec<BookProgress> = Vec::new();
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");

    for book_id in book_ids.iter() {
        let book_progress_str: String = con.hget(&BOOK_PROGRESS_KEY, book_id).await.expect("Failed to read book progress");
        let book_progress: BookProgress = serde_json::from_str(&book_progress_str).expect("Failed to parse book progress");
        book_progress_v.push(book_progress);
    }

    HttpResponse::Ok().json(book_progress_v)
}

pub async fn get_decoration_slots(layout_id: web::Path<String>, conn: web::Data<redis::Client>) -> impl Responder {
    let mut decoration_slots: Vec<DecorationSlot> = Vec::new();
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");
    let decoration_slot_key = format!("{}:{}", DECORATION_SLOT_KEY, layout_id.into_inner());
    let decoration_slot_strs: Vec<String> = con.hvals(decoration_slot_key).await.expect("Failed to read decoration slots");

    for decoration_slot_str in decoration_slot_strs {
        let decoration_slot: DecorationSlot = serde_json::from_str(&decoration_slot_str).expect("Failed to parse decoration slot");
        decoration_slots.push(decoration_slot);
    }

    HttpResponse::Ok().json(decoration_slots)
}

pub async fn get_decorations(dec_ids: web::Json<DecorationIdList>, conn: web::Data<redis::Client>) -> impl Responder {
    let dec_ids = &dec_ids.dec_ids;
    let mut decorations: Vec<Decoration> = Vec::new();
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");

    for dec_id in dec_ids.iter() {
        let decoration_str: String = con.hget(&DECORATION_KEY, dec_id).await.expect("Failed to read decoration");
        let decoration: Decoration = serde_json::from_str(&decoration_str).expect("Failed to parse decoration");
        decorations.push(decoration);
    }

    HttpResponse::Ok().json(decorations)
}

pub async fn create_book() -> impl Responder {
    let book = Book {
        id: Uuid::new_v4().to_string(),
        title: None,
        author: None,
        isbn: None,
        description: None,
    };
    let book_cover = BookCover {
        book_id: book.id.clone(),
        cover_fname: None,
        spine_fname: None,
        book_height: DEFAULT_BOOK_HEIGHT.into(),
        book_width: DEFAULT_BOOK_WIDTH.into(),
        spine_width: DEFAULT_SPINE_WIDTH.into(),
    };
    let book_progress = BookProgress {
        book_id: book.id.clone(),
        started_dt: None,
        finished_dt: None,
        last_read_dt: None,
    };

    // NOTE: We DO NOT COMMIT to the DB HERE

    HttpResponse::Ok().json({
        let view = BookView {
            book: book,
            cover: book_cover,
            progress: book_progress,
        };
        view
    })

}

pub async fn set_book(conn: web::Data<redis::Client>, mut body: web::Payload) -> impl Responder {
    info!("Setting book_data");
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");
    let mut bytes = web::BytesMut::new();
    while let Some(item) = futures::StreamExt::next(&mut body).await {
        bytes.extend_from_slice(&item.unwrap());
    }
    let book_data = String::from_utf8_lossy(&bytes).to_string();
    info!("Book_data: {}", book_data);
    let book_data_deserialized: Book = serde_json::from_str(&book_data).expect("Failed to deserialize book_data");

    let _ = match _set_book(&mut con, &book_data_deserialized).await {
        Ok(_) => (),
        Err(e) => {
            error!("Failed to set book: {}", e);
            return HttpResponse::InternalServerError().json(DefaultResponse::default())
        }
    };

    HttpResponse::Ok().json(DefaultResponse::default())
}

pub async fn set_book_cover(conn: web::Data<redis::Client>, mut body: web::Payload) -> impl Responder {
    info!("Setting book cover");
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");
    let mut bytes = web::BytesMut::new();
    while let Some(item) = futures::StreamExt::next(&mut body).await {
        bytes.extend_from_slice(&item.unwrap());
    }
    let book_cover = String::from_utf8_lossy(&bytes).to_string();
    info!("Book cover: {}", book_cover);
    let book_cover_deserialized: BookCover = serde_json::from_str(&book_cover).expect("Failed to deserialize book cover");

    let _ = match _set_book_cover(&mut con, &book_cover_deserialized).await {
        Ok(_) => (),
        Err(e) => {
            error!("Failed to set book: {}", e);
            return HttpResponse::InternalServerError().json(DefaultResponse::default())
        }
    };

    HttpResponse::Ok().json(DefaultResponse::default())
}

pub async fn set_book_progress(conn: web::Data<redis::Client>, mut body: web::Payload) -> impl Responder {
    info!("Setting book progress");
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");
    let mut bytes = web::BytesMut::new();
    while let Some(item) = futures::StreamExt::next(&mut body).await {
        bytes.extend_from_slice(&item.unwrap());
    }
    let book_progress = String::from_utf8_lossy(&bytes).to_string();
    info!("Book progress: {}", book_progress);
    let book_progress_deserialized: BookProgress = serde_json::from_str(&book_progress).expect("Failed to deserialize book progress");
    

    let _ = match _set_book_progress(&mut con, &book_progress_deserialized).await {
        Ok(_) => (),
        Err(e) => {
            error!("Failed to set book: {}", e);
            return HttpResponse::InternalServerError().json(DefaultResponse::default())
        }
    };

    HttpResponse::Ok().json(DefaultResponse::default())
}

pub async fn set_decoration_slot(conn: web::Data<redis::Client>, decoration_slot: web::Json<DecorationSlot>) -> impl Responder {
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");
    let decoration_slot = decoration_slot.into_inner();
    let slot_id = decoration_slot.id.to_string();
    let decoration_slot_str = serde_json::to_string(&decoration_slot).expect("Failed to serialize decoration slot");

    let _: () = con.hset(&DECORATION_SLOT_KEY, slot_id, decoration_slot_str).await.expect("Failed to set decoration slot");

    HttpResponse::Ok().json(DefaultResponse::default())
}

pub async fn set_decoration(conn: web::Data<redis::Client>, decoration: web::Json<Decoration>) -> impl Responder {
    let mut con = conn.get_multiplexed_tokio_connection().await.expect("Connection failed");
    let decoration = decoration.into_inner();
    let dec_id = decoration.id.to_string();
    let decoration_str = serde_json::to_string(&decoration).expect("Failed to serialize decoration");

    let _: () = con.hset(&DECORATION_KEY, dec_id, decoration_str).await.expect("Failed to set decoration");

    HttpResponse::Ok().json(DefaultResponse::default())
}