package com.project.label.entity;

import com.project.label.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "data_item_id", nullable = false)
    private String dataItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annotator_id")
    private User annotator; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;  

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status;

    @Column(name = "annotation_data", columnDefinition = "TEXT")
    private String annotationData;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; 

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt; 
}