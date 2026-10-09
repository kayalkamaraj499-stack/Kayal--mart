package com.kayalmart.dto;

import com.kayalmart.model.Cart;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private List<CartItemDto> items;
    private int totalItems;
    private BigDecimal subtotal;

    public static CartDto from(Cart cart) {
        if (cart == null || cart.getItems() == null) {
            return new CartDto(List.of(), 0, BigDecimal.ZERO);
        }
        var items = cart.getItems().stream().map(CartItemDto::from).toList();
        int totalItems = items.stream().mapToInt(CartItemDto::getQuantity).sum();
        BigDecimal subtotal = items.stream()
                .map(CartItemDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartDto(items, totalItems, subtotal);
    }
}
