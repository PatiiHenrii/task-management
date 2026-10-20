package com.patt.task_management.repository;

import com.patt.task_management.model.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByUser_EmailOrderByCreatedAtDesc(String email);
    Optional<Task> findByIdAndUser_Email(Long id, String email);
}
