package com.project.label.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.xml.crypto.Data;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.project.label.dto.response.ApiResponse;
import com.project.label.dto.response.DataItemResponse;
import com.project.label.entity.DataItem;
import com.project.label.entity.Project;
import com.project.label.enums.DataItemStatus;
import com.project.label.repository.IDataItemRepository;
import com.project.label.repository.IProjectRepository;
import com.project.label.service.CloudinaryService;
import com.project.label.service.DatasetService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequiredArgsConstructor
@RequestMapping("/datasets")
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class DatasetController {
  IDataItemRepository dataItemRepository;
  DatasetService datasetService;

  @PostMapping("/upload")
  public ApiResponse<List<String>> uploadDataset(
          @RequestParam("files") List<MultipartFile> files,
          @RequestParam("projectId") String projectId
  ) {
      // Lễ tân chỉ việc gọi đầu bếp (Service) và bê món ăn ra (Response)
      return ApiResponse.<List<String>>builder()
              .result(datasetService.uploadAndSaveDataset(files, projectId))
              .build();
  }

  @GetMapping("/project/{projectId}")
  public ApiResponse<List<DataItemResponse>> getDatasetByProject(@PathVariable String projectId) {
      // Lễ tân nhận projectId, gọi đầu bếp (Service) nấu và trả kết quả ra
      return ApiResponse.<List<DataItemResponse>>builder()
              .result(datasetService.getDatasetByProject(projectId))
              .build();
  }

}
