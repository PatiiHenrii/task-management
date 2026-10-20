package com.patt.task_management.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.OffsetDateTime;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "due_date")
    private OffsetDateTime dueDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    protected Task() {}

    public Task(String title, String description, String status, OffsetDateTime dueDate, AppUser user) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.user = user;
        this.createdAt = Instant.now();
    }

    public void update(String title, String description, String status, OffsetDateTime dueDate) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public OffsetDateTime getDueDate() { return dueDate; }
    public Instant getCreatedAt() { return createdAt; }
}
