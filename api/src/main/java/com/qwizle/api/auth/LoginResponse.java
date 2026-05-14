package com.qwizle.api.auth;

public record LoginResponse(String token, UserProfile user) {
}
