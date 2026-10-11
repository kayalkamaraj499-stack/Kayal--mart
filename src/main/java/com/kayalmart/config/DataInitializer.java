package com.kayalmart.config;

import com.kayalmart.model.Category;
import com.kayalmart.model.Product;
import com.kayalmart.model.Role;
import com.kayalmart.model.User;
import com.kayalmart.repository.ProductRepository;
import com.kayalmart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public ApplicationRunner initData() {
        return args -> {
            if (productRepository.count() == 0) {
                productRepository.saveAll(products());
            }
            createUserIfMissing("admin@kayalmart.com", "Admin", "Admin@123", "+1 98765 43210",
                    "12 Admin Avenue, New York, NY 10001", Role.ADMIN);
            createUserIfMissing("demo@kayalmart.com", "Demo Customer", "Demo@123", "+1 55512 34567",
                    "45 Demo Street, Brooklyn, NY 11201", Role.CUSTOMER);
        };
    }

    private void createUserIfMissing(String email, String name, String password, String phone,
                                     String address, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setPhone(phone);
            user.setAddress(address);
            user.setRole(role);
            userRepository.save(user);
        }
    }

    private java.util.List<Product> products() {
        return java.util.List.of(
                product("Vitamin C Brightening Serum", "GlowLab", Category.SKINCARE,
                        "A potent antioxidant serum that brightens dull skin, evens skin tone and boosts radiance with 15% pure vitamin C.",
                        bd("24.99"), bd("32.99"), 85, 4.7, 342, "KM-SK-001"),
                product("Hyaluronic Acid Hydrating Cream", "LuxeDerm", Category.SKINCARE,
                        "Deeply hydrating daily cream with triple-weight hyaluronic acid that plumps skin and locks in moisture for 72 hours.",
                        bd("18.50"), null, 120, 4.5, 218, "KM-SK-002"),
                product("Rose Water Refreshing Toner", "HerbNest", Category.SKINCARE,
                        "Pure damask rose water toner that balances pH, tightens pores and preps skin for better serum absorption.",
                        bd("12.99"), bd("16.00"), 200, 4.6, 156, "KM-SK-003"),
                product("SPF 50 Sunscreen Gel", "GlowLab", Category.SKINCARE,
                        "Lightweight non-greasy gel sunscreen with broad spectrum SPF 50 protection. No white cast, suitable for all skin types.",
                        bd("16.99"), null, 150, 4.8, 429, "KM-SK-004"),
                product("Retinol Night Repair Cream", "LuxeDerm", Category.SKINCARE,
                        "Advanced night cream with encapsulated retinol and peptides to reduce fine lines, wrinkles and dark spots overnight.",
                        bd("29.99"), bd("39.99"), 60, 4.4, 187, "KM-SK-005"),
                product("Green Tea Clay Mask", "HerbNest", Category.SKINCARE,
                        "Purifying green tea and French clay mask that draws out impurities, controls oil and refreshes tired skin.",
                        bd("14.50"), null, 95, 4.3, 98, "KM-SK-006"),
                product("Gentle Foaming Cleanser", "Petal & Co", Category.SKINCARE,
                        "pH-balanced amino acid cleanser that removes dirt and makeup gently without stripping natural oils.",
                        bd("13.99"), bd("17.99"), 180, 4.6, 264, "KM-SK-007"),
                product("Under Eye Brightening Cream", "LuxeDerm", Category.SKINCARE,
                        "Caffeinated eye cream that reduces dark circles, puffiness and fine lines for a fresh, awake look.",
                        bd("15.99"), null, 110, 4.2, 141, "KM-SK-008"),
                product("Matte Liquid Lipstick Set", "Velvette", Category.MAKEUP,
                        "Set of 6 rich matte liquid lipsticks in everyday shades. Long-lasting, smudge-proof and comfortable to wear.",
                        bd("22.99"), bd("29.99"), 75, 4.7, 312, "KM-MK-001"),
                product("HD Flawless Foundation", "Velvette", Category.MAKEUP,
                        "Full-coverage HD foundation with a natural finish. Buildable, long-wearing and available in 12 shades.",
                        bd("27.50"), null, 90, 4.6, 205, "KM-MK-002"),
                product("Eyeshadow Palette - 12 Shades", "Petal & Co", Category.MAKEUP,
                        "12 highly pigmented eyeshadows in matte, shimmer and metallic finishes. Blendable and long-lasting.",
                        bd("34.99"), bd("44.99"), 55, 4.8, 178, "KM-MK-003"),
                product("Volumizing Mascara", "Velvette", Category.MAKEUP,
                        "Fiber-rich volumizing mascara that lifts, curls and defines every lash from root to tip.",
                        bd("11.99"), null, 140, 4.4, 289, "KM-MK-004"),
                product("Blush & Highlight Compact", "Petal & Co", Category.MAKEUP,
                        "Dual compact with a radiant blush and luminous highlighter for a natural, healthy glow.",
                        bd("19.99"), bd("24.99"), 80, 4.5, 132, "KM-MK-005"),
                product("Professional Brush Kit - 12 pc", "ProBrush", Category.MAKEUP,
                        "12-piece professional makeup brush set with ultra-soft synthetic bristles for flawless application.",
                        bd("24.00"), bd("32.00"), 65, 4.6, 167, "KM-MK-006"),
                product("Argan Oil Hair Serum", "Aroma Bliss", Category.HAIRCARE,
                        "Luxury argan oil serum that tames frizz, adds shine and protects hair from heat damage.",
                        bd("21.99"), bd("27.99"), 100, 4.7, 254, "KM-HC-001"),
                product("Keratin Repair Shampoo", "HerbNest", Category.HAIRCARE,
                        "Sulfate-free keratin shampoo that repairs damage, strengthens strands and restores smoothness.",
                        bd("14.99"), null, 160, 4.5, 198, "KM-HC-002"),
                product("Deep Conditioning Hair Mask", "Aroma Bliss", Category.HAIRCARE,
                        "Intensive weekly hair mask with shea butter and vitamins for deep hydration and repair.",
                        bd("17.50"), bd("22.00"), 85, 4.6, 143, "KM-HC-003"),
                product("Onion Hair Growth Oil", "HerbNest", Category.HAIRCARE,
                        "Cold-pressed onion oil blend that strengthens roots, reduces hair fall and promotes growth.",
                        bd("19.99"), null, 130, 4.3, 221, "KM-HC-004"),
                product("UV Protect Hair Spray", "Petal & Co", Category.HAIRCARE,
                        "Weightless UV-protectant spray that shields color-treated hair from sun and pollution damage.",
                        bd("13.49"), bd("16.99"), 115, 4.4, 96, "KM-HC-005"),
                product("Rose Oud Eau de Parfum", "Aroma Bliss", Category.COSMETICS,
                        "Elegant blend of Bulgarian rose and rare oud with warm amber undertones. Long-lasting 8-hour fragrance.",
                        bd("49.99"), bd("64.99"), 40, 4.9, 377, "KM-CS-001"),
                product("Blooming Blossom Body Mist", "Petal & Co", Category.COSMETICS,
                        "Light hydrating body mist with cherry blossom and white tea for a fresh, floral scent all day.",
                        bd("12.99"), null, 170, 4.3, 154, "KM-CS-002"),
                product("Silk Beauty Sponge", "Velvette", Category.COSMETICS,
                        "Ultra-soft latex-free beauty sponge for seamless foundation and concealer application.",
                        bd("8.99"), bd("11.99"), 250, 4.5, 296, "KM-CS-003")
        );
    }

    private Product product(String name, String brand, Category category, String description,
                            BigDecimal price, BigDecimal originalPrice, int stock,
                            double rating, int reviewCount, String sku) {
        Product p = new Product();
        p.setName(name);
        p.setBrand(brand);
        p.setCategory(category);
        p.setDescription(description);
        p.setPrice(price);
        p.setOriginalPrice(originalPrice);
        p.setStock(stock);
        p.setImageUrl("/images/products/" + sku.toLowerCase() + ".svg");
        p.setRating(rating);
        p.setReviewCount(reviewCount);
        p.setSku(sku);
        p.setActive(true);
        return p;
    }

    private static BigDecimal bd(String value) {
        return new BigDecimal(value);
    }
}
