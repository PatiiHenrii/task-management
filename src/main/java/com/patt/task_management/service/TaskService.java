package com.patt.task_management.service;

import com.patt.task_management.dto.TaskRequest;
import com.patt.task_management.dto.TaskResponse;
import com.patt.task_management.model.AppUser;
import com.patt.task_management.model.Task;
import com.patt.task_management.repository.TaskRepository;
import com.patt.task_management.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {
    private static final String DEFAULT_STATUS = "PENDING";

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TaskResponse createTask(String userEmail, TaskRequest request) {
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String status = request.status() == null || request.status().isBlank()
                ? DEFAULT_STATUS
                : request.status().trim();
        Task task = new Task(
                request.title().trim(), request.description(), status, request.dueDate(), user);
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasksByUser(String userEmail) {
        return taskRepository.findAllByUser_EmailOrderByCreatedAtDesc(userEmail).stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional
    public TaskResponse updateTask(String userEmail, Long taskId, TaskRequest request) {
        Task task = findOwnedTask(userEmail, taskId);
        String status = request.status() == null || request.status().isBlank()
                ? DEFAULT_STATUS
                : request.status().trim();
        task.update(request.title().trim(), request.description(), status, request.dueDate());
        return TaskResponse.from(task);
    }

    @Transactional
    public void deleteTask(String userEmail, Long taskId) {
        taskRepository.delete(findOwnedTask(userEmail, taskId));
    }

    private Task findOwnedTask(String userEmail, Long taskId) {
        return taskRepository.findByIdAndUser_Email(taskId, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }
}
