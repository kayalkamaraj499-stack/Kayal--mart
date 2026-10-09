package com.kayalmart.repository;

import com.kayalmart.model.Order;
import com.kayalmart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    boolean existsByOrderNumber(String orderNumber);
}
