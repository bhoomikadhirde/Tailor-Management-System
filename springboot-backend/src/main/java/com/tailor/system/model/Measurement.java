package com.tailor.system.model;

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
