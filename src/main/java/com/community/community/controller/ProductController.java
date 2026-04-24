package com.community.community.controller;

import com.community.community.model.Product;
import com.community.community.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/startup/{startupId}")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Product> createProductWithStartup(@PathVariable Long startupId, @RequestBody Product product) {
        Product createdProduct = productService.createProductForStartup(startupId, product);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/startup/{startupId}")
    public ResponseEntity<List<Product>> getProductsByStartupId(@PathVariable Long startupId) {
        List<Product> products = productService.getProductsByStartupId(startupId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        List<Product> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Product>> getAvailableProducts() {
        List<Product> products = productService.getAvailableProducts();
        return ResponseEntity.ok(products);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {
        Product updatedProduct = productService.updateProduct(id, product);
        return ResponseEntity.ok(updatedProduct);
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Product> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> stockUpdate) {
        Integer quantity = stockUpdate.get("quantity");
        Product updatedProduct = productService.updateStock(id, quantity);
        return ResponseEntity.ok(updatedProduct);
    }

    @PatchMapping("/{id}/toggle-availability")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Product> toggleAvailability(@PathVariable Long id) {
        Product updatedProduct = productService.toggleAvailability(id);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
