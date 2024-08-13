use actix_web::{test, App};
use serde_json::json;
use actix_web::http;

#[cfg(test)]
mod tests {

    use std::fs::File;

    use super::api::{get_books, get_layout};

    #[actix_rt::test]
    async fn test_get_books() {
        let mut app = test::init_service(App::new().service(get_books)).await;

        let req = test::TestRequest::get().uri("/books").to_request();
        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), http::StatusCode::OK);

        let body = test::read_body(resp).await;
        // read expected response from ../db/test/test1_books.json
        let epx_filename = "../db/test/test1_books.json";
        let file = File::open(epx_filename).expect("Unable to open file");
        // read the JSON contents of the file as a string
        let expected_response = serde_json::from_reader(file).expect("Unable to read file");

        assert_eq!(body, expected_response.to_string());
    }

    // Add more test functions for other GET endpoints here

    #[actix_rt::test]
    async fn test_get_layout() {
        let mut app = test::init_service(App::new().service(get_layout)).await;

        let req = test::TestRequest::get().uri("/books/layout/1").to_request();
        let resp = test::call_service(&mut app, req).await;

        assert_eq!(resp.status(), http::StatusCode::OK);

        let body = test::read_body(resp).await;
        // read expected response from ../db/test/test1_layout.json
        let epx_filename = "../db/test/test1_layout.json";
        let file = File::open(epx_filename).expect("Unable to open file");
        // read the JSON contents of the file as a string
        let expected_response = serde_json::from_reader(file).expect("Unable to read file");

        assert_eq!(body, expected_response.to_string());
    }

    // Add more test functions for other GET endpoints here
}