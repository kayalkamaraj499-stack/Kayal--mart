# KAYAL MART 💄

A complete, working full-stack e-commerce website for **cosmetics, skincare, makeup and haircare** products — with a beautiful pink & white responsive design.

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, JavaScript, Bootstrap 5, Bootstrap Icons |
| Backend | Java 17, Spring Boot 3.2.5, Maven |
| Database | Embedded H2 (no installation needed — starts with the app) |
| Security | BCrypt password hashing + JWT (HS256) stateless auth |
| Build | Maven Wrapper (`mvnw.cmd`) — Maven downloads automatically |

**Runs on: http://localhost:8081**

---

## 🚀 Quick Start (Windows + VS Code) — 5 minutes

### Step 0 — Check Java 17

Open PowerShell or Command Prompt and run:

```cmd
java -version
```

You need **Java 17 or newer**. If you see `17.x.x` (or 21, 24…), skip to Step 1.
If you see `1.8`, `11`, or `"java" is not recognized`, install Java 17:

1. Go to **https://adoptium.net/temurin/releases/?version=17**
2. Download **JDK 17 (LTS) for Windows x64 — `.msi` installer**
3. Run the installer (keep default settings)
4. **Restart VS Code** (important — so it picks up the new `JAVA_HOME`)
5. Check again: `java -version` → should show `17.x.x`

> If you use VS Code with the *Java Extension Pack*, it will also offer to install a JDK for you.

### Step 1 — Download & extract the project

Download `kayal-mart.zip` and extract it anywhere (e.g. `C:\Users\You\kayal-mart`).

### Step 2 — Open in VS Code

```cmd
cd C:\Users\You\kayal-mart
code .
```

### Step 3 — Build & run (uses the Maven Wrapper — no global Maven needed)

