package com.patt.task_management.controller;

import com.patt.task_management.dto.TaskRequest;
import com.patt.task_management.dto.TaskResponse;
import com.patt.task_management.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(
            @AuthenticationPrincipal UserDetails currentUser,
            @Valid @RequestBody TaskRequest request) {
        return taskService.createTask(currentUser.getUsername(), request);
    }

    @GetMapping
    public List<TaskResponse> getAllTasks(@AuthenticationPrincipal UserDetails currentUser) {
        return taskService.getAllTasksByUser(currentUser.getUsername());
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(
            @AuthenticationPrincipal UserDetails currentUser,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return taskService.updateTask(currentUser.getUsername(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(
            @AuthenticationPrincipal UserDetails currentUser,
            @PathVariable Long id) {
        taskService.deleteTask(currentUser.getUsername(), id);
    }
}
