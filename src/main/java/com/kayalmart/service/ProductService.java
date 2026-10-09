package com.kayalmart.service;

import com.kayalmart.dto.ProductMeta;
import com.kayalmart.exception.ResourceNotFoundException;
import com.kayalmart.model.Category;
import com.kayalmart.model.Product;
import com.kayalmart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Page<Product> search(String search, Category category, String brand,
                                 BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.search(search, category, brand, minPrice, maxPrice, pageable);
    }

    @Transactional(readOnly = true)
    public Sort resolveSort(String sort) {
        if (sort == null) sort = "newest";
        return switch (sort) {
            case "priceAsc" -> Sort.by("price").ascending();
            case "priceDesc" -> Sort.by("price").descending();
            case "rating" -> Sort.by("rating").descending();
            case "name" -> Sort.by("name").ascending();
            default -> Sort.by("createdAt").descending();
        };
    }

    @Transactional(readOnly = true)
    public Product getById(Long id) {
        return productRepository.findById(id)
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public ProductMeta meta() {
        return new ProductMeta(Arrays.asList(Category.values()), productRepository.findBrands());
    }

    @Transactional(readOnly = true)
    public List<Product> featured() {
        return productRepository.findByActiveTrueOrderByRatingDesc(PageRequest.of(0, 8));
    }

    @Transactional(readOnly = true)
    public List<Product> newArrivals() {
        return productRepository.findByActiveTrueOrderByCreatedAtDesc(PageRequest.of(0, 8));
    }

    @Transactional(readOnly = true)
    public List<Product> relatedProducts(Category category, Long excludeId, int size) {
        List<Product> all = productRepository.findByCategoryAndActiveTrueOrderByRatingDesc(
                category, PageRequest.of(0, size + 1));
        return all.stream()
                .filter(p -> !p.getId().equals(excludeId))
                .limit(size)
                .toList();
    }
}
