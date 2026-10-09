package com.kayalmart.dto;

import com.kayalmart.model.CartItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private Long productId;
    private String name;
    private String brand;
    private String category;
    private String imageUrl;
    private BigDecimal price;
    private Integer stock;
    private Integer quantity;
    private BigDecimal subtotal;

    public static CartItemDto from(CartItem item) {
        var p = item.getProduct();
        return new CartItemDto(
                p.getId(),
                p.getName(),
                p.getBrand(),
                p.getCategory().name(),
                p.getImageUrl(),
                p.getPrice(),
                p.getStock(),
                item.getQuantity(),
                p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
        );
    }
}
