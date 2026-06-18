package com.tailor.system.model;

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
