package com.project.label.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.project.label.dto.request.UserCreationRequest;
import com.project.label.dto.request.UserUpdateRequest;
import com.project.label.entity.User;
import com.project.label.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;





@RestController
public class UserController {
  @Autowired
  UserService userService;

  @PostMapping("/users")
  public User createUser(@RequestBody UserCreationRequest request) {
    return userService.createUser(request);
  }
  
  @GetMapping("/users")
  public List<User> getUsers() {
    return userService.getUsers();
  }
  
  @GetMapping("/users/{userId}")
  public User getUser(@PathVariable("userId") String userId) {
      return userService.getUserById(userId);
  }
  
  @PutMapping("/users/{id}")
  public User updateUser(@PathVariable("id") String id, @RequestBody UserUpdateRequest user) {
      return userService.updateUser(id, user);
  }

  @DeleteMapping("/users/{id}")
  public String deleteUser(@PathVariable("id") String id){
    userService.deleteUser(id);
    return "User deleted successfully";
  }
}
