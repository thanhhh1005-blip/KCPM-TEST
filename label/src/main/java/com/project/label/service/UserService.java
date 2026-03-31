package com.project.label.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.label.dto.request.UserCreationRequest;
import com.project.label.dto.request.UserUpdateRequest;
import com.project.label.entity.User;
import com.project.label.repository.IUserRepository;

@Service
public class UserService {
  @Autowired
  IUserRepository userRepository;

  public User createUser(UserCreationRequest request) {
    User user = new User();
    user.setUsername(request.getUsername());
    user.setPassword(request.getPassword());
    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setEmail(request.getEmail());
    user.setDateOfBirth(request.getDateOfBirth());

    return userRepository.save(user);
  }

  public User updateUser(String userId, UserUpdateRequest request){
    User user = getUserById(userId);
    if(user == null){
      return null;
    }
    user.setPassword(request.getPassword());
    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());  
    user.setEmail(request.getEmail());
    user.setDateOfBirth(request.getDateOfBirth());

    return userRepository.save(user);
  }

  public List<User> getUsers() {
    return userRepository.findAll();
  }

  public User getUserById(String userId) {
    return userRepository.findById(userId).orElse(null);
  }

  public void deleteUser(String userId){
    userRepository.deleteById(userId);
  }
}
