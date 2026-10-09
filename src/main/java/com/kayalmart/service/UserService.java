package com.kayalmart.service;

import com.kayalmart.dto.ChangePasswordRequest;
import com.kayalmart.dto.UpdateProfileRequest;
import com.kayalmart.dto.UserDto;
import com.kayalmart.exception.BadRequestException;
import com.kayalmart.exception.ResourceNotFoundException;
import com.kayalmart.model.User;
import com.kayalmart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserDto getProfile(User user) {
        User found = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserDto.from(found);
    }

    @Transactional
    public UserDto updateProfile(User current, UpdateProfileRequest request) {
        User user = userRepository.findById(current.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        userRepository.save(user);
        return UserDto.from(user);
    }

    @Transactional
    public void changePassword(User current, ChangePasswordRequest request) {
        User user = userRepository.findById(current.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect.");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
