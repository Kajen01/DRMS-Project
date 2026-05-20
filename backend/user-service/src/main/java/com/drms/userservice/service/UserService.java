package com.drms.userservice.service;

import com.drms.userservice.dto.CreateUserRequest;
import com.drms.userservice.dto.UpdateUserStatusRequest;
import com.drms.userservice.dto.UserResponse;
import com.drms.userservice.entity.Role;
import com.drms.userservice.entity.User;
import com.drms.userservice.exception.ConflictException;
import com.drms.userservice.exception.NotFoundException;
import com.drms.userservice.mapper.UserMapper;
import com.drms.userservice.repository.UserRepository;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse getById(Long id) {
        return userMapper.toResponse(findUser(id));
    }

    public UserResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    public List<UserResponse> getAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username is already registered");
        }

        User user = userRepository.save(User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .username(request.username())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .status(request.status())
                .build());
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateStatus(Long id, UpdateUserStatusRequest request) {
        User user = findUser(id);
        user.setStatus(request.status());
        return userMapper.toResponse(user);
    }

    public boolean existsByIdAndRole(Long id, String role) {
        if (role == null || role.isBlank()) {
            return userRepository.existsById(id);
        }
        return userRepository.existsByIdAndRole(id, Role.valueOf(role));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
