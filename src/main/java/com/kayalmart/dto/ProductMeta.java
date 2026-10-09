package com.kayalmart.dto;

import com.kayalmart.model.Category;

import java.util.List;

public record ProductMeta(List<Category> categories, List<String> brands) {
}
