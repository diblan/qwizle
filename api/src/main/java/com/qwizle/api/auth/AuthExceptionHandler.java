package com.qwizle.api.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class AuthExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> responseStatus(ResponseStatusException ex) {
        String message = ex.getReason() == null ? "Request failed." : ex.getReason();
        return ResponseEntity.status(ex.getStatusCode()).body(new ApiError(message));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiError("Email and password are required."));
    }
}
