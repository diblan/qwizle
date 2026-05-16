package com.qwizle.api.questions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class QuestionValidation {
    private QuestionValidation() {
    }

    static void badRequest(String message) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    static String requireCleanText(String value, String fieldName) {
        String clean = value == null ? "" : value.trim();
        if (clean.isBlank()) {
            badRequest(fieldName + " is required.");
        }
        if (clean.length() > 1000) {
            badRequest(fieldName + " must be 1000 characters or fewer.");
        }
        return clean;
    }
}
