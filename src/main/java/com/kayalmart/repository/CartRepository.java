package com.kayalmart.repository;

import com.kayalmart.model.Cart;
import com.kayalmart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
