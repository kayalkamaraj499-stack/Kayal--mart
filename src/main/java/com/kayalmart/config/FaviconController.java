package com.kayalmart.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Serves the site favicon. Browsers always request /favicon.ico even when
 * an SVG icon is declared; redirect it to the local placeholder so no
 * 404 / "No static resource favicon.ico" errors are logged.
 */
@Controller
public class FaviconController {

    @GetMapping("/favicon.ico")
    public void favicon(HttpServletResponse response) throws IOException {
        response.sendRedirect("/images/placeholder.svg");
    }
}
