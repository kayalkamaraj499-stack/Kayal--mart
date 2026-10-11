package com.kayalmart.service;

import com.kayalmart.dto.CartDto;
import com.kayalmart.dto.CartItemRequest;
import com.kayalmart.exception.BadRequestException;
import com.kayalmart.exception.ResourceNotFoundException;
import com.kayalmart.model.Cart;
import com.kayalmart.model.CartItem;
import com.kayalmart.model.Product;
import com.kayalmart.model.User;
import com.kayalmart.repository.CartRepository;
import com.kayalmart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    private Cart getCart(User user) {
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    @Transactional(readOnly = true)
    public CartDto getCartDto(User user) {
        return CartDto.from(getCart(user));
    }

    @Transactional
    public CartDto addItem(User user, CartItemRequest request) {
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new BadRequestException("Quantity must be at least 1");
        }
        Cart cart = getCart(user);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BadRequestException("This product is no longer available.");
        }

        CartItem existing = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            int newQty = existing.getQuantity() + request.getQuantity();
            if (newQty > product.getStock()) {
                throw new BadRequestException("Only " + product.getStock() + " unit(s) available in stock.");
            }
            existing.setQuantity(newQty);
        } else {
            if (request.getQuantity() > product.getStock()) {
                throw new BadRequestException("Only " + product.getStock() + " unit(s) available in stock.");
            }
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(request.getQuantity());
            cart.getItems().add(item);
        }

        cartRepository.save(cart);
        return CartDto.from(cart);
    }

    @Transactional
    public CartDto updateQuantity(User user, Long productId, CartItemRequest request) {
        Cart cart = getCart(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        int quantity = request.getQuantity();
        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            if (quantity > product.getStock()) {
                throw new BadRequestException("Only " + product.getStock() + " unit(s) available in stock.");
            }
            item.setQuantity(quantity);
        }

        cartRepository.save(cart);
        return CartDto.from(cart);
    }

    @Transactional
    public CartDto removeItem(User user, Long productId) {
        Cart cart = getCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));
        cart.getItems().remove(item);
        cartRepository.save(cart);
        return CartDto.from(cart);
    }

    @Transactional
    public CartDto clearCart(User user) {
        Cart cart = getCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
        return CartDto.from(cart);
    }
}
