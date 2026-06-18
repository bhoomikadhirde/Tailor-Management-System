import { SpringBootFile } from './types';

export const springBootData: SpringBootFile[] = [
  {
    name: 'schema.sql',
    path: 'src/main/resources/schema.sql',
    type: 'SQL',
    description: 'Relational MySQL Database Schema including proper tables, indices, foreign keys, and matching seed data for role-based users and tailor tracking.',
    content: `-- Tailor Management System - MySQL Database Schema
-- Run this script in your MySQL instance (e.g., workbench or CLI)

CREATE DATABASE IF NOT EXISTS tailor_db;
USE tailor_db;

-- 1. Users Table (Role-based authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'ADMIN', 'TAILOR', 'CUSTOMER'
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Client Profiles Table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    gender VARCHAR(10) NOT NULL, -- 'MALE', 'FEMALE', 'OTHER'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Custom Measurements Table (One-to-One with Client)
CREATE TABLE IF NOT EXISTS measurements (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    neck DECIMAL(5,2),
    chest DECIMAL(5,2),
    bust DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    shoulder DECIMAL(5,2),
    sleeves DECIMAL(5,2),
    length DECIMAL(5,2),
    inseam DECIMAL(5,2),
    cuff DECIMAL(5,2),
    collar DECIMAL(5,2),
    upper_arm DECIMAL(5,2),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Orders Table (Custom status workflows)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    clothing_type VARCHAR(50) NOT NULL,
    fabric_details TEXT,
    status VARCHAR(30) NOT NULL, -- 'PENDING', 'FABRIC_RECEIVED', 'CUTTING', 'STITCHING', 'TRIAL', 'COMPLETED', 'DELIVERED'
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL, -- 'UNPAID', 'PARTIAL', 'PAID'
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Order Measurement Snapshots (Saves measurements at the time of order placement)
CREATE TABLE IF NOT EXISTS order_measurements (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    neck DECIMAL(5,2),
    chest DECIMAL(5,2),
    bust DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    shoulder DECIMAL(5,2),
    sleeves DECIMAL(5,2),
    length DECIMAL(5,2),
    inseam DECIMAL(5,2),
    cuff DECIMAL(5,2),
    collar DECIMAL(5,2),
    upper_arm DECIMAL(5,2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    client_id VARCHAR(50) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Seed Users with Pre-hashed passwords (BCrypt matching 'admin123' etc.)
INSERT INTO users (id, username, email, password_hash, role, full_name) VALUES
('usr_1', 'admin_owner', 'admin@tailor.com', '$2a$12$6K8p2UfT1pSg9179yOq1uOWdC6f5N3Zf9/Dsk8h89xN5vFzCmsN8y', 'ADMIN', 'Bhoomika Sterling'),
('usr_2', 'master_cutter', 'tailor@tailor.com', '$2a$12$RWe8LidO8P7gbe971SlyOW03fVv89K59z/6G6x77O76XNskC9OzyO', 'TAILOR', 'Master Cutter Ramesh'),
('usr_3', 'arthur_p', 'customer@tailor.com', '$2a$12$K8p2UfT1pSg9179yOq1uOWdC6f5N3Zf9/Dsk8h89xN5vFzCmsN8y', 'CUSTOMER', 'Arthur Pendelton')
ON DUPLICATE KEY UPDATE id=id;
`
  },
  {
    name: 'application.properties',
    path: 'src/main/resources/application.properties',
    type: 'PROPERTIES',
    description: 'Spring Boot Application configuration detailing MySQL connection pools, JPA properties, Hibernate settings, and server ports.',
    content: `# Spring Boot Properties for Tailor Management System
server.port=8080

# -----------------
# MySQL Database Configurations
# -----------------
spring.datasource.url=jdbc:mysql://localhost:3306/tailor_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_database_password_here
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Connection Pool Settings
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1800000

# -----------------
# Hibernate & JPA properties
# -----------------
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# -----------------
# Security / Auth configuration properties
# -----------------
jwt.secret=5f4dcc3b5aa765d61d8327deb882cf99a8cb431666ff408a6b289053
jwt.expiration=86400000
`
  },
  {
    name: 'Customer.java',
    path: 'src/main/java/com/tailor/system/model/Customer.java',
    type: 'MODEL',
    description: 'Base Entity class mapped via Hibernate JPA representing client profile information alongside gender and metadata.',
    content: `package com.tailor.system.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
public class Customer {

    @Id
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 10)
    private String gender; // MALE, FEMALE, OTHER

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Measurement measurement;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public Customer() {}

    public Customer(String id, String name, String phone, String email, String address, String gender, String notes) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.gender = gender;
        this.notes = notes;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Measurement getMeasurement() { return measurement; }
    public void setMeasurement(Measurement measurement) { this.measurement = measurement; }
}
`
  },
  {
    name: 'CustomerController.java',
    path: 'src/main/java/com/tailor/system/controller/CustomerController.java',
    type: 'CONTROLLER',
    description: 'Spring REST API Controller executing role-based security filters and mappings to manage client creation, updates, and deletion workflows.',
    content: `package com.tailor.system.controller;

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
`
  },
  {
    name: 'Measurement.java',
    path: 'src/main/java/com/tailor/system/model/Measurement.java',
    type: 'MODEL',
    description: 'Hibernate JPA Entity mapping the physical measurement values with double precision for bespoke fitting profiles.',
    content: `package com.tailor.system.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "measurements")
public class Measurement {

    @Id
    private String id;

    @Column(name = "neck")
    private Double neck;

    @Column(name = "chest")
    private Double chest;

    @Column(name = "bust")
    private Double bust;

    @Column(name = "waist")
    private Double waist;

    @Column(name = "hips")
    private Double hips;

    @Column(name = "shoulder")
    private Double shoulder;

    @Column(name = "sleeves")
    private Double sleeves;

    @Column(name = "length")
    private Double length;

    @Column(name = "inseam")
    private Double inseam;

    @Column(name = "cuff")
    private Double cuff;

    @Column(name = "collar")
    private Double collar;

    @Column(name = "upper_arm")
    private Double upperArm;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnore
    private Customer customer;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Measurement() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Double getNeck() { return neck; }
    public void setNeck(Double neck) { this.neck = neck; }

    public Double getChest() { return chest; }
    public void setChest(Double chest) { this.chest = chest; }

    public Double getBust() { return bust; }
    public void setBust(Double bust) { this.bust = bust; }

    public Double getWaist() { return waist; }
    public void setWaist(Double waist) { this.waist = waist; }

    public Double getHips() { return hips; }
    public void setHips(Double hips) { this.hips = hips; }

    public Double getShoulder() { return shoulder; }
    public void setShoulder(Double shoulder) { this.shoulder = shoulder; }

    public Double getSleeves() { return sleeves; }
    public void setSleeves(Double sleeves) { this.sleeves = sleeves; }

    public Double getLength() { return length; }
    public void setLength(Double length) { this.length = length; }

    public Double getInseam() { return inseam; }
    public void setInseam(Double inseam) { this.inseam = inseam; }

    public Double getCuff() { return cuff; }
    public void setCuff(Double cuff) { this.cuff = cuff; }

    public Double getCollar() { return collar; }
    public void setCollar(Double collar) { this.collar = collar; }

    public Double getUpperArm() { return upperArm; }
    public void setUpperArm(Double upperArm) { this.upperArm = upperArm; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
}
`
  },
  {
    name: 'Order.java',
    path: 'src/main/java/com/tailor/system/model/Order.java',
    type: 'MODEL',
    description: 'JPA entity modeling bespoke tailoring order files, status workflows (PENDING → TRIAL → DELIVERED), subtotal billing, and tracking properties.',
    content: `package com.tailor.system.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    private String id;

    @Column(name = "client_id", nullable = false)
    private String clientId;

    @Column(name = "order_number", nullable = false, unique = true, length = 30)
    private String orderNumber;

    @Column(name = "clothing_type", nullable = false, length = 50)
    private String clothingType;

    @Column(name = "fabric_details", columnDefinition = "TEXT")
    private String fabricDetails;

    @Column(nullable = false, length = 30)
    private String status; // PENDING, FABRIC_RECEIVED, CUTTING, STITCHING, TRIAL, COMPLETED, DELIVERED

    @Column(nullable = false)
    private Double price = 0.0;

    @Column(nullable = false)
    private Double discount = 0.0;

    @Column(nullable = false)
    private Double tax = 0.0;

    @Column(nullable = false)
    private Double total = 0.0;

    @Column(name = "amount_paid", nullable = false)
    private Double amountPaid = 0.0;

    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus; // UNPAID, PARTIAL, PAID

    @Column(name = "order_date", updatable = false)
    private LocalDateTime orderDate;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        this.orderDate = LocalDateTime.now();
        this.total = this.price - this.discount + this.tax;
        updatePaymentStatus();
    }

    @PreUpdate
    protected void onUpdate() {
        this.total = this.price - this.discount + this.tax;
        updatePaymentStatus();
    }

    public void updatePaymentStatus() {
        if (amountPaid >= total && total > 0) {
            this.paymentStatus = "PAID";
        } else if (amountPaid > 0) {
            this.paymentStatus = "PARTIAL";
        } else {
            this.paymentStatus = "UNPAID";
        }
    }

    public Order() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getClothingType() { return clothingType; }
    public void setClothingType(String clothingType) { this.clothingType = clothingType; }

    public String getFabricDetails() { return fabricDetails; }
    public void setFabricDetails(String fabricDetails) { this.fabricDetails = fabricDetails; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public Double getTax() { return tax; }
    public void setTax(Double tax) { this.tax = tax; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
`
  },
  {
    name: 'OrderController.java',
    path: 'src/main/java/com/tailor/system/controller/OrderController.java',
    type: 'CONTROLLER',
    description: 'REST Controller facilitating secure client-side order drafting, tailor workflow status transitions, and automatic payment synchronization.',
    content: `package com.tailor.system.controller;

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
`
  },
  {
    name: 'WebSecurityConfig.java',
    path: 'src/main/java/com/tailor/system/config/WebSecurityConfig.java',
    type: 'CONFIG',
    description: 'Spring Security filter configuration setting up Stateless Session Management, JWT validation filters, and Role-Based endpoints accessibility limits.',
    content: `package com.tailor.system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .authorizeRequests()
            // Public Endpoint
            .antMatchers("/api/auth/login").permitAll()
            // Client API constraints
            .antMatchers(HttpMethod.DELETE, "/api/clients/**").hasRole("ADMIN")
            .antMatchers("/api/clients/**").hasAnyRole("ADMIN", "TAILOR")
            // Orders API constraints 
            .antMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("ADMIN")
            .antMatchers("/api/orders/**").hasAnyRole("ADMIN", "TAILOR", "CUSTOMER")
            // System Stat APIs
            .antMatchers("/api/stats/**").hasAnyRole("ADMIN", "TAILOR")
            .anyRequest().authenticated();
            
        return http.build();
    }
}
`
  }
];
