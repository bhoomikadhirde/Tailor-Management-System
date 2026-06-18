package com.tailor.system.controller;

import com.tailor.system.model.Customer;
import com.tailor.system.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TAILOR')")
    public List<Customer> getAllClients() {
        return customerRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TAILOR')")
    public ResponseEntity<Customer> createClient(@RequestBody Customer customer) {
        if (customer.getId() == null || customer.getId().isEmpty()) {
            customer.setId("client_" + UUID.randomUUID().toString().replace("-", ""));
        }
        Customer saved = customerRepository.save(customer);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TAILOR')")
    public ResponseEntity<Customer> updateClient(@PathVariable String id, @RequestBody Customer customerDetails) {
        Optional<Customer> optionalCustomer = customerRepository.findById(id);
        if (!optionalCustomer.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Customer existing = optionalCustomer.get();
        existing.setName(customerDetails.getName());
        existing.setPhone(customerDetails.getPhone());
        existing.setEmail(customerDetails.getEmail());
        existing.setAddress(customerDetails.getAddress());
        existing.setGender(customerDetails.getGender());
        existing.setNotes(customerDetails.getNotes());

        Customer updatedObj = customerRepository.save(existing);
        return ResponseEntity.ok(updatedObj);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClient(@PathVariable String id) {
        Optional<Customer> existing = customerRepository.findById(id);
        if (!existing.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        customerRepository.delete(existing.get());
        return ResponseEntity.noContent().build();
    }
}
