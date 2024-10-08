use actix_web::web::Data;
use actix_web::{web, App, HttpServer, Responder};
use actix_cors::Cors;
use log::{info, debug, error};
use crate::db_conn;
use crate::bookshelf;
use crate::util::settings::load_config;
use crate::data_handler;

async fn index() -> impl Responder {
    "Hello! This is the habit tracker backend. You should leave..."
}

#[actix_web::main]
pub async fn serve() -> std::io::Result<()> {
    info!("Starting server ...");
    let settings = load_config();

    // Set up redis connection
    let redis_params: String = format!("redis://{}:{}", settings.redis.host, settings.redis.port);
    match db_conn::test_redis(redis_params.clone()).await {
        Ok(_) => debug!("Redis connection successful"),
        Err(e) => error!("Error connecting to Redis: {}", e),
    }
    let redis = redis::Client::open(redis_params).unwrap();

    // Set up server
    let server_url = format!("{}:{}", settings.api.host, settings.api.port);

    HttpServer::new(move || {
        let cors: Cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();
        App::new()
            .wrap(cors)
            .app_data(Data::new(redis.clone()))
            .route("/", web::get().to(index))
            .route("/books/layout/{layout_id}", web::get().to(bookshelf::get_layout))
            .route("/books/current_layout", web::get().to(bookshelf::get_current_layout))
            .route("/books/shelves/{layout_id}", web::get().to(bookshelf::get_shelves))
            .route("/books/b2s/{layout_id}", web::get().to(bookshelf::get_book2shelf_map))
            .route("/books/b2s/{layout_id}", web::post().to(bookshelf::set_book2shelf_map))
            .route("/books", web::post().to(bookshelf::get_books))
            .route("/books/covers", web::post().to(bookshelf::get_book_covers))
            .route("/books/progress", web::post().to(bookshelf::get_book_progress))
            .route("/books/progress/reads/{book_id}", web::get().to(bookshelf::get_book_progress_reads))
            .route("/books/progress/reads/{book_id}", web::post().to(bookshelf::set_book_progress_reads))
            .route("/books/decoration_slots/{layout_id}", web::get().to(bookshelf::get_decoration_slots))
            .route("/books/decoration", web::post().to(bookshelf::get_decorations))
            .route("/books/create", web::post().to(bookshelf::create_book))
            .route("/books/set", web::post().to(bookshelf::set_book))
            .route("/books/covers/set", web::post().to(bookshelf::set_book_cover))
            .route("/books/progress/set", web::post().to(bookshelf::set_book_progress))
            .route("/books/decoration_slots/set", web::post().to(bookshelf::set_decoration_slot))
            .route("/books/decoration/set", web::post().to(bookshelf::set_decoration))
            .route("/data/{id}", web::get().to(data_handler::get_data))
            .route("/data", web::post().to(data_handler::set_data))
            .route("/data/{id}", web::delete().to(data_handler::delete_data))
    })
    .bind(server_url)?
    .run()
    .await
}
