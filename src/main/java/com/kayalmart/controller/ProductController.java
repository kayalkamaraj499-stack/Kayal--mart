package com.kayalmart.controller;

import com.kayalmart.dto.ProductMeta;
import com.kayalmart.model.Category;
import com.kayalmart.model.Product;
import com.kayalmart.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Page<Product> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "newest") String sort) {
        Sort sortObj = productService.resolveSort(sort);
        return productService.search(search, category, brand, minPrice, maxPrice,
                PageRequest.of(page, size, sortObj));
    }

    @GetMapping("/meta")
    public ProductMeta meta() {
        return productService.meta();
    }

    @GetMapping("/featured")
    public List<Product> featured() {
        return productService.featured();
    }

    @GetMapping("/new-arrivals")
    public List<Product> newArrivals() {
        return productService.newArrivals();
    }

    @GetMapping("/related")
    public List<Product> related(@RequestParam Category category,
                                 @RequestParam Long excludeId,
                                 @RequestParam(defaultValue = "4") int size) {
        return productService.relatedProducts(category, excludeId, size);
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return productService.getById(id);
    }
}
