package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cinemas")
public class Cinema {
    @Id
    private String id;
    private String name;
    private String address;
    private String city;
    private String status;
    private String phone;
    private String email;
    private String website;
    private String description;
    private String imageUrl;
    private String openingHours;
    private String facilities; 
    private Double latitude;
    private Double longitude;
    private Boolean isActive;
}
