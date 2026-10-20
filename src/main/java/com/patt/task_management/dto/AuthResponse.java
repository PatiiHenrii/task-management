package com.patt.task_management.dto;

public record AuthResponse(String token, String tokenType) {
    public AuthResponse(String token) {
        this(token, "Bearer");
    }
}
