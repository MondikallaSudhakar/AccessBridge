package com.community.community.service;

import com.community.community.model.NGOProduct;
import com.community.community.repository.NGOProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NGOProductService {

    private final NGOProductRepository ngoProductRepository;

    @Transactional(readOnly = true)
    public NGOProduct getProductById(Long id) {
        return ngoProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NGO Product not found with id: " + id));
    }

    public NGOProduct reduceStock(Long productId, Integer quantity) {
        NGOProduct product = getProductById(productId);
        Integer currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        
        if (currentStock < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }
        
        product.setStockQuantity(currentStock - quantity);
        
        if (product.getStockQuantity() <= 0) {
            product.setStockQuantity(0);
            product.setAvailable(false);
        }
        
        return ngoProductRepository.save(product);
    }

    public NGOProduct increaseStock(Long productId, Integer quantity) {
        NGOProduct product = getProductById(productId);
        Integer currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        
        product.setStockQuantity(currentStock + quantity);
        
        if (product.getStockQuantity() > 0) {
            product.setAvailable(true);
        }
        
        return ngoProductRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<NGOProduct> getAllAvailableProducts() {
        return ngoProductRepository.findByAvailableTrue();
    }
}
