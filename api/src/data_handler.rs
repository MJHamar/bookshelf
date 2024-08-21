use actix_multipart::Multipart;
use actix_web::{web, App, HttpServer, Responder, post, get};
use futures_util::TryStreamExt as _;
use log::{debug, error, info};
use redis::AsyncCommands;
use uuid::Uuid;
use std::io::Write;

const DATA_KEY: &str = "data";

async fn save_file(mut payload: Multipart, conn: &mut redis::aio::MultiplexedConnection) -> Result<String, Box<dyn std::error::Error>> {
    let uuid = Uuid::new_v4().to_string();

    while let Ok(Some(mut field)) = payload.try_next().await {
        let content_type = field.content_type().to_string();
        let mut data = Vec::new();
        while let Some(chunk) = field.try_next().await? {
            data.extend_from_slice(&chunk);
        }

        let value = serde_json::json!({
            "file_name": field.content_disposition().get_filename().unwrap_or("unknown"),
            "content_type": content_type,
            "data": base64::encode(&data),
        });
        info!("Saving file with id: {}, value: {}", uuid, value.to_string());

        let _ = match conn.hset(&DATA_KEY, &uuid, value.to_string()).await {
            Ok(val) => val,
            Err(e) => {error!("{}", e); return Err(Box::new(e));}
        };
        // conn.set_ex(&uuid, value.to_string(), 3600).await?; // Set with expiration of 1 hour
    }
    info!("File saved");
    Ok(uuid)
}

pub async fn set_data(payload: Multipart, conn: web::Data<redis::Client>) -> impl Responder {
    info!("Saving file");
    let mut con = match conn.get_multiplexed_tokio_connection().await {
        Ok(con) => con,
        Err(e) => return actix_web::HttpResponse::InternalServerError().body(e.to_string()),
    };
    match save_file(payload, &mut con).await {
        Ok(uuid) => actix_web::HttpResponse::Ok().body(uuid),
        Err(e) => actix_web::HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_data(id: web::Path<String>, conn: web::Data<redis::Client>) -> impl Responder {
    info!("Getting file");
    let mut con = match conn.get_multiplexed_tokio_connection().await {
        Ok(con) => con,
        Err(e) => return actix_web::HttpResponse::InternalServerError().body(e.to_string()),
    };
    let value: Option<String> = match con.hget(DATA_KEY, &id.into_inner()).await {
        Ok(val) => val,
        Err(e) => return actix_web::HttpResponse::InternalServerError().body(e.to_string()),
    };

    if let Some(val) = value {
        let data: serde_json::Value = serde_json::from_str(&val).unwrap();
        let file_data = base64::decode(data["data"].as_str().unwrap()).unwrap();
        actix_web::HttpResponse::Ok()
            .content_type(data["content_type"].as_str().unwrap())
            .body(file_data)
    } else {
        actix_web::HttpResponse::NotFound().body("File not found")
    }
}

pub async fn delete_data(id: web::Path<String>, conn: web::Data<redis::Client>) -> impl Responder {
    let mut con = match conn.get_multiplexed_tokio_connection().await {
        Ok(con) => con,
        Err(e) => return actix_web::HttpResponse::InternalServerError().body(e.to_string()),
    };
    let result: i32 = match con.del(&id.into_inner()).await {
        Ok(val) => val,
        Err(e) => return actix_web::HttpResponse::InternalServerError().body(e.to_string()),
    };

    if result == 1 {
        actix_web::HttpResponse::Ok().body("File deleted")
    } else {
        actix_web::HttpResponse::NotFound().body("File not found")
    }
}