In the VS Code **Terminal** (`` Ctrl+` ``):

```cmd
.\mvnw.cmd spring-boot:run
```

- On first run, `mvnw.cmd` **automatically downloads Maven** and all dependencies (one-time, ~1–2 min).
- Wait for the log line: `Started KayalMartApplication in X seconds`

### Step 4 — Open the website

👉 **http://localhost:8081**

To stop the server: `Ctrl + C` in the terminal.

### Other useful commands

```cmd
.\mvnw.cmd clean package        :: builds a jar in target/
java -jar target\kayal-mart-1.0.0.jar   :: run the built jar
.\mvnw.cmd test                 :: run tests
```

---

## 🔑 Demo accounts (auto-created on startup)

| Role    | Email              | Password  |
|---------|--------------------|-----------|
| Admin   | admin@kayalmart.com | Admin@123 |
| Customer| demo@kayalmart.com  | Demo@123  |

The catalog is also auto-seeded with **22 beauty products** across all 4 categories.
Because the database is an **embedded H2 in-memory store**, the demo data is recreated
every time the app starts (a fresh, clean demo every run).

Optional: browse the H2 console at **http://localhost:8081/h2-console**
(JDBC URL: `jdbc:h2:mem:kayalmart`, user: `sa`, password: empty).

---

## 📁 Project Structure

```
kayal-mart/
├── mvnw.cmd                        # Maven Wrapper (Windows)
├── mvnw                            # Maven Wrapper (Linux/macOS)
├── .mvn/wrapper/
│   ├── maven-wrapper.properties    # Maven version + download URL
│   └── maven-wrapper.jar           # Wrapper bootstrap jar
├── pom.xml                         # Maven build (Spring Boot 3.2.5, Java 17)
├── README.md
└── src/main/
    ├── java/com/kayalmart/
    │   ├── KayalMartApplication.java          # Spring Boot entry point
    │   ├── config/DataInitializer.java        # Seeds 22 products + demo users
    │   ├── controller/                        # REST API controllers
    │   │   ├── AuthController.java            #   /api/auth/**
    │   │   ├── ProductController.java         #   /api/products/** (public)
    │   │   ├── CartController.java            #   /api/cart/** (JWT)
    │   │   └── OrderController.java           #   /api/orders/** (JWT)
    │   ├── dto/                               # 14 request/response DTOs
    │   ├── exception/                         # Custom exceptions + GlobalExceptionHandler
    │   ├── model/                             # 6 JPA entities + 3 enums
    │   ├── repository/                        # 4 Spring Data JPA repositories
    │   ├── security/
    │   │   ├── JwtUtil.java                   # JWT generation/validation
    │   │   ├── JwtAuthenticationFilter.java   # Bearer token filter
    │   │   ├── CustomUserDetailsService.java  # Loads user by email
    │   │   └── SecurityConfig.java            # Stateless security chain
    │   └── service/                           # Auth, User, Product, Cart, Order services
    └── resources/
        ├── application.properties             # port 8081 + H2 config
        └── static/                            # Frontend (served by Spring Boot)
            ├── index.html                     # Home
            ├── login.html                     # Login
            ├── register.html                  # Registration
            ├── products.html                  # Products (search/filter/sort/pagination)
            ├── product.html                   # Product details
            ├── cart.html                      # Shopping cart
            ├── checkout.html                  # Checkout + order success
            ├── account.html                   # My Account + order history
            ├── css/style.css
            ├── js/                            # api, auth, main, products, product, cart, checkout, account
            └── images/placeholder.svg
```

---

## 🌐 Pages

| Page | URL | Access |
|------|-----|--------|
| Home | `/index.html` | Public |
| Login | `/login.html` | Public |
| Register | `/register.html` | Public |
| Products (search / filter / sort / pagination) | `/products.html` | Public |
| Product Details | `/product.html?id=1` | Public |
| Cart | `/cart.html` | Login required (auto-redirect) |
| Checkout | `/checkout.html` | Login required |
| My Account + Order History | `/account.html` | Login required |

---

## 🔌 REST API

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (BCrypt hashed) → returns JWT + user |
| POST | `/api/auth/login` | Login → returns JWT + user |
| GET | `/api/auth/me` | Current user profile (JWT required) |
| PUT | `/api/auth/me` | Update profile (JWT required) |
| PUT | `/api/auth/password` | Change password (JWT required) |

### Products (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Search, filter, sort, paginate |
| GET | `/api/products/meta` | Categories + brands for filters |
| GET | `/api/products/featured` | Top rated products |
| GET | `/api/products/new-arrivals` | Newest products |
| GET | `/api/products/related?category=..&excludeId=..` | Related products |
| GET | `/api/products/{id}` | Product details |

**Query params for `/api/products`:** `page`, `size`, `search`, `category` (SKINCARE/MAKEUP/HAIRCARE/COSMETICS), `brand`, `minPrice`, `maxPrice`, `sort` (newest/priceAsc/priceDesc/rating/name)

### Cart (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add item `{productId, quantity}` |
| PUT | `/api/cart/items/{productId}` | Update quantity (0 removes) |
| DELETE | `/api/cart/items/{productId}` | Remove item |
| DELETE | `/api/cart` | Clear cart |

### Orders (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/checkout` | Place order (validates stock, decrements, clears cart) |
| GET | `/api/orders` | Order history (newest first) |
| GET | `/api/orders/{id}` | Order details |

**Example:**

```bash
# Login
curl -X POST http://localhost:8081/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"demo@kayalmart.com\",\"password\":\"Demo@123\",\"terms\":true}"

# Search products
curl "http://localhost:8081/api/products?search=serum&category=SKINCARE&sort=priceAsc&page=0&size=12"

# Add to cart (use token from login)
curl -X POST http://localhost:8081/api/cart/items ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <JWT_TOKEN>" ^
  -d "{\"productId\":1,\"quantity\":2}"

# Checkout
curl -X POST http://localhost:8081/api/orders/checkout ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <JWT_TOKEN>" ^
  -d "{\"name\":\"Jane Doe\",\"phone\":\"+1 555 000 0000\",\"address\":\"123 Main St, NY\",\"paymentMethod\":\"COD\"}"
```

---

## 🔒 Security Details

- **BCrypt** password encoding via `BCryptPasswordEncoder`
- **JWT (HS256)** — stateless; token stored in `localStorage`, sent as `Authorization: Bearer <token>`
- Passwords never exposed in API responses (User → UserDto mapping)
- Stock validation on add-to-cart and at checkout (prevents overselling)
- All cart/order endpoints are authenticated; orders are scoped to the logged-in user
- Validation/business errors return consistent JSON `{timestamp, status, error, message, path}`

> ⚠️ Change `app.jwt.secret` in `application.properties` before production use.

---

## 🧪 Troubleshooting

| Issue | Solution |
|-------|----------|
| `"mvnw.cmd" is not recognized` | Run it from the project root folder (where `pom.xml` is), in PowerShell or CMD: `.\mvnw.cmd spring-boot:run` |
| `java is not recognized` | Install JDK 17 (see Step 0 above) and **restart VS Code** |
| `Unsupported class file major version` | You are using Java 8/11 — install Java 17+ |
| Port 8081 busy | Change `server.port` in `src/main/resources/application.properties` |
| First run is slow | Normal — the wrapper downloads Maven + all dependencies once |
| Product images don't load | Requires internet (Unsplash); they auto-fallback to picsum.photos, then to a local SVG placeholder |
| Script execution blocked | In PowerShell run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
