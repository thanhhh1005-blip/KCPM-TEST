package com.project.label.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.project.label.dto.response.AiSuggestionDto;
import com.project.label.dto.response.ApiResponse;
import com.project.label.dto.response.DataItemResponse;
import com.project.label.entity.DataItem;
import com.project.label.repository.IDataItemRepository;
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
  DatasetService datasetService;
  IDataItemRepository dataItemRepository;

  @PostMapping("/upload")
  public ApiResponse<List<String>> uploadDataset(
      @RequestParam("files") List<MultipartFile> files,
      @RequestParam("projectId") String projectId) {
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

  @GetMapping("/next/{projectId}")
  public ApiResponse<DataItemResponse> getNextItem(@PathVariable String projectId) {
    DataItemResponse nextItem = datasetService.getNextItemForAnnotator(projectId);
    return ApiResponse.<DataItemResponse>builder()
        .result(nextItem)
        .build();
  }

  @SuppressWarnings("unchecked")
  @GetMapping("/ai-suggest/{itemId}")
    public ApiResponse<List<AiSuggestionDto>> getAiSuggestion(@PathVariable String itemId) {
        
        // 1. Tìm cái link ảnh trong DB
        DataItem item = dataItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));

        // 2. Chuẩn bị gói hàng gửi sang Python
        String pythonUrl = "http://localhost:8000/predict";
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("url", item.getFileUrl());

        // 3. Gọi Python và hứng kết quả
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.postForObject(pythonUrl, requestBody, Map.class);

        // 4. Lấy mảng "result" ép kiểu trả về cho Frontend
        List<Map<String, Object>> resultList = (List<Map<String, Object>>) response.get("result");
        
        List<AiSuggestionDto> dtos = resultList.stream().map(map -> {
            AiSuggestionDto dto = new AiSuggestionDto();
            dto.setLabelName((String) map.get("labelName"));
            Object confObj = map.get("confidence");
            dto.setConfidence(confObj instanceof Integer ? (Integer) confObj : (Double) confObj);
            dto.setXcenter((Double) map.get("xcenter"));
            dto.setYcenter((Double) map.get("ycenter"));
            dto.setWidth((Double) map.get("width"));
            dto.setHeight((Double) map.get("height"));
            return dto;
        }).toList();

        return ApiResponse.<List<AiSuggestionDto>>builder().result(dtos).build();
    }
}
