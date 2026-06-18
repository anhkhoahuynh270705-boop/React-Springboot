package com.example.demo.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.example.demo.dto.SeatLayoutItem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Document(collection = "seat_layouts")
@AllArgsConstructor
@NoArgsConstructor
public class SeatLayout {
    @Id
    private String id;
    private String name;
    private String totalRows;
    private String totalCols;
    private String aisleType;
    private List<SeatLayoutItem> seats;
}
