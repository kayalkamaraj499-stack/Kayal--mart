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
import java.math.RoundingMode;
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

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for " + product.getName()
                        + ". Available: " + product.getStock());
            }
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        /* Apply the same charges shown on the checkout page:
           free shipping on orders over $50 (otherwise $5.99) + 8% tax. */
        BigDecimal shipping = subtotal.compareTo(new BigDecimal("50")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("5.99");
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.08"))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(shipping).add(tax);

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
