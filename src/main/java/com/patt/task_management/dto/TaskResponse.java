package com.patt.task_management.dto;

import com.patt.task_management.model.Task;
import java.time.Instant;
import java.time.OffsetDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        String status,
        OffsetDateTime dueDate,
        Instant createdAt) {

    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueDate(),
                task.getCreatedAt());
    }
}
