package com.tailor.system.controller;

import com.tailor.system.model.Order;
import com.tailor.system.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TAILOR', 'CUSTOMER')")
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TAILOR')")
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        order.setId("order_" + UUID.randomUUID().toString().replace("-", ""));
        order.setOrderNumber("ORD-2026-" + (1000 + orderRepository.count() + 1));
        order.setStatus("PENDING");
        order.updatePaymentStatus();
        
        Order saved = orderRepository.save(order);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TAILOR')")
    public ResponseEntity<Order> updateOrder(@PathVariable String id, @RequestBody Order orderDetails) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (!optionalOrder.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Order existing = optionalOrder.get();
        existing.setClothingType(orderDetails.getClothingType());
        existing.setFabricDetails(orderDetails.getFabricDetails());
        existing.setStatus(orderDetails.getStatus());
        existing.setDueDate(orderDetails.getDueDate());
        existing.setPrice(orderDetails.getPrice());
        existing.setDiscount(orderDetails.getDiscount());
        existing.setTax(orderDetails.getTax());
        existing.setAmountPaid(orderDetails.getAmountPaid());
        existing.setNotes(orderDetails.getNotes());
        existing.updatePaymentStatus();

        Order updated = orderRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        Optional<Order> existing = orderRepository.findById(id);
        if (!existing.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        orderRepository.delete(existing.get());
        return ResponseEntity.noContent().build();
    }
}
