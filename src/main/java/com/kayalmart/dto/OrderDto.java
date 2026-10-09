package com.kayalmart.dto;

import com.kayalmart.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private String status;
    private BigDecimal totalAmount;
    private int totalItems;
    private String name;
    private String phone;
    private String address;
    private String paymentMethod;
    private List<OrderItemDto> items;
    private LocalDateTime createdAt;

    public static OrderDto from(Order order) {
        var items = order.getItems() == null ? List.<OrderItemDto>of()
                : order.getItems().stream().map(OrderItemDto::from).toList();
        int totalItems = items.stream().mapToInt(OrderItemDto::getQuantity).sum();
        return new OrderDto(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus().name(),
                order.getTotalAmount(),
                totalItems,
                order.getName(),
                order.getPhone(),
                order.getAddress(),
                order.getPaymentMethod(),
                items,
                order.getCreatedAt()
        );
    }
}
