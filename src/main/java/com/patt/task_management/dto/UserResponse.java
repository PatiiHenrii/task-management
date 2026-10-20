package com.patt.task_management.dto;

import com.patt.task_management.model.AppUser;

public record UserResponse(Long id, String name, String email) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
