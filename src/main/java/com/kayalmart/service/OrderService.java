package com.kayalmart.service;

import com.kayalmart.dto.CheckoutRequest;
import com.kayalmart.dto.OrderDto;
import com.kayalmart.exception.BadRequestException;
import com.kayalmart.exception.ResourceNotFoundException;
import com.kayalmart.model.Cart;
import com.kayalmart.model.CartItem;
import com.kayalmart.model.Order;
import com.kayalmart.model.OrderItem;
import com.kayalmart.model.OrderStatus;
import com.kayalmart.model.Product;
import com.kayalmart.model.User;
import com.kayalmart.repository.CartRepository;
import com.kayalmart.repository.OrderRepository;
import com.kayalmart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public OrderDto checkout(User user, CheckoutRequest request) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Your cart is empty."));
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty.");
        }

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for " + product.getName()
                        + ". Available: " + product.getStock());
            }
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PLACED);
        order.setTotalAmount(total);
        order.setName(request.getName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setPaymentMethod(request.getPaymentMethod());

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(item.getProduct().getId());
            orderItem.setProductName(item.getProduct().getName());
            orderItem.setPrice(item.getProduct().getPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItems.add(orderItem);
        }
        order.setItems(orderItems);
        orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        return OrderDto.from(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> listOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(OrderDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDto getOrder(User user, Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have access to this order.");
        }
        return OrderDto.from(order);
    }

    private String generateOrderNumber() {
        String number;
        do {
            number = "KM" + System.currentTimeMillis();
        } while (orderRepository.existsByOrderNumber(number));
        return number;
    }
}
