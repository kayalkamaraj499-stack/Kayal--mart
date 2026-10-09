package com.kayalmart.controller;

import com.kayalmart.dto.CheckoutRequest;
import com.kayalmart.dto.OrderDto;
import com.kayalmart.model.User;
import com.kayalmart.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderDto> checkout(@AuthenticationPrincipal User user,
                                             @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.checkout(user, request));
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> listOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.listOrders(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrder(@AuthenticationPrincipal User user,
                                             @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(user, id));
    }
}
