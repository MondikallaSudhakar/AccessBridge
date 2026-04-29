package com.community.community.service;

import com.community.community.model.Product;
import com.community.community.model.NGOProduct;
import com.community.community.repository.ProductRepository;
import com.community.community.repository.StartupRepository;
import com.community.community.repository.NGOProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final StartupRepository startupRepository;
    private final NGOProductRepository ngoProductRepository;

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product createProductForStartup(Long startupId, Product product) {
        com.community.community.model.Startup startup = startupRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found with id: " + startupId));
        product.setStartup(startup);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setCategory(productDetails.getCategory());
        product.setImageUrl(productDetails.getImageUrl());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setAvailable(productDetails.getAvailable());
        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByStartupId(Long startupId) {
        return productRepository.findByStartupId(startupId);
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public List<Product> getAvailableProducts() {
        return productRepository.findByAvailableTrue();
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    public Product updateStock(Long id, Integer quantity) {
        Product product = getProductById(id);
        product.setStockQuantity(quantity);
        
        if (quantity > 0) {
            product.setAvailable(true);
        } else {
            product.setAvailable(false);
        }
        
        return productRepository.save(product);
    }

    public Product toggleAvailability(Long id) {
        Product product = getProductById(id);
        product.setAvailable(!product.getAvailable());
        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllAvailableProductsIncludingNGO() {
        List<Map<String, Object>> allProducts = new ArrayList<>();
        
        // Get available startup products
        List<Product> startupProducts = productRepository.findByAvailableTrue();
        for (Product product : startupProducts) {
            Map<String, Object> productMap = new HashMap<>();
            productMap.put("id", product.getId());
            productMap.put("name", product.getName());
            productMap.put("description", product.getDescription());
            productMap.put("category", product.getCategory());
            productMap.put("price", product.getPrice());
            productMap.put("stockQuantity", product.getStockQuantity());
            productMap.put("available", product.getAvailable());
            productMap.put("imageUrl", product.getImageUrl());
            productMap.put("source", "STARTUP");
            if (product.getStartup() != null) {
                Map<String, Object> startup = new HashMap<>();
                startup.put("id", product.getStartup().getId());
                startup.put("name", product.getStartup().getName());
                productMap.put("sourceDetails", startup);
            }
            allProducts.add(productMap);
        }
        
        // Get available NGO products
        List<NGOProduct> ngoProducts = ngoProductRepository.findByAvailableTrue();
        for (NGOProduct product : ngoProducts) {
            Map<String, Object> productMap = new HashMap<>();
            productMap.put("id", product.getId());
            productMap.put("name", product.getName());
            productMap.put("description", product.getDescription());
            productMap.put("category", product.getCategory());
            productMap.put("price", product.getPrice());
            productMap.put("stockQuantity", product.getStockQuantity());
            productMap.put("available", product.getAvailable());
            productMap.put("imageUrl", product.getImageUrl());
            productMap.put("source", "NGO");
            if (product.getNgo() != null) {
                Map<String, Object> ngo = new HashMap<>();
                ngo.put("id", product.getNgo().getId());
                ngo.put("name", product.getNgo().getName());
                productMap.put("sourceDetails", ngo);
            }
            allProducts.add(productMap);
        }
        
        return allProducts;
    }
}
