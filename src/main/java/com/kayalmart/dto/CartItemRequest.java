package com.kayalmart.dto;

import com.kayalmart.model.CartItem;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    /** Quantity to set. Use 0 to remove the item from the cart. */
    @Min(value = 0, message = "Quantity must be 0 or greater")
    private Integer quantity;
}
