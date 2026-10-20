package com.patt.task_management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record TaskRequest(
        @NotBlank @Size(max = 255) String title,
        @Size(max = 10000) String description,
        @Size(max = 50) String status,
        OffsetDateTime dueDate) {}